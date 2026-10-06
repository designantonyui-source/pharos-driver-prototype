import { useState } from 'react';
import { Icon } from './Icon';

/**
 * figma: 344:51 · Pharos/Select — State=Closed `344:26` (206x76) · State=Open `344:32`
 *        (206x202) · State=Disabled `344:45` (206x76). The 206 width is the set's own frame;
 *        the one instance on a driver page (`I340:5812;344:388`) overrides it to 254, so the
 *        component is fluid (`w-full`).
 * props: label, value, options, disabled, defaultOpen, onSelect
 *
 *   root VERTICAL gap8 (hugs 76 / 202) — NOT `Pharos/Input`: this control is a button, has no
 *   leading 20x20 icon slot, no hint line and no focus ring, and its trailing 16x16 chevron is
 *   placed by SPACE_BETWEEN. See the contract note at the bottom.
 *   Label row 20 tall — DM Sans Medium 14/20 `Label/14`, color/text/primary
 *   Select control 48 tall, r8 (radius/sm), pad 0/12, SPACE_BETWEEN/CENTER, box-border
 *     State=Closed   1px INSIDE stroke #8093a0 · fill #ffffff
 *     State=Open     1px INSIDE stroke #225d74 · fill #ffffff   (1px, not the Input's 2px focus)
 *     State=Disabled 1px INSIDE stroke #d7e0e6 · fill #e8edf0 · value #80929e
 *     Value   DM Sans Regular 14/20, #172a35 (disabled #80929e)
 *     Chevron 16x16 box holding an 8x4 vector, stroke #586d79 1.3333 — the lucide
 *             `ChevronDown` glyph in a 16px box, i.e. `<Icon size={16}>`
 *   Options panel 206x118, r8, pad 4/0, fill #ffffff, 1px INSIDE #d7e0e6, 8 below the control
 *     Option 204x36, pad 0/12, label DM Sans Regular 14/20 #172a35
 *     Selected option (Option 1 in State=Open) is tinted #ebf3f7
 *
 * Geometry note (trap 6): Figma paints its 1px stroke INSIDE the 48-tall box, so its value sits
 * at x 13; a CSS border-box puts the same text at x 13 too (12 padding + 1 border), which is what
 * this renders.
 *
 * tokens: color-bg-surface, color-bg-disabled, color-border-strong, color-border-brand,
 *         color-border-default, color-select-option-selected-bg, color-text-primary,
 *         color-text-disabled, color-text-secondary, radius-sm, control-h,
 *         text-label-14, text-body-14
 * TODO(token): the selected option's fill (#ebf3f7) has no dedicated "select/selected" token;
 *   it is the same value as color/action/secondary-hover and that token is used here.
 * TODO(token): control 48 and option 36 are inlined as the Figma numbers (48 exists as
 *   `control-h`; 36 has no spacing token).
 */
export type SelectOption = string;

export function Select({
  label,
  value,
  options = [],
  disabled = false,
  defaultOpen = false,
  onSelect,
}: {
  label: string;
  value: string;
  options?: readonly SelectOption[];
  /** State=Disabled — the whole control is inert. */
  disabled?: boolean;
  /** State=Open as the initial state; the control then opens/closes on click. */
  defaultOpen?: boolean;
  onSelect?: (option: SelectOption) => void;
}) {
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const expanded = open && !disabled;

  const control = disabled
    ? 'border-[var(--color-border-default)] bg-[var(--color-bg-disabled)]'
    : expanded
      ? 'border-[var(--color-border-brand)] bg-[var(--color-bg-surface)]'
      : 'border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]';

  return (
    <div className="flex w-full flex-col gap-[8px]">
      <span className="flex h-[20px] w-full items-center text-label-14 text-[var(--color-text-primary)]">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[var(--control-h)] w-full items-center justify-between rounded-[var(--radius-sm)] border px-[12px] ${control}`}
      >
        <span
          className={`text-body-14 ${disabled ? 'text-[var(--color-text-disabled)]' : 'text-[var(--color-text-primary)]'}`}
        >
          {value}
        </span>
        <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
          <Icon name="chevron-down" size={16} className="text-[var(--color-text-secondary)]" />
        </span>
      </button>

      {expanded && (
        <div
          role="listbox"
          className="flex w-full flex-col rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-[4px]"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onSelect?.(option);
                  setOpen(false);
                }}
                className={`flex h-[36px] w-full items-center px-[12px] text-left text-body-14 text-[var(--color-text-primary)] ${
                  selected ? 'bg-[var(--color-select-option-selected-bg)]' : ''
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * WHY NOT `Input.tsx` — decided by measurement, not taste. `Pharos/Input` (12:166) and
 * `Pharos/Select` (344:51) share only the 20-tall label row and the 48-tall control box:
 *   - Input's control always draws a 20x20 MapPin slot; the Select has none (its value starts at
 *     the 12px padding, x 13 with the border — Figma 13).
 *   - Input's control is a text `<input>`; the Select is a button that opens a listbox and has a
 *     trailing 16x16 chevron placed by SPACE_BETWEEN.
 *   - Input has a 16px hint line and a 2px focus ring layer; the Select set has neither — its
 *     State=Open only thickens the border colour at 1px.
 *   - Input's six variants are all about the field's own state; the Select's State=Open adds a
 *     118-tall options panel that is part of its hug height.
 * Reusing Input would mean adding `icon={false}`, a trailing slot, an optional hint and a
 * third border width to a component the port log already signs off as done, and every existing
 * Input call site would inherit those branches. Two components, one shared 48px control metric
 * (`--control-h`), is the honest split.
 */
