import { isEmpty } from "lodash";
import { INotifications } from "./INotifications";

/**
 * Calculates the total number of badges (notifications) for all the user's direct messages (DMs)
 */
export function allDMBadges(notifications: INotifications): number {
  // Return 0 if the `dm` property is not an object or is empty
  if (
    !notifications.dm ||
    typeof notifications.dm !== "object" ||
    isEmpty(notifications.dm)
  ) {
    return 0;
  }

  // Use the `Object.values` method to get an array of the notification quantities
  const values = Object.values(notifications.dm);

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
export function getDMBadge(
  notifications: INotifications,
  dmId: string
): number {
  // Return 0 if the `dm` property is not an object or is empty
  if (
    !notifications.dm ||
    typeof notifications.dm !== "object" ||
    isEmpty(notifications.dm)
  ) {
    return 0;
  }

  // Return 0 if the `dm` object does not have a property with the specified `dmId`
  if (!notifications.dm[dmId]) {
    return 0;
  }

  // Return the notification quantity for the specified `dmId`
  return notifications.dm[dmId];
}

/**
 * Calculates the total number of badges (notifications) for a specific location in an organization.
 * @param organizationId The ID of the organization
 * @param locationId The ID of the location
 */
export function getAllBadgesByLocation(
  notifications: INotifications,
  organizationId: string,
  locationId: string
): number {
  // Return 0 if the `organizations` property is not an object or is empty
  if (
    !notifications.organizations ||
    typeof notifications.organizations !== "object" ||
    isEmpty(notifications.organizations)
  ) {
    return 0;
  }

  // Return 0 if the `organizations` object does not have a property with the specified `organizationId`,
  // or if the organization does not have a property with the specified `locationId`
  const organization = notifications.organizations[organizationId];
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
export function haveNotificationsInOtherLocations(
  notifications: INotifications,
  organizationId: string,
  locationId: string
): boolean {
  // Return false if the `organizations` property is not an object or is empty,
  // or if the `organizations` object does not have a property with the specified `organizationId`,
  // or if the organization does not have a `locations` property
  if (
    !notifications.organizations ||
    typeof notifications.organizations !== "object" ||
    isEmpty(notifications.organizations)
  ) {
    return false;
  }

  const organizations = Object.keys(notifications.organizations);
  const notificationsOtherOrgs = organizations.some(
    (org) => org !== organizationId
  );
  if (notificationsOtherOrgs) {
    return true;
  }

  // Get the `locations` object from the organization
  const locations = notifications.organizations[organizationId]?.locations;
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
export function getScheduleBadges(
  notifications: INotifications,
  organizationId: string,
  locationId: string
) {
  // Return 0 if the `organizations` property is `null` or `undefined`,
  // or if the `organizations` object is empty (i.e. has no keys)
  if (
    !notifications.organizations ||
    typeof notifications.organizations !== "object" ||
    isEmpty(notifications.organizations)
  ) {
    return 0;
  }

  // Return 0 if the `locations` object is `null` or `undefined`,
  // or if the `sch` property of the specified location is `null` or `undefined`
  return (
    notifications.organizations[organizationId]?.locations?.[locationId]?.sch ??
    0
  );
}

/**
 * Returns the number of conversation badges for a specific organization and location.
 * @param organizationId The ID of the organization
 * @param locationId The ID of the location
 * @param convId The ID of the conversation
 */
export function getConversationBadges(
  notifications: INotifications,
  organizationId: string,
  locationId: string,
  convId: string
): number {
  // Return 0 if the `organizations` property is `null` or `undefined`,
  // or if the `organizations` object is empty (i.e. has no keys)
  if (
    !notifications.organizations ||
    typeof notifications.organizations !== "object" ||
    isEmpty(notifications.organizations)
  ) {
    return 0;
  }

  // Return 0 if the `locations` object is `null` or `undefined`,
  // or if the `conv` object is `null` or `undefined`,
  // or if the `conv` object does not have a property with the specified `convId`
  return (
    notifications.organizations[organizationId]?.locations?.[locationId]
      ?.conv?.[convId] ?? 0
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
export function getAllConversationBadges(
  notifications: INotifications,
  organizationId: string,
  locationId: string
): number {
  // Return 0 if the `organizations` property is `null` or `undefined`,
  // or if the `organizations` object is empty (i.e. has no keys)
  if (
    !notifications.organizations ||
    typeof notifications.organizations !== "object" ||
    isEmpty(notifications.organizations)
  ) {
    return 0;
  }

  // Use the `Array.reduce` method to sum the values of the `conv` object
  // inside the `locations` object of the organization
  return Object.values(
    notifications.organizations[organizationId]?.locations?.[locationId]
      ?.conv ?? {}
  ).reduce((acc, quantity) => {
    return acc + quantity;
  }, 0);
}
