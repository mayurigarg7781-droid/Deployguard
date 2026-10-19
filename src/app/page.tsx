"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  repo: string;
  status: string;
  version: string;
  environment: string;
};
type Deployment = {
  id: string;
  projectId: string;
  status: string;
  environment: string;
  version: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
};

const initialProjects = [
  {
    name: "Portfolio Website",
    repo: "mayuri/portfolio",
    status: "Running",
    version: "v1.4.2",
    environment: "Production",
  },
  {
    name: "Payment API",
    repo: "mayuri/payment-api",
    status: "Running",
    version: "v2.1.0",
    environment: "Production",
  },
  {
    name: "Admin Dashboard",
    repo: "mayuri/admin-panel",
    status: "Failed",
    version: "v1.0.8",
    environment: "Staging",
  },
];

const navigation = [
  "Dashboard",
  "Projects",
  "Deployments",
  "Monitoring",
  "Activity Logs",
  "Settings",
];

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
const [projects, setProjects] = useState<Project[]>([]);
const [projectsLoaded, setProjectsLoaded] = useState(false);
const [deployments, setDeployments] = useState<Deployment[]>([]);
const [deploymentsLoaded, setDeploymentsLoaded] = useState(false);
const totalDeployments = deployments.length;

const successfulDeployments = deployments.filter(
  (deployment) => deployment.status === "SUCCESS"
).length;

const failedDeployments = deployments.filter(
  (deployment) => deployment.status === "FAILED"
).length;

const pendingDeployments = deployments.filter(
  (deployment) => deployment.status === "PENDING"
).length;

