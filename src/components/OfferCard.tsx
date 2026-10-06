import { Icon } from './Icon';
import { Flag } from './Flag';
import { ButtonLink } from './Button';
import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 2594:22063 (Pharos/App/Offer) · State=Default 2549:12618 (370x190)
 *        · State=Disabled 2594:21989 (370x190) · State=Loading 2594:22017 (370x194)
 *        · State=Pending 2718:2176 (370x255)
 *   card: VERTICAL, pad 16, gap 8, radius 16, fill color/offer/bg, 1px inside color/offer/border
 *   rows 36 · 28 · 20 · 20 · 20 = 124 + 4x8 gaps + 32 pad + 2 border = 190 == State=Default
 *   State=Disabled reuses the geometry and puts 38% opacity on the CONTENT ROWS only (card fill,
 *   border and radius are unchanged). State=Loading replaces the rows with a 336x160 skeleton
 *   (gap 8, rows 36 · 28 · 24 · 20 · 20, bars r4 color/offer/bg-skeleton) -> 160+32+2 = 194.
 *   State=Pending adds Divider 336x1 color/border/default and `Application state` 336x48 (gap 8)
 *   with Status Tone=Info "Awaiting dispatcher" + Button link "View application" -> 190+8+1+8+48 = 255.
 * props: rate, perKm, distance, lane, from, to, window, timer, deadhead, cargo, company, badge,
 *        showTimer, showCargo, state
 * tokens: color-offer-bg, color-offer-border, color-offer-text-price, color-offer-text-highlight,
 *         color-offer-bg-skeleton, color-text-primary, color-text-secondary, color-border-default,
 *         color-status-warning-bg, color-status-warning-text, radius-xs, radius-pill, radius-lg,
 *         spacing-6, spacing-8, spacing-12, spacing-16, text-metric-28, text-heading-20,
 *         text-body-14, text-label-14, text-label-12
 *         + opacity-disabled (0.38), spacing-10, card-w / card-h / card-pad / card-gap
 *
 * Verified deviations fixed against Figma (measured numbers are in design/PORT-LOG.md):
 *   1. radius was radius-md (12); Figma is 16 -> radius-lg
 *   2. Disabled dimmed the whole card at 50%; Figma dims the content rows at 38% and keeps card chrome
 *   3. Distance is color/text/primary, not secondary (Figma binds VariableID:8:54)
 *   4. Schedule is color/text/primary, not secondary (same binding)
 *   5. Deadhead text and its Map pin are color/offer/text/highlight (#225d74), not primary/secondary
 *   6. `Decision timer` is hidden in all four variants and visible in none of the 46 instances ->
 *      `showTimer` defaults to false; the layer stays available
 *   7. the scheduler row is SPACE_BETWEEN/CENTER (20) but the timer is a 24px pill inside it
 *   8. price row is counterAxis=MAX (box bottoms aligned), not baseline
 *   9. Loading skeleton bars had invented sizes; Figma is 72x24 + 68x16 .. 42x16 / 149x20 / 129x16 /
 *      158x16 / 217x16, and the card hugs 194 instead of reserving a min-height
 *  10. the trailing `Spacer` (FILL) of the Route row and the bare-text nodes for Cargo / Company
 *      now match their Figma layers
 * NOTE: `badge` is not a layer of this Figma set (an app-level addition used by the BottomSheet
 *   stories); it stays opt-in and is off by default, so the default card is exactly 190 tall.
 */
export type OfferCardProps = {
  rate?: string;
  perKm?: string;
  distance?: string;
  lane?: string;
  from?: string;
  to?: string;
  window?: string;
  timer?: string;
  deadhead?: string;
  cargo?: string;
  company?: string;
  badge?: { label: string; tone?: Tone };
  /** the `Cargo` layer exists in the Figma set but is hidden in every variant */
  showCargo?: boolean;
  /** the `Decision timer` layer exists in the Figma set but is hidden in every variant */
  showTimer?: boolean;
  state?: 'default' | 'disabled' | 'loading' | 'pending';
};

/** skeleton bar — the widths are the Figma bar sizes, they are not spacing values */
const Bar = ({ w, h, top = false }: { w: number; h: number; top?: boolean }) => (
  <span
    className={`shrink-0 rounded-[var(--radius-xs)] bg-[var(--color-offer-bg-skeleton)]${top ? ' self-start' : ''}`}
    style={{ width: w, height: h }}
  />
);

export function OfferCard({
  rate = '€360',
  perKm = '€3.24/km loaded',
  distance = '111 km loaded',
  lane = 'Lille → Brussels',
  from = 'France',
  to = 'Belgium',
  window = 'Today · 14:00–15:00',
  timer = 'Decide in 1 h 20 min',
  deadhead = '18 km to pickup · about 25 min',
  cargo = 'Curtainsider · 12.4 t · 18 pallets',
  showCargo = false,
  showTimer = false,
  company = 'NordCargo · 4.8 ★ · paid in 7 days',
  badge,
  state = 'default',
}: OfferCardProps) {
  /*
   * Card is 370 wide; a 1px inside border leaves a 336 content box, all row widths are FILL.
   * Order: Price row → Route → Schedule (+ hidden decision timer) → Deadhead → Cargo → Company.
   */
  const base =
    'flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-offer-border)] bg-[var(--color-offer-bg)] p-[var(--card-pad)] gap-[var(--card-gap)]';

  if (state === 'loading') {
    return (
      <div className={`${base} w-[var(--card-w)]`}>
        {/* 336x160 skeleton, same 8px rhythm as the content rows */}
        <div className="flex h-[36px] items-center gap-[var(--spacing-8)]">
          <Bar w={72} h={24} top />
          <Bar w={68} h={16} />
          <span className="flex-1" />
          <Bar w={42} h={16} />
        </div>
        <div className="flex h-[28px] items-start">
          <Bar w={149} h={20} />
        </div>
        <div className="flex h-[24px] items-center">
          <Bar w={129} h={16} />
        </div>
        <div className="flex h-[20px] items-center">
          <Bar w={158} h={16} />
        </div>
        <div className="flex h-[20px] items-center">
          <Bar w={217} h={16} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} w-[var(--card-w)]`}>
      {badge && (
        <div className="flex h-[28px] items-center">
          <StatusPill label={badge.label} tone={badge.tone ?? 'warning'} />
        </div>
      )}

      {/* State=Disabled dims the rows, not the surface — Figma gives every row opacity 38% */}
      <div className={`flex flex-col gap-[var(--card-gap)]${state === 'disabled' ? ' opacity-[var(--opacity-disabled)]' : ''}`}>
        {/* Price row — 36, SPACE_BETWEEN / counterAxis MAX (the boxes are bottom aligned) */}
        <div className="flex h-[36px] items-end justify-between">
          <span className="flex items-end gap-[var(--spacing-8)]">
            <span className="text-metric-28 text-[var(--color-offer-text-price)]">{rate}</span>
            <span className="text-label-14 text-[var(--color-text-secondary)]">{perKm}</span>
          </span>
          <span className="text-label-14 text-[var(--color-text-primary)]">{distance}</span>
        </div>

        {/* Route — 28: France flag 18 · Heading/20 lane · Belgium flag 18 · FILL Spacer */}
        <div className="flex h-[28px] items-center gap-[var(--spacing-4)]">
          <Flag country={from} />
          <span className="text-heading-20 text-[var(--color-text-primary)]">{lane}</span>
          <Flag country={to} />
          <span className="flex-1" />
        </div>

        {/* Schedule — 20 (the 24px Decision timer pill lives in this row but is hidden in Figma) */}
        <div className="flex h-[20px] items-center justify-between">
          <span className="text-body-14 text-[var(--color-text-primary)]">{window}</span>
          {showTimer && (
            <span className="flex h-[24px] items-center gap-[var(--spacing-4)] rounded-[var(--radius-pill)] bg-[var(--color-status-warning-bg)] px-[var(--spacing-8)] text-[var(--color-status-warning-text)]">
              <Icon name="clock" size={12} />
              <span className="text-label-12">{timer}</span>
            </span>
          )}
        </div>

        {/* Deadhead — 20: Map pin 16 + Label/14, both color/offer/text/highlight */}
        <div className="flex h-[20px] items-center gap-[var(--spacing-4)]">
          <Icon name="map-pin" size={16} className="text-[var(--color-offer-text-highlight)]" />
          <span className="text-label-14 text-[var(--color-offer-text-highlight)]">{deadhead}</span>
        </div>

        {/* Cargo — hidden in every Figma variant, kept for the variants that show it */}
        {showCargo && <span className="text-body-14 text-[var(--color-text-secondary)]">{cargo}</span>}

        {/* Company — its own bare text node in Figma, 14/20 color/text/secondary */}
        <span className="text-body-14 text-[var(--color-text-secondary)]">{company}</span>

        {state === 'pending' && (
          <>
            <span className="h-[1px] w-full bg-[var(--color-border-default)]" />
            {/* Application state — 48, SPACE_BETWEEN is faked by the Figma Spacer, hence the 10px slot */}
            <div className="flex h-[48px] items-center gap-[var(--spacing-8)]">
              <StatusPill label="Awaiting dispatcher" tone="info" />
              {/* Figma fakes SPACE_BETWEEN with a 10px Spacer */}
              <span className="w-[var(--spacing-10)]" />
              <ButtonLink label="View application" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
