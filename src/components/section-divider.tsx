export function SectionDivider({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
      <span
        className="text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      {action}
      <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
    </div>
  );
}
