import { RegisterProps } from "@cuttinboard-solutions/types-helpers";
import {
  AuthError,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useCallback, useState } from "react";
import { AUTH, FUNCTIONS } from "../utils/firebase";

/**
 * Custom Hook for registering a new user with email and password, and signing them in upon successful registration.
 *
 * @returns An object with a `registerUser` function for registering the user, a `isSubmitting` boolean indicating if the registration process is ongoing, and an `error` property containing any error details that occurred during the registration process.
 */
export const useRegister = (): {
  registerUser: (registerData: RegisterProps) => Promise<User>;
  isSubmitting: boolean;
  error: Error | AuthError | undefined;
} => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | AuthError | undefined>();

  const registerUser = useCallback(
    async (registerData: RegisterProps): Promise<User> => {
      try {
        setIsSubmitting(true);
        const registerUserFunction = httpsCallable<RegisterProps, string>(
          FUNCTIONS,
          "auth-registerUser"
        );
        await registerUserFunction(registerData);

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
    },
    []
  );

  return { registerUser, isSubmitting, error };
};
