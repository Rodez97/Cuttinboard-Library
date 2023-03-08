/**
 * The basic information about a Organization.
 * - An organization is a business that has multiple locations.
 * - An organization is the highest level of the hierarchy.
 * - An organization is the representation of a stripe subscription to the OWNER plan.
 */
export type Organization = {
  /**
   * The stripe's customer id.
   */
  customerId: string;
  /**
   * The number of locations the organization has.
   */
  locations: number;
  /**
   * The subscription item id of the organization.
   */
  subItemId: string;
  /**
   * The subscription id of the organization subscription to the OWNER plan in stripe.
   */
  subscriptionId: string;
  /**
   * The date the organization was cancelled.
   */
  cancellationDate: number;
  /**
   * The status of the subscription for the location in Stripe.
   * - This is used to determine if the location is active or not.
   * - This status is the same for all locations in the organization.
   * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
   */
  subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";

  /**
   * If the organization is had more than one location in the past.
   */
  hadMultipleLocations?: boolean;
  storageUsed: number;
  limits: {
    storage: string;
  };
};
