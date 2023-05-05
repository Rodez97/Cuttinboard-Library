import { useCallback } from "react";
import { employeeConverter } from "../employee";
import {
  collection,
  collectionGroup,
  getCountFromServer,
  getDocs,
  or,
  query,
  where,
} from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { useCuttinboard } from "../cuttinboard";
import { chunk } from "lodash";
import { IEmployee } from "@cuttinboard-solutions/types-helpers";
import { locationConverter } from "../cuttinboardLocation";
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

      const recipientDocRef = query(
        collection(FIRESTORE, "Users"),
        where("email", "==", email)
      ).withConverter(cuttinboardUserConverter);
      const getRecipientDocument = await getDocs(recipientDocRef);

      if (getRecipientDocument.size === 0) {
        throw new Error(
          "We could not find a user associated with this email in our database."
        );
      }

      const recipient = getRecipientDocument.docs[0].data();

      // Get all the Locations of the current user
      const myEmployeeLocationsQuery = query(
        collection(FIRESTORE, "Locations"),
        or(
          where("organizationId", "==", user.uid),
          where("members", "array-contains", user.uid)
        )
      ).withConverter(locationConverter);

      const myResolvedEmployeeLocations = await getDocs(
        myEmployeeLocationsQuery
      );

      if (myResolvedEmployeeLocations.size > 0) {
        const isCoworker = myResolvedEmployeeLocations.docs.some((doc) => {
          const locationData = doc.data();
          return (
            locationData.members?.includes(recipient.id) ||
            locationData.supervisors?.includes(recipient.id) ||
            locationData.organizationId === recipient.id
          );
        });

        if (isCoworker) {
          return recipient;
        }
      }

      const myEmployeeProfilesQuery = query(
        collectionGroup(FIRESTORE, "employees"),
        where("id", "==", user.uid)
      ).withConverter(employeeConverter);

      const myResolvedEmployeeProfiles = await getDocs(myEmployeeProfilesQuery);

      if (myResolvedEmployeeProfiles.size === 0) {
        throw new Error("You are not an employee of any organization.");
      }

      // Get unique organization ids
      const organizationsIds = myResolvedEmployeeProfiles.docs.map(
        (doc) => doc.data().organizationId
      );

      const chunksQueries = chunk(organizationsIds, 10).map(async (chunk) => {
        const q = query(
          collectionGroup(FIRESTORE, "employees"),
          where("id", "==", recipient.id),
          where("organizationId", "in", chunk)
        ).withConverter(employeeConverter);
        const result = await getCountFromServer(q);
        return result.data().count;
      });

      const resolvedQueries = await Promise.all(chunksQueries);

      const flattenedCount = resolvedQueries.reduce(
        (accCount, count) => accCount + count,
        0
      );

      if (flattenedCount > 0) {
        return recipient;
      }

      throw new Error("There is no eligible user associated with this email.");
    },
    [employees, user.uid]
  );

  return findRecipient;
}
