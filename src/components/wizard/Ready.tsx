"use client";

import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { arcadeSound } from "@/lib/sound";

export function Ready() {
  const { state, setStage } = useWizard();

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center justify-center py-12 px-8 stage-enter">
      {/* Title */}
      <ArcadeText glow="yellow" size="xl" as="h1" className="mb-2">
        ★ YOUR CREW IS READY ★
      </ArcadeText>
      <ArcadeText glow="cyan" size="xs" as="p" className="mb-12 opacity-50">
        REVIEW YOUR SQUAD BEFORE DEPLOYMENT
      </ArcadeText>

      {/* Fighter Lineup */}
      <div className="flex gap-8 mb-12">
        {state.selectedAgents.map((agent, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            {/* Player number */}
            <div className="font-[family-name:var(--font-arcade)] text-[8px] opacity-40">
              P{i + 1}
            </div>

            {/* Character */}
            <div
              className="w-24 h-24 flex items-center justify-center text-5xl pixel-border char-idle"
              style={{
                borderColor: agent.character.avatarColor,
                backgroundColor: `${agent.character.avatarColor}15`,
                boxShadow: `0 0 15px ${agent.character.avatarColor}40`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {agent.character.emoji}
            </div>

            {/* Name */}
            <div
              className="font-[family-name:var(--font-arcade)] text-[8px]"
              style={{ color: agent.character.avatarColor }}
            >
              {agent.character.name.split(" ")[0].toUpperCase()}
            </div>

            {/* Role */}
            <div className="font-[family-name:var(--font-terminal)] text-base opacity-40">
              {agent.role}
            </div>

            {/* Level */}
            <div className="font-[family-name:var(--font-arcade)] text-[7px] opacity-30">
              LV.1
            </div>
          </div>
        ))}
      </div>

      {/* Theme badge */}
      {state.theme && (
        <div className="font-[family-name:var(--font-terminal)] text-lg opacity-30 mb-8">
          Theme: {state.theme.name}
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex gap-8">
        <button
          onClick={() => { arcadeSound?.buttonClick(); setStage("customize"); }}
          className="arcade-btn arcade-btn-secondary"
        >
          ◄ BACK
        </button>
        <button
          onClick={() => {
            arcadeSound?.deployCountdown();
            setStage("game-start");
          }}
          className="arcade-btn arcade-btn-primary text-lg px-12 py-4 glow-pulse"
        >
          🎮 GAME START!
        </button>
      </div>
    </div>
  );
}
