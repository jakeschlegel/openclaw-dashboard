import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AGENT_EMOJIS: Record<string, string> = {
  charlie: "🐀",
  dennis: "⭐",
  mac: "🥋",
  dee: "🦅",
  frank: "🗑️",
  cricket: "🦗",
  main: "🐀",
  research: "🥋",
  content: "🦅",
  devops: "🗑️",
  "chief-of-staff": "⭐",
  todos: "🦗",
};

const AGENT_ROLES: Record<string, string> = {
  charlie: "General • Coding • Wild Card",
  dennis: "Chief of Staff • Delegation",
  mac: "Research • Security • Intel",
  dee: "Content • Blogs • Writing",
  frank: "DevOps • Infrastructure",
  cricket: "Todos • Task Capture",
  main: "General • Coding • Wild Card",
  research: "Research • Security • Intel",
  content: "Content • Blogs • Writing",
  devops: "DevOps • Infrastructure",
  "chief-of-staff": "Chief of Staff • Delegation",
  todos: "Todos • Task Capture",
};

async function getConfigFromFile(): Promise<any | null> {
  try {
    const home = homedir();
    const configPath = join(home, ".openclaw", "openclaw.json");
    const raw = await readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getConfigFromEnv(): any | null {
  const raw = process.env.OPENCLAW_AGENTS_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getCronCountsFromFile(): Promise<Record<string, number>> {
  try {
    const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
    const cronRaw = await readFile(cronPath, "utf-8");
    const cronData = JSON.parse(cronRaw);
    const counts: Record<string, number> = {};
    for (const job of cronData.jobs || []) {
      const agentId = job.agentId || "main";
      counts[agentId] = (counts[agentId] || 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

function getCronCountsFromEnv(): Record<string, number> {
  const raw = process.env.OPENCLAW_CRON_JSON;
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    const counts: Record<string, number> = {};
    for (const job of data.jobs || []) {
      const agentId = job.agentId || "main";
      counts[agentId] = (counts[agentId] || 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    // Try local file first, then env var fallback (for Railway)
    const config = (await getConfigFromFile()) || getConfigFromEnv();
    if (!config) {
      return NextResponse.json([], { status: 200 });
    }

    const agents = config.agents?.list || [];
    const defaultModel = config.agents?.defaults?.model?.primary || "unknown";

    const channelEntries = config.channels || {};
    const activeChannels = Object.entries(channelEntries)
      .filter(([, v]: [string, any]) => v && v.enabled !== false)
      .map(([k]) => k);

    const cronCounts = {
      ...(await getCronCountsFromFile()),
      ...getCronCountsFromEnv(),
    };

    const result = agents.map((a: Record<string, any>) => {
      const id = a.id || a.name;
      return {
        id,
        name: a.name || a.id,
        emoji: AGENT_EMOJIS[id] || "🤖",
        role: AGENT_ROLES[id] || "",
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
