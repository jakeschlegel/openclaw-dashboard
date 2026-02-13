import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapJob(job: any) {
  const sched = job.schedule;
  const scheduleExpr =
    typeof sched === "string" ? sched : sched?.expr || String(sched);
  const scheduleTz = typeof sched === "object" ? sched?.tz : undefined;

  const state: any = job.state || {};

  let lastResult: string | null = null;
  if (state.lastStatus === "ok") lastResult = "success";
  else if (state.lastStatus === "error") lastResult = "failure";
  else if (state.lastStatus === "running") lastResult = "running";
  else if (state.lastStatus) lastResult = state.lastStatus;

  const payload: any = job.payload || {};

  return {
    id: job.id,
    name: job.name || "Unnamed Job",
    agentId: job.agentId || "main",
    agentName: job.agentId || "main",
    enabled: job.enabled !== false,
    schedule: scheduleExpr,
    scheduleHuman: scheduleTz
      ? `${scheduleExpr} (${scheduleTz})`
      : scheduleExpr,
    lastRun: state.lastRunAtMs
      ? new Date(state.lastRunAtMs).toISOString()
      : undefined,
    lastResult,
    nextRun: state.nextRunAtMs
      ? new Date(state.nextRunAtMs).toISOString()
      : undefined,
    prompt: payload.text || payload.prompt || undefined,
    channel: job.sessionTarget || undefined,
    model: job.model || undefined,
  };
}

export { mapJob };

async function loadCronJobs(): Promise<any[]> {
  // Try local file first
  try {
    const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
    const raw = await readFile(cronPath, "utf-8");
    const data = JSON.parse(raw);
    return data.jobs || [];
  } catch {
    // Fall back to env var (for Railway)
    const envRaw = process.env.OPENCLAW_CRON_JSON;
    if (envRaw) {
      try {
        const data = JSON.parse(envRaw);
        return data.jobs || [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export { loadCronJobs };

export async function GET() {
  try {
    const jobs = await loadCronJobs();
    return NextResponse.json(jobs.map(mapJob));
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json([], { status: 200 });
  }
}
