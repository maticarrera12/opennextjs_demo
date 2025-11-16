"use client";

import {
  AiBrain03Icon,
  CloudUploadIcon,
  CreditCardIcon,
  DashboardSquare02Icon,
  SecurityValidationIcon,
} from "hugeicons-react";
import { useTranslations } from "next-intl";
import React from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FeatureTabs() {
  const t = useTranslations("featureTabs");

  return (
    <Tabs defaultValue="auth" className="w-full max-w-4xl py-20 px-4  md:mx-auto space-y-3">
      {/* TAB LIST */}
      <TabsList className="flex w-full justify-between bg-card/60 backdrop-blur-md py-8 px-2 rounded-full border border-border">
        {[
          { value: "auth", label: t("tabs.auth"), icon: SecurityValidationIcon },
          { value: "payments", label: t("tabs.payments"), icon: CreditCardIcon },
          { value: "storage", label: t("tabs.storage"), icon: CloudUploadIcon },
          { value: "admin", label: t("tabs.admin"), icon: DashboardSquare02Icon },
          { value: "ai", label: t("tabs.ai"), icon: AiBrain03Icon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 rounded-full py-6 text-base font-medium transition-all 
                data-[state=active]:bg- dark:transparent data-[state=active]:bg-transparent  data-[state=active]:text-dark dark:data-[state=active]:text-white 
                data-[state=active]:shadow-md hover:bg-muted/30 flex items-center justify-center gap-2"
            >
              <Icon className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* AUTH */}
      <TabsContent value="auth">
        <FeatureCard
          icon={SecurityValidationIcon}
          title={t("auth.title")}
          items={t.raw("auth.items") as string[]}
        />
      </TabsContent>

      {/* PAYMENTS */}
      <TabsContent value="payments">
        <FeatureCard
          icon={CreditCardIcon}
          title={t("payments.title")}
          items={t.raw("payments.items") as string[]}
        />
      </TabsContent>

      {/* STORAGE */}
      <TabsContent value="storage">
        <FeatureCard
          icon={CloudUploadIcon}
          title={t("storage.title")}
          items={t.raw("storage.items") as string[]}
        />
      </TabsContent>

      {/* ADMIN DASHBOARD */}
      <TabsContent value="admin">
        <FeatureCard
          icon={DashboardSquare02Icon}
          title={t("admin.title")}
          items={t.raw("admin.items") as string[]}
        />
      </TabsContent>

      {/* AI */}
      <TabsContent value="ai">
        <FeatureCard
          icon={AiBrain03Icon}
          title={t("ai.title")}
          items={t.raw("ai.items") as string[]}
        />
      </TabsContent>
    </Tabs>
  );
}

/* ✅ Reusable FeatureCard component */
function FeatureCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-6 bg-card/60 backdrop-blur-md border border-border rounded-2xl space-y-4">
      <div className="bg-card inline-flex items-center justify-center w-14 h-14 rounded-xl mb-2">
        <Icon className="dark:text-white text-black" size={28} />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