useEffect(() => {
  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();

      setProjects(
        data.map((project: {
  id: string;
  name: string;
  description?: string | null;
  githubUrl?: string | null;
  status: string;
  environment: string;
}) => ({
  id: project.id,
  name: project.name,
          repo: project.githubUrl || "Repository not connected",
          status:
            project.status === "RUNNING"
              ? "Running"
              : project.status === "FAILED"
                ? "Failed"
                : "Not deployed",
          version: "—",
          environment: project.environment,
        }))
      );
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setProjectsLoaded(true);
    }
  }

  fetchProjects();
}, []);
useEffect(() => {
  async function fetchDeployments() {
    try {
      const response = await fetch("/api/deployments");

      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }

      const data: Deployment[] = await response.json();
      setDeployments(data);
    } catch (error) {
      console.error("Failed to load deployments:", error);
    } finally {
      setDeploymentsLoaded(true);
    }
  }

  fetchDeployments();
}, []);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const visibleProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  async function addProject() {
  const name = window.prompt("Enter your project name");

  if (!name?.trim()) return;

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        environment: "DEVELOPMENT",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create project");
    }

    setProjects((current) => [
  ...current,
  {
    id: data.id,
    name: data.name,
        repo: data.githubUrl || "Repository not connected",
        status: "Not deployed",
        version: "—",
        environment: data.environment,
      },
    ]);

    setNotice(`Project "${data.name}" saved to the database.`);
  } catch (error) {
    console.error(error);
    setNotice("Could not save project. Please try again.");
  }
}

  function showAction(message: string) {
    setNotice(message);
  }

  const running = projects.filter(
    (project) => project.status === "Running"
  ).length;

  const failed = projects.filter(
    (project) => project.status === "Failed"
  ).length;

  return (
    <main className="min-h-screen bg-[#090b10] text-slate-100 md:flex">
      <aside className="border-b border-white/10 bg-[#0d1017] p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-bold text-white">
            D
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              DeployGuard
            </h1>
            <p className="text-xs text-slate-500">Deployment platform</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>

        <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {navigation.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActivePage(item);
                setNotice("");
              }}
              className={`rounded-lg px-3 py-3 text-left text-sm transition ${
                activePage === item
                  ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-10 hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 md:block">
          <p className="text-sm font-medium">Deployment safety</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Monitor releases, inspect failures and manage application health
            from one workspace.
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div>
            <p className="text-sm text-slate-500">Workspace / {activePage}</p>
            <h2 className="mt-1 text-xl font-semibold">{activePage}</h2>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500 sm:w-52"
            />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-medium">
              M
            </div>
          </div>
        </header>

        <div className="space-y-8 p-5 md:p-8">
          {notice && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
              {notice}
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm text-slate-400">
                    Your deployment overview
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    Welcome back, Mayuri
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Manage your projects and keep track of releases.
                  </p>
                </div>

                <button
                  onClick={addProject}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  + Add project
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total projects",
                    value: projects.length,
                    detail: "In this workspace",
                  },
                  {
                    label: "Running",
                    value: running,
                    detail: "Sample project status",
                  },
                  {
                    label: "Failed",
                    value: failed,
                    detail: "Needs investigation",
                  },
                  {
  label: "Deployments",
  value: totalDeployments,
  detail: "Total deployment requests",
},
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-[#10141d] p-5"
                  >
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#10141d]">
                <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Your projects</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Application status and environment
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage("Projects")}
                    className="text-left text-sm text-blue-400 hover:text-blue-300"
                  >
                    View projects →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-white/[0.02] text-xs text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-medium">Project</th>
                        <th className="px-5 py-4 font-medium">Environment</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Version</th>
                        <th className="px-5 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProjects.map((project) => (
                        <tr
                          key={project.name}
                          className="border-t border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium">{project.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {project.repo}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {project.environment}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${
                                project.status === "Running"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : project.status === "Failed"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {project.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {project.version}
                          </td>
                          <td className="px-5 py-4">
  <a
    href={`/project/${project.id}`}
    className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-400 transition hover:bg-blue-500/10"
  >
    View Details
  </a>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-[#10141d] p-5">
                  <h3 className="font-semibold">Recent activity</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Deployment event integration will be added next.
                  </p>
                  <div className="mt-5 rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No real deployment events yet.
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#10141d] p-5">
                  <h3 className="font-semibold">Application health</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Live health checks will be connected to the backend.
                  </p>
                  <div className="mt-5 rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    Monitoring is not configured yet.
                  </div>
                </div>
              </div>
            </>
          )}

          {activePage === "Projects" && (
  <div className="rounded-xl border border-white/10 bg-[#10141d] p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-lg font-semibold">All Projects</h3>
        <p className="mt-1 text-sm text-slate-400">
          Projects saved in your database.
        </p>
      </div>

      <button
        onClick={addProject}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500"
      >
        + Add project
      </button>
    </div>

    <div className="mt-6 space-y-3">
      {projectsLoaded && projects.length === 0 && (
        <p className="text-sm text-slate-500">
          No projects found. Add your first project.
        </p>
      )}

      {projects.map((project) => (
        <div
          key={project.id}
          className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="font-medium">{project.name}</p>
            <p className="mt-1 text-xs text-slate-500">{project.repo}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {project.environment}
            </span>

            <a
              href={`/project/${project.id}`}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View Details →
            </a>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{activePage === "Deployments" && (
  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#10141d]">
    <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-lg font-semibold">Deployment History</h3>
        <p className="mt-1 text-sm text-slate-400">
          View deployment requests saved in your database.
        </p>
      </div>

      <button
        onClick={async () => {
          setDeploymentsLoaded(false);

          try {
            const response = await fetch("/api/deployments");

            if (!response.ok) {
              throw new Error("Failed to refresh deployments");
            }

            const data: Deployment[] = await response.json();
            setDeployments(data);
          } catch (error) {
            console.error(error);
            setNotice("Could not refresh deployment history.");
          } finally {
            setDeploymentsLoaded(true);
          }
        }}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
      >
        Refresh
      </button>
    </div>

    {!deploymentsLoaded ? (
      <p className="p-6 text-sm text-slate-400">
        Loading deployment history...
      </p>
    ) : deployments.length === 0 ? (
      <div className="p-8 text-center">
        <p className="font-medium">No deployments yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Open a project and create a deployment request to see it here.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-white/[0.02] text-xs text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Project</th>
              <th className="px-5 py-4 font-medium">Environment</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Version</th>
              <th className="px-5 py-4 font-medium">Created</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {deployments.map((deployment) => (
              <tr
                key={deployment.id}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <a
                    href={`/project/${deployment.project.id}`}
                    className="font-medium text-blue-400 hover:text-blue-300"
                  >
                    {deployment.project.name}
                  </a>
                </td>

                <td className="px-5 py-4 text-slate-400">
                  {deployment.environment}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      deployment.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : deployment.status === "FAILED"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {deployment.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-400">
                  {deployment.version || "—"}
                </td>

                <td className="px-5 py-4 text-slate-400">
                  {new Date(deployment.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-4">
  <button
    onClick={async () => {
      const status = window.prompt(
        "Enter status: PENDING, RUNNING, SUCCESS, or FAILED",
        deployment.status
      );

      if (!status) return;

      const logs = window.prompt(
        "Enter deployment logs (optional):",
        ""
      );

      try {
        const response = await fetch(
          `/api/deployments/${deployment.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: status.trim().toUpperCase(),
              logs: logs ?? undefined,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Update failed");
        }

        setDeployments((current) =>
          current.map((item) =>
            item.id === deployment.id
              ? data.deployment
              : item
          )
        );

        setNotice("Deployment status and logs updated successfully.");
      } catch (error) {
        console.error(error);
        setNotice(
          error instanceof Error
            ? error.message
            : "Could not update deployment."
        );
      }
    }}
    className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10"
  >
    Update
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

{activePage !== "Dashboard" &&
  activePage !== "Projects" &&
  activePage !== "Deployments" && (
    <div className="rounded-xl border border-white/10 bg-[#10141d] p-6 sm:p-8">
      <p className="text-sm text-blue-400">DeployGuard workspace</p>

      <h3 className="mt-3 text-2xl font-semibold">{activePage}</h3>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
        This section is ready for its next implementation phase.
        We will connect it to the backend and database as we build
        the platform.
      </p>
    </div>
  )}

          <footer className="border-t border-white/10 pt-5 text-xs text-slate-600">
            DeployGuard · Development preview · Backend integration pending
          </footer>
        </div>
      </section>
    </main>
  );
}