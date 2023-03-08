import { RegisterProps } from "@cuttinboard-solutions/types-helpers/dist/account";
import {
  AuthError,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { AUTH, FUNCTIONS } from "../utils/firebase";

/**
 * This is a custom Hook for registering a new user with email and password. If the user is successfully created, the user will be signed in.
 */
export const useRegister = (): {
  /**
   * A function for registering a new user with the provided registerData. The function returns a promise that resolves with the user's credentials, if the registration is successful.
   * @param {RegisterProps} registerData - The data to register the user with.
   * @returns {Promise<User>} - The user credential of the newly created user.
   */
  registerUser: (registerData: RegisterProps) => Promise<User>;
  /**
   * A boolean indicating whether the register operation is currently in progress.
   */
  isSubmitting: boolean;
  /**
   * An error object containing details about any error that occurred during the register operation.
   */
  error: Error | AuthError | undefined;
} => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | AuthError | undefined>();

  const registerUser = async (registerData: RegisterProps): Promise<User> => {
    try {
      setIsSubmitting(true);
      const registerCuttinboardUser = httpsCallable<RegisterProps, string>(
        FUNCTIONS,
        "auth-registerUser"
      );
      await registerCuttinboardUser(registerData);
      const { user } = await signInWithEmailAndPassword(
        AUTH,
        registerData.email,
        registerData.password
      );
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    registerUser,
    isSubmitting,
    error,
  };
};
