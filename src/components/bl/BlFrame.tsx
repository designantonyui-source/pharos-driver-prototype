import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StatusBar } from '../layout/StatusBar';
import { HomeIndicator } from '../layout/HomeIndicator';
import { Icon, type IconName } from '../Icon';

/**
 * Backload (PL) · driver shell in the Pharos style. Same 402×874 screen, Pharos status bar and home indicator,
 * Pharos tabs (pill highlight on the active one), optional back header for pushed pages, and bottom sheets.
 * props: active, children, sheet?, showTabs?, nav? { title, back? }
 * tokens: color-bg-canvas, color-bg-surface, color-bg-subtle, color-text-primary/secondary,
 *         color-action-primary, radius-pill, shadow-card (Pharos values, no overrides)
 */
const TABS: { label: string; icon: IconName; to: string; key: string }[] = [
  { label: 'Kursy', icon: 'truck', to: '/bl', key: 'home' },
  { label: 'Szukaj', icon: 'search', to: '/bl/search', key: 'search' },
  { label: 'Profil', icon: 'user-round', to: '/bl/profile', key: 'profile' },
];

export function BlFrame({
  active,
  children,
  sheet,
  showTabs = true,
  nav,
}: {
  active: string;
  children: ReactNode;
  sheet?: ReactNode;
  showTabs?: boolean;
  nav?: { title: string; back?: string };
}) {
  return (
    <div className="relative h-[var(--screen-h)] w-[var(--screen-w)] overflow-hidden bg-[var(--color-bg-canvas)]">
      <div className="absolute inset-x-0 top-0 z-30">
        <StatusBar type="ios" />
      </div>

      {nav && (
        <div className="absolute inset-x-0 top-[70px] z-20 flex h-[44px] items-center gap-[10px] bg-[var(--color-bg-canvas)] px-[16px]">
          {nav.back && (
            <Link
              to={nav.back}
              aria-label="Wstecz"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
            >
              <Icon name="chevron-left" />
            </Link>
          )}
          <span className="text-heading-20 text-[var(--color-text-primary)]">{nav.title}</span>
        </div>
      )}

      <div
        className="absolute inset-x-0 overflow-y-auto px-[16px] pb-[16px]"
        style={{ top: nav ? 124 : 70, bottom: showTabs ? 'var(--tab-bar-h)' : 0 }}
      >
        {children}
      </div>

      {showTabs && (
        <nav
          aria-label="Główna nawigacja"
          className="absolute inset-x-0 top-[var(--tab-bar-y)] z-30 flex h-[var(--tab-bar-h)] w-full justify-around bg-[var(--color-bg-surface)] px-[16px] pt-[8px]"
        >
          {TABS.map(({ label, icon, to, key }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                to={to}
                aria-current={on ? 'page' : undefined}
                className={`flex h-[50px] w-[110px] flex-col items-center gap-[4px] rounded-[var(--radius-pill)] py-[5px] ${on ? 'bg-[var(--color-bg-subtle)]' : ''}`}
              >
                <Icon name={icon} className="text-[var(--color-text-primary)]" />
                <span className={`text-label-12 ${on ? 'text-[var(--color-action-primary)]' : 'text-[var(--color-text-secondary)]'}`}>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <div className="absolute inset-x-0 top-[var(--home-indicator-y)] z-30">
        <HomeIndicator />
      </div>

      {sheet}
    </div>
  );
}

/** Bottom sheet over the frame. Tapping the dimmed area calls onClose. */
export function BlSheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-[rgba(11,18,32,0.45)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[80%] flex-col gap-[14px] overflow-y-auto rounded-t-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-[20px] pb-[32px] pt-[10px]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto h-[4px] w-[36px] rounded-[var(--radius-pill)] bg-[var(--color-border-default)]" />
        {children}
      </div>
    </div>
  );
}
