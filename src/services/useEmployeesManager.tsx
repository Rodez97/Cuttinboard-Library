import { deleteField, doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Employee } from "../models/Employee";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Firestore, Functions } from "../firebase";
import { useCuttinboard } from "./Cuttinboard";
import { useLocation } from "./Location";

/**
 * Hook encargado de gestionar los miembros/empleados de la locación
 * - Añadir / quitar / editar empleados (Información relativa a la locación)
 * - Hacer que el owner sea parte o no de la plantilla
 */
export function useEmployeesManager() {
  const { user } = useCuttinboard();
  const { location } = useLocation();

  const addEmployee = async (employee: {
    name: string;
    lastName: string;
    email: string;
    role: RoleAccessLevels | "employee";
    positions: string[];
    wagePerPosition: {};
    mainPosition: string;
  }): Promise<{
    status: "ADDED" | "CREATED" | "ALREADY_MEMBER";
    employeeId: string;
  }> => {
    try {
      const AddEmployee = httpsCallable<
        {
          name: string;
          lastName: string;
          email: string;
          role: RoleAccessLevels | "employee";
          positions: string[];
          wagePerPosition: {};
          mainPosition: string;
          locationId: string;
        },
        {
          status: "ADDED" | "CREATED" | "ALREADY_MEMBER";
          employeeId: string;
        }
      >(Functions, "http-employees-create");
      const { data } = await AddEmployee({
        locationId: location.id,
        ...employee,
      });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeEmployee = async (employee: Employee) => {
    try {
      await employee.delete();
    } catch (error) {
      throw error;
    }
  };

  const addPrimaryOwnerAsGeneralManager = async () => {
    try {
      const empDocRef = doc(
        Firestore,
        "Organizations",
        location.organizationId,
        "employees",
        user.uid
      );

      await setDoc(
        empDocRef,
        {
          locations: {
            [location.id]: true,
          },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  };

  const removePrimaryOwnerAsEmployee = async () => {
    try {
      const empDocRef = doc(
        Firestore,
        "Organizations",
        location.organizationId,
        "employees",
        user.uid
      );

      await setDoc(
        empDocRef,
        { locations: { [location.id]: deleteField() } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  };

  const updateEmployee = async (
    employee: Employee,
    role?: RoleAccessLevels,
    pos?: string[]
  ) => {
    try {
      const empDocRef = doc(
        Firestore,
        "Organizations",
        location.organizationId,
        "employees",
        employee.id
      );

      await setDoc(
        empDocRef,
        { locations: { [location.id]: { role, pos } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  };

  return {
    addEmployee,
    removeEmployee,
    addPrimaryOwnerAsGeneralManager,
    removePrimaryOwnerAsEmployee,
    updateEmployee,
  };
}
