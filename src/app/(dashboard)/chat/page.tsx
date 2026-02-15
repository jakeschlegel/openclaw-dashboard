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
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-opus-4-6");
  const [showModelInfo, setShowModelInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage when agent changes
  useEffect(() => {
    if (!selectedAgent) return;
    try {
      const saved = localStorage.getItem(`chat-history-${selectedAgent}`);
      if (saved) setMessages(JSON.parse(saved));
      else setMessages([]);
    } catch { setMessages([]); }
  }, [selectedAgent]);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (!selectedAgent || messages.length === 0) return;
    try {
      localStorage.setItem(`chat-history-${selectedAgent}`, JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages, selectedAgent]);

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
        body: JSON.stringify({ agentId: selectedAgent, message: userMessage.content, history: [...messages, userMessage].slice(-6), model: selectedModel }),
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
          <div className="ml-auto flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  if (selectedAgent) localStorage.removeItem(`chat-history-${selectedAgent}`);
                }}
                className="font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1 pixel-border opacity-40 hover:opacity-100 transition-opacity"
                style={{ borderColor: "var(--neon-red)40", color: "var(--neon-red)" }}
              >
                CLEAR
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowModelInfo(!showModelInfo)}
                className="flex items-center gap-1 font-[family-name:var(--font-arcade)] text-[7px] px-2 py-1 pixel-border transition-all"
                style={{
                  borderColor: "var(--neon-yellow)40",
                  color: "var(--neon-yellow)",
                  backgroundColor: showModelInfo ? "rgba(255,215,0,0.1)" : "transparent",
                }}
              >
                MODEL: {selectedModel.split("/").pop()?.toUpperCase()} ▼
              </button>
              {showModelInfo && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 z-50 pixel-border p-3 space-y-2"
                  style={{ borderColor: "var(--neon-yellow)60", backgroundColor: "var(--arcade-bg)" }}
                >
                  {[
                    {
                      id: "anthropic/claude-opus-4-6",
                      name: "OPUS 4",
                      tier: "★★★",
                      color: "#FFD700",
                      desc: "Most capable. Best for complex coding, research, multi-step reasoning. Slower, higher cost.",
                      best: "Hard quests, full-stack builds, deep analysis",
                    },
                    {
                      id: "anthropic/claude-sonnet-4-5",
                      name: "SONNET 4.5",
                      tier: "★★☆",
                      color: "#00FFFF",
                      desc: "Great balance of speed and intelligence. Good for most tasks. Recommended default.",
                      best: "Medium quests, writing, general coding, chat",
                    },
                    {
                      id: "anthropic/claude-haiku-4-5",
                      name: "HAIKU 4.5",
                      tier: "★☆☆",
                      color: "#39FF14",
                      desc: "Fastest and cheapest. Great for simple tasks, quick answers, and high-volume work.",
                      best: "Easy quests, quick lookups, simple Q&A, drafts",
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelInfo(false); }}
                      className="w-full text-left p-2 pixel-border transition-all"
                      style={{
                        borderColor: selectedModel === m.id ? `${m.color}80` : "rgba(255,255,255,0.08)",
                        backgroundColor: selectedModel === m.id ? `${m.color}10` : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[family-name:var(--font-arcade)] text-[8px]" style={{ color: m.color }}>
                          {m.name}
                        </span>
                        <span className="font-[family-name:var(--font-arcade)] text-[8px]" style={{ color: m.color }}>
                          {m.tier}
                        </span>
                      </div>
                      <p className="font-[family-name:var(--font-terminal)] text-base opacity-60 mb-1">
                        {m.desc}
                      </p>
                      <p className="font-[family-name:var(--font-arcade)] text-[6px] opacity-40">
                        BEST FOR: {m.best.toUpperCase()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
          <div className="flex items-center justify-between mt-2">
            <p className="font-[family-name:var(--font-arcade)] text-[7px] opacity-30">
              ENTER TO SEND • SHIFT+ENTER FOR NEW LINE
            </p>
            <p className="font-[family-name:var(--font-arcade)] text-[7px] opacity-30" style={{ color: "var(--neon-yellow)" }}>
              ⚡ LITE MODE — FOR FULL AGENT POWERS (WEB SEARCH, FILES, BROWSER) USE TELEGRAM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
