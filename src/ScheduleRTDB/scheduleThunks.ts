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
import { scheduleSelectors } from "./scheduleSelectors";
import {
  setScheduleDocument,
  upsertEmployeeShifts,
  upsertEmployeeShiftsEntry,
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
} from "@cuttinboard-solutions/types-helpers";
import {
  checkShiftObjectChanges,
  IScheduleDoc,
  WeekSchedule,
} from "@cuttinboard-solutions/types-helpers/dist/ScheduleRTDB";
import { get, ref, update } from "firebase/database";

function createShiftUpdateThunk<T = undefined>(
  updateFn: (args: {
    employeeWeekSchedule: WeekSchedule["shifts"][string];
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
      const empShiftsEntry = scheduleEntry.schedule.shifts[employeeId] ?? {};
      if (!empShiftsEntry) {
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
        upsertEmployeeShiftsEntry({
          weekId,
          employeeId,
          entry: localUpdates,
        })
      );
      try {
        await update(ref(DATABASE), serverUpdates);
      } catch (error) {
        dispatch(
          upsertEmployeeShiftsEntry({
            weekId,
            employeeId,
            entry: empShiftsEntry,
          })
        );
        throw error;
      }
    };
}

export const updateShiftThunk = createShiftUpdateThunk<
  Partial<IPrimaryShiftData>
>(
  ({
    employeeWeekSchedule,
    shift,
    extra: pendingUpdate,
    location,
    employeeId,
    weekId,
  }) => {
    if (!pendingUpdate) {
      throw new Error("No update data provided");
    }
    const updates = getUpdateShiftData(
      employeeWeekSchedule,
      location,
      weekId,
      employeeId,
      shift.id,
      pendingUpdate
    );
    return updates;
  }
);

export const cancelShiftUpdateThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, location, employeeId, weekId }) => {
    const updates = getCancelShiftUpdateData(
      employeeWeekSchedule,
      location,
      weekId,
      employeeId,
      shift.id
    );
    return updates;
  }
);

export const deleteShiftThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, location, employeeId, weekId }) => {
    const updates = getDeleteShiftData(
      employeeWeekSchedule,
      location,
      weekId,
      employeeId,
      shift
    );
    return updates;
  }
);

