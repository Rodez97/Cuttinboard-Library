import { useEffect, useMemo, useState } from "react";
import { ScheduleDoc } from "./ScheduleDoc";
import { collectionData, docData } from "rxfire/firestore";
import { combineLatest, map } from "rxjs";
import { collection, doc, query, where } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { EmployeeShifts } from "./EmployeeShifts";
import { useCuttinboardLocation } from "../services";

type ScheduleDataListenerHook = [ScheduleDoc, EmployeeShifts[], boolean];

export function useScheduleData(weekId: string): ScheduleDataListenerHook {
  const { location } = useCuttinboardLocation();
  const [scheduleDocument, setScheduleDocument] = useState<ScheduleDoc>(() =>
    ScheduleDoc.createDefaultScheduleDoc(weekId)
  );
  const [employeeShiftsCollection, setEmployeeShiftsCollection] = useState<
    EmployeeShifts[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) setLoading(true);
    const scheduleDocumentRef = doc(
      FIRESTORE,
      "Locations",
      globalThis.locationData.id,
      "scheduleDocs",
      weekId
    ).withConverter(ScheduleDoc.firestoreConverter);
    const employeeShiftsCollectionRef = query(
      collection(FIRESTORE, "Locations", globalThis.locationData.id, "shifts"),
      where("weekId", "==", weekId)
    ).withConverter(EmployeeShifts.Converter);

    const scheduleDocument$ = docData(scheduleDocumentRef);
    const employeeShiftsCollection$ = collectionData(
      employeeShiftsCollectionRef
    ).pipe(
      map((empShifts) =>
        empShifts.map((empShift) => {
          if (!location.settings.schedule) {
            empShift.calculateWageData();
            return empShift;
          }
          if (location.settings.schedule.ot_week.enabled) {
            const { hours, multiplier } = location.settings.schedule.ot_week;
            empShift.calculateWageData({
              mode: "weekly",
              hoursLimit: hours,
              multiplier,
            });
            return empShift;
          } else if (location.settings.schedule.ot_day.enabled) {
            const { hours, multiplier } = location.settings.schedule.ot_day;
            empShift.calculateWageData({
              mode: "daily",
              hoursLimit: hours,
              multiplier,
            });
            return empShift;
          } else {
            empShift.calculateWageData();
            return empShift;
          }
        })
      )
    );

    const combined$ = combineLatest([
      scheduleDocument$,
      employeeShiftsCollection$,
    ]);

    const subscription = combined$.subscribe(
      ([scheduleDocument, employeeShiftsCollection]) => {
        loading && setLoading(false);
        setScheduleDocument(scheduleDocument);
        setEmployeeShiftsCollection(employeeShiftsCollection);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [weekId]);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<ScheduleDataListenerHook>(
    () => [scheduleDocument, employeeShiftsCollection, loading],
    [scheduleDocument, employeeShiftsCollection, loading]
  );

  return resArray;
}
