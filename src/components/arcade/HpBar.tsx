"use client";

interface HpBarProps {
  value: number; // 0-100
  label?: string;
}

export function HpBar({ value, label }: HpBarProps) {
  const color =
    value > 60 ? "var(--neon-green)" :
    value > 30 ? "var(--neon-yellow)" :
    "var(--neon-red)";

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 font-[family-name:var(--font-terminal)] text-sm">
          <span style={{ color }}>{label}</span>
          <span style={{ color }}>{value}%</span>
        </div>
      )}
      <div className="hp-bar">
        <div
          className="hp-bar-fill"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
