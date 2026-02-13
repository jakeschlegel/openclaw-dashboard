"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}

export default function StatsCard({ label, value, icon, accent }: StatsCardProps) {
  return (
    <div className="p-4 bg-surface border border-border rounded-[6px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-[12px] font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className="text-text-secondary">{icon}</span>
      </div>
      <p className={`text-2xl font-semibold ${accent ? "text-accent" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
