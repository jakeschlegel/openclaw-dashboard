import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await gateway({
      method: "POST",
      path: `/cron/jobs/${id}/run`,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to run cron job:", error);
    // Return a more graceful error - the gateway might not support this endpoint
    return NextResponse.json(
      {
        error: "Failed to trigger cron job. The OpenClaw gateway may not be reachable.",
      },
      { status: 502 }
    );
  }
}
