import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface ICuttinboardUser {
  avatar?: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userDocuments?: Record<string, string>;
  birthDate?: Timestamp;
  customerId?: string;
  subscriptionId?: string;
  paymentMethods?: string[];
  organizations?: string[];

  preferredName?: string;
  emergencyContact?: { name?: string; phoneNumber: string };
  contactComments?: string;
}

export class CuttinboardUser implements ICuttinboardUser, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly avatar?: string;
  public readonly name: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly phoneNumber?: string;
  public readonly userDocuments?: Record<string, string>;
  public readonly birthDate?: Timestamp;
  public readonly customerId?: string;
  public readonly subscriptionId?: string;
  public readonly paymentMethods?: string[];
  public readonly organizations?: string[];
  public readonly preferredName?: string;
  public readonly emergencyContact?: { name?: string; phoneNumber: string };
  public readonly contactComments?: string;

  public static Converter = {
    toFirestore(object: CuttinboardUser): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ICuttinboardUser>,
      options: SnapshotOptions
    ): CuttinboardUser {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new CuttinboardUser(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      avatar,
      name,
      lastName,
      email,
      phoneNumber,
      paymentMethods,
      userDocuments,
      birthDate,
      customerId,
      subscriptionId,
      organizations,
      preferredName,
      emergencyContact,
      contactComments,
    }: ICuttinboardUser,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.avatar = avatar;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.paymentMethods = paymentMethods;
    this.userDocuments = userDocuments;
    this.birthDate = birthDate;
    this.customerId = customerId;
    this.subscriptionId = subscriptionId;
    this.organizations = organizations;
    this.preferredName = preferredName;
    this.emergencyContact = emergencyContact;
    this.contactComments = contactComments;
  }
}
