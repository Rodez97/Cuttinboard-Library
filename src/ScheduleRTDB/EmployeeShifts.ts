import { Timestamp } from "firebase/firestore";
import { isEmpty, merge, set, unset } from "lodash";
import { DATABASE } from "../utils/firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import {
  EmployeeShiftsItem,
  ILocation,
  IPrimaryShiftData,
  IShift,
  WeekSchedule,
} from "@cuttinboard-solutions/types-helpers";
import { ref } from "firebase/database";
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);

export function batchPublish(
  employeeShifts: WeekSchedule["shifts"],
  location: ILocation,
  weekId: string
) {
  const shiftsArray = employeeShifts ? Object.entries(employeeShifts) : [];
  // If there are no shifts, return
  if (shiftsArray.length === 0) {
    return;
  }

  const flatShiftsArray: EmployeeShiftsItem[] = shiftsArray.map(
    ([employeeId, shifts]) => [employeeId, Object.entries(shifts)]
  );

  // Create a record of shifts to update
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  const localUpdates: WeekSchedule["shifts"] = employeeShifts;

  const updatedAt = Timestamp.now().toMillis();

  // Loop through each shift
  flatShiftsArray.forEach(([employeeId, shifts]) => {
    const employeeShiftsRefPath = getEmployeeShiftsRefPath(
      location,
      weekId,
      employeeId
    );

    shifts.forEach(([shiftId, shift]) => {
      if (shift.deleting) {
        // If the shift is marked for deletion, delete it
        serverUpdates[`${employeeShiftsRefPath}/${shiftId}`] = null;
        unset(localUpdates, `${employeeId}.${shift.id}`);
      } else if (
        shift.status !== "published" ||
        (shift.pendingUpdate && Object.keys(shift.pendingUpdate).length > 0)
      ) {
        const baseUpdateObject: {
          [key: string]: object | number | string | boolean | null;
        } = {
          updatedAt,
          status: "published",
          ...shift.pendingUpdate,
          pendingUpdate: null,
        };

        // If the shift is not published, or has pending updates, publish it
        for (const key in baseUpdateObject) {
          const value = baseUpdateObject[key];
          serverUpdates[`${employeeShiftsRefPath}/${shiftId}/${key}`] = value;
        }

        set(localUpdates, `${employeeId}.${shift.id}`, {
          updatedAt,
          status: "published",
          ...shift.pendingUpdate,
        });

        unset(localUpdates, `${employeeId}.${shift.id}.pendingUpdate`);
      }
    });
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
  employeeShifts: WeekSchedule["shifts"][string],
  location: ILocation,
  weekId: string,
  employeeId: string,
  shiftId: string,
  pendingUpdate: Partial<IPrimaryShiftData>
): EmployeeShiftsDocumentUpdates | null {
  const shift = employeeShifts[shiftId];
  if (!shift) {
    return null;
  }
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(
    location,
    weekId,
    employeeId
  );
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/${shiftId}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/${shiftId}/pendingUpdate`] =
    pendingUpdate;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
    pendingUpdate,
  };
  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] = {
    ...employeeShifts,
    [shiftId]: updatedLocalShift,
  };

  return { serverUpdates, localUpdates };
}

export function getCancelShiftUpdateData(
  employeeShifts: WeekSchedule["shifts"][string],
  location: ILocation,
  weekId: string,
  employeeId: string,
  shiftId: string
): EmployeeShiftsDocumentUpdates | null {
  const shift = employeeShifts[shiftId];
  if (!shift) {
    return null;
  }
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(
    location,
    weekId,
    employeeId
  );
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/${shiftId}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/${shiftId}/pendingUpdate`] = null;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
  };
  delete updatedLocalShift.pendingUpdate;
  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] = {
    ...employeeShifts,
    [shiftId]: updatedLocalShift,
  };

  return { serverUpdates, localUpdates };
}

export function getDeleteShiftData(
  employeeShifts: WeekSchedule["shifts"][string],
  location: ILocation,
  weekId: string,
  employeeId: string,
  shift: IShift
): EmployeeShiftsDocumentUpdates {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(
    location,
    weekId,
    employeeId
  );
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/${shift.id}/updatedAt`] = updatedAt;

  const localUpdates = { ...employeeShifts };

  if (shift.status === "draft") {
    delete localUpdates[shift.id];
    serverUpdates[`${employeeShiftsRefPath}/${shift.id}`] = null;
  } else {
    set(localUpdates, `${shift.id}.deleting`, true);
    serverUpdates[`${employeeShiftsRefPath}/${shift.id}/deleting`] = true;
  }

  return { serverUpdates, localUpdates };
}

export function getRestoreShiftData(
  employeeShifts: WeekSchedule["shifts"][string],
  location: ILocation,
  weekId: string,
  employeeId: string,
  shift: IShift
): EmployeeShiftsDocumentUpdates {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(
    location,
    weekId,
    employeeId
  );
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/${shift.id}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/${shift.id}/deleting`] = false;

  const updatedLocalShift: IShift = {
    ...shift,
    updatedAt,
    deleting: false,
  };
  const localUpdates: EmployeeShiftsDocumentUpdates["localUpdates"] = {
    ...employeeShifts,
    [shift.id]: updatedLocalShift,
  };

  return { serverUpdates, localUpdates };
}

export function getNewShiftsData(
  employeeWeekSchedule: WeekSchedule["shifts"][string],
  location: ILocation,
  weekId: string,
  employeeId: string,
  shifts: Record<string, IShift>
): EmployeeShiftsDocumentUpdates {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(
    location,
    weekId,
    employeeId
  );
  const serverUpdates: {
    [key: string]: IShift;
  } = {};

  for (const shiftId in shifts) {
    const shift = shifts[shiftId];
    serverUpdates[`${employeeShiftsRefPath}/${shiftId}`] = shift;
  }

  const localUpdates = employeeWeekSchedule;
  merge(localUpdates, shifts);

  return { serverUpdates, localUpdates };
}

export type EmployeeShiftsDocumentUpdates = {
  serverUpdates: {
    [key: string]: object | number | string | boolean | null;
  };
  localUpdates: WeekSchedule["shifts"][string];
};

export function getEmployeeShiftsRefPath(
  location: ILocation,
  weekId: string,
  employeeId: string
) {
  return `scheduleData/${location.organizationId}/${location.id}/${weekId}/shifts/${employeeId}`;
}

export function getEmployeeShiftsRef(
  location: ILocation,
  weekId: string,
  employeeId: string
) {
  return ref(DATABASE, getEmployeeShiftsRefPath(location, weekId, employeeId));
}
