import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';
import { useCountdown } from './useCountdown';

/**
 * v2 · LoadTile — one load in the bottom carousel of the map-first home. NEW component (OfferCard is untouched).
 * props: load, selected, applied, onOpen
 *
 * Three facts only, as in the DoorDash Dasher / Grab references: money, route + time, distance to pickup.
 * Everything else lives one tap away in LoadSheet.
 *
 * tokens: color-offer-bg, color-offer-border, color-offer-text-price, color-offer-text-highlight, color-text-primary,
 *         color-text-secondary, color-status-warning-bg, color-status-warning-text, radius-lg, radius-pill, shadow-card
 */
export function LoadTile({
  load,
  applied = false,
  onOpen,
}: {
  load: V2Load;
  applied?: boolean;
  onOpen: () => void;
}) {
  const { label, urgent } = useCountdown(load.decideMin);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-[330px] shrink-0 snap-center flex-col gap-[8px] rounded-[var(--radius-lg)] border border-[var(--color-offer-border)] bg-[var(--color-offer-bg)] p-[16px] text-left shadow-[var(--shadow-card)]"
    >
      <span className="flex items-baseline justify-between">
        <span className="flex items-baseline gap-[8px]">
          <span className="text-metric-28 text-[var(--color-offer-text-price)]">€{load.rate}</span>
          <span className="text-body-14 text-[var(--color-text-secondary)]">€{load.perKm.toFixed(2)}/km</span>
        </span>
        {applied ? (
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-info-bg)] px-[10px] py-[2px] text-label-12 text-[var(--color-status-info-text)]">
            Applied
          </span>
        ) : (
          <span
            className={`rounded-[var(--radius-pill)] px-[10px] py-[2px] text-label-12 ${
              urgent
                ? 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'
                : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'
            }`}
          >
            Decide in {label}
          </span>
        )}
      </span>

      <span className="flex items-center gap-[8px] text-heading-20 text-[var(--color-text-primary)]">
        {load.from}
        <Icon name="arrow-right" size="sm" />
        {load.to}
      </span>

      <span className="text-body-14 text-[var(--color-text-primary)]">
        {load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window}
      </span>

      <span className="flex items-center gap-[6px] text-label-14 text-[var(--color-offer-text-highlight)]">
        <Icon name="map-pin" size="sm" />
        {load.pickupKm} km to pickup · about {load.pickupMin} min
      </span>
    </button>
  );
}
