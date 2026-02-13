"use client";

import { useEffect, useState, useMemo } from "react";
import CronJobRow from "@/components/CronJobRow";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import type { CronJob } from "@/lib/types";

type SortKey = "name" | "lastRun" | "nextRun" | "schedule";

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const { toast } = useToast();

  async function fetchJobs() {
    try {
      const res = await fetch("/api/cron");
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : data.jobs || []);
      }
    } catch {
      toast("Failed to fetch cron jobs", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agentIds = useMemo(() => {
    const set = new Set(jobs.map((j) => j.agentId));
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = filterAgent === "all" ? jobs : jobs.filter((j) => j.agentId === filterAgent);

    filtered.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastRun":
          return (b.lastRun || "").localeCompare(a.lastRun || "");
        case "nextRun":
          return (a.nextRun || "").localeCompare(b.nextRun || "");
        case "schedule":
          return a.schedule.localeCompare(b.schedule);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, filterAgent, sortKey]);

  async function handleToggle(id: string, enabled: boolean) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/cron/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        toast(`Job ${enabled ? "enabled" : "disabled"}`, "success");
        await fetchJobs();
      } else {
        toast("Failed to toggle job", "error");
      }
    } catch {
      toast("Failed to toggle job", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRunNow(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/cron/${id}/run`, { method: "POST" });
      if (res.ok) {
        toast("Job triggered successfully", "success");
        await fetchJobs();
      } else {
        toast("Failed to run job", "error");
      }
    } catch {
      toast("Failed to run job", "error");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Cron Jobs"
        description={`${jobs.length} jobs across ${agentIds.length} agents`}
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-[12px] text-text-secondary">Agent:</label>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-surface border border-border rounded-[6px] px-3 py-1.5 text-[13px] text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="all">All agents</option>
            {agentIds.map((id) => (
              <option key={id} value={id}>
                {jobs.find((j) => j.agentId === id)?.agentName || id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[12px] text-text-secondary">Sort:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-surface border border-border rounded-[6px] px-3 py-1.5 text-[13px] text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="name">Name</option>
            <option value="lastRun">Last Run</option>
            <option value="nextRun">Next Run</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No cron jobs"
          description="No cron jobs are configured yet."
        />
      ) : (
        <div className="bg-surface border border-border rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Schedule</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Agent</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Last Run</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <CronJobRow
                    key={job.id}
                    job={job}
                    onToggle={handleToggle}
                    onRunNow={handleRunNow}
                    loading={actionLoading === job.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
