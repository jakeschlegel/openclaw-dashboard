"use client";

import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { THEME_PACKS, ThemePack } from "@/lib/theme-packs";
import { arcadeSound } from "@/lib/sound";
import { useState } from "react";

function CabinetCard({ theme, onSelect }: { theme: ThemePack; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => {
        setHovered(true);
        arcadeSound?.characterHover();
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      className="relative group flex flex-col items-center gap-4 p-6 pixel-border rounded-sm transition-all duration-200 w-64"
      style={{
        borderColor: hovered ? theme.accentColor : "rgba(255,255,255,0.15)",
        boxShadow: hovered
          ? `0 0 10px ${theme.accentColor}, 0 0 20px ${theme.accentColor}40`
          : "none",
        background: hovered ? `${theme.accentColor}10` : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Cabinet Marquee */}
      <div
        className="w-full py-3 px-2 text-center pixel-border"
        style={{ borderColor: `${theme.accentColor}60` }}
      >
        <div className="font-[family-name:var(--font-arcade)] text-[9px] leading-relaxed" style={{ color: theme.accentColor }}>
          {theme.marqueeTitle}
        </div>
      </div>

      {/* Character Preview */}
      <div className="flex gap-2 text-2xl py-2">
        {theme.characters.slice(0, 5).map((c) => (
          <span key={c.id} className={hovered ? "char-idle" : ""} style={{ animationDelay: `${Math.random() * 0.5}s` }}>
            {c.emoji}
          </span>
        ))}
      </div>

      {/* Theme Name */}
      <div className="font-[family-name:var(--font-terminal)] text-xl text-[var(--neon-cyan)]">
        {theme.name}
      </div>

      {/* Tagline */}
      <div className="font-[family-name:var(--font-terminal)] text-sm opacity-50">
        &quot;{theme.tagline}&quot;
      </div>

      {/* Player Count */}
      <div
        className="font-[family-name:var(--font-arcade)] text-[8px] mt-2"
        style={{ color: theme.accentColor }}
      >
        {theme.characters.length}P
      </div>
    </button>
  );
}

export function SelectUniverse() {
  const { setTheme, setStage } = useWizard();

  const handleSelect = (theme: ThemePack) => {
    arcadeSound?.characterSelect();
    setTheme(theme);
    setTimeout(() => {
      arcadeSound?.stageTransition();
      setStage("choose-fighters");
    }, 500);
  };

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center py-16 px-8 stage-enter">
      {/* Stage Title */}
      <ArcadeText glow="yellow" size="lg" as="h1" className="mb-2">
        SELECT YOUR UNIVERSE
      </ArcadeText>
      <ArcadeText glow="cyan" size="xs" as="p" className="mb-12 opacity-60">
        CHOOSE YOUR THEME PACK
      </ArcadeText>

      {/* Cabinet Grid */}
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl">
        {THEME_PACKS.map((theme) => (
          <CabinetCard key={theme.id} theme={theme} onSelect={() => handleSelect(theme)} />
        ))}

        {/* Custom Cabinet */}
        <button
          onClick={() => {
            arcadeSound?.buttonClick();
            // TODO: Custom theme flow
          }}
          className="flex flex-col items-center justify-center gap-4 p-6 pixel-border rounded-sm w-64 opacity-40 hover:opacity-70 transition-opacity"
          style={{ borderColor: "rgba(255,255,255,0.15)", borderStyle: "dashed" }}
        >
          <div className="text-4xl">⚡</div>
          <div className="font-[family-name:var(--font-arcade)] text-[9px] text-[var(--neon-cyan)]">
            BUILD YOUR OWN
          </div>
          <div className="font-[family-name:var(--font-terminal)] text-sm opacity-50">
            Coming Soon
          </div>
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => {
          arcadeSound?.buttonClick();
          setStage("insert-coin");
        }}
        className="arcade-btn arcade-btn-secondary mt-12"
      >
        ◄ BACK
      </button>
    </div>
  );
}
