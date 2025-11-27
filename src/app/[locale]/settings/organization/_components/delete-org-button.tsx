"use client";

import { Alert02Icon } from "hugeicons-react";
import { useState } from "react";
import { toast } from "sonner";

import { Protect } from "@/components/rbac/protect";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function DeleteOrganizationSection() {
  const [loading, setLoading] = useState(false);
  const { data: activeOrg } = authClient.useActiveOrganization();

  const handleDelete = async () => {
    if (!activeOrg) return;
    const confirm = window.confirm("Are you strictly sure? This cannot be undone.");
    if (!confirm) return;

    setLoading(true);
    await authClient.organization.delete(
      {
        organizationId: activeOrg.id,
      },
      {
        onSuccess: () => {
          toast.success("Organization deleted");
          window.location.reload(); // Recargar para limpiar estado
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <Protect permission="org:delete">
      <div className="border border-red-200 bg-red-50 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 className="text-red-900 font-bold flex items-center gap-2">
            <Alert02Icon className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-red-700 text-sm mt-1">
            Permanently delete this organization and all its data.
          </p>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Delete Organization"}
        </Button>
      </div>
    </Protect>
  );
}
