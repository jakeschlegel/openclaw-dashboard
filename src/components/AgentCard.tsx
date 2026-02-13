"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Agent } from "@/lib/types";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="block p-4 bg-surface border border-border rounded-[6px] hover:border-accent/40 hover:bg-surface-hover transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{agent.emoji || "🤖"}</span>
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors">
              {agent.name}
            </h3>
            <p className="text-[12px] text-text-secondary font-mono">{agent.model || "unknown"}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="flex items-center justify-between text-[12px] text-text-secondary">
        <span>Last active: {timeAgo(agent.lastActivity)}</span>
        {agent.cronJobCount !== undefined && (
          <span>{agent.cronJobCount} cron jobs</span>
        )}
      </div>

      {agent.channels && agent.channels.length > 0 && (
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {agent.channels.map((ch) => (
            <span
              key={ch}
              className="px-1.5 py-0.5 text-[11px] bg-bg rounded border border-border text-text-secondary"
            >
              {ch}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
