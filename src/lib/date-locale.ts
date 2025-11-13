import type { Locale } from "date-fns";
import { enUS, es } from "date-fns/locale";

export const dateLocaleMap: Record<string, Locale> = {
  en: enUS,
  es: es,
};
