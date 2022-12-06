import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  setDoc,
  arrayUnion,
  arrayRemove,
  query,
  collection,
  orderBy as orderByFirestore,
  Timestamp,
  doc,
  deleteField,
} from "firebase/firestore";
import { ref } from "firebase/storage";
import { FirebaseSignature } from "./FirebaseSignature";
import { PrimaryFirestore } from "./PrimaryFirestore";
import { AUTH, FIRESTORE, STORAGE } from "../utils/firebase";
import { Employee } from "../employee/Employee";

/**
 * The interface implemented by Location classes.
 */
export interface ILocation {
  name: string;
  description?: string;
  address?: Partial<{
    city: string;
    country: string;
    state: string;
    street: string;
    streetNumber: string;
    zip: string | number;
  }>;
  email?: string;
  phoneNumber?: string;
  intId?: string;
  subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  storageUsed: number;
  limits: {
    employees: number;
    storage: string;
  };
  organizationId: string;
  subscriptionId: string;
  subItemId: string;
  members: string[];
  supervisors?: string[];
  settings?: {
    positions?: string[];
  };
}

/**
 * The Location is the representation of a location in the database.
 * - This is the main class used to interact with the database.
 */
export class Location
  implements ILocation, PrimaryFirestore, FirebaseSignature
{
  /**
   * The id of the document.
   */
  public readonly id: string;
  /**
   * The reference to the document in the database.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The timestamp of when the document was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the user who created the document.
   */
  public readonly createdBy: string;
  /**
   * The status of the subscription for the location in Stripe.
   * - This is used to determine if the location is active or not.
   * - This status is the same for all locations in the organization.
   * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
   */
  public readonly subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  /**
   * The space used by the location in cloud storage in bytes.
   * - This is used to determine if the location is over their storage limit.
   * @see https://firebase.google.com/docs/storage
   */
  public readonly storageUsed: number;
  /**
   * The limits of the plan for the location.
   * - This is used to determine if the location is over their employee limit.
   */
  public readonly limits: {
    /**
     * The number of employees allowed for the location.
     */
    readonly employees: number;
    /**
     * The amount of storage allowed for the location in bytes.
     */
    readonly storage: string;
  };
  /**
   * The id of the organization the location belongs to.
   */
  public readonly organizationId: string;
  /**
   * The subscription id for the location in Stripe.
   * @remarks
   * Subscription id is the same for all locations in an organization.
   */
  public readonly subscriptionId: string;
  /**
   * The subscription item id for the location in Stripe.
   * @remarks
   * Subscription item id is the same for all locations in an organization.
   */
  public readonly subItemId: string;
  /**
   * The name of the location.
   */
  public readonly name: string;
  /**
   * The description of the location.
   */
  public readonly description?: string;
  /**
   * The address of the location.
   */
  public readonly address?: Partial<{
    /**
     * The city of the location.
     */
    readonly city: string;
    /**
     * The country of the location.
     */
    readonly country: string;
    /**
     * The state of the location.
     */
    readonly state: string;
    /**
     * The street of the location.
     */
    readonly street: string;
    /**
     * The street number of the location.
     * - Also known line 1.
     */
    readonly streetNumber: string;
    /**
     * The zip code of the location.
     * - Also known as line 2.
     */
    readonly zip: string | number;
  }>;
  /**
   * The email of the location. This is used for contact purposes.
   */
  public readonly email?: string;
  /**
   * The phone number of the location. This is used for contact purposes.
   */
  public readonly phoneNumber?: string;
  /**
   * An optional field used to identify the location internally in the organization.
   */
  public readonly intId?: string;
  /**
   * The ids of the members of the location.
   */
  public readonly members: string[];
  /**
   * The ids of the supervisors of the location.
   */
  public readonly supervisors?: string[];
  /**
   * Settings is used to store simple data that is used by the location.
   */
  public readonly settings?: {
    /**
     * Custom positions for the location added by the user.
     */
    readonly positions?: string[];
  };

  /**
   * Firestore data converter for the Location class.
   */
  public static firestoreConverter = {
    toFirestore(object: Location): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ILocation & FirebaseSignature>,
      options: SnapshotOptions
    ): Location {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Location(rawData, { id, docRef: ref });
    },
  };

  /**
   * Creates a new Location instance.
   * @param data The data to create the location with.
   * @param firestoreBase The id and docRef of the location.
   */
  constructor(
    {
      createdAt,
      createdBy,
      subscriptionStatus,
      storageUsed,
      limits,
      organizationId,
      subscriptionId,
      subItemId,
      name,
      description,
      address,
      email,
      phoneNumber,
      intId,
      members,
      settings,
      supervisors,
    }: ILocation & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.subscriptionStatus = subscriptionStatus;
    this.storageUsed = storageUsed;
    this.limits = limits;
    this.organizationId = organizationId;
    this.subscriptionId = subscriptionId;
    this.subItemId = subItemId;
    this.name = name;
    this.description = description;
    this.address = address;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.intId = intId;
    this.members = members;
    this.settings = settings;
    this.supervisors = supervisors;
  }

  /**
   * Gets the custom positions for the location.
   */
  public get positions() {
    return this.settings?.positions ?? [];
  }

  /**
   * Gets the cloud storage reference for the location.
   */
  public get storageRef() {
    return ref(
      STORAGE,
      `organizations/${this.organizationId}/locations/${this.id}`
    );
  }

  /**
   * Gets the employees reference for the location in firestore.
   */
  public get employeesRef() {
    return query(
      collection(
        FIRESTORE,
        "Organizations",
        this.organizationId,
        "employees"
      ).withConverter(Employee.firestoreConverter),
      orderByFirestore(`locations.${this.id}`)
    );
  }

  /**
   * Gets the current usage of the location and the limits.
   */
  public get usage() {
    return {
      employeesCount: Number(this.members?.length ?? 0),
      employeesLimit: Number(this.limits.employees ?? 0),
      storageUsed: Number(this.storageUsed ?? 0),
      storageLimit: Number(this.limits.storage ?? 0),
    };
  }

  /**
   * Gets the access status of the location based on the subscription status.
   */
  public get locationAccessStatus() {
    if (["past_due", "unpaid"].includes(this.subscriptionStatus)) {
      return "inactive";
    }
    if (this.subscriptionStatus === "canceled") {
      return "canceled";
    }
    if (!["active", "trialing"].includes(this.subscriptionStatus)) {
      return "error";
    }
    return "active";
  }

  /**
   * Adds a new custom position to the location settings.
   * @param newPosition The new position to add to the location.
   */
  public async addPosition(newPosition: string) {
    await setDoc(
      this.docRef,
      { settings: { positions: arrayUnion(newPosition.trim()) } },
      { merge: true }
    );
  }

  /**
   * Removes a custom position from the location settings.
   * @param position The position to remove from the location.
   */
  public async removePosition(position: string) {
    await setDoc(
      this.docRef,
      { settings: { positions: arrayRemove(position.trim()) } },
      { merge: true }
    );
  }

  /**
   * Updates the location with the new data.
   * @param newData The new data to update the location with.
   */
  public async updateLocation(newData: Partial<ILocation>) {
    await setDoc(this.docRef, newData, { merge: true });
  }

  /**
   * If the user is the owner of the location. This method allows the user to join/leave the location as a member.
   * @param join True to join the location, false to leave the location.
   */
  public async ownerJoin(join?: boolean) {
    const empDocRef = doc(
      FIRESTORE,
      "Organizations",
      this.organizationId,
      "employees",
      this.organizationId
    );
    await setDoc(
      empDocRef,
      {
        locations: {
          [this.id]: join ? true : deleteField(),
        },
      },
      { merge: true }
    );
  }

  /**
   * If the user is a supervisor of the location. This method allows the user to join/leave the location as a member.
   * @param join True to join the location, false to leave the location.
   */
  public async supervisorJoin(join?: boolean) {
    if (!this.supervisors || !AUTH.currentUser) {
      throw new Error("User is not logged in.");
    }
    if (!this.supervisors.includes(AUTH.currentUser.uid)) {
      throw new Error("User is not a supervisor of this location.");
    }
    const empDocRef = doc(
      FIRESTORE,
      "Organizations",
      this.organizationId,
      "employees",
      AUTH.currentUser.uid
    );
    await setDoc(
      empDocRef,
      {
        locations: {
          [this.id]: join ? true : deleteField(),
        },
      },
      { merge: true }
    );
  }
}
