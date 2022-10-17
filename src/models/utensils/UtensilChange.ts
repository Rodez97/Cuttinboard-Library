import { Timestamp } from "firebase/firestore";

/**
 * Registro de cambio en un utensilio
 */
export type UtensilChange = {
  quantity: number;
  date: Timestamp;
  user: {
    userId: string;
    userName: string;
  };
  reason?: string;
};
