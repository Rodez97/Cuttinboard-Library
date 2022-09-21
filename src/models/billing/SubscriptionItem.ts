import { Price } from "./Price";

export interface SubscriptionItem {
  id: string;
  object: string;
  billing_thresholds?: Record<string, any>;
  created: number;
  metadata: Record<string, any>;
  price: Price;
  quantity: number;
  subscription: string;
  tax_rates?: Record<string, any>[];
}
