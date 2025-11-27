// app/[locale]/organization/page.tsx
import { headers } from "next/headers";
import React from "react";

import { CreateOrganizationButton } from "./_components/create-organization-button";
import { DeleteOrganizationSection } from "./_components/delete-org-button";
import { Invites } from "./_components/invites";
import { Members } from "./_components/members";
import { OrganizationSelect } from "./_components/organization-select";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";

const OrganizationPage = async ({ params }: { params: { locale: string } }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale: params.locale });
    return null;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <CreateOrganizationButton />
      </div>

      <div className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-lg font-medium">Switch Organization</h3>
          <OrganizationSelect />
        </section>

        <Members />

        <Invites />

        <DeleteOrganizationSection />
      </div>
    </div>
  );
};

export default OrganizationPage;
