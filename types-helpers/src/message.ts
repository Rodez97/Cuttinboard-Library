/**
 * Base interface implemented by Message class.
 */
export type IMessage = {
  id: string;
  messageRefUrl: string;
  sender: Sender;
  createdAt: number;
  systemType?: "start" | "other";
  reactions?: Record<string, { emoji: string; name: string }>;
  locationName?: string;
  text?: string;
  image?: string;
};

export type MessageProviderMessagingType =
  | { type: "dm"; chatId: string }
  | {
      type: "conversation";
      chatId: string;
      organizationId: string;
      locationId: string;
    };

export type ChatPaths = {
  messagesPath: string;
  usersPath: string;
  storagePath: string;
};

/**
 * A Sender contains the information of the sender of a message.
 */
export type Sender = {
  id: string;
  name: string;
  avatar?: string | null;
};

export interface IMessageReaction {
  emoji: string;
  name: string;
}

/**
 * Recipient of the chat.
 */
export type Recipient = Sender;

// Helper functions
const imageRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png)(?:\?.*)?/gm;
const videoRegex = /https?:\/\/[^\s]+\.(mp4|mkv|flv|ogv|avi|3gp)(?:\?.*)?/gm;
const youtubeRegex =
  /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?/gm;
export const mediaUrlRegex = new RegExp(
  imageRegex.source + "|" + videoRegex.source + "|" + youtubeRegex.source,
  "gm"
);

export type ParsedMedia = {
  type: "image" | "video" | "youtube";
  url: string;
};

export function parseMediaFromText(str: string): ParsedMedia[] | null {
  const matches = str.match(mediaUrlRegex);
  if (matches) {
    const media = matches.map<ParsedMedia>((url) => {
      const type = url.match(imageRegex)
        ? "image"
        : url.match(videoRegex)
        ? "video"
        : "youtube";
      return {
        type,
        url,
      };
    });
    return media;
  }
  return null;
}

export function generateChatPaths(
  messagingType: MessageProviderMessagingType,
  uid: string
): ChatPaths {
  const { type, chatId } = messagingType;
  switch (type) {
    case "conversation": {
      const { organizationId, locationId } = messagingType;
      return {
        messagesPath: `conversationMessages/${organizationId}/${locationId}/${chatId}`,
        usersPath: `conversations/${organizationId}/${locationId}/${chatId}/access/members/${uid}`,
        storagePath: `organizations/${organizationId}/locations/${locationId}/conversationMessages/${chatId}`,
      };
    }
    case "dm": {
      return {
        messagesPath: `directMessages/${chatId}`,
        usersPath: `dmInfo/${chatId}/membersList/${uid}`,
        storagePath: `directMessages/${chatId}`,
      };
    }
  }
}

/**
 * Check if the message has user reactions
 */
export function checkUserReaction(msg: IMessage, uid: string) {
  if (!msg.reactions) {
    return false;
  }
  return Boolean(msg.reactions[uid]);
}
