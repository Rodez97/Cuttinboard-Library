import { Timestamp } from "firebase/firestore";
import { RoleAccessLevels } from "../utils";
import { ICuttinboardUser } from "./CuttinboardUser";

/**
 * Emergency Contact is an additional contact that can be added to a user's profile.
 * - This is used to notify a user's emergency contact in the event of an emergency.
 */
export type EmergencyContact = {
  name?: string;
  phoneNumber: string;
};

/**
 * The role of the employee in the organization.
 * - "OWNER" Employees have full access to the organization and all of its locations.
 * - "ADMIN" Employees have full access to all the locations they are supervisors of.
 * - "employee" => The rest of the roles are always linked to specific locations, so they are location level employees.
 */
export type OrganizationRole =
  | RoleAccessLevels.ADMIN
  | RoleAccessLevels.OWNER
  | "employee";

/**
 * Data used to register a new user.
 */
export type RegisterProps = {
  /**
   * The user's first name.
   */
  name: string;
  /**
   * The user's last name.
   */
  lastName: string;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's password.
   */
  password: string;
};

/**
 * An object representing a user's profile information.
 */
export type ProfileUpdate = {
  /**
   * The user's first name.
   */
  name: string;
  /**
   * The user's last name.
   */
  lastName: string;
  /**
   * The user's birth date.
   */
  birthDate?: Timestamp;
  /**
   * The URL of the user's avatar.
   */
  avatar?: string;
};

/**
 * An object representing a user's contact information.
 */
export type ContactUpdate = {
  /**
   * The user's phone number.
   */
  phoneNumber?: string;
  /**
   * The user's preferred name.
   */
  preferredName?: string;
  /**
   * The user's emergency contact information.
   */
  emergencyContact?: {
    /**
     * The emergency contact's name.
     */
    name?: string;
    /**
     * The emergency contact's phone number.
     */
    phoneNumber?: string;
  };
  /**
   * Additional comments about the user's contact information.
   */
  contactComments?: string;
};

/**
 * The base public user type.
 */
export type BaseUser = Omit<
  ICuttinboardUser,
  "customerId" | "subscriptionId" | "paymentMethods" | "organizations"
>;
