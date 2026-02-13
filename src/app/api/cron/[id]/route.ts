import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { mapJob } from "../route";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function loadJobs(): Promise<{ data: any; path: string }> {
  const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
  const raw = await readFile(cronPath, "utf-8");
  return { data: JSON.parse(raw), path: cronPath };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data } = await loadJobs();
    const rawJob = (data.jobs || []).find((j: any) => j.id === id);

    if (!rawJob) {
      return NextResponse.json(
        { error: "Cron job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mapJob(rawJob));
  } catch (error) {
    console.error("Failed to fetch cron job:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron job" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, path } = await loadJobs();
    const jobIndex = (data.jobs || []).findIndex((j: any) => j.id === id);

    if (jobIndex === -1) {
      return NextResponse.json(
        { error: "Cron job not found" },
        { status: 404 }
      );
    }

    // Update enabled state
    if (typeof body.enabled === "boolean") {
      data.jobs[jobIndex].enabled = body.enabled;
      data.jobs[jobIndex].updatedAtMs = Date.now();
    }

    await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json(mapJob(data.jobs[jobIndex]));
  } catch (error) {
    console.error("Failed to update cron job:", error);
    return NextResponse.json(
      { error: "Failed to update cron job" },
      { status: 500 }
    );
  }
}
