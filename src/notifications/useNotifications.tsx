import { get } from "lodash";
import { useCallback } from "react";
import {
  removeConversationBadgesThunk,
  removeDMBadgeThunk,
  removeScheduleBadgesThunk,
  selectNotifications,
} from ".";
import { useCuttinboard } from "../cuttinboard";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";

export function useNotifications() {
  const { onError } = useCuttinboard();
  const notifications = useAppSelector(selectNotifications);
  const thunkDispatch = useAppThunkDispatch();

  const getBadgesByConversation = useCallback(
    (organizationId: string, locationId: string, conversationId: string) => {
      const conversationBadges = get(
        notifications,
        `organizations.${organizationId}.locations.${locationId}.conv.${conversationId}`,
        0
      );
      return conversationBadges;
    },
    [notifications]
  );

  const getAllConversationBadges = useCallback(
    (organizationId: string, locationId: string) => {
      const allConversations = get(
        notifications,
        `organizations.${organizationId}.locations.${locationId}.conv`,
        {}
      );
      return Object.values(allConversations).reduce((acc, quantity) => {
        return acc + quantity;
      }, 0);
    },
    [notifications]
  );

  const getAllBadgesByLocation = useCallback(
    (organizationId: string, locationId: string) => {
      const allConversations = get(
        notifications,
        `organizations.${organizationId}.locations.${locationId}.conv`,
        {}
      );
      const convBadges = Object.values(allConversations).reduce(
        (acc, quantity) => {
          return acc + quantity;
        },
        0
      );
      const scheduleBadges = get(
        notifications,
        `organizations.${organizationId}.locations.${locationId}.sch`,
        0
      );
      return convBadges + scheduleBadges;
    },
    [notifications]
  );

  const getScheduleBadges = useCallback(
    (organizationId: string, locationId: string) => {
      return get(
        notifications,
        `organizations.${organizationId}.locations.${locationId}.sch`,
        0
      );
    },
    [notifications]
  );

  const getDMBadge = useCallback(
    (dmId: string) => {
      return get(notifications, `dm.${dmId}`, 0);
    },
    [notifications]
  );

  const getAllDMBadges = useCallback(() => {
    const dms = get(notifications, "dm", {});

    // Use the `Object.values` method to get an array of the notification quantities
    const values = Object.values(dms);

    // Use the `Array.reduce` method to sum the notification quantities
    const total = values.reduce((acc, quantity) => acc + quantity, 0);

    // Return the total number of badges
    return total;
  }, [notifications]);

  const removeDMBadge = useCallback(
    (dmId: string) => {
      thunkDispatch(removeDMBadgeThunk(dmId)).catch(onError);
    },
    [thunkDispatch]
  );

  const removeScheduleBadges = useCallback(
    (organizationId: string, locationId: string) => {
      thunkDispatch(
        removeScheduleBadgesThunk(organizationId, locationId)
      ).catch(onError);
    },
    [thunkDispatch]
  );

  const removeConversationBadges = useCallback(
    (organizationId: string, locationId: string, conversationId: string) => {
      thunkDispatch(
        removeConversationBadgesThunk(
          organizationId,
          locationId,
          conversationId
        )
      ).catch(onError);
    },
    [thunkDispatch]
  );

  return {
    getBadgesByConversation,
    getAllConversationBadges,
    getAllBadgesByLocation,
    getScheduleBadges,
    getDMBadge,
    getAllDMBadges,
    removeDMBadge,
    removeScheduleBadges,
    removeConversationBadges,
  };
}
