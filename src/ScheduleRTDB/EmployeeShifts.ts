import {
  PartialWithFieldValue,
  Timestamp,
  deleteDoc,
  deleteField,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import duration from "dayjs/plugin/duration.js";
import { FIRESTORE } from "../utils/firebase";
import { shiftConverter } from "./Shift";
import {
  IPrimaryShiftData,
  IShift,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);
dayjs.extend(duration);

export function batchPublish(employeeShifts: IShift[] | undefined) {
  if (!employeeShifts || !employeeShifts.length) {
    return;
  }

  const batchUpdates = writeBatch(FIRESTORE);

  const updatedAt = Timestamp.now().toMillis();

  employeeShifts.forEach((shift) => {
    const { id: shiftId } = shift;
    const shiftRef = doc(FIRESTORE, "shifts", shiftId).withConverter(
      shiftConverter
    );

    if (shift.deleting) {
      batchUpdates.delete(shiftRef);
    } else if (
      shift.status !== "published" ||
      (shift.pendingUpdate && Object.keys(shift.pendingUpdate).length > 0)
    ) {
      const { pendingUpdate, ...restShift } = shift;

      batchUpdates.update(shiftRef, {
        ...restShift,
        updatedAt,
        status: "published",
        ...pendingUpdate,
        pendingUpdate: deleteField(),
      });
    }
  });

  return batchUpdates;
}

export function getUpdateShiftData(
  shift: IShift,
  pendingUpdate: Partial<IPrimaryShiftData>
) {
  const shiftRef = doc(FIRESTORE, "shifts", shift.id).withConverter(
    shiftConverter
  );
  const updatedAt = Timestamp.now().toMillis();
  const updates: PartialWithFieldValue<IShift> = {
    updatedAt,
    pendingUpdate,
  };

  return updateDoc(shiftRef, updates);
}

export function getCancelShiftUpdateData(shift: IShift) {
  const shiftRef = doc(FIRESTORE, "shifts", shift.id).withConverter(
    shiftConverter
  );
  const updatedAt = Timestamp.now().toMillis();
  const updates: PartialWithFieldValue<IShift> = {
    updatedAt,
    pendingUpdate: deleteField(),
  };

  return updateDoc(shiftRef, updates);
}

export function getDeleteShiftData(shift: IShift) {
  const shiftRef = doc(FIRESTORE, "shifts", shift.id).withConverter(
    shiftConverter
  );
  const updatedAt = Timestamp.now().toMillis();

  if (shift.status === "draft") {
    return deleteDoc(shiftRef);
  } else {
    return updateDoc(shiftRef, {
      updatedAt,
      deleting: true,
    });
  }
}

export function getRestoreShiftData(shift: IShift) {
  const shiftRef = doc(FIRESTORE, "shifts", shift.id).withConverter(
    shiftConverter
  );
  const updatedAt = Timestamp.now().toMillis();
  const updates: PartialWithFieldValue<IShift> = {
    updatedAt,
    deleting: false,
  };

  return updateDoc(shiftRef, updates);
}

export function getNewShiftsDataBatch(newShifts: IShift[]) {
  const batch = writeBatch(FIRESTORE);

  for (const shift of newShifts) {
    const shiftRef = doc(FIRESTORE, "shifts", shift.id).withConverter(
      shiftConverter
    );
    batch.set(shiftRef, shift);
  }

  return batch;
}
