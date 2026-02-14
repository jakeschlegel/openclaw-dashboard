"use client";

import { useState } from "react";
import { useWizard } from "@/lib/wizard-state";
import { ArcadeText } from "@/components/arcade/ArcadeText";
import { StatBar } from "@/components/arcade/StatBar";
import { Character } from "@/lib/theme-packs";
import { arcadeSound } from "@/lib/sound";

const STAT_ICONS: Record<string, string> = {
  research: "🧠",
  coding: "💻",
  content: "✍️",
  security: "🛡️",
  strategy: "🎯",
  speed: "⚡",
};

function CharacterCard({
  character,
  isSelected,
  slotNumber,
  onSelect,
  onHover,
}: {
  character: Character;
  isSelected: boolean;
  slotNumber: number | null;
  onSelect: () => void;
  onHover: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => {
        setHovered(true);
        onHover();
        arcadeSound?.characterHover();
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        onSelect();
        if (!isSelected) {
          arcadeSound?.characterSelect();
        } else {
          arcadeSound?.characterDeselect();
        }
      }}
      className={`relative flex flex-col items-center gap-2 p-4 transition-all duration-200 ${hovered || isSelected ? "char-idle" : ""}`}
      style={{
        filter: isSelected
          ? `drop-shadow(0 0 15px ${character.avatarColor})`
          : hovered
            ? `drop-shadow(0 0 8px ${character.avatarColor})`
            : "none",
      }}
    >
      {/* Player Indicator */}
      {isSelected && slotNumber !== null && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 font-[family-name:var(--font-arcade)] text-[8px] px-2 py-1"
          style={{
            color: "#000",
            backgroundColor: character.avatarColor,
            boxShadow: `0 0 8px ${character.avatarColor}`,
          }}
        >
          P{slotNumber}
        </div>
      )}

      {/* Character Emoji (large, pixelated feel) */}
      <div
        className="w-20 h-20 flex items-center justify-center text-5xl pixel-border rounded-sm transition-all"
        style={{
          borderColor: isSelected ? character.avatarColor : hovered ? `${character.avatarColor}80` : "rgba(255,255,255,0.1)",
          backgroundColor: isSelected ? `${character.avatarColor}20` : "rgba(255,255,255,0.02)",
          boxShadow: isSelected ? `inset 0 0 20px ${character.avatarColor}20` : "none",
        }}
      >
        {character.emoji}
      </div>

      {/* Name */}
      <div
        className="font-[family-name:var(--font-arcade)] text-[8px] text-center max-w-[100px] leading-relaxed"
        style={{ color: isSelected ? character.avatarColor : hovered ? "var(--neon-cyan)" : "rgba(255,255,255,0.6)" }}
      >
        {character.name.split(" ")[0].toUpperCase()}
      </div>

      {/* Selection glow platform */}
      <div
        className="w-16 h-[2px] transition-all"
        style={{
          backgroundColor: isSelected ? character.avatarColor : "transparent",
          boxShadow: isSelected ? `0 0 10px ${character.avatarColor}` : "none",
        }}
      />
    </button>
  );
}

