import {
  addDoc,
  CollectionReference,
  FirestoreError,
  query,
  serverTimestamp,
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
import { PrivacyLevel, RoleAccessLevels } from "..";
import { GenericModule, IGenericModule } from "../models/modules/GenericModule";
import { useLocation } from "./Location";
import { useCuttinboard } from "./Cuttinboard";

export interface CuttinboardModuleProviderProps {
  baseRef: CollectionReference;
  children:
    | ReactNode
    | ((props: {
        loading: boolean;
        error: Error;
        elements: GenericModule[];
        selectedApp?: GenericModule;
      }) => JSX.Element);
  onError: (error: Error | FirestoreError) => void;
}

export interface CuttinboardModuleProviderContext {
  selectedApp?: GenericModule;
  setSelected: (id: string) => void;
  newElement: (element: Omit<IGenericModule, "locationId">) => Promise<string>;
  elements: GenericModule[];
  canManage: boolean;
  canUse: boolean;
  loading: boolean;
  error: Error;
}

export const CuttinboardModuleContext =
  React.createContext<CuttinboardModuleProviderContext>(
    {} as CuttinboardModuleProviderContext
  );

export function CuttinboardModuleProvider({
  children,
  baseRef,
  onError,
}: CuttinboardModuleProviderProps) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const { user } = useCuttinboard();
  const { locationAccessKey, location } = useLocation();

  const [elements, loadingElements, elementsError] =
    useCollectionData<GenericModule>(
      (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
        ? query(baseRef, where(`locationId`, "==", location.id))
        : query(
            baseRef,
            where(`locationId`, "==", location.id),
            where(`accessTags`, "array-contains-any", [
              user.uid,
              `hostId_${user.uid}`,
              "pl_public",
              ...(locationAccessKey.pos ?? []),
            ])
          )
      ).withConverter(GenericModule.Converter)
    );

  /**
   * Obtiene la app actual en dependencia del ID seleccionado
   */
  const selectedApp = useMemo(
    () => elements?.find((ap) => ap.id === selectedAppId),
    [selectedAppId, elements]
  );

  const setSelected = useCallback(
    (appId: string) => {
      if (baseRef) setSelectedAppId(appId);
    },
    [selectedApp]
  );

  const newElement = async (newApp: Omit<IGenericModule, "locationId">) => {
    const elementToAdd = {
      ...newApp,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      locationId: location.id,
    };
    if (newApp.privacyLevel === PrivacyLevel.PUBLIC) {
      elementToAdd.accessTags = ["pl_public"];
    }
    try {
      const newModuleRef = await addDoc(baseRef, elementToAdd);
      return newModuleRef.id;
    } catch (error) {
      onError(error);
      throw error;
    }
  };

  const canManage = useMemo(
    () =>
      selectedApp?.amIhost ||
      locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER,
    [user.uid, selectedApp, locationAccessKey]
  );

  const canUse = useMemo(() => {
    if (!selectedApp) {
      return false;
    }
    if (selectedApp.amIhost) {
      return true;
    }
    if (selectedApp.privacyLevel === PrivacyLevel.PUBLIC) {
      return location.members.indexOf(user.uid) !== -1;
    }
    if (selectedApp.privacyLevel === PrivacyLevel.PRIVATE) {
      return selectedApp.accessTags?.includes(user.uid);
    }
    if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
      return locationAccessKey.pos?.includes(selectedApp.position);
    }
    return false;
  }, [user.uid, selectedApp, locationAccessKey, location]);

  return (
    <CuttinboardModuleContext.Provider
      value={{
        selectedApp,
        setSelected,
        elements,
        canManage,
        canUse,
        loading: loadingElements,
        error: elementsError,
        newElement,
      }}
    >
      {typeof children === "function"
        ? children({
            loading: loadingElements,
            error: elementsError,
            elements,
            selectedApp,
          })
        : children}
    </CuttinboardModuleContext.Provider>
  );
}

export const useCuttinboardModule = () => {
  const context = useContext(CuttinboardModuleContext);
  if (context === undefined) {
    throw new Error(
      "useCuttinboardModule must be used within a CuttinboardModuleProvider"
    );
  }
  return context;
};
