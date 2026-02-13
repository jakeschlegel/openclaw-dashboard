import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const runsPath = join(
      homedir(),
      ".openclaw",
      "cron",
      "runs",
      `${id}.jsonl`
    );

    let raw: string;
    try {
      raw = await readFile(runsPath, "utf-8");
    } catch {
      // No runs file yet
      return NextResponse.json([]);
    }

    const lines = raw
      .trim()
      .split("\n")
      .filter((l) => l.trim());

    const runs = lines
      .map((line) => {
        try {
          const entry: any = JSON.parse(line);
          return {
            id: `${entry.jobId}-${entry.ts}`,
            jobId: entry.jobId,
            status:
              entry.status === "ok"
                ? "success"
                : entry.status === "error"
                  ? "failure"
                  : entry.status || "success",
            startedAt: entry.runAtMs
              ? new Date(entry.runAtMs).toISOString()
              : new Date(entry.ts).toISOString(),
            completedAt: entry.ts
              ? new Date(entry.ts).toISOString()
              : undefined,
            durationMs: entry.durationMs || 0,
            output: entry.summary || undefined,
            error: entry.error || undefined,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse(); // Most recent first

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Failed to fetch cron runs:", error);
    return NextResponse.json([], { status: 200 });
  }
}
