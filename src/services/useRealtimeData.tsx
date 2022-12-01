import { Auth, Database } from "../firebase";
import { ref, remove } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";
import { ValOptions } from "react-firebase-hooks/database/dist/database/helpers";
import { isEmpty } from "lodash";

interface INotifications {
  dm?: {
    [dmId: string]: number;
  };
  organizations?: {
    [organizationId: string]: {
      locations?: {
        [locationId: string]: {
          conv?: {
            [convId: string]: number;
          };
          sch?: number;
        };
      };
    };
  };
}

interface IRealtimeMetadata {
  refreshTime: number;
  [key: string]: any;
}

export class Notifications implements INotifications {
  public readonly dm?: { [dmId: string]: number };
  public readonly organizations?: {
    [organizationId: string]: {
      locations?: {
        [locationId: string]: {
          conv?: { [convId: string]: number };
          sch?: number;
        };
      };
    };
  };

  constructor(props?: Partial<INotifications>) {
    this.dm = props?.dm;
    this.organizations = props?.organizations;
  }

  public get allDMBadges() {
    if (!this.dm || isEmpty(this.dm)) {
      return 0;
    }
    return Object.values(this.dm).reduce((acc, quantity) => {
      return acc + quantity;
    }, 0);
  }

  public getDMBadge(dmId: string) {
    if (!this.dm || isEmpty(this.dm)) {
      return 0;
    }
    return this.dm[dmId] ?? 0;
  }

  public async removeDMBadge(dmId: string) {
    if (!this.dm || isEmpty(this.dm) || !Auth.currentUser) {
      return;
    }
    const dmBadges = this.getDMBadge(dmId);
    if (dmBadges === 0) {
      return;
    }
    await remove(
      ref(Database, `users/${Auth.currentUser.uid}/notifications/dm/${dmId}`)
    );
  }

  public getAllBadgesByLocation(organizationId: string, locationId: string) {
    if (!this.organizations || isEmpty(this.organizations)) {
      return 0;
    }
    const location =
      this.organizations[organizationId]?.locations?.[locationId];
    if (!location) {
      return 0;
    }
    let badges = 0;
    if (location.sch) {
      badges += location.sch;
    }
    if (location.conv) {
      badges += Object.values(location.conv).reduce((acc, quantity) => {
        return acc + quantity;
      }, 0);
    }
    return badges;
  }

  public haveNotificationsInOtherLocations(
    organizationId: string,
    locationId: string
  ) {
    if (!this.organizations || isEmpty(this.organizations)) {
      return false;
    }
    const locations = this.organizations[organizationId]?.locations;
    if (!locations) {
      return false;
    }
    return Object.keys(locations).some((id) => id !== locationId);
  }

  public getScheduleBadges(organizationId: string, locationId: string) {
    if (!this.organizations || isEmpty(this.organizations)) {
      return 0;
    }
    return (
      this.organizations[organizationId]?.locations?.[locationId]?.sch ?? 0
    );
  }

  public async removeScheduleBadges(
    organizationId: string,
    locationId: string
  ) {
    if (isEmpty(this.organizations) || !Auth.currentUser) {
      return;
    }
    const schBadges = this.getScheduleBadges(organizationId, locationId);
    if (schBadges === 0) {
      return;
    }
    await remove(
      ref(
        Database,
        `users/${Auth.currentUser.uid}/notifications/organizations/${organizationId}/locations/${locationId}/sch`
      )
    );
  }

  public getConversationBadges(
    organizationId: string,
    locationId: string,
    convId: string
  ) {
    if (!this.organizations || isEmpty(this.organizations)) {
      return 0;
    }
    return (
      this.organizations[organizationId]?.locations?.[locationId]?.conv?.[
        convId
      ] ?? 0
    );
  }

  public async removeConversationBadges(
    organizationId: string,
    locationId: string,
    convId: string
  ) {
    if (isEmpty(this.organizations) || !Auth.currentUser) {
      return;
    }
    const convBadges = this.getConversationBadges(
      organizationId,
      locationId,
      convId
    );
    if (convBadges === 0) {
      return;
    }
    await remove(
      ref(
        Database,
        `users/${Auth.currentUser.uid}/notifications/organizations/${organizationId}/locations/${locationId}/conv/${convId}`
      )
    );
  }

  public getAllConversationBadges(organizationId: string, locationId: string) {
    if (!this.organizations || isEmpty(this.organizations)) {
      return 0;
    }
    return Object.values(
      this.organizations[organizationId]?.locations?.[locationId]?.conv ?? {}
    ).reduce((acc, quantity) => {
      return acc + quantity;
    }, 0);
  }
}

export type UserRealtimeData = {
  id: string;
  ref: string;
  metadata: IRealtimeMetadata;
  notifications: Notifications;
};

const options: ValOptions<UserRealtimeData> = {
  keyField: "id",
  refField: "ref",
  transform: (props) => ({
    ...props,
    notifications: new Notifications(props?.notifications),
  }),
};

export const useRealtimeData: (
  userId: string | null | undefined
) => [UserRealtimeData | undefined, boolean, any] = (userId) =>
  useObjectVal<UserRealtimeData>(
    userId ? ref(Database, `users/${userId}`) : null,
    options
  );
