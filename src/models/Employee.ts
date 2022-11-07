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
import { ICuttinboardUser } from "./auth/CuttinboardUser";
import { EmployeeLocation } from "./EmployeeLocation";
import { FirebaseSignature } from "./FirebaseSignature";
import { PrimaryFirestore } from "./PrimaryFirestore";

/**
 * Empleado
 */

type BaseUser = Omit<
  ICuttinboardUser,
  "customerId" | "subscriptionId" | "paymentMethods" | "organizations"
>;

export interface IEmployee extends BaseUser {
  /**
   * Es dueño de la locación?
   */
  organizationId: string;
  role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER | "employee";
  locations?: { [locationId: string]: boolean | EmployeeLocation };
  supervisingLocations?: string[];
}

export class Employee
  implements IEmployee, PrimaryFirestore, FirebaseSignature
{
  public readonly id: string;
  public readonly avatar?: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly birthDate?: Timestamp;
  public readonly phoneNumber?: string;
  public readonly userDocuments?: Record<string, string>;
  public readonly organizationId: string;
  public readonly role:
    | RoleAccessLevels.OWNER
    | RoleAccessLevels.ADMIN
    | "employee";
  public readonly locations?: {
    [locationId: string]: boolean | EmployeeLocation;
  };
  public readonly preferredName?: string;
  public readonly emergencyContact?: { name?: string; phoneNumber: string };
  public readonly contactComments?: string;
  public readonly supervisingLocations?: string[];
  public locationId?: string;

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
      const rawData = value.data(options)!;
      return new Employee(rawData, { id, docRef: ref });
    },
  };

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
  }

  public get fullName() {
    return `${this.name} ${this.lastName}`;
  }

  public get positions() {
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

  public get mainPosition() {
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

  public get locationRole() {
    if (this.role !== "employee") {
      return this.role;
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (selectedLoc != null && typeof selectedLoc !== "boolean") {
      return selectedLoc.role;
    }
    return RoleAccessLevels.STAFF;
  }

  public get locationData() {
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

  public getHourlyWage(position: string) {
    if (this.role !== "employee") {
      return 0;
    }
    const selectedLoc = this.locations?.[this.locationId];
    if (selectedLoc != null && typeof selectedLoc !== "boolean") {
      return selectedLoc.wagePerPosition?.[position] ?? 0;
    }
    return 0;
  }

  public hasAnyPosition(positions: string[]) {
    return intersection(this.positions, positions).length > 0;
  }

  public async delete() {
    const selectedLoc = this.locations?.[this.locationId];
    const locationsCount = Object.keys(this.locations).length;
    try {
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
    } catch (error) {
      throw error;
    }
  }

  public async update(locationData: PartialWithFieldValue<EmployeeLocation>) {
    try {
      await setDoc(
        this.docRef,
        {
          locations: { [this.locationId]: locationData },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }
}
