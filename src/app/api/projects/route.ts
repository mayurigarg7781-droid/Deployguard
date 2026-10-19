import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Fetch all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const githubUrl =
      typeof body.githubUrl === "string"
        ? body.githubUrl.trim()
        : null;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        githubUrl: githubUrl || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}