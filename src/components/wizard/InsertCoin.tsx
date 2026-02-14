"use client";

import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { arcadeSound } from "@/lib/sound";

export function InsertCoin() {
  const { setStage } = useWizard();

  const handleStart = () => {
    arcadeSound?.coinInsert();
    setTimeout(() => {
      arcadeSound?.stageTransition();
      setStage("select-universe");
    }, 400);
  };

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center justify-center gap-12 stage-enter">
      {/* Title */}
      <div className="text-center space-y-4">
        <ArcadeText glow="cyan" size="xl" as="h1">
          AGENT BUILDER
        </ArcadeText>
        <div className="h-[2px] w-48 mx-auto bg-[var(--neon-cyan)] opacity-50" />
        <ArcadeText glow="magenta" size="lg" as="h2">
          ARCADE EDITION
        </ArcadeText>
      </div>

      {/* Insert Coin Text */}
      <ArcadeText glow="yellow" size="sm" blink className="mt-8">
        🪙 INSERT COIN TO START 🪙
      </ArcadeText>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="arcade-btn arcade-btn-primary text-lg px-12 py-4 glow-pulse"
      >
        PRESS START
      </button>

      {/* Credits */}
      <div className="mt-8 font-[family-name:var(--font-terminal)] text-[var(--neon-cyan)] opacity-50 text-xl">
        1P ●○○○○○ &nbsp; CREDITS: 99
      </div>
    </div>
  );
}
