import { Button } from './Button';
import { Flag } from './Flag';
import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 26:73 (Pharos/Offer preview)
 *   Size=Desktop 106:17 State=Available (440x148) · 106:35 State=Unavailable (440x182)
 *   Size=Mobile  26:35 State=Available (358x290) · 26:53 State=Unavailable (358x318)
 *   card: VERTICAL, radius 16, fill color/bg/surface, 1px inside color/border/default
 *     Desktop pad 12 gap 6 · Mobile pad 16 gap 12
 *   Desktop rows: Route+Rate 28 (SPACE_BETWEEN, gap 12) · Schedule 20 ·
 *     Equipment+Deadhead 40 (gap 4) · Company 16 · Match status 28 (last, when shown)
 *     -> 28+20+40+16 + 3x6 + 24 + 2 = 148; adding the 28px status + 6 = 182
 *   Mobile rows: Match status 28 (first) · Route 28 · Schedule 20 · Equipment+Deadhead 40 ·
 *     Rate row 32 (SPACE_BETWEEN: Rate/24 Bold + rate per km) · action 48
 *     -> 28+28+20+40+32+48 + 5x12 + 32 + 2 = 290; Unavailable swaps the action row for a
 *        bare Company/16 + full-width disabled button -> 318
 *   component properties: Show status (BOOLEAN, default false) and Origin/Destination flag
 *     (INSTANCE_SWAP) — modelled as `status`, `from`, `to`.
 * props: lane, from, to, rate, perKm, window, equipment, deadhead, company, state, size, status,
 *        statusLabel, actionLabel, full, onAction
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-offer-text-highlight, color-action-*, radius-sm, radius-lg, spacing-4, spacing-6,
 *         spacing-8, spacing-12, spacing-16, text-heading-20, text-rate-24, text-body-14,
 *         text-label-12, text-caption-12
 * TODO(token): offer-preview-w-desktop 440px / offer-preview-w-mobile 358px — no size token exists;
 *   `full` (w-full) is the honest app usage (all 32 instances are 460/628 wide on the load board)
 *
 * UNCERTAIN — not verifiable, needs a designer:
 *   1. Every Mobile instance of `Match status` and `Pharos/Button` inside the Mobile variants is an
 *      EMPTY instance (no Dot, no Label, no children at all), so their pill labels and the button
 *      label are unknown. The Desktop copy is reused ("On your route" / "Load already assigned")
 *      and the button label comes from the `Pharos/Button` master ("Send application").
 *   2. Figma will not render this component set (get_screenshot returns 1x1 for every node in it and
 *      for its page). The visual reference used instead is the two Desktop instances placed on
 *      page `21 — Driver / Search and request` (67:326 and 136:1404).
 *   3. The Desktop `Match status` layer sits LAST and the Mobile one FIRST — an inconsistency that is
 *      reproduced per size rather than normalised.
 */
export type OfferPreviewProps = {
  lane?: string;
  from?: string;
  to?: string;
  rate?: string;
  perKm?: string;
  window?: string;
  equipment?: string;
  deadhead?: string;
  company?: string;
  state?: 'available' | 'unavailable';
  size?: 'mobile' | 'desktop';
  /** Figma component property `Show status`; Unavailable shows the pill regardless */
  status?: boolean;
  statusLabel?: string;
  actionLabel?: string;
  /** let the card fill its container (Desktop instances in the app are 460/628 wide) */
  full?: boolean;
  onAction?: () => void;
};

export function OfferPreview({
  lane = 'Lille → Brussels',
  from = 'France',
  to = 'Belgium',
  rate = '360 €',
  perKm = '€3.24/km loaded',
  window = 'Today · 14:00–15:00',
  equipment = 'Curtainsider · 12.4 t · 18 pallets',
  deadhead = '18 km to pickup · arrival ≈ 25 min',
  company = 'NordCargo · 4.8 ★ · paid in 7 days',
  state = 'available',
  size = 'desktop',
  status,
  statusLabel,
  actionLabel = 'Send application',
  full = false,
  onAction,
}: OfferPreviewProps) {
  const unavailable = state === 'unavailable';
  const mobile = size === 'mobile';
  /* `Show status` is false in Size=Desktop/State=Available and TRUE in the three other variants */
  const showStatus = status ?? (unavailable || mobile);
  const tone: Tone = unavailable ? 'neutral' : 'match';
  const pill = <StatusPill label={statusLabel ?? (unavailable ? 'Load already assigned' : 'On your route')} tone={tone} />;

  const width = full ? 'w-full' : mobile ? 'w-[358px]' : 'w-[440px]';
  const box = mobile
    ? 'p-[var(--spacing-16)] gap-[var(--spacing-12)]'
    : 'p-[var(--spacing-12)] gap-[var(--spacing-6)]';

  const flags = (
    <span className="flex items-center gap-[var(--spacing-8)]">
      <Flag country={from} />
      <span className="text-heading-20 text-[var(--color-text-primary)]">{lane}</span>
      <Flag country={to} />
    </span>
  );

  const schedule = <span className="text-body-14 text-[var(--color-text-secondary)]">{window}</span>;

  const equipmentAndDeadhead = (
    <div className="flex flex-col gap-[var(--spacing-4)]">
      <span className="text-body-14 text-[var(--color-text-secondary)]">{equipment}</span>
      <span className="text-label-12 text-[var(--color-offer-text-highlight)]">{deadhead}</span>
    </div>
  );

  const companyLine = <span className="text-caption-12 text-[var(--color-text-secondary)]">{company}</span>;

  return (
    <div
      className={`flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] ${box} ${width}`}
    >
      {/* Mobile puts `Match status` first, Desktop puts it last — kept as Figma draws it */}
      {mobile && showStatus && pill}

      {mobile ? (
        <>
          <div className="flex h-[28px] items-center">{flags}</div>
          {schedule}
          {equipmentAndDeadhead}
          {/* Rate row — 32: Rate/24 Bold left, rate per km right */}
          <div className="flex h-[32px] items-center justify-between gap-[var(--spacing-12)]">
            <span className="text-rate-24 text-[var(--color-text-primary)]">{rate}</span>
            <span className="text-label-12 text-[var(--color-text-secondary)]">{perKm}</span>
          </div>
          {unavailable ? (
            <>
              {companyLine}
              <Button label={actionLabel} appearance="secondary" disabled onClick={onAction} />
            </>
          ) : (
            <div className="flex h-[48px] items-center gap-[var(--spacing-12)]">
              <span className="flex-1 text-caption-12 text-[var(--color-text-secondary)]">{company}</span>
              <Button label={actionLabel} appearance="secondary" full={false} onClick={onAction} />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Route and rate — 28, SPACE_BETWEEN */}
          <div className="flex h-[28px] items-center justify-between gap-[var(--spacing-12)]">
            {flags}
            <span className="text-heading-20 text-[var(--color-text-primary)]">{rate}</span>
          </div>
          {schedule}
          {equipmentAndDeadhead}
          {companyLine}
          {showStatus && pill}
        </>
      )}
    </div>
  );
}
