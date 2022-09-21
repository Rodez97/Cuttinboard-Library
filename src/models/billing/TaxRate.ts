export interface TaxRate {
  id: string;
  object: string;
  active: boolean;
  country: string;
  created: number;
  description: string;
  display_name: string;
  inclusive: boolean;
  jurisdiction: string;
  livemode: boolean;
  metadata: Record<string, any>;
  percentage: number;
  state?: string;
  tax_type: string;
  /**
   * Any additional properties
   */
  [propName: string]: any;
}
