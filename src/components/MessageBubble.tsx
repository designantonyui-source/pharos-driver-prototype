/**
 * figma: 384:355 · Pharos/Message bubble — Direction=Incoming `384:347` · Direction=Outgoing `384:351`
 * props: direction, skin, sender, message, time
 * tokens: color-bg-subtle, color-border-default, color-status-info-bg, color-border-brand,
 *         color-bg-surface, color-chat-bubble-outgoing-bg, color-text-primary, color-text-secondary,
 *         radius-md, radius-lg, spacing-6, spacing-8, spacing-10, spacing-12, spacing-14,
 *         text-label-12, text-body-14, text-caption-12
 *
 *   variant box (both directions): VERTICAL, gap 8, pad 12, radius 12, 1px INSIDE stroke, 280 wide
 *     Incoming  fill color/bg/subtle `#eff2f5`   + stroke color/border/default `#d7e0e6`
 *     Outgoing  fill color/status/info-bg `#ebf3f7` + stroke color/border/brand `#225d74`
 *   rows (FIXED 254 = 280 - 2*12 - 2*1, auto height):
 *     Sender   `Pharos/Label/12`   DM Sans Medium  12/16  color/text/secondary `#586d79`
 *     Message  `Pharos/Body/14`    DM Sans Regular 14/20  color/text/primary   `#172a35`
 *     Time     `Pharos/Caption/12` DM Sans Regular 12/16  color/text/secondary `#586d79`
 *   vertical check: 12 + 16 + 8 + 20 + 8 + 16 + 12 = 92 content + 2 border = 94 == Figma
 *
 * `skin="plain"` — the shape the iOS app actually ships. All 15 instances on page 30
 * (`2022:2950` "04 · Load details and negotiation") override the variant hard, so the component
 * set alone would port a bubble the app never renders (PORT-LOG trap 16: the screen wins, and the
 * divergence is closed by a prop, as `island` was for the status bar):
 *   width 294 (not 280) · radius 16 (not 12) · pad 12/14/10/14 (not 12) · gap 6 (not 8)
 *   stroke removed · the `Sender` row deleted from the instance (measured: the instances carry
 *   only the `Message` and `Time` text layers)
 *   Incoming fill color/bg/surface `#ffffff` · Outgoing fill `#def5f0`
 *   vertical check: 12 + 40 + 6 + 16 + 10 = 84, and 12 + 20 + 6 + 16 + 10 = 64 for a one-line
 *   message — matches the 294x84 / 294x104 instances
 *
 * NOTE — the width is NOT in the component: Figma pins the set at 280 and the page-30 instances
 *   override it to 294, while the desktop chat on page 21 keeps 280. Like the other cards in this
 *   repo the root is fluid (`w-full`) and the parent frame decides; the stories pin 280 / 294.
 *   the 14px of the plain skin is --spacing-14.
 * TODO(token): bubble widths 280 (set) and 294 (app) — closest is --card-w (370).
 */
export type MessageDirection = 'incoming' | 'outgoing';
/** `tinted` = the component set `384:355`; `plain` = the skin every page-30 instance overrides to. */
export type MessageSkin = 'tinted' | 'plain';

/** Tailwind only generates classes it can read literally, so no interpolation inside `[...]`. */
const BOX: Record<MessageSkin, string> = {
  tinted: 'gap-[var(--spacing-8)] rounded-[var(--radius-md)] border p-[var(--spacing-12)]',
  plain:
    'gap-[var(--spacing-6)] rounded-[var(--radius-lg)] px-[var(--spacing-14)] pt-[var(--spacing-12)] pb-[var(--spacing-10)]',
};

const SKIN: Record<MessageSkin, Record<MessageDirection, string>> = {
  tinted: {
    incoming: 'border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]',
    outgoing: 'border-[var(--color-border-brand)] bg-[var(--color-status-info-bg)]',
  },
  plain: {
    incoming: 'bg-[var(--color-bg-surface)]',
    outgoing: 'bg-[var(--color-chat-bubble-outgoing-bg)]',
  },
};

export function MessageBubble({
  direction = 'incoming',
  skin = 'tinted',
  sender = 'Participant',
  message = 'Message text',
  time = '10:32',
}: {
  direction?: MessageDirection;
  skin?: MessageSkin;
  /** pass null to drop the `Sender` row — the page-30 instances delete it */
  sender?: string | null;
  message?: string;
  time?: string;
}) {
  return (
    <div className={`flex w-full flex-col ${BOX[skin]} ${SKIN[skin][direction]}`}>
      {/* own nodes, like the Figma layers Sender / Message / Time (PORT-LOG trap 13) */}
      {sender != null && (
        <span className="text-label-12 text-[var(--color-text-secondary)]">{sender}</span>
      )}
      <span className="text-body-14 text-[var(--color-text-primary)]">{message}</span>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">{time}</span>
    </div>
  );
}
