import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await gateway({ path: `/cron/jobs/${id}` });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cron job:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron job" },
      { status: 502 }
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
    const data = await gateway({
      method: "PATCH",
      path: `/cron/jobs/${id}`,
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update cron job:", error);
    return NextResponse.json(
      { error: "Failed to update cron job" },
      { status: 502 }
    );
  }
}
