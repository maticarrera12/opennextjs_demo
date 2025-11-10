import { headers } from "next/headers";

import { ProfileSettingsClient } from "./_components/profile-settings-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LinkedAccount = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

type SerializedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
};

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("User session not found");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      theme: true,
      language: true,
    },
  });

  const user = userRecord ?? session.user;
  const userPlan = user.plan || "FREE";

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  const nonCredentialsAccounts = (accounts ?? []).filter(
    (account: LinkedAccount) => account.providerId !== "credentials"
  );

  const serializedAccounts: SerializedAccount[] = nonCredentialsAccounts.map((account) => ({
    id: account.id,
    providerId: account.providerId,
    accountId: account.accountId,
    createdAt: account.createdAt.toISOString(),
  }));

  return (
    <ProfileSettingsClient
      user={JSON.parse(JSON.stringify(user))}
      plan={userPlan}
      accounts={serializedAccounts}
    />
  );
};

export default page;
