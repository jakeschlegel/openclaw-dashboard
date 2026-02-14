"use client";

import { ReactNode } from "react";

type GlowColor = "cyan" | "magenta" | "yellow" | "green" | "pink" | "orange";

interface ArcadeTextProps {
  children: ReactNode;
  glow?: GlowColor;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  blink?: boolean;
  pulse?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

const sizeClasses = {
  xs: "text-[8px]",
  sm: "text-[10px]",
  md: "text-[14px]",
  lg: "text-[20px]",
  xl: "text-[28px]",
};

const glowClass: Record<GlowColor, string> = {
  cyan: "neon-cyan",
  magenta: "neon-magenta",
  yellow: "neon-yellow",
  green: "neon-green",
  pink: "neon-pink",
  orange: "",
};

export function ArcadeText({
  children,
  glow = "cyan",
  size = "md",
  blink = false,
  pulse = false,
  className = "",
  as: Tag = "span",
}: ArcadeTextProps) {
  return (
    <Tag
      className={`font-[family-name:var(--font-arcade)] ${sizeClasses[size]} ${glowClass[glow] || ""} ${blink ? "arcade-blink" : ""} ${pulse ? "glow-pulse" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
