import { useCallback } from "react";
import { useCuttinboard } from "../cuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { RoleAccessLevels } from "@rodez97/types-helpers";
import { useEmployees } from "./useEmployees";

export function useLocationPermissions() {
  const { user } = useCuttinboard();
  const { role } = useCuttinboardLocation();
  const { getEmployeeById } = useEmployees();

  return useCallback(
    (permission: Permission) => {
      if (role === RoleAccessLevels.OWNER) return true;
      if (role === RoleAccessLevels.ADMIN) return true;
      const employeeProfile = getEmployeeById(user.uid);
      if (!employeeProfile) return false;
      if (role === RoleAccessLevels.GENERAL_MANAGER) return true;
      if (role === RoleAccessLevels.MANAGER) {
        switch (permission) {
          case "manageLocationPositions":
            return false;
          case "manageStaff":
            return Boolean(employeeProfile.permissions?.canManageStaff);
          case "manageStaffDocuments":
            return Boolean(
              employeeProfile.permissions?.canManageStaffDocuments
            );
          case "manageSchedule":
            return Boolean(employeeProfile.permissions?.canManageSchedule);
          case "manageScheduleSettings":
            return false;
          case "seeWages":
            return Boolean(employeeProfile.permissions?.canSeeWages);
          case "manageUtensils":
          case "reportUtensilChanges":
            return true;
          case "manageBoard":
            return false;
          case "manageBoardContent":
            return true;
          case "manageBoardMembers":
          case "manageMessageBoard":
            return false;
          case "manageTasks":
          case "manageRecurringTasks":
          case "manageDailyTasks":
            return true;
          default:
            return false;
        }
      }
    },
    [getEmployeeById, role, user.uid]
  );
}

export type Permission =
  | "manageLocationPositions"
  | "manageStaff"
  | "manageStaffDocuments"
  | "manageSchedule"
  | "manageScheduleSettings"
  | "seeWages"
  | "seeOthersManagersWages"
  | "manageUtensils"
  | "reportUtensilChanges"
  | "manageBoard"
  | "manageBoardContent"
  | "manageBoardMembers"
  | "manageMessageBoard"
  | "manageTasks"
  | "manageRecurringTasks"
  | "manageDailyTasks";
