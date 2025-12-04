"use client";

import {
  Analytics01Icon,
  Calendar01Icon,
  DashboardSquare02Icon,
  Dollar01Icon,
  SparklesIcon,
  // TaskDaily01Icon,
  Task01Icon,
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
        {
          name: t("menu.calendar"),
          href: "/dashboard/calendar",
          icon: Calendar01Icon,
        },
        {
          name: t("menu.kanban"),
          href: "/dashboard/kanban",
          icon: Task01Icon,
        },
        // {
        //   name: t("menu.tasks"),
        //   icon: TaskDaily01Icon,
        //   href: "#",
        //   items: [
        //     {
        //       name: t("menu.list"),
        //       href: "/dashboard/tasks/list",
        //       icon: Task01Icon,
        //     },
        //     {
        //       name: t("menu.kanban"),
        //       href: "/dashboard/tasks/kanban",
        //       icon: DashboardSquare02Icon,
        //     },
        //   ],
        // },
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
