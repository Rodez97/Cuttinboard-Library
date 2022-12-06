import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { AUTH, FIRESTORE } from "../utils/firebase";

/**
 * Hook for deleting a user's account.
 *
 * @returns An object with a `deleteAccount` function for deleting the user's
 * account, a `deleting` boolean indicating the status of the delete operation,
 * and an `error` property that will be non-null if the delete operation fails.
 */
export const useDeleteAccount = (): {
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
    if (!AUTH.currentUser || !AUTH.currentUser.email) {
      throw new Error("There is no user logged in");
    }

    try {
      setDeleting(true);
      setError(null);
      // Check if user is the owner of an organization
      const org = await getDoc(
        doc(FIRESTORE, "Organizations", AUTH.currentUser.uid)
      );
      if (org.exists()) {
        throw new Error(
          "You can't delete your account because you are an Owner."
        );
      }
      const credential = EmailAuthProvider.credential(
        AUTH.currentUser.email,
        password
      );
      await reauthenticateWithCredential(AUTH.currentUser, credential);
      await deleteUser(AUTH.currentUser);
    } catch (error) {
      setError(error);
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAccount, deleting, error };
};
