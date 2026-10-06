import { Icon } from './Icon';

/**
 * figma: 2715:1596 · Pharos/App/Trip checklist — the `State=Awaiting` instance 2715:25520
 *        used by Content=Request, State=Trip data (2715:25486)
 * props: title, rows
 * uses the shared `Icon` registry (`clock`), not a direct lucide import.
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-status-warning-text, radius-md, text-heading-20, text-label-14, text-caption-12
 * geometry: 370x190 · pad 16 · gap 12 · r12 · fill #ffffff · stroke #d7e0e6 w1 INSIDE
 *   Title 336x28 Manrope SemiBold 20/28 #172a35
 *   4 rows 336x20 HORIZONTAL gap 8, counter-axis CENTER:
 *     Icon   16x16 `Lucide/Icon/Clock` 2px #172a35
 *     Label  262x20 DM Sans Medium 14/20 #172a35 (FILL)
 *     Status 42x16 DM Sans Regular 12/16 #855300 (color/status/warning-text)
 *   Height check: 16+28+12+(4*20)+3*12+16+2 = 190 == Figma.
 * NOTE: the row layer is literally called `Icon / Clock` and its main component IS
 *   `Lucide/Icon/Clock` (resolved with getMainComponentAsync) — the icon does not lie here.
 * SCOPE: this is the full `Pharos/App/Trip checklist` set ported only in its Awaiting state,
 *   because Trip data is the only variant of the bottom sheet that instantiates it. The other
 *   states of that set are still `todo` in PORT-LOG §3.
 */
export type TripChecklistRow = { label: string; status?: string };

export function TripChecklist({
  title = 'Trip data',
  rows = [
    { label: 'Pickup address' },
    { label: 'Delivery address' },
    { label: 'Pickup contact' },
    { label: 'Required documents' },
  ],
}: {
  title?: string;
  rows?: TripChecklistRow[];
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-[12px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px]">
      <span className="h-[28px] w-full text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      {rows.map((row) => (
        <div key={row.label} className="flex h-[20px] w-full shrink-0 items-center gap-[8px]">
          <Icon name="clock" size={16} className="text-[var(--color-text-primary)]" />
          <span className="w-full text-label-14 text-[var(--color-text-primary)]">{row.label}</span>
          <span className="shrink-0 whitespace-nowrap text-caption-12 text-[var(--color-status-warning-text)]">
            {row.status ?? 'Waiting'}
          </span>
        </div>
      ))}
    </div>
  );
}
