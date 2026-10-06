/**
 * figma: Pharos/Status (11:148) — tones mirror the Figma variants
 * tokens: color-status-{tone}-bg / -text, radius-pill, size-icon-sm
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'match';

export function StatusPill({ label, tone = 'neutral', dot = true }: { label: string; tone?: Tone; dot?: boolean }) {
  return (
    <span
      className="inline-flex h-[28px] w-fit items-center gap-[6px] rounded-[var(--radius-pill)] px-[12px] text-label-12"
      style={{ background: `var(--color-status-${tone}-bg)`, color: `var(--color-status-${tone}-text)` }}
    >
      {dot && <span className="h-[6px] w-[6px] rounded-[var(--radius-pill)]" style={{ background: 'currentColor' }} />}
      {label}
    </span>
  );
}
