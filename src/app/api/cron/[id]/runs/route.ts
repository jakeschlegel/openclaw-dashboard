import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await gateway({ path: `/cron/jobs/${id}/runs` });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cron runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron runs" },
      { status: 502 }
    );
  }
}
