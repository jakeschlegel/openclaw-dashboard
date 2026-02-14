"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { CAPABILITIES, DIFFICULTY_META, Capability, Difficulty } from "@/lib/capabilities";
import { arcadeSound } from "@/lib/sound";

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Low: "var(--neon-green)",
    Medium: "var(--neon-yellow)",
    High: "var(--neon-red)",
  };
  const color = colors[level] || "var(--neon-cyan)";
  return (
    <span
      className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-0.5"
      style={{ color, border: `1px solid ${color}40`, backgroundColor: `${color}10` }}
    >
      {level.toUpperCase()} RISK
    </span>
  );
}

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className="font-[family-name:var(--font-arcade)] text-[10px]"
          style={{ color: i < meta.stars ? meta.color : "rgba(255,255,255,0.15)" }}
        >
          ★
        </span>
      ))}
      <span
        className="font-[family-name:var(--font-arcade)] text-[7px] ml-1"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
    </div>
  );
}

function CapabilityModal({ cap, onClose }: { cap: Capability; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const meta = DIFFICULTY_META[cap.difficulty];

  const copyPrompt = () => {
    navigator.clipboard.writeText(cap.examplePrompt);
    setCopied(true);
    arcadeSound?.powerUp();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto pixel-border p-6"
        style={{ borderColor: `${meta.color}60`, backgroundColor: "var(--arcade-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cap.emoji}</span>
            <div>
              <h2 className="font-[family-name:var(--font-arcade)] text-[12px]" style={{ color: meta.color }}>
                {cap.name.toUpperCase()}
              </h2>
              <DifficultyStars difficulty={cap.difficulty} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-[family-name:var(--font-arcade)] text-[10px] opacity-40 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="font-[family-name:var(--font-terminal)] text-xl mb-6 opacity-80">
          {cap.description}
        </p>

        {/* What Happens */}
        <div className="pixel-border p-4 mb-4" style={{ borderColor: "var(--neon-cyan)30" }}>
          <div className="font-[family-name:var(--font-arcade)] text-[8px] neon-cyan mb-2">
            ⚙️ WHAT HAPPENS TECHNICALLY
          </div>
          <p className="font-[family-name:var(--font-terminal)] text-lg opacity-70">
            {cap.whatHappens}
          </p>
        </div>

        {/* User Effort */}
        <div className="pixel-border p-4 mb-4" style={{ borderColor: "var(--neon-yellow)30" }}>
          <div className="font-[family-name:var(--font-arcade)] text-[8px] mb-2" style={{ color: "var(--neon-yellow)" }}>
            👤 YOUR EFFORT: {cap.userEffort.toUpperCase()}
          </div>
          <p className="font-[family-name:var(--font-terminal)] text-lg opacity-70">
            {cap.userEffortDetail}
          </p>
          {cap.requirements.length > 0 && (
            <div className="mt-3">
              <div className="font-[family-name:var(--font-arcade)] text-[7px] opacity-50 mb-1">REQUIREMENTS:</div>
              <ul className="space-y-1">
                {cap.requirements.map((r, i) => (
                  <li key={i} className="font-[family-name:var(--font-terminal)] text-base opacity-60">
                    ▸ {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Security Risks */}
        <div className="pixel-border p-4 mb-4" style={{ borderColor: `${cap.riskLevel === "High" ? "var(--neon-red)" : cap.riskLevel === "Medium" ? "var(--neon-yellow)" : "var(--neon-green)"}30` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="font-[family-name:var(--font-arcade)] text-[8px]" style={{ color: "var(--neon-red)" }}>
              🔒 SECURITY RISKS
            </div>
            <RiskBadge level={cap.riskLevel} />
          </div>
          <ul className="space-y-2">
            {cap.securityRisks.map((risk, i) => (
              <li key={i} className="font-[family-name:var(--font-terminal)] text-lg opacity-70 flex gap-2">
                <span style={{ color: "var(--neon-red)" }}>⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Example Prompt */}
        <div className="pixel-border p-4 mb-4" style={{ borderColor: "var(--neon-magenta)30" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-[family-name:var(--font-arcade)] text-[8px]" style={{ color: "var(--neon-magenta)" }}>
              💬 EXAMPLE PROMPT
            </div>
            <button
              onClick={copyPrompt}
              className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1 pixel-border transition-all"
              style={{
                borderColor: copied ? "var(--neon-green)60" : "var(--neon-cyan)30",
                color: copied ? "var(--neon-green)" : "var(--neon-cyan)",
              }}
            >
              {copied ? "✓ COPIED!" : "📋 COPY"}
            </button>
          </div>
          <p className="font-[family-name:var(--font-terminal)] text-lg opacity-80 italic">
            &quot;{cap.examplePrompt}&quot;
          </p>
        </div>

        {/* XP + Action */}
        <div className="flex items-center justify-between mt-6">
          <div className="font-[family-name:var(--font-arcade)] text-[9px]" style={{ color: "var(--neon-yellow)" }}>
            🏆 +{cap.xpReward} XP
          </div>
          <button
            onClick={() => {
              arcadeSound?.characterSelect();
              window.location.href = `/chat?prompt=${encodeURIComponent(cap.examplePrompt)}`;
            }}
            className="arcade-btn arcade-btn-primary"
          >
            TRY IT NOW ►
          </button>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({ cap, onClick }: { cap: Capability; onClick: () => void }) {
  const meta = DIFFICULTY_META[cap.difficulty];

  return (
    <button
      onClick={() => { arcadeSound?.characterHover(); onClick(); }}
      className="text-left p-4 pixel-border transition-all group hover:scale-[1.02]"
      style={{ borderColor: `${meta.color}30`, backgroundColor: "rgba(255,255,255,0.02)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}80`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${meta.color}20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}30`;
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{cap.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-[family-name:var(--font-arcade)] text-[9px]" style={{ color: meta.color }}>
              {cap.name.toUpperCase()}
            </h3>
            <RiskBadge level={cap.riskLevel} />
          </div>
          <p className="font-[family-name:var(--font-terminal)] text-lg opacity-60 line-clamp-2 mb-2">
            {cap.description}
          </p>
          <div className="flex items-center justify-between">
            <DifficultyStars difficulty={cap.difficulty} />
            <span className="font-[family-name:var(--font-arcade)] text-[7px] opacity-40">
              +{cap.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function QuestsPage() {
  const [selectedCap, setSelectedCap] = useState<Capability | null>(null);
  const [activeTab, setActiveTab] = useState<Difficulty | "all">("all");

  const tabs: { key: Difficulty | "all"; label: string; color: string }[] = [
    { key: "all", label: "ALL QUESTS", color: "var(--neon-cyan)" },
    { key: "starter", label: "🟢 EASY", color: "#39FF14" },
    { key: "moderate", label: "🟡 MEDIUM", color: "#FFD700" },
    { key: "advanced", label: "🔴 HARD", color: "#FF0040" },
  ];

  const filtered = activeTab === "all" ? CAPABILITIES : CAPABILITIES.filter((c) => c.difficulty === activeTab);

  const grouped = activeTab === "all"
    ? [
        { difficulty: "starter" as Difficulty, caps: CAPABILITIES.filter((c) => c.difficulty === "starter") },
        { difficulty: "moderate" as Difficulty, caps: CAPABILITIES.filter((c) => c.difficulty === "moderate") },
        { difficulty: "advanced" as Difficulty, caps: CAPABILITIES.filter((c) => c.difficulty === "advanced") },
      ]
    : [{ difficulty: activeTab as Difficulty, caps: filtered }];

  return (
    <div className="arcade-grid min-h-screen -m-6 lg:-m-8 -mt-14 lg:-mt-8 p-6 lg:p-8">
      <PageHeader
        title="Quest Board"
        description="Choose a mission for your agents. Tap any quest to see full details."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); arcadeSound?.buttonClick(); }}
            className="px-4 py-2 pixel-border font-[family-name:var(--font-arcade)] text-[8px] transition-all"
            style={{
              borderColor: activeTab === tab.key ? `${tab.color}80` : "rgba(255,255,255,0.1)",
              backgroundColor: activeTab === tab.key ? `${tab.color}15` : "transparent",
              color: activeTab === tab.key ? tab.color : "rgba(255,255,255,0.4)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quest Groups */}
      {grouped.map((group) => {
        const meta = DIFFICULTY_META[group.difficulty];
        return (
          <div key={group.difficulty} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">{meta.icon}</span>
              <h2 className="font-[family-name:var(--font-arcade)] text-[11px]" style={{ color: meta.color }}>
                {meta.label} QUESTS
              </h2>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: `${meta.color}20` }} />
              <span className="font-[family-name:var(--font-arcade)] text-[7px] opacity-30">
                {group.caps.length} AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.caps.map((cap) => (
                <CapabilityCard key={cap.id} cap={cap} onClick={() => setSelectedCap(cap)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {selectedCap && (
        <CapabilityModal cap={selectedCap} onClose={() => setSelectedCap(null)} />
      )}
    </div>
  );
}
