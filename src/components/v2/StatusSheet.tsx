import type { Status } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';
import { STATUS_COPY } from './ApplicationBanner';

/**
 * v2 · StatusSheet — the unified Application status (flow stories S6): one sheet, two waiting states.
 * props: load, status, open, onClose
 * Only the active step and the title change between awaiting-dispatcher / awaiting-customer.
 * tokens: color-action-primary, color-border-strong, color-text-primary, color-text-secondary
 */
const STEPS = ['Application sent', 'Dispatcher approval', 'Customer confirmation', 'Trip assigned'];

export function StatusSheet({
  load,
  status,
  open,
  onClose,
}: {
  load: V2Load;
  status: Exclude<Status, 'none'>;
  open: boolean;
  onClose: () => void;
}) {
  const { title, step } = STATUS_COPY[status];
  const done = status === 'confirmed';
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
        {load.from} → {load.to} · €{load.rate}
        {done ? '' : ` · both approvals by ${load.approvalsBy}`}
      </p>

      <ol className="mt-[16px] flex flex-col gap-[12px]">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const complete = n < step || done;
          const current = n === step && !done;
          return (
            <li key={label} className="flex items-center gap-[12px] text-body-14 text-[var(--color-text-primary)]">
              <span
                className={`flex h-[24px] w-[24px] items-center justify-center rounded-[var(--radius-pill)] border-2 ${
                  complete
                    ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                    : current
                      ? 'border-[var(--color-action-primary)]'
                      : 'border-[var(--color-border-strong)]'
                }`}
              >
                {complete && <Icon name="check" size={14} />}
              </span>
              <span className={current ? 'text-label-14' : complete ? '' : 'text-[var(--color-text-secondary)]'}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-[20px]">
        <Button label={done ? 'Got it' : 'Keep searching'} onClick={onClose} />
      </div>
    </Sheet>
  );
}
