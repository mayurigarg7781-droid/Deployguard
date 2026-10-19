import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Update deployment status and logs
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedStatuses = [
      "PENDING",
      "RUNNING",
      "SUCCESS",
      "FAILED",
    ];

    if (
      typeof body.status !== "string" ||
      !allowedStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Use PENDING, RUNNING, SUCCESS, or FAILED.",
        },
        { status: 400 }
      );
    }

    const existingDeployment = await prisma.deployment.findUnique({
      where: { id },
    });

    if (!existingDeployment) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 }
      );
    }

    const deployment = await prisma.deployment.update({
      where: { id },
      data: {
        status: body.status,
        ...(typeof body.logs === "string" ? { logs: body.logs } : {}),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Deployment updated successfully",
      deployment,
    });
  } catch (error) {
    console.error("Failed to update deployment:", error);

    return NextResponse.json(
      { error: "Failed to update deployment" },
      { status: 500 }
    );
  }
}