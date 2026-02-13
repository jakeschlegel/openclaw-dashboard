import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AGENT_EMOJIS: Record<string, string> = {
  main: "🧠",
  research: "🔬",
  content: "✍️",
  devops: "⚙️",
  "chief-of-staff": "📋",
  todos: "✅",
};

export async function GET() {
  try {
    const home = homedir();
    const configPath = join(home, ".openclaw", "openclaw.json");
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    const agents = config.agents?.list || [];
    const defaultModel = config.agents?.defaults?.model?.primary || "unknown";

    // Get active channels from config
    const channelEntries = config.channels || {};
    const activeChannels = Object.entries(channelEntries)
      .filter(([, v]: [string, any]) => v && v.enabled !== false)
      .map(([k]) => k);

    // Count cron jobs per agent
    let cronCounts: Record<string, number> = {};
    try {
      const cronPath = join(home, ".openclaw", "cron", "jobs.json");
      const cronRaw = await readFile(cronPath, "utf-8");
      const cronData = JSON.parse(cronRaw);
      for (const job of cronData.jobs || []) {
        const agentId = job.agentId || "main";
        cronCounts[agentId] = (cronCounts[agentId] || 0) + 1;
      }
    } catch {
      // No cron file - fine
    }

    const result = agents.map((a: Record<string, any>) => {
      const id = a.id || a.name;
      return {
        id,
        name: a.name || a.id,
        emoji: AGENT_EMOJIS[id] || "🤖",
        model: a.model || defaultModel,
        workspace: a.workspace || "",
        status: "online" as const,
        channels: activeChannels,
        cronJobCount: cronCounts[id] || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json([], { status: 200 });
  }
}
