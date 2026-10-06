import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { NavigationBar } from './NavigationBar';
import { TabBar } from './TabBar';
import { HomeIndicator } from './HomeIndicator';

/**
 * figma: the 402x874 screen of 30 — iOS App / Driver
 * props: title, back, trailing, avatar, statusBar, tabBar, activeTab, children
 *
 *   Shell metrics are fixed (AGENTS.md #7): screen 402x874 · status bar 62 (Default 54) ·
 *   nav bar 76 Home / 60 Back · tab bar y 757 h 83 · home indicator y 840 h 34.
 *   Children are positioned by the screen itself (absolute top offsets from the Figma frames).
 *
 * tokens: color-bg-canvas
 */
export function ScreenFrame({
  title,
  back = false,
  trailing,
  avatar,
  statusBar = 'ios',
  children,
  tabBar = true,
  activeTab,
}: {
  title?: string;
  back?: boolean;
  trailing?: ReactNode;
  avatar?: string;
  statusBar?: 'ios' | 'default';
  children: ReactNode;
  tabBar?: boolean;
  activeTab?: string;
}) {
  const statusH = statusBar === 'default' ? 'var(--status-bar-default-h)' : 'var(--status-bar-h)';

  return (
    <div className="relative h-[var(--screen-h)] w-[var(--screen-w)] overflow-hidden bg-[var(--color-bg-canvas)]">
      <div className="absolute inset-x-0 top-0">
        <StatusBar type={statusBar} />
      </div>

      {title && (
        <div className="absolute inset-x-0" style={{ top: statusH }}>
          <NavigationBar
            type={back ? 'back' : 'home'}
            title={title}
            trailing={trailing}
            avatar={avatar}
          />
        </div>
      )}

      {children}

      {tabBar && (
        <div className="absolute inset-x-0 top-[var(--tab-bar-y)]">
          <TabBar active={activeTab} />
        </div>
      )}

      <div className="absolute inset-x-0 top-[var(--home-indicator-y)]">
        <HomeIndicator />
      </div>
    </div>
  );
}
