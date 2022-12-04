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
export const Positions = [
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
