import { AUTH, DATABASE } from "../utils/firebase";
import { ref, remove } from "firebase/database";
import { isEmpty } from "lodash";

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
          /**
           * The number of unread schedule notifications for the location.
           */
          sch?: number;
        };
      };
    };
  };
}

export class Notifications implements INotifications {
  /**
   * {@inheritDoc INotifications.dm}
   */
  public readonly dm?: { [dmId: string]: number };
  /**
   * {@inheritDoc INotifications.organizations}
   */
  public readonly organizations?: {
    [organizationId: string]: {
      /**
       * {@inheritDoc INotifications.organizations.locations}
       */
      locations?: {
        [locationId: string]: {
          /**
           * {@inheritDoc INotifications.organizations.locations.conv}
           */
          conv?: { [convId: string]: number };
          /**
           * {@inheritDoc INotifications.organizations.locations.sch}
           */
          sch?: number;
        };
      };
    };
  };

  constructor(props?: Partial<INotifications>) {
    this.dm = props?.dm;
    this.organizations = props?.organizations;
  }

  /**
   * Calculates the total number of badges (notifications) for all the user's direct messages (DMs)
   */
  public get allDMBadges(): number {
    // Return 0 if the `dm` property is not an object or is empty
    if (!this.dm || typeof this.dm !== "object" || isEmpty(this.dm)) {
      return 0;
    }

    // Use the `Object.values` method to get an array of the notification quantities
    const values = Object.values(this.dm);

    // Use the `Array.reduce` method to sum the notification quantities
    const total = values.reduce((acc, quantity) => acc + quantity, 0);

    // Return the total number of badges
    return total;
  }

  /**
   * Retrieves the number of badges (notifications) for a specific direct message (DM) based on its ID.
   * @param dmId The ID of the DM
   * @returns The number of badges (notifications) for the DM
   */
  public getDMBadge(dmId: string): number {
    // Return 0 if the `dm` property is not an object or is empty
    if (!this.dm || typeof this.dm !== "object" || isEmpty(this.dm)) {
      return 0;
    }

    // Return 0 if the `dm` object does not have a property with the specified `dmId`
    if (!this.dm[dmId]) {
      return 0;
    }

    // Return the notification quantity for the specified `dmId`
    return this.dm[dmId];
  }

  /**
   * Removes a badge (notification) for a specific direct message (DM) based on its ID.
   * @param dmId The ID of the DM
   */
  public async removeDMBadge(dmId: string) {
    // Return immediately if the `dm` property is not an object or is empty,
    // or if the `Auth.currentUser` property is `null` or `undefined`
    if (
      !this.dm ||
      typeof this.dm !== "object" ||
      isEmpty(this.dm) ||
      !AUTH.currentUser
    ) {
      return;
    }

    // Return immediately if the `dm` object does not have any badges for the specified `dmId`
    const dmBadges = this.getDMBadge(dmId);
    if (dmBadges === 0) {
      return;
    }

    // Delete the property from the `dm` object in the database
    const deleteRef = ref(
      DATABASE,
      `users/${AUTH.currentUser.uid}/notifications/dm/${dmId}`
    );
    await remove(deleteRef);
  }

  /**
   * Calculates the total number of badges (notifications) for a specific location in an organization.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   */
  public getAllBadgesByLocation(
    organizationId: string,
    locationId: string
  ): number {
    // Return 0 if the `organizations` property is not an object or is empty
    if (
      !this.organizations ||
      typeof this.organizations !== "object" ||
      isEmpty(this.organizations)
    ) {
      return 0;
    }

    // Return 0 if the `organizations` object does not have a property with the specified `organizationId`,
    // or if the organization does not have a property with the specified `locationId`
    const organization = this.organizations[organizationId];
    if (
      !organization ||
      !organization.locations ||
      !organization.locations[locationId]
    ) {
      return 0;
    }

    const location = organization.locations[locationId];

    // Initialize the `badges` variable to 0
    let badges = 0;

    // Add the `sch` property to the `badges` variable, if it exists
    location.sch && (badges += location.sch);

    // Add the values from the `conv` object to the `badges` variable, if it exists
    if (location.conv) {
      const convValues = Object.values(location.conv);
      badges += convValues.reduce((acc, quantity) => acc + quantity, 0);
    }

    // Return the total number of badges
    return badges;
  }

