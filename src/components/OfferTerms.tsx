import { Button } from './Button';

/**
 * figma: 693:1013 · Pharos/App/Offer terms (COMPONENT, 370x256) — **hidden in the Figma file**,
 *        and all six instances (2689:15054, 2689:15132, 2004:2097, …) are hidden too. Figma's PNG
 *        export of it is 1x1, so there is NO visual reference for this component: everything below
 *        is taken from the node tree, not from a rendering. TEXT properties: Rate, Rate per km,
 *        Cargo, Payment, Customer, Customer verification; the button label is "Chat".
 * props: rate, ratePerKm, cargo, payment, customer, verification, chatLabel
 *
 *   root VERTICAL pad 16, gap 12, r16 (radius/lg), fill #ffffff, 1px INSIDE #d7e0e6.
 *   Box border-box: 1+16 + 80 + 12 + 1 + 12 + 44 + 12 + 1 + 12 + 48 + 16+1 = 256.
 *
 *   Rate and payment 336x80, VERTICAL gap 4
 *     "Rate"    DM Sans Medium 12/16 (Label/12) #586d79
 *     Rate row 336x36, SPACE_BETWEEN/CENTER
 *       €360    Manrope Bold 28/36 (Metric/28) #172a35
 *       /km     DM Sans Regular 14/20 #586d79
 *     Payment   DM Sans Regular 14/20 #586d79
 *   Section divider 336x1 #d7e0e6
 *   Cargo 336x44, VERTICAL gap 4
 *     "Cargo"   DM Sans Medium 12/16 #586d79
 *     fact      DM Sans Regular 16/24 (Body/16) #172a35
 *   Section divider 336x1 #d7e0e6
 *   Customer and chat 336x48, HORIZONTAL gap 8, MIN/CENTER
 *     NordCargo 246x40, VERTICAL — name DM Sans Regular 16/24 #172a35,
 *                "Verified customer" DM Sans Regular 12/16 #216547 (color/status/success-text)
 *     Chat      82x48 — an instance of `Pharos/Button` (Appearance=Secondary, Size=Mobile,
 *               State=Default, label "Chat"). Its width is FIXED at 82 while the label is only
 *               ~34 wide, so the Figma instance is 16px wider than the button's natural hug
 *               (34 + 32 padding). Rendered here as a fixed 82px slot around the real Button, so
 *               the label, colours, radius and hover/pressed states stay the Button's.
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-status-success-text, radius-lg, text-metric-28, text-label-12, text-body-14,
 *         text-body-16, text-caption-12
 * TODO(token): 82 (the Chat button's Figma width) and 36 (the rate row) are Figma geometry, not
 *   spacing tokens; inlined the same way as elsewhere in the repo.
 */
export function OfferTerms({
  rate,
  ratePerKm,
  cargo,
  payment,
  customer,
  verification,
  chatLabel = 'Chat',
}: {
  rate: string;
  ratePerKm: string;
  cargo: string;
  payment: string;
  customer: string;
  verification: string;
  chatLabel?: string;
}) {
  return (
    <article className="flex w-full flex-col gap-[12px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px]">
      <div className="flex w-full flex-col gap-[4px]">
        <span className="text-label-12 text-[var(--color-text-secondary)]">Rate</span>
        <div className="flex h-[36px] w-full items-center justify-between">
          <span className="text-metric-28 text-[var(--color-text-primary)]">{rate}</span>
          <span className="text-body-14 text-[var(--color-text-secondary)]">{ratePerKm}</span>
        </div>
        <span className="text-body-14 text-[var(--color-text-secondary)]">{payment}</span>
      </div>

      <span className="h-[1px] w-full bg-[var(--color-border-default)]" aria-hidden />

      <div className="flex w-full flex-col gap-[4px]">
        <span className="text-label-12 text-[var(--color-text-secondary)]">Cargo</span>
        <span className="text-body-16 text-[var(--color-text-primary)]">{cargo}</span>
      </div>

      <span className="h-[1px] w-full bg-[var(--color-border-default)]" aria-hidden />

      <div className="flex h-[48px] w-full items-center gap-[8px]">
        <div className="flex w-full flex-col">
          <span className="text-body-16 text-[var(--color-text-primary)]">{customer}</span>
          <span className="text-caption-12 text-[var(--color-status-success-text)]">{verification}</span>
        </div>
        <span className="block w-[82px] shrink-0">
          <Button label={chatLabel} appearance="secondary" size="mobile" />
        </span>
      </div>
    </article>
  );
}
