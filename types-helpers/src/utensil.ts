/**
 * Base interface implemented by Utensil class.
 */
export interface IUtensil {
  name: string;
  description?: string;
  optimalQuantity: number;
  currentQuantity: number;
  percent: number;
  tags?: string[];
  changes?: UtensilChange[];
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}

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
  date: number;
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
