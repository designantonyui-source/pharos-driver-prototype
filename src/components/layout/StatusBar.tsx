/**
 * figma: 2353:26430 · Pharos/App/Status bar — Type=IOS `2305:25330` · Type=Default `586:20`
 * props: type, time
 *
 *   Type=IOS 402x62 · fill color/bg/surface
 *     time 17/22, centered in the 124-wide left box at x 9, y 21 (iOS style)
 *     levels 129x13 at right 9, content centered: cellular 19x12, wifi 17x12, battery 27x13, gap 7
 *     Dynamic Island 125x37, radius pill, centered, y 14
 *   Type=Default 402x54 · fill color/bg/canvas · pad(0/24/0/28)
 *     time 16/24 · connectivity "5G · 100%" 12/16 Medium
 *
 * tokens: color-bg-surface, color-bg-canvas, color-system-black, color-text-primary
 * note: the status bar is device chrome, not Pharos UI — its metrics stay literal on purpose.
 */
export function StatusBar({ type = 'ios', time = '9:41' }: { type?: 'ios' | 'default'; time?: string }) {
  if (type === 'default') {
    return (
      <div className="flex h-[var(--status-bar-default-h)] w-full items-center justify-between bg-[var(--color-bg-canvas)] pl-[28px] pr-[24px]">
        <span className="text-[16px] leading-[24px] text-[var(--color-text-primary)]">{time}</span>
        <span className="text-[12px] font-medium leading-[16px] text-[var(--color-text-primary)]">5G · 100%</span>
      </div>
    );
  }

  return (
    <div className="relative h-[var(--status-bar-h)] w-full bg-[var(--color-bg-surface)] text-[var(--color-system-black)]">
      <span className="absolute left-[9px] top-[21px] flex w-[124px] items-center justify-center text-[17px] font-semibold leading-[22px]">
        {time}
      </span>

      <span className="absolute right-[9px] top-[26px] flex h-[13px] w-[129px] items-center justify-center gap-[7px]">
        {/* cellular 19x12 */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor" aria-hidden>
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
          <rect x="5.3" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10.6" y="3" width="3" height="9" rx="1" />
          <rect x="16" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi 17x12 */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 11.4 1.1 4.3A10.4 10.4 0 0 1 15.9 4.3L8.5 11.4Z" />
        </svg>
        {/* battery 27x13 */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>

      <span className="absolute left-1/2 top-[14px] h-[37px] w-[125px] -translate-x-1/2 rounded-[var(--radius-pill)] bg-[var(--color-system-black)]" />
    </div>
  );
}
