import { Timestamp } from "firebase/firestore";

export type Organization = {
  customerId: string;
  locations: number;
  subItemId: string;
  subscriptionId: string;
  cancellationDate: Timestamp;
  subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
};
