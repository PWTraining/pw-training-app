// Placeholder text wordmark — DECISIONS.md notes the real logo file is a
// placeholder Paul is still redesigning, so this stands in until that lands.
export function Wordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-lg font-extrabold italic leading-none tracking-tight"
        style={{ color: "var(--color-brand)" }}
      >
        PW
      </span>
      <span className="flex flex-col justify-center leading-none">
        <span
          className="text-[11px] font-bold tracking-[0.15em]"
          style={{ color: "var(--color-brand-ink)" }}
        >
          TRAINING
        </span>
        <span className="mt-1 flex h-[3px] gap-[2px]">
          <span
            className="flex-1 rounded-full"
            style={{ background: "var(--color-brand-yellow)" }}
          />
          <span
            className="flex-1 rounded-full"
            style={{ background: "var(--color-brand-green)" }}
          />
          <span
            className="flex-1 rounded-full"
            style={{ background: "var(--color-brand-teal)" }}
          />
        </span>
      </span>
    </div>
  );
}
