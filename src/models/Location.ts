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
import { Auth, Firestore, Storage } from "./../firebase";
import { Employee } from "./Employee";

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

export class Location
  implements ILocation, PrimaryFirestore, FirebaseSignature
{
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  public readonly storageUsed: number;
  public readonly limits: {
    readonly employees: number;
    readonly storage: string;
  };
  public readonly organizationId: string;
  public readonly subscriptionId: string;
  public readonly subItemId: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly address?: Partial<{
    readonly city: string;
    readonly country: string;
    readonly state: string;
    readonly street: string;
    readonly streetNumber: string;
    readonly zip: string | number;
  }>;
  public readonly email?: string;
  public readonly phoneNumber?: string;
  public readonly intId?: string;
  public readonly members: string[];
  public readonly supervisors?: string[];
  public readonly settings?: { readonly positions?: string[] };

  public static Converter = {
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

  public get positions() {
    return this.settings?.positions ?? [];
  }

  public get storageRef() {
    return ref(
      Storage,
      `organizations/${this.organizationId}/locations/${this.id}`
    );
  }

  public get employeesRef() {
    return query(
      collection(
        Firestore,
        "Organizations",
        this.organizationId,
        "employees"
      ).withConverter(Employee.Converter),
      orderByFirestore(`locations.${this.id}`)
    );
  }

  public get usage() {
    return {
      employeesCount: Number(this.members?.length ?? 0),
      employeesLimit: Number(this.limits.employees ?? 0),
      storageUsed: Number(this.storageUsed ?? 0),
      storageLimit: Number(this.limits.storage ?? 0),
    };
  }

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

  public async addPosition(newPosition: string) {
    await setDoc(
      this.docRef,
      { settings: { positions: arrayUnion(newPosition.trim()) } },
      { merge: true }
    );
  }

  public async removePosition(position: string) {
    await setDoc(
      this.docRef,
      { settings: { positions: arrayRemove(position.trim()) } },
      { merge: true }
    );
  }

  public async updateLocation(newData: Partial<ILocation>) {
    await setDoc(this.docRef, newData, { merge: true });
  }

  public async ownerJoin(join?: boolean) {
    const empDocRef = doc(
      Firestore,
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

  public async supervisorJoin(join?: boolean) {
    if (!this.supervisors || !Auth.currentUser) {
      return;
    }
    if (!this.supervisors.includes(Auth.currentUser.uid)) {
      return;
    }
    const empDocRef = doc(
      Firestore,
      "Organizations",
      this.organizationId,
      "employees",
      Auth.currentUser.uid
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
