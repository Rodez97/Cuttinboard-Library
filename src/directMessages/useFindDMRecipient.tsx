import { useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { IEmployee } from "@rodez97/types-helpers";
import { cuttinboardUserConverter } from "../account";

/**
 * Hook to find a recipient among the employees in a Firestore database.
 * @returns - A function that takes an email and optional locationId as arguments and returns the employee object.
 * @throws {Error} - If no eligible user is found.
 */
export function useFindDMRecipient(employees?: IEmployee[]) {
  /**
   * Find a recipient among the employees.
   * @param {string} email - The email of the recipient.
   * @returns {Object} - The employee object.
   * @throws {Error} - If no eligible user is found.
   */
  const findRecipient = useCallback(
    async (rawEmail: string) => {
      const email = rawEmail.toLowerCase().trim();

      if (employees) {
        // Check if the user is an employee
        const employee = employees.find((e) =>
          e.email.toLowerCase().includes(email)
        );

        if (employee) {
          return employee;
        }
      }

      const recipientDocRef = query(
        collection(FIRESTORE, "Users"),
        where("email", "==", email)
      ).withConverter(cuttinboardUserConverter);
      const getRecipientDocument = await getDocs(recipientDocRef);

      if (getRecipientDocument.empty) {
        throw new Error(
          "We could not find a user associated with this email in our database."
        );
      }

      const recipientData = getRecipientDocument.docs[0].data();

      if (recipientData) {
        return recipientData;
      }

      throw new Error("There is no eligible user associated with this email.");
    },
    [employees]
  );

  return findRecipient;
}
