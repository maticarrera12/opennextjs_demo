import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";

export async function assertPermission(requiredPermission: Permission) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.session.activeOrganizationId) {
    throw new Error("Unauthorized: No active organization");
  }

  const sessionWithUser = session.session as typeof session.session & {
    user?: { orgRole?: string };
  };
  const userRole = sessionWithUser.user?.orgRole || "member";

  if (!hasPermission(userRole, requiredPermission)) {
    throw new Error(`Forbidden: Missing permission ${requiredPermission}`);
  }

  return {
    user: session.user,
    orgId: session.session.activeOrganizationId,
  };
}
