/**
 * figma: 2188:8055 · Pharos/Chat/Cargo context — a single COMPONENT, not a component set
 * props: route, summary
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, radius-lg, spacing-4,
 *         spacing-12, text-label-14, text-caption-12
 *
 *   box VERTICAL, gap 4, pad 12/14/12/14, radius 16, fill color/bg/surface `#ffffff`
 *   NO stroke and no effect — checked on the component and on all 8 instances
 *   rows (342 = 370 - 2*14, auto height):
 *     Route            `Pharos/Label/14`   DM Sans Medium  14/20  color/text/primary   `#172a35`
 *     Pickup summary   `Pharos/Caption/12` DM Sans Regular 12/16  color/text/secondary `#586d79`
 *   vertical check: 12 + 20 + 4 + 16 + 12 = 64 == Figma
 *
 *   Figma component properties: `Route` = "Lille → Brussels", `Pickup summary` =
 *   "Today, 14:00–15:00 · €360  ›". All 8 instances are 370x64 and override only the summary —
 *   "Today, 14:00–15:00 · €360 · Decision by 11:00  ›" (page 30, section 04). The trailing `›` is a
 *   text character in that string, not an icon, and it is separated by TWO spaces in both the
 *   component and the instances — `whitespace-pre-wrap` keeps them, because HTML would collapse the
 *   pair into one and pull the `›` 4px closer than Figma draws it.
 *
 * NOTE — Figma fixes the frame at 370 (counterAxis FIXED). The root is fluid (`w-full`) like the
 *   other cards in this repo; the story pins 370.
 * The 14px horizontal padding is --spacing-14.
 * TODO(token): the 370 width — closest is --card-w (370), which is the Offer card width.
 */
export function ChatCargoContext({
  route = 'Lille → Brussels',
  summary = 'Today, 14:00–15:00 · €360  ›',
}: {
  route?: string;
  summary?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--spacing-4)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-[var(--spacing-14)] py-[var(--spacing-12)]">
      {/* own nodes, like the Figma layers `Lille → Brussels` / `Today, …` (PORT-LOG trap 13) */}
      <span className="text-label-14 text-[var(--color-text-primary)]">{route}</span>
      <span className="whitespace-pre-wrap text-caption-12 text-[var(--color-text-secondary)]">
        {summary}
      </span>
    </div>
  );
}
