import { DocumentData, FieldValue, Timestamp } from "@firebase/firestore";
import { QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { PrimaryFirestore } from "../PrimaryFirestore";

export const ConversationFirestoreConverter = {
  toFirestore(object: Conversation): DocumentData {
    const { docRef, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<Conversation<Timestamp>>,
    options: SnapshotOptions
  ): Conversation {
    const data = snapshot.data(options)!;
    return {
      ...data,
      id: snapshot.id,
      docRef: snapshot.ref,
      createdAt: data.createdAt?.toDate(),
    };
  },
};

export type Conversation<T extends Timestamp | FieldValue | Date = Date> =
  (PrimaryFirestore & {
    /**
     * Lista de usuarios que han decidido silenciar las notificaciones de esta app
     * - **Solo la app de conversaciones hace uso de esta funcionalidad**
     */
    muted?: string[];
    /**
     * Fecha de creación
     */
    createdAt: T;
    /**
     * Id de la locación a la cual pertenece
     */
    locationId: string;
    members?: string[];
    /**
     * ID del usuario que actuará como Host (Administrador) de la app / pizarra.
     * - **Solo Managers o superiores puedes actuar como host**
     */
    hostId?: string;
    /**
     * Nombre
     */
    name: string;
    /**
     * Descripción
     */
    description?: string;
  }) &
    (
      | { privacyLevel: PrivacyLevel.POSITIONS; positions?: string[] }
      | { privacyLevel: PrivacyLevel.PRIVATE | PrivacyLevel.PUBLIC }
    );
