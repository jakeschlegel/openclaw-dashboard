import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configPath = join(homedir(), ".openclaw", "openclaw.json");
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    const agents = config.agents?.list || [];
    const defaultModel = config.agents?.defaults?.model?.primary || "unknown";

    const result = agents.map((a: Record<string, string>) => ({
      id: a.id || a.name,
      name: a.name || a.id,
      model: a.model || defaultModel,
      workspace: a.workspace || "",
      status: "online",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json([], { status: 200 });
  }
}
