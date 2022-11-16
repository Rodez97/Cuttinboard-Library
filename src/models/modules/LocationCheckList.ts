import {
  DocumentData,
  DocumentReference,
  Timestamp,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  setDoc,
  deleteField,
  PartialWithFieldValue,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { Auth } from "../../firebase";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Todo_Task } from "./Todo_Task";

export type Checklist_Section = {
  name: string;
  description?: string;
  tasks?: Record<string, Todo_Task>;
  closed?: boolean;
  createdAt?: Timestamp;
  createdBy?: string;
  tag?: string; // Example: "Opening", "Closing"
};

export interface ILocationCheckList {
  signedBy?: {
    name: string;
    id: string;
  };
  locationId: string;
  sections?: {
    [key: string]: Checklist_Section;
  };
}

export class LocationCheckList implements ILocationCheckList, PrimaryFirestore {
  public readonly signedBy?: { name: string; id: string };
  public readonly locationId: string;
  public readonly sections?: {
    [key: string]: Checklist_Section;
  };
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;

  public static Converter: FirestoreDataConverter<LocationCheckList> = {
    toFirestore(object: WithFieldValue<LocationCheckList>): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ILocationCheckList>,
      options: SnapshotOptions
    ): LocationCheckList {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new LocationCheckList(rawData, { id, docRef: ref });
    },
  };

  constructor(
    { signedBy, locationId, sections }: ILocationCheckList,
    { id, docRef }: PrimaryFirestore
  ) {
    this.signedBy = signedBy;
    this.locationId = locationId;
    this.sections = sections;
    this.id = id;
    this.docRef = docRef;
  }

  public get checklistSummary() {
    const summary = {
      total: 0,
      completed: 0,
    };

    if (isEmpty(this.sections)) {
      // If there are no sections, return the summary
      return summary;
    }

    for (const sectionKey in this.sections) {
      const section = this.sections[sectionKey];
      if (isEmpty(section.tasks)) {
        // If there are no tasks in the section, skip it
        continue;
      }
      for (const taskKey in section.tasks) {
        const task = section.tasks[taskKey];
        summary.total++;
        if (task.status) {
          summary.completed++;
        }
      }
    }
    return summary;
  }

  public getSectionSummary(sectionKey: string) {
    const summary = {
      total: 0,
      completed: 0,
    };

    if (isEmpty(this.sections)) {
      // If there are no sections, return the summary
      return summary;
    }

    const section = this.sections[sectionKey];
    if (isEmpty(section.tasks)) {
      // If there are no tasks in the section, skip it
      return summary;
    }
    for (const taskKey in section.tasks) {
      const task = section.tasks[taskKey];
      summary.total++;
      if (task.status) {
        summary.completed++;
      }
    }
    return summary;
  }

  public async changeTaskStatus(
    sectionKey: string,
    taskKey: string,
    status: boolean
  ) {
    // Check if the task exists
    if (!this.sections?.[sectionKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: {
              tasks: {
                [taskKey]: {
                  status,
                },
              },
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async addTask(
    sectionKey: string,
    taskKey: string,
    task: WithFieldValue<Todo_Task>
  ) {
    // Check if the task exists
    if (this.sections?.[sectionKey]?.tasks?.[taskKey]) {
      throw new Error("There is already a task with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: {
              tasks: {
                [taskKey]: task,
              },
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async removeTask(sectionKey: string, taskKey: string) {
    // Check if the task exists
    if (!this.sections?.[sectionKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: {
              tasks: {
                [taskKey]: deleteField(),
              },
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async resetAllTasks() {
    // Create a new object with all the tasks set to false
    let update: {
      [key: string]: {
        tasks: {
          [key: string]: {
            status: boolean;
          };
        };
      };
    } = {};

    if (isEmpty(this.sections)) {
      // If there are no sections, return
      return;
    }

    for (const sectionKey in this.sections) {
      const section = this.sections[sectionKey];
      if (isEmpty(section.tasks)) {
        // If there are no tasks in the section, skip it
        continue;
      }
      update[sectionKey] = {
        tasks: {},
      };
      for (const taskKey in section.tasks) {
        update[sectionKey].tasks[taskKey] = {
          status: false,
        };
      }
    }

    try {
      await setDoc(this.docRef, { sections: update }, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  public async removeSection(sectionKey: string) {
    // Check if the section exists
    if (!this.sections?.[sectionKey]) {
      throw new Error("There is no section with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: deleteField(),
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async addSection(
    sectionKey: string,
    section: WithFieldValue<Checklist_Section>
  ) {
    // Check if the section exists
    if (this.sections?.[sectionKey]) {
      throw new Error("There is already a section with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: section,
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async signChecklist() {
    try {
      await setDoc(
        this.docRef,
        {
          signedBy: {
            name: Auth.currentUser.displayName,
            id: Auth.currentUser.uid,
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async updateTask(
    sectionKey: string,
    taskKey: string,
    task: PartialWithFieldValue<Todo_Task>
  ) {
    // Check if the task exists
    if (!this.sections?.[sectionKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: {
              tasks: {
                [taskKey]: task,
              },
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async updateSection(
    sectionKey: string,
    section: PartialWithFieldValue<Omit<Checklist_Section, "tasks">>
  ) {
    // Check if the section exists
    if (!this.sections?.[sectionKey]) {
      throw new Error("There is no section with this ID");
    }

    try {
      await setDoc(
        this.docRef,
        {
          sections: {
            [sectionKey]: section,
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }
}
