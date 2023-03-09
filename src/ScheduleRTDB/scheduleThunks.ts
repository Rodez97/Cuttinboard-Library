import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { uniq } from "lodash";
import {
  getCancelShiftUpdateData,
  getDeleteShiftData,
  getRestoreShiftData,
  EmployeeShiftsDocumentUpdates,
  getNewShiftsData,
  getUpdateShiftData,
  createShiftElement,
  batchPublish,
  getEmployeeShiftsRefPath,
  copyPropertiesWithPrefix,
} from ".";
import { DATABASE } from "../utils";
import { AppThunk } from "../reduxStore/utils";
import { employeesSelectors } from "../employee";
import {
  scheduleSelectors,
  setScheduleDocument,
  shiftSelectors,
  upsertEmployeeShifts,
  upsertShifts,
} from "./schedule.slice";
import {
  checkIfShiftsHaveChanges,
  getShiftDayjsDate,
  ILocation,
  IPrimaryShiftData,
  IShift,
  parseWeekId,
  Shift,
  WeekSummary,
  IScheduleDoc,
} from "@cuttinboard-solutions/types-helpers";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  update,
} from "firebase/database";

function createShiftUpdateThunk<T = undefined>(
  updateFn: (args: {
    employeeWeekSchedule: IShift[];
    shift: IShift;
    extra?: T;
    location: ILocation;
    employeeId: string;
    weekId: string;
  }) => EmployeeShiftsDocumentUpdates | null
) {
  return ({
      weekId,
      shift,
      employeeId,
      extra,
    }: {
      weekId: string;
      shift: IShift;
      employeeId: string;
      extra?: T;
    }): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
      const state = getState();
      const location = state.cuttinboardLocation?.data;
      if (!location) {
        throw new Error("Location not found");
      }
      const scheduleEntry = scheduleSelectors.selectById(state, weekId);
      if (!scheduleEntry) {
        throw new Error("Schedule entry not found");
      }
      const empShiftsEntry = shiftSelectors
        .selectAll(scheduleEntry.shifts)
        .filter((s) => s.employeeId === employeeId);
      if (!empShiftsEntry || !empShiftsEntry.length) {
        throw new Error(
          "Employee shifts entry not found: " +
            JSON.stringify({ scheduleEntry })
        );
      }

      const updates = updateFn({
        employeeWeekSchedule: empShiftsEntry,
        shift,
        extra,
        location,
        employeeId,
        weekId,
      });

      if (!updates) {
        console.log("No updates to make");
        return;
      }

      const { serverUpdates, localUpdates } = updates;

      dispatch(
        upsertEmployeeShifts({
          weekId,
          employeeId,
          newEntry: localUpdates,
        })
      );
      try {
        await update(ref(DATABASE), serverUpdates);
      } catch (error) {
        dispatch(
          upsertEmployeeShifts({
            weekId,
            employeeId,
            newEntry: empShiftsEntry,
          })
        );
        throw error;
      }
    };
}

export const updateShiftThunk = createShiftUpdateThunk<
  Partial<IPrimaryShiftData>
>(({ employeeWeekSchedule, shift, extra: pendingUpdate, weekId }) => {
  if (!pendingUpdate) {
    throw new Error("No update data provided");
  }
  const updates = getUpdateShiftData(
    employeeWeekSchedule,
    weekId,
    shift.id,
    pendingUpdate
  );
  return updates;
});

export const cancelShiftUpdateThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, weekId }) => {
    const updates = getCancelShiftUpdateData(
      employeeWeekSchedule,
      weekId,
      shift.id
    );
    return updates;
  }
);

export const deleteShiftThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, weekId }) => {
    const updates = getDeleteShiftData(employeeWeekSchedule, weekId, shift);
    return updates;
  }
);

export const restoreShiftThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, weekId }) => {
    const updates = getRestoreShiftData(employeeWeekSchedule, weekId, shift);
    return updates;
  }
);

