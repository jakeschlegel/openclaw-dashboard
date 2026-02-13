"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import type { Agent, CronJob } from "@/lib/types";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, cronRes] = await Promise.allSettled([
          fetch("/api/agents"),
          fetch("/api/cron"),
        ]);

        if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
          const data = await agentsRes.value.json();
          const agents: Agent[] = Array.isArray(data) ? data : data.agents || [];
          const found = agents.find((a) => a.id === id);
          if (found) setAgent(found);
        }

        if (cronRes.status === "fulfilled" && cronRes.value.ok) {
          const data = await cronRes.value.json();
          const jobs: CronJob[] = Array.isArray(data) ? data : data.jobs || [];
          setCronJobs(jobs.filter((j) => j.agentId === id));
        }
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!agent) {
    return (
      <EmptyState
        title="Agent not found"
        description={`No agent found with ID "${id}"`}
        action={
          <Link href="/" className="text-accent text-[13px] hover:underline">
            ← Back to Dashboard
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/" className="text-[13px] text-text-secondary hover:text-accent transition-colors">
          ← Dashboard
        </Link>
      </div>

      <PageHeader
        title={`${agent.emoji || "🤖"} ${agent.name}`}
        description={agent.model || "Unknown model"}
        actions={<StatusBadge status={agent.status} />}
      />

      {/* Agent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-[6px] p-5">
          <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Details
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">ID</dt>
              <dd className="text-[13px] font-mono text-text-primary">{agent.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">Model</dt>
              <dd className="text-[13px] font-mono text-text-primary">{agent.model || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[13px] text-text-secondary">Status</dt>
              <dd><StatusBadge status={agent.status} /></dd>
            </div>
            {agent.workspace && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Workspace</dt>
                <dd className="text-[13px] font-mono text-text-primary truncate max-w-[200px]">
                  {agent.workspace}
                </dd>
              </div>
            )}
            {agent.channels && agent.channels.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-[13px] text-text-secondary">Channels</dt>
                <dd className="flex gap-1.5 flex-wrap justify-end">
                  {agent.channels.map((ch) => (
                    <span
                      key={ch}
                      className="px-1.5 py-0.5 text-[11px] bg-bg rounded border border-border text-text-secondary"
                    >
                      {ch}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Cron Jobs for this agent */}
        <div className="bg-surface border border-border rounded-[6px] p-5">
          <h3 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Cron Jobs ({cronJobs.length})
          </h3>
          {cronJobs.length === 0 ? (
            <p className="text-[13px] text-text-secondary">No cron jobs for this agent.</p>
          ) : (
            <div className="space-y-2">
              {cronJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/cron/${job.id}`}
                  className="flex items-center justify-between p-3 rounded-[6px] bg-bg border border-border hover:border-accent/40 transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{job.name}</p>
                    <code className="text-[11px] font-mono text-text-secondary">
                      {job.scheduleHuman || job.schedule}
                    </code>
                  </div>
                  <StatusBadge status={job.enabled ? "enabled" : "disabled"} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
