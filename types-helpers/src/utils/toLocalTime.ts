import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const toLocalTime = (date: Date) => {
  const before = dayjs(date);
  const tzOffset = new Date().getTimezoneOffset();
  const after = before.utcOffset(tzOffset).utc(true);
  return after;
};
