import { User } from "firebase/auth";
import { ChatPaths, MessageProviderMessagingType } from "./types";

const imageRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png)/gm;
const videoRegex = /https?:\/\/[^\s]+\.(mp4|mkv|flv|ogv|avi|3gp)/gm;
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

export const parseMediaFromText = (str: string): ParsedMedia[] | null => {
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
};

export const generateChatPaths = (
  messagingType: MessageProviderMessagingType,
  user: User
): ChatPaths => {
  const { uid } = user;
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
};
