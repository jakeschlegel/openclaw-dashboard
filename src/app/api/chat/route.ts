import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { agentId, message } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    // Escape the message for shell safety
    const escapedMessage = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    
    // Run the openclaw agent command
    const command = `openclaw agent --agent ${agentId} --message "${escapedMessage}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minute timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stderr && !stdout) {
      console.error("openclaw stderr:", stderr);
      return NextResponse.json(
        { error: stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: stdout.trim(),
      agentId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
