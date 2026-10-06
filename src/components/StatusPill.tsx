/**
 * figma: 11:148 (Pharos/Status) · 11:142 Tone=Neutral · 11:143 Tone=Info · 11:144 Tone=Success
 *        · 11:145 Tone=Warning · 11:146 Tone=Danger · 11:147 Tone=Match
 *   every variant is 87x28: HORIZONTAL hug, centred, pad 6 y / 12 x, gap 6, radius 999,
 *   Dot = 6x6 ellipse in the tone text colour, Label = Label/12 (DM Sans Medium 12/16, tracking 0)
 * props: label, tone, dot   (Figma text property "Label", boolean property "Show dot"; Figma writes "In transit")
 * tokens: color-status-{tone}-bg, color-status-{tone}-text, radius-pill, spacing-6, spacing-12, text-label-12
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'match';

export function StatusPill({ label, tone = 'neutral', dot = true }: { label: string; tone?: Tone; dot?: boolean }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-[var(--spacing-6)] rounded-[var(--radius-pill)] px-[var(--spacing-12)] py-[var(--spacing-6)] text-label-12"
      style={{ background: `var(--color-status-${tone}-bg)`, color: `var(--color-status-${tone}-text)` }}
    >
      {dot && (
        <span
          aria-hidden
          className="h-[var(--spacing-6)] w-[var(--spacing-6)] shrink-0 rounded-[var(--radius-pill)] bg-current"
        />
      )}
      {/* its own node, like the Figma "Label" layer */}
      <span className="text-label-12">{label}</span>
    </span>
  );
}
