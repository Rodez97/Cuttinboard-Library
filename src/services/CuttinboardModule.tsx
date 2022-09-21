import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  CollectionReference,
  deleteDoc,
  deleteField,
  DocumentData,
  DocumentReference,
  FieldValue,
  FirestoreError,
  Query,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Employee, PrivacyLevel, RoleAccessLevels } from "..";
import {
  GenericModule,
  GenericModuleConverter,
} from "../models/modules/GenericModule";
import { Auth, Firestore } from "../firebase";
import { useLocation } from "./Location";

export interface CuttinboardModuleProviderProps {
  baseRef: CollectionReference;
  children: ReactNode;
  LoadingElement: JSX.Element;
  ErrorElement: (error: FirestoreError) => JSX.Element;
}

export interface CuttinboardModuleProviderContext {
  selectedApp?: GenericModule;
  setSelected: (id: string) => void;
  moduleContentRef?: CollectionReference;
  selectedRef?: DocumentReference<GenericModule>;
  newElement: (element: GenericModule) => Promise<string>;
  editElement: (data: Partial<GenericModule>) => Promise<void>;
  deleteElement: (element?: GenericModule) => Promise<void>;
  elements: GenericModule[];
  canManage: boolean;
  canUse: boolean;
  setAppHost: (newHostUser: Employee) => Promise<void>;
  removeHost: () => Promise<void>;
  addMembers: (addedEmployees: Employee[]) => Promise<void>;
  removeMember: (employeeId: string) => Promise<void>;
}

export const CuttinboardModuleContext =
  React.createContext<CuttinboardModuleProviderContext>(
    {} as CuttinboardModuleProviderContext
  );

export function CuttinboardModuleProvider({
  children,
  LoadingElement,
  ErrorElement,
  baseRef,
}: CuttinboardModuleProviderProps) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [user] = useState(Auth.currentUser);
  const { locationAccessKey, employeeProfile, locationId } = useLocation();

  const [elements, loadingElements, elementsError] =
    useCollectionData<GenericModule>(
      (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
        ? query(baseRef, where(`locationId`, "==", locationId))
        : query(
            baseRef,
            where(`locationId`, "==", locationId),
            where(`accessTags`, "array-contains-any", [
              user.uid,
              `hostId_${user.uid}`,
              "public",
              ...(locationAccessKey.pos ?? []),
            ])
          )
      ).withConverter(GenericModuleConverter)
    );

  /**
   * Obtiene la app actual en dependencia del ID seleccionado
   */
  const selectedApp = useMemo(
    () => elements?.find((ap) => ap.id === selectedAppId),
    [selectedAppId, elements]
  );

  const moduleContentRef = useMemo(
    () =>
      selectedApp
        ? collection(Firestore, baseRef.path, selectedApp.id, "content")
        : undefined,
    [selectedApp, baseRef]
  );

  const setSelected = useCallback(
    (appId: string) => {
      if (baseRef) setSelectedAppId(appId);
    },
    [selectedApp]
  );

  const newElement = async (newApp: GenericModule) => {
    const elementToAdd = newApp;
    if (newApp.privacyLevel === PrivacyLevel.PUBLIC) {
      elementToAdd.accessTags = ["public"];
    }
    try {
      const newModuleRef = await addDoc(baseRef, elementToAdd);
      return newModuleRef.id;
    } catch (error) {
      throw error;
    }
  };

  const editElement = async (newData: Partial<GenericModule>) => {
    try {
      await updateDoc<DocumentData>(selectedApp.docRef, newData);
    } catch (error) {
      throw error;
    }
  };

  const deleteElement = async (targetAppChild: GenericModule = selectedApp) => {
    try {
      setSelected(null);
      await deleteDoc(targetAppChild.docRef);
    } catch (error) {
      throw error;
    }
  };

  const canManage = useMemo(
    () =>
      (selectedApp && user.uid === selectedApp?.hostId) ||
      locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER,
    [user.uid, selectedApp, locationAccessKey]
  );

  const canUse = useMemo(() => {
    if (!selectedApp) {
      return false;
    }
    if (selectedApp?.hostId === user.uid) {
      return true;
    }
    if (selectedApp.privacyLevel === PrivacyLevel.PUBLIC) {
      if (employeeProfile.role === "employee") {
        return true;
      }
      return Boolean(employeeProfile.locations?.[locationId] === true);
    }
    if (selectedApp.privacyLevel === PrivacyLevel.PRIVATE) {
      return selectedApp.accessTags?.includes(user.uid);
    }
    if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
      if (employeeProfile.role === "employee") {
        return selectedApp.accessTags?.some((pos1) =>
          locationAccessKey.pos?.includes(pos1)
        );
      }
    }
    return false;
  }, [user.uid, selectedApp, locationAccessKey, employeeProfile]);

  const setAppHost = async (newHostUser: Employee) => {
    if (!canManage) {
      return;
    }
    try {
      const hostUpdate: { accessTags?: FieldValue; hostId: string } = {
        hostId: newHostUser.id,
      };
      if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
        hostUpdate.accessTags = arrayUnion(`hostId_${newHostUser.id}`);
      }
      if (selectedApp.privacyLevel === PrivacyLevel.PRIVATE) {
        hostUpdate.accessTags = arrayUnion(newHostUser.id);
      }
      await updateDoc(selectedApp.docRef, hostUpdate);
    } catch (error) {
      throw error;
    }
  };

  const removeHost = async () => {
    if (!canManage) {
      return;
    }
    try {
      const hostUpdate: { accessTags?: FieldValue; hostId: FieldValue } = {
        hostId: deleteField(),
      };
      if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
        hostUpdate.accessTags = arrayRemove(`hostId_${selectedApp.hostId}`);
      }
      if (selectedApp.privacyLevel === PrivacyLevel.PRIVATE) {
        hostUpdate.accessTags = arrayRemove(selectedApp.hostId);
      }
      await updateDoc(selectedApp.docRef, hostUpdate);
    } catch (error) {
      throw error;
    }
  };

  const addMembers = async (addedEmployees: Employee[]) => {
    if (!canManage || selectedApp.privacyLevel !== PrivacyLevel.PRIVATE) {
      return;
    }
    try {
      await updateDoc(selectedApp.docRef, {
        accessTags: arrayUnion(...addedEmployees.map((emp) => emp.id)),
      });
    } catch (error) {
      throw error;
    }
  };

  const removeMember = async (employeeId: string) => {
    if (!canManage || selectedApp.privacyLevel !== PrivacyLevel.PRIVATE) {
      return;
    }
    try {
      await updateDoc(selectedApp.docRef, {
        accessTags: arrayRemove(employeeId),
      });
    } catch (error) {
      throw error;
    }
  };

  if (loadingElements) {
    return LoadingElement;
  }

  if (elementsError) {
    return ErrorElement(elementsError);
  }

  return (
    <CuttinboardModuleContext.Provider
      value={{
        selectedApp,
        setSelected,
        moduleContentRef,
        elements,
        newElement,
        editElement,
        deleteElement,
        canManage,
        canUse,
        setAppHost,
        removeHost,
        addMembers,
        removeMember,
      }}
    >
      {children}
    </CuttinboardModuleContext.Provider>
  );
}

export function useCuttinboardModule() {
  return useContext<CuttinboardModuleProviderContext>(CuttinboardModuleContext);
}
