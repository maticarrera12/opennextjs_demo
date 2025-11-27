"use client";

import React from "react";

import { authClient } from "@/lib/auth-client";
import { hasPermission, Permission } from "@/lib/permissions";

interface ProtectProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Protect({ permission, children, fallback = null }: ProtectProps) {
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const currentMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user.id
  );
  const role = currentMember?.role || "member";

  if (!hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
