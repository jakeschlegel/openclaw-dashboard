import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapJob(job: any) {
  // schedule can be an object { kind, expr, tz } or a plain string
  const sched = job.schedule;
  const scheduleExpr =
    typeof sched === "string" ? sched : sched?.expr || String(sched);
  const scheduleTz = typeof sched === "object" ? sched?.tz : undefined;

  const state: any = job.state || {};

  // Map lastStatus: openclaw uses "ok"/"error", dashboard expects "success"/"failure"
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

export async function GET() {
  try {
    const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
    const raw = await readFile(cronPath, "utf-8");
    const data = JSON.parse(raw);

    const jobs = (data.jobs || []).map(mapJob);

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json([], { status: 200 });
  }
}
