import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DeployAgent {
  name: string;
  role: string;
  emoji: string;
  personality: {
    sarcasm: number;
    verbosity: number;
    initiative: number;
    formality: number;
    humor: number;
    risk: number;
  };
  soulTemplate: string;
  characterName: string;
  themeId: string;
}

function buildSoulMd(agent: DeployAgent): string {
  const p = agent.personality;
  const tone = p.sarcasm > 60 ? "sarcastic and sharp-witted" : p.sarcasm < 30 ? "sincere and straightforward" : "balanced in tone";
  const verbose = p.verbosity > 60 ? "thorough and detailed" : p.verbosity < 30 ? "concise and terse" : "moderate in length";
  const initiative = p.initiative > 60 ? "proactive — takes action without being asked" : p.initiative < 30 ? "reactive — waits for instructions" : "balanced between proactive and reactive";
  const formality = p.formality > 60 ? "professional and formal" : p.formality < 30 ? "casual and relaxed" : "semi-formal";
  const humor = p.humor > 60 ? "frequently funny, loves jokes" : p.humor < 30 ? "serious and focused" : "occasional humor";
  const risk = p.risk > 60 ? "bold, willing to take risks" : p.risk < 30 ? "careful and cautious" : "measured risk-taker";

  return `# SOUL.md — ${agent.characterName}\n\n## Identity\n- **Name:** ${agent.name}\n- **Character:** ${agent.characterName}\n- **Role:** ${agent.role}\n- **Emoji:** ${agent.emoji}\n- **Theme:** ${agent.themeId}\n\n## Personality\n- **Tone:** ${tone}\n- **Communication:** ${verbose}\n- **Initiative:** ${initiative}\n- **Formality:** ${formality}\n- **Humor:** ${humor}\n- **Risk Tolerance:** ${risk}\n\n## Core Template\n${agent.soulTemplate}\n\n## Guidelines\n- Stay in character\n- Be genuinely helpful\n- Use your unique perspective to approach problems\n- Actions speak louder than words\n`;
}

export async function POST(request: NextRequest) {
  try {
    const { agents }: { agents: DeployAgent[] } = await request.json();

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json({ error: "No agents to deploy" }, { status: 400 });
    }

    // Generate agent configs and SOUL.md content
    const generatedAgents = agents.map((agent) => {
      const agentId = agent.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      return {
        id: agentId,
        name: agent.characterName,
        emoji: agent.emoji,
        role: agent.role,
        soulMd: buildSoulMd(agent),
        config: {
          id: agentId,
          name: agentId,
          model: "anthropic/claude-opus-4-6",
        },
      };
    });

    // For Phase 1: Return the generated configs for the user
    // The dashboard chat with Charlie can handle the actual deployment
    return NextResponse.json({
      success: true,
      message: `Generated ${generatedAgents.length} agent configuration(s)`,
      deployed: generatedAgents.length,
      agentIds: generatedAgents.map((a) => a.id),
      agents: generatedAgents,
    });
  } catch (error) {
    console.error("Deploy API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deploy failed" },
      { status: 500 }
    );
  }
}
