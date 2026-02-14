"use client";

import Link from "next/link";
import type { Agent } from "@/lib/types";

const AGENT_COLORS: Record<string, string> = {
  charlie: "#4CAF50",
  dennis: "#5C6BC0",
  mac: "#FF7043",
  dee: "#AB47BC",
  frank: "#8D6E63",
  cricket: "#78909C",
};

function getAgentColor(id: string): string {
  return AGENT_COLORS[id] || "#00FFFF";
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const color = getAgentColor(agent.id);
  const isOnline = agent.status === "online";

  return (
    <Link
      href={`/chat?agent=${agent.id}`}
      className="block p-5 pixel-border transition-all group hover:scale-[1.02]"
      style={{
        borderColor: isOnline ? `${color}60` : "rgba(255,255,255,0.1)",
        boxShadow: isOnline ? `0 0 10px ${color}20, inset 0 0 20px ${color}08` : "none",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Header: Player number + Name */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            P{(["charlie", "dennis", "mac", "dee", "frank", "cricket"].indexOf(agent.id) + 1) || "?"}
          </div>
          <span className="text-2xl">{agent.emoji || "🤖"}</span>
          <div>
            <h3
              className="font-[family-name:var(--font-arcade)] text-[10px] group-hover:brightness-125 transition-all"
              style={{ color }}
            >
              {agent.name.toUpperCase()}
            </h3>
            {agent.role && (
              <p className="font-[family-name:var(--font-terminal)] text-base text-text-secondary mt-0.5">
                {agent.role}
              </p>
            )}
          </div>
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2"
            style={{
              backgroundColor: isOnline ? "var(--neon-green)" : "var(--status-offline)",
              boxShadow: isOnline ? "0 0 6px var(--neon-green)" : "none",
            }}
          />
          <span
            className="font-[family-name:var(--font-arcade)] text-[7px]"
            style={{ color: isOnline ? "var(--neon-green)" : "var(--status-offline)" }}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-[family-name:var(--font-arcade)] text-[7px] opacity-40">HP</span>
          <span className="font-[family-name:var(--font-terminal)] text-sm" style={{ color: isOnline ? "var(--neon-green)" : "var(--status-offline)" }}>
            {isOnline ? "100%" : "0%"}
          </span>
        </div>
        <div className="hp-bar">
          <div
            className="hp-bar-fill"
            style={{
              width: isOnline ? "100%" : "0%",
              backgroundColor: isOnline ? "var(--neon-green)" : "var(--neon-red)",
              boxShadow: isOnline ? "0 0 6px var(--neon-green)" : "none",
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-between font-[family-name:var(--font-terminal)] text-base">
        <span className="text-text-secondary">LV.1</span>
        {agent.cronJobCount !== undefined && agent.cronJobCount > 0 && (
          <span style={{ color: "var(--neon-magenta)" }}>
            ⏰ {agent.cronJobCount} JOBS
          </span>
        )}
      </div>

      {/* Channels */}
      {agent.channels && agent.channels.length > 0 && (
        <div className="mt-3 flex gap-1.5 flex-wrap">
          {agent.channels.map((ch) => (
            <span
              key={ch}
              className="px-2 py-0.5 font-[family-name:var(--font-arcade)] text-[6px] uppercase"
              style={{ border: "1px solid var(--neon-cyan)20", color: "var(--neon-cyan)", opacity: 0.5 }}
            >
              {ch}
            </span>
          ))}
        </div>
      )}

      {/* Press Start */}
      <div
        className="mt-4 text-center font-[family-name:var(--font-arcade)] text-[8px] py-2 pixel-border opacity-0 group-hover:opacity-100 transition-opacity glow-pulse"
        style={{ borderColor: `${color}60`, color }}
      >
        🎮 PRESS START
      </div>
    </Link>
  );
}
