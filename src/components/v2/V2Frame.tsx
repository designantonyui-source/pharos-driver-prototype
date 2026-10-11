import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusBar } from '../layout/StatusBar';
import { HomeIndicator } from '../layout/HomeIndicator';
import { Icon, type IconName } from '../Icon';

/**
 * v2 · driver app shell — NEW component, does not touch the Figma-measured `layout/*` (AGENTS.md #7 still holds:
 * the 402x874 screen, status bar, tab bar y/h and home indicator are reused as-is).
 * props: active, children
 * tokens: color-bg-canvas, color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, radius-pill
 *
 * Three tabs instead of four: Applications and My day collapse into one «Trips» (flow stories: fewer places to look).
 * Tabs are real links, unlike the static `layout/TabBar`.
 */
const TABS: { label: string; icon: IconName; to: string }[] = [
  { label: 'Loads', icon: 'search', to: '/v2' },
  { label: 'Trips', icon: 'truck', to: '/v2/trips' },
  { label: 'Account', icon: 'user-round', to: '/v2/account' },
];

export function V2Frame({ active = 'Loads', children }: { active?: string; children: ReactNode }) {
  return (
    <div data-load-overlay-root className="relative h-[var(--screen-h)] w-[var(--screen-w)] overflow-hidden bg-[var(--color-bg-canvas)]">
      <div className="absolute inset-x-0 top-0 z-30">
        <StatusBar type="ios" />
      </div>

      <div className="absolute inset-x-0 top-[var(--status-bar-h)] bottom-0">
        {children}
      </div>

      <nav className="absolute inset-x-0 top-[var(--tab-bar-y)] z-30 flex h-[var(--tab-bar-h)] w-full justify-around bg-[var(--color-bg-surface)] px-[16px] pt-[8px]">
        {TABS.map(({ label, icon, to }) => {
          const on = label === active;
          return (
            <Link
              key={label}
              to={to}
              className={`flex h-[50px] w-[110px] flex-col items-center gap-[4px] rounded-[var(--radius-pill)] py-[5px] ${
                on ? 'bg-[var(--color-bg-subtle)]' : ''
              }`}
            >
              <Icon name={icon} className="text-[var(--color-text-primary)]" />
              <span
                className={`text-label-12 ${on ? 'text-[var(--color-action-primary)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute inset-x-0 top-[var(--home-indicator-y)] z-30">
        <HomeIndicator />
      </div>
    </div>
  );
}
