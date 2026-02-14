"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1
          className="font-[family-name:var(--font-arcade)] text-[16px] neon-cyan"
        >
          ★ {title.toUpperCase()} ★
        </h1>
        {description && (
          <p className="text-[16px] text-text-secondary mt-1 font-[family-name:var(--font-terminal)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
