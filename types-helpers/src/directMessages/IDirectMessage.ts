import { Recipient } from "../message";

/**
 * Chat interface implemented by the Chat class.
 */
export interface IDirectMessage {
  muted?: string[];
  members: Record<string, Recipient>;
  membersList: string[];
  recentMessage?: number;
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}
