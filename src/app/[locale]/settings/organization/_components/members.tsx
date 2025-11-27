// app/[locale]/organization/_components/members.tsx
"use client";

import { Delete02Icon } from "hugeicons-react";
import { toast } from "sonner";

import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { Protect } from "@/components/rbac/protect";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { canManageMember } from "@/lib/permissions";

export function Members() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user.id
  );
  const currentUserRole = currentMember?.role || "member";

  function removeMember(memberId: string) {
    return authClient.organization.removeMember({
      memberIdOrEmail: memberId,
    });
  }

  async function updateRole(memberId: string, newRole: string) {
    await authClient.organization.updateMemberRole(
      {
        memberId,
        role: newRole as "admin" | "member" | "owner",
      },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">Manage access and roles.</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeOrganization?.members?.map((member) => {
            // Lógica de seguridad por fila
            const isMe = member.userId === session?.user.id;
            const canManageThisUser = canManageMember(currentUserRole, member.role) && !isMe;

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.user.name}</span>
                    <span className="text-xs text-muted-foreground">{member.user.email}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {/* Si puedo editar al usuario, muestro un Select, si no, un Badge */}
                  {canManageThisUser ? (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(val) => updateRole(member.id, val)}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {/* Solo el Owner puede transferir propiedad (logic complex needed for that usually) */}
                        {currentUserRole === "owner" && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {canManageThisUser && (
                    <Protect permission="member:delete">
                      <BetterAuthActionButton
                        requireAreYouSure
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        action={() => removeMember(member.id)}
                      >
                        <Delete02Icon className="w-4 h-4" />
                      </BetterAuthActionButton>
                    </Protect>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
