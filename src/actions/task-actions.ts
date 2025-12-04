"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// We will need to align types
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getTasks() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return tasks;
}

export async function createTask(data: {
  title: string;
  status: string;
  priority?: string;
  dueDate?: Date;
  description?: string;
  tags?: Array<{ label: string; color: string }>;
  image?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Get the last order in the column to append
    const lastTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        status: data.status,
      },
      orderBy: {
        order: "desc",
      },
    });

    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const taskData = {
      title: data.title,
      status: data.status,
      priority: data.priority || "medium",
      dueDate: data.dueDate,
      description: data.description || null,
      tags: data.tags ?? undefined,
      image: data.image || null,
      order: newOrder,
      userId: session.user.id,
      assigneeName: session.user.name,
      assigneeAvatar: session.user.image,
    };

    console.log("Creating task with data:", {
      ...taskData,
      image: taskData.image ? `${taskData.image.substring(0, 50)}...` : null,
    });

    const task = await prisma.task.create({
      data: taskData,
    });

    console.log("Task created successfully:", {
      id: task.id,
      image: task.image ? `${task.image.substring(0, 50)}...` : null,
    });

    revalidatePath("/dashboard/tasks/kanban");
    return { data: task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { error: "Failed to create task" };
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string, newOrder: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.task.update({
      where: {
        id: taskId,
        userId: session.user.id, // Ensure ownership
      },
      data: {
        status: newStatus,
        order: newOrder,
      },
    });

    revalidatePath("/dashboard/tasks/kanban");
    return { success: true };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { error: "Failed to update task" };
  }
}

export async function updateTask(taskId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.task.update({
      where: { id: taskId, userId: session.user.id },
      data,
    });
    revalidatePath("/dashboard/tasks/kanban");
    return { success: true };
  } catch (error) {
    return { error: "Failed update" };
  }
}

export async function deleteTask(taskId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.task.delete({
      where: { id: taskId, userId: session.user.id },
    });
    revalidatePath("/dashboard/tasks/kanban");
    return { success: true };
  } catch (error) {
    return { error: "Failed delete" };
  }
}
