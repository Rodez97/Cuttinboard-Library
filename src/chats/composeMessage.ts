import { serverTimestamp } from "firebase/database";
import { IMessage, Message } from "./Message";
import { Sender } from "./types";

const imageRegex =
  /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*(\.jpg|\.png|\.jpeg))([-a-zA-Z0-9@:%._+~#=?&]{2,256})?/g;
const videoRegex =
  /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*(\.webm|\.mkv|\.flv|\.og[g|v]|\.avi|\.mp4|\.3gp))([-a-zA-Z0-9@:%._+~#=?&]{2,256})?/g;
const youtubeRegex =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/gm;

/**
 * Creates a message object with various properties.
 *
 * @param sender - An object with a `name` and `id` property that specifies
 * the sender of the message.
 * @param messageText - A string containing the text of the message.
 * @param replyTargetMessage - An optional `Message` object that the new
 * message is replying to.
 *
 * @returns A message object with the specified properties.
 */
export const composeMessage = (
  sender: Sender,
  messageText: string,
  replyTargetMessage?: Message | null
): Partial<
  IMessage<object> & {
    type: "attachment" | "youtube" | "mediaUri" | "text";
  }
> => {
  let message: Partial<
    IMessage<object> & {
      type: "attachment" | "youtube" | "mediaUri" | "text";
    }
  > = {
    createdAt: serverTimestamp(),
    sender,
  };

  if (replyTargetMessage) {
    message = {
      ...message,
      replyTarget: replyTargetMessage.toReplyData
        ? replyTargetMessage.toReplyData
        : undefined,
    };
  }

  if (imageRegex.test(messageText)) {
    message = {
      ...message,
      type: "mediaUri",
      sourceUrl: messageText,
      contentType: "image",
      message: "🖼️ Image Message",
    };
  } else if (videoRegex.test(messageText)) {
    message = {
      ...message,
      type: "mediaUri",
      sourceUrl: messageText,
      contentType: "video",
      message: "🎞️ Video Message",
    };
  } else if (youtubeRegex.test(messageText)) {
    message = {
      ...message,
      type: "youtube",
      sourceUrl: messageText,
      message: "🟥 YouTube video",
    };
  } else {
    message = {
      ...message,
      type: "text",
      message: messageText.trim(),
    };
  }

  return message;
};
