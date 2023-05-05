import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { AUTH, FIRESTORE } from "../utils/firebase";

interface DeleteAccountHook {
  deleteAccount: (password: string) => Promise<void>;
  deleting: boolean;
  error: Error | null;
}

export const useDeleteAccount = (): DeleteAccountHook => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAccount = useCallback(async (password: string) => {
    try {
      setDeleting(true);
      setError(null);

      const user = AUTH.currentUser;
      if (!user || !user.email) {
        throw new Error("No user logged in");
      }

      const org = await getDoc(doc(FIRESTORE, "Organizations", user.uid));
      if (org.exists()) {
        throw new Error("Can't delete account because user is an owner");
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
    } catch (error) {
      setError(error);
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteAccount, deleting, error };
};
