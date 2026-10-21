import type { V2Load } from '../../lib/v2/loads';
import { dayLabel } from '../../lib/v2/loads';
import { getApplicationForLoad } from '../../lib/store';
import { CARD_STATE_STYLES, getLoadCardState } from './LoadCard';
import { LoadCta } from './LoadCta';
import { Icon, type IconName } from '../Icon';
import { Sheet } from './Sheet';

/**
 * v2 · LoadSheet — the single decision screen (flow stories S2–S4), as a sheet over the map.
 * props: load, open, onClose
 *
 * Order (S3): money → route → facts → What happens next → CTA.
 * Shared LoadCta reads application state and opens the Quick Apply confirmation.
 *
 * tokens: color-offer-text-price, color-text-primary, color-text-secondary, color-bg-subtle, color-offer-text-highlight,
 *         color-border-default, radius-md
 */
function Fact({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-[12px] text-body-14 text-[var(--color-text-primary)]">
      <Icon name={icon} className="text-[var(--color-text-secondary)]" />
      {children}
    </li>
  );
}

/** The state pill: one lucide glyph plus a label. `icon: null` keeps the route-match badge text-only. */
type Badge = { icon: IconName | null; label: string };

export function LoadSheet({
  load,
  open,
  onClose,
  onNotice,
}: {
  load: V2Load;
  open: boolean;
  onClose: () => void;
  onNotice?: (title: string, detail?: string) => void;
}) {
  const application = getApplicationForLoad(load.id);
  const state = getLoadCardState(application);
  const styles = CARD_STATE_STYLES[state];
  const badge: Badge | null = state === 'pending' ? { icon: 'clock', label: 'In review' }
    : state === 'booked' ? { icon: 'circle-check', label: `Booked · ${application?.tripId ?? `TR-${load.id}`}` }
      : state === 'rejected' ? { icon: 'circle-x', label: 'Rejected' }
        : state === 'cancelled' ? { icon: 'x', label: 'Cancelled by you' }
          : (load.onRoute) ? { icon: null, label: 'On your route' } : null;

  return (
    <Sheet open={open} onClose={onClose} label={`Load ${load.from} to ${load.to}, €${load.rate}`}>
      {badge && <p className={`inline-flex items-center gap-[4px] self-start rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${styles.badge}`}><span className="flex items-center gap-[4px]" role="status">{badge.icon && <Icon name={badge.icon} size={12} />}{badge.label}</span></p>}
      <div className="mt-[12px] flex items-baseline gap-[8px]">
        <span className="text-heading-32 text-[var(--color-offer-text-price)]">€{load.rate}</span>
        <span className="text-body-16 text-[var(--color-text-secondary)]">
          €{load.netPerKm.toFixed(2)}/km net · {load.km} km loaded
        </span>
      </div>

      <h2 className="mt-[4px] flex items-center gap-[8px] text-heading-24 text-[var(--color-text-primary)]">
        {load.from}
        <Icon name="arrow-right" />
        {load.to}
      </h2>

      <ul className="mt-[16px] flex flex-col gap-[12px]">
        <Fact icon="clock">
          Pickup {dayLabel(load.date)} · {load.window}
        </Fact>
        <Fact icon="truck">
          Delivery {dayLabel(load.deliveryDate)} · {load.deliveryWindow}
        </Fact>
        <Fact icon="map-pin">
          <span className="text-[var(--color-offer-text-highlight)]">
            {load.pickupKm} km to pickup · about {load.pickupMin} min · {(load.rate / load.km).toFixed(2)} €/km loaded
          </span>
        </Fact>
        <Fact icon="package">{load.vehicle}</Fact>
        <Fact icon="shield">
          <span className="flex flex-wrap items-center gap-x-[6px]">
            <span>{load.company} ·</span>
            <span className="flex items-center gap-[2px]"><Icon name="star" size={12} />{load.rating} ·</span>
            <span>Verified · {load.paidIn} · expected {load.payoutDate}</span>
          </span>
        </Fact>
      </ul>

      <div className="mt-[16px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px]">
        <p className="text-label-14 text-[var(--color-text-primary)]">What happens next</p>
        <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
          Most dispatchers reply within 15 minutes. Applying doesn’t reserve the load.
        </p>
      </div>

      <div className="mt-[16px]">
        <LoadCta loadId={load.id} onNotice={onNotice} />
      </div>
    </Sheet>
  );
}
