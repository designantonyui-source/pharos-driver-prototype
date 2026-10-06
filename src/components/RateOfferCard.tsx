/**
 * figma: 384:368 · Pharos/Rate offer card — State=Proposed `384:356` · State=Counter `384:360`
 *        · State=Accepted `384:364` (each 280x106)
 *   box: VERTICAL, gap 8, pad 12/12/12/12, radius 12, 1px INSIDE stroke
 *     Proposed  fill color/status/info-bg     + stroke color/border/brand
 *     Counter   fill color/bg/surface         + stroke color/border/strong
 *     Accepted  fill color/status/success-bg  + stroke color/status/success-text
 *   rows (all FIXED width 254 = 280 - 24 - 2, auto height):
 *     Title  Label/12   DM Sans Medium 12/16  color/text/secondary
 *     Rate   Rate/24    Manrope Bold   24/32  color/text/primary
 *     Note   Caption/12 DM Sans Regular 12/16 color/text/secondary
 *   vertical check: 12 + 16 + 8 + 32 + 8 + 16 + 12 = 104 content + 2 border = 106 == Figma height
 * variants: State=Proposed / Counter / Accepted (skins only — the three variants carry the same
 *           layer text, so the state is expressed by the fill and stroke alone)
 * props: state, title, rate, note
 * tokens: color-status-info-bg, color-border-brand, color-bg-surface, color-border-strong,
 *         color-status-success-bg, color-status-success-text, color-text-primary,
 *         color-text-secondary, radius-md, spacing-8, spacing-12, text-label-12, text-rate-24,
 *         text-caption-12
 *
 * NOTE — a different component with a similar name: `Pharos/Chat/Rate offer` `2189:8453`
 *   (350x420 on page "13 — Components · Mobile") is the chat-scoped set and is NOT this one.
 *   All 8 instances of `384:368` sit on page 21 in the frames "Driver rate offer" and
 *   "Customer counteroffer".
 * NOTE — Figma component-property defaults are Russian ("Предложение ставки",
 *   "Условия обсуждаются"); the 8 instances override them with English strings
 *   (Title "Your offer" / "Counter-offer" / "Rate agreed", Note "Sent to NordCargo · 10:34" …).
 *   AGENTS rule 5 keeps the defaults below English — they are the Figma defaults translated.
 * NOTE — Figma fixes the card at 280 wide (counterAxisSizingMode FIXED) and all 8 instances are
 *   280x106. The component itself is fluid (`w-full`) like the other cards in this repo, so its
 *   width comes from the parent frame; the story pins that frame at 280 to match Figma.
 * TODO(token): the 280 width has no token (closest is `--card-w` = 370, Pharos/App/Offer).
 */
export type RateOfferState = 'proposed' | 'counter' | 'accepted';

/** Fill + stroke per variant; classes stay literal so Tailwind can see them (PORT-LOG trap 5). */
const SKIN: Record<RateOfferState, string> = {
  proposed: 'border-[var(--color-border-brand)] bg-[var(--color-status-info-bg)]',
  counter: 'border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]',
  accepted: 'border-[var(--color-status-success-text)] bg-[var(--color-status-success-bg)]',
};

export function RateOfferCard({
  state = 'proposed',
  title = 'Rate offer',
  rate = '360 €',
  note = 'Terms are negotiable',
}: {
  state?: RateOfferState;
  title?: string;
  rate?: string;
  note?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col gap-[var(--spacing-8)] rounded-[var(--radius-md)] border p-[var(--spacing-12)] ${SKIN[state]}`}
    >
      {/* own nodes, like the Figma layers Title / Rate / Note (PORT-LOG trap 13) */}
      <span className="text-label-12 text-[var(--color-text-secondary)]">{title}</span>
      <span className="text-rate-24 text-[var(--color-text-primary)]">{rate}</span>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">{note}</span>
    </div>
  );
}
