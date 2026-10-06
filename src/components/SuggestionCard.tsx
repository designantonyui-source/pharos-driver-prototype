/**
 * figma: the inner `Frame` 354x80 of 2197:7975 (Origin current), 2197:8028 (Destination current),
 *        2197:8277 (Origin suggestions), 2197:8330 (Destination suggestions)
 * props: title, subtitle, onSelect, actionLabel
 * tokens: color-bg-canvas, color-text-primary, color-text-secondary, radius-md,
 *         text-heading-20, text-body-14
 * geometry: 354x80 · pad 16 · gap 4 · r12 · fill #f4f6f8 (color/bg/canvas), VERTICAL:
 *   city     322x28 · Manrope SemiBold 20/28 · #172a35
 *   country  322x20 · DM Sans Regular 14/20 · #586d79
 *   The card is a button: in the two `suggestions` states it is the suggested result,
 *   in the two `current` states it is the already-chosen city — same box, different caption
 *   above it (`Suggestions` vs `Current selection`) which the screen owns.
 */
export function SuggestionCard({
  title = 'Lille',
  subtitle = 'France',
  actionLabel,
  onSelect,
}: {
  title?: string;
  subtitle?: string;
  /** accessible name; the Figma `Select Lille` button label is the visible counterpart */
  actionLabel?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={actionLabel}
      className="flex h-[80px] w-full shrink-0 flex-col justify-center gap-[4px] rounded-[var(--radius-md)] bg-[var(--color-bg-canvas)] p-[16px] text-left"
    >
      <span className="h-[28px] w-full text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      <span className="h-[20px] w-full text-body-14 text-[var(--color-text-secondary)]">{subtitle}</span>
    </button>
  );
}
