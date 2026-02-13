"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[6px] bg-accent flex items-center justify-center text-white font-bold text-lg">
            OC
          </div>
          <span className="text-text-primary font-semibold text-xl">OpenClaw</span>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-[6px] p-6">
          <h1 className="text-[16px] font-semibold text-text-primary mb-1">Sign in</h1>
          <p className="text-[13px] text-text-secondary mb-6">
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 bg-bg border border-border rounded-[6px] text-[14px] text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-bg border border-border rounded-[6px] text-[14px] text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="text-[13px] text-error bg-error/10 border border-error/20 rounded-[6px] px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white text-[14px] font-medium rounded-[6px] hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-text-secondary mt-4">
          OpenClaw Dashboard
        </p>
      </div>
    </div>
  );
}
