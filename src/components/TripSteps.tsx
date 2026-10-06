import { ProgressStep, type ProgressState } from './ProgressStep';

/**
 * figma: 2728:26593 · Pharos/App/Trip steps — State=To pickup (2728:26337) · At pickup (2728:26369) ·
 *        Loaded (2728:26401) · Departed (2728:26433) · At delivery (2728:26465) · Delivered (2728:26497) ·
 *        Proof sent (2728:26529) · Completed (2728:26561)
 * props: state, title
 *
 *   every variant is 370x278: VERTICAL gap 12 pad 16, radius 12, fill color/bg/surface,
 *   1px INSIDE stroke color/border/default
 *     Title  336 wide, Manrope SemiBold 20/28 color/text/primary (token text-heading-20)
 *     6 x `Pharos/App/Progress step` (2553:1238) 336x24 — see ProgressStep.tsx, the shared row
 *   Height check: 1 + 16 + 28 + 6*12 gaps + 6*24 + 16 + 1 = 278 == Figma for all eight variants.
 *
 *   The six rows never change: Arrived at pickup / Loading complete / Departed / Arrived at delivery /
 *   Delivery complete / Proof of delivery sent. Only the per-row `State` moves:
 *     To pickup    Current on 1                                   (1 current, 5 next)
 *     At pickup    Done on 1,        Current on 2
 *     Loaded       Done on 1-2,      Current on 3
 *     Departed     Done on 1-3,      Current on 4
 *     At delivery  Done on 1-4,      Current on 5
 *     Delivered    Done on 1-5,      Next on 6      <- no Current row at all (verified in Figma)
 *     Proof sent   Done on 1-5,      Current on 6
 *     Completed    Done on all 6
 *
 *   All eight instances are 370x278 inside "Scroll content" on `07 · Trip`
 *   (`2728:26726`, `2728:26897`, `2728:27068`, `2728:27239`, `2728:27410`, `2728:27581`,
 *   `2728:27752`, `2728:27923`).
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, radius-md, spacing-12,
 *         spacing-16, card-w, text-heading-20
 * TODO(token): none — every value above resolves to an existing token.
 */
export type TripStepsState =
  | 'to-pickup'
  | 'at-pickup'
  | 'loaded'
  | 'departed'
  | 'at-delivery'
  | 'delivered'
  | 'proof-sent'
  | 'completed';

export const TRIP_STEP_LABELS = [
  'Arrived at pickup',
  'Loading complete',
  'Departed',
  'Arrived at delivery',
  'Delivery complete',
  'Proof of delivery sent',
] as const;

const STATES: Record<TripStepsState, ProgressState[]> = {
  'to-pickup': ['current', 'next', 'next', 'next', 'next', 'next'],
  'at-pickup': ['done', 'current', 'next', 'next', 'next', 'next'],
  loaded: ['done', 'done', 'current', 'next', 'next', 'next'],
  departed: ['done', 'done', 'done', 'current', 'next', 'next'],
  'at-delivery': ['done', 'done', 'done', 'done', 'current', 'next'],
  delivered: ['done', 'done', 'done', 'done', 'done', 'next'],
  'proof-sent': ['done', 'done', 'done', 'done', 'done', 'current'],
  completed: ['done', 'done', 'done', 'done', 'done', 'done'],
};

export function TripSteps({
  state = 'to-pickup',
  title = 'Trip progress',
  labels = TRIP_STEP_LABELS,
}: {
  /** Figma variant property `State`. */
  state?: TripStepsState;
  /** Figma layer `Title` — the same string in all eight variants. */
  title?: string;
  /** The six row titles, so a caller can reuse the card for its own step names. */
  labels?: readonly string[];
}) {
  const states = STATES[state];
  return (
    <div className="box-border flex w-[var(--card-w)] flex-col gap-[var(--spacing-12)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <span className="block w-full text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      {labels.slice(0, states.length).map((label, i) => (
        <ProgressStep key={label} state={states[i]} number={i + 1} label={label} />
      ))}
    </div>
  );
}
