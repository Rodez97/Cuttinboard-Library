import { useCallback } from "react";
import { ref, remove } from "firebase/database";
import { useCuttinboard, useLocation } from "..";
import { Database } from "../firebase";

export function useNotificationsBadges() {
  const { user, notifications, organizationKey } = useCuttinboard();
  const { locationId } = useLocation();

  const getModuleBadge = useCallback(
    (type: "conv" | "task" | "sch", notiId: string) => {
      if (!organizationKey || !locationId) {
        throw new Error(
          "This function can only be called under a location instance"
        );
      }
      if (!notifications) {
        return 0;
      }
      const notificationsObject =
        notifications[organizationKey.orgId].locations?.[locationId]?.[type]?.[
          notiId
        ];
      return notificationsObject ?? 0;
    },
    [notifications, locationId, organizationKey]
  );

  /**
   * Get a badge info by type
   * @param type Pattern of the badge id
   */
  const getBadgeByModule = useCallback(
    (type: "conv" | "task" | "sch") => {
      if (!organizationKey || !locationId) {
        throw new Error(
          "This function can only be called under a location instance"
        );
      }
      if (!notifications) {
        return 0;
      }
      const notificationsObject =
        notifications[organizationKey.orgId].locations?.[locationId]?.[type];
      if (!notificationsObject) {
        return 0;
      }
      return Object.values(notificationsObject).reduce((acc, quantity) => {
        return acc + quantity;
      }, 0);
    },
    [notifications, locationId, organizationKey]
  );

  const removeBadge = useCallback(
    async (type: "conv" | "task" | "sch", notiId: string) => {
      const badge = getModuleBadge(type, notiId);
      if (badge === 0) {
        return;
      }
      await remove(
        ref(
          Database,
          `users/${user.uid}/notifications/${organizationKey.orgId}/locations/${locationId}/${type}/${notiId}`
        )
      );
    },
    [notifications, locationId, user.uid, organizationKey]
  );

  const getDMBadge = useCallback(
    (dmId: string) => {
      if (!organizationKey) {
        throw new Error(
          "This function can only be called under a organization instance"
        );
      }
      if (!notifications) {
        return 0;
      }
      const notificationsObject =
        notifications[organizationKey.orgId].dm?.[dmId];
      return notificationsObject ?? 0;
    },
    [notifications, organizationKey]
  );

  const removeDMBadge = useCallback(
    async (dmId: string) => {
      const badge = getDMBadge(dmId);
      if (badge === 0) {
        return;
      }
      await remove(
        ref(
          Database,
          `users/${user.uid}/notifications/${organizationKey.orgId}/dm/${dmId}`
        )
      );
    },
    [notifications, locationId, user.uid, organizationKey]
  );

  const getBadgeByLocation = useCallback(
    (locId: string, orgId: string) => {
      let badgeCount: number = 0;
      const notificationsObject = notifications?.[orgId]?.locations?.[locId];
      if (notificationsObject) {
        Object.values(notificationsObject).forEach((noti) => {
          Object.values(noti).forEach((quantity) => {
            badgeCount + quantity;
          });
        });
      }
      const orgDmNotifications = notifications?.[orgId]?.dm;
      if (orgDmNotifications) {
        Object.values(orgDmNotifications).forEach((quantity) => {
          badgeCount + quantity;
        });
      }
      return badgeCount;
    },
    [notifications, organizationKey]
  );

  const haveNotificationsInOthersLocations = useCallback(
    (locId: string, orgId: string) => {
      const notificationsObject = notifications?.[orgId]?.locations;
      if (!notificationsObject) {
        return false;
      }
      return Object.entries(notificationsObject).some(([id, values]) => {
        return (
          id !== locId &&
          Object.values(values).some((noti) =>
            Object.values(noti).some((v) => v > 0)
          )
        );
      });
    },
    [notifications, organizationKey]
  );

  return {
    getModuleBadge,
    removeBadge,
    getBadgeByModule,
    getBadgeByLocation,
    haveNotificationsInOthersLocations,
    removeDMBadge,
    getDMBadge,
  };
}
