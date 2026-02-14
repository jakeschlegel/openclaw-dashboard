"use client";

import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { CrtOverlay } from "@/components/arcade/CrtOverlay";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen" style={{ backgroundColor: "var(--arcade-bg)" }}>
        <CrtOverlay />
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 pt-14 lg:pt-8 max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
