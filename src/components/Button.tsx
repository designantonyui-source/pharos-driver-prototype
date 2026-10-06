import type { ReactNode } from 'react';

/**
 * figma: 12:38 · Pharos/Button — Appearance=Primary/Secondary × Size=Web(40)/Mobile(48) ×
 *        State=Default/Hover/Pressed/Focus/Disabled/Loading (24 variants, Mobile used by the app)
 * props: label, appearance, size, disabled, loading, focus, icon, full, onClick
 *
 *   box HORIZONTAL gap8 pad(0/16/0/16) r8 · Label/14 Medium lh20 · slots are 20x20
 *   order: [loading spinner] [label] [icon] — Figma puts the spinner before the label and the icon after it
 *   primary:   fill color/action/primary · label color/action/text/inverse
 *              hover color/action/primary-hover · pressed color/action/primary-pressed
 *   secondary: fill color/action/secondary · 1px color/action/border · label color/action/text
 *              hover color/action/secondary-hover · pressed color/action/secondary-pressed
 *   disabled:  both fill color/action/disabled and use color/action/text/disabled;
 *              primary drops the border, secondary keeps the 1px color/border/default
 *   loading:   keeps the ENABLED appearance (Figma does not grey it out) + spinner 15x15 / 2px
 *   focus:     2px color/focus/ring border + ring 2px at 4px offset (radius 12)
 *
 * figma: 168:118 · Pharos/Button link — Size × State (12 variants)
 *   no fill, pad x16, r8, hug width, label color/action/text; loading adds the 20x20 spinner (width + 28)
 *
 * tokens: color-action-*, color-border-default, color-focus-ring, radius-sm, radius-md,
 *         size-control-web, size-control-mobile, text-label-14
 */
type Appearance = 'primary' | 'secondary';
type Size = 'web' | 'mobile';

const HEIGHT: Record<Size, string> = {
  web: 'h-[var(--size-control-web)]',
  mobile: 'h-[var(--size-control-mobile)]',
};

/** 20x20 icon slot holding a 15x15 ring, exactly as in the Figma loading variants. */
function Spinner() {
  return (
    <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center" aria-hidden>
      <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-current border-t-transparent" />
    </span>
  );
}

function FocusRing({ inset }: { inset: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${inset} rounded-[var(--radius-md)] border-2 border-[var(--color-focus-ring)]`}
    />
  );
}

export function Button({
  label,
  appearance = 'primary',
  size = 'mobile',
  disabled = false,
  loading = false,
  focus = false,
  icon,
  full = true,
  onClick,
}: {
  label: string;
  appearance?: Appearance;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  focus?: boolean;
  icon?: ReactNode;
  full?: boolean;
  onClick?: () => void;
}) {
  const primary = appearance === 'primary';

  const tone = disabled
    ? 'bg-[var(--color-action-disabled)] text-[var(--color-action-text-disabled)]'
    : primary
      ? 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)] hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-pressed)]'
      : 'bg-[var(--color-action-secondary)] text-[var(--color-action-text)] hover:bg-[var(--color-action-secondary-hover)] active:bg-[var(--color-action-secondary-pressed)]';

  // Tailwind only generates classes it can read literally, so no interpolation inside `border-[...]`.
  const border = focus
    ? 'border-2 border-[var(--color-focus-ring)]'
    : primary
      ? 'border border-transparent'
      : disabled
        ? 'border border-[var(--color-border-default)]'
        : 'border border-[var(--color-action-border)]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative flex ${HEIGHT[size]} items-center justify-center gap-[8px] rounded-[var(--radius-sm)] px-[16px] text-label-14 ${tone} ${border} ${full ? 'w-full' : ''}`}
    >
      {loading && <Spinner />}
      {label}
      {!loading && icon}
      {/* absolutely positioned elements resolve against the padding box, hence 4px + the 2px focus border */}
      {focus && <FocusRing inset="-inset-[6px]" />}
    </button>
  );
}

/**
 * Text-only action. Hugs its content (Figma: 118x48 default, 146x48 while loading), pad x16.
 * Hover and Pressed are background fills (color/action/secondary-hover / -pressed), not text colours.
 */
export function ButtonLink({
  label,
  size = 'mobile',
  disabled = false,
  loading = false,
  focus = false,
  icon,
  onClick,
}: {
  label: string;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  focus?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const tone = disabled
    ? 'text-[var(--color-action-text-disabled)]'
    : 'text-[var(--color-action-text)] hover:bg-[var(--color-action-secondary-hover)] active:bg-[var(--color-action-secondary-pressed)]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative flex ${HEIGHT[size]} items-center justify-start gap-[8px] rounded-[var(--radius-sm)] px-[16px] text-label-14 ${tone}`}
    >
      {loading && <Spinner />}
      {label}
      {!loading && icon}
      {/* the link has no border, so the ring sits the plain 4px outside */}
      {focus && <FocusRing inset="-inset-[4px]" />}
    </button>
  );
}
