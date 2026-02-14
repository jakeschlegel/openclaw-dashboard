"use client";

import { useState, useCallback } from "react";
import { WizardContext, WizardState, WizardStage, INITIAL_STATE, SelectedAgent } from "@/lib/wizard-state";
import { Character, ThemePack } from "@/lib/theme-packs";
import { CrtOverlay } from "@/components/arcade/CrtOverlay";
import { InsertCoin } from "@/components/wizard/InsertCoin";
import { SelectUniverse } from "@/components/wizard/SelectUniverse";
import { ChooseFighters } from "@/components/wizard/ChooseFighters";
import { Customize } from "@/components/wizard/Customize";
import { Ready } from "@/components/wizard/Ready";
import { GameStart } from "@/components/wizard/GameStart";
import "@/styles/arcade.css";

export default function BuilderPage() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const setStage = useCallback((stage: WizardStage) => {
    setState((s) => ({ ...s, stage }));
  }, []);

  const setTheme = useCallback((theme: ThemePack) => {
    setState((s) => ({ ...s, theme, selectedAgents: [] }));
  }, []);

  const addAgent = useCallback((character: Character) => {
    setState((s) => {
      if (s.selectedAgents.length >= 6) return s;
      if (s.selectedAgents.some((a) => a.character.id === character.id)) return s;
      const newAgent: SelectedAgent = {
        slot: s.selectedAgents.length,
        character,
        role: character.suggestedRole.toLowerCase(),
        personality: { ...character.personalityDefaults },
      };
      return { ...s, selectedAgents: [...s.selectedAgents, newAgent] };
    });
  }, []);

  const removeAgent = useCallback((slot: number) => {
    setState((s) => ({
      ...s,
      selectedAgents: s.selectedAgents
        .filter((_, i) => i !== slot)
        .map((a, i) => ({ ...a, slot: i })),
    }));
  }, []);

  const setCustomizingSlot = useCallback((slot: number | null) => {
    setState((s) => ({ ...s, customizingSlot: slot }));
  }, []);

  const updateAgentRole = useCallback((slot: number, role: string) => {
    setState((s) => ({
      ...s,
      selectedAgents: s.selectedAgents.map((a, i) =>
        i === slot ? { ...a, role } : a
      ),
    }));
  }, []);

  const updateAgentPersonality = useCallback((slot: number, key: string, value: number) => {
    setState((s) => ({
      ...s,
      selectedAgents: s.selectedAgents.map((a, i) =>
        i === slot
          ? { ...a, personality: { ...a.personality, [key]: value } }
          : a
      ),
    }));
  }, []);

  const ctx = {
    state,
    setStage,
    setTheme,
    addAgent,
    removeAgent,
    setCustomizingSlot,
    updateAgentRole,
    updateAgentPersonality,
  };

  return (
    <WizardContext.Provider value={ctx}>
      <div className="min-h-screen bg-[var(--arcade-bg)]">
        <CrtOverlay />
        {state.stage === "insert-coin" && <InsertCoin />}
        {state.stage === "select-universe" && <SelectUniverse />}
        {state.stage === "choose-fighters" && <ChooseFighters />}
        {state.stage === "customize" && <Customize />}
        {state.stage === "ready" && <Ready />}
        {state.stage === "game-start" && <GameStart />}
      </div>
    </WizardContext.Provider>
  );
}
