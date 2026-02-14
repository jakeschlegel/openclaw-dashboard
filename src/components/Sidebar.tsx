"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Chat", href: "/chat", icon: "💬" },
  { label: "Cron Jobs", href: "/cron", icon: "⏰" },
  { label: "Quest Board", href: "/quests", icon: "⚔️" },
  { label: "Agent Builder", href: "/builder", icon: "🕹️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "var(--neon-cyan)20" }}>
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div
            className="w-8 h-8 flex items-center justify-center font-[family-name:var(--font-arcade)] text-[8px]"
            style={{
              border: "2px solid var(--neon-cyan)",
              color: "var(--neon-cyan)",
              boxShadow: "0 0 8px var(--neon-cyan)40",
            }}
          >
            OC
          </div>
          <span className="font-[family-name:var(--font-arcade)] text-[9px] neon-cyan">
            OPENCLAW
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 transition-all font-[family-name:var(--font-terminal)] text-xl"
              style={{
                color: active ? "var(--neon-cyan)" : "rgba(255,255,255,0.4)",
                backgroundColor: active ? "rgba(0,255,255,0.08)" : "transparent",
                borderLeft: active ? "2px solid var(--neon-cyan)" : "2px solid transparent",
                textShadow: active ? "0 0 8px var(--neon-cyan)" : "none",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--neon-cyan)10" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)" }}
          />
          <span className="font-[family-name:var(--font-terminal)] text-base" style={{ color: "var(--neon-green)", opacity: 0.6 }}>
            GATEWAY ONLINE
          </span>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 pixel-border"
        style={{ borderColor: "var(--neon-cyan)40", backgroundColor: "var(--arcade-bg)" }}
        aria-label="Toggle menu"
      >
        <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-40 w-[240px] h-full transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "var(--arcade-bg-secondary)", borderRight: "1px solid var(--neon-cyan)15" }}
      >
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-[240px] min-h-screen flex-shrink-0"
        style={{ backgroundColor: "var(--arcade-bg-secondary)", borderRight: "1px solid rgba(0,255,255,0.08)" }}
      >
        {nav}
      </aside>
    </>
  );
}
