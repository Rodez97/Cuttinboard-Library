import { Timestamp } from "firebase/firestore";
import { isEmpty, merge, set } from "lodash";
import { DATABASE } from "../utils/firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import {
  IPrimaryShiftData,
  IShift,
  RealtimeDatabaseData,
} from "@cuttinboard-solutions/types-helpers";
import { ref } from "firebase/database";
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);

export function batchPublish(
  employeeShifts: IShift[] | undefined,
  weekId: string
) {
  if (!employeeShifts || !employeeShifts.length) {
    return;
  }

  // Create a record of shifts to update
  const serverUpdates: {
    [key: string]: RealtimeDatabaseData<IShift> | null;
  } = {};
  let localUpdates: IShift[] = employeeShifts;

  const updatedAt = Timestamp.now().toMillis();

  // Loop through each shift
  employeeShifts.forEach((shift) => {
    const { id: shiftId } = shift;
    const employeeShiftsRefPath = getEmployeeShiftsRefPath(shiftId, weekId);

    if (shift.deleting) {
      // If the shift is marked for deletion, delete it
      serverUpdates[employeeShiftsRefPath] = null;
      localUpdates.filter((shift) => shift.id !== shiftId);
    } else if (
      shift.status !== "published" ||
      (shift.pendingUpdate && Object.keys(shift.pendingUpdate).length > 0)
    ) {
      serverUpdates[employeeShiftsRefPath] = {
        ...shift,
        updatedAt,
        status: "published",
        ...shift.pendingUpdate,
        pendingUpdate: null,
      };

      localUpdates = localUpdates.map(({ pendingUpdate, ...shift }) => {
        if (shift.id === shiftId) {
          return {
            ...shift,
            updatedAt,
            status: "published",
            ...pendingUpdate,
          };
        }
        return shift;
      });
    }
  });

  // If there are no shifts to update, return
  if (isEmpty(serverUpdates)) {
    return;
  }

  return {
    serverUpdates,
    localUpdates,
  };
}

export function getUpdateShiftData(
  employeeShifts: IShift[],
  weekId: string,
  shiftId: string,
  pendingUpdate: Partial<IPrimaryShiftData>
): EmployeeShiftsDocumentUpdates | null {
  const shift = employeeShifts.find((shift) => shift.id === shiftId);
  if (!shift) {
    return null;
  }
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shiftId, weekId);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/pendingUpdate`] = pendingUpdate;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
    pendingUpdate,
  };

  const indexOfShift = employeeShifts.findIndex(
    (shift) => shift.id === shiftId
  );

  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] =
    employeeShifts;
  set(localUpdates, indexOfShift, updatedLocalShift);

  return { serverUpdates, localUpdates };
}

export function getCancelShiftUpdateData(
  employeeShifts: IShift[],
  weekId: string,
  shiftId: string
): EmployeeShiftsDocumentUpdates | null {
  const shift = employeeShifts.find((shift) => shift.id === shiftId);
  if (!shift) {
    return null;
  }
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shiftId, weekId);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/pendingUpdate`] = null;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
  };
  delete updatedLocalShift.pendingUpdate;

  const indexOfShift = employeeShifts.findIndex(
    (shift) => shift.id === shiftId
  );

  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] =
    employeeShifts;
  set(localUpdates, indexOfShift, updatedLocalShift);

  return { serverUpdates, localUpdates };
}

export function getDeleteShiftData(
  employeeShifts: IShift[],
  weekId: string,
  shift: IShift
): EmployeeShiftsDocumentUpdates {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id, weekId);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};

  let localUpdates = employeeShifts;

  if (shift.status === "draft") {
    localUpdates = localUpdates.filter((shift) => shift.id !== shift.id);
    serverUpdates[employeeShiftsRefPath] = null;
  } else {
    localUpdates = localUpdates.map((shift) => {
      if (shift.id === shift.id) {
        return {
          ...shift,
          updatedAt,
          deleting: true,
        };
      }
      return shift;
    });
    serverUpdates[`${employeeShiftsRefPath}/deleting`] = true;
    serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  }

  return { serverUpdates, localUpdates };
}

export function getRestoreShiftData(
  employeeShifts: IShift[],
  weekId: string,
  shift: IShift
): EmployeeShiftsDocumentUpdates {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id, weekId);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/deleting`] = false;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
    deleting: false,
  };

  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] =
    employeeShifts.map((shift) => {
      if (shift.id === updatedLocalShift.id) {
        return updatedLocalShift;
      }
      return shift;
    });

  return { serverUpdates, localUpdates };
}

export function getNewShiftsData(
  employeeWeekSchedule: IShift[],
  weekId: string,
  newShifts: IShift[]
): EmployeeShiftsDocumentUpdates {
  const serverUpdates: {
    [key: string]: IShift;
  } = {};

  for (const shift of newShifts) {
    const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id, weekId);
    serverUpdates[`${employeeShiftsRefPath}`] = shift;
  }

  const localUpdates = employeeWeekSchedule;
  merge(localUpdates, newShifts);

  return { serverUpdates, localUpdates };
}

export type EmployeeShiftsDocumentUpdates = {
  serverUpdates: {
    [key: string]: object | number | string | boolean | null;
  };
  localUpdates: IShift[];
};

export function getEmployeeShiftsRefPath(shiftId: string, weekId: string) {
  return `shifts/${weekId}/${shiftId}`;
}

export function getEmployeeShiftsRef(weekId: string, shiftId: string) {
  return ref(DATABASE, getEmployeeShiftsRefPath(shiftId, weekId));
}
