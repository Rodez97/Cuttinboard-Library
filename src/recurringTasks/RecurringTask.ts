import {
  deleteField,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import {
  IRecurringTask,
  IRecurringTaskDoc,
  recurringTaskIsCompleted,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(utc);

/* `recurringTaskDocConverter` is an object that contains two methods: `toFirestore` and
`fromFirestore`. These methods are used to convert a `IRecurringTaskDoc` object to and from a
Firestore document. */
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
 * The function adds a recurring task to a server update object and returns it.
 * @param {IRecurringTask} task - The task parameter is an object that represents a recurring task. It
 * likely contains properties such as the task's name, description, frequency, and any other relevant
 * information needed to execute the task on a recurring basis.
 * @param {string} id - id is a string parameter that represents the unique identifier of the recurring
 * task being added. It is used as a key in the tasks object to store the task details.
 * @returns The function `addPeriodicTask` returns an object `serverUpdates` with a property `tasks`
 * that contains an object with a key-value pair where the key is the `id` parameter and the value is
 * the `task` parameter.
 */
export const addPeriodicTask = (task: IRecurringTask, id: string) => {
  const serverUpdates = { tasks: { [id]: task } };
  return serverUpdates;
};

/**
 * The function removes a periodic task from a server update object using its ID.
 * @param {string} id - The `id` parameter is a string that represents the unique identifier of a
 * periodic task that needs to be removed.
 * @returns The function `removePeriodicTask` returns an object `serverUpdates` which has a property
 * `tasks` that is an object with a key-value pair where the key is the `id` passed as an argument to
 * the function and the value is the result of calling the `deleteField()` function.
 */
export const removePeriodicTask = (id: string) => {
  const serverUpdates = { tasks: { [id]: deleteField() } };
  return serverUpdates;
};

/**
 * This function updates a recurring task and returns the updated task as part of a server update
 * object.
 * @param {IRecurringTask} task - The task parameter is an object that represents a recurring task. It
 * likely contains properties such as the task's name, description, frequency, start date, and end
 * date.
 * @param {string} id - The `id` parameter is a string representing the unique identifier of the
 * recurring task that needs to be updated.
 * @returns The function `updatePeriodicTask` returns an object `serverUpdates` with a property `tasks`
 * that contains an object with a key-value pair where the key is the `id` parameter and the value is
 * the `task` parameter.
 */
export const updatePeriodicTask = (task: IRecurringTask, id: string) => {
  const serverUpdates = { tasks: { [id]: task } };
  return serverUpdates;
};

/**
 * This function toggles the completion status of a task in a recurring task document and returns
 * server updates.
 * @param {IRecurringTaskDoc} rtd - IRecurringTaskDoc, which is likely an interface or type definition
 * for a document or object representing a recurring task.
 * @param {string} taskId - taskId is a string parameter representing the ID of a task within a
 * recurring task document.
 * @returns an object with a property `tasks` which is an object with a single key-value pair. The key
 * is the `taskId` parameter passed to the function, and the value is another object with a single
 * key-value pair. The key is `completed` and the value is either `null` or a string representing the
 * current date in the format "YYYY-MM-DD", depending on
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

  return serverUpdates;
}
