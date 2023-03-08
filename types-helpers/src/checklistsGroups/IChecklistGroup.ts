import { IChecklist } from "./IChecklist";

/**
 * A Checklist group is a group of checklists linked to a location.
 */
export interface IChecklistGroup {
  locationId: string;
  checklists?: {
    [key: string]: IChecklist;
  };
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}
