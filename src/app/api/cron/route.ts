import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
    const raw = await readFile(cronPath, "utf-8");
    const data = JSON.parse(raw);
    
    const jobs = (data.jobs || []).map((job: Record<string, unknown>) => ({
      id: job.id,
      name: job.name || "Unnamed Job",
      agentId: job.agentId || "main",
      enabled: job.enabled !== false,
      schedule: job.schedule,
      sessionTarget: job.sessionTarget,
      payload: job.payload,
      state: job.state,
      createdAtMs: job.createdAtMs,
      updatedAtMs: job.updatedAtMs,
    }));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json([], { status: 200 });
  }
}
