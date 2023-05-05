import { Timestamp } from "firebase/firestore";
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import duration from "dayjs/plugin/duration.js";
import {
  IPrimaryShiftData,
  IShift,
  RealtimeDatabaseData,
} from "@cuttinboard-solutions/types-helpers";
import { ref } from "firebase/database";
import { DATABASE } from "../utils/firebase";
dayjs.extend(isoWeek);
dayjs.extend(duration);

/**
 * This function batch publishes employee shifts to the server and updates the local shifts
 * accordingly.
 * @param {IShift[] | undefined} employeeShifts - An array of objects representing employee shifts.
 * Each object should have an "id" property and may have other properties such as "startTime",
 * "endTime", "status", etc.
 * @param {string} weekId - The weekId parameter is a string that represents the ID of the week for
 * which the employee shifts are being published.
 * @returns an object with two properties: "serverUpdates" and "localUpdates". If there are no
 * employeeShifts or if all employeeShifts have a "deleting" property set to true, the function returns
 * undefined.
 */
export function batchPublish(employeeShifts: IShift[] | undefined) {
  if (!employeeShifts || !employeeShifts.length) {
    return;
  }

  const serverUpdates: {
    [key: string]: RealtimeDatabaseData<IShift> | null;
  } = {};

  const updatedAt = Timestamp.now().toMillis();

  employeeShifts.forEach((shift) => {
    const { id: shiftId } = shift;
    const employeeShiftsRefPath = getEmployeeShiftsRefPath(shiftId);

    if (shift.deleting) {
      serverUpdates[employeeShiftsRefPath] = null;
    } else if (
      shift.status !== "published" ||
      (shift.pendingUpdate && Object.keys(shift.pendingUpdate).length > 0)
    ) {
      const { pendingUpdate, ...restShift } = shift;

      serverUpdates[employeeShiftsRefPath] = {
        ...restShift,
        updatedAt,
        status: "published",
        ...pendingUpdate,
        pendingUpdate: null,
      };
    }
  });

  if (isEmpty(serverUpdates)) {
    return;
  }

  return serverUpdates;
}

/**
 * This function updates the shift data for an employee and returns the updated data.
 * @param {string} weekId - A string representing the ID of the week for which the shift data is being
 * updated.
 * @param {IShift} shift - IShift object representing an employee's shift for a specific day
 * @param pendingUpdate - A partial object of type IPrimaryShiftData, which contains the updated data
 * for the shift that is pending to be updated.
 * @returns an object of type `EmployeeSingleShiftUpdate` or `null`. The object contains two
 * properties: `serverUpdates` which is an object containing updates to be made to the employee shifts
 * document on the server, and `localUpdate` which is an updated version of the `shift` object with the
 * `pendingUpdate` property merged in and the `updatedAt` property set to the
 */
export function getUpdateShiftData(
  shift: IShift,
  pendingUpdate: Partial<IPrimaryShiftData>
) {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/pendingUpdate`] = pendingUpdate;

  return serverUpdates;
}

/**
 * This function returns an object containing server and local updates for an employee's single shift
 * cancellation.
 * @param {string} weekId - A string representing the ID of the week for which the shift update is
 * being cancelled.
 * @param {IShift} shift - IShift object representing a shift that needs to be updated or cancelled.
 * @returns an object of type `EmployeeSingleShiftUpdate` or `null`. The object contains two
 * properties: `serverUpdates` and `localUpdate`. `serverUpdates` is an object that contains updates to
 * be made to the employee shifts document on the server. `localUpdate` is an updated version of the
 * `shift` object with the `updatedAt` property set to the current time
 */
export function getCancelShiftUpdateData(shift: IShift) {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/pendingUpdate`] = null;

  return serverUpdates;
}

/**
 * This function returns an object containing server and local updates for deleting a shift from an
 * employee's schedule.
 * @param {string} weekId - A string representing the ID of the week for which the shift is being
 * deleted.
 * @param {IShift} shift - The shift object that needs to be deleted from the employee's schedule.
 * @returns an object of type EmployeeSingleShiftUpdate, which contains two properties: serverUpdates
 * and localUpdate.
 */
export function getDeleteShiftData(shift: IShift) {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};

  if (shift.status === "draft") {
    serverUpdates[employeeShiftsRefPath] = null;
  } else {
    serverUpdates[`${employeeShiftsRefPath}/deleting`] = true;
    serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  }

  return serverUpdates;
}

