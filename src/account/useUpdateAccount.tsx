import {
  ContactUpdate,
  ProfileUpdate,
} from "@cuttinboard-solutions/types-helpers";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { isEmpty } from "lodash";
import { useState } from "react";
import { AUTH, FIRESTORE } from "../utils/firebase";

export const useUpdateAccount = (): {
  updateUserProfile: (
    newProfileData: ProfileUpdate | null,
    newContactData: Partial<ContactUpdate> | null
  ) => Promise<void>;
  updating: boolean;
  error: Error | null;
} => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateUserProfile = async (
    newProfileData: ProfileUpdate | null,
    newContactData: Partial<ContactUpdate> | null
  ) => {
    // Handle invalid input data
    if (isEmpty(newProfileData) && isEmpty(newContactData)) {
      setError(new Error("No data to update."));
      return;
    }
    // Check if user is signed in
    if (!AUTH.currentUser) {
      setError(new Error("No user is currently signed in."));
      return;
    }

    try {
      setUpdating(true);
      // Update user's profile information
      if (newProfileData) {
        const { name, lastName, avatar } = newProfileData;
        const fullName = `${name} ${lastName}`;
        const updates: { displayName?: string; photoURL?: string } = {};

        if (fullName !== AUTH.currentUser.displayName) {
          updates.displayName = fullName;
        }

        if (avatar !== AUTH.currentUser.photoURL) {
          updates.photoURL = avatar;
        }

        if (!isEmpty(updates)) {
          await updateProfile(AUTH.currentUser, updates);
        }
      }
      // Update user's contact information
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
