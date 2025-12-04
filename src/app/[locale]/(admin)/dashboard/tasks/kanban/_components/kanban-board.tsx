"use client";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { FilterHorizontalIcon, PlusSignIcon } from "hugeicons-react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { ColumnModal } from "./column-modal";
import KanbanCard from "./kanban-card";
import KanbanColumn from "./kanban-column";
import { TaskModal } from "./task-modal";
import { Column, Task } from "./types";
import { reorderColumns } from "@/actions/column-actions";
import { updateTaskStatus } from "@/actions/task-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColumnModal } from "@/hooks/use-column-modal";
import { useTaskModal } from "@/hooks/use-task-modal";

interface KanbanBoardProps {
  initialTasks: Task[];
  initialColumns: Column[];
}

export default function KanbanBoard({ initialTasks, initialColumns }: KanbanBoardProps) {
  // Use local state for optimistic updates, but sync with props when they change (revalidation)
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { onOpen } = useTaskModal();
  const { onOpen: onOpenColumn } = useColumnModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Filtered tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (activeTab === "all") return tasks;
    const column = columns.find((c) => c.id === activeTab);
    if (!column) return tasks;
    return tasks.filter((t) => t.status === column.id);
  }, [tasks, activeTab, columns]);

  // Visible columns based on active tab
  const visibleColumns = useMemo(() => {
    if (activeTab === "all") return columns;
    return columns.filter((c) => c.id === activeTab);
  }, [activeTab, columns]);

  const columnIds = useMemo(() => visibleColumns.map((c) => c.id), [visibleColumns]);

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    } else if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isActiveColumn = active.data.current?.type === "Column";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    // Handle Column dragging
    if (isActiveColumn && isOverColumn) {
      setColumns((columns) => {
        const activeIndex = columns.findIndex((c) => c.id === activeId);
        const overIndex = columns.findIndex((c) => c.id === overId);

        if (activeIndex !== overIndex) {
          return arrayMove(columns, activeIndex, overIndex);
        }
        return columns;
      });
      return;
    }

    // Handle Task dragging
    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        if (activeIndex !== overIndex) {
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return tasks;
      });
    }

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newStatus = over.id as string;

        if (tasks[activeIndex].status !== newStatus) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = newStatus;
          return arrayMove(newTasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveColumn(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isActiveColumn = active.data.current?.type === "Column";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    // Handle Column reordering
    if (isActiveColumn && isOverColumn) {
      const newColumnOrder = columns.map((c) => c.id);
      const activeIndex = newColumnOrder.indexOf(activeId);
      const overIndex = newColumnOrder.indexOf(overId);
      const reordered = arrayMove(newColumnOrder, activeIndex, overIndex);

      // Save previous state for revert
      const previousColumns = [...columns];

      try {
        const result = await reorderColumns(reordered);
        if (result.error) {
          toast.error(result.error);
          // Revert by restoring previous order
          setColumns(previousColumns);
        }
      } catch (e) {
        toast.error("Failed to reorder columns");
        // Revert by restoring previous order
        setColumns(previousColumns);
      }
      return;
    }

    // Handle Task moving
    if (isActiveTask) {
      let newStatus = "";

      if (isOverTask) {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          newStatus = overTask.status;
        }
      } else if (isOverColumn) {
        newStatus = over.id as string;
      }

      if (newStatus) {
        try {
          await updateTaskStatus(activeId, newStatus, 0);
        } catch (e) {
          toast.error("Failed to save move");
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TaskModal columns={columns} />
      <ColumnModal />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All Tasks{" "}
              <span className="ml-2 bg-background/50 px-1.5 py-0.5 rounded-full text-[10px]">
                {tasks.length}
              </span>
            </TabsTrigger>
            {columns.map((column) => (
              <TabsTrigger key={column.id} value={column.id} className="text-xs md:text-sm">
                {column.title}{" "}
                <span className="ml-2 bg-background/50 px-1.5 py-0.5 rounded-full text-[10px]">
                  {tasks.filter((t) => t.status === column.id).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2">
            <FilterHorizontalIcon size={16} />
            Filter & Sort
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onOpenColumn("create")}>
            <PlusSignIcon size={16} />
            Add Column
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onOpen("create")}
          >
            <PlusSignIcon size={16} />
            Add New Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
            {visibleColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.status === column.id)}
              />
            ))}
          </div>
        </SortableContext>

        {mounted &&
          createPortal(
            <DragOverlay>
              {activeTask && <KanbanCard task={activeTask} />}
              {activeColumn && (
                <div className="w-[350px] min-w-[350px] rounded-lg bg-muted/30 p-4 opacity-90">
                  <h3 className="font-semibold text-base">{activeColumn.title}</h3>
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