export const restoreShiftThunk = createShiftUpdateThunk(
  ({ employeeWeekSchedule, shift, location, employeeId, weekId }) => {
    const updates = getRestoreShiftData(
      employeeWeekSchedule,
      location,
      weekId,
      employeeId,
      shift
    );
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
    const newShifts: Record<string, IShift> = createShiftElement(
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
    const empShiftsEntry =
      scheduleEntry && scheduleEntry.schedule.shifts[employeeId]
        ? scheduleEntry.schedule.shifts[employeeId]
        : {};

    const { localUpdates, serverUpdates } = getNewShiftsData(
      empShiftsEntry,
      location,
      weekId,
      employeeId,
      newShifts
    );

    dispatch(
      upsertEmployeeShiftsEntry({
        weekId,
        employeeId,
        entry: localUpdates,
      })
    );
    try {
      await update(ref(DATABASE), serverUpdates);
    } catch (error) {
      dispatch(
        upsertEmployeeShiftsEntry({
          weekId,
          employeeId,
          entry: empShiftsEntry,
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
    const empShiftsRecord = scheduleEntry.schedule.shifts;
    if (!empShiftsRecord || !Object.keys(empShiftsRecord).length) {
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
        notiRecipients = Object.entries(empShiftsRecord)
          .filter(([, shifts]) => shifts && Object.keys(shifts).length > 0)
          .map(([employeeId]) => employeeId);
        break;
      case "changed":
        // Get all employees that have shifts and have changed shifts from the last published schedule
        notiRecipients = Object.entries(empShiftsRecord)
          .filter(([, shifts]) => checkShiftObjectChanges(shifts))
          .map(([employeeId]) => employeeId);
        break;
      default:
        break;
    }

    const updates = batchPublish(empShiftsRecord, location, weekId);

    if (!updates) {
      console.info(
        "%c No new shifts available to publish ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }

    const { localUpdates, serverUpdates } = updates;

    dispatch(
      upsertEmployeeShifts({
        weekId,
        empShifts: localUpdates,
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
      };

      const batchUpdateObject: EmployeeShiftsDocumentUpdates["serverUpdates"] =
        {
          ...serverUpdates,
        };

      copyPropertiesWithPrefix(
        summaryObjectUpdate,
        batchUpdateObject,
        `scheduleData/${location.organizationId}/${location.id}/${weekId}/summary`
      );

      await update(ref(DATABASE), batchUpdateObject);
    } catch (error) {
      dispatch(
        upsertEmployeeShifts({
          weekId,
          empShifts: empShiftsRecord,
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
    const empShiftsRecord = scheduleEntry.schedule.shifts ?? {};
    if (
      Object.values(empShiftsRecord).some(
        (shifts) => Object.keys(shifts).length
      )
    ) {
      throw new Error("Cannot clone shifts from a week with published shifts");
    }

    const { start } = parseWeekId(targetWeekId);

    // Calculate the number of weeks difference between the first day of the target week and the first day of the current week
    const weeksDiff = Math.abs(dayjs(start).diff(weekDays[0], "weeks"));

    // Get the shifts for the target week for the given employees
    const allQueries = ref(
      DATABASE,
      `scheduleData/${location.organizationId}/${location.id}/${targetWeekId}`
    );

    const exeQueries = await get(allQueries);

    if (!exeQueries.exists() || !exeQueries.child("shifts").size) {
      console.info(
        "%c No shifts available to clone ",
        "font-size: 1.5rem; font-weight: 600; color: purple;"
      );
      return;
    }

    const shiftsRecord: WeekSchedule["shifts"] = exeQueries
      .child("shifts")
      .val();
    const summary: WeekSchedule["summary"] = exeQueries.child("summary").val();

    const flatShiftsArray: [string, [string, IShift][]][] = Object.entries(
      shiftsRecord
    ).map(([employeeId, shifts]) => [employeeId, Object.entries(shifts)]);

    // Create a record of shifts to update
    const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};
    const localUpdates: WeekSchedule["shifts"] = {};

    const updatedAt = Timestamp.now().toMillis();

    // Loop through each shift
    flatShiftsArray.forEach(([employeeId, shifts]) => {
      const employeeShiftsRefPath = getEmployeeShiftsRefPath(
        location,
        weekId,
        employeeId
      );

      shifts
        .filter(
          ([, shift]) =>
            shift.status === "published" && // Only clone published shifts
            !shift.deleting && // Only clone if the shift is not being deleted
            !checkIfShiftsHaveChanges(shift) // Only clone if the shift doesn't have pending updates
        )
        .forEach(([shiftId, shift]) => {
          // Adjust the shift to the current week
          const newStart = getShiftDayjsDate(shift, "start").add(
            weeksDiff,
            "weeks"
          );
          const newEnd = getShiftDayjsDate(shift, "end").add(
            weeksDiff,
            "weeks"
          );
          const newShift: IShift = {
            ...shift,
            start: Shift.toString(newStart.toDate()),
            end: Shift.toString(newEnd.toDate()),
            updatedAt,
            status: "draft",
          };
          serverUpdates[`${employeeShiftsRefPath}/${shiftId}`] = newShift;
          localUpdates[employeeId] = {
            ...localUpdates[employeeId],
            [shiftId]: newShift,
          };
        });
    });

    dispatch(
      upsertEmployeeShifts({
        weekId,
        empShifts: localUpdates,
      })
    );
    try {
      const batchUpdateObject = {
        ...serverUpdates,
        [`scheduleData/${location.organizationId}/${location.id}/${weekId}/summary`]:
          {
            updatedAt: Timestamp.now().toMillis(),
            ...summary,
          },
      };
      await update(ref(DATABASE), batchUpdateObject);
    } catch (error) {
      dispatch(
        upsertEmployeeShifts({
          weekId,
          empShifts: empShiftsRecord,
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
    const summary = scheduleEntry.schedule.summary;

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
          `scheduleData/${location.organizationId}/${location.id}/${weekId}/summary/projectedSalesByDay/${key}`
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
