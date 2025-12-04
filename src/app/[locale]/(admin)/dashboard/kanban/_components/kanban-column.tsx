"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontalIcon, PlusSignIcon } from "hugeicons-react";
import { useMemo } from "react";
import { toast } from "sonner";

import KanbanCard from "./kanban-card";
import { Column, Task } from "./types";
import { deleteColumn } from "@/actions/column-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColumnModal } from "@/hooks/use-column-modal";
import { useTaskModal } from "@/hooks/use-task-modal";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { onOpen } = useTaskModal();
  const { onOpen: onOpenColumn } = useColumnModal();
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: false, // Enable dragging columns
  });

  const handleDelete = async () => {
    const result = await deleteColumn(column.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Column deleted successfully");
    }
  };

  const handleClearAll = async () => {
    // TODO: Implement clear all tasks in column
    toast.info("Clear all tasks feature coming soon");
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const columnColorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const columnColor = column.color || "gray";
  const taskCount = column._count?.tasks ?? tasks.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-full w-[350px] min-w-[350px] flex-col rounded-lg bg-muted/30 p-4",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <h3 className="font-semibold text-base">{column.title}</h3>
          <Badge
            variant="secondary"
            className={cn("rounded-full px-2 h-5 text-xs font-medium", columnColorMap[columnColor])}
          >
            {taskCount}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontalIcon size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  onOpenColumn("edit", { id: column.id, title: column.title, color: column.color })
                }
              >
                Edit Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearAll}>Clear All Tasks</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px] pb-4">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-[100px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-background/50 text-sm text-muted-foreground">
            No tasks
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-primary mt-2"
        onClick={() => onOpen("create", { status: column.id })}
      >
        <PlusSignIcon size={16} className="mr-2" />
        Add New Task
      </Button>
    </div>
  );
}
