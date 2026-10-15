/**
 * figma: prototype-led · TripDocumentsSheet — trip documents list
 * props: open, load, onClose
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-text, radius-md
 */
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';
import type { V2Load } from '../../lib/v2/loads';

export function TripDocumentsSheet({
  open,
  load,
  onClose,
}: {
  open: boolean;
  load: V2Load;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`Documents for trip ${load.from} to ${load.to}`}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Documents ({load.documents.length})</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">
        {load.from} → {load.to}
      </p>
      <ul className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
        {load.documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center gap-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[var(--spacing-12)]"
          >
            <span className="flex h-[var(--spacing-24)] w-[var(--spacing-24)] shrink-0 items-center justify-center text-[var(--color-action-text)]" aria-hidden>
              <Icon name="file-text" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-label-14 text-[var(--color-text-primary)]">{doc.name}</span>
              <span className="text-caption-12 text-[var(--color-text-secondary)]">{doc.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-[var(--spacing-20)]">
        <Button label="Close" appearance="secondary" onClick={onClose} />
      </div>
    </Sheet>
  );
}
