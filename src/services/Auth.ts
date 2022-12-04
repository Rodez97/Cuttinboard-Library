import {
  AuthError,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { isEmpty } from "lodash";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Auth, Firestore, Functions } from "../firebase";

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
 * This is a custom Hook for registering a new user with email and password. If the user is successfully created, the user will be signed in.
 */
export const useRegisterUser = (): {
  /**
   * A function for registering a new user with the provided registerData. The function returns a promise that resolves with the user's credentials, if the registration is successful.
   * @param {RegisterProps} registerData - The data to register the user with.
   * @returns {Promise<UserCredential | undefined>} - The user credential of the newly created user.
   */
  registerUser: (
    registerData: RegisterProps
  ) => Promise<UserCredential | undefined>;
  /**
   * A boolean indicating whether the register operation is currently in progress.
   */
  submitting: boolean;
  /**
   * An error object containing details about any error that occurred during the register operation.
   */
  error: Error | AuthError | undefined;
  /**
   * An object containing the user's credentials, if the register operation was successful.
   */
  user: UserCredential | undefined;
} => {
  const [registerCuttinboardUser, isSubmitting, signUpError] = useHttpsCallable<
    RegisterProps,
    string
  >(Functions, "auth-registerUser");
  const [signIn, user, loginLoading, loginError] =
    useSignInWithEmailAndPassword(Auth);

  const registerUser = async (
    registerData: RegisterProps
  ): Promise<UserCredential | undefined> => {
    await registerCuttinboardUser(registerData);
    return signIn(registerData.email, registerData.password);
  };

  return {
    registerUser,
    submitting: Boolean(isSubmitting || loginLoading),
    error: signUpError ?? loginError,
    user,
  };
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
 * This code defines a custom Hook named useUpdateCuttinboardAccount that provides a function updateUserProfile that updates a user's profile and contact information in a database. The Hook also provides state variables updating and error that can be used to track the submission status and any errors that occurred during the update process.
 */
export const useUpdateCuttinboardAccount = (): {
  /**
   * Update the user's profile and contact information.
   * @param profileUpdate The user's profile information.
   * @param contactUpdate The user's contact information.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateUserProfile: (
    newProfileData: ProfileUpdate | null,
    newContactData: ContactUpdate | null
  ) => Promise<void>;
  /**
   * The submission status of the update operation.
   */
  updating: boolean;
  /**
   * If the update operation failed, this will contain the error details.
   */
  error: Error | null;
} => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateUserProfile = async (
    newProfileData: ProfileUpdate | null,
    newContactData: Partial<ContactUpdate> | null
  ) => {
    if (isEmpty(newProfileData) && isEmpty(newContactData)) {
      setError(new Error("No data to update."));
      return;
    }
    if (!Auth.currentUser) {
      setError(new Error("No user is currently signed in."));
      return;
    }

    try {
      setUpdating(true);
      if (newProfileData) {
        const { name, lastName, avatar } = newProfileData;
        const fullName = `${name} ${lastName}`;

        const updates: { displayName?: string; photoURL?: string } = {};

        if (fullName !== Auth.currentUser.displayName) {
          // If the user's name has changed, update the display name.
          updates.displayName = fullName;
        }

        if (avatar !== Auth.currentUser.photoURL) {
          // If the user's avatar has changed, update the photo URL.
          updates.photoURL = avatar;
        }

        if (!isEmpty(updates)) {
          // If there are any updates to the user's profile, update them.
          await updateProfile(Auth.currentUser, updates);
        }
      }

      // Update the user's contact information.
      await setDoc(
        doc(Firestore, "Users", Auth.currentUser.uid),
        { ...newProfileData, ...newContactData },
        { merge: true }
      );
    } catch (error) {
      setError(error);
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateUserProfile,
    updating,
    error,
  };
};

/**
 * Hook for deleting a user's account.
 *
 * @returns An object with a `deleteAccount` function for deleting the user's
 * account, a `deleting` boolean indicating the status of the delete operation,
 * and an `error` property that will be non-null if the delete operation fails.
 */
export const useDeleteCuttinboardAccount = (): {
  /**
   * Delete the current user's account.
   * - If the user is successfully deleted, the user will be signed out.
   * - We need to reauthenticate the user before deleting the account to prevent unauthorized deletion.
   * @param password The user's password.
   * @returns {Promise<void>} A promise that resolves when the account is deleted.
   */
  deleteAccount: (password: string) => Promise<void>;
  /**
   * The submission status of the delete operation.
   */
  deleting: boolean;
  /**
   * If the delete operation failed, this will contain the error details.
   */
  error: Error | null;
} => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAccount = async (password: string) => {
    if (!Auth.currentUser || !Auth.currentUser.email) {
      throw new Error("There is no user logged in");
    }

    try {
      setDeleting(true);
      setError(null);
      // Check if user is the owner of an organization
      const org = await getDoc(
        doc(Firestore, "Organizations", Auth.currentUser.uid)
      );
      if (org.exists()) {
        throw new Error(
          "You can't delete your account because you are an Owner."
        );
      }
      const credential = EmailAuthProvider.credential(
        Auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(Auth.currentUser, credential);
      await deleteUser(Auth.currentUser);
    } catch (error) {
      setError(error);
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAccount, deleting, error };
};
