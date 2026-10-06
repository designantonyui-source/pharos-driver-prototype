import { Icon } from './Icon';

/**
 * figma: 2621:1288 · Pharos/Filter chip v2 — COMPONENT_SET, 4 variants (11 instances on the screens)
 *   State=Default `2621:1277` (92x44) · State=Selected `2621:1283` (112x44)
 *   State=Disabled `2621:1287` (92x44) · State=Applied `2650:1306` (106x40)
 * props: label, state, onClick, className
 *
 *   The first three variants are one shape: a 44-tall box with `pad 5/0/5/0` wrapping a 34-tall
 *   `Face` (HORIZONTAL, pad 6/12/6/12, gap 6, CENTER/CENTER, radius 999, `strokesIncludedInLayout`).
 *   State=Applied is a different shape: the frame itself is the pill — 40 tall, pad 0/8/0/12,
 *   gap 4, MIN/CENTER, radius 999 and NO stroke. Both ARE the pill ("tomorrow" is 66 wide):
 *     default  12+66+12        = 90  + 2 stroke = 92
 *     selected 12+14+6+66+12   = 110 + 2 stroke = 112
 *     disabled 12+66+12        = 90  + 2 stroke = 92
 *     applied  12+66+4+16+8    = 106 (no stroke)
 *   so the wrapper is 44 = 5+34+5 and the applied pill is its own root. The set is a HORIZONTAL
 *   layout at pad 24 / gap 24; the 522x92 bounding box is just that grid.
 *
 *   State=Default:  fill color/bg/surface · 1px INSIDE color/border/strong · label #586d79
 *   State=Selected: fill `chip/bg/selected` -> color/status/info-bg #ebf3f7 ·
 *                   1px INSIDE `chip/border/selected` -> color/border/brand #225d74 ·
 *                   label #225d74 · leading 14x14 `Check` frame (`2621:1280`)
 *   State=Disabled: fill color/bg/disabled #e8edf0 · 1px INSIDE color/action/disabled #c3d0d8 ·
 *                   label color/text/disabled #80929e
 *   State=Applied:  fill color/status/info-bg #ebf3f7 · no stroke · label #225d74 ·
 *                   trailing 16x16 `Lucide/Icon/X` `2648:2`, vectors stroked #225d74 at 1.3333
 *                   (= the lucide glyph at 16px)
 *
 *   The check mark is NOT a scaled lucide icon and the registry has no equivalent: `2621:1281`
 *   `Check path` is the raw vector `M 0 4 L 3 7 L 9 0` — geometry 9x7, stroked at a literal 2px
 *   (Figma reports 9x7, i.e. WITHOUT the stroke), centred in the 14x14 frame at (2.5, 3.5).
 *   Lucide's `Check` is `M20 6 9 17l-5-5`, 16x11 in a 24 box, and lucide scales the stroke with
 *   the box. At 14px it lands on 9.33x6.42 — very close to Figma's 9x7 — but its stroke would be
 *   1.17px instead of 2, so `strokeWidth` is raised to 2 * 24/14 to put the drawn stroke back at
 *   2px. That is the only place in the design that needs a non-default stroke width.
 *
 *   Instances on the screens: all 11 are State=Applied — `2650:21945` "Today" 80x40 and
 *   `2650:21951` "€300–400" 117x40 inside the 370x40 `Applied filters` row `2551:12646`
 *   (gap 8). The other three variants are only ever placed on the components page.
 *
 *   Figma does not say which part of State=Applied is the target; the whole 106x40 pill is one
 *   button here (a nested button inside a button is invalid), the X being its visual affordance.
 *
 * tokens: color-bg-surface, color-border-strong, color-text-secondary, color-status-info-bg,
 *         color-border-brand, color-status-info-text, color-bg-disabled, color-action-disabled,
 *         color-text-disabled, radius-pill, text-label-14
 * TODO(token): none — every value above resolves to an existing token.
 */
export type FilterChipV2State = 'default' | 'selected' | 'disabled' | 'applied';

/** lucide draws in a 24 viewBox, so a literal 2px stroke in a 14px box is 2 * 24/14 units. */
const CHECK_STROKE_14 = (2 * 24) / 14;

const FACE: Record<Exclude<FilterChipV2State, 'applied'>, string> = {
  default:
    'border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]',
  selected:
    'border-[var(--color-border-brand)] bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
  disabled:
    'border-[var(--color-action-disabled)] bg-[var(--color-bg-disabled)] text-[var(--color-text-disabled)]',
};

export function FilterChipV2({
  label,
  state = 'default',
  onClick,
  className,
}: {
  /** Figma `Label`; master copy "Tomorrow" */
  label: string;
  state?: FilterChipV2State;
  /** State=Default/Selected selects a filter, State=Applied removes one — the same click, same pill */
  onClick?: () => void;
  className?: string;
}) {
  if (state === 'applied') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex h-[40px] items-center gap-[4px] rounded-[var(--radius-pill)] bg-[var(--color-status-info-bg)] pr-[8px] pl-[12px] text-label-14 text-[var(--color-status-info-text)] ${className ?? ''}`}
      >
        <span>{label}</span>
        <Icon name="x" size={16} />
      </button>
    );
  }

  return (
    /** the 5px top/bottom padding is the Figma box: 5 + 34 + 5 = 44 (the box hugs, as in Figma) */
    <span className={`flex w-fit items-center py-[5px] ${className ?? ''}`}>
      <button
        type="button"
        disabled={state === 'disabled'}
        aria-pressed={state === 'selected'}
        onClick={onClick}
        className={`flex h-[34px] items-center gap-[6px] rounded-[var(--radius-pill)] border px-[12px] text-label-14 ${FACE[state]}`}
      >
        {state === 'selected' && (
          <span className="flex h-[14px] w-[14px] items-center justify-center">
            <Icon name="check" size={14} strokeWidth={CHECK_STROKE_14} />
          </span>
        )}
        <span>{label}</span>
      </button>
    </span>
  );
}
