"use client";

import { Delete02Icon } from "hugeicons-react";

import { CreateInviteButton } from "./create-invite-button";
import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { Protect } from "@/components/rbac/protect";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

export function Invites() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const pendingInvites = activeOrganization?.invitations?.filter(
    (invite) => invite.status === "pending"
  );

  function cancelInvitation(invitationId: string) {
    return authClient.organization.cancelInvitation({ invitationId });
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pending Invitations</h2>
          <p className="text-sm text-muted-foreground">People waiting to join.</p>
        </div>

        <Protect permission="member:invite">
          <CreateInviteButton />
        </Protect>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvites?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                No pending invitations
              </TableCell>
            </TableRow>
          )}
          {pendingInvites?.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{invitation.role}</Badge>
              </TableCell>
              <TableCell>{new Date(invitation.expiresAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {/* Solo Admins/Owners pueden cancelar invitaciones */}
                <Protect permission="member:invite">
                  <BetterAuthActionButton
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    action={() => cancelInvitation(invitation.id)}
                  >
                    <Delete02Icon className="w-4 h-4" />
                  </BetterAuthActionButton>
                </Protect>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
