import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractAssistantReply(data: any): string | null {
  const messages = data?.result?.details?.messages;
  if (!Array.isArray(messages)) return null;

  const assistantMsgs = messages.filter((m: any) => m.role === "assistant");
  if (assistantMsgs.length === 0) return null;

  const lastMsg = assistantMsgs[assistantMsgs.length - 1];
  if (typeof lastMsg.content === "string") return lastMsg.content;
  if (Array.isArray(lastMsg.content)) {
    return lastMsg.content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("")
      .trim();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, message } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    // Spawn a session via the gateway
    const data: any = await gateway({
      method: "POST",
      path: "/tools/invoke",
      body: {
        tool: "sessions_spawn",
        args: {
          task: message,
          agentId,
        },
      },
    });

    if (data?.ok && data?.result?.details?.childSessionKey) {
      const sessionKey = data.result.details.childSessionKey;

      // Poll for the result (up to 90 seconds)
      const deadline = Date.now() + 90000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));

        try {
          const history: any = await gateway({
            method: "POST",
            path: "/tools/invoke",
            body: {
              tool: "sessions_history",
              args: {
                sessionKey,
                limit: 10,
                includeTools: false,
              },
            },
          });

          const reply = extractAssistantReply(history);
          if (reply) {
            return NextResponse.json({
              response: reply,
              agentId,
            });
          }
        } catch {
          // Session might not be ready yet
        }
      }

      return NextResponse.json({
        response:
          "Message sent to agent. The response is taking longer than expected — check Telegram for the reply.",
        agentId,
      });
    }

    return NextResponse.json({
      response: "Message sent to agent.",
      agentId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
