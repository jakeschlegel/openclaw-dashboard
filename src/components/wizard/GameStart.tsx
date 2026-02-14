"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { arcadeSound } from "@/lib/sound";

type Phase = "countdown" | "game-start" | "deploying" | "stage-clear" | "error";

export function GameStart() {
  const { state } = useWizard();
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);
  const [deployResult, setDeployResult] = useState<{ deployed: number; agentIds?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deploy = useCallback(async () => {
    if (!state.theme) return;

    try {
      const agents = state.selectedAgents.map((a) => ({
        name: a.character.name.split(" ")[0].toLowerCase(),
        role: a.role,
        emoji: a.character.emoji,
        personality: a.personality,
        soulTemplate: a.character.soulTemplate,
        characterName: a.character.name,
        themeId: state.theme!.id,
      }));

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agents, themeId: state.theme.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deploy failed");
      }

      setDeployResult(data);
      setPhase("stage-clear");
      arcadeSound?.deploySuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy failed");
      setPhase("error");
      arcadeSound?.error();
    }
  }, [state]);

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
      const t = setTimeout(() => {
        setPhase("deploying");
        deploy();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, count, deploy]);

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
          <div className="font-[family-name:var(--font-terminal)] text-lg opacity-40">
            Writing SOUL.md files... Updating gateway config...
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
            {deployResult?.deployed || state.selectedAgents.length} AGENTS DEPLOYED TO GATEWAY
          </ArcadeText>

          {deployResult?.deployed === 0 && (
            <div className="font-[family-name:var(--font-terminal)] text-lg opacity-50" style={{ color: "var(--neon-yellow)" }}>
              All agents already existed — configs untouched
            </div>
          )}

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

      {/* Error */}
      {phase === "error" && (
        <div className="flex flex-col items-center gap-6 stage-enter">
          <div className="pixel-border px-12 py-6" style={{ borderColor: "var(--neon-red)", boxShadow: "0 0 20px var(--neon-red)" }}>
            <ArcadeText glow="magenta" size="lg" as="div">
              GAME OVER
            </ArcadeText>
          </div>

          <div className="font-[family-name:var(--font-terminal)] text-xl" style={{ color: "var(--neon-red)" }}>
            {error}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                setPhase("countdown");
                setCount(3);
                setError(null);
              }}
              className="arcade-btn arcade-btn-primary"
            >
              CONTINUE? (RETRY)
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="arcade-btn arcade-btn-secondary"
            >
              QUIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
