import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { theme, language } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { theme, language },
    select: { theme: true, language: true },
  });

  return NextResponse.json(updated);
}
