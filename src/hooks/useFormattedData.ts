"use client";

import { useFormatter } from "next-intl";
import type { DateTimeFormatOptions } from "use-intl";

export function useFormattedDate(
  date: Date = new Date(),
  options: DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "short" }
) {
  const formatter = useFormatter();

  return formatter.dateTime(date, options);
}
