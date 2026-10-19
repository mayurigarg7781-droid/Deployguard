import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch deployment history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const deployments = await prisma.deployment.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(deployments);
  } catch (error) {
    console.error("Failed to fetch deployments:", error);

    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}

// Create a deployment request
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const deployment = await prisma.deployment.create({
      data: {
        projectId: project.id,
        environment:
          typeof body.environment === "string"
            ? body.environment
            : project.environment,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Deployment request created successfully",
        deployment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create deployment:", error);

    return NextResponse.json(
      { error: "Failed to create deployment" },
      { status: 500 }
    );
  }
}