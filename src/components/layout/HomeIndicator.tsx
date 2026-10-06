/**
 * figma: 586:70 · Pharos/App/Home indicator
 * props: —
 *
 *   402x34 · fill color/bg/surface · bar 134x5, radius 3, color/text/primary, centered
 *
 * tokens: color-bg-surface, color-text-primary
 * note: device chrome — the radius stays literal (3px) as in Figma.
 */
export function HomeIndicator() {
  return (
    <div className="flex h-[var(--home-indicator-h)] w-full items-center justify-center bg-[var(--color-bg-surface)]">
      <span className="h-[5px] w-[134px] rounded-[3px] bg-[var(--color-text-primary)]" />
    </div>
  );
}
