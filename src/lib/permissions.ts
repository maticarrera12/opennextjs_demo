// src/lib/permissions.ts

export type Role = "owner" | "admin" | "member";

export type Permission =
  | "org:update"
  | "org:delete"
  | "member:invite"
  | "member:update"
  | "member:delete"
  | "billing:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "org:update",
    "org:delete",
    "member:invite",
    "member:update",
    "member:delete",
    "billing:manage",
  ],
  admin: ["org:update", "member:invite", "member:update", "member:delete", "billing:manage"],
  member: [],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role as Role] || []).includes(permission);
}

export function canManageMember(currentUserRole: string, targetMemberRole: string): boolean {
  if (currentUserRole === "member") return false;
  if (currentUserRole === "owner") return true;
  if (currentUserRole === "admin" && targetMemberRole === "owner") return false;
  if (currentUserRole === "admin" && targetMemberRole === "admin") return false;
  return true;
}
