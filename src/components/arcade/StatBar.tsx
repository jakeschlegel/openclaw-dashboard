"use client";

interface StatBarProps {
  value: number; // 0-8
  max?: number;
  color?: string;
  label?: string;
  icon?: string;
  showValue?: boolean;
}

const STAT_COLORS: Record<string, string> = {
  research: "#00FFFF",
  coding: "#39FF14",
  content: "#FF00FF",
  security: "#FF6B35",
  strategy: "#FFD700",
  speed: "#FF1493",
};

export function StatBar({
  value,
  max = 8,
  color,
  label,
  icon,
  showValue = true,
}: StatBarProps) {
  const barColor = color || STAT_COLORS[label?.toLowerCase() || ""] || "#00FFFF";

  return (
    <div className="flex items-center gap-2 font-[family-name:var(--font-terminal)] text-lg">
      {icon && <span className="w-5 text-center">{icon}</span>}
      <div className="stat-bar">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`stat-bar-block ${i < value ? "filled" : "empty"}`}
            style={
              i < value
                ? {
                    backgroundColor: barColor,
                    boxShadow: `0 0 4px ${barColor}`,
                  }
                : {}
            }
          />
        ))}
      </div>
      {showValue && (
        <span
          className="text-sm font-[family-name:var(--font-arcade)]"
          style={{ color: barColor }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
