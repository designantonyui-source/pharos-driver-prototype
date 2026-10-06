import { Icon } from './Icon';

/**
 * figma: 2646:1314 · Pharos/Filters button — COMPONENT_SET, 2 variants (21 instances)
 *   Badge=Shown `2646:1288` (123x48) · Badge=Hidden `2646:1302` (95x48)
 * props: label, count, onClick, className
 *
 *   Box: HORIZONTAL, pad 0/12/0/12, gap 8, MIN/CENTER, AUTO/FIXED (hug width, fixed 48),
 *   fill color/bg/surface, 1px INSIDE stroke color/border/strong, radius 12.
 *   `strokesIncludedInLayout = true`: 12+20+8+41+8+20+12 = 121 and the frame is 123 — the two
 *   extra px are the stroke, one per side. `box-border` + `border` + `px-[12px]` gives the same
 *   123 (measured on `2646:14152`: icon at x 13, label at x 41, badge at x 90).
 *
 *   Icon: `Lucide/Icon/Sliders horizontal` `2644:2`, 20x20, stroke bound to color/text/primary
 *   #172a35, 2px (the glyph frame's own vectors report 1.6667 = 2 * 20/24, i.e. it is the lucide
 *   glyph at 20px, not a 24px one). Colour is NOT a property of the Figma component — the
 *   instance inherits it — so it is `currentColor` here.
 *
 *   Label: layer `Label`, "Filters", DM Sans Medium 14/20 (`text-label-14`),
 *   fill color/text/primary #172a35, box 41x20 (hug).
 *
 *   Count badge: 20x20 frame, radius 999, fill color/action/primary #225d74, text `Count`
 *   DM Sans Medium 12/16 (`text-label-12`) color/text/inverse #ffffff, CENTER/CENTER.
 *   The badge is the ONLY difference between the two variants, so it is `count` here rather
 *   than two components. Figma's master digit is "2"; on the screens 15 of the 21 instances
 *   show the badge and 6 do not (`2668:14781`, `2689:15276`, `2043:2901`, ...).
 *
 *   Boxes measured on the screens: `2646:14152` 123x48 at x 16 of `Search controls v2 /
 *   filters and view` (370x48, gap 8) · `2668:14781` 95x48 · `2648:14208` 123x48 inside
 *   `Floating controls` (386x64).
 *
 * tokens: color-bg-surface, color-border-strong, color-text-primary, color-action-primary,
 *         color-text-inverse, radius-md, radius-pill, size-icon-md, text-label-14, text-label-12
 * TODO(token): none — every value above resolves to an existing token.
 */
export function FiltersButton({
  label = 'Filters',
  count,
  onClick,
  className,
}: {
  /** Figma `Label` property; the app always passes "Filters" */
  label?: string;
  /** number of active filters — omit (or pass undefined) for the Badge=Hidden variant */
  count?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[48px] items-center gap-[8px] rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-[12px] text-[var(--color-text-primary)] ${className ?? ''}`}
    >
      <Icon name="sliders" className="text-[var(--color-text-primary)]" />
      <span className="text-label-14">{label}</span>
      {count !== undefined && (
        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-action-primary)]">
          <span className="text-label-12 text-[var(--color-text-inverse)]">{count}</span>
        </span>
      )}
    </button>
  );
}
