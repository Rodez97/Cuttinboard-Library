import { useCallback } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { useCuttinboard } from "../cuttinboard";
import { IEmployee } from "@cuttinboard-solutions/types-helpers";
import { cuttinboardUserConverter } from "../account";

/**
 * Hook to find a recipient among the employees in a Firestore database.
 * @returns - A function that takes an email and optional locationId as arguments and returns the employee object.
 * @throws {Error} - If no eligible user is found.
 */
export function useFindDMRecipient(employees?: IEmployee[]) {
  const { user } = useCuttinboard();

  /**
   * Find a recipient among the employees.
   * @param {string} email - The email of the recipient.
   * @param {string} locationId - The optional locationId of the recipient.
   * @returns {Object} - The employee object.
   * @throws {Error} - If no eligible user is found.
   */
  const findRecipient = useCallback(
    async (rawEmail: string, locationId?: string) => {
      const email = rawEmail.toLowerCase().trim();

      if (locationId && employees) {
        // Check if the user is an employee
        const employee = employees.find((e) => e.email === email);

        if (employee) {
          return employee;
        }
      }

      // Get current user's document
      const myDocument = doc(FIRESTORE, "Users", user.uid).withConverter(
        cuttinboardUserConverter
      );

      const myDocumentSnapshot = await getDoc(myDocument);

      if (!myDocumentSnapshot.exists()) {
        throw new Error("You are not a user in our database.");
      }

      const myData = myDocumentSnapshot.data();

      const { organizations } = myData;

      if (!organizations) {
        throw new Error("You are not an employee of any organization.");
      }

      const recipientDocRef = query(
        collection(FIRESTORE, "Users"),
        where("email", "==", email),
        where("organizations", "array-contains-any", organizations)
      ).withConverter(cuttinboardUserConverter);
      const getRecipientDocument = await getDocs(recipientDocRef);

      if (getRecipientDocument.size === 0) {
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
    [employees, user.uid]
  );

  return findRecipient;
}
