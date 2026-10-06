import inlineMap from '../assets/maps/loadcard-inline-382x162.svg';
import { Icon } from './Icon';
import { Alert } from './Alert';
import { Button } from './Button';
import { Flag } from './Flag';
import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 14:146 · Pharos/Load card — Size=Mobile, State=Available `14:140` (358x630) ·
 *   Mobile Requested `14:141` (358x670) · Mobile Assigned `14:142` (358x630) ·
 *   Desktop Available `14:143` (628x474) · Desktop Requested `14:144` (628x554) ·
 *   Desktop Assigned `14:145` (628x474)
 *
 *   box: VERTICAL, gap 16, radius 12, fill load-card/bg (= color/bg/surface) + 1px INSIDE
 *        load-card/border (= color/border/default) + DROP_SHADOW 0/6/20 #172a35 @ 5.5%
 *        Mobile pad 16 · Desktop pad 24
 *
 *   rows, in order:
 *     1 Status            an instance of Pharos/Status (11:148) -> StatusPill
 *                         Available Tone=Match   "On your route"       (115x28)
 *                         Requested Tone=Warning "Application under review" (178x28)
 *                         Assigned  Tone=Success "Assigned to you"    (127x28)
 *     2 Route summary     320x112 (Mobile) / 578x116 (Desktop), fill color/bg/subtle, radius 12,
 *                         Mobile pad 12 gap 8 · Desktop pad 16 gap 12, HORIZONTAL gap 8/16:
 *                         origin point 104/120 wide + connector (grows) + destination point
 *                         point: VERTICAL gap 2/4, CENTER; white 32/40 circle (radius 20, i.e. a
 *                         pill at that size) holding the 24x24 flag art, city Label/14 (20),
 *                         window Caption/12 (FIXED column width, so Mobile wraps to 2 lines)
 *                         connector: 2px color/border/default line with a 24x24 white circle
 *                         carrying a 16x16 Arrow right in color/action/primary, centred on it
 *     3 Rate and terms    578x72 / 324x72, fill color/bg/subtle, radius 8, pad 16, HORIZONTAL gap 16,
 *                         counterAxis CENTER: Rate Metric/28 Manrope Bold 28/36 color/text/primary
 *                         + a right-aligned column VERTICAL gap 4 grow 1 holding
 *                         Payment terms Label/14 Medium (color/text/secondary) and
 *                         Rate per km Caption/12 (color/text/secondary)
 *     4 Conditions         Mobile VERTICAL gap 12 · Desktop HORIZONTAL gap 16, two grow-1 columns
 *         and shipper     Cargo and approach: Mobile VERTICAL gap 6 / Desktop 12
 *                           "Transport" Caption/12 secondary
 *                           Load row HORIZONTAL gap 8: Truck 20x20 color/text/primary +
 *                             Equipment Body/14 color/text/primary
 *                           Empty run HORIZONTAL gap 8, pad-LEFT 28 (= 20 icon + 8 gap of the row
 *                             above; the Truck layer inside it is HIDDEN in every variant):
 *                             Deadhead Caption/12 color/text/secondary
 *                         Customer: Mobile VERTICAL gap 6 / Desktop 12
 *                           "Customer" Caption/12 secondary · Company Label/14 Medium primary
 *                           verification block Mobile gap 4 / Desktop gap 8:
 *                             HORIZONTAL gap 8: Shield 20x20 + "Verified customer" Caption/12, both
 *                               color/status/success-text (= load-card/text/success)
 *                             Rating Caption/12 secondary
 *     5 Alert (Requested only) an instance of Pharos/Alert Type=Info (575:9552) with
 *                         Show detail = false, Show icon = true; title "Awaiting review" (Label/14),
 *                         description Caption/12, both color/alert/info-text on color/alert/info-bg
 *     6 Map disclosure    VERTICAL gap 12
 *                         Mobile: Action footer VERTICAL gap 12 (toggle, then Load actions)
 *                         Desktop: Action footer HORIZONTAL gap 12 SPACE_BETWEEN (toggle | actions)
 *                         Toggle "Show map": Map pin 20x20 color/text/primary + Label/14
 *                           color/action/text, hug 97x40, pad 0 (the Figma instance overrides the
 *                           Button link's pad x16 to 0, so it is NOT composed from ButtonLink)
 *                         Load actions: Mobile VERTICAL gap 8 STRETCH, Buttons Size=Mobile (48)
 *                           Desktop HORIZONTAL gap 8 hug, Buttons Size=Web (40), secondary FIRST
 *                           Available  primary "Review application" + Arrow right 20
 *                           Requested  no primary — the disabled secondary is HIDDEN in Figma
 *                           Assigned   primary "View trip" + Arrow right 20
 *                           secondary "Chat with NordCargo" unless Show chat = false
 *                         Inline route map (Show map = true only): 382x162 map viewport +
 *                           "Open full map" link row
 *
 *   vertical checks (all four card paddings/borders included, + 2 border):
 *     Mobile  Available 16+28+16+112+16+72+16+164+16+156+16 = 628 -> 630 == Figma
 *     Mobile  Requested 16+28+16+112+16+72+16+164+16+80+16+100+16 = 668 -> 670 == Figma
 *     Mobile  Assigned  same as Available = 630 == Figma
 *     Desktop Available 24+28+16+116+16+72+16+104+16+40+24 = 472 -> 474 == Figma
 *     Desktop Requested ...+64 (alert)+16 = 552 -> 554 == Figma
 *     Desktop Assigned  same as Desktop Available = 474 == Figma
 *
 * variants: Size (Mobile 358 / Desktop 628) x State (Available / Requested / Assigned) = the 6 Figma
 *           variants. The component is fluid (`w-full`) because the design itself re-widths it —
 *           instances exist at 320, 358 and 628 — so the width comes from the parent frame; the
 *           stories pin it at 358 / 628 to match the variants.
 * props: size, state, origin, originWindow, originFlag, destination, destinationWindow,
 *        destinationFlag, rate, paymentTerms, ratePerKm, equipment, deadhead, company,
 *        verifiedLabel, rating, showMap, showChat, chatLabel, actionLabel, statusLabel, statusTone,
 *        onToggleMap, onPrimaryAction, onChat
 * tokens: color-bg-surface, color-bg-subtle, color-border-default, color-text-primary,
 *         color-text-secondary, color-action-primary, color-action-text, color-status-match-bg/-text,
 *         color-status-warning-bg/-text, color-status-success-bg/-text, color-alert-info-bg/-text,
 *         radius-sm, radius-md, radius-pill, size-control-web, size-control-mobile, spacing-4,
 *         spacing-6, spacing-8, spacing-12, spacing-16, spacing-20, spacing-12/16 (desktop pad 24),
 *         text-label-12, text-label-14, text-caption-12, text-body-14, text-metric-28
 *
 * NOTE — Figma nests a separate component here: `Pharos/Route summary card` `587:2129`
 *   (Size x Layout = 4+ variants). It is NOT `Pharos/Route summary` `26:27` (the 358x170 web
 *   generation) nor `Pharos/App/Route summary` `671:977` (the 370x92 bordered mobile card that
 *   `src/components/RouteSummary.tsx` already implements) — neither of those is this block, so
 *   nothing could be composed from them. The block is inlined here as a private `RouteSummary` and
 *   is the obvious candidate to extract into its own component once a second screen needs it.
 * NOTE — the Mobile "Route summary card" frame is 320 wide inside a 324-wide parent while its
 *   stretched child is 300 (= 324 - 24). The frame's 320 is inconsistent with its own content and
 *   the child overflows it by 4px, so this port lets the block fill the card (324 -> 300 content),
 *   which is exactly the child's measured width. Desktop is self-consistent (578 -> 546).
 * NOTE — `Show map` / `Show chat` are component *properties* (booleans), not variants, so — like
 *   StatusPill's `Show dot` — they are not separate stories in the Figma variant set. `Show chat`
 *   is false on the 320-wide instances; `Show map` is false on every instance on the two driver
 *   pages (21 and 30) and is true only on the two page-09 showcase instances
 *   `541:2650` (320x803) and `541:3640` (628x771).
 *
 * TODO(asset): the inline map artwork ("Map viewport / Lille — Brussels", 8 vectors + 2 city
 *   labels) is NOT ported. With `showMap` the block renders an empty color/bg/subtle box of the
 *   Figma size plus the real "Open full map" action row, so the disclosure is measurable but the
 *   artwork is missing — the expanded card is ~142px shorter than `541:2650`/`541:3640`.
 * TODO(token): the map viewport 162 height and the 104/120 route-point column widths have no tokens
 *   (closest: --card-* component geometry vars in globals.css).
 */
export type LoadCardState = 'available' | 'requested' | 'assigned';
export type LoadCardSize = 'mobile' | 'desktop';

/** Figma `Status` instance per state — tone and label come from the variant. */
const STATUS: Record<LoadCardState, { tone: Tone; label: string }> = {
  available: { tone: 'match', label: 'On your route' },
  requested: { tone: 'warning', label: 'Application under review' },
  assigned: { tone: 'success', label: 'Assigned to you' },
};

/** Figma `Action` label per state; Requested ships the primary button hidden (a disabled secondary). */
const ACTION: Record<LoadCardState, string | null> = {
  available: 'Review application',
  requested: null,
  assigned: 'View trip',
};

const ALERT = {
  title: 'Awaiting review',
  description: 'A dispatcher is checking the vehicle and schedule. Nothing is needed from you right now.',
};

type SizeProps = { size: LoadCardSize };

/** One end of the route: white flag circle, city, pickup/delivery window. */
function RoutePoint({
  size,
  country,
  city,
  windowLabel,
}: SizeProps & { country: string; city: string; windowLabel: string }) {
  const column = size === 'desktop' ? 'w-[120px] gap-[var(--spacing-4)]' : 'w-[104px] gap-[var(--spacing-2)]';
  const circle = size === 'desktop' ? 'h-[40px] w-[40px]' : 'h-[32px] w-[32px]';

  return (
    <span className={`flex shrink-0 flex-col items-center ${column}`}>
      {/* Figma radius is 20 on both 32 and 40 boxes, i.e. a circle */}
      <span className={`flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] ${circle}`}>
        <Flag country={country} size={24} />
      </span>
      <span className="text-label-14 text-[var(--color-text-primary)]">{city}</span>
      {/* FIXED column width in Figma: at 104 the Mobile window wraps to 2 lines, at 120 it does not */}
      <span className="w-full text-center text-caption-12 text-[var(--color-text-secondary)]">{windowLabel}</span>
    </span>
  );
}

/** `Pharos/Route summary card` `587:2129` — see the contract note above. */
function RouteSummary({
  size,
  origin,
  originWindow,
  originFlag,
  destination,
  destinationWindow,
  destinationFlag,
}: SizeProps & {
  origin: string;
  originWindow: string;
  originFlag: string;
  destination: string;
  destinationWindow: string;
  destinationFlag: string;
}) {
  const box =
    size === 'desktop'
      ? 'gap-[var(--spacing-12)] p-[var(--spacing-16)]'
      : 'gap-[var(--spacing-8)] p-[var(--spacing-12)]';
  const row = size === 'desktop' ? 'gap-[var(--spacing-16)]' : 'gap-[var(--spacing-8)]';

  return (
    <div className={`flex w-full flex-col rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] ${box}`}>
      <div className={`flex w-full items-center ${row}`}>
        <RoutePoint size={size} country={originFlag} city={origin} windowLabel={originWindow} />
        {/* Connector: a 2px rule with the arrow circle centred on it (the Figma frame is only 2 tall) */}
        <span className="relative flex min-w-0 flex-1 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--color-border-default)]"
          />
          <span className="relative flex h-[24px] w-[24px] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)]">
            <Icon name="arrow-right" size={16} className="text-[var(--color-action-primary)]" />
          </span>
        </span>
        <RoutePoint size={size} country={destinationFlag} city={destination} windowLabel={destinationWindow} />
      </div>
    </div>
  );
}

/** Rate block: price on the left, payment terms + per-km on the right. */
function RateAndTerms({
  rate,
  paymentTerms,
  ratePerKm,
}: {
  rate: string;
  paymentTerms: string;
  ratePerKm: string;
}) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-16)] rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[var(--spacing-16)]">
      <span className="text-metric-28 text-[var(--color-text-primary)]">{rate}</span>
      <span className="flex min-w-0 flex-1 flex-col items-end gap-[var(--spacing-4)]">
        <span className="text-label-14 text-[var(--color-text-secondary)]">{paymentTerms}</span>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{ratePerKm}</span>
      </span>
    </div>
  );
}

