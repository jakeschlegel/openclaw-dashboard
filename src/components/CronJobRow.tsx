"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { CronJob } from "@/lib/types";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CronJobRowProps {
  job: CronJob;
  onToggle: (id: string, enabled: boolean) => void;
  onRunNow: (id: string) => void;
  loading?: boolean;
}

export default function CronJobRow({ job, onToggle, onRunNow, loading }: CronJobRowProps) {
  return (
    <tr className="border-b border-border hover:bg-surface-hover transition-colors group">
      <td className="px-4 py-3">
        <Link
          href={`/cron/${job.id}`}
          className="text-[13px] font-medium text-text-primary hover:text-accent transition-colors"
        >
          {job.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <code className="text-[12px] font-mono text-text-secondary bg-bg px-1.5 py-0.5 rounded">
          {job.scheduleHuman || job.schedule}
        </code>
      </td>
      <td className="px-4 py-3 text-[13px] text-text-secondary">
        {job.agentName || job.agentId}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={job.enabled ? "enabled" : "disabled"} />
      </td>
      <td className="px-4 py-3 text-[12px] text-text-secondary">
        {formatDate(job.lastRun)}
      </td>
      <td className="px-4 py-3">
        {job.lastResult && <StatusBadge status={job.lastResult} />}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(job.id, !job.enabled)}
            disabled={loading}
            className="px-2.5 py-1 text-[12px] rounded-[6px] border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-50"
          >
            {job.enabled ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => onRunNow(job.id)}
            disabled={loading}
            className="px-2.5 py-1 text-[12px] rounded-[6px] bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            Run Now
          </button>
        </div>
      </td>
    </tr>
  );
}
