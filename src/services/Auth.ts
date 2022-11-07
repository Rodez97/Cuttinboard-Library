import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
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

export const useRegisterUser = () => {
  const [registerCuttinboardUser, isSubmitting, signUpError] = useHttpsCallable<
    RegisterProps,
    string
  >(Functions, "auth-registerUser");
  const [signIn, user, loginLoading, loginError] =
    useSignInWithEmailAndPassword(Auth);

  /**
   * - Registrar al usuario en Firebase Auth
   * - Crear su documento de información en Firestore
   * @param {RegisterProps} registerData Correo electrónico
   */
  const registerUser = async (registerData: RegisterProps) => {
    try {
      await registerCuttinboardUser(registerData);
      await signIn(registerData.email, registerData.password);
    } catch (error) {
      throw error;
    }
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
  phoneNumber: string;
  preferredName: string;
  emergencyContact?: { name?: string; phoneNumber: string };
  contactComments: string;
};

/**
 * Hook que nos permite gestionar y ejecutar operaciones de autentificación del usuario
 */
export const useUpdateCuttinboardAccount = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error>(null);
  /**
   * Actualizar la información del usuario
   * @param {ProfileUpdate} newProfileData Nuevos datos a actualizar en el usuario
   */
  const updateUserProfile = async (
    newProfileData: ProfileUpdate | null,
    newContactData: Partial<ContactUpdate> | null
  ) => {
    setUpdating(true);
    try {
      if (newProfileData) {
        const { name, lastName, avatar } = newProfileData;
        const fullName = `${name} ${lastName}`;

        const updates: { displayName?: string; photoURL?: string } = {};

        if (fullName !== Auth.currentUser.displayName) {
          updates.displayName = fullName;
        }

        if (avatar !== Auth.currentUser.photoURL) {
          updates.photoURL = avatar;
        }

        if (!isEmpty(updates)) {
          await updateProfile(Auth.currentUser, updates);
        }
      }

      await setDoc(
        doc(Firestore, "Users", Auth.currentUser.uid),
        { ...newProfileData, ...newContactData },
        { merge: true }
      );
    } catch (error) {
      setError(error);
    }
    setUpdating(false);
  };

  return {
    updateUserProfile,
    updating,
    error,
  };
};

export const useDeleteCuttinboardAccount = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error>(null);

  const deleteAccount = async (password: string) => {
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
