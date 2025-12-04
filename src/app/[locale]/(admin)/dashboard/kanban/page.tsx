import { headers } from "next/headers";
import React from "react";

import KanbanBoard from "./_components/kanban-board";
import PageBreadcrumb from "../../_components/page-bread-crumb";
import { getColumns } from "@/actions/column-actions";
import { getTasks } from "@/actions/task-actions";
import { auth } from "@/lib/auth";

export default async function KanbanPage() {
  // Ensure authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let tasks: any[] = [];
  let columns: any[] = [];

  if (session?.user) {
    tasks = await getTasks();
    columns = await getColumns();
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-100px)]">
      <PageBreadcrumb pageTitle="Kanban" />
      <div className="flex-1">
        <KanbanBoard initialTasks={tasks as any} initialColumns={columns as any} />
      </div>
    </div>
  );
}
