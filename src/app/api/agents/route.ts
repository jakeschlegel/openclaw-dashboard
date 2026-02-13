import { NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export async function GET() {
  try {
    const data = await gateway({ path: "/agents" });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 502 }
    );
  }
}
