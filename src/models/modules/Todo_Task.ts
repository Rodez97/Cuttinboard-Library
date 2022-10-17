import { Timestamp } from "@firebase/firestore";

export type Todo_Task = {
  name: string;
  status: boolean;
  createdAt: Timestamp;
};
