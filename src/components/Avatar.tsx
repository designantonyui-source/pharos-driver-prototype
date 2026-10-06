/**
 * figma: 74:64 (Pharos/Avatar) · 74:56 Size=Small · 74:57 Size=Medium
 *   Size=Small 32x32 + Initials Label/12 · Size=Medium 40x40 + Initials Label/14
 *   both: HORIZONTAL hug, centred, pad 0, radius 999, fill color/avatar/bg, initials color/avatar/text
 *   the app only instances Size=Medium (40x40, "AK" driver / "NC" NordCargo): 149:1659, 396:3997, 74:83 …
 * props: initials, size   (Figma text property "Initials", variant property "Size")
 * tokens: color-avatar-bg, color-avatar-text, radius-pill, spacing-32, spacing-40, text-label-12, text-label-14
 */
export type AvatarSize = 'small' | 'medium';

/** box = the Figma variant's fixed 32 / 40 frame; label = the Figma text style of that variant. */
const BOX = { small: 'var(--spacing-32)', medium: 'var(--spacing-40)' } as const;
const LABEL = { small: 'text-label-12', medium: 'text-label-14' } as const;

export function Avatar({ initials, size = 'medium' }: { initials: string; size?: AvatarSize }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-avatar-bg)] text-[var(--color-avatar-text)] ${LABEL[size]}`}
      style={{ width: BOX[size], height: BOX[size] }}
    >
      {initials}
    </span>
  );
}
