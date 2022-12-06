import { Timestamp } from "firebase/firestore";

/**
 * The record of a change in the quantity of a utensil.
 */
export type UtensilChange = {
  /**
   * The quantity of the change applied to the utensil.
   */
  quantity: number;
  /**
   * The timestamp date the utensil was changed.
   */
  date: Timestamp;
  /**
   * The user that made the change.
   */
  user: {
    /**
     * The id of the user that made the change.
     */
    userId: string;
    /**
     * The name of the user that made the change.
     */
    userName: string;
  };
  /**
   * The reason for the change in the utensil quantity.
   */
  reason?: string;
};
