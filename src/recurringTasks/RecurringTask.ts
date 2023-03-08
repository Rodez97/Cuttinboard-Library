import {
  deleteField,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { merge, unset } from "lodash";
import {
  IRecurringTask,
  IRecurringTaskDoc,
  recurringTaskIsCompleted,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(timezone);
dayjs.extend(utc);

export const recurringTaskDocConverter = {
  toFirestore(object: IRecurringTaskDoc): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IRecurringTaskDoc>,
    options: SnapshotOptions
  ): IRecurringTaskDoc {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

/**
 * Add a new recurring task to the tasks object
 * @param task Recurring Task to add
 * @param id Id of the task
 */
export const addPeriodicTask = (
  rtd: IRecurringTaskDoc,
  task: IRecurringTask,
  id: string
) => {
  const serverUpdates = { tasks: { [id]: task } };
  const updatedState = rtd;
  merge(updatedState, serverUpdates);

  return {
    serverUpdates,
    updatedState,
  };
};

/**
 * Remove a recurring task from the tasks object by its id.
 * @param id Id of the task to remove
 */
export const removePeriodicTask = (rtd: IRecurringTaskDoc, id: string) => {
  const serverUpdates = { tasks: { [id]: deleteField() } };
  const updatedState = rtd;
  unset(updatedState, `tasks.${id}`);

  return {
    serverUpdates,
    updatedState,
  };
};

/**
 * Update a recurring task in the tasks object by its id.
 * @param task Recurring Task to update
 * @param id Id of the task to update
 */
export const updatePeriodicTask = (
  rtd: IRecurringTaskDoc,
  task: IRecurringTask,
  id: string
) => {
  const serverUpdates = { tasks: { [id]: task } };
  const updatedState = rtd;
  merge(updatedState, serverUpdates);

  return {
    serverUpdates,
    updatedState,
  };
};

/**
 * Changes the task completion status
 */
export function toggleCompleted(rtd: IRecurringTaskDoc, taskId: string) {
  const task = rtd.tasks?.[taskId];
  if (!task) {
    throw new Error("Task not found");
  }
  const completionStatus = recurringTaskIsCompleted(task)
    ? null
    : dayjs().format("YYYY-MM-DD");

  const serverUpdates = {
    tasks: {
      [taskId]: {
        completed: completionStatus,
      },
    },
  };
  const updatedState = rtd;
  merge(updatedState, serverUpdates);

  return {
    serverUpdates,
    updatedState,
  };
}
