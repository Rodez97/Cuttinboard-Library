export type UserRealtimeData = {
  metadata: { refreshTime: number; [key: string]: any };
  notifications: {
    dm: {
      [dmId: string]: number;
    };
    organizations: {
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
  };
};
