import { Auth } from "../../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentReference,
  FieldValue,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { MemberName } from "typescript";
import { PrimaryFirestore } from "../PrimaryFirestore";

export const ChatFirestoreConverter = {
  toFirestore(object: Chat): DocumentData {
    const { docRef, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Chat {
    const data = snapshot.data(options)!;
    return new Chat(snapshot.id, snapshot.ref, data);
  },
};

/**
 * Chats
 */
// export type Chat<
//   TIME extends Timestamp | FieldValue | Date = Date,
//   LOCATIONS extends string[] | FieldValue = string[]
// > = PrimaryFirestore & {
//   /**
//    * Lista de usuarios que han decidido silenciar las notificaciones de esta app
//    * - **Solo la app de conversaciones hace uso de esta funcionalidad**
//    */
//   muted?: string[];
//   /**
//    * Fecha de creación
//    */
//   createdAt: TIME;
//   /**
//    * Id de la locación a la cual pertenece
//    */
//   members: { [member: string]: { name: string; avatar?: string } };
//   recentMessage?: TIME;
//   locations: LOCATIONS;
// };

export class Chat implements PrimaryFirestore {
  id: string;
  public docRef: DocumentReference<DocumentData>;
  public muted?: string[];
  createdAt: Timestamp;
  public members: {
    [memberId: string]: string;
  };
  private _recentMessage?: Timestamp;
  public get recentMessage(): Date {
    return (this._recentMessage as Timestamp).toDate();
  }
  locations?: string[];

  constructor(
    id: string,
    docRef: DocumentReference<DocumentData>,
    rest: { [key: string]: any }
  ) {
    this.id = id;
    this.docRef = docRef;
    this.muted = rest.muted;
    this.createdAt = rest.createdAt;
    this.members = rest.members;
    this._recentMessage = rest.recentMessage;
    this.locations = rest.locations;
  }

  /**
   * Mute Chat
   */
  public async toggleMuteChat(id: string) {
    if (this.muted?.indexOf(id) !== -1) {
      await updateDoc(this.docRef, { muted: arrayRemove(id) });
    } else {
      await updateDoc(this.docRef, { muted: arrayUnion(id) });
    }
  }
  /**
   * Get Order Time
   */
  public get getOrderTime() {
    return (this._recentMessage ?? this.createdAt).toDate();
  }

  public get recipient() {
    const [id, name] = Object.entries(this.members).find(
      ([id]) => id !== Auth.currentUser.uid
    );
    return { id, name };
  }
}
