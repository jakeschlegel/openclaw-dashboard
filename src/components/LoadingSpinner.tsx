"use client";

export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = { sm: "text-sm", md: "text-lg", lg: "text-2xl" }[size];
  return (
    <div className="flex items-center justify-center">
      <span className={`${textSize} font-[family-name:var(--font-arcade)] neon-cyan glow-pulse`}>
        ▓▓▓
      </span>
    </div>
  );
}
