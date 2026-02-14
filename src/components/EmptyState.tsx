"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="font-[family-name:var(--font-arcade)] text-[12px] neon-cyan mb-2">{title.toUpperCase()}</h3>
      {description && (
        <p className="font-[family-name:var(--font-terminal)] text-lg text-text-secondary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
