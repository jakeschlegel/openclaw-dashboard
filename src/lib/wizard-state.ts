"use client";

import { createContext, useContext } from "react";
import { Character, ThemePack } from "./theme-packs";

export type WizardStage = "insert-coin" | "select-universe" | "choose-fighters" | "customize" | "ready" | "game-start";

export interface SelectedAgent {
  slot: number; // P1-P6
  character: Character;
  role: string;
  personality: {
    sarcasm: number;
    verbosity: number;
    initiative: number;
    formality: number;
    humor: number;
    risk: number;
  };
}

export interface WizardState {
  stage: WizardStage;
  theme: ThemePack | null;
  selectedAgents: SelectedAgent[];
  customizingSlot: number | null;
}

export interface WizardContextType {
  state: WizardState;
  setStage: (stage: WizardStage) => void;
  setTheme: (theme: ThemePack) => void;
  addAgent: (character: Character) => void;
  removeAgent: (slot: number) => void;
  setCustomizingSlot: (slot: number | null) => void;
  updateAgentRole: (slot: number, role: string) => void;
  updateAgentPersonality: (slot: number, key: string, value: number) => void;
}

export const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

export const INITIAL_STATE: WizardState = {
  stage: "insert-coin",
  theme: null,
  selectedAgents: [],
  customizingSlot: null,
};
