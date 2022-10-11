import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { PrimaryFirestore } from "./PrimaryFirestore";

export const CuttinboardUserConverter = {
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
}

export class CuttinboardUser implements ICuttinboardUser, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public avatar?: string;
  public name: string;
  public lastName: string;
  public readonly email: string;
  public phoneNumber?: string;
  public userDocuments?: Record<string, string>;
  public birthDate?: Timestamp;
  public readonly customerId?: string;
  public readonly subscriptionId?: string;
  public paymentMethods?: string[];
  public organizations?: string[];

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
  }
}
