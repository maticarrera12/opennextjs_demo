"use client";

import { useTranslations } from "next-intl";

interface MdxTProps {
  k: string;
  ns?: string;
  values?: Record<string, string | number>;
}

export function MdxT({ k, ns = "docs", values }: MdxTProps) {
  const t = useTranslations(ns);
  return <>{t(k, values)}</>;
}
