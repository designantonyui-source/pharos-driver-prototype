import { useState } from 'react';

/**
 * figma: 2041:411 · Pharos/App/View switch — COMPONENT_SET, 5 variants (42 instances)
 *   Segments=2, Selected=1 `2041:406` (226x48) · Segments=2, Selected=2 `2041:407` (226x48)
 *   Segments=3, Selected=1 `2041:408` (336x48) · Selected=2 `2041:409` · Selected=3 `2041:410`
 * props: segments, value, defaultValue, onChange, className
 *
 *   Box: HORIZONTAL, pad 2, gap 0, MIN/CENTER, both axes FIXED, fill color/bg/surface,
 *   1px INSIDE stroke `view-switch/border` -> color/border/strong, radius 8.
 *   `strokesIncludedInLayout = true` on the box AND on every segment: the 1px stroke is counted
 *   inside the 226/336 width, so the layout box is width - 2*pad(2) - 2*stroke(1) = 220 (2 segs)
 *   or 330 (3 segs), i.e. exactly the 110px the set declares per segment. A CSS `box-border`
 *   border + 2px padding reproduces that arithmetic one to one (PORT-LOG trap 20).
 *
 *   Segment: HORIZONTAL, pad 0, CENTER/CENTER, both axes FIXED in the set (110x42), but every
 *   instance on a screen overrides it to `layoutGrow 1` + `layoutAlign STRETCH` and resizes the
 *   box: measured on `2217:8769` (370 wide, 3 segments) each segment is 121.33 = (370-4-2)/3 and
 *   on `2668:14782` (267 wide, 2 segments) 130.5 = (267-4-2)/2. That is `flex-1 basis-0` here.
 *   radius 6, selected fill `view-switch/bg` -> color/bg/subtle, unselected transparent.
 *
 *   Label: layer `List` / `Map` / `Map` — the layer names lie (PORT-LOG trap 1); the text is the
 *   label. DM Sans Medium 14/20 (`text-label-14`). Selected `view-switch/text/active` ->
 *   color/action/primary, unselected `view-switch/text/inactive` -> color/text/secondary.
 *   The component exposes NO text properties in Figma: on the screens every instance overrides
 *   the layers by hand, so the labels are a prop here. Real copy in use:
 *   `2217:8769` "Current" / "Expired" / "Declined" (370) · `2668:14782` "List" / "Map" (267).
 *
 *   Sibling instances measured: `2668:14782` 267x48 at x 119 of a 370 row, `2551:12596` 239x48,
 *   `2043:2902` 226x48, `2081:5670` 370x48 inside `Account / identity and tabs` (402x162).
 *
 * tokens: color-bg-surface, color-border-strong, color-bg-subtle, color-action-primary,
 *         color-text-secondary, radius-sm, radius-6 (the segment radius), text-label-14
 */
export function ViewSwitch({
  segments,
  value,
  defaultValue,
  onChange,
  className,
}: {
  /** one label per Figma `Segment / n` layer, in order */
  segments: string[];
  /** controlled selection */
  value?: string;
  /** initial selection when uncontrolled; defaults to the first segment */
  defaultValue?: string;
  onChange?: (segment: string) => void;
  /** the box is FIXED in Figma; pass the instance width (370, 336, 267, 239, 226 ...) */
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? segments[0]);
  const active = value ?? internal;

  const select = (segment: string) => {
    if (value === undefined) setInternal(segment);
    onChange?.(segment);
  };

  return (
    <div
      role="tablist"
      className={`flex h-[48px] items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-[2px] ${className ?? ''}`}
    >
      {segments.map((segment) => {
        const selected = segment === active;
        return (
          <button
            key={segment}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => select(segment)}
            className={`flex h-full flex-1 basis-0 items-center justify-center rounded-[var(--radius-6)] text-label-14 ${
              selected
                ? 'bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <span>{segment}</span>
          </button>
        );
      })}
    </div>
  );
}