/** Cargo/approach and customer columns; they sit side by side on Desktop. */
function Conditions({
  size,
  equipment,
  deadhead,
  company,
  verifiedLabel,
  rating,
}: SizeProps & {
  equipment: string;
  deadhead: string;
  company: string;
  verifiedLabel: string;
  rating: string;
}) {
  const wrap = size === 'desktop' ? 'flex-row gap-[var(--spacing-16)]' : 'flex-col gap-[var(--spacing-12)]';
  const column = size === 'desktop' ? 'flex-1 gap-[var(--spacing-12)]' : 'w-full gap-[var(--spacing-6)]';
  const verify = size === 'desktop' ? 'gap-[var(--spacing-8)]' : 'gap-[var(--spacing-4)]';

  return (
    <div className={`flex w-full ${wrap}`}>
      <div className={`flex flex-col ${column}`}>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">Transport</span>
        <span className="flex w-full items-center gap-[var(--spacing-8)]">
          <Icon name="truck" className="text-[var(--color-text-primary)]" />
          <span className="min-w-0 text-body-14 text-[var(--color-text-primary)]">{equipment}</span>
        </span>
        {/* the row's own Truck layer is hidden in every variant; its 28px pad-left is what aligns
            the deadhead text with the equipment text above */}
        <span className="flex w-full items-center gap-[var(--spacing-8)] pl-[calc(var(--spacing-20)+var(--spacing-8))]">
          <span className="min-w-0 text-caption-12 text-[var(--color-text-secondary)]">{deadhead}</span>
        </span>
      </div>

      <div className={`flex flex-col ${column}`}>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">Customer</span>
        <span className="text-label-14 text-[var(--color-text-primary)]">{company}</span>
        <span className={`flex flex-col ${verify}`}>
          <span className="flex w-full items-center gap-[var(--spacing-8)]">
            <Icon name="shield" className="text-[var(--color-status-success-text)]" />
            <span className="text-caption-12 text-[var(--color-status-success-text)]">{verifiedLabel}</span>
          </span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">{rating}</span>
        </span>
      </div>
    </div>
  );
}

