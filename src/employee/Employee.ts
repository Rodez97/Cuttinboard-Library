import {
  DocumentReference,
  DocumentData,
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
  setDoc,
  updateDoc,
  deleteField,
  FirestoreDataConverter,
  WithFieldValue,
  PartialWithFieldValue,
  arrayRemove,
} from "firebase/firestore";
import { intersection, orderBy } from "lodash";
import { BaseUser, EmergencyContact } from "../account";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { EmployeeLocationInfo } from "./EmployeeLocationInfo";
import { FirebaseSignature } from "../models/FirebaseSignature";
import { PrimaryFirestore } from "../models/PrimaryFirestore";

/**
 * Employee interface implemented by Employee class.
 */
export interface IEmployee extends BaseUser {
  /**
   * The ID of the organization that the employee belongs to.
   */
  organizationId: string;
  /**
   * The role of the employee.
   * - "employee" is the only role assigned to employees with roles <= `GENERAL_MANAGER`.
   * - `OWNER` and `ADMIN` are assigned to organization level roles.
   * @see {@link RoleAccessLevels}
   */
  role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER | "employee";
  /**
   * Information about the locations where the employee works.
   * - The key is the location ID.
   * - The value is either a boolean indicating whether the employee works at the location,
   *   or an object containing additional details about the employee's work at the location.
   */
  locations?: { [locationId: string]: EmployeeLocationInfo };
  /**
   * A list of location IDs where the employee is a supervisor.
   */
  supervisingLocations?: string[];

  /**
   * The ID of the locations that the employee is currently working at.
   */
  locationsList?: string[];
}

/**
 * A class that represents an employee in the database.
 */
export class Employee
  implements IEmployee, PrimaryFirestore, FirebaseSignature
{
  /**
   * {@inheritDoc PrimaryFirestore.id}
   */
  public readonly id: string;
  /**
   * {@inheritDoc PrimaryFirestore.docRef}
   */
  public readonly docRef: DocumentReference<DocumentData>;

  /**
   * {@inheritDoc FirebaseSignature.createdAt}
   */
  public readonly createdAt: Timestamp;
  /**
   * {@inheritDoc FirebaseSignature.createdBy}
   */
  public readonly createdBy: string;

  /**
   * {@inheritDoc BaseUser.avatar}
   */
  public readonly avatar?: string;
  /**
   * {@inheritDoc BaseUser.name}
   */
  public readonly name: string;
  /**
   * {@inheritDoc BaseUser.lastName}
   */
  public readonly lastName: string;
  /**
   * {@inheritDoc BaseUser.email}
   */
  public readonly email: string;
  /**
   * {@inheritDoc BaseUser.birthDate}
   */
  public readonly birthDate?: Timestamp;
  /**
   * {@inheritDoc BaseUser.phoneNumber}
   */
  public readonly phoneNumber?: string;
  /**
   * {@inheritDoc BaseUser.userDocuments}
   */
  public readonly userDocuments?: Record<string, string>;
  /**
   * {@inheritDoc IEmployee.organizationId}
   */
  public readonly organizationId: string;
  /**
   * {@inheritDoc IEmployee.role}
   */
  public readonly role:
    | RoleAccessLevels.OWNER
    | RoleAccessLevels.ADMIN
    | "employee";
  /**
   * {@inheritDoc IEmployee.locations}
   */
  public readonly locations?: {
    [locationId: string]: EmployeeLocationInfo;
  };
  /**
   * {@inheritDoc BaseUser.preferredName}
   */
  public readonly preferredName?: string;
  /**
   * {@inheritDoc BaseUser.emergencyContact}
   */
  public readonly emergencyContact?: EmergencyContact;
  /**
   * {@inheritDoc BaseUser.contactComments}
   */
  public readonly contactComments?: string;
  /**
   * {@inheritDoc IEmployee.supervisingLocations}
   */
  public readonly supervisingLocations?: string[];
  /**
   * The id of the locations that the user is currently working at.
   */
  public readonly locationsList?: string[];

  public static firestoreConverter: FirestoreDataConverter<Employee> = {
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
   * @param locationId The ID of the location to assign the employee to. If not provided, the employee will be assigned to the location selected in `globalThis` if there is one.
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
      locationsList,
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
    this.locationsList = locationsList;
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
    if (!globalThis.locationData.id || this.role !== "employee") {
      return [];
    }
    const selectedLoc = this.locations?.[globalThis.locationData.id];
    if (selectedLoc) {
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
    if (!globalThis.locationData.id || this.role !== "employee") {
      return "";
    }
    const selectedLoc = this.locations?.[globalThis.locationData.id];
    if (selectedLoc) {
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
    if (!globalThis.locationData.id) {
      return null;
    }
    if (this.role !== "employee") {
      return this.role;
    }
    const selectedLoc = this.locations?.[globalThis.locationData.id];
    if (selectedLoc) {
      return selectedLoc.role;
    }
    return RoleAccessLevels.STAFF;
  }

  /**
   * Gets all the location data for the employee for the current location.
   */
  public get locationData() {
    if (!globalThis.locationData.id || this.role !== "employee") {
      return null;
    }
    return this.locations?.[globalThis.locationData.id];
  }

  /**
   * Calculates the hourly wage for the employee for a given position.
   * @param position The position to check.
   */
  public getHourlyWage(position: string) {
    if (!globalThis.locationData.id) {
      return 0;
    }
    if (this.role !== "employee") {
      return 0;
    }
    const selectedLoc = this.locations?.[globalThis.locationData.id];
    if (selectedLoc) {
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
    if (!globalThis.locationData.id) {
      return;
    }
    await updateDoc(this.docRef, {
      [`locations.${globalThis.locationData.id}`]: deleteField(),
      locationsList: arrayRemove(globalThis.locationData.id),
    });
  }

  /**
   * Updates the employee data for the current location.
   * @param locationData The data to update.
   */
  public async update(
    locationData: PartialWithFieldValue<EmployeeLocationInfo>
  ) {
    if (!globalThis.locationData.id) {
      return;
    }
    await setDoc(
      this.docRef,
      {
        locations: { [globalThis.locationData.id]: locationData },
      },
      { merge: true }
    );
  }
}
