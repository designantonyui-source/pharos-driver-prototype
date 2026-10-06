import { Icon, type IconName } from './Icon';

/**
 * figma: 129:46 · Pharos/Empty details panel (COMPONENT, 648x154) — a single component, not a set.
 *        Properties: Title (TEXT), Description (TEXT), Icon (INSTANCE_SWAP, default 279:5037
 *        `Lucide/Icon/Search`). The 648 width is the component frame; the six instances are
 *        628x154, 628x174, 636x154 and 370x174, so the panel is fluid (`w-full`) and its height
 *        hugs the description's line count (154 = one line, 174 = two).
 * props: icon, title, description
 *
 *   root VERTICAL, pad 24, gap 16, counterAxis CENTER, r12 (radius/md), fill #ffffff,
 *   1px INSIDE #d7e0e6 (color/border/default). Children are FILL width, so text is centered by
 *   the text alignment, not by the layout.
 *     Empty state icon 24x24 `Lucide/Icon/Search`, stroke #172a35 2px, centered
 *     Title   Manrope SemiBold 20/28 #172a35, textAlign CENTER
 *     Description DM Sans Regular 14/20 #586d79, textAlign CENTER
 *   Height check: 1 + 24 + 24 + 16 + 28 + 16 + 20 + 24 + 1 = 154.
 *
 * The six instances in Figma (all measured):
 *   130:1108 / 565:6896  628x154  Search · "Select a load" · one-line description
 *   130:1308             628x174  Search · "No matching loads" · description wraps to 2 lines
 *   208:2413             636x154  **Loader** icon (279:5034) · "Refreshing the load list"
 *   2207:8233 / 2207:8279  370x174  page 30 · two-line descriptions
 * The icon swap is why `icon` is a prop: an empty panel and a loading panel are the same block.
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         radius-md, size-icon-lg, text-heading-20, text-body-14
 * TODO(token): none — every value above is an existing token.
 */
export function EmptyDetailsPanel({
  icon = 'search',
  title,
  description,
}: {
  /** Figma's `Icon` instance swap. `search` is the set default (279:5037). */
  icon?: IconName;
  title: string;
  description: string;
}) {
  return (
    <section className="flex w-full flex-col items-center gap-[16px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[24px]">
      <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-[var(--color-text-primary)]">
        <Icon name={icon} size="lg" />
      </span>
      <span className="w-full text-center text-heading-20 text-[var(--color-text-primary)]">{title}</span>
      <span className="w-full text-center text-body-14 text-[var(--color-text-secondary)]">{description}</span>
    </section>
  );
}
