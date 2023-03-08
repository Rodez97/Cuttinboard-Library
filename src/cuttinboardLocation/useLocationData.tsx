import { collection, doc } from "firebase/firestore";
import { useCallback, useEffect } from "react";
import { collectionData, docData } from "rxfire/firestore";
import { map } from "rxjs";
import { FIRESTORE } from "../utils";
import {
  setLocationError,
  startLocationLoading,
  upsertLocation,
} from "./cuttinboardLocation.slice";
import { useAppDispatch } from "../reduxStore/utils";
import { employeeConverter, setEmployees } from "../employee";
import { useCuttinboard } from "../cuttinboard";
import {
  IEmployee,
  ILocation,
  IOrganizationKey,
} from "@cuttinboard-solutions/types-helpers";
import { locationConverter } from "./Location";

export function useLocationData(organizationKey: IOrganizationKey) {
  const { onError } = useCuttinboard();
  const dispatch = useAppDispatch();

  const handleError = useCallback(
    (err: Error) => {
      dispatch(setEmployees([]));
      dispatch(setLocationError(err.message));
      onError(err);
    },
    [dispatch, onError]
  );

  const handleLocationData = useCallback(
    (location: ILocation) => dispatch(upsertLocation(location)),
    [dispatch]
  );

  const handleEmployeeData = useCallback(
    (employees: IEmployee[]) => dispatch(setEmployees(employees)),
    [dispatch]
  );

  useEffect(() => {
    // Start loading
    dispatch(startLocationLoading("pending"));

    const location$ = docData(
      doc(FIRESTORE, "Locations", organizationKey.locId).withConverter(
        locationConverter
      )
    );

    const employees$ = collectionData(
      collection(
        FIRESTORE,
        "Locations",
        organizationKey.locId,
        "employees"
      ).withConverter(employeeConverter)
    );

    const locationSubscription = location$
      .pipe(
        map((location) => {
          if (!location) {
            throw new Error("Location document not found in Firestore");
          } else {
            return location;
          }
        })
      )
      .subscribe({
        next: handleLocationData,
        error: handleError,
      });

    const employeesSubscription = employees$.subscribe({
      next: handleEmployeeData,
      error: handleError,
    });

    locationSubscription.add(employeesSubscription);

    return () => {
      locationSubscription.unsubscribe();
    };
  }, [
    organizationKey,
    dispatch,
    handleLocationData,
    handleEmployeeData,
    handleError,
  ]);
}
