"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getEvents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      start: "asc",
    },
  });

  // Transform for FullCalendar
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start.toISOString().split("T")[0], // Simplified for now, should handle datetime
    end: event.end ? event.end.toISOString().split("T")[0] : undefined,
    allDay: event.allDay,
    extendedProps: {
      calendar: event.level || "primary",
    },
  }));
}

export async function createEvent(data: {
  title: string;
  start: string;
  end?: string;
  level?: string;
  allDay?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.calendarEvent.create({
      data: {
        title: data.title,
        start: new Date(data.start),
        end: data.end ? new Date(data.end) : null,
        level: data.level || "primary",
        allDay: data.allDay ?? true, // Default to all day for now as per UI
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: "Failed to create event" };
  }
}

export async function updateEvent(
  eventId: string,
  data: {
    title: string;
    start: string;
    end?: string;
    level?: string;
    allDay?: boolean;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.calendarEvent.update({
      where: {
        id: eventId,
        userId: session.user.id,
      },
      data: {
        title: data.title,
        start: new Date(data.start),
        end: data.end ? new Date(data.end) : null,
        level: data.level,
        allDay: data.allDay,
      },
    });

    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to update event:", error);
    return { error: "Failed to update event" };
  }
}

export async function deleteEvent(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.calendarEvent.delete({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { error: "Failed to delete event" };
  }
}
