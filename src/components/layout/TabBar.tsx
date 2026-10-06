import { Calendar, Package, Search, UserRound } from 'lucide-react';

/**
 * figma: 586:67 · Pharos/App/Tab bar — Active=Loads `586:44` · Applications `586:55` · My day `586:66` · Account `742:1700`
 * props: active
 *
 *   402x83 · fill color/bg/surface · pad top 8 (bottom 25) · 4 tabs 90x50 spread over the 370 content box
 *   tab: vertical, gap 4, radius pill · active tab fill color/bg/subtle, others transparent
 *   icon 20x20 stroke 2px color/text/primary in BOTH states · label 12/16 Medium,
 *   active color/action/primary, inactive color/text/secondary
 *   glyphs: magnifyingglass, package, calendar, user-round
 *
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary, color-action-primary, radius-pill
 */
const TABS = [
  { label: 'Loads', Icon: Search },
  { label: 'Applications', Icon: Package },
  { label: 'My day', Icon: Calendar },
  { label: 'Account', Icon: UserRound },
] as const;

export function TabBar({ active = 'Loads' }: { active?: string }) {
  return (
    <div className="flex h-[var(--tab-bar-h)] w-full justify-between bg-[var(--color-bg-surface)] px-[16px] pt-[8px]">
      {TABS.map(({ label, Icon }) => {
        const on = label === active;
        return (
          <span
            key={label}
            className={`flex h-[50px] w-[90px] flex-col items-center gap-[4px] rounded-[var(--radius-pill)] py-[5px] ${
              on ? 'bg-[var(--color-bg-subtle)]' : ''
            }`}
          >
            <Icon size={20} strokeWidth={2} className="text-[var(--color-text-primary)]" />
            <span
              className={`text-label-12 ${
                on ? 'text-[var(--color-action-primary)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
