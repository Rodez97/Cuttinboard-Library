import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Functions } from "../firebase";
import { useHttpsCallable } from "react-firebase-hooks/functions";

export const useAddEmployee = () =>
  useHttpsCallable<
    {
      name: string;
      lastName: string;
      email: string;
      role: RoleAccessLevels | "employee";
      positions: string[];
      wagePerPosition: Record<string, number>;
      mainPosition: string;
      locationId: string;
    },
    {
      status: "ADDED" | "CREATED" | "ALREADY_MEMBER" | "CANT_ADD_ORG_EMP";
      employeeId: string;
    }
  >(Functions, "http-employees-create");
