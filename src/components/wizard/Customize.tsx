"use client";

import { useState } from "react";
import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { StatBar } from "@/components/arcade/StatBar";
import { arcadeSound } from "@/lib/sound";

const ROLES = [
  { id: "coding", icon: "💻", name: "Coding" },
  { id: "research", icon: "🔍", name: "Research" },
  { id: "content", icon: "✍️", name: "Content" },
  { id: "devops", icon: "🔧", name: "DevOps" },
  { id: "chief-of-staff", icon: "👔", name: "Chief of Staff" },
  { id: "security", icon: "🛡️", name: "Security" },
  { id: "data", icon: "📊", name: "Data" },
  { id: "creative", icon: "🎨", name: "Creative" },
];

const PERSONALITY_AXES = [
  { key: "sarcasm", label: "TONE", leftIcon: "🤡", rightIcon: "👔", leftLabel: "SARCASTIC", rightLabel: "SINCERE" },
  { key: "verbosity", label: "VERBOSITY", leftIcon: "🔇", rightIcon: "📢", leftLabel: "CONCISE", rightLabel: "VERBOSE" },
  { key: "initiative", label: "INITIATIVE", leftIcon: "😴", rightIcon: "⚡", leftLabel: "REACTIVE", rightLabel: "PROACTIVE" },
  { key: "formality", label: "FORMALITY", leftIcon: "🍕", rightIcon: "🎩", leftLabel: "CASUAL", rightLabel: "FORMAL" },
  { key: "humor", label: "HUMOR", leftIcon: "😐", rightIcon: "😂", leftLabel: "SERIOUS", rightLabel: "MAXIMUM" },
  { key: "risk", label: "RISK", leftIcon: "🐢", rightIcon: "🚀", leftLabel: "CAREFUL", rightLabel: "YOLO" },
];

const STAT_ICONS: Record<string, string> = {
  research: "🧠",
  coding: "💻",
  content: "✍️",
  security: "🛡️",
  strategy: "🎯",
  speed: "⚡",
};

function PersonalitySlider({
  axis,
  value,
  onChange,
}: {
  axis: typeof PERSONALITY_AXES[0];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-[family-name:var(--font-arcade)] text-[7px] w-24 opacity-50">
        {axis.label}
      </span>
      <span>{axis.leftIcon}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => {
            onChange(Number(e.target.value));
            arcadeSound?.sliderClick();
          }}
          className="w-full h-3 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--neon-cyan) ${value}%, rgba(255,255,255,0.1) ${value}%)`,
            borderRadius: 0,
          }}
        />
      </div>
      <span>{axis.rightIcon}</span>
      <span className="font-[family-name:var(--font-terminal)] text-sm w-24 opacity-40 text-right">
        {value < 30 ? axis.leftLabel : value > 70 ? axis.rightLabel : "BALANCED"}
      </span>
    </div>
  );
}

export function Customize() {
  const { state, updateAgentRole, updateAgentPersonality, setStage } = useWizard();
  const [activeSlot, setActiveSlot] = useState(0);

  const agent = state.selectedAgents[activeSlot];
  if (!agent) return null;

  return (
    <div className="min-h-screen arcade-grid flex flex-col py-8 px-8 stage-enter">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto w-full">
        <ArcadeText glow="yellow" size="md" as="h1">
          ★ CUSTOMIZE YOUR FIGHTERS ★
        </ArcadeText>
        <ArcadeText glow="cyan" size="xs">
          P{activeSlot + 1} READY
        </ArcadeText>
      </div>

      {/* Agent Tabs */}
      <div className="flex gap-2 mb-6 max-w-5xl mx-auto w-full">
        {state.selectedAgents.map((a, i) => (
          <button
            key={i}
            onClick={() => { setActiveSlot(i); arcadeSound?.buttonClick(); }}
            className="px-3 py-2 pixel-border font-[family-name:var(--font-arcade)] text-[8px] transition-all"
            style={{
              borderColor: i === activeSlot ? a.character.avatarColor : "rgba(255,255,255,0.1)",
              backgroundColor: i === activeSlot ? `${a.character.avatarColor}20` : "transparent",
              color: i === activeSlot ? a.character.avatarColor : "rgba(255,255,255,0.4)",
            }}
          >
            {a.character.emoji} P{i + 1}
          </button>
        ))}
      </div>

      <div className="flex gap-8 max-w-5xl mx-auto w-full flex-1">
        {/* Left: Character Info */}
        <div className="w-60 shrink-0 pixel-border p-5" style={{ borderColor: `${agent.character.avatarColor}40` }}>
          <div className="text-5xl text-center mb-3">{agent.character.emoji}</div>
          <div className="font-[family-name:var(--font-terminal)] text-2xl text-center" style={{ color: agent.character.avatarColor }}>
            {agent.character.name}
          </div>
          <div className="font-[family-name:var(--font-arcade)] text-[8px] text-center mt-2 opacity-50">
            ROLE: {agent.role.toUpperCase()}
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-2">
            <ArcadeText glow="cyan" size="xs" className="opacity-50">ROLE STATS</ArcadeText>
            {Object.entries(agent.character.stats).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-sm">{STAT_ICONS[key]}</span>
                <StatBar value={value} color={agent.character.avatarColor} showValue />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Customization */}
        <div className="flex-1 space-y-6">
          {/* Role Selection */}
          <div className="pixel-border p-5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <ArcadeText glow="cyan" size="xs" className="mb-4 block opacity-60">
              ═══ CLASS SELECT ═══
            </ArcadeText>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => { updateAgentRole(activeSlot, role.id); arcadeSound?.buttonClick(); }}
                  className="px-3 py-2 pixel-border font-[family-name:var(--font-terminal)] text-lg transition-all"
                  style={{
                    borderColor: agent.role === role.id ? "var(--neon-cyan)" : "rgba(255,255,255,0.1)",
                    backgroundColor: agent.role === role.id ? "rgba(0,255,255,0.1)" : "transparent",
                    color: agent.role === role.id ? "var(--neon-cyan)" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {role.icon} {role.name}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Sliders */}
          <div className="pixel-border p-5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <ArcadeText glow="cyan" size="xs" className="mb-4 block opacity-60">
              ═══ PERSONALITY STATS ═══
            </ArcadeText>
            <div className="space-y-4">
              {PERSONALITY_AXES.map((axis) => (
                <PersonalitySlider
                  key={axis.key}
                  axis={axis}
                  value={agent.personality[axis.key as keyof typeof agent.personality]}
                  onChange={(v) => updateAgentPersonality(activeSlot, axis.key, v)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center mt-6 max-w-5xl mx-auto w-full">
        <button onClick={() => { arcadeSound?.buttonClick(); setStage("choose-fighters"); }} className="arcade-btn arcade-btn-secondary">
          ◄ BACK
        </button>
        <button onClick={() => { arcadeSound?.stageTransition(); setStage("ready"); }} className="arcade-btn arcade-btn-primary">
          READY? ►
        </button>
      </div>
    </div>
  );
}
