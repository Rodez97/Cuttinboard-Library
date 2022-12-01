export interface Price {
  /**
   * Whether the price can be used for new purchases.
   */
  active: boolean;
  currency: string;
  unit_amount: number;
  /**
   * A brief description of the price.
   */
  description: string | null;
  /**
   * One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
   */
  type: "one_time" | "recurring";
  /**
   * The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
   */
  interval: "day" | "month" | "week" | "year" | null;
  /**
   * The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
   */
  interval_count: number | null;
  /**
   * Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
   */
  trial_period_days: number | null;
  /**
   * Any additional properties
   */
  [propName: string]: unknown;
}
