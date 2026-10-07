import { useState } from 'react';
import type { V2Load } from '../../lib/v2/loads';
import { Button } from '../Button';
import { Icon, type IconName } from '../Icon';
import { Sheet } from './Sheet';
import { useCountdown } from './useCountdown';

/**
 * v2 · LoadSheet — the single decision screen (flow stories S2–S4), as a sheet over the map.
 * props: load, open, onClose, onApply
 *
 * Order (S3): money → route → facts → What happens next → CTA.
 * CTA carries the amount and the remaining decision time: `Apply for €360 · 1:20` (S4 + DoorDash timer-in-button).
 * One-tap apply, no confirmation screen (S1: Review is gone). Single shared deadline copy (S4).
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

export function LoadSheet({
  load,
  open,
  onClose,
  onApply,
}: {
  load: V2Load;
  open: boolean;
  onClose: () => void;
  onApply: () => Promise<void>;
}) {
  const { label } = useCountdown(load.decideMin);
  const [busy, setBusy] = useState(false);

  async function apply() {
    setBusy(true);
    await onApply();
    setBusy(false);
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-baseline gap-[8px]">
        <span className="text-heading-32 text-[var(--color-offer-text-price)]">€{load.rate}</span>
        <span className="text-body-16 text-[var(--color-text-secondary)]">
          €{load.perKm.toFixed(2)}/km · {load.km} km loaded
        </span>
      </div>

      <h2 className="mt-[4px] flex items-center gap-[8px] text-heading-24 text-[var(--color-text-primary)]">
        {load.from}
        <Icon name="arrow-right" />
        {load.to}
      </h2>

      <ul className="mt-[16px] flex flex-col gap-[12px]">
        <Fact icon="clock">
          {load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window}
        </Fact>
        <Fact icon="map-pin">
          <span className="text-[var(--color-offer-text-highlight)]">
            {load.pickupKm} km to pickup · about {load.pickupMin} min
          </span>
        </Fact>
        <Fact icon="package">{load.vehicle}</Fact>
        <Fact icon="shield">
          {load.company} · {load.rating} ★ · Verified · {load.paidIn}
        </Fact>
      </ul>

      <div className="mt-[16px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px]">
        <p className="text-label-14 text-[var(--color-text-primary)]">What happens next</p>
        <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
          Your dispatcher checks the schedule, then the customer confirms — both by {load.approvalsBy}. Applying doesn’t
          reserve the load.
        </p>
      </div>

      <div className="mt-[16px]">
        <Button label={`Apply for €${load.rate} · ${label}`} loading={busy} onClick={apply} />
      </div>
    </Sheet>
  );
}
