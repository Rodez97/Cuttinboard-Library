/**
 * Realtime data for a user from RTDB (Firebase)
 */
export type UserRealtimeData = {
  /**
   * Basic metadata about the user.
   */
  metadata: {
    /**
     * refreshTime is the time at which the user credentials were last updates. We use this change to update the user's id token in the client.
     */
    refreshTime: number;
    /**
     * Additional metadata about the user.
     */
    [key: string]: any;
  };
  /**
   * Notification for the user.
   * - We use this to get the badges for the user.
   */
  notifications: {
    /**
     * Record of the number of unread notifications for each DM.
     */
    dm: {
      [dmId: string]: number;
    };
    /**
     * Notifications for the user in an organization.
     */
    organizations: {
      [organizationId: string]: {
        /**
         * Notifications for the user in a location.
         */
        locations: {
          [locationId: string]: {
            /**
             * Notifications for the user in a conversation.
             */
            conv: { [convId: string]: number };
            /**
             * Notifications for the user in the schedule.
             */
            sch: { [schId: string]: number };
          };
        };
      };
    };
  };
};
