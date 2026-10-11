/**
 * v2 · LoadCardSkeleton — the feed loading face. Composes the Figma-measured skeleton
 * rows from OfferCard (2594:22017), not a copy: same 336x160 bars, same r4, same token.
 * props: count · tokens: color-offer-bg-skeleton, radius-xs, radius-lg, color-offer-border
 */
export function LoadCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex h-full flex-col gap-[8px] overflow-hidden" role="status" aria-label="Searching for loads">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="flex w-full shrink-0 flex-col gap-[8px] rounded-[var(--radius-lg)] border border-[var(--color-offer-border)] bg-[var(--color-bg-surface)] p-[12px] shadow-card"
        >
          <div className="flex h-[36px] items-center gap-[8px]">
            <Bar w={72} h={24} top />
            <Bar w={68} h={16} />
            <span className="flex-1" />
            <Bar w={42} h={16} />
          </div>
          <div className="flex h-[28px] items-start">
            <Bar w={149} h={20} />
          </div>
          <div className="flex h-[24px] items-center">
            <Bar w={129} h={16} />
          </div>
          <div className="flex h-[20px] items-center">
            <Bar w={158} h={16} />
          </div>
          <div className="flex h-[20px] items-center">
            <Bar w={217} h={16} />
          </div>
        </div>
      ))}
      <span className="sr-only">Searching for loads…</span>
    </div>
  );
}

function Bar({ w, h, top = false }: { w: number; h: number; top?: boolean }) {
  return (
    <span
      className={`shrink-0 animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-offer-bg-skeleton)]${top ? ' self-start' : ''}`}
      style={{ width: w, height: h }}
    />
  );
}