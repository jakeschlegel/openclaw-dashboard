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

  useEffect(() => { fetchJobs(); }, []);

  const agentIds = useMemo(() => Array.from(new Set(jobs.map((j) => j.agentId))), [jobs]);

  const filteredJobs = useMemo(() => {
    let filtered = filterAgent === "all" ? jobs : jobs.filter((j) => j.agentId === filterAgent);
    filtered.sort((a, b) => {
      switch (sortKey) {
        case "name": return a.name.localeCompare(b.name);
        case "lastRun": return (b.lastRun || "").localeCompare(a.lastRun || "");
        case "nextRun": return (a.nextRun || "").localeCompare(b.nextRun || "");
        case "schedule": return a.schedule.localeCompare(b.schedule);
        default: return 0;
      }
    });
    return filtered;
  }, [jobs, filterAgent, sortKey]);

  async function handleToggle(id: string, enabled: boolean) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/cron/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
      if (res.ok) { toast(`Job ${enabled ? "enabled" : "disabled"}`, "success"); await fetchJobs(); }
      else toast("Failed to toggle job", "error");
    } catch { toast("Failed to toggle job", "error"); }
    finally { setActionLoading(null); }
  }

  async function handleRunNow(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/cron/${id}/run`, { method: "POST" });
      if (res.ok) { toast("Job triggered successfully", "success"); await fetchJobs(); }
      else toast("Failed to run job", "error");
    } catch { toast("Failed to run job", "error"); }
    finally { setActionLoading(null); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="arcade-grid min-h-screen -m-6 lg:-m-8 -mt-14 lg:-mt-8 p-6 lg:p-8">
      <PageHeader title="Cron Jobs" description={`${jobs.length} jobs across ${agentIds.length} agents`} />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-arcade)] text-[8px] opacity-50">AGENT:</span>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-1.5 pixel-border font-[family-name:var(--font-terminal)] text-lg focus:outline-none"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", borderColor: "var(--neon-cyan)40", color: "var(--neon-cyan)" }}
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
          <span className="font-[family-name:var(--font-arcade)] text-[8px] opacity-50">SORT:</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-1.5 pixel-border font-[family-name:var(--font-terminal)] text-lg focus:outline-none"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", borderColor: "var(--neon-cyan)40", color: "var(--neon-cyan)" }}
          >
            <option value="name">Name</option>
            <option value="lastRun">Last Run</option>
            <option value="nextRun">Next Run</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No cron jobs" description="No cron jobs are configured yet." />
      ) : (
        <div className="pixel-border overflow-hidden" style={{ borderColor: "var(--neon-magenta)40" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,0,255,0.15)", backgroundColor: "rgba(255,0,255,0.05)" }}>
                  {["Name", "Schedule", "Agent", "Status", "Last Run", "Result", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-[family-name:var(--font-arcade)] text-[7px] uppercase tracking-wider" style={{ color: "var(--neon-magenta)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <CronJobRow key={job.id} job={job} onToggle={handleToggle} onRunNow={handleRunNow} loading={actionLoading === job.id} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
