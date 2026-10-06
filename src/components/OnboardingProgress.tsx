/**
 * figma: 2062:410 · Pharos/App/Onboarding progress — Filled=1 (2062:405) · 2 (2062:406) ·
 *        3 (2062:407) · 4 (2062:408) · 5 (2062:409)
 * props: filled, total
 *
 *   every variant is 370x4, HORIZONTAL, gap 8, no padding, no background:
 *     5 rectangles "Segment 1..5", each 67.6x4, radius 2
 *       (370 - 4*8) / 5 = 67.6 exactly, so the segments are `flex-1` inside a 370 box
 *     Filled=1..N paints the first N with `app-onboarding-progress/status-info-text`, which is an
 *       ALIAS of color/action/primary #225d74; the rest are `app-onboarding-progress/border-default`
 *       = ALIAS of color/border/default #d7e0e6 (both resolved through the variables API)
 *
 * All 13 instances are 370x4 inside a "Scroll content" frame (402 wide, pad 16) — the width never
 * changes, so it is the card width token, not a prop. They sit on the `02 · Vehicle onboarding`
 * screens: vehicle-type (Filled=1), vehicle-size (2), vehicle-features (3), vehicle-docs (4),
 * vehicle-review (5) plus their documented/error sub-states.
 *
 * tokens: color-action-primary, color-border-default, card-w, spacing-8
 * TODO(token): radius/2xs = 2px for the segment corners — the radius ramp starts at 4px
 *              (radius/xs). Figma says 2 on all five segments. Same gap as the Bottom sheet drag
 *              handle (PORT-LOG §4.6 rounded it to 4); flagged rather than silently changed.
 */
export const ONBOARDING_STEPS = 5;

export function OnboardingProgress({ filled = 1, total = ONBOARDING_STEPS }: { filled?: number; total?: number }) {
  return (
    <div
      className="flex w-[var(--card-w)] items-center gap-[var(--spacing-8)]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-[var(--spacing-4)] flex-1 rounded-[var(--radius-2xs)] ${
            i < filled ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-border-default)]'
          }`}
        />
      ))}
    </div>
  );
}
