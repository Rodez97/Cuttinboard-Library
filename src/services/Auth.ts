import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Auth, Firestore, Functions } from "../firebase";
import { CuttinboardError } from "./../models/CuttinboardError";

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
  const [signIn, loginLoading, loginError] =
    useSignInWithEmailAndPassword(Auth);

  /**
   * - Registrar al usuario en Firebase Auth
   * - Crear su documento de información en Firestore
   * @param {RegisterProps} registerData Correo electrónico
   */
  const registerUser = async (registerData: RegisterProps) => {
    try {
      const { data } = await registerCuttinboardUser(registerData);
      await signIn(registerData.email, registerData.password);
    } catch (error) {
      throw error;
    }
  };

  return {
    registerUser,
    submitting: Boolean(isSubmitting || loginLoading),
    error: signUpError ?? loginError,
  };
};

type ProfileUpdate = {
  name: string;
  lastName: string;
  birthDate: Timestamp;
  avatar: string;
};

/**
 * Hook que nos permite gestionar y ejecutar operaciones de autentificación del usuario
 */
export const useCuttinboardAuth = () => {
  /**
   * Actualizar la información del usuario
   * @param {ProfileUpdate} newProfileData Nuevos datos a actualizar en el usuario
   */
  const updateUserProfile = async (newProfileData: Partial<ProfileUpdate>) => {
    try {
      const { name, lastName, avatar } = newProfileData;
      const fullName = `${name} ${lastName}`;
      if (
        fullName !== Auth.currentUser.displayName ||
        avatar !== Auth.currentUser.photoURL
      ) {
        const updates: { displayName?: string; photoURL?: string } = {};
        if (fullName !== Auth.currentUser.displayName) {
          updates.displayName = fullName;
        }
        if (avatar !== Auth.currentUser.photoURL) {
          updates.photoURL = avatar;
        }
        await updateProfile(Auth.currentUser, updates);
      }
      await updateDoc(
        doc(Firestore, "Users", Auth.currentUser.uid),
        newProfileData
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      // Chack if have an organization
      const org = await getDoc(
        doc(Firestore, "Organizations", Auth.currentUser.uid)
      );
      if (org.exists()) {
        throw new CuttinboardError(
          "OWNER",
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
      throw error;
    }
  };

  return {
    updateUserProfile,
    deleteAccount,
  };
};
