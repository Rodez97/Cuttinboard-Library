/**
 * The week string format used in shifts.
 * @example `W-45-2020` for the 45th week of 2020.
 */
export const WEEKFORMAT: "[W]-W-YYYY" = "[W]-W-YYYY" as const;

/**
 * The time string format used in shifts to represent the start and end time of a shift.
 * @example `26-09-1997 20:00` for the 20:00 of the 26th of September 1997.
 */
export const SHIFTFORMAT: "DD-MM-YYYY HH:mm" = "DD-MM-YYYY HH:mm" as const;

/**
 * An array of default restaurant positions to help the user choose a position
 */
export const POSITIONS = [
  "Back of House",
  "Baker",
  "Barista",
  "Bartender",
  "Busser",
  "Cashier",
  "Chef",
  "Cook",
  "Delivery",
  "Dishwasher",
  "Drive-Thru",
  "Expeditor",
  "Front of House",
  "Grill",
  "Host",
  "Kitchen",
  "Manager",
  "Prep Cook",
  "Runner",
  "Server",
  "Shift Leader",
  "Utility",
  "Sommelier",
  "Steward",
  "Barback",
];

/**
 * The Stripe product ID.
 */
export const STRIPE_PRODUCT_ID = "prod_MINsulkDhsnMys";

/**
 * The Stripe price ID.
 */
export const STRIPE_PRICE_ID = "price_1LzJiRCYVoOESVglTGNse4Wr";

/**
 * Maximum number of documents that can be uploaded by the user.
 */
export const MAX_DOCUMENTS = 20;

/**
 * Maximum file size of a document that can be uploaded by the user.
 */
export const MAX_FILE_SIZE = 1024 * 1024 * 8; // 8MB

export const ANALYTICS_EVENTS = [
  "shifts_created",
  "shifts_deleted",
  "shifts_updated",
  "notes_created",
  "notes_deleted",
  "notes_updated",
  "drawers_created",
  "drawers_deleted",
  "drawers_updated",
];
