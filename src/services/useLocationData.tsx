import { collection, doc, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { collectionData, docData } from "rxfire/firestore";
import { combineLatest, of, switchMap, tap } from "rxjs";
import { Location } from "../models";
import { FIRESTORE } from "../utils";
import { Employee } from "../employee/Employee";

export function useLocationData(
  locationId: string,
  options: {
    onLocationLoaded: (location: Location) => void;
  }
) {
  const [location, setLocation] = useState<Location | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const location$ = docData(
      doc(FIRESTORE, "Locations", locationId).withConverter(
        Location.firestoreConverter
      )
    ).pipe(
      switchMap((location) => {
        if (location) {
          return combineLatest([
            of(location).pipe(tap(options.onLocationLoaded)),
            collectionData(
              query(
                collection(
                  FIRESTORE,
                  "Organizations",
                  location.organizationId,
                  "employees"
                ).withConverter(Employee.firestoreConverter),
                where("locationsList", "array-contains", location.id)
              )
            ),
          ]);
        } else {
          setLocation(null);
          setEmployees([]);
          return of(null);
        }
      })
    );

    const subscription = location$.subscribe({
      next: (subData) => {
        if (!subData) {
          setLocation(null);
          setEmployees([]);
          return;
        }

        const [location, employees] = subData;
        setLocation(location);
        setEmployees(employees ?? []);

        globalThis.locationData = {
          ...globalThis.locationData,
          name: location.name,
        };

        if (loading) {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locationId]);

  return {
    location,
    employees,
    loading,
    error,
  };
}
