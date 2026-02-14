import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Agent identity context so spawned sessions know who they are
const AGENT_CONTEXT: Record<string, string> = {
  charlie: "You are Charlie 🐀, the main coding agent. You're resourceful, a bit chaotic, but surprisingly competent. You handle coding, general tasks, and wild card projects.",
  dennis: "You are Dennis ⭐, the Chief of Staff agent. You handle delegation, coordination, strategy, and keeping things organized.",
  mac: "You are Mac 🥋, the research and security agent. You handle research, security audits, intel gathering, and threat analysis.",
  dee: "You are Dee 🦅, the content agent. You handle writing, blog posts, content creation, and creative projects.",
  frank: "You are Frank 🗑️, the DevOps agent. You handle infrastructure, deployment, server management, and automation.",
  cricket: "You are Cricket 🦗, the todos agent. You handle task capture, todo lists, reminders, and tracking action items.",
};

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
    const { agentId, message, history, model } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    // Build task with identity context and recent history
    const identity = AGENT_CONTEXT[agentId] || `You are the ${agentId} agent.`;
    
    let taskParts = [identity];
    
    // Include recent history for conversational continuity (last 6 messages)
    if (history && Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      const historyStr = recent
        .map((m: any) => `${m.role === "user" ? "User" : "You"}: ${m.content}`)
        .join("\n");
      taskParts.push(`Recent conversation:\n${historyStr}`);
    }
    
    taskParts.push(`User's message: ${message}`);

    const task = taskParts.join("\n\n");

    // Spawn a session via the gateway
    const data: any = await gateway({
      method: "POST",
      path: "/tools/invoke",
      body: {
        tool: "sessions_spawn",
        args: {
          task,
          agentId,
          ...(model ? { model } : {}),
        },
      },
    });

    // Log the full response for debugging
    console.log("Spawn response:", JSON.stringify(data, null, 2)?.slice(0, 2000));

    // Try to find childSessionKey in various response shapes
    const sessionKey = data?.result?.details?.childSessionKey 
      || data?.result?.childSessionKey
      || data?.details?.childSessionKey
      || data?.childSessionKey;

    // Also check if the response already contains the reply directly
    const directReply = extractAssistantReply(data);
    if (directReply) {
      return NextResponse.json({ response: directReply, agentId });
    }

    // Check if there's content in the result that IS the reply
    if (data?.result?.content && typeof data.result.content === "string") {
      return NextResponse.json({ response: data.result.content, agentId });
    }

    if (sessionKey) {

      // Poll for the result (up to 90 seconds)
      const deadline = Date.now() + 90000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));

        try {
          const historyRes: any = await gateway({
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

          const reply = extractAssistantReply(historyRes);
          if (reply) {
            return NextResponse.json({ response: reply, agentId });
          }
        } catch {
          // Session might not be ready yet
        }
      }

      return NextResponse.json({
        response: "Message sent to agent. The response is taking longer than expected — check Telegram for the reply.",
        agentId,
      });
    }

    // If we get here, the spawn didn't return expected data
    console.error("Unexpected spawn response shape — no sessionKey found");
    return NextResponse.json({ 
      response: "Agent is processing your request. If no response appears, the agent may be busy — try again in a moment.",
      agentId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
