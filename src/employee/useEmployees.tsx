import { useCallback } from "react";
import {
  deleteEmployeeThunk,
  employeesSelectors,
  updateEmployeeThunk,
} from "./employees.slice";
import { selectLocation } from "../cuttinboardLocation/locationSelectors";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import { groupBy, orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import {
  EmployeeLocationInfo,
  getEmployeeFullName,
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

export function useEmployees() {
  const activeLocation = useAppSelector(selectLocation);
  if (!activeLocation) {
    throw new Error("No active location");
  }
  const thunkDispatch = useAppThunkDispatch();
  const employees = useAppSelector(employeesSelectors.selectAll);

  const deleteEmployee = useCallback(
    (employee: IEmployee) => {
      thunkDispatch(deleteEmployeeThunk(employee));
    },
    [thunkDispatch]
  );

  const updateEmployee = useCallback(
    (employee: IEmployee, locationUpdates: Partial<EmployeeLocationInfo>) => {
      thunkDispatch(updateEmployeeThunk(employee, locationUpdates));
    },
    [thunkDispatch]
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

  return {
    deleteEmployee,
    updateEmployee,
    getEmployeesByRole,
    employees,
  };
}
