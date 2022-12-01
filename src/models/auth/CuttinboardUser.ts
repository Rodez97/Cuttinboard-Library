import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

/**
 * The CuttinboardUser interface implemented by the CuttinboardUser class.
 */
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

/**
 * A CuttinboardUser is the base user model for Cuttinboard.
 * @constructor
 * @param data The data to create the CuttinboardUser with.
 * @param firestoreBase (id, docRef) - The firestore data for the user.
 *
 * @property `id` The id of the user.
 * @property `docRef` The document reference for the user.
 * @property `avatar` The avatar of the user.
 * @property `name` The name of the user.
 * @property `lastName` The last name of the user.
 * @property `email` The email of the user.
 * @property `phoneNumber` The phone number of the user.
 * @property `userDocuments` The documents uploaded by the user. A record of the document id and the storage path.
 * @property `birthDate` The birth date of the user. (We don't need to use this, but it's here for future use.)
 * @property `customerId` The Stripe customer id of the user in case they have or have had a subscription to cuttinboard.
 * @property `subscriptionId` The subscription id of the user in case they have a subscription to the owner plan.
 * @property `paymentMethods` The payment methods of the user. This is an array of payment method ids from Stripe.
 * @property `organizations` The organizations the user is a part of. This is an array of organization ids.
 * @property `preferredName` The preferred name of the user. This is used for contact purposes and is not required.
 * @property `emergencyContact` The emergency contact of the user. This is used for contact purposes and is not required.
 * @property `contactComments` The contact comments of the user. This is used for contact purposes and is not required.
 */
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

  public static Converter: FirestoreDataConverter<CuttinboardUser> = {
    toFirestore(object: CuttinboardUser): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ICuttinboardUser>,
      options: SnapshotOptions
    ): CuttinboardUser {
      const { id, ref } = value;
      const data = value.data(options);
      return new CuttinboardUser(data, { id, docRef: ref });
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
