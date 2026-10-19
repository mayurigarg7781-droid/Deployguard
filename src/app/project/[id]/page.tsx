import DeployButton from "./DeployButton";
import DeploymentHistory from "./DeploymentHistory";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";


async function ProjectDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#090b10] p-6 text-slate-100 md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#10141d] p-6 md:p-8">
          <p className="text-sm text-blue-400">Project Details</p>

          <h1 className="mt-3 text-3xl font-semibold">{project.name}</h1>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Project ID</p>
              <p className="mt-2 break-all text-sm">{project.id}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-2">{project.status}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Environment</p>
              <p className="mt-2">{project.environment}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">GitHub Repository</p>

              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-blue-400 hover:underline"
                >
                  {project.githubUrl}
                </a>
              ) : (
                <p className="mt-2 text-slate-400">
                  No repository connected
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-slate-500">Description</p>
              <p className="mt-2">
                {project.description || "No description added yet."}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-slate-500">Created At</p>
              <p className="mt-2">
                {project.createdAt.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
    Create a deployment request for this project.
  </p>

  <DeployButton
    projectId={project.id}
    environment={project.environment}/>
    <DeploymentHistory projectId={project.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090b10] p-8 text-white">
          Loading project details...
        </main>
      }
    >
      <ProjectDetailsContent params={params} />
    </Suspense>
  );
}