export function LoadCard({
  size = 'mobile',
  state = 'available',
  origin = 'Lille, FR',
  originWindow = 'Today, 14:00–15:00',
  originFlag = 'France',
  destination = 'Brussels, BE',
  destinationWindow = 'Today, until 19:00',
  destinationFlag = 'Belgium',
  rate = '360 €',
  paymentTerms = 'Paid within 7 days',
  ratePerKm = '€3.24/km · 111 km loaded',
  equipment = 'Curtainsider · 12.4 t · 18 pallets',
  deadhead = '18 km to pickup',
  company = 'NordCargo',
  verifiedLabel = 'Verified customer',
  rating = '4.8 · 126 reviews',
  showMap = false,
  showChat = true,
  chatLabel = 'Chat with NordCargo',
  statusLabel,
  statusTone,
  actionLabel,
  onToggleMap,
  onPrimaryAction,
  onChat,
}: {
  size?: LoadCardSize;
  state?: LoadCardState;
  origin?: string;
  originWindow?: string;
  originFlag?: string;
  destination?: string;
  destinationWindow?: string;
  destinationFlag?: string;
  rate?: string;
  paymentTerms?: string;
  ratePerKm?: string;
  equipment?: string;
  deadhead?: string;
  company?: string;
  verifiedLabel?: string;
  rating?: string;
  /** Figma `Show map`; the map artwork itself is not ported, see TODO(asset). */
  showMap?: boolean;
  /** Figma `Show chat` — renders the "Chat with …" secondary button. */
  showChat?: boolean;
  chatLabel?: string;
  statusLabel?: string;
  statusTone?: Tone;
  /** Figma `Action`; `null` removes the primary button (State=Requested). */
  actionLabel?: string | null;
  onToggleMap?: () => void;
  onPrimaryAction?: () => void;
  onChat?: () => void;
}) {
  const status = STATUS[state];
  const action = actionLabel === undefined ? ACTION[state] : actionLabel;
  const desktop = size === 'desktop';

  const chrome = desktop
    ? 'gap-[var(--spacing-16)] p-[var(--spacing-24)]'
    : 'gap-[var(--spacing-16)] p-[var(--spacing-16)]';

  const footer = desktop
    ? 'flex-row items-center justify-between gap-[var(--spacing-12)]'
    : 'flex-col gap-[var(--spacing-12)]';
  const actions = desktop
    ? 'flex-row items-center gap-[var(--spacing-8)]'
    : 'flex-col items-center gap-[var(--spacing-8)]';

  return (
    <div
      className={`flex w-full flex-col rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] ${chrome}`}
    >
      <StatusPill label={statusLabel ?? status.label} tone={statusTone ?? status.tone} />

      <RouteSummary
        size={size}
        origin={origin}
        originWindow={originWindow}
        originFlag={originFlag}
        destination={destination}
        destinationWindow={destinationWindow}
        destinationFlag={destinationFlag}
      />

      <RateAndTerms rate={rate} paymentTerms={paymentTerms} ratePerKm={ratePerKm} />

      <Conditions
        size={size}
        equipment={equipment}
        deadhead={deadhead}
        company={company}
        verifiedLabel={verifiedLabel}
        rating={rating}
      />

      {state === 'requested' && (
        <Alert type="info" title={ALERT.title}>
          {ALERT.description}
        </Alert>
      )}

      <div className="flex w-full flex-col gap-[var(--spacing-12)]">
        {showMap && (
          <div className="flex w-full flex-col gap-[var(--spacing-8)]">
            {/* Figma `Inline route map` 494:279 / viewport 494:283. The artwork frame is 382x162 while
                the disclosure it sits in is only 324 wide, so the map is rendered at the card width and
                keeps the 382:162 ratio; the two city labels are live text placed in % so they track the
                artwork. `Open full map` is hand-rolled: the Figma instance is 32 high with pad 0, which
                ButtonLink cannot express (same reason the "Show map" toggle above is hand-rolled). */}
            <div className="relative aspect-[382/162] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-map-land)]">
              <img src={inlineMap} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
              <span className="absolute text-label-12 font-semibold text-[var(--color-map-label)]" style={{ left: '3.14%', top: '81.48%' }}>
                Lille
              </span>
              <span className="absolute text-label-12 font-semibold text-[var(--color-map-label)]" style={{ left: '62.3%', top: '6.17%' }}>
                Brussels
              </span>
            </div>
            <div className="flex h-[32px] w-full items-center justify-end">
              <button
                type="button"
                className="flex h-[32px] items-center text-label-14 text-[var(--color-action-text)]"
              >
                Open full map
              </button>
            </div>
          </div>
        )}

        <div className={`flex w-full ${footer}`}>
          <button
            type="button"
            onClick={onToggleMap}
            className="flex h-[var(--size-control-web)] w-fit shrink-0 items-center gap-[var(--spacing-8)] rounded-[var(--radius-sm)] text-label-14 text-[var(--color-action-text)]"
          >
            <Icon name="map-pin" className="text-[var(--color-text-primary)]" />
            {/* the Figma toggle keeps this label in the expanded instances too */}
            <span className="text-label-14">Show map</span>
          </button>

          <span className={`flex ${actions} ${desktop ? 'w-auto' : 'w-full'}`}>
            {/* Desktop puts the secondary action first, Mobile stacks the primary on top */}
            {desktop && showChat && (
              <Button label={chatLabel} appearance="secondary" size="web" full={false} onClick={onChat} />
            )}
            {action !== null && (
              <Button
                label={action}
                appearance="primary"
                size={desktop ? 'web' : 'mobile'}
                full={!desktop}
                icon={<Icon name="arrow-right" />}
                onClick={onPrimaryAction}
              />
            )}
            {!desktop && showChat && <Button label={chatLabel} appearance="secondary" size="mobile" onClick={onChat} />}
          </span>
        </div>
      </div>
    </div>
  );
}