/**
 * This function returns an object containing server and local updates for restoring a deleted shift.
 * @param {string} weekId - A string representing the ID of the week for which the shift data is being
 * restored.
 * @param {IShift} shift - IShift - an interface representing a shift object
 * @returns an object of type EmployeeSingleShiftUpdate, which contains two properties: serverUpdates
 * and localUpdate. The serverUpdates property is an object containing updates to be made to the
 * employee shifts document in the server, while the localUpdate property is an updated version of the
 * shift object with the deleting and updatedAt properties set to false and the current timestamp,
 * respectively.
 */
export function getRestoreShiftData(shift: IShift) {
  const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);
  const updatedAt = Timestamp.now().toMillis();
  const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
  serverUpdates[`${employeeShiftsRefPath}/updatedAt`] = updatedAt;
  serverUpdates[`${employeeShiftsRefPath}/deleting`] = false;

  return serverUpdates;
}

/**
 * This function takes in a week ID and an array of new shifts, and returns an object with server
 * updates and local updates.
 * @param {string} weekId - a string representing the ID of the week for which new shifts are being
 * added.
 * @param {IShift[]} newShifts - An array of IShift objects representing the new shifts to be added to
 * the employee's schedule.
 * @returns an object of type `EmployeeShiftsDocumentUpdates`, which contains two properties:
 * - `serverUpdates`: an object with keys representing the paths to employee shifts documents in the
 * database, and values representing the new shift data to be updated in those documents.
 * - `localUpdates`: an array of `IShift` objects representing the new shift data to be updated locally
 * in the application.
 */
export function getNewShiftsData(newShifts: IShift[]) {
  const serverUpdates: {
    [key: string]: IShift;
  } = {};

  for (const shift of newShifts) {
    const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);
    serverUpdates[`${employeeShiftsRefPath}`] = shift;
  }

  return serverUpdates;
}

/**
 * The type EmployeeShiftsDocumentUpdates represents updates to a document containing server and local
 * updates for employee shifts.
 * @property serverUpdates - This property is an object that contains updates to be made to a document
 * on the server. The keys of the object represent the fields to be updated, and the values can be of
 * type object, number, string, boolean, or null.
 * @property {IShift[]} localUpdates - localUpdates is an array of objects that represent updates to
 * employee shifts made locally on the client side. Each object in the array represents a single shift
 * update and contains information such as the shift start and end times, the employee assigned to the
 * shift, and any notes or comments related to the shift.
 */
export type EmployeeShiftsDocumentUpdates = {
  serverUpdates: {
    [key: string]: object | number | string | boolean | null;
  };
  localUpdates: IShift[];
};

/**
 * The EmployeeSingleShiftUpdate type defines an object with server updates and a local update for a
 * shift.
 * @property serverUpdates - The serverUpdates property is an object that contains key-value pairs
 * where the keys are strings and the values can be objects, numbers, strings, booleans, or null. This
 * property is likely used to update the server-side data for an employee's single shift.
 * @property {IShift} localUpdate - IShift is likely an interface or type that defines the structure of
 * an object representing a shift for an employee. It could include properties such as the start and
 * end times of the shift, the employee assigned to the shift, and any notes or comments about the
 * shift. The `localUpdate` property in
 */
export type EmployeeSingleShiftUpdate = {
  serverUpdates: {
    [key: string]: object | number | string | boolean | null;
  };
  localUpdate: IShift;
};

/**
 * The function returns a reference path for a specific employee shift based on the shift ID and week
 * ID.
 * @param {string} shiftId - The shiftId parameter is a string that represents the unique identifier of
 * a specific shift.
 * @returns a string that represents the path to a specific employee shift in a Firebase Realtime
 * Database. The path is constructed using the provided `shiftId` and `weekId` parameters, and follows
 * the format `shifts//`.
 */
export function getEmployeeShiftsRefPath(shiftId: string) {
  return `shifts/${shiftId}`;
}

/**
 * This function returns a reference to the employee shifts in a specific week and shift.
 * @param {string} shiftId - The shiftId parameter is a string that represents the unique identifier of
 * a shift. It is used to retrieve the reference to the specific shift in the database.
 * @returns a reference to the location in the database where the employee shifts for a specific week
 * and shift are stored. The reference is obtained using the `ref()` function from the Firebase
 * Realtime Database SDK, and the path to the location is constructed using the
 * `getEmployeeShiftsRefPath()` function.
 */
export function getEmployeeShiftsRef(shiftId: string) {
  return ref(DATABASE, getEmployeeShiftsRefPath(shiftId));
}
