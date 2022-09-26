import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { serverTimestamp } from "firebase/database";

export const composeMessage = (
  sender: Sender,
  messageTxt: string,
  replyTargetMessage?: Message & {
    type: "attachment" | "youtube" | "mediaUri" | "text";
  }
): Partial<
  Message<object> & {
    type: "attachment" | "youtube" | "mediaUri" | "text";
  }
> => {
  let msg: Partial<
    Message<object> & {
      type: "attachment" | "youtube" | "mediaUri" | "text";
    }
  > = {
    createdAt: serverTimestamp(),
    sender,
  };

  if (replyTargetMessage) {
    const { replyTarget, ...others } = replyTargetMessage;
    msg = {
      ...msg,
      replyTarget: others,
    };
  }

  if (
    /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))([-a-zA-Z0-9@:%._\+~#=?&]{2,256})?/g.test(
      messageTxt
    )
  ) {
    msg = {
      ...msg,
      type: "mediaUri",
      sourceUrl: messageTxt,
      contentType: "image",
      message: "🖼️ Image Message",
    };
  } else if (
    /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.webm|\.mkv|\.flv|\.og[g|v]|\.avi|\.mp4|\.3gp))([-a-zA-Z0-9@:%._\+~#=?&]{2,256})?/g.test(
      messageTxt
    )
  ) {
    msg = {
      ...msg,
      type: "mediaUri",
      sourceUrl: messageTxt,
      contentType: "video",
      message: "🎞️ Video Message",
    };
  } else if (
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gm.test(
      messageTxt
    )
  ) {
    msg = {
      ...msg,
      type: "youtube",
      sourceUrl: messageTxt,
      message: "🟥 YouTube video",
    };
  } else {
    msg = {
      ...msg,
      type: "text",
      message: messageTxt.trim(),
    };
  }

  return msg;
};
