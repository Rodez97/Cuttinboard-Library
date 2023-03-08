import {
  ChatPaths,
  generateChatPaths,
  MessageProviderMessagingType,
} from "@cuttinboard-solutions/types-helpers";
import { useEffect, useRef, useState } from "react";
import { useCuttinboard } from "../cuttinboard";

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
