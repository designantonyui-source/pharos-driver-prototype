import { ButtonLink } from './Button';
import { Flag } from './Flag';

/**
 * figma: 2715:1535 (Pharos/App/Route card) · Addresses=Expected 2715:1465 (370x235)
 *        · Addresses=Known 2715:1500 (370x339)
 *   card: VERTICAL, pad 16, gap 12, radius 12, fill color/bg/surface,
 *     1px inside color/border/default. All 15 app instances are exactly the component size.
 *   Title 28 · Pickup 68 (Expected) / 120 (Known) · Divider 336x1 · Delivery 68 / 120
 *     -> 28+68+1+68 + 3x12 + 32 + 2 = 235; with both `Address action` rows (48 + 4 gap each) = 339
 *   stop block: City 24 (Flag 24 · City/16 · Kind/12 right) · Window/14 · Address/12 · action 48
 *     the Flag is 24 wide in an 18-high slot, so its 3:2 art (24x16) sits at y4..20 — exactly what
 *     the shipped 18x18 export produces at size 24
 * props: title, pickup, delivery, addresses, onNavigate
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-status-warning-text, color-status-success-text, radius-md, spacing-4, spacing-8,
 *         spacing-12, spacing-16, text-heading-20, text-body-16, text-body-14, text-label-12,
 *         text-caption-12, spacing-10, card-w
 *
 * REPRODUCED FROM THE RENDER, not from the API (numbers are in design/PORT-LOG.md): Figma draws the Known
 *   `Navigate` link UNDERLINED (`ButtonLink underline`), although `textDecoration` reads NONE on that
 *   label. The control is clean: the same `Pharos/Button link` instance inside the Offer card
 *   (`2718:2203`) renders WITHOUT an underline and its label also reads NONE — so the API read is the
 *   unreliable side (the master `168:89` is UNDERLINE) and the render is the reference.
 */
export type RouteStop = {
  flag?: string;
  city?: string;
  kind?: string;
  window?: string;
  /** defaults to the copy of the variant: "Exact address expected" / "Exact address received" */
  address?: string;
};

export type RouteCardProps = {
  title?: string;
  pickup?: RouteStop;
  delivery?: RouteStop;
  addresses?: 'expected' | 'known';
  onNavigate?: () => void;
};

const PICKUP: RouteStop = { flag: 'France', city: 'Lille, France', kind: 'Pickup', window: 'Today, 14:00–15:00' };
const DELIVERY: RouteStop = { flag: 'Belgium', city: 'Brussels, Belgium', kind: 'Delivery', window: 'Today, by 19:00' };

function Stop({ stop, known, onNavigate }: { stop: RouteStop; known: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-[var(--spacing-4)]">
      {/* City — 24: Flag 24 · City/16 (FILL) · Kind/12 */}
      <div className="flex h-[24px] items-center gap-[var(--spacing-8)]">
        <Flag country={stop.flag ?? 'France'} size={24} />
        <span className="flex-1 text-body-16 text-[var(--color-text-primary)]">{stop.city}</span>
        <span className="text-label-12 text-[var(--color-text-secondary)]">{stop.kind}</span>
      </div>
      <span className="text-body-14 text-[var(--color-text-secondary)]">{stop.window}</span>
      <span
        className={`text-caption-12 ${
          known ? 'text-[var(--color-status-success-text)]' : 'text-[var(--color-status-warning-text)]'
        }`}
      >
        {stop.address ?? (known ? 'Exact address received' : 'Exact address expected')}
      </span>
      {/* `Address action` — only the Known variant carries it (48px high, 4px above it) */}
      {known && (
        <div className="flex h-[48px] items-center gap-[var(--spacing-8)]">
          {/* Figma's 10px Spacer in front of the link */}
          <span className="w-[var(--spacing-10)]" />
          <ButtonLink label="Navigate" underline onClick={onNavigate} />
        </div>
      )}
    </div>
  );
}

export function RouteCard({
  title = 'Route',
  pickup = PICKUP,
  delivery = DELIVERY,
  addresses = 'expected',
  onNavigate,
}: RouteCardProps) {
  const known = addresses === 'known';

  return (
    <div className="flex w-[var(--card-w)] flex-col gap-[var(--spacing-12)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <span className="text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      <Stop stop={pickup} known={known} onNavigate={onNavigate} />
      <span className="h-[1px] w-full bg-[var(--color-border-default)]" />
      <Stop stop={delivery} known={known} onNavigate={onNavigate} />
    </div>
  );
}
