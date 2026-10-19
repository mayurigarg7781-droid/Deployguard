"use client";

import { useState } from "react";

type DeployButtonProps = {
  projectId: string;
  environment: string;
};

export default function DeployButton({
  projectId,
  environment,
}: DeployButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDeploy() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          environment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment request failed");
      }

      setMessage("Deployment request created successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the deployment API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleDeploy}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating request..." : "Deploy Project"}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.includes("successfully")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}