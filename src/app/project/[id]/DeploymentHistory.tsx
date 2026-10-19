"use client";

import { useEffect, useState } from "react";

type Deployment = {
  id: string;
  status: string;
  environment: string;
  version: string | null;
  logs: string | null;
  createdAt: string;
};

export default function DeploymentHistory({
  projectId,
}: {
  projectId: string;
}) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);

  async function loadDeployments() {
    try {
      setError("");

      const response = await fetch(
        `/api/deployments?projectId=${encodeURIComponent(projectId)}`
      );

      if (!response.ok) {
        throw new Error("Could not load deployment history.");
      }

      const data: Deployment[] = await response.json();
      setDeployments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeployments();
  }, [projectId]);

  return (
    <section className="mt-8 border-t border-white/10 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Deployment History
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Deployment requests and their logs.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadDeployments();
          }}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="mt-5 text-sm text-slate-400">
          Loading deployments...
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && deployments.length === 0 && (
        <div className="mt-5 rounded-lg border border-dashed border-white/10 p-5 text-sm text-slate-400">
          No deployments found for this project yet.
        </div>
      )}

      {!loading && deployments.length > 0 && (
        <div className="mt-5 space-y-3">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">
                    {deployment.environment}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(
                      deployment.createdAt
                    ).toLocaleString()}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-600">
                    ID: {deployment.id}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      deployment.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : deployment.status === "FAILED"
                          ? "bg-red-500/10 text-red-400"
                          : deployment.status === "RUNNING"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {deployment.status}
                  </span>

                  <button
                    onClick={() =>
                      setSelectedDeployment(deployment)
                    }
                    className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/10"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDeployment && (
        <div className="mt-5 rounded-xl border border-blue-500/20 bg-[#0b0e15] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">
              Deployment Logs
            </h3>

            <button
              onClick={() => setSelectedDeployment(null)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Status: {selectedDeployment.status}
          </p>

          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
            {selectedDeployment.logs ||
              "No logs have been saved for this deployment yet."}
          </pre>
        </div>
      )}
    </section>
  );
}