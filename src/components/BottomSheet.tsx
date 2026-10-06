/**
 * figma: Pharos/Bottom sheet (2197:8841) — states Peek / Full (map sheet)
 * props: state, children (extra content shown in Full)
 * tokens: color-bg-surface, radius-lg, color-border-default
 * geometry: anchored to the bottom of the 402x874 map screen; handle 36x4, pager 22x8
 */
export function BottomSheet({ children, state = 'peek', pager }: { children: React.ReactNode; state?: 'peek' | 'full'; pager?: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[12px] rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[16px] pb-[16px] pt-[8px]">
      <span className="mx-auto h-[4px] w-[36px] rounded-[var(--radius-pill)] bg-[var(--color-border-strong)]" />
      {pager && <span className="text-center text-caption-12 text-[var(--color-text-tertiary)]">{pager}</span>}
      {state === 'full' && children}
    </div>
  );
}
