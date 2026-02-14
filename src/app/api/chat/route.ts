import { NextRequest, NextResponse } from "next/server";
import { gateway } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AGENT_CONTEXT: Record<string, string> = {
  charlie: "You are Charlie 🐀, the main coding agent. You're resourceful, a bit chaotic, but surprisingly competent. You handle coding, general tasks, and wild card projects. Respond as Charlie.",
  dennis: "You are Dennis ⭐, the Chief of Staff agent. You handle delegation, coordination, strategy, and keeping things organized. Respond as Dennis.",
  mac: "You are Mac 🥋, the research and security agent. You handle research, security audits, intel gathering, and threat analysis. Respond as Mac.",
  dee: "You are Dee 🦅, the content agent. You handle writing, blog posts, content creation, and creative projects. Respond as Dee.",
  frank: "You are Frank 🗑️, the DevOps agent. You handle infrastructure, deployment, server management, and automation. Respond as Frank.",
  cricket: "You are Cricket 🦗, the todos agent. You handle task capture, todo lists, reminders, and tracking action items. Respond as Cricket.",
};

function extractTextFromContent(content: any): string | null {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("")
      .trim() || null;
  }
  return null;
}

function extractSessionKey(data: any): string | null {
  // Check standard locations
  const key = data?.result?.details?.childSessionKey
    || data?.result?.childSessionKey
    || data?.details?.childSessionKey
    || data?.childSessionKey;
  if (key) return key;

  // Check if it's embedded as JSON in result.content text
  const text = extractTextFromContent(data?.result?.content);
  if (text) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.childSessionKey) return parsed.childSessionKey;
    } catch {}
  }

  return null;
}

function extractAssistantReply(data: any): string | null {
  const messages = data?.result?.details?.messages;
  if (!Array.isArray(messages)) return null;

  const assistantMsgs = messages.filter((m: any) => m.role === "assistant");
  if (assistantMsgs.length === 0) return null;

  const lastMsg = assistantMsgs[assistantMsgs.length - 1];
  return extractTextFromContent(lastMsg.content);
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, message, history, model } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json({ error: "Missing agentId or message" }, { status: 400 });
    }

    const identity = AGENT_CONTEXT[agentId] || `You are the ${agentId} agent. Respond helpfully.`;
    let taskParts = [identity];

    if (history && Array.isArray(history) && history.length > 0) {
      // Filter out any JSON/system messages from history
      const clean = history
        .slice(-6)
        .filter((m: any) => !m.content?.startsWith("{"))
        .map((m: any) => `${m.role === "user" ? "User" : "You"}: ${m.content}`);
      if (clean.length > 0) {
        taskParts.push(`Recent conversation:\n${clean.join("\n")}`);
      }
    }

    taskParts.push(`User's current message: ${message}\n\nRespond naturally and helpfully. Keep your response concise unless the task requires detail.`);

    const task = taskParts.join("\n\n");
    const spawnArgs: any = { task };
    if (model) spawnArgs.model = model;

    // Step 1: Spawn session
    const spawnRes: any = await gateway({
      method: "POST",
      path: "/tools/invoke",
      body: { tool: "sessions_spawn", args: spawnArgs },
    });

    // Step 2: Get session key from response
    const sessionKey = extractSessionKey(spawnRes);

    if (!sessionKey) {
      console.error("No sessionKey found in spawn response:", JSON.stringify(spawnRes)?.slice(0, 500));
      return NextResponse.json({
        response: "Agent couldn't be reached. Try again in a moment.",
        agentId,
      });
    }

    // Step 3: Poll for the actual reply
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));

      try {
        const historyRes: any = await gateway({
          method: "POST",
          path: "/tools/invoke",
          body: {
            tool: "sessions_history",
            args: { sessionKey, limit: 10, includeTools: false },
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
      response: "The agent is still thinking — try again in a moment.",
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
