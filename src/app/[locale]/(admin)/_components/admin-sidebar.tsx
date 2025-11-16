"use client";

import {
  Analytics01Icon,
  DashboardSquare02Icon,
  Dollar01Icon,
  SparklesIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";

import AppSidebar, { SidebarSection } from "@/components/ui/app-sidebar";
export default function AdminSidebar() {
  const t = useTranslations("admin");

  const sidebarSections = [
    {
      label: t("sections.main"),
      items: [
        {
          name: t("menu.overview"),
          href: "/dashboard",
          icon: DashboardSquare02Icon,
        },
        {
          name: t("menu.usersAnalytics"),
          href: "/dashboard/users",
          icon: Analytics01Icon,
        },
        {
          name: t("menu.revenueBilling"),
          href: "/dashboard/revenue",
          icon: Dollar01Icon,
        },
        {
          name: t("menu.productUsage"),
          href: "/dashboard/usage",
          icon: SparklesIcon,
        },
      ],
    },
  ];

  return (
    <AppSidebar
      title={t("title")}
      sections={sidebarSections as SidebarSection[]}
      logoutLabel={t("menu.logout")}
    />
  );
}
