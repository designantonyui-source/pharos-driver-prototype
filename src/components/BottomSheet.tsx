import type { ReactNode } from 'react';

/**
 * figma: 2197:8841 · Pharos/Bottom sheet — container of all 13 variants
 * props: children, pad, className
 * tokens: color-bg-surface, color-border-default
 * geometry: surface = white, radius top 16 (Figma "top-left/top-right 16"), drag handle
 *   354x4 with the 36x4 pill `Sheet / Drag handle` (r2 #d7e0e6) centred in it.
 *   Vertical rhythm comes from ONE 16px gap in the container (VERTICAL, gap 16) — the
 *   variants only differ in which blocks they put in, never in the gap. Padding differs
 *   per content group, hence the `pad` prop:
 *     Content=Route / Price  (pad 12/24/34/24) — 24px side padding, 34px at the bottom
 *     Content=Sort / Request (pad 12/16/24/16) — 16px side padding, 24px at the bottom
 *   Both paddings are covered by stories `RouteFilled` and `SortBySheet`.
 *   NOTE: the container hugs its content. Several Figma variants have a manually FIXED frame
 *   height (454/494) that is LARGER than the content they hold (406/414), so those frames carry
 *   dead space at the bottom — see PORT-LOG §4.6. We render the content height.
 * NOTE: a bare bottom sheet is NOT a Figma variant — every variant carries content.
 *   This file only owns the surface + handle; content comes from the composed blocks:
 *   BottomSheetHeader · RouteFields · SuggestionCard · SheetField ·
 *   VehicleMatchingLine · TripChecklist · SortBy
 */
export function BottomSheet({
  children,
  pad = 'route',
  className = '',
}: {
  children: ReactNode;
  /** route = pad 12/24/34/24 (Content=Route, Price) · sort = pad 12/16/24/16 (Content=Sort, Request) */
  pad?: 'route' | 'sort';
  className?: string;
}) {
  const padding = pad === 'sort' ? 'px-[16px] pb-[24px] pt-[12px]' : 'px-[24px] pb-[34px] pt-[12px]';

  return (
    <div
      className={`flex w-full flex-col gap-[16px] rounded-t-[var(--radius-lg)] bg-[var(--color-bg-surface)] ${padding} ${className}`}
    >
      {/* `Sheet / Drag handle` — 354x4 box, 36x4 pill centred in it */}
      <span className="flex h-[4px] w-full items-center justify-center">
        <span className="h-[4px] w-[36px] rounded-[var(--radius-xs)] bg-[var(--color-border-default)]" />
      </span>
      {children}
    </div>
  );
}

/**
 * figma: 2197:7908 · Pharos/Bottom sheet/Header (single COMPONENT, not a set)
 * props: title
 * tokens: color-text-primary, text-heading-20
 * geometry: hug height 48 = one 20/28 line vertically centred; title 354 wide (FILL).
 *   Figma font: Manrope SemiBold 20/28 -> text-heading-20 (fw600, Manrope).
 *   The 48px box is what makes every variant's rhythm add up (12 + 4 + 16 + 48 + …).
 */
export function BottomSheetHeader({ title }: { title: string }) {
  return (
    <div className="flex h-[48px] w-full shrink-0 items-center">
      <span className="w-full text-heading-20 text-[var(--color-text-primary)]">{title}</span>
    </div>
  );
}

/**
 * figma: 2197:8103 / 2197:8189 · the caption line under `Route / Connected stops`,
 * 354x16, DM Sans Medium 12/16 `#586d79`. `on` picks the vehicle-matching copy.
 */
export function VehicleMatchingLine({ on }: { on: boolean }) {
  return (
    <p className="h-[16px] w-full shrink-0 text-label-12 text-[var(--color-text-secondary)]">
      {on
        ? 'Vehicle matching · Curtainsider · 20 t · 33 pallets'
        : 'Route search · vehicle matching off'}
    </p>
  );
}

/**
 * figma: 2664:23032 · the `Hint` layer that exists only in the three "Route empty"
 * states (2197:8167, 2197:8383, and 2197:8438 has none) — 354x32 = two 16px lines.
 * props: children (defaults to the Figma copy)
 */
export function SheetHint({ children = 'Choose pickup and destination — the button activates when both are set.' }: { children?: ReactNode }) {
  return (
    <p className="h-[32px] w-full shrink-0 text-caption-12 text-[var(--color-text-secondary)]">{children}</p>
  );
}
