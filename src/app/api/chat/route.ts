import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Agent identity context
const AGENT_CONTEXT: Record<string, string> = {
  charlie: "You are Charlie 🐀, the main coding agent. You're resourceful, a bit chaotic, but surprisingly competent. You handle coding, general tasks, and wild card projects. Respond as Charlie.",
  dennis: "You are Dennis ⭐, the Chief of Staff agent. You handle delegation, coordination, strategy, and keeping things organized. Respond as Dennis.",
  mac: "You are Mac 🥋, the research and security agent. You handle research, security audits, intel gathering, and threat analysis. Respond as Mac.",
  dee: "You are Dee 🦅, the content agent. You handle writing, blog posts, content creation, and creative projects. Respond as Dee.",
  frank: "You are Frank 🗑️, the DevOps agent. You handle infrastructure, deployment, server management, and automation. Respond as Frank.",
  cricket: "You are Cricket 🦗, the todos agent. You handle task capture, todo lists, reminders, and tracking action items. Respond as Cricket.",
};

function extractAssistantReply(data: any): string | null {
  // Check in result.details.messages
  const messages = data?.result?.details?.messages;
  if (Array.isArray(messages)) {
    const assistantMsgs = messages.filter((m: any) => m.role === "assistant");
    if (assistantMsgs.length > 0) {
      const lastMsg = assistantMsgs[assistantMsgs.length - 1];
      if (typeof lastMsg.content === "string") return lastMsg.content;
      if (Array.isArray(lastMsg.content)) {
        return lastMsg.content
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.text)
          .join("")
          .trim();
      }
    }
  }

  // Check result.content directly
  if (data?.result?.content) {
    if (typeof data.result.content === "string") return data.result.content;
    if (Array.isArray(data.result.content)) {
      const text = data.result.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("")
        .trim();
      if (text) return text;
    }
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
    const identity = AGENT_CONTEXT[agentId] || `You are the ${agentId} agent. Respond helpfully.`;

    let taskParts = [identity];

    // Include recent history for conversational continuity (last 6 messages)
    if (history && Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      const historyStr = recent
        .map((m: any) => `${m.role === "user" ? "User" : "You"}: ${m.content}`)
        .join("\n");
      taskParts.push(`Recent conversation:\n${historyStr}`);
    }

    taskParts.push(`User's current message: ${message}\n\nRespond naturally and helpfully. Keep your response concise unless the task requires detail.`);

    const task = taskParts.join("\n\n");

    // Always spawn as default agent (no agentId restriction)
    // The identity context handles personality
    const spawnArgs: any = { task };
    if (model) spawnArgs.model = model;

    const data: any = await gateway({
      method: "POST",
      path: "/tools/invoke",
      body: {
        tool: "sessions_spawn",
        args: spawnArgs,
      },
    });

    console.log("Spawn response keys:", data ? Object.keys(data) : "null");

    // Try to extract reply directly from spawn result
    const directReply = extractAssistantReply(data);
    if (directReply) {
      return NextResponse.json({ response: directReply, agentId });
    }

    // Try to find childSessionKey
    const sessionKey = data?.result?.details?.childSessionKey
      || data?.result?.childSessionKey
      || data?.details?.childSessionKey;

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
        response: "The agent is still thinking — this is taking longer than expected. Try again in a moment.",
        agentId,
      });
    }

    // Last resort — check if there's any text content in the response
    const anyText = JSON.stringify(data);
    if (anyText.includes("forbidden")) {
      return NextResponse.json({
        response: "This agent isn't available for direct chat right now. Try Charlie instead!",
        agentId,
      });
    }

    return NextResponse.json({
      response: "Agent is processing your request. If no response appears, try again in a moment.",
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
