import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 2715:1617 · Pharos/App/Trip preparation — State=Awaiting (2715:1597) · Requested (2715:1602) ·
 *        Complete (2715:1607) · Confirmed (2715:1612)
 * props: state, status, body   (Figma: variant "State", text layers "Status"/"Body")
 *
 *   every variant is 370 wide, VERTICAL gap 8 pad 16, radius 12, fill color/bg/surface,
 *   1px INSIDE stroke color/border/default
 *     Status  `Pharos/Status` (11:148) instance, hug: Tone=Warning 192x28, Tone=Info 232x28,
 *             Tone=Success 198x28 / 155x28 — composed from StatusPill.tsx, not copied
 *     Body    DM Sans Regular 14/20 color/text/secondary, fills the 336 content width
 *   Height check: 1 + 16 + 28 + 8 + 40 + 16 + 1 = 110 (Awaiting, two-line body)
 *                 1 + 16 + 28 + 8 + 20 + 16 + 1 =  90 (the other three, one-line body)
 *
 *   This is NOT `Pharos/App/Trip checklist` (2715:1596). They are two different sets that live next
 *   to each other in Figma; the checklist is the 4-row "Waiting" box, this is a one-line status card.
 *
 *   All seven instances are 370 wide: Awaiting x4 (`2716:942`, `2715:25672`, `2716:1028`,
 *   `2715:25561`), Requested `2716:427`, Complete `2716:553`, Confirmed `2716:761`.
 *
 * tokens: color-bg-surface, color-border-default, color-text-secondary, radius-md, spacing-8,
 *         spacing-16, card-w, text-body-14
 * TODO(token): none — every value above resolves to an existing token.
 */
export type TripPreparationState = 'awaiting' | 'requested' | 'complete' | 'confirmed';

type Copy = { tone: Tone; status: string; body: string };

const COPY: Record<TripPreparationState, Copy> = {
  awaiting: {
    tone: 'warning',
    status: 'Awaiting trip details · 0 of 4',
    body: 'Request the missing trip details from your dispatcher.',
  },
  requested: {
    tone: 'info',
    status: 'Request sent · awaiting dispatcher',
    body: 'Your dispatcher will update the trip data.',
  },
  complete: {
    tone: 'success',
    status: 'Trip details complete · 4 of 4',
    body: 'You can confirm your readiness to depart.',
  },
  confirmed: {
    tone: 'success',
    status: 'Readiness confirmed',
    body: 'Your dispatcher can see that you are ready.',
  },
};

export function TripPreparation({
  state = 'awaiting',
  status,
  body,
}: {
  /** Figma variant property `State`. */
  state?: TripPreparationState;
  /** Figma layer `Status` — the `Pharos/Status` label. Defaults to the text of the variant. */
  status?: string;
  /** Figma layer `Body`. Defaults to the text of the variant. */
  body?: string;
}) {
  const copy = COPY[state];
  return (
    <div className="box-border flex w-[var(--card-w)] flex-col gap-[var(--spacing-8)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <StatusPill tone={copy.tone} label={status ?? copy.status} />
      <span className="text-body-14 text-[var(--color-text-secondary)]">{body ?? copy.body}</span>
    </div>
  );
}
