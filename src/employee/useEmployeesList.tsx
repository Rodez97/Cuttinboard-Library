import { groupBy, orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useCallback, useMemo } from "react";
import { useCuttinboardLocation } from "../services/useCuttinboardLocation";
import { RoleAccessLevels } from "../utils";
import { Employee } from "./Employee";

/**
 * The `useEmployeesList` hook returns the context provided by the
 * `EmployeesProvider` component. It should be used within a component
 * that is a descendant of the `EmployeesProvider` component.
 *
 * If the `EmployeesProvider` is not present in the component tree, this
 * hook will throw an error.
 */
export const useEmployeesList = () => {
  const { employees } = useCuttinboardLocation();

  const getEmployeeById = useMemo(
    () => (id: string) =>
      employees ? employees.find((employee) => employee.id === id) : undefined,
    [employees]
  );

  const getEmployeesByRole = useCallback(
    (searchText: string, position: string | null) => {
      if (!employees) return [];

      const groupedByRole = groupBy(employees, (e) => e.locationRole);

      const finalAfterQuery = Object.entries(groupedByRole).reduce<
        Record<RoleAccessLevels, Employee[]>
      >(
        (acc, [role, employees]) => {
          // Filter by name by searchText
          const filtered = searchText
            ? matchSorter(employees, searchText, {
                keys: [(e) => e.fullName],
              })
            : employees;
          const byPos = position
            ? matchSorter(filtered, position, {
                keys: [(e) => e.positions],
              })
            : filtered;
          const parsedRole: RoleAccessLevels = parseInt(role);
          acc[parsedRole] = orderBy(byPos, ["locationRole", "fullName"]);

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

  return {
    getEmployees: employees,
    getEmployeeById,
    getEmployeesByRole,
  };
};
