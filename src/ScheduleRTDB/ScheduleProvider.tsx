import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { Dictionary } from "lodash";
import { useScheduleData } from "./useScheduleData";
import {
  makeEmpShiftsSelector,
  makeSelectScheduleSummary,
  makeSelectUpdatesCount,
  makeSelectWageData,
  makeSelectWeekSummary,
  selectScheduleError,
  selectScheduleLoading,
} from "./scheduleSelectors";
import {
  batchPublishShiftsThunk,
  cancelShiftUpdateThunk,
  cloneWeekShiftsThunk,
  createShiftThunk,
  deleteShiftThunk,
  restoreShiftThunk,
  updateProjectedSalesThunk,
  updateShiftThunk,
} from "./scheduleThunks";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import {
  getWeekDays,
  IPrimaryShiftData,
  IShift,
  ShiftWage,
  WageDataByDay,
  WEEKFORMAT,
  WeekSummary,
} from "@cuttinboard-solutions/types-helpers";
import { WeekSchedule } from "@cuttinboard-solutions/types-helpers/dist/ScheduleRTDB";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IScheduleContext {
  weekId: string;
  setWeekId: React.Dispatch<React.SetStateAction<string>>;
  summaryDoc?: WeekSchedule["summary"];
  employeeShifts: [string, [string, IShift][]][];
  weekDays: dayjs.Dayjs[];
  weekSummary: WeekSummary;
  publish: (
    notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
  ) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  position: string;
  setPosition: React.Dispatch<React.SetStateAction<string>>;
  createShift: (
    shift: IShift,
    dates: dayjs.Dayjs[],
    applyToWeekDays: number[],
    employeeId: string
  ) => void;
  updatesCount: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
  cloneWeek: (targetWeekId: string, employees: string[]) => Promise<void>;
  wageData: Dictionary<{
    summary: WageDataByDay;
    shifts: Map<
      string,
      {
        wageData: ShiftWage;
        isoWeekDay: number;
      }
    >;
  }>;
  updateShift: (
    shift: IShift,
    employeeId: string,
    extra: Partial<IPrimaryShiftData>
  ) => void;
  cancelShiftUpdate: (shift: IShift, employeeId: string) => void;
  deleteShift: (shift: IShift, employeeId: string) => void;
  restoreShift: (shift: IShift, employeeId: string) => void;
  updateProjectedSales: (projectedSalesByDay: Record<number, number>) => void;
  loading: boolean;
  error?: string | undefined;
}

interface IScheduleProvider {
  children: ReactNode;
}

export const ShiftContext = createContext<IScheduleContext>(
  {} as IScheduleContext
);

export function ScheduleProvider({ children }: IScheduleProvider) {
  const { onError } = useCuttinboard();
  const [weekId, setWeekId] = useState(dayjs().format(WEEKFORMAT));
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<string>("");
  const thunkDispatch = useAppThunkDispatch();
  const [
    empShiftsSelector,
    weekDays,
    updatesCountSelector,
    wageDataSelector,
    weekSummarySelector,
    summaryDocSelector,
  ] = useMemo(
    () => [
      makeEmpShiftsSelector(weekId),
      getWeekDays(weekId),
      makeSelectUpdatesCount(weekId),
      makeSelectWageData(weekId),
      makeSelectWeekSummary(weekId),
      makeSelectScheduleSummary(weekId),
    ],
    [weekId]
  );
  const employeeShifts = useAppSelector(empShiftsSelector);
  const updatesCount = useAppSelector(updatesCountSelector);
  const wageData = useAppSelector(wageDataSelector);
  const weekSummary = useAppSelector(weekSummarySelector);
  const summaryDoc = useAppSelector(summaryDocSelector);
  const loading = useAppSelector(selectScheduleLoading);
  const error = useAppSelector(selectScheduleError);

  useScheduleData(weekId);

  const updateShift = useCallback(
    (shift: IShift, employeeId: string, extra: Partial<IPrimaryShiftData>) => {
      thunkDispatch(
        updateShiftThunk({
          weekId,
          shift,
          employeeId,
          extra,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const cancelShiftUpdate = useCallback(
    (shift: IShift, employeeId: string) => {
      // Publish the schedule
      thunkDispatch(
        cancelShiftUpdateThunk({
          weekId,
          shift,
          employeeId,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const deleteShift = useCallback(
    (shift: IShift, employeeId: string) => {
      // Publish the schedule
      thunkDispatch(
        deleteShiftThunk({
          weekId,
          shift,
          employeeId,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const restoreShift = useCallback(
    (shift: IShift, employeeId: string) => {
      // Publish the schedule
      thunkDispatch(
        restoreShiftThunk({
          weekId,
          shift,
          employeeId,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const createShift = useCallback(
    (
      shift: IShift,
      dates: dayjs.Dayjs[],
      applyToWeekDays: number[],
      employeeId: string
    ) => {
      thunkDispatch(
        createShiftThunk({
          weekId,
          shift,
          employeeId,
          dates,
          applyToWeekDays,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const cloneWeek = useCallback(
    async (targetWeekId: string, employees: string[]) =>
      thunkDispatch(
        cloneWeekShiftsThunk({
          weekId,
          targetWeekId,
          employees,
          weekDays,
        })
      ),
    [thunkDispatch, weekDays, weekId]
  );

  const updateProjectedSales = useCallback(
    (projectedSalesByDay: Record<number, number>) => {
      thunkDispatch(
        updateProjectedSalesThunk({
          weekId,
          projectedSalesByDay,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId]
  );

  const publish = useCallback(
    (notificationRecipients: "all" | "all_scheduled" | "changed" | "none") => {
      // Publish the schedule
      thunkDispatch(
        batchPublishShiftsThunk(weekId, notificationRecipients, {
          year: weekDays[0].year(),
          weekNumber: weekDays[0].isoWeekYear(),
          scheduleSummary: weekSummary,
        })
      ).catch(onError);
    },
    [thunkDispatch, weekId, weekSummary]
  );

  return (
    <ShiftContext.Provider
      value={{
        weekId,
        setWeekId,
        weekDays,
        weekSummary,
        publish,
        searchQuery,
        setSearchQuery,
        position,
        setPosition,
        createShift,
        updatesCount,
        cloneWeek,
        employeeShifts,
        summaryDoc,
        wageData,
        deleteShift,
        updateShift,
        restoreShift,
        cancelShiftUpdate,
        updateProjectedSales,
        loading,
        error,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}
