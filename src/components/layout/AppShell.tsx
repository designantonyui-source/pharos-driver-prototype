import type { ReactNode } from 'react';
import { BoxIcon, CalendarIcon, SearchIcon, UserIcon } from '../Icons';

/**
 * App shell — fixed metrics from the design (402 x 874).
 * figma: Pharos/App/Status bar · Navigation bar · Tab bar · Home indicator
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-nav-*, text-ios-*
 */

export function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 flex h-[var(--status-bar-h)] items-end justify-between px-[21px] pb-[12px]">
      <span className="text-ios-body font-semibold">9:41</span>
      <span className="flex items-center gap-[6px] text-[var(--color-text-primary)]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 11.2 1 4.4A9.8 9.8 0 0 1 15 4.4L8 11.2Z" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><path d="M23 4v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" /></svg>
      </span>
    </div>
  );
}

export function NavigationBar({ title, back = false, trailing }: { title: string; back?: boolean; trailing?: ReactNode }) {
  return (
    <div className="absolute inset-x-0 top-[var(--status-bar-h)] flex h-[var(--nav-bar-h)] items-center justify-between px-[16px]">
      <span className="flex min-w-[72px] items-center gap-[8px]">
        {back && <span className="text-[var(--color-text-primary)]">←</span>}
      </span>
      <span className="text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      <span className="flex min-w-[72px] justify-end">{trailing}</span>
    </div>
  );
}

const TABS = [
  { label: 'Loads', Icon: SearchIcon },
  { label: 'Applications', Icon: BoxIcon },
  { label: 'My day', Icon: CalendarIcon },
  { label: 'Account', Icon: UserIcon },
] as const;

export function TabBar({ active = 'Loads' }: { active?: string }) {
  return (
    <div className="absolute inset-x-0 top-[var(--tab-bar-y)] flex h-[var(--tab-bar-h)] items-start justify-around border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] pt-[8px]">
      {TABS.map(({ label, Icon }) => {
        const on = label === active;
        return (
          <span key={label} className={`flex w-[92px] flex-col items-center gap-[4px] ${on ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            <span className={`flex h-[32px] w-[64px] items-center justify-center rounded-[var(--radius-pill)] ${on ? 'bg-[var(--color-bg-subtle)]' : ''}`}>
              <Icon size={22} />
            </span>
            <span className="text-label-12">{label}</span>
          </span>
        );
      })}
    </div>
  );
}

export function HomeIndicator() {
  return (
    <div className="absolute inset-x-0 top-[var(--home-indicator-y)] flex h-[var(--home-indicator-h)] items-center justify-center">
      <span className="h-[5px] w-[134px] rounded-[var(--radius-pill)] bg-[var(--color-text-primary)]" />
    </div>
  );
}

/** 402 x 874 screen: status bar + nav bar + your content + tab bar + home indicator. */
export function ScreenFrame({ title, back, trailing, children, tabBar = true, activeTab }: { title?: string; back?: boolean; trailing?: ReactNode; children: ReactNode; tabBar?: boolean; activeTab?: string }) {
  return (
    <div className="relative h-[var(--screen-h)] w-[var(--screen-w)] overflow-hidden bg-[var(--color-bg-canvas)]">
      <StatusBar />
      {title && <NavigationBar title={title} back={back} trailing={trailing} />}
      {children}
      {tabBar && <TabBar active={activeTab} />}
      <HomeIndicator />
    </div>
  );
}