export const createShiftThunk =
  ({
    weekId,
    shift,
    employeeId,
    dates,
    applyToWeekDays,
  }: {
    weekId: string;
    shift: IShift;
    employeeId: string;
    dates: dayjs.Dayjs[];
    applyToWeekDays: number[];
  }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const newShifts: IShift[] = createShiftElement(
      shift,
      dates,
      applyToWeekDays
    );

    const state = getState();
    const location = state.cuttinboardLocation?.data;
    if (!location) {
      throw new Error("Location not found");
    }
    const scheduleEntry = scheduleSelectors.selectById(state, weekId);
    if (!scheduleEntry) {
      console.log("Schedule entry not found");
    }
    const empShiftsEntry = scheduleEntry
      ? shiftSelectors
          .selectAll(scheduleEntry.shifts)
          .filter((s) => s.employeeId === employeeId)
      : [];

    const { localUpdates, serverUpdates } = getNewShiftsData(
      empShiftsEntry,
      weekId,
      newShifts
    );

    dispatch(
      upsertEmployeeShifts({
        weekId,
        employeeId,
        newEntry: localUpdates,
      })
    );
    try {
      await update(ref(DATABASE), serverUpdates);
    } catch (error) {
      dispatch(
        upsertEmployeeShifts({
          weekId,
          employeeId,
          newEntry: empShiftsEntry,
        })
      );
      throw error;
    }
  };

