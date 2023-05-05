import { doc } from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";
import {
  IEmployee,
  IEmployeesDocument,
  ILocation,
  IOrganizationKey,
  getEmployeeFullName,
} from "@cuttinboard-solutions/types-helpers";
import { locationConverter } from "./Location";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import { employeesDocumentConverter } from "../employee/Employee";
import { listReducer } from "../utils/listReducer";
import { docData } from "rxfire/firestore";
import { defaultIfEmpty, map, merge } from "rxjs";

const employeesSorter = (a: IEmployee, b: IEmployee): number => {
  const aRole = a.role;
  const aFullName = getEmployeeFullName(a);
  const bRole = b.role;
  const bFullName = getEmployeeFullName(b);
  if (aRole !== bRole) {
    return Number(aRole) - Number(bRole);
  }
  return aFullName.localeCompare(bFullName);
};

type DataEvent =
  | (
      | { type: "location"; data: ILocation }
      | { type: "employees"; data: IEmployee[] }
    )
  | null;

export function useLocationData(organizationKey: IOrganizationKey) {
  const { onError } = useCuttinboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [location, setLocation] = useState<ILocation>();
  const [employees, employeesDispatch] = useReducer(
    listReducer<IEmployee>("id", employeesSorter),
    []
  );

  useEffect(() => {
    // Start loading
    setLoading(true);

    const location$ = docData(
      doc(FIRESTORE, "Locations", organizationKey.locId).withConverter(
        locationConverter
      )
    ).pipe(
      map<ILocation | undefined, DataEvent>((data) => {
        if (!data) {
          throw new Error("Location not found");
        }
        return {
          type: "location",
          data,
        };
      }),
      defaultIfEmpty(null)
    );

    const employees$ = docData(
      doc(
        FIRESTORE,
        "Locations",
        organizationKey.locId,
        "employees",
        "employeesDocument"
      ).withConverter(employeesDocumentConverter)
    ).pipe(
      map<IEmployeesDocument | undefined, DataEvent>((data) => {
        return {
          type: "employees",
          data: data?.employees ? Object.values(data.employees) : [],
        };
      }),
      defaultIfEmpty(null)
    );

    const subscription = merge(location$, employees$).subscribe({
      next: (event) => {
        setLoading(false);
        if (!event) {
          return;
        }
        switch (event.type) {
          case "location":
            setLocation(event.data);
            break;
          case "employees":
            employeesDispatch({
              type: "SET_ELEMENTS",
              payload: event.data,
            });
            break;
        }
      },
      error: (err) => {
        setError(err);
        onError(err);
        setLoading(false);
        setLocation(undefined);
        employeesDispatch({
          type: "CLEAR",
        });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [organizationKey, onError]);

  return {
    loading,
    error,
    location,
    employees,
    setLocation,
    employeesDispatch,
  };
}
