import {
  arrayRemove,
  arrayUnion,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { Auth } from "../../firebase";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { GenericModule, IGenericModule } from "../modules";

export interface IConversation {
  muted?: string[];
}

export class Conversation extends GenericModule implements IConversation {
  public readonly muted?: string[];

  public static Converter = {
    toFirestore(object: Conversation): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<
        IConversation & IGenericModule & FirebaseSignature
      >,
      options: SnapshotOptions
    ): Conversation {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Conversation(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      description,
      hosts,
      locationId,
      privacyLevel,
      accessTags,
      muted,
      createdAt,
      createdBy,
    }: IConversation & IGenericModule & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    super(
      {
        name,
        description,
        hosts,
        locationId,
        privacyLevel,
        accessTags,
        createdAt,
        createdBy,
      },
      { id, docRef }
    );
    this.muted = muted;
  }

  public get isMuted() {
    return Boolean(this.muted?.indexOf(Auth.currentUser.uid) !== -1);
  }

  public async toggleMuteChat() {
    try {
      if (this.isMuted) {
        await updateDoc(this.docRef, {
          muted: arrayRemove(Auth.currentUser.uid),
        });
      } else {
        await updateDoc(this.docRef, {
          muted: arrayUnion(Auth.currentUser.uid),
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