export const batchPublishShiftsThunk =
  (
    weekId: string,
    notificationRecipients: "all" | "all_scheduled" | "changed" | "none",
    scheduleDocUpdates: {
      year: number;
      weekNumber: number;
      scheduleSummary: WeekSummary;
    }
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const location = state.cuttinboardLocation?.data;
    if (!location) {
      throw new Error("Location not found");
    }
    const scheduleEntry = scheduleSelectors.selectById(state, weekId);
    if (!scheduleEntry) {
      throw new Error("Schedule entry not found");
    }
    const empShiftsArray = shiftSelectors.selectAll(scheduleEntry.shifts);
    if (!empShiftsArray || !empShiftsArray.length) {
      console.info(
        "%c No new shifts available to publish ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }
    const employees = employeesSelectors.selectAll(state);

    let notiRecipients: string[] = [];
    switch (notificationRecipients) {
      case "all":
        // Get all employees
        notiRecipients = employees.map((e) => e.id);
        break;
      case "all_scheduled":
        // Get all employees that have shifts
        notiRecipients = empShiftsArray.map(({ employeeId }) => employeeId);
        break;
      case "changed":
        // Get all employees that have shifts and have changed shifts from the last published schedule
        notiRecipients = empShiftsArray
          .filter(checkIfShiftsHaveChanges)
          .map(({ employeeId }) => employeeId);
        break;
      default:
        break;
    }

    const updates = batchPublish(empShiftsArray, weekId);

    if (!updates) {
      console.info(
        "%c No new shifts available to publish ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }

    const { localUpdates, serverUpdates } = updates;

    dispatch(
      upsertShifts({
        weekId,
        shifts: localUpdates,
      })
    );
    try {
      const summaryObjectUpdate: Omit<IScheduleDoc, "createdAt"> = {
        updatedAt: Timestamp.now().toMillis(),
        ...scheduleDocUpdates,
        publishData: {
          publishedAt: Timestamp.now().toMillis(),
          notificationRecipients: uniq(notiRecipients),
        },
        locationId: location.id,
        weekId,
      };

      const batchUpdateObject: EmployeeShiftsDocumentUpdates["serverUpdates"] =
        {
          ...serverUpdates,
        };

      copyPropertiesWithPrefix(
        summaryObjectUpdate,
        batchUpdateObject,
        `schedule/${weekId}/${location.id}`
      );

      await update(ref(DATABASE), batchUpdateObject);
    } catch (error) {
      dispatch(
        upsertShifts({
          weekId,
          shifts: empShiftsArray,
        })
      );
      throw error;
    }
  };

export const cloneWeekShiftsThunk =
  ({
    weekId,
    targetWeekId,
    employees,
    weekDays,
  }: {
    weekId: string;
    targetWeekId: string;
    employees: string[];
    weekDays: dayjs.Dayjs[];
  }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (employees.length === 0) {
      console.info(
        "%c No employees selected ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }
    const state = getState();
    const location = state.cuttinboardLocation?.data;
    if (!location) {
      throw new Error("Location not found");
    }
    const scheduleEntry = scheduleSelectors.selectById(state, weekId);
    if (!scheduleEntry) {
      throw new Error("Schedule entry not found");
    }
    const empShiftsArray = shiftSelectors.selectAll(scheduleEntry.shifts) ?? [];
    if (empShiftsArray.length > 0) {
      throw new Error("Cannot clone shifts from a week with published shifts");
    }

    const { start } = parseWeekId(targetWeekId);

    // Calculate the number of weeks difference between the first day of the target week and the first day of the current week
    const weeksDiff = Math.abs(dayjs(start).diff(weekDays[0], "weeks"));

    // Get the shifts for the target week for the given employees
    const allQueries = query(
      ref(DATABASE, `shifts/${targetWeekId}`),
      orderByChild("locationId"),
      equalTo(location.id)
    );

    const exeQueries = await get(allQueries);

    if (!exeQueries.exists() || !exeQueries.size) {
      console.info(
        "%c No shifts available to clone ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }

    const shiftsArray: IShift[] = Object.values(exeQueries.val());

    // Create a record of shifts to update
    const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
    const localUpdates: IShift[] = [];

    const updatedAt = Timestamp.now().toMillis();

    // Loop through each shift
    shiftsArray
      .filter(
        (shift) =>
          shift.status === "published" && // Only clone published shifts
          !shift.deleting && // Only clone if the shift is not being deleted
          !checkIfShiftsHaveChanges(shift) // Only clone if the shift doesn't have pending updates
      )
      .forEach((shift) => {
        const employeeShiftsRefPath = getEmployeeShiftsRefPath(
          shift.id,
          weekId
        );

        // Adjust the shift to the current week
        const newStart = getShiftDayjsDate(shift, "start").add(
          weeksDiff,
          "weeks"
        );
        const newEnd = getShiftDayjsDate(shift, "end").add(weeksDiff, "weeks");
        const newShift: IShift = {
          ...shift,
          start: Shift.toString(newStart.toDate()),
          end: Shift.toString(newEnd.toDate()),
          updatedAt,
          status: "draft",
        };
        serverUpdates[`${employeeShiftsRefPath}`] = newShift;
        localUpdates.push(newShift);
      });

    dispatch(
      upsertShifts({
        weekId,
        shifts: localUpdates,
      })
    );
    try {
      await update(ref(DATABASE), serverUpdates);
    } catch (error) {
      dispatch(
        upsertShifts({
          weekId,
          shifts: empShiftsArray,
        })
      );
      throw error;
    }
  };

export const updateProjectedSalesThunk =
  ({
    weekId,
    projectedSalesByDay,
  }: {
    weekId: string;
    projectedSalesByDay: Record<number, number>;
  }): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const location = state.cuttinboardLocation?.data;
    if (!location) {
      throw new Error("Location not found");
    }
    const scheduleEntry = scheduleSelectors.selectById(state, weekId);
    if (!scheduleEntry) {
      throw new Error("Schedule entry not found");
    }
    const summary = scheduleEntry.summary;

    const localUpdate = {
      ...summary,
      projectedSalesByDay: {
        ...summary.projectedSalesByDay,
        ...projectedSalesByDay,
      },
    };

    dispatch(
      setScheduleDocument({
        weekId,
        summary: localUpdate,
      })
    );
    try {
      const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};

      for (const key in projectedSalesByDay) {
        const projectedSales = projectedSalesByDay[key];
        serverUpdates[
          `schedule/${weekId}/${location.id}/projectedSalesByDay/${key}`
        ] = projectedSales;
      }

      await update(ref(DATABASE), serverUpdates);
    } catch (error) {
      dispatch(
        setScheduleDocument({
          weekId,
          summary,
        })
      );
      throw error;
    }
  };
