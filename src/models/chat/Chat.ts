import { FieldValue, Timestamp } from "@firebase/firestore";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

export const ChatFirestoreConverter = {
  toFirestore(object: Chat): DocumentData {
    const { docRef, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<Chat<Timestamp>>,
    options: SnapshotOptions
  ): Chat {
    const data = snapshot.data(options)!;
    return {
      ...data,
      id: snapshot.id,
      docRef: snapshot.ref,
      createdAt: data.createdAt?.toDate(),
      recentMessage: data.recentMessage?.toDate(),
    };
  },
};

/**
 * Chats
 */
export type Chat<
  TIME extends Timestamp | FieldValue | Date = Date,
  LOCATIONS extends string[] | FieldValue = string[]
> = PrimaryFirestore & {
  /**
   * Lista de usuarios que han decidido silenciar las notificaciones de esta app
   * - **Solo la app de conversaciones hace uso de esta funcionalidad**
   */
  muted?: string[];
  /**
   * Fecha de creación
   */
  createdAt: TIME;
  /**
   * Id de la locación a la cual pertenece
   */
  members: { [member: string]: true };
  recentMessage?: TIME;
  locations: LOCATIONS;
};
