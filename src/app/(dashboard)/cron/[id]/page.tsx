"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import type { CronJob, CronRun } from "@/lib/types";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function CronJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<CronJob | null>(null);
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  async function fetchData() {
    try {
      const [jobRes, runsRes] = await Promise.allSettled([
        fetch(`/api/cron/${id}`),
        fetch(`/api/cron/${id}/runs`),
      ]);

      if (jobRes.status === "fulfilled" && jobRes.value.ok) {
        setJob(await jobRes.value.json());
      }

      if (runsRes.status === "fulfilled" && runsRes.value.ok) {
        const data = await runsRes.value.json();
        setRuns(Array.isArray(data) ? data : data.runs || []);
      }
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggle() {
    if (!job) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/cron/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !job.enabled }),
      });
      if (res.ok) {
        toast(`Job ${!job.enabled ? "enabled" : "disabled"}`, "success");
        await fetchData();
      } else {
        toast("Failed to toggle job", "error");
      }
    } catch {
      toast("Failed to toggle job", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRunNow() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/cron/${id}/run`, { method: "POST" });
      if (res.ok) {
        toast("Job triggered successfully", "success");
        await fetchData();
      } else {
        toast("Failed to run job", "error");
      }
    } catch {
      toast("Failed to run job", "error");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        title="Job not found"
        description={`No cron job found with ID "${id}"`}
        action={
          <Link href="/cron" className="text-accent text-[13px] hover:underline">
            ← Back to Cron Jobs
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/cron" className="text-[13px] text-text-secondary hover:text-accent transition-colors">
          ← Cron Jobs
        </Link>
      </div>

      <PageHeader
        title={job.name}
        description={job.scheduleHuman || job.schedule}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={actionLoading}
              className="px-3 py-1.5 text-[13px] rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-50"
            >
              {job.enabled ? "Disable" : "Enable"}
            </button>
            <button
              onClick={handleRunNow}
              disabled={actionLoading}
              className="px-3 py-1.5 text-[13px] rounded-[6px] bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              Run Now
            </button>
          </div>
        }
      />

      {/* Job Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-[6px] p-5">
          <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Configuration
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">ID</dt>
              <dd className="text-[13px] font-mono text-text-primary">{job.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">Schedule</dt>
              <dd className="text-[13px] font-mono text-text-primary">{job.schedule}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">Status</dt>
              <dd><StatusBadge status={job.enabled ? "enabled" : "disabled"} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">Agent</dt>
              <dd className="text-[13px] text-text-primary">
                <Link href={`/agents/${job.agentId}`} className="hover:text-accent transition-colors">
                  {job.agentName || job.agentId}
                </Link>
              </dd>
            </div>
            {job.model && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Model</dt>
                <dd className="text-[13px] font-mono text-text-primary">{job.model}</dd>
              </div>
            )}
            {job.channel && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Channel</dt>
                <dd className="text-[13px] text-text-primary">{job.channel}</dd>
              </div>
            )}
            {job.lastRun && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Last Run</dt>
                <dd className="text-[13px] text-text-primary">{formatDate(job.lastRun)}</dd>
              </div>
            )}
            {job.nextRun && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Next Run</dt>
                <dd className="text-[13px] text-text-primary">{formatDate(job.nextRun)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Prompt */}
        {job.prompt && (
          <div className="bg-surface border border-border rounded-[6px] p-5">
            <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Prompt
            </h3>
            <pre className="text-[13px] font-mono text-text-primary whitespace-pre-wrap bg-bg p-3 rounded-[6px] border border-border max-h-[300px] overflow-y-auto">
              {job.prompt}
            </pre>
          </div>
        )}
      </div>

      {/* Run History */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-text-primary">Run History</h2>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          title="No runs yet"
          description="This job hasn&apos;t been executed yet."
        />
      ) : (
        <div className="bg-surface border border-border rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Started</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Output</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary">
                      {formatDate(run.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-mono text-text-secondary">
                      {formatDuration(run.durationMs)}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary max-w-[400px] truncate">
                      {run.error ? (
                        <span className="text-error">{run.error}</span>
                      ) : (
                        run.output || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
