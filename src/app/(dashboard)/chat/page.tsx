"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Agent, ChatMessage } from "@/lib/types";

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Map role names to agent IDs for quest board integration
  const ROLE_TO_AGENT: Record<string, string> = {
    coding: "charlie",
    research: "mac",
    "chief-of-staff": "dennis",
    content: "dee",
    devops: "frank",
    security: "mac",
    data: "charlie",
    creative: "dee",
  };

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          const agentList = Array.isArray(data) ? data : data.agents || [];
          setAgents(agentList);
          const preselect = searchParams.get("agent");
          // Try direct ID match first, then role mapping
          const resolvedAgent = preselect && agentList.some((a: Agent) => a.id === preselect)
            ? preselect
            : preselect && ROLE_TO_AGENT[preselect] && agentList.some((a: Agent) => a.id === ROLE_TO_AGENT[preselect])
              ? ROLE_TO_AGENT[preselect]
              : agentList.length > 0 ? agentList[0].id : "";
          setSelectedAgent(resolvedAgent);

          // Pre-fill prompt from query param
          const promptParam = searchParams.get("prompt");
          if (promptParam) {
            setInput(promptParam);
          }
        }
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setAgentsLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent, message: userMessage.content }),
      });
      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.error ? `Error: ${data.error}` : data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to send message"}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentAgent = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="arcade-grid min-h-screen -m-6 lg:-m-8 -mt-14 lg:-mt-8 p-6 lg:p-8">
      <PageHeader title="Comms Channel" description="Talk to your agents directly" />

      <div
        className="flex flex-col h-[calc(100vh-180px)] max-h-[800px] pixel-border overflow-hidden"
        style={{ borderColor: "var(--neon-cyan)40", backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        {/* Agent selector header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,255,255,0.15)", backgroundColor: "rgba(0,255,255,0.03)" }}
        >
          <span className="font-[family-name:var(--font-arcade)] text-[8px] neon-cyan">AGENT:</span>
          {agentsLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1.5 font-[family-name:var(--font-terminal)] text-lg pixel-border focus:outline-none"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderColor: "var(--neon-cyan)40",
                color: "var(--neon-cyan)",
              }}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.emoji} {agent.name}
                </option>
              ))}
            </select>
          )}
          {currentAgent && (
            <span className="ml-auto font-[family-name:var(--font-arcade)] text-[7px] opacity-40">
              MODEL: {currentAgent.model?.split("/").pop()?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-3">{currentAgent?.emoji || "💬"}</div>
                <p className="font-[family-name:var(--font-arcade)] text-[10px] neon-cyan mb-2">
                  NO MESSAGES YET
                </p>
                <p className="font-[family-name:var(--font-terminal)] text-base opacity-40">
                  Start a conversation with {currentAgent?.name || "an agent"}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] px-4 py-3 pixel-border"
                  style={{
                    borderColor: msg.role === "user" ? "var(--neon-magenta)40" : "var(--neon-cyan)40",
                    backgroundColor: msg.role === "user" ? "rgba(255,0,255,0.08)" : "rgba(0,255,255,0.05)",
                  }}
                >
                  <div className="font-[family-name:var(--font-arcade)] text-[7px] mb-1" style={{
                    color: msg.role === "user" ? "var(--neon-magenta)" : "var(--neon-cyan)",
                  }}>
                    {msg.role === "user" ? "YOU" : currentAgent?.name?.toUpperCase() || "AGENT"}
                  </div>
                  <p className="font-[family-name:var(--font-terminal)] text-xl whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className="font-[family-name:var(--font-terminal)] text-sm opacity-30 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 pixel-border" style={{ borderColor: "var(--neon-cyan)40" }}>
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="font-[family-name:var(--font-terminal)] text-base opacity-60">
                    {currentAgent?.emoji} {currentAgent?.name} is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(0,255,255,0.15)" }}>
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentAgent?.name || "agent"}...`}
              disabled={loading || !selectedAgent}
              rows={1}
              className="flex-1 px-4 py-2.5 pixel-border font-[family-name:var(--font-terminal)] text-xl resize-none min-h-[44px] max-h-[120px] focus:outline-none"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                borderColor: "var(--neon-cyan)30",
                color: "var(--neon-cyan)",
                height: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || !selectedAgent}
              className="arcade-btn arcade-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "SEND ►"}
            </button>
          </div>
          <p className="font-[family-name:var(--font-arcade)] text-[7px] opacity-30 mt-2">
            ENTER TO SEND • SHIFT+ENTER FOR NEW LINE
          </p>
        </div>
      </div>
    </div>
  );
}
