import {
  ContactUpdate,
  ProfileUpdate,
} from "@cuttinboard-solutions/types-helpers/dist/account";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { isEmpty } from "lodash";
import { useState } from "react";
import { AUTH, FIRESTORE } from "../utils/firebase";

/**
 * This code defines a custom Hook named useUpdateCuttinboardAccount that provides a function updateUserProfile that updates a user's profile and contact information in a database. The Hook also provides state variables updating and error that can be used to track the submission status and any errors that occurred during the update process.
 */
export const useUpdateAccount = (): {
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
    if (!AUTH.currentUser) {
      setError(new Error("No user is currently signed in."));
      return;
    }

    try {
      setUpdating(true);
      if (newProfileData) {
        const { name, lastName, avatar } = newProfileData;
        const fullName = `${name} ${lastName}`;

        const updates: { displayName?: string; photoURL?: string } = {};

        if (fullName !== AUTH.currentUser.displayName) {
          // If the user's name has changed, update the display name.
          updates.displayName = fullName;
        }

        if (avatar !== AUTH.currentUser.photoURL) {
          // If the user's avatar has changed, update the photo URL.
          updates.photoURL = avatar;
        }

        if (!isEmpty(updates)) {
          // If there are any updates to the user's profile, update them.
          await updateProfile(AUTH.currentUser, updates);
        }
      }

      // Update the user's contact information.
      await setDoc(
        doc(FIRESTORE, "Users", AUTH.currentUser.uid),
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
