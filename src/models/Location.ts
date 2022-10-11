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
} from "firebase/firestore";
import { ref } from "firebase/storage";
import { FirebaseSignature } from "./FirebaseSignature";
import { ModuleFirestoreConverter } from "./modules";
import { PrimaryFirestore } from "./PrimaryFirestore";
import { Firestore, Storage } from "./../firebase";
import { Employee } from "./Employee";

/**
 * Locación
 * @description Una locación es el objeto primario alrededor del cuál se ejectutan todas las operaciones.
 */
export interface ILocation {
  /**
   * Nombre
   */
  name: string;
  /**
   * Descripción
   */
  description?: string;
  /**
   * Dirección de la locación
   */
  address?: Partial<{
    city: string;
    country: string;
    state: string;
    street: string;
    streetNumber: string;
    zip: string | number;
  }>;
  /**
   * Correo electrónico de la locación
   */
  email?: string;
  /**
   * Número de teléfono de la locación
   */
  phoneNumber?: string;
  /**
   * ID interno de la locación en caso de ser necesario por parte del cliente
   */
  intId?: string;
  /**
   * Estado actual de la suscripción vinculada a la locación y por ende la locación en si
   */
  subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  /**
   * Espacio de almacenamiento consumido por la locación en bytes
   */
  storageUsed: number;
  /**
   * Límites de la locación según su plan
   */
  limits: {
    /**
     * Límite maximo de empleados
     */
    employees: number;
    /**
     * Capacidad máxima de almacenamiento
     */
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
  readonly id: string;
  readonly docRef: DocumentReference<DocumentData>;
  readonly createdAt: Timestamp;
  readonly createdBy: string;
  readonly subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  readonly storageUsed: number;
  readonly limits: {
    /**
     * Límite maximo de empleados
     */
    employees: number;
    /**
     * Capacidad máxima de almacenamiento
     */
    storage: string;
  };
  readonly organizationId: string;
  readonly subscriptionId: string;
  readonly subItemId: string;
  public name: string;
  public description?: string;
  public address?: Partial<{
    city: string;
    country: string;
    state: string;
    street: string;
    streetNumber: string;
    zip: string | number;
  }>;
  public email?: string;
  public phoneNumber?: string;
  public intId?: string;
  public members: string[];
  public supervisors?: string[];
  public settings?: { positions?: string[] };

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
      const rawData = value.data(options)!;
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
    try {
      await setDoc(
        this.docRef,
        { settings: { positions: arrayUnion(newPosition.trim()) } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async removePosition(position: string) {
    try {
      await setDoc(
        this.docRef,
        { settings: { positions: arrayRemove(position.trim()) } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async updateLocation(newData: Partial<ILocation>) {
    try {
      await setDoc(this.docRef, newData, { merge: true });
    } catch (error) {
      throw error;
    }
  }
}