export function ChooseFighters() {
  const { state, addAgent, removeAgent, setStage } = useWizard();
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null);

  if (!state.theme) return null;

  const selectedIds = new Set(state.selectedAgents.map((a) => a.character.id));

  const getSlotNumber = (charId: string) => {
    const idx = state.selectedAgents.findIndex((a) => a.character.id === charId);
    return idx >= 0 ? idx + 1 : null;
  };

  const handleSelect = (character: Character) => {
    if (selectedIds.has(character.id)) {
      const slot = state.selectedAgents.findIndex((a) => a.character.id === character.id);
      if (slot >= 0) removeAgent(slot);
    } else if (state.selectedAgents.length < 6) {
      addAgent(character);
    }
  };

  const displayChar = hoveredChar || state.selectedAgents[state.selectedAgents.length - 1]?.character || state.theme.characters[0];

  return (
    <div className="min-h-screen arcade-grid flex flex-col py-8 px-8 stage-enter">
      {/* Header */}
      <div className="text-center mb-6">
        <ArcadeText glow="yellow" size="lg" as="h1">
          CHOOSE YOUR FIGHTERS
        </ArcadeText>
        <div className="font-[family-name:var(--font-terminal)] text-xl mt-2 opacity-50" style={{ color: state.theme.accentColor }}>
          &quot;{state.theme.tagline}&quot; &nbsp; — &nbsp; SELECT UP TO 6 AGENTS
        </div>
      </div>

      <div className="flex flex-1 gap-8 max-w-7xl mx-auto w-full">
        {/* Character Info Panel (Left) */}
        <div className="w-80 shrink-0">
          <div className="pixel-border p-5 h-full" style={{ borderColor: `${displayChar.avatarColor}60` }}>
            <ArcadeText glow="cyan" size="xs" as="div" className="mb-4 opacity-60">
              CHARACTER INFO
            </ArcadeText>

            {/* Name + One Liner */}
            <div className="text-2xl font-[family-name:var(--font-terminal)] mb-1" style={{ color: displayChar.avatarColor }}>
              {displayChar.emoji} {displayChar.name}
            </div>
            <div className="font-[family-name:var(--font-terminal)] text-base opacity-50 mb-6 italic">
              &quot;{displayChar.oneLiner}&quot;
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {Object.entries(displayChar.stats).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-5 text-center">{STAT_ICONS[key]}</span>
                  <span className="font-[family-name:var(--font-arcade)] text-[7px] w-20 opacity-60 uppercase">
                    {key}
                  </span>
                  <StatBar value={value} color={displayChar.avatarColor} showValue={false} />
                  <span className="font-[family-name:var(--font-terminal)] text-sm" style={{ color: displayChar.avatarColor }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggested Role */}
            <div className="mt-6 font-[family-name:var(--font-arcade)] text-[8px] opacity-40">
              SUGGESTED: {displayChar.suggestedRole.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Character Lineup */}
          <div className="flex-1 flex items-end justify-center">
            <div className="flex gap-4 pb-4">
              {state.theme.characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={selectedIds.has(char.id)}
                  slotNumber={getSlotNumber(char.id)}
                  onSelect={() => handleSelect(char)}
                  onHover={() => setHoveredChar(char)}
                />
              ))}
            </div>
          </div>

          {/* Player Slots */}
          <div className="flex justify-center gap-3 py-4 mt-4 pixel-border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const agent = state.selectedAgents[i];
              return (
                <div
                  key={i}
                  className="w-16 h-16 flex items-center justify-center pixel-border text-2xl transition-all"
                  style={{
                    borderColor: agent ? agent.character.avatarColor : "rgba(255,255,255,0.1)",
                    backgroundColor: agent ? `${agent.character.avatarColor}15` : "transparent",
                    boxShadow: agent ? `0 0 8px ${agent.character.avatarColor}40` : "none",
                  }}
                >
                  {agent ? (
                    <span>{agent.character.emoji}</span>
                  ) : (
                    <span className="font-[family-name:var(--font-arcade)] text-[8px] opacity-20">
                      P{i + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center mt-6 max-w-7xl mx-auto w-full">
        <button
          onClick={() => {
            arcadeSound?.buttonClick();
            setStage("select-universe");
          }}
          className="arcade-btn arcade-btn-secondary"
        >
          ◄ BACK
        </button>

        <div className="font-[family-name:var(--font-terminal)] text-xl opacity-50">
          {state.selectedAgents.length}/6 FIGHTERS SELECTED
        </div>

        <button
          onClick={() => {
            if (state.selectedAgents.length > 0) {
              arcadeSound?.stageTransition();
              setStage("customize");
            }
          }}
          className={`arcade-btn ${state.selectedAgents.length > 0 ? "arcade-btn-primary" : "arcade-btn-secondary opacity-30 cursor-not-allowed"}`}
        >
          LOCK IN ►
        </button>
      </div>
    </div>
  );
}
