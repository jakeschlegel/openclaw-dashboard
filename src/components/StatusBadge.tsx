"use client";

type Status = "online" | "offline" | "success" | "failure" | "running" | "enabled" | "disabled";

const statusStyles: Record<Status, { dot: string; text: string; label: string }> = {
  online: { dot: "bg-success", text: "text-success", label: "Online" },
  offline: { dot: "bg-text-secondary", text: "text-text-secondary", label: "Offline" },
  success: { dot: "bg-success", text: "text-success", label: "Success" },
  failure: { dot: "bg-error", text: "text-error", label: "Failed" },
  running: { dot: "bg-warning animate-pulse", text: "text-warning", label: "Running" },
  enabled: { dot: "bg-success", text: "text-success", label: "Enabled" },
  disabled: { dot: "bg-text-secondary", text: "text-text-secondary", label: "Disabled" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const style = statusStyles[status] || statusStyles.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
