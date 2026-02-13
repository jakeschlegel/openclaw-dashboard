import { NextRequest, NextResponse } from "next/server";
import { mapJob, loadCronJobs } from "../route";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobs = await loadCronJobs();
    const rawJob = jobs.find((j: any) => j.id === id);

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

    // Try local file first
    try {
      const { readFile, writeFile } = await import("fs/promises");
      const { homedir } = await import("os");
      const { join } = await import("path");
      const cronPath = join(homedir(), ".openclaw", "cron", "jobs.json");
      const raw = await readFile(cronPath, "utf-8");
      const data = JSON.parse(raw);
      const jobIndex = (data.jobs || []).findIndex((j: any) => j.id === id);

      if (jobIndex === -1) {
        return NextResponse.json(
          { error: "Cron job not found" },
          { status: 404 }
        );
      }

      if (typeof body.enabled === "boolean") {
        data.jobs[jobIndex].enabled = body.enabled;
        data.jobs[jobIndex].updatedAtMs = Date.now();
      }

      await writeFile(cronPath, JSON.stringify(data, null, 2), "utf-8");
      return NextResponse.json(mapJob(data.jobs[jobIndex]));
    } catch {
      return NextResponse.json(
        { error: "Cannot modify cron jobs in remote mode" },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Failed to update cron job:", error);
    return NextResponse.json(
      { error: "Failed to update cron job" },
      { status: 500 }
    );
  }
}
