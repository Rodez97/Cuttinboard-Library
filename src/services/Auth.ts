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
import { Auth, Firestore, Functions } from "../firebase";
import { CuttinboardError } from "./../models/CuttinboardError";

/**
 * Hook que nos permite gestionar y ejecutar operaciones de autentificación del usuario
 */
export const useCuttinboardAuth = () => {
  /**
   * - Registrar al usuario en Firebase Auth
   * - Enviar el email de verificación
   * - Crear su documento de información en Firestore
   * @param email Correo electrónico
   * @param password Contraseña
   * @param name Nombre
   * @param lastName Apellido
   * @returns Devuelve al nuevo usuario creado si la operación es satisfactoria
   */
  const registerUser = async (
    email: string,
    password: string,
    name: string,
    lastName: string
  ) => {
    try {
      const registerCuttinboardUser = httpsCallable<
        { email: string; password: string; name: string; lastName: string },
        string
      >(Functions, "auth-registerUser");
      await registerCuttinboardUser({
        email,
        name,
        lastName,
        password,
      });

      await signInWithEmailAndPassword(Auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Actualizar la información del usuario
   * @param newProfileData Nuevos datos a actualizar en el usuario
   */
  const updateUserProfile = async (newProfileData: {
    name?: string;
    lastName?: string;
    birthDate?: Timestamp;
    avatar?: string;
  }) => {
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

  const changePassword = async (password: string, newPassword: string) => {
    const credential = EmailAuthProvider.credential(
      Auth.currentUser.email,
      password
    );
    try {
      await reauthenticateWithCredential(Auth.currentUser, credential);
      await updatePassword(Auth.currentUser, newPassword);
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
    registerUser,
    updateUserProfile,
    changePassword,
    deleteAccount,
  };
};
