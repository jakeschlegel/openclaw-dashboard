import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    const { agentId, message } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    // Use the gateway /tools/invoke endpoint to spawn a session
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
        await new Promise((r) => setTimeout(r, 3000));

        try {
          const history: any = await gateway({
            method: "POST",
            path: "/tools/invoke",
            body: {
              tool: "sessions_history",
              args: {
                sessionKey,
                limit: 5,
                includeTools: false,
              },
            },
          });

          if (history?.ok && history?.result?.content) {
            // Parse the content to find assistant messages
            const content = history.result.content;
            let text = "";

            if (Array.isArray(content)) {
              for (const c of content) {
                if (c.type === "text") text += c.text;
              }
            } else if (typeof content === "string") {
              text = content;
            }

            // Try to parse as JSON array of messages
            try {
              const messages = JSON.parse(text);
              if (Array.isArray(messages)) {
                const assistantMsgs = messages.filter(
                  (m: any) => m.role === "assistant"
                );
                if (assistantMsgs.length > 0) {
                  const lastMsg = assistantMsgs[assistantMsgs.length - 1];
                  let reply = "";
                  if (typeof lastMsg.content === "string") {
                    reply = lastMsg.content;
                  } else if (Array.isArray(lastMsg.content)) {
                    reply = lastMsg.content
                      .filter((c: any) => c.type === "text")
                      .map((c: any) => c.text)
                      .join("");
                  }
                  if (reply) {
                    return NextResponse.json({
                      response: reply,
                      agentId,
                    });
                  }
                }
              }
            } catch {
              // Not JSON, check if the session is done some other way
              if (text && text.length > 10) {
                return NextResponse.json({
                  response: text,
                  agentId,
                });
              }
            }
          }
        } catch {
          // Session might not be ready yet, keep polling
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
