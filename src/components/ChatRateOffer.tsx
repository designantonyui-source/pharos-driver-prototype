import { Button, ButtonLink } from './Button';

/**
 * figma: 2189:8453 · Pharos/Chat/Rate offer — State=Pending `2188:8107` (302x216) ·
 *        State=Accepted `2188:8129` (302x132)
 * props: state, title, rate, sender, acceptedNote, acceptLabel, counterLabel, onAccept, onCounter
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-status-success-text,
 *         radius-lg, radius-sm, spacing-8, text-caption-12, text-heading-20, text-label-14
 *
 *   card VERTICAL, gap 8, pad 14, radius 16, fill color/bg/surface `#ffffff`
 *   NO stroke and no effect on either variant
 *   rows (all FIXED 266 in Figma — see the deviation note below):
 *     title    `Pharos/Caption/12`  DM Sans Regular 12/16  color/text/secondary `#586d79`
 *     rate     `Pharos/Heading/20`  Manrope SemiBold 20/28 color/text/primary   `#172a35`
 *     sender   `Pharos/Caption/12`  DM Sans Regular 12/16  color/text/secondary `#586d79`
 *     Pending only:
 *       `Pharos/Button` 266x48 Appearance=Primary State=Default, label "Accept €360"
 *       `Pharos/Button link` 266x48 Size=Mobile State=Default — the instance is FIXED 266 with
 *         primaryAxisAlignItems CENTER and the label stays UNDERLINE (`168:89` is UNDERLINE and the
 *         instance does not override it) → `ButtonLink full underline`
 *     Accepted only:
 *       `Pharos/Label/14` DM Sans Medium 14/20 color/status/success-text `#216547`
 *   vertical checks:
 *     Pending  14 + 16 + 8 + 28 + 8 + 16 + 8 + 48 + 8 + 48 + 14 = 216 == Figma
 *     Accepted 14 + 16 + 8 + 28 + 8 + 16 + 8 + 20 + 14 = 132 == Figma
 *
 *   The set frame is 350x420 with pad 24 / gap 24 — that is only the canvas around the two
 *   variants (302 + 2*24 = 350; 24 + 216 + 24 + 132 + 24 = 420). Each variant is 302 wide.
 *
 * DEVIATION — Figma draws the card at 302 but its children at 266, i.e. 274 - 266 = 8px of dead
 *   space on the right (left pad 14, right gutter 22). 266 is what a 294-wide card would give
 *   (294 - 2*14), and 294 is exactly the width of the page-30 Message bubble, so the children look
 *   like a leftover from a narrower card. The card keeps Figma's declared padding (14) and its
 *   children fill the content box, so at a 302 parent the children measure 274, not 266 — the same
 *   call PORT-LOG §4.6 made for the stretched Bottom sheet frames. Nothing else differs.
 *
 * NOTE — `Props` defaults are Russian in Figma for the Accepted variant's note plus the two titles
 *   (`Ставка согласована`, `Принято · 10:35`, `Title` = "Rate unchanged"); AGENTS rule 5 keeps them
 *   English here. The 3 instances override `€360` for the component's `360 €`.
 * NOTE — a different component with a similar name: `Pharos/Rate offer card` `384:368` (280x106,
 *   3 variants Proposed/Counter/Accepted, tinted fills with a stroke, no actions) is already ported
 *   as `RateOfferCard.tsx`. This one is the chat-scoped, white, action-carrying block. Not merged.
 *
 * The 14px pad is --spacing-14; TODO(token): the 302 width (closest --card-w 370).
 */
export type ChatRateOfferState = 'pending' | 'accepted';

export function ChatRateOffer({
  state = 'pending',
  title,
  rate = '360 €',
  sender = 'NordCargo · 10:34',
  acceptedNote = 'Accepted · 10:35',
  acceptLabel = 'Accept €360',
  counterLabel = 'Offer a different rate',
  onAccept,
  onCounter,
}: {
  state?: ChatRateOfferState;
  /** defaults per variant: "Rate unchanged" (Pending) / "Rate agreed" (Accepted) */
  title?: string;
  rate?: string;
  sender?: string;
  acceptedNote?: string;
  acceptLabel?: string;
  counterLabel?: string;
  onAccept?: () => void;
  onCounter?: () => void;
}) {
  const pending = state === 'pending';

  return (
    <div className="flex w-full flex-col gap-[var(--spacing-8)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[var(--spacing-14)]">
      {/* own nodes, like the Figma layers Title / Rate / Sender and time (PORT-LOG trap 13) */}
      <span className="text-caption-12 text-[var(--color-text-secondary)]">
        {title ?? (pending ? 'Rate unchanged' : 'Rate agreed')}
      </span>
      <span className="text-heading-20 text-[var(--color-text-primary)]">{rate}</span>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">{sender}</span>
      {pending ? (
        <>
          <Button label={acceptLabel} onClick={onAccept} />
          <ButtonLink label={counterLabel} underline full onClick={onCounter} />
        </>
      ) : (
        <span className="text-label-14 text-[var(--color-status-success-text)]">{acceptedNote}</span>
      )}
    </div>
  );
}
