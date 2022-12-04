import {
  DocumentReference,
  DocumentData,
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
  deleteDoc,
  setDoc,
  updateDoc,
  deleteField,
  FirestoreDataConverter,
  WithFieldValue,
  PartialWithFieldValue,
} from "firebase/firestore";
import { intersection, isEmpty, orderBy } from "lodash";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { EmergencyContact, ICuttinboardUser } from "./auth/CuttinboardUser";
import { EmployeeLocation } from "./EmployeeLocation";
import { FirebaseSignature } from "./FirebaseSignature";
import { PrimaryFirestore } from "./PrimaryFirestore";

/**
 * The base public user type.
 */
type BaseUser = Omit<
  ICuttinboardUser,
  "customerId" | "subscriptionId" | "paymentMethods" | "organizations"
>;

/**
 * Employee interface implemented by Employee class.
 */
export interface IEmployee extends BaseUser {
  organizationId: string;
  role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER | "employee";
  locations?: { [locationId: string]: boolean | EmployeeLocation };
  supervisingLocations?: string[];
}

/**
 * A class that represents an employee in the database.
 */
export class Employee
  implements IEmployee, PrimaryFirestore, FirebaseSignature
{
  /**
   * The id of the employee.
   */
  public readonly id: string;
  /**
   * The avatar of the employee.
   */
  public readonly avatar?: string;
  /**
   * The document reference of the employee.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The timestamp of when the employee was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the user that created the employee.
   */
  public readonly createdBy: string;
  /**
   * The name of the employee.
   */
  public readonly name: string;
  /**
   * The last name of the employee.
   */
  public readonly lastName: string;
  /**
   * The email of the employee.
   */
  public readonly email: string;
  /**
   * The birth date of the employee.
   * - This is not used by now. It is just for future use.
   */
  public readonly birthDate?: Timestamp;
  /**
   * The phone number of the employee.
   */
  public readonly phoneNumber?: string;
  /**
   * The documents uploaded by the user. A record of the document id and the storage path.
   */
  public readonly userDocuments?: Record<string, string>;
  /**
   * The id of the organization that the employee belongs to.
   */
  public readonly organizationId: string;
  /**
   * The role of the employee.
   * - "employee" is the only role assigned to employees with roles <= `GENERAL_MANAGER`.
   * - `OWNER` and `ADMIN` are assigned to organization level roles.
   * @see {@link RoleAccessLevels}
   */
  public readonly role:
    | RoleAccessLevels.OWNER
    | RoleAccessLevels.ADMIN
    | "employee";
  /**
   * The records of the locations that the employee is currently working at.
   * - The key is the location id.
   * - The value is either `true` or an object that contains the location related data.
   */
  public readonly locations?: {
    [locationId: string]: boolean | EmployeeLocation;
  };
  /**
   * The preferred name of the user. This is used for contact purposes and is not required.
   */
  public readonly preferredName?: string;
  /**
   * The emergency contact of the user. This is used for contact purposes and is not required.
   */
  public readonly emergencyContact?: EmergencyContact;
  /**
   * The contact comments of the user. This is used for contact purposes and is not required.
   */
  public readonly contactComments?: string;
  /**
   * In case the employee is a supervisor, this will return the locations that the employee is supervising.
   */
  public readonly supervisingLocations?: string[];
  /**
   * The id of the location that the user is currently working at.
   */
  public readonly locationId?: string;

  /**
   * Firestore converter for Employee class.
   */
  public static Converter: FirestoreDataConverter<Employee> = {
    toFirestore(object: WithFieldValue<Employee>): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IEmployee & FirebaseSignature>,
      options: SnapshotOptions
    ): Employee {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Employee(rawData, { id, docRef: ref });
    },
  };

  /**
   * Creates a new Employee instance.
   * @param data The data to create the employee from.
   * @param firestoreBase The id and document reference of the employee.
   * @remarks
   * If there is a location selected in `globalThis`, the employee will be assigned to that location.
   */
  constructor(
    {
      createdAt,
      createdBy,
      name,
      lastName,
      email,
      birthDate,
      phoneNumber,
      userDocuments,
      organizationId,
      role,
      locations,
      preferredName,
      emergencyContact,
      contactComments,
      supervisingLocations,
      avatar,
    }: IEmployee & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.birthDate = birthDate;
    this.phoneNumber = phoneNumber;
    this.userDocuments = userDocuments;
    this.organizationId = organizationId;
    this.role = role;
    this.locations = locations;
    this.preferredName = preferredName;
    this.emergencyContact = emergencyContact;
    this.contactComments = contactComments;
    this.supervisingLocations = supervisingLocations;
    this.avatar = avatar;
    // If there is a location selected in `globalThis`, the employee will be assigned to that location.
    this.locationId = globalThis.locationData?.id;
  }

  /**
   * Gets the full name of the employee.
   */
  public get fullName() {
    return `${this.name} ${this.lastName}`;
  }

  /**
   * Gets the positions of the employee for the current location.
   * - If the employee is not assigned to any location, it will return an empty array.
   * - For organization level roles, it will return an empty array.
   */
  public get positions() {
    if (!this.locationId) {
      return [];
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (
      this.role === "employee" &&
      selectedLoc != null &&
      typeof selectedLoc !== "boolean"
    ) {
      return orderBy(selectedLoc.pos ?? []);
    }
    return [];
  }

  /**
   * Gets the preferred position for this employee.
   * - If the employee is not assigned to any location, it will return an empty string.
   * - For organization level roles, it will return an empty string.
   */
  public get mainPosition() {
    if (!this.locationId) {
      return "";
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (
      this.role === "employee" &&
      selectedLoc != null &&
      typeof selectedLoc !== "boolean"
    ) {
      return selectedLoc.mainPosition ?? "";
    }
    return "";
  }

  /**
   * Get the role of the employee for the current location.
   * - If the employee is not assigned to any location, it will return null.
   * - For organization level roles, it will return the role.
   */
  public get locationRole() {
    if (!this.locationId) {
      return null;
    }
    if (this.role !== "employee") {
      return this.role;
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (selectedLoc != null && typeof selectedLoc !== "boolean") {
      return selectedLoc.role;
    }
    return RoleAccessLevels.STAFF;
  }

  /**
   * Gets all the location data for the employee for the current location.
   */
  public get locationData() {
    if (!this.locationId) {
      return null;
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (
      this.role === "employee" &&
      selectedLoc != null &&
      typeof selectedLoc !== "boolean"
    ) {
      return selectedLoc;
    }
    return null;
  }

  /**
   * Calculates the hourly wage for the employee for a given position.
   * @param position The position to check.
   */
  public getHourlyWage(position: string) {
    if (!this.locationId) {
      return 0;
    }
    if (this.role !== "employee") {
      return 0;
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (selectedLoc != null && typeof selectedLoc !== "boolean") {
      return selectedLoc.wagePerPosition?.[position] ?? 0;
    }
    return 0;
  }

  /**
   * Checks if the employee have at least one of the positions.
   * @param positions The positions to check.
   */
  public hasAnyPosition(positions: string[]) {
    return intersection(this.positions, positions).length > 0;
  }

  /**
   * Removes the employee from the current location.
   * @remarks
   * - For organization level roles, it will remove only the location for the record of locations.
   * - For employee level roles, it will remove the employee from the location, but if it is the last location, it will remove the employee from the organization.
   */
  public async delete() {
    if (!this.locationId) {
      return;
    }
    const selectedLoc = this.locations?.[this.locationId];
    const locationsCount = this.locations
      ? Object.keys(this.locations).length
      : 0;
    if (
      this.role === "employee" &&
      locationsCount === 1 &&
      !isEmpty(selectedLoc)
    ) {
      await deleteDoc(this.docRef);
    } else {
      await updateDoc(this.docRef, {
        locations: { [this.locationId]: deleteField() },
      });
    }
  }

  /**
   * Updates the employee data for the current location.
   * @param locationData The data to update.
   */
  public async update(locationData: PartialWithFieldValue<EmployeeLocation>) {
    if (!this.locationId) {
      return;
    }
    await setDoc(
      this.docRef,
      {
        locations: { [this.locationId]: locationData },
      },
      { merge: true }
    );
  }
}
