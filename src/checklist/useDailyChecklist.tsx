import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useMemo, useRef } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useCuttinboard, useCuttinboardLocation } from "../services";
import { FIRESTORE, RoleAccessLevels } from "../utils";
import { ChecklistGroup } from "./ChecklistGroup";

export function useDailyChecklist() {
  // get the user object from the `useCuttinboard` hook
  const { user } = useCuttinboard();

  // get the location and location access key from the `useCuttinboardLocation` hook
  const { location, role } = useCuttinboardLocation();

  // create a reference to the location checklist document in Firestore
  const reference = useRef(
    doc(FIRESTORE, "Locations", location.id, "globals", "locationChecklist")
  );

  // get the checklist data, loading state, and error state using the `useDocumentData` hook
  const [checklistData, loading, error] = useDocumentData<ChecklistGroup>(
    reference.current.withConverter(ChecklistGroup.firestoreConverter),
    {
      initialValue: new ChecklistGroup(
        {
          locationId: location.id,
        },
        {
          id: location.id,
          docRef: reference.current,
        }
      ),
    }
  );

  // check if the user has permission to write to the checklist document
  const canWrite = useMemo(() => role <= RoleAccessLevels.MANAGER, [role]);

  // reset all tasks in the checklist
  const resetTasks = async () => {
    if (!checklistData || !canWrite) {
      return;
    }
    await checklistData.resetAllTasks();
  };

  // add a checklist to the location
  const addChecklist = async (id: string | number) => {
    if (checklistData) {
      await checklistData.addChecklist(id.toString());
    } else {
      // If we don't have a checklist, we're creating a new one
      await setDoc(reference.current, {
        checklists: {
          [id]: {
            name: `Checklist #1`,
            createdAt: serverTimestamp(),
            createdBy: user.uid,
            order: 1,
          },
        },
        locationId: location.id,
      });
    }
  };

  // get an array of checklists from the checklist data
  const checklistsArray = useMemo(() => {
    if (!checklistData) {
      return [];
    }
    return checklistData.checklistsArray;
  }, [checklistData]);

  // return the checklist data, loading and error states, canWrite value, and
  // the `resetTasks` and `addChecklist` functions, as well as the checklist array and reference
  return {
    checklistData,
    loading,
    error,
    canWrite,
    resetTasks,
    addChecklist,
    checklistsArray,
    ref: reference.current,
  };
}
