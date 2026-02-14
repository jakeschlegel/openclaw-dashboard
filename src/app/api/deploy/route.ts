import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

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

  return `# SOUL.md — ${agent.characterName}

## Identity
- **Name:** ${agent.name}
- **Character:** ${agent.characterName}
- **Role:** ${agent.role}
- **Emoji:** ${agent.emoji}
- **Theme:** ${agent.themeId}

## Personality
- **Tone:** ${tone}
- **Communication:** ${verbose}
- **Initiative:** ${initiative}
- **Formality:** ${formality}
- **Humor:** ${humor}
- **Risk Tolerance:** ${risk}

## Core Template
${agent.soulTemplate}

## Guidelines
- Stay in character
- Be genuinely helpful
- Use your unique perspective to approach problems
- Actions speak louder than words
`;
}

export async function POST(request: NextRequest) {
  try {
    const { agents, themeId }: { agents: DeployAgent[]; themeId: string } = await request.json();

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json({ error: "No agents to deploy" }, { status: 400 });
    }

    // Get current config
    const currentConfig: any = await gateway({
      method: "GET",
      path: "/config",
    });

    if (!currentConfig) {
      return NextResponse.json({ error: "Could not fetch gateway config" }, { status: 500 });
    }

    // Build new agent entries
    const existingIds = new Set((currentConfig.agents?.list || []).map((a: any) => a.id));
    const newAgentConfigs: any[] = [];
    const soulFiles: { agentId: string; content: string }[] = [];

    for (const agent of agents) {
      const agentId = agent.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

      if (existingIds.has(agentId)) {
        continue; // Skip already-existing agents
      }

      newAgentConfigs.push({
        id: agentId,
        name: agentId,
        workspace: `/Users/jakeschlegel86/clawd-agents/${agentId}`,
        agentDir: `/Users/jakeschlegel86/.openclaw/agents/${agentId}/agent`,
        model: "anthropic/claude-opus-4-6",
      });

      soulFiles.push({
        agentId,
        content: buildSoulMd(agent),
      });
    }

    if (newAgentConfigs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All agents already exist",
        deployed: 0,
      });
    }

    // Create agent directories and SOUL.md files via gateway tools
    for (const soul of soulFiles) {
      // Create workspace dir
      await gateway({
        method: "POST",
        path: "/tools/invoke",
        body: {
          tool: "exec",
          args: {
            command: `mkdir -p /Users/jakeschlegel86/clawd-agents/${soul.agentId} /Users/jakeschlegel86/.openclaw/agents/${soul.agentId}/agent`,
          },
        },
      }).catch(() => {});

      // Write SOUL.md
      await gateway({
        method: "POST",
        path: "/tools/invoke",
        body: {
          tool: "write",
          args: {
            path: `/Users/jakeschlegel86/clawd-agents/${soul.agentId}/SOUL.md`,
            content: soul.content,
          },
        },
      }).catch(() => {});

      // Write AGENTS.md
      await gateway({
        method: "POST",
        path: "/tools/invoke",
        body: {
          tool: "write",
          args: {
            path: `/Users/jakeschlegel86/clawd-agents/${soul.agentId}/AGENTS.md`,
            content: `# AGENTS.md\n\nThis is the workspace for ${soul.agentId}.\n\nSee SOUL.md for personality and role.\n`,
          },
        },
      }).catch(() => {});
    }

    // Patch gateway config to add new agents
    const updatedList = [...(currentConfig.agents?.list || []), ...newAgentConfigs];

    await gateway({
      method: "PATCH",
      path: "/config",
      body: {
        agents: {
          ...currentConfig.agents,
          list: updatedList,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deployed ${newAgentConfigs.length} new agent(s)`,
      deployed: newAgentConfigs.length,
      agentIds: newAgentConfigs.map((a) => a.id),
    });
  } catch (error) {
    console.error("Deploy API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deploy failed" },
      { status: 500 }
    );
  }
}
