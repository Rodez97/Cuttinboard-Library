import { Timestamp } from "firebase/firestore";

export type UtensilChange = {
  quantity: number;
  date: Timestamp;
  user: {
    userId: string;
    userName: string;
  };
  reason?: string;
};
