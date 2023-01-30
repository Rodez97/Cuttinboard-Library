import { User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { generateChatPaths } from "./messageUtils";
import { ChatPaths, MessageProviderMessagingType } from "./types";

export function useChatPaths({
  messagingType,
  user,
}: {
  messagingType: MessageProviderMessagingType;
  user: User;
}) {
  const firstRender = useRef(true);
  const [chatPaths, setChatPath] = useState<ChatPaths>(() =>
    generateChatPaths(messagingType, user)
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setChatPath(generateChatPaths(messagingType, user));
  }, [messagingType]);

  return chatPaths;
}
