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
 * Emergency Contact is an additional contact that can be added to a user's profile.
 * - This is used to notify a user's emergency contact in the event of an emergency.
 */
export type EmergencyContact = {
  name?: string;
  phoneNumber: string;
};

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
  emergencyContact?: EmergencyContact;
  contactComments?: string;
}

/**
 * A CuttinboardUser is the base user model for Cuttinboard.
 */
export class CuttinboardUser implements ICuttinboardUser, PrimaryFirestore {
  /**
   * The id of the user.
   */
  public readonly id: string;
  /**
   * The document reference for the user.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The avatar of the user.
   */
  public readonly avatar?: string;
  /**
   * The name of the user.
   */
  public readonly name: string;
  /**
   * The last name of the user.
   */
  public readonly lastName: string;
  /**
   * The email of the user.
   */
  public readonly email: string;
  /**
   * The phone number of the user.
   */
  public readonly phoneNumber?: string;
  /**
   * The documents uploaded by the user. A record of the document id and the storage path.
   */
  public readonly userDocuments?: Record<string, string>;
  /**
   * The birth date of the user. (We don't need to use this, but it's here for future use.)
   */
  public readonly birthDate?: Timestamp;
  /**
   * The Stripe customer id of the user in case they have or have had a subscription to cuttinboard.
   */
  public readonly customerId?: string;
  /**
   * The subscription id of the user in case they have a subscription to the owner plan.
   */
  public readonly subscriptionId?: string;
  /**
   * The payment methods of the user. This is an array of payment method ids from Stripe.
   */
  public readonly paymentMethods?: string[];
  /**
   * The organizations the user is a part of. This is an array of organization ids.
   */
  public readonly organizations?: string[];
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
   * Converts a QueryDocumentSnapshot to a CuttinboardUser from the firestore database.
   */
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

  /**
   * Creates a new instance of the CuttinboardUser class.
   * @param data The data to create the CuttinboardUser with.
   * @param firestoreBase (id, docRef) - The firestore data for the user.
   */
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
