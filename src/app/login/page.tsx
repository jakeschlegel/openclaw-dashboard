"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/arcade.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.error) {
        setError("INVALID CREDENTIALS");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center arcade-grid px-4" style={{ backgroundColor: "var(--arcade-bg)" }}>
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 flex items-center justify-center font-[family-name:var(--font-arcade)] text-[14px]"
            style={{
              border: "2px solid var(--neon-cyan)",
              color: "var(--neon-cyan)",
              boxShadow: "0 0 20px var(--neon-cyan)40, inset 0 0 10px var(--neon-cyan)10",
            }}
          >
            OC
          </div>
          <div className="font-[family-name:var(--font-arcade)] text-[12px] neon-cyan">
            OPENCLAW
          </div>
          <div className="font-[family-name:var(--font-terminal)] text-lg opacity-40">
            COMMAND CENTER v2.0
          </div>
        </div>

        {/* Card */}
        <div className="pixel-border p-6" style={{ borderColor: "var(--neon-cyan)40", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="font-[family-name:var(--font-arcade)] text-[10px] neon-cyan mb-1">
            ★ ACCESS TERMINAL ★
          </div>
          <p className="font-[family-name:var(--font-terminal)] text-lg text-text-secondary mb-6">
            Enter credentials to proceed
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block font-[family-name:var(--font-arcade)] text-[7px] opacity-50 mb-2">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 pixel-border font-[family-name:var(--font-terminal)] text-xl focus:outline-none"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderColor: "var(--neon-cyan)30", color: "var(--neon-cyan)" }}
                placeholder="PLAYER 1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-[family-name:var(--font-arcade)] text-[7px] opacity-50 mb-2">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pixel-border font-[family-name:var(--font-terminal)] text-xl focus:outline-none"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", borderColor: "var(--neon-cyan)30", color: "var(--neon-cyan)" }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                className="font-[family-name:var(--font-arcade)] text-[9px] px-3 py-2 pixel-border"
                style={{ color: "var(--neon-red)", borderColor: "var(--neon-red)40", backgroundColor: "rgba(255,0,64,0.08)" }}
              >
                ✕ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full arcade-btn arcade-btn-primary disabled:opacity-30 disabled:cursor-not-allowed py-3!"
            >
              {loading ? "AUTHENTICATING..." : "INSERT COIN →"}
            </button>
          </form>
        </div>

        <p className="text-center font-[family-name:var(--font-terminal)] text-base opacity-20 mt-4">
          © 2026 OPENCLAW SYSTEMS
        </p>
      </div>
    </div>
  );
}
