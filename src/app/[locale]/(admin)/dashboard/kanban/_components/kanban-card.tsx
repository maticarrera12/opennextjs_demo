"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar01Icon,
  Comment01Icon,
  Attachment01Icon,
  MoreHorizontalIcon,
} from "hugeicons-react";
import Image from "next/image";
import { toast } from "sonner";

import { Task } from "./types";
import { deleteTask } from "@/actions/task-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskModal } from "@/hooks/use-task-modal";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
}

export default function KanbanCard({ task }: KanbanCardProps) {
  const { onOpen } = useTaskModal();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    const result = await deleteTask(task.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task deleted");
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-background border-2 border-primary/20 rounded-xl h-[200px]"
      />
    );
  }

  const tagColorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <Card className="mb-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
        <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0">
          <h3 className="font-medium text-sm leading-tight pr-4 line-clamp-2">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground"
              >
                <MoreHorizontalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen("edit", task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-4 pt-0 pb-3 space-y-3">
          {/* Image */}
          {task.image && (
            <div className="relative w-full h-32 rounded-md overflow-hidden border">
              <Image
                src={task.image}
                alt={task.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Priority Badge */}
          {task.priority && (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "font-normal text-[10px] px-2 py-0.5 h-5 capitalize",
                  task.priority === "high" &&
                    "border-red-300 text-red-700 dark:border-red-800 dark:text-red-400",
                  task.priority === "medium" &&
                    "border-orange-300 text-orange-700 dark:border-orange-800 dark:text-orange-400",
                  task.priority === "low" &&
                    "border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                )}
              >
                {task.priority}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(task.tags) && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag: any, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(
                    "font-normal text-[10px] px-2 py-0.5 h-5",
                    tagColorMap[tag.color || "gray"]
                  )}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar01Icon size={14} className="mr-1.5" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between border-t bg-muted/5 p-3 mt-1">
          <div className="flex items-center gap-3 text-muted-foreground">
            {task.comments !== undefined && task.comments > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Comment01Icon size={14} />
                <span>{task.comments}</span>
              </div>
            )}
            {task.attachments !== undefined && task.attachments > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Attachment01Icon size={14} />
                <span>{task.attachments}</span>
              </div>
            )}
          </div>

          <Avatar className="h-6 w-6 border-2 border-background">
            <AvatarImage src={task.user?.image || task.assigneeAvatar || undefined} />
            <AvatarFallback className="text-[10px]">
              {task.user?.name
                ? task.user.name.substring(0, 2).toUpperCase()
                : task.assigneeName
                  ? task.assigneeName.substring(0, 2).toUpperCase()
                  : "??"}
            </AvatarFallback>
          </Avatar>
        </CardFooter>
      </Card>
    </div>
  );
}
