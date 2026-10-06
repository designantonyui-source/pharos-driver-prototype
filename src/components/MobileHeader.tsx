import type { ReactNode } from 'react';
import { Button } from './Button';

/**
 * figma: 26:24 · Pharos/Mobile header — Type=Home `26:8` · Type=Back `26:13` (both 390x80)
 * props: type, title, initials, backLabel, onBack, trailing
 *
 *   both types: fill color/bg/surface, pad 16, one 48-tall content row, gap 12
 *   Type=Home: Title Heading/24 (Manrope Bold 24/32) filling, then `Driver initials` — a local
 *              48x48 frame (NOT an instance of Pharos/Avatar, which is 40x40), radius pill,
 *              fill color/avatar/bg, Label/14 (DM Sans Medium) color/avatar/text
 *   Type=Back: the `Back button` instance of Pharos/Button Secondary/Mobile/Default, resized to a
 *              FIXED 88x48 in the component and in all 9 instances (`31:83`, `31:170`, `37:202` …),
 *              then Title Heading/20 (Manrope SemiBold 20/28) filling
 *   the Button's 20x20 icon slot (`12:113`) is hidden in the master and absent from the instance,
 *              so the label is centred in the 88px box by the variant's CENTER/CENTER alignment
 *   both Title layers are 32 tall at y8 of the 48 row (`26:10`, `26:23`). For Type=Back that box is
 *              taller than the 20/28 line it holds and `textAutoResize = NONE` +
 *              `textAlignVertical = TOP` pins the line to the top of it, which puts the glyphs 1px
 *              higher than a centred 28px line box would — hence the fixed `h-[32px]` on the title.
 *
 * Relationship to `Pharos/App/Navigation bar` `586:33` (`layout/NavigationBar.tsx`) — this is NOT a
 * variant of it and does not supersede it. They are two different component sets on two different
 * Figma pages: this one lives on page `05 · Web / Workspace & load board` and is instanced only by
 * the 390-wide frames of page `21 — Driver / Search and request` (the responsive-driver-portal
 * surface); NavigationBar lives on page `30 — iOS App / Driver` (the native 402x874 shell, 139
 * instances). Same idea, different surface: 390 vs 402 wide, 80 vs 76/60 tall, white vs canvas
 * fill, a text "Back" button vs an icon-only chevron, a 48px vs a 44px initials frame.
 *
 * tokens: color-bg-surface, color-text-primary, color-avatar-bg, color-avatar-text, radius-pill,
 *         size-control-mobile, text-heading-20, text-heading-24, text-label-14,
 *         spacing-12, spacing-16
 * TODO(token): header height 80px — no token covers it (the iOS shell names nav-bar-h 76/60),
 *              and design/tokens.json is owned by the parent, so 80 stays a literal here.
 * TODO(token): the Back button's FIXED 88px width (a per-instance override in Figma) has no token.
 */

/** The `Driver initials` frame of Type=Home: 48x48, radius pill, Label/14. Local by design — the
 *  Figma node is a plain frame, not an instance of `Pharos/Avatar` (40x40), exactly like the 44x44
 *  `Profile` frame of `NavigationBar`. */
function DriverInitials({ initials }: { initials: string }) {
  return (
    <span className="flex h-[var(--spacing-48)] w-[var(--spacing-48)] shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-avatar-bg)] text-label-14 text-[var(--color-avatar-text)]">
      {initials}
    </span>
  );
}

export function MobileHeader({
  type = 'home',
  title,
  initials = 'AK',
  backLabel = 'Back',
  onBack,
  trailing,
}: {
  type?: 'home' | 'back';
  title: string;
  /** Type=Home only; Figma writes "AK" in the set and in every instance */
  initials?: string;
  /** Type=Back only; the Button label — Figma writes "Back" in the set and in every instance */
  backLabel?: string;
  onBack?: () => void;
  /** replaces the trailing slot (the initials frame in Type=Home) */
  trailing?: ReactNode;
}) {
  const back = type === 'back';

  return (
    <div className="flex h-[80px] w-full flex-col bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      {/* `Header content` 358x48 */}
      <div className="flex h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)]">
        {back && (
          <span className="w-[88px] shrink-0">
            <Button label={backLabel} appearance="secondary" onClick={onBack} />
          </span>
        )}

        <h1
          className={`h-[var(--spacing-32)] min-w-0 flex-1 truncate text-[var(--color-text-primary)] ${
            back ? 'text-heading-20' : 'text-heading-24'
          }`}
        >
          {title}
        </h1>

        {trailing ?? (back ? null : <DriverInitials initials={initials} />)}
      </div>
    </div>
  );
}
