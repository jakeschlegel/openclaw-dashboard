import { NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export async function GET() {
  try {
    const data = await gateway({ path: "/cron/jobs" });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron jobs" },
      { status: 502 }
    );
  }
}
