import { useCallback } from "react";
import { matchSorter } from "match-sorter";
import { getEmployeeFullName } from "@cuttinboard-solutions/types-helpers";
import {
  EmployeeLocationInfo,
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { useCuttinboard } from "../cuttinboard";
import { deleteField, doc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { employeesDocumentConverter } from "./Employee";
import { groupBy, orderBy } from "lodash-es";

export function useEmployees() {
  const { onError } = useCuttinboard();
  const { location, employees } = useCuttinboardLocation();

  const deleteEmployee = useCallback(
    async (employee: IEmployee) => {
      const docRef = doc(
        FIRESTORE,
        "Locations",
        location.id,
        "employees",
        "employeesDocument"
      ).withConverter(employeesDocumentConverter);
      try {
        await setDoc(
          docRef,
          {
            employees: {
              [employee.id]: deleteField(),
            },
          },
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError]
  );

  const updateEmployee = useCallback(
    async (
      employee: IEmployee,
      locationUpdates: Partial<EmployeeLocationInfo>
    ) => {
      // Update the employee on the server
      const docRef = doc(
        FIRESTORE,
        "Locations",
        location.id,
        "employees",
        "employeesDocument"
      ).withConverter(employeesDocumentConverter);

      const updatedEmployee = { ...employee, ...locationUpdates };

      try {
        await setDoc(
          docRef,
          {
            employees: {
              [employee.id]: updatedEmployee,
            },
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError]
  );

  const getEmployeesByRole = useCallback(
    (searchText: string | null, position: string | null) => {
      if (!employees) return [];

      const groupedByRole = groupBy(employees, (e) => e.role);

      const finalAfterQuery = Object.entries(groupedByRole).reduce<
        Record<RoleAccessLevels, IEmployee[]>
      >(
        (acc, [role, employees]) => {
          // Filter by name by searchText
          const filtered = searchText
            ? matchSorter(employees, searchText, {
                keys: [getEmployeeFullName],
              })
            : employees;
          const byPos = position
            ? matchSorter(filtered, position, {
                keys: ["positions"],
              })
            : filtered;
          const parsedRole: RoleAccessLevels = parseInt(role);
          acc[parsedRole] = orderBy(byPos, ["role", getEmployeeFullName]);
          return acc;
        },
        {
          [RoleAccessLevels.OWNER]: [],
          [RoleAccessLevels.ADMIN]: [],
          [RoleAccessLevels.GENERAL_MANAGER]: [],
          [RoleAccessLevels.MANAGER]: [],
          [RoleAccessLevels.STAFF]: [],
        }
      );

      return Object.entries(finalAfterQuery);
    },
    [employees]
  );

  const getEmployeeById = useCallback(
    (id: string) => {
      return employees?.find((e) => e.id === id);
    },
    [employees]
  );

  return {
    deleteEmployee,
    updateEmployee,
    getEmployeesByRole,
    getEmployeeById,
    employees,
  };
}
