"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}

const LABEL_COLORS: Record<string, string> = {
  "Agents": "var(--neon-cyan)",
  "Active": "var(--neon-green)",
  "Cron Jobs": "var(--neon-magenta)",
  "Active Jobs": "var(--neon-yellow)",
};

export default function StatsCard({ label, value, icon, accent }: StatsCardProps) {
  const color = LABEL_COLORS[label] || (accent ? "var(--neon-green)" : "var(--neon-cyan)");

  return (
    <div
      className="p-4 pixel-border"
      style={{ borderColor: `${color}40`, backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-[family-name:var(--font-arcade)] text-[8px] uppercase tracking-wider" style={{ color: `${color}80` }}>
          {label}
        </span>
        <span style={{ color: `${color}60` }}>{icon}</span>
      </div>
      <p
        className="text-4xl font-[family-name:var(--font-terminal)]"
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        {value}
      </p>
    </div>
  );
}
