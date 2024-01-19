import {
  ChatPaths,
  generateChatPaths,
  MessageProviderMessagingType,
} from "@rodez97/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useEffect, useRef, useState } from "react";

export function useChatPaths(messagingType: MessageProviderMessagingType) {
  const { user } = useCuttinboard();
  const firstRender = useRef(true);
  const [chatPaths, setChatPath] = useState<ChatPaths>(() =>
    generateChatPaths(messagingType, user.uid)
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setChatPath(generateChatPaths(messagingType, user.uid));
  }, [messagingType, user.uid]);

  return chatPaths;
}
