import { DefaultScheduleSettings, IScheduleSettings } from "./ScheduleRTDB";

export type LocationSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export interface ILocationSettings {
  positions?: string[];
  schedule: IScheduleSettings;
}

export interface ILocationAddress {
  addressLine?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface ILocationLimits {
  employees: number;
  storage: string;
}

/**
 * The interface implemented by Location classes.
 */
export interface ILocation {
  name: string;
  address?: ILocationAddress;
  intId?: string;
  subscriptionStatus: LocationSubscriptionStatus;
  storageUsed: number;
  limits: ILocationLimits;
  organizationId: string;
  subscriptionId: string;
  subItemId: string;
  members: string[];
  supervisors?: string[];
  settings: ILocationSettings;
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}

/**
 * Gets the custom positions for the location.
 */
export function getLocationPositions(location: ILocation) {
  return location.settings?.positions ?? [];
}

/**
 * Gets the cloud storage reference for the location.
 */
export function getLocationStoragePath(location: ILocation) {
  return `organizations/${location.organizationId}/locations/${location.id}`;
}

export function getLocationScheduleSettings(location: ILocation) {
  if (location.settings?.schedule) {
    return location.settings.schedule;
  } else {
    return DefaultScheduleSettings;
  }
}

/**
 * Gets the access status of the location based on the subscription status.
 */
export function getLocationAccessStatus({ subscriptionStatus }: ILocation) {
  if (["past_due", "unpaid"].includes(subscriptionStatus)) {
    return "inactive";
  }
  if (subscriptionStatus === "canceled") {
    return "canceled";
  }
  if (!["active", "trialing"].includes(subscriptionStatus)) {
    return "error";
  }
  return "active";
}

/**
 * Gets the current usage of the location and the limits.
 */
export function getLocationUsage(location: ILocation) {
  return {
    employeesCount: Number(location.members?.length ?? 0),
    employeesLimit: Number(location.limits.employees ?? 0),
    storageUsed: Number(location.storageUsed ?? 0),
    storageLimit: Number(location.limits.storage ?? 0),
  };
}
