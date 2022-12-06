import { AuthError, UserCredential } from "firebase/auth";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { AUTH, FUNCTIONS } from "../utils/firebase";
import { RegisterProps } from "./types";

/**
 * This is a custom Hook for registering a new user with email and password. If the user is successfully created, the user will be signed in.
 */
export const useRegister = (): {
  /**
   * A function for registering a new user with the provided registerData. The function returns a promise that resolves with the user's credentials, if the registration is successful.
   * @param {RegisterProps} registerData - The data to register the user with.
   * @returns {Promise<UserCredential | undefined>} - The user credential of the newly created user.
   */
  registerUser: (
    registerData: RegisterProps
  ) => Promise<UserCredential | undefined>;
  /**
   * A boolean indicating whether the register operation is currently in progress.
   */
  submitting: boolean;
  /**
   * An error object containing details about any error that occurred during the register operation.
   */
  error: Error | AuthError | undefined;
  /**
   * An object containing the user's credentials, if the register operation was successful.
   */
  user: UserCredential | undefined;
} => {
  const [registerCuttinboardUser, isSubmitting, signUpError] = useHttpsCallable<
    RegisterProps,
    string
  >(FUNCTIONS, "auth-registerUser");
  const [signIn, user, loginLoading, loginError] =
    useSignInWithEmailAndPassword(AUTH);

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