  /**
   * Checks if an organization has any locations with notifications (badges) other than the specified location.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   */
  public haveNotificationsInOtherLocations(
    organizationId: string,
    locationId: string
  ): boolean {
    // Return false if the `organizations` property is not an object or is empty,
    // or if the `organizations` object does not have a property with the specified `organizationId`,
    // or if the organization does not have a `locations` property
    if (
      !this.organizations ||
      typeof this.organizations !== "object" ||
      isEmpty(this.organizations)
    ) {
      return false;
    }

    const organizations = Object.keys(this.organizations);
    const notificationsOtherOrgs = organizations.some(
      (org) => org !== organizationId
    );
    if (notificationsOtherOrgs) {
      return true;
    }

    // Get the `locations` object from the organization
    const locations = this.organizations[organizationId]?.locations;
    if (!locations) {
      return false;
    }
    const notificationsOtherLocs = Object.keys(locations).some(
      (loc) => loc !== locationId
    );
    if (notificationsOtherLocs) {
      return true;
    }

    return false;
  }

  /**
   * Returns the number of schedule badges for a specified organization and location.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   */
  public getScheduleBadges(organizationId: string, locationId: string) {
    // Return 0 if the `organizations` property is `null` or `undefined`,
    // or if the `organizations` object is empty (i.e. has no keys)
    if (
      !this.organizations ||
      typeof this.organizations !== "object" ||
      isEmpty(this.organizations)
    ) {
      return 0;
    }

    // Return 0 if the `locations` object is `null` or `undefined`,
    // or if the `sch` property of the specified location is `null` or `undefined`
    return (
      this.organizations[organizationId]?.locations?.[locationId]?.sch ?? 0
    );
  }

  /**
   * Removes a schedule badge for a specific organization and location.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   */
  public async removeScheduleBadges(
    organizationId: string,
    locationId: string
  ) {
    // Return early if the `organizations` object is empty,
    // or if there is no currently authenticated user
    if (isEmpty(this.organizations) || !AUTH.currentUser) {
      return;
    }

    // Get the number of schedule badges for the specified organization and location
    const schBadges = this.getScheduleBadges(organizationId, locationId);

    // Return early if the number of schedule badges is 0
    if (schBadges === 0) {
      return;
    }

    // Use the `remove` function to remove the `sch` property from the specified location
    await remove(
      ref(
        DATABASE,
        `users/${AUTH.currentUser.uid}/notifications/organizations/${organizationId}/locations/${locationId}/sch`
      )
    );
  }

  /**
   * Returns the number of conversation badges for a specific organization and location.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   * @param convId The ID of the conversation
   */
  public getConversationBadges(
    organizationId: string,
    locationId: string,
    convId: string
  ): number {
    // Return 0 if the `organizations` property is `null` or `undefined`,
    // or if the `organizations` object is empty (i.e. has no keys)
    if (
      !this.organizations ||
      typeof this.organizations !== "object" ||
      isEmpty(this.organizations)
    ) {
      return 0;
    }

    // Return 0 if the `locations` object is `null` or `undefined`,
    // or if the `conv` object is `null` or `undefined`,
    // or if the `conv` object does not have a property with the specified `convId`
    return (
      this.organizations[organizationId]?.locations?.[locationId]?.conv?.[
        convId
      ] ?? 0
    );
  }

  /**
   * Removes the for a specific organization, location, and conversation.
   * @param organizationId The ID of the organization
   * @param locationId The ID of the location
   * @param convId The ID of the conversation
   */
  public async removeConversationBadges(
    organizationId: string,
    locationId: string,
    convId: string
  ): Promise<void> {
    // Return early if the `organizations` object is empty,
    // or if there is no currently authenticated user
    if (isEmpty(this.organizations) || !AUTH.currentUser) {
      return;
    }

    // Get the number of conversation badges for the specified organization, location, and conversation
    const convBadges = this.getConversationBadges(
      organizationId,
      locationId,
      convId
    );

    // Return early if the number of conversation badges is 0
    if (convBadges === 0) {
      return;
    }

    // Use the `remove` function to remove the conversation badges from the specified conversation
    await remove(
      ref(
        DATABASE,
        `users/${AUTH.currentUser.uid}/notifications/organizations/${organizationId}/locations/${locationId}/conv/${convId}`
      )
    );
  }

  /**
   * Gets the total number of conversation badges for the specified location.
   *
   * @param organizationId - The ID of the organization.
   * @param locationId - The ID of the location.
   *
   * @returns The total number of conversation badges for the specified location.
   */
  public getAllConversationBadges(
    organizationId: string,
    locationId: string
  ): number {
    // Return 0 if the `organizations` property is `null` or `undefined`,
    // or if the `organizations` object is empty (i.e. has no keys)
    if (
      !this.organizations ||
      typeof this.organizations !== "object" ||
      isEmpty(this.organizations)
    ) {
      return 0;
    }

    // Use the `Array.reduce` method to sum the values of the `conv` object
    // inside the `locations` object of the organization
    return Object.values(
      this.organizations[organizationId]?.locations?.[locationId]?.conv ?? {}
    ).reduce((acc, quantity) => {
      return acc + quantity;
    }, 0);
  }
}
