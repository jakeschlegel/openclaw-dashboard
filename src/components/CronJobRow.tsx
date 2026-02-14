"use client";

import type { CronJob } from "@/lib/types";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface CronJobRowProps {
  job: CronJob;
  onToggle: (id: string, enabled: boolean) => void;
  onRunNow: (id: string) => void;
  loading?: boolean;
}

export default function CronJobRow({ job, onToggle, onRunNow, loading }: CronJobRowProps) {
  return (
    <tr
      className="group transition-all"
      style={{ borderBottom: "1px solid rgba(255,0,255,0.08)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,0,255,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <td className="px-4 py-3">
        <span className="font-[family-name:var(--font-terminal)] text-xl text-text-primary">
          {job.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <code
          className="font-[family-name:var(--font-terminal)] text-base px-2 py-0.5"
          style={{ color: "var(--neon-yellow)", backgroundColor: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}
        >
          {job.scheduleHuman || job.schedule}
        </code>
      </td>
      <td className="px-4 py-3 font-[family-name:var(--font-terminal)] text-lg text-text-secondary">
        {job.agentName || job.agentId}
      </td>
      <td className="px-4 py-3">
        <span
          className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1"
          style={{
            color: job.enabled ? "var(--neon-green)" : "var(--status-offline)",
            border: `1px solid ${job.enabled ? "var(--neon-green)" : "var(--status-offline)"}40`,
            backgroundColor: job.enabled ? "rgba(57,255,20,0.08)" : "transparent",
          }}
        >
          {job.enabled ? "ACTIVE" : "OFF"}
        </span>
      </td>
      <td className="px-4 py-3 font-[family-name:var(--font-terminal)] text-base text-text-secondary">
        {formatDate(job.lastRun)}
      </td>
      <td className="px-4 py-3">
        {job.lastResult && (
          <span
            className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1"
            style={{
              color: job.lastResult === "success" ? "var(--neon-green)" : "var(--neon-red)",
              border: `1px solid ${job.lastResult === "success" ? "var(--neon-green)" : "var(--neon-red)"}40`,
            }}
          >
            {job.lastResult === "success" ? "✓ OK" : "✕ FAIL"}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(job.id, !job.enabled)}
            disabled={loading}
            className="px-2.5 py-1 pixel-border font-[family-name:var(--font-terminal)] text-base disabled:opacity-30"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "var(--neon-cyan)" }}
          >
            {job.enabled ? "DISABLE" : "ENABLE"}
          </button>
          <button
            onClick={() => onRunNow(job.id)}
            disabled={loading}
            className="arcade-btn arcade-btn-primary text-[8px]! px-2.5! py-1!"
          >
            RUN ▶
          </button>
        </div>
      </td>
    </tr>
  );
}
