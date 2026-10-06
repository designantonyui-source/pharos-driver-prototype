import type { ReactNode } from 'react';
import { Icon } from '../Icon';

/**
 * figma: 586:33 · Pharos/App/Navigation bar — Type=Home `586:25` (402x76) · Type=Back `586:32` (402x60)
 * props: type, title, onBack, trailing, avatar
 *
 *   both types: fill color/bg/canvas, pad x 16, gap 8
 *   Type=Home: title Heading/24 (24/32 Bold) left, optional Profile avatar 44x44 at the right (hidden in Figma)
 *   Type=Back: back button 44x44 with chevron.left 20/2px, title Heading/20 (20/28 SemiBold) at x 68,
 *              trailing slot 44 tall at the right (Figma shows a pill 68x44 r999, fill color/bg/disabled)
 *
 * tokens: color-bg-canvas, color-text-primary, color-avatar-bg, color-avatar-text, color-bg-disabled, radius-pill
 */
export function NavigationBar({
  type = 'home',
  title,
  onBack,
  trailing,
  avatar,
}: {
  type?: 'home' | 'back';
  title: string;
  onBack?: () => void;
  trailing?: ReactNode;
  avatar?: string;
}) {
  if (type === 'back') {
    return (
      <div className="flex h-[var(--nav-bar-back-h)] w-full items-center gap-[8px] bg-[var(--color-bg-canvas)] px-[16px]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center text-[var(--color-text-primary)]"
        >
          <Icon name="chevron-left" label="Back" />
        </button>
        <span className="flex-1 truncate text-heading-20 text-[var(--color-text-primary)]">{title}</span>
        {trailing}
      </div>
    );
  }

  return (
    <div className="flex h-[var(--nav-bar-h)] w-full items-center gap-[8px] bg-[var(--color-bg-canvas)] px-[16px]">
      <span className="flex-1 truncate text-heading-24 text-[var(--color-text-primary)]">{title}</span>
      {trailing ?? (avatar ? <AvatarInitials initials={avatar} /> : null)}
    </div>
  );
}

/** The Profile frame of Type=Home and the trailing pill of Type=Back, 44 tall, radius pill. */
export function AvatarInitials({ initials, label }: { initials: string; label?: string }) {
  return (
    <span className="flex h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-avatar-bg)] px-[12px] text-label-14 text-[var(--color-avatar-text)]">
      {label ?? initials}
    </span>
  );
}
