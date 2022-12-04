import { IMessage, Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { serverTimestamp } from "firebase/database";

const mediaUrlRegex =
  /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*(\.jpg|\.png|\.jpeg|\.webm|\.mkv|\.flv|\.og[g|v]|\.avi|\.mp4|\.3gp))([-a-zA-Z0-9@:%._+~#=?&]{2,256})?/g;
const youtubeUrlRegex =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/gm;

function getMediaContentType(url: string) {
  if (url.match(/\.(jpg|png|jpeg)$/i)) {
    return "image";
  } else if (url.match(/\.(webm|mkv|flv|og[g|v]|avi|mp4|3gp)$/i)) {
    return "video";
  }
  return null;
}

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
  replyTargetMessage?: Message
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

  // if (mediaUrlRegex.test(messageText)) {
  //   // determine the content type of the media URL
  //   // and set the appropriate message type and content
  //   const mediaType = getMediaContentType(messageText);
  //   if (mediaType === "image") {
  //     message = {
  //       ...message,
  //       type: "mediaUri",
  //       sourceUrl: messageText,
  //       contentType: "image",
  //       message: "🖼️ Image Message",
  //     };
  //   } else if (mediaType === "video") {
  //     message = {
  //       ...message,
  //       type: "mediaUri",
  //       sourceUrl: messageText,
  //       contentType: "video",
  //       message: "🎞️ Video Message",
  //     };
  //   }
  // } else if (youtubeUrlRegex.test(messageText)) {
  //   message = {
  //     ...message,
  //     type: "youtube",
  //     sourceUrl: messageText,
  //     message: "🟥 YouTube video",
  //   };
  // } else {
  //   message = {
  //     ...message,
  //     type: "text",
  //     message: messageText.trim(),
  //   };
  // }

  if (
    /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*(\.jpg|\.png|\.jpeg))([-a-zA-Z0-9@:%._+~#=?&]{2,256})?/g.test(
      messageText
    )
  ) {
    message = {
      ...message,
      type: "mediaUri",
      sourceUrl: messageText,
      contentType: "image",
      message: "🖼️ Image Message",
    };
  } else if (
    /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*(\.webm|\.mkv|\.flv|\.og[g|v]|\.avi|\.mp4|\.3gp))([-a-zA-Z0-9@:%._+~#=?&]{2,256})?/g.test(
      messageText
    )
  ) {
    message = {
      ...message,
      type: "mediaUri",
      sourceUrl: messageText,
      contentType: "video",
      message: "🎞️ Video Message",
    };
  } else if (
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/gm.test(
      messageText
    )
  ) {
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
