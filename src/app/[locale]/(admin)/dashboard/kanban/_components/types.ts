export type TaskStatus = "todo" | "in-progress" | "completed";

export interface TaskTag {
  label: string;
  color: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}

export interface Task {
  id: string;
  title: string;
  status: string; // References KanbanColumn.id
  dueDate?: Date | string | null;
  description?: string | null;
  comments?: number; // Optional for now as DB doesn't track yet
  attachments?: number; // Optional
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  tags?: any; // JSON from Prisma
  image?: string | null;
  priority?: string | null;
  order?: number;
  columnId?: string | null;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface Column {
  id: string;
  title: string;
  order?: number;
  color?: string | null;
  _count?: {
    tasks: number;
  };
}
