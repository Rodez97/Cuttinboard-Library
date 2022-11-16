import { ref as dbRef } from "firebase/database";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  IOrganizationKey,
  OrganizationKey,
} from "../models/auth/OrganizationKey";
import { Location } from "../models/Location";
import { isEqual } from "lodash";
import { Auth, Database, Functions } from "../firebase";
import { User } from "firebase/auth";
import { useObjectVal } from "react-firebase-hooks/database";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { UserRealtimeData } from "../models/UserRealtimeData";

interface ICuttinboardContext {
  user: User;
  loadCredential: (lUser?: User) => Promise<void>;
  organizationKey: OrganizationKey | null;
  error: Error;
  loading: boolean;
  selectLocation: (organizationId: string) => Promise<void>;
  notifications?: UserRealtimeData["notifications"];
}

const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

/**
 * Props del Provider principal de la App
 */
interface CuttinboardProviderProps {
  children:
    | ReactNode
    | ((props: { user: User; error: Error; loading: boolean }) => JSX.Element);
  onError: (error: Error) => void;
}

/**
 * Provider Principal de la lógica de Cuttinboard, aquí se carga toda la información necesaria para el correcto funcionamiento de las apps
 * - Cargas la lista de empleados con los que se trabajará en la app.
 * - Estar pendiente a los cambio que ocurran en el token de autentificación del usuario
 * - Inicializar el SDK y los diferentes módulos de Firebase que utilizará la app
 */
export const CuttinboardProvider = ({
  children,
  onError,
}: CuttinboardProviderProps) => {
  // LLave principal de la locación
  const [organizationKey, setOrganizationKey] = useState<OrganizationKey>(null);
  const loadCredential = useCallback(
    async (lUser: User) => {
      // En caso de que el usuario sea inválido eliminar eliminar la llave actual de la locación en caso de ser necesario
      // y devolver la función.
      if (!lUser) {
        return setOrganizationKey(null);
      }
      // Forzar la actualización para recoger los últimos cambios en las reclamaciones personalizadas.
      // Tenga en cuenta que esto siempre se activa en la primera llamada.
      // Se podría agregar una mayor optimización para evitar el desencadenante
      // inicial cuando se emite el token y ya contiene los últimos reclamos.
      try {
        const {
          claims: { organizationKey: newOrgKey },
        } = await lUser.getIdTokenResult(true);
        // comprobar que la nueva llave sea diferente de la actual
        if (!newOrgKey) {
          setOrganizationKey(null);
        } else if (!isEqual(newOrgKey, organizationKey)) {
          setOrganizationKey(
            new OrganizationKey(newOrgKey as IOrganizationKey)
          );
        }
      } catch (error) {
        setOrganizationKey(null);
        onError(error);
      }
    },
    [organizationKey]
  );
  // Usuario Actual
  const [user, loadingUser, userError] = useAuthState(Auth, {
    onUserChanged: loadCredential,
  });
  const [userRealtimeData, loadingUserRealtimeData, errorRealtimeData] =
    useObjectVal<Partial<UserRealtimeData>>(
      user && dbRef(Database, `users/${user.uid}`)
    );
  const [selectOrganizationKey] = useHttpsCallable<
    string,
    { organizationKey: IOrganizationKey }
  >(Functions, "auth-selectKey");

  useEffect(() => {
    loadCredential(user);
  }, [userRealtimeData?.metadata?.refreshTime, user]);

  const selectLocation = useCallback(
    async (organizationId: string) => {
      // Comprobar si la nueva locación es la misma que la ya presente
      // De ser así solo actualizar el token
      if (organizationKey?.orgId === organizationId) {
        await loadCredential(user);
        return;
      }
      try {
        const { data } = await selectOrganizationKey(organizationId);
        if (!data?.organizationKey) {
          const error = new Error("Can't select the location.");
          onError(error);
          throw error;
        }
        setOrganizationKey(new OrganizationKey(data.organizationKey));
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [organizationKey, user]
  );

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey,
        loadCredential,
        loading: loadingUser,
        error: userError ?? errorRealtimeData,
        selectLocation,
        notifications: userRealtimeData?.notifications,
      }}
    >
      {typeof children === "function"
        ? children({
            user,
            error: userError ?? errorRealtimeData,
            loading: loadingUser || loadingUserRealtimeData,
          })
        : children}
    </CuttinboardContext.Provider>
  );
};

export const useCuttinboard = () => {
  const context = useContext(CuttinboardContext);
  if (context === undefined) {
    throw new Error("useCuttinboard must be used within a CuttinboardProvider");
  }
  return context;
};
