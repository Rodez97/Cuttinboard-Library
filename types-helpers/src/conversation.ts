import { PrivacyLevel } from "./utils";

/**
 * Base interface implemented by Conversation class.
 */
export interface IConversation {
  muted?: string[];
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  position?: string;
  organizationId: string;
  members?: string[];
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}
