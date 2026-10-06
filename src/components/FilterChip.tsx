/**
 * figma: 338:211 · Pharos/Filter chip — COMPONENT_SET, 2 variants (6 direct instances +
 *        25 nested inside `Pharos/Route search + filters` on page 21)
 *   State=Default `338:207` (108x34 with the master label "Curtainsider")
 *   State=Selected `338:209` (108x34, same label)
 * props: label, selected, onClick, className
 *
 *   Box: HORIZONTAL, pad 6/12/6/12, gap 8, CENTER/CENTER, AUTO/AUTO, radius 999.
 *   `strokesIncludedInLayout = true`: 12 + 82 + 12 = 106 and the frame is 108 — the 1px INSIDE
 *   stroke is inside the box. `box-border` + border + `px-[12px]` + `py-[6px]` reproduces it
 *   (measured on `2065:2813` "ADR" 54x34: label at x 13 of the instance).
 *   The 8px gap is declared but unused: neither variant has an icon or a second slot.
 *
 *   State=Default:  fill `chip/bg/default` -> color/bg/surface #ffffff
 *                   stroke `chip/border/default` -> color/border/strong #8093a0
 *                   label  `chip/text/default` -> color/text/secondary #586d79
 *   State=Selected: fill `chip/bg/selected` -> color/status/info-bg #ebf3f7
 *                   stroke `chip/border/selected` -> color/border/brand #225d74
 *                   label  #225d74 (color/status/info-text)
 *   Label: DM Sans Medium 14/20 (`text-label-14`) — Figma component property `Label` (text).
 *
 *   Real labels and widths measured on the screens. Page 30, section `02 · Vehicle onboarding`
 *   (`Chips` frames 231x34 and 229x34): "ADR" 54 · "Part loads" 92 · "Tail lift" 69 ·
 *   "Rear loading" 107 · "Side" 55 · "Top" 51. Inside `Route search + filters`: "Filters" 67 ·
 *   "Hide filters" 98 · "Curtainsider" 108 · "Today" 66 · "up to 12.4 t" 98 ·
 *   "up to 18 pallets" 125 · "300–400 €" 106 · "ADR · dangerous goods" 178 ·
 *   "LTL · part loads" 125. Every one of them is 34 tall.
 *
 * tokens: color-bg-surface, color-border-strong, color-text-secondary, color-status-info-bg,
 *         color-status-info-text, color-border-brand, radius-pill, text-label-14
 * TODO(token): none — every value above resolves to an existing token.
 */
export function FilterChip({
  label,
  selected = false,
  onClick,
  className,
}: {
  /** Figma `Label` text property */
  label: string;
  /** State=Selected */
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-[34px] items-center justify-center rounded-[var(--radius-pill)] border px-[12px] py-[6px] text-label-14 ${
        selected
          ? 'border-[var(--color-border-brand)] bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]'
          : 'border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
      } ${className ?? ''}`}
    >
      <span>{label}</span>
    </button>
  );
}
