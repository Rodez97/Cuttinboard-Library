import { FieldValue, Timestamp } from "firebase/firestore";
import { LocationKey } from "./auth/LocationKey";

export type EmployeeLocation = LocationKey & {
  wagePerPosition?: Record<string, number>;
  employeeDataComments?: string;
  mainPosition?: string;

  startDate: FieldValue | Timestamp;
  /******************** Employee Documents **********************/
  employeeDocuments?: Record<string, string>;
};
