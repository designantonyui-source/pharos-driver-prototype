import { Button } from './Button';
import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 167:65 · Pharos/Page header — Layout=Inline `167:49` · Layout=Actions `167:57`
 * props: layout, title, status, action
 *
 *   both variants: HORIZONTAL hug, gap 24, counterAxis CENTER, NO fill of their own — they sit on
 *                  the `Workspace` frame over the page canvas `#f4f6f8`, so the root stays
 *                  transparent and the surrounding layout provides the background
 *   Title:         Heading/32 (Manrope Bold 32/40) color/text/primary
 *   Status:        an instance of `Pharos/Status` (Tone=Success, "Vehicle available" in the set);
 *                  on page 21 it is overridden per screen, e.g. Tone=Info "Vehicle assigned to a
 *                  trip" (`170:2182`) or Tone=Warning "Needs fixing" (`170:2242`)
 *
 *   Layout=Inline  (1112x40)  [Title 306 hug] [Status 130]  — nothing is stretched; on page 21 the
 *                             Status sits directly after the title, 24px later
 *   Layout=Actions (1112x48)  [Title 766 fills] [Status 130] [Action 168] — the title absorbs the
 *                             free space, so Status and Action are pushed to the trailing edge
 *   The 16px height difference is purely the trailing Button: in the instances that hide the Action
 *   layer the variant collapses back to 40 (`170:2257`, `565:5559`), which is what hug gives here.
 *
 *   Action = `Pharos/Button` Appearance=Secondary, Size=Mobile, State=Default → hug 168x48
 *   Width: every one of the 30 instances is exactly 1112 (the Workspace frame is 1160 with pad 24),
 *   so the root is `w-full` and the container decides the width.
 *
 * tokens: color-text-primary, spacing-24, text-heading-32
 */

export type PageHeaderLayout = 'inline' | 'actions';

export function PageHeader({
  layout = 'inline',
  title,
  status,
  action,
}: {
  layout?: PageHeaderLayout;
  title: string;
  /** the trailing `Pharos/Status` pill; omit it and the row shrinks to the title */
  status?: { label: string; tone?: Tone; dot?: boolean };
  /** Layout=Actions only: the trailing `Pharos/Button` (Secondary / Mobile) */
  action?: { label: string; onClick?: () => void };
}) {
  const actions = layout === 'actions';

  return (
    <div className="flex w-full items-center gap-[var(--spacing-24)]">
      <h1
        className={`truncate text-heading-32 text-[var(--color-text-primary)] ${actions ? 'min-w-0 flex-1' : ''}`}
      >
        {title}
      </h1>

      {status && <StatusPill label={status.label} tone={status.tone} dot={status.dot} />}

      {/* hug, not w-full: the Figma Action instance is 168 wide */}
      {actions && action && (
        <Button label={action.label} appearance="secondary" full={false} onClick={action.onClick} />
      )}
    </div>
  );
}
