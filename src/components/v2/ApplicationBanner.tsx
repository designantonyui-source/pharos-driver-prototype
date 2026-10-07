import type { Status } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';

/** Banner copy per status (flow stories S6: one status, two waiting states). */
export const STATUS_COPY: Record<Exclude<Status, 'none'>, { title: string; step: number }> = {
  'awaiting-dispatcher': { title: 'Awaiting dispatcher', step: 2 },
  'awaiting-customer': { title: 'Dispatcher approved · awaiting customer', step: 3 },
  confirmed: { title: 'Confirmed · Trip TR-4821', step: 4 },
};

/**
 * v2 · ApplicationBanner — live status under the filters after applying (flow stories S7). Tap opens the status sheet.
 * props: load, status, onOpen
 * tokens: color-status-info-bg/text, color-status-success-bg/text, radius-lg, shadow-card
 */
export function ApplicationBanner({
  load,
  status,
  onOpen,
}: {
  load: V2Load;
  status: Exclude<Status, 'none'>;
  onOpen: () => void;
}) {
  const { title, step } = STATUS_COPY[status];
  const done = status === 'confirmed';
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full flex-col gap-[8px] rounded-[var(--radius-lg)] p-[12px] text-left shadow-[var(--shadow-card)] ${
        done
          ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
          : 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]'
      }`}
    >
      <span className="flex items-center justify-between text-label-14">
        <span className="flex items-center gap-[8px]">
          <Icon name={done ? 'circle-check' : 'clock'} size="sm" />
          {title}
        </span>
        <span className="text-label-12">{done ? 'View' : `Step ${step} of 4`}</span>
      </span>
      <span className="text-body-14">
        {load.from} → {load.to} · €{load.rate}
        {done ? '' : ` · by ${load.approvalsBy}`}
      </span>
      <span className="flex gap-[4px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-[4px] flex-1 rounded-[var(--radius-pill)] ${i <= step ? 'bg-current' : 'bg-current opacity-20'}`}
          />
        ))}
      </span>
    </button>
  );
}
