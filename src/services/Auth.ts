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

type RegisterProps = {
  name: string;
  lastName: string;
  email: string;
  password: string;
};

type useRegisterUserType = {
  /**
   * Register a new user with email and password.
   * - If the user is successfully created, the user will be signed in.
   * @param {RegisterProps} registerData - The data to register the user with.
   * @returns {Promise<UserCredential | undefined>} - The user credential of the newly created user.
   */
  registerUser: (
    registerData: RegisterProps
  ) => Promise<UserCredential | undefined>;
  /**
   * The submission status of the register operation.
   */
  submitting: boolean;
  /**
   * If the register operation failed, this will contain the error details.
   */
  error: Error | AuthError | undefined;
  /**
   * If the register operation succeeded, this will contain the user's credentials.
   */
  user: UserCredential | undefined;
};

/**
 * Register a new user with email and password.
 * - If the user is successfully created, the user will be signed in.
 * @returns {useRegisterUserType} - The register user hook.
 */
export const useRegisterUser = (): useRegisterUserType => {
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

type ProfileUpdate = {
  name: string;
  lastName: string;
  birthDate?: Timestamp;
  avatar?: string;
};

type ContactUpdate = {
  phoneNumber?: string;
  preferredName?: string;
  emergencyContact?: { name?: string; phoneNumber?: string };
  contactComments?: string;
};

type useUpdateCuttinboardAccountType = {
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
};

/**
 * Update the user's profile and contact information.
 * @returns {useUpdateCuttinboardAccountType} The update operation status and error.
 */
export const useUpdateCuttinboardAccount =
  (): useUpdateCuttinboardAccountType => {
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

type useDeleteCuttinboardAccountType = {
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
};

/**
 * Hook that will help us to delete the current user's account.
 * - If the user is successfully deleted, the user will be signed out.
 * - We need to reauthenticate the user before deleting the account to prevent unauthorized deletion.
 * #### For a user to be able to delete their account, they must not be OWNER or have any organization pending to be deleted.
 * @returns {useDeleteCuttinboardAccountType} The delete operation status and error.
 */
export const useDeleteCuttinboardAccount =
  (): useDeleteCuttinboardAccountType => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteAccount = async (password: string) => {
      if (!Auth.currentUser || !Auth.currentUser.email) {
        throw new Error("There is no user logged in");
      }
      setDeleting(true);
      setError(null);
      try {
        // Check if have an organization
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
      }
      setDeleting(false);
    };

    return { deleteAccount, deleting, error };
  };
