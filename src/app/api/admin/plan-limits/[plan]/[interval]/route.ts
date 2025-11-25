import { NextResponse } from "next/server";

import { type PlanType, type PlanInterval } from "@/generated/client/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ plan: string; interval: string }> }
) {
  try {
    const { plan, interval } = await context.params;
    const body = await req.json();

    const updated = await prisma.planLimit.update({
      where: {
        plan_interval: {
          plan: plan as PlanType,
          interval: interval as PlanInterval,
        },
      },
      data: {
        monthlyCredits: body.monthlyCredits,
        maxProjectsPerMonth: body.maxProjectsPerMonth,
        maxAssetsPerProject: body.maxAssetsPerProject,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ error: "Unable to update plan limits" }, { status: 500 });
  }
}
