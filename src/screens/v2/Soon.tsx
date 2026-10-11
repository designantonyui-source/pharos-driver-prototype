import { V2Frame } from '../../components/v2/V2Frame';
import { Icon } from '../../components/Icon';

/** v2 · placeholder for tabs whose flow is not built yet (see design/DRIVER-FLOWS.md §5 for the order). */
export function V2Soon({ active, title }: { active: string; title: string }) {
  return (
    <V2Frame active={active}>
      <div className="absolute inset-x-0 top-[34px] px-[16px]">
        <h1 className="text-heading-24 text-[var(--color-text-primary)]">{title}</h1>
        <div className="mt-[24px] flex flex-col items-center gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[24px] text-center shadow-[var(--shadow-card)]">
          <Icon name="clock" size="lg" className="text-[var(--color-text-secondary)]" />
          <p className="text-body-14 text-[var(--color-text-secondary)]">Coming in the next step of the v2 journey.</p>
        </div>
      </div>
    </V2Frame>
  );
}
