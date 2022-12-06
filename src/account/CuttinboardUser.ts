import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { PrimaryFirestore } from "../models/PrimaryFirestore";
import { EmergencyContact } from "./types";

/**
 * The CuttinboardUser interface implemented by the CuttinboardUser class.
 */
export interface ICuttinboardUser {
  /**
   * The avatar of the user.
   */
  avatar?: string;

  /**
   * The first name of the user.
   */
  name: string;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * The email of the user.
   */
  email: string;

  /**
   * The phone number of the user.
   */
  phoneNumber?: string;

  /**
   * Documents related to the user.
   * - The key is the name of the document.
   * - The value is the URL to the document.
   */
  userDocuments?: Record<string, string>;

  /**
   * The birth date of the user.
   */
  birthDate?: Timestamp;

  /**
   * The ID of the customer associated with the user.
   */
  customerId?: string;

  /**
   * The ID of the subscription associated with the user.
   */
  subscriptionId?: string;

  /**
   * A list of payment methods associated with the user.
   */
  paymentMethods?: string[];

  /**
   * A list of organizations that the user belongs to.
   */
  organizations?: string[];

  /**
   * The preferred name of the user.
   */
  preferredName?: string;

  /**
   * The emergency contact information for the user.
   */
  emergencyContact?: EmergencyContact;

  /**
   * Comments about the user's contact information.
   */
  contactComments?: string;
}

/**
 * A CuttinboardUser is the base user model for Cuttinboard.
 */
export class CuttinboardUser implements ICuttinboardUser, PrimaryFirestore {
  /**
   * {@inheritDoc PrimaryFirestore.id}
   */
  public readonly id: string;
  /**
   * {@inheritDoc PrimaryFirestore.docRef}
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * {@inheritDoc ICuttinboardUser.avatar}
   */
  public readonly avatar?: string;
  /**
   * {@inheritDoc ICuttinboardUser.name}
   */
  public readonly name: string;
  /**
   * {@inheritDoc ICuttinboardUser.lastName}
   */
  public readonly lastName: string;
  /**
   * {@inheritDoc ICuttinboardUser.email}
   */
  public readonly email: string;
  /**
   * {@inheritDoc ICuttinboardUser.phoneNumber}
   */
  public readonly phoneNumber?: string;
  /**
   * {@inheritDoc ICuttinboardUser.userDocuments}
   */
  public readonly userDocuments?: Record<string, string>;
  /**
   * {@inheritDoc ICuttinboardUser.birthDate}
   */
  public readonly birthDate?: Timestamp;
  /**
   * {@inheritDoc ICuttinboardUser.customerId}
   */
  public readonly customerId?: string;
  /**
   * {@inheritDoc ICuttinboardUser.subscriptionId}
   */
  public readonly subscriptionId?: string;
  /**
   * {@inheritDoc ICuttinboardUser.paymentMethods}
   */
  public readonly paymentMethods?: string[];
  /**
   * {@inheritDoc ICuttinboardUser.organizations}
   */
  public readonly organizations?: string[];
  /**
   * {@inheritDoc ICuttinboardUser.preferredName}
   */
  public readonly preferredName?: string;
  /**
   * {@inheritDoc ICuttinboardUser.emergencyContact}
   */
  public readonly emergencyContact?: EmergencyContact;
  /**
   * {@inheritDoc ICuttinboardUser.contactComments}
   */
  public readonly contactComments?: string;

  public static firestoreConverter: FirestoreDataConverter<CuttinboardUser> = {
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
   * @param firestoreBase (id, docRef) - The Firestore data for the user.
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
