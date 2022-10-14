import { PrimaryFirestore } from "../PrimaryFirestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { IShift, Shift } from "./Shift";
import {
  DocumentReference,
  DocumentData,
  WriteBatch,
  deleteField,
  FieldValue,
  serverTimestamp,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  setDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { isEmpty } from "lodash";
import { getShiftDate, getShiftString } from "../../services";
import { Auth } from "../../firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import { Schedule_DayStats } from "./Schedule_DayStats";
dayjs.extend(isoWeek);
dayjs.extend(duration);

export interface IEmployeeShifts {
  shifts?: Record<string, Shift>;
  employeeId: string;
  weekId: string;
  updatedAt: Timestamp;
}

export class EmployeeShifts
  implements IEmployeeShifts, PrimaryFirestore, FirebaseSignature
{
  public readonly shifts?: Record<string, Shift>;
  public readonly employeeId: string;
  public readonly weekId: string;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly updatedAt: Timestamp;

  public static Converter = {
    toFirestore(object: EmployeeShifts): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IEmployeeShifts & FirebaseSignature>,
      options: SnapshotOptions
    ): EmployeeShifts {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new EmployeeShifts(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      shifts,
      employeeId,
      weekId,
      createdAt,
      createdBy,
      updatedAt,
    }: IEmployeeShifts & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.employeeId = employeeId;
    this.weekId = weekId;
    let constructShifts: Record<string, Shift> = {};
    Object.entries(shifts ?? {}).forEach(([shiftId, shift]) => {
      constructShifts = {
        ...constructShifts,
        [shiftId]: new Shift(shift, { id: shiftId, docRef }),
      };
    });
    this.shifts = constructShifts;
  }

  public get shiftsArray() {
    return Object.values(this.shifts ?? {});
  }

  public get userSummary() {
    if (!Boolean(this.shiftsArray.length)) {
      return { totalHours: 0, totalShifts: 0, totalWage: 0 };
    }
    const { time, wage } = this.shiftsArray.reduce<{
      time: duration.Duration;
      wage: number;
    }>(
      (acc, shift) => {
        const { time, wage } = acc;
        return {
          time: time.add(shift.shiftDuration.totalMinutes, "minutes"),
          wage: wage + shift.getWage,
        };
      },
      { time: dayjs.duration(0), wage: 0 }
    );
    const totalHours = time.asHours();
    const totalShifts = this.shiftsArray.length;
    return { totalHours, totalShifts, totalWage: wage };
  }

  public get summaryByDay() {
    if (!Boolean(this.shiftsArray.length)) {
      return {};
    }
    const summ = this.shiftsArray.reduce<Record<number, Schedule_DayStats>>(
      (acc, shift) => {
        const shiftIsoWeekday = shift.shiftIsoWeekday;
        const prevShiftData = acc[shiftIsoWeekday];
        return {
          ...acc,
          [shiftIsoWeekday]: {
            hours: (prevShiftData?.hours ?? 0) + shift.shiftDuration.totalHours,
            shifts: (prevShiftData?.shifts ?? 0) + 1,
            people: 1,
            wages: (prevShiftData?.wages ?? 0) + shift.getWage,
          },
        };
      },
      {}
    );
    return summ;
  }

  public get haveChanges() {
    return this.shiftsArray.some((shift) =>
      Boolean(
        shift.hasPendingUpdates || shift.deleting || shift.status === "draft"
      )
    );
  }

  public async createShift(
    shift: IShift,
    dates: Date[],
    applyToWeekDays: number[],
    id: string
  ) {
    let newShifts: Record<
      string,
      WithFieldValue<IShift & FirebaseSignature>
    > = {};
    try {
      const { start, end, ...rest } = shift;
      const baseStart = getShiftDate(start);
      const baseEnd = getShiftDate(end);
      for (const isoWeekDay of applyToWeekDays) {
        const shiftId = `${isoWeekDay}-${id}`;
        const column = dates.find((c) => dayjs(c).isoWeekday() === isoWeekDay);
        const newStart = dayjs(column)
          .hour(baseStart.hour())
          .minute(baseStart.minute())
          .toDate();
        const newEnd = dayjs(column)
          .hour(baseEnd.hour())
          .minute(baseEnd.minute())
          .toDate();
        newShifts = {
          ...newShifts,
          [shiftId]: {
            ...rest,
            start: getShiftString(newStart),
            end: getShiftString(newEnd),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: Auth.currentUser.uid,
            status: "draft",
          },
        };
      }
      await setDoc(this.docRef, { shifts: newShifts }, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Publish
   */
  public batchPublish(batch: WriteBatch) {
    if (isEmpty(this.shifts)) {
      return;
    }

    const shiftsUpdates: Record<
      string,
      PartialWithFieldValue<Shift> | FieldValue
    > = {};

    Object.entries(this.shifts).forEach(([id, shift]) => {
      if (shift.deleting) {
        shiftsUpdates[id] = deleteField();
      } else if (
        shift.status !== "published" ||
        !isEmpty(shift.pendingUpdate)
      ) {
        shiftsUpdates[id] = {
          updatedAt: serverTimestamp(),
          status: "published",
          ...shift.pendingUpdate,
          pendingUpdate: deleteField(),
        };
      }
    });

    if (isEmpty(shiftsUpdates)) {
      return;
    }

    batch.set(
      this.docRef,
      {
        updatedAt: serverTimestamp(),
        shifts: shiftsUpdates,
      },
      { merge: true }
    );
  }

  public batchUnpublish(batch: WriteBatch) {
    if (isEmpty(this.shifts)) {
      return;
    }

    let shiftsUpdates: Record<string, { status: "draft" }> = {};

    Object.keys(this.shifts).forEach((id) => {
      shiftsUpdates = { ...shiftsUpdates, [id]: { status: "draft" } };
    });

    batch.set(
      this.docRef,
      {
        updatedAt: serverTimestamp(),
        shifts: shiftsUpdates,
      },
      { merge: true }
    );
  }
}
