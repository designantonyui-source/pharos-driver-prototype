/**
 * figma: 26:27 · Pharos/Route summary — one COMPONENT, no variants, 358x170
 * props: route, schedule, equipment, rate, distance
 *
 *   This is the mobile-WEB summary of page 21 (instanced 3x in the 390-wide screens
 *   «03 · Проверка заявки», «04 · Заявка отправлена», «05 · Заявка принята» at 324/358 wide, and once in
 *   a 1440 desktop frame). The phone card of page 30 is a DIFFERENT component — see RouteSummary.tsx
 *   (`671:977`, 370x92, marker rail + From/To rows). They are not variants of each other.
 *
 *   VERTICAL, pad 16, gap 12, r16, fill color/bg/surface, 1px color/border/default
 *   route 20/28 Manrope SemiBold color/text/primary at (17,17) — 1px border + 16px pad
 *   schedule, equipment 14/20 DM Sans Regular color/text/secondary
 *   price row 324x32: rate 24/32 Manrope Bold color/text/primary, distance 12/16 DM Sans Medium
 *     color/text/secondary pushed to the right edge
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         radius-lg, spacing-12, spacing-16, text-heading-20, text-body-14, text-rate-24, text-label-12
 */
export function RouteSummaryWeb({
  route = 'Lille → Brussels',
  schedule = '30 Sep · pickup 14:00–15:00',
  equipment = 'Curtainsider · 12.4 t · 18 pallets',
  rate = '360 €',
  distance = '111 km loaded',
}: {
  route?: string;
  schedule?: string;
  equipment?: string;
  rate?: string;
  distance?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-[var(--spacing-12)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <span className="text-heading-20 text-[var(--color-text-primary)]">{route}</span>
      <span className="text-body-14 text-[var(--color-text-secondary)]">{schedule}</span>
      <span className="text-body-14 text-[var(--color-text-secondary)]">{equipment}</span>
      <span className="flex h-[32px] items-center justify-between gap-[var(--spacing-12)]">
        <span className="text-rate-24 text-[var(--color-text-primary)]">{rate}</span>
        <span className="text-label-12 text-[var(--color-text-secondary)]">{distance}</span>
      </span>
    </div>
  );
}
