"use client";

import { useState, useEffect } from "react";
import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { arcadeSound } from "@/lib/sound";

type Phase = "countdown" | "game-start" | "deploying" | "stage-clear";

export function GameStart() {
  const { state } = useWizard();
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (phase === "countdown") {
      if (count > 0) {
        arcadeSound?.deployCountdown();
        const t = setTimeout(() => setCount(count - 1), 800);
        return () => clearTimeout(t);
      } else {
        setPhase("game-start");
        arcadeSound?.powerUp();
      }
    }

    if (phase === "game-start") {
      const t = setTimeout(() => setPhase("deploying"), 1500);
      return () => clearTimeout(t);
    }

    if (phase === "deploying") {
      // Simulate deploy
      const t = setTimeout(() => {
        setPhase("stage-clear");
        arcadeSound?.deploySuccess();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, count]);

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center justify-center">
      {/* Countdown */}
      {phase === "countdown" && (
        <div className="screen-shake">
          <ArcadeText glow="yellow" size="xl" as="div" className="text-[80px]!">
            {count}
          </ArcadeText>
        </div>
      )}

      {/* GAME START flash */}
      {phase === "game-start" && (
        <div className="screen-shake stage-enter">
          <ArcadeText glow="cyan" size="xl" as="div" className="text-[48px]!">
            GAME START!
          </ArcadeText>
        </div>
      )}

      {/* Deploying */}
      {phase === "deploying" && (
        <div className="flex flex-col items-center gap-8 stage-enter">
          <ArcadeText glow="magenta" size="md" as="div">
            DEPLOYING AGENTS...
          </ArcadeText>
          <div className="flex gap-4">
            {state.selectedAgents.map((agent, i) => (
              <div
                key={i}
                className="text-4xl power-up"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {agent.character.emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Clear */}
      {phase === "stage-clear" && (
        <div className="flex flex-col items-center gap-8 stage-enter">
          <div className="pixel-border px-12 py-6" style={{ borderColor: "var(--neon-green)", boxShadow: "0 0 20px var(--neon-green), 0 0 40px var(--neon-green)" }}>
            <ArcadeText glow="green" size="xl" as="div">
              STAGE CLEAR!
            </ArcadeText>
          </div>

          <div className="flex gap-4 mt-4">
            {state.selectedAgents.map((agent, i) => (
              <div key={i} className="text-4xl char-idle" style={{ animationDelay: `${i * 0.15}s` }}>
                {agent.character.emoji}
              </div>
            ))}
          </div>

          <ArcadeText glow="cyan" size="sm" as="p" className="mt-4 opacity-60">
            {state.selectedAgents.length} AGENTS DEPLOYED SUCCESSFULLY
          </ArcadeText>

          {/* Achievement placeholder */}
          <div className="pixel-border px-6 py-3 mt-4" style={{ borderColor: "var(--neon-yellow)" }}>
            <ArcadeText glow="yellow" size="xs">
              🏆 ACHIEVEMENT UNLOCKED: FIRST BLOOD
            </ArcadeText>
          </div>

          <button
            onClick={() => {
              arcadeSound?.buttonClick();
              window.location.href = "/";
            }}
            className="arcade-btn arcade-btn-primary mt-8"
          >
            GO TO DASHBOARD ►
          </button>
        </div>
      )}
    </div>
  );
}
