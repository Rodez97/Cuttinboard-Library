import {
  allDMBadges,
  getAllConversationBadges,
  getConversationBadges,
  getDMBadge,
  getScheduleBadges,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCallback, useMemo } from "react";
import { ref, remove } from "firebase/database";
import { DATABASE } from "../utils";

export function useNotifications() {
  const { onError, notifications, user } = useCuttinboard();

  const getBadgesByConversation = useCallback(
    (conversationId: string) => {
      if (!notifications) return 0;
      return getConversationBadges(notifications, conversationId);
    },
    [notifications]
  );

  const getTotalBadgesForConversations = useMemo(() => {
    if (!notifications) return 0;
    return getAllConversationBadges(notifications);
  }, [notifications]);

  const getTotalScheduleBadges = useMemo(() => {
    if (!notifications) return 0;
    return getScheduleBadges(notifications);
  }, [notifications]);

  const getDMBadgesById = useCallback(
    (dmId: string) => {
      if (!notifications) return 0;
      return getDMBadge(notifications, dmId);
    },
    [notifications]
  );

  const getTotalDMBadges = useMemo(() => {
    if (!notifications) return 0;
    return allDMBadges(notifications);
  }, [notifications]);

  const removeDMBadge = useCallback(
    async (dmId: string) => {
      if (!notifications || !notifications.dm?.[dmId]) return;

      try {
        const deleteRef = ref(
          DATABASE,
          `users/${user.uid}/notifications/dm/${dmId}`
        );
        await remove(deleteRef);
      } catch (error) {
        onError(error);
      }
    },
    [notifications, onError, user.uid]
  );

  const removeScheduleBadges = useCallback(async () => {
    if (!notifications || !notifications.sch) return;

    try {
      await remove(ref(DATABASE, `users/${user.uid}/notifications/sch`));
    } catch (error) {
      onError(error);
    }
  }, [notifications, onError, user.uid]);

  const removeConversationBadges = useCallback(
    async (conversationId: string) => {
      if (!notifications || !notifications.conv?.[conversationId]) return;

      try {
        await remove(
          ref(
            DATABASE,
            `users/${user.uid}/notifications/conv/${conversationId}`
          )
        );
      } catch (error) {
        onError(error);
      }
    },
    [notifications, onError, user.uid]
  );

  return {
    getBadgesByConversation,
    getTotalBadgesForConversations,
    getTotalScheduleBadges,
    getScheduleBadges,
    getDMBadge,
    getTotalDMBadges,
    removeDMBadge,
    removeScheduleBadges,
    removeConversationBadges,
    getDMBadgesById,
  };
}
