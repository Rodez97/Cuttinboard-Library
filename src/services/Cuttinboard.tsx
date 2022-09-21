import { httpsCallable } from "@firebase/functions";
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
import { OrganizationKey } from "../models/auth/OrganizationKey";
import { Location } from "../models/Location";
import { isEqual } from "lodash";
import { Auth, Database, Functions } from "../firebase";
import { User } from "firebase/auth";
import { useObjectVal } from "react-firebase-hooks/database";

export type UserRealtimeData = {
  metadata: { refreshTime: number; [key: string]: any };
  notifications: {
    [organizationId: string]: {
      dm: {
        [dmId: string]: number;
      };
      locations: {
        [locationId: string]: {
          conv: { [convId: string]: number };
          task: { [taskId: string]: number };
          sch: { [schId: string]: number };
        };
      };
    };
  };
};

interface ICuttinboardContext {
  /**
   * Usuario actual
   */
  user: User;
  /**
   * Carga o recarga las credenciales del usuaro
   * - Esto incluye la llave de la locación si corresponse
   * @param {User} user Usuario con el cuál ejecutar la operación
   */
  loadCredential: (lUser?: User) => Promise<void>;
  /**
   * LLave Principal de la Locación actualmente seleccionada
   */
  organizationKey: OrganizationKey | null;
  /**
   * Error relacionado a la carga del usuario actual en caso de ocurrir
   */
  userError: Error;
  /**
   * Estado de carga del usuario actual
   */
  loadingUser: boolean;
  /**
   * Selecciona una locación y la convierte el la locación seleccionada en la cuenta.
   * @param {Location} location Locación que se desea seleccionar
   */
  selectLocation: (locationToSelect: Location) => Promise<void>;
  notifications?: UserRealtimeData["notifications"];
}

const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

/**
 * Props del Provider principal de la App
 */
interface CuttinboardProviderProps {
  /**
   * El Contenido principal de la app cuando el usuario esté autentificado.
   */
  children: ReactNode;
  /**
   * Fallback al elemento de login/sign up en caso de perder la autentificación
   */
  authScreen: JSX.Element;
  LoadingElement: JSX.Element;
  onError: (error: Error) => void;
  ErrorElement: (error: Error) => JSX.Element;
}

/**
 * Provider Principal de la lógica de Cuttinboard, aquí se carga toda la información necesaria para el correcto funcionamiento de las apps
 * - Cargas la lista de empleados con los que se trabajará en la app.
 * - Estar pendiente a los cambio que ocurran en el token de autentificación del usuario
 * - Inicializar el SDK y los diferentes módulos de Firebase que utilizará la app
 */
export const CuttinboardProvider = ({
  children,
  authScreen,
  LoadingElement,
  onError,
  ErrorElement,
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
          setOrganizationKey(newOrgKey as OrganizationKey);
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

  useEffect(() => {
    loadCredential(user);
  }, [userRealtimeData?.metadata?.refreshTime, user]);

  const selectLocation = useCallback(
    async (locationToSelect: Location) => {
      // Comprobar si la nueva locación es la misma que la ya presente
      // De ser así solo actualizar el token
      const { organizationId } = locationToSelect;
      if (organizationKey?.orgId === organizationId) {
        await loadCredential(user);
        return;
      }
      try {
        const selectOrganizationKey = httpsCallable<
          string,
          { organizationKey: OrganizationKey }
        >(Functions, "auth-selectKey");
        const { data } = await selectOrganizationKey(organizationId);
        if (!data?.organizationKey) {
          throw new Error("Can't select the location.");
        }
        setOrganizationKey(data.organizationKey);
      } catch (error) {
        throw error;
      }
    },
    [organizationKey, user]
  );

  if (loadingUser || loadingUserRealtimeData) {
    return LoadingElement;
  }

  if (userError || errorRealtimeData) {
    return ErrorElement(userError ?? errorRealtimeData);
  }

  if (!user) {
    return authScreen;
  }

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey,
        loadCredential,
        loadingUser,
        userError,
        selectLocation,
        notifications: userRealtimeData?.notifications,
      }}
    >
      {children}
    </CuttinboardContext.Provider>
  );
};

export const useCuttinboard = () => useContext(CuttinboardContext);
