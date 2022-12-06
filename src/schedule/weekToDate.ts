/**
 * Gets a date by year and ISO week number.
 *
 * @param year The year.
 * @param week The ISO week number.
 * @param weekDay The day of the week (defaults to Monday).
 * @returns The date corresponding to the given year, week, and week day.
 */
export function weekToDate(year: number, week: number, weekDay = 1): Date {
  // Calculates the zero-based day of the week (0 = Sunday, 6 = Saturday)
  const getZeroBasedWeekDay = (date: Date) => (date.getDay() + 6) % 7;

  // Calculates the one-based day of the week (1 = Monday, 7 = Sunday)
  const getWeekDay = (date: Date) => getZeroBasedWeekDay(date) + 1;

  // Convert the week number to zero-based (e.g. 1 => 0)
  const zeroBasedWeek = week - 1;

  // Convert the week day number to zero-based (e.g. 1 (Monday) => 0)
  const zeroBasedWeekDay = weekDay - 1;

  // Calculate the number of days from the start of the year to the first day of the week
  let days = zeroBasedWeek * 7 + zeroBasedWeekDay;

  // Add 1 to the number of days because dates in JavaScript are zero-based
  days += 1;

  // Create a date object representing the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);

  // Get the ISO week day of the first day of the year
  const firstWeekDay = getWeekDay(firstDayOfYear);

  // Get the zero-based ISO week day of the first day of the year
  const zeroBasedFirstWeekDay = getZeroBasedWeekDay(firstDayOfYear);

  // If the year starts on a week 52 or week 53 day
  if (firstWeekDay > 4) {
    // Add the number of days from the first day of the year to the start of the first week
    days += 8 - firstWeekDay;

    // Else the year starts on a week 1 day
  } else {
    // Subtract the number of days from the start of the year to the first day of the year
    days -= zeroBasedFirstWeekDay;
  }

  // Create a date object representing the first day of the week
  return new Date(year, 0, days);
}
