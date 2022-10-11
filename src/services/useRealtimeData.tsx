import { Database } from "../firebase";
import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";
import { ValOptions } from "react-firebase-hooks/database/dist/database/helpers";

interface INotifications {
  dm: {
    [dmId: string]: number;
  };
  organizations: {
    [organizationId: string]: {
      locations: {
        [locationId: string]: {
          conv: {
            [convId: string]: number;
          };
          task: {
            [taskId: string]: number;
          };
          sch: {
            [schId: string]: number;
          };
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
  public readonly dm: { [dmId: string]: number };
  public readonly organizations: {
    [organizationId: string]: {
      locations: {
        [locationId: string]: {
          conv: { [convId: string]: number };
          task: { [taskId: string]: number };
          sch: { [schId: string]: number };
        };
      };
    };
  };

  constructor({ dm, organizations }: INotifications) {
    this.dm = dm;
    this.organizations = organizations;
  }

  public getModuleBadge(
    type: "conv" | "task" | "sch",
    notiId: string,
    organizationId: string,
    locationId: string
  ) {
    const notificationsObject =
      this.organizations?.[organizationId].locations?.[locationId]?.[type]?.[
        notiId
      ];
    return notificationsObject ?? 0;
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
  transform: ({ notifications, ...val }) => ({
    ...val,
    notifications: new Notifications(notifications),
  }),
};

export const useRealtimeData: (
  idSale: string
) => [UserRealtimeData | undefined, boolean, any] = (userId: string) =>
  useObjectVal<UserRealtimeData>(ref(Database, `users/${userId}`), options);
