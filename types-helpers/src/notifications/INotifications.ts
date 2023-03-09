/**
 * Represents the notifications data of a user.
 */
export interface INotifications {
  /**
   * Direct message notifications.
   * The keys of this object represent the IDs of the direct messages,
   * and the values represent the number of unread notifications for each direct message.
   */
  dm?: {
    [dmId: string]: number;
  };
  /**
   * The number of unread schedule notifications for the location.
   */
  sch?: number;
  /**
   * Organization-related notifications.
   * The keys of this object represent the IDs of the organizations,
   * and the values are objects containing the notifications data for each organization.
   */
  organizations?: {
    [organizationId: string]: {
      /**
       * Location-related notifications.
       * The keys of this object represent the IDs of the locations,
       * and the values are objects containing the notifications data for each location.
       */
      locations?: {
        [locationId: string]: {
          /**
           * Conversation-related notifications.
           * The keys of this object represent the IDs of the conversations,
           * and the values represent the number of unread notifications for each conversation.
           */
          conv?: {
            [convId: string]: number;
          };
        };
      };
    };
  };
}
