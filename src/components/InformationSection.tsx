import type { ReactNode } from 'react';
import { StatusPill, type Tone } from './StatusPill';
import { Flag } from './Flag';

/**
 * figma: 2576:2265 · Pharos/Information section — 4 variants (the whole set):
 *   Layout=Wide    Type=Information State=Default        `140:49`      720x122
 *   Layout=Compact Type=Payment     State=Pending        `2466:14783`  370x142
 *   Layout=Compact Type=Payment     State=Early available`2466:14795`  370x142
 *   Layout=Compact Type=Payment     State=Received       `2466:14807`  370x142
 *
 *   Every variant: VERTICAL, pad 16, gap 8, fill color/bg/surface, 1px INSIDE stroke
 *   color/border/default, radius 12. Width is `w-full` — the parent sets it: 370 in the app,
 *   720/460/356/352 for the wide web/detail columns.
 *
 *   Rows (the children of the VERTICAL stack, top to bottom):
 *     Title row  = 28 tall, HORIZONTAL gap 8, counterAxis CENTER, clipsContent.
 *                  [Title (Heading/20, Manrope SemiBold 20/28, color/text/primary,
 *                          layoutGrow 1 = fills the row)] [Country flag 24x24 (visible=false
 *                          by default)] [Action slot — a Pharos/Button link instance, h48,
 *                          FIXED counter axis so the 48-tall button makes the 28-tall row
 *                          overflow 10px up and down exactly as in Figma]
 *     Lead row   = [Status chip (Pharos/Status instance, hug, h28, pad 6/12, radius 999)]
 *                  OR [Key fact (Body/16 DM Sans Regular 16/24, color/text/primary)].
 *                  The chip and the key fact are mutually exclusive in the same slot: in
 *                  `2466:14783` the 20-tall Body sits at y=1795, i.e. 8px under a 28-tall
 *                  lead at y=1763 — the key fact is hidden when the chip is shown.
 *     Body       = Body/14 DM Sans Regular 14/20, color/text/secondary. Optional: when it is
 *                  absent the card is 20px shorter — the real page-30 instances are 370x142 with
 *                  a one-line body, 370x162 with two lines and 370x110 with no body at all.
 *
 *   Measured in Storybook (chrome), card box first, then child boxes relative to the card:
 *     370x122  Title x17 y17 336x28 · Key fact x17 y53 336x24 · Body x17 y85 336x20
 *     370x146  Title · chip x17 y53 138.05x28 (Figma 151 — DM Sans width, see PORT-LOG trap 14)
 *              · Body x17 y89 336x40
 *     720x122  identical at the Wide width (686-wide rows)
 *   Figma gives the same numbers (Figma's 1px INSIDE stroke puts its children at x=17 too; the
 *   CSS border takes that pixel from the box, so 1px of horizontal offset is not representable).
 *
 *   `Key fact` is a Figma TEXT property whose default is the placeholder string "Key fact" —
 *   several real instances still carry it verbatim, so it is reproduced in the stories rather
 *   than "fixed" here.
 *
 *   Show status / Show action are Figma BOOLEAN properties, not variants, so they get props
 *   here, not separate stories.
 *
 * DEVIATION (measured, see the port log). The three Layout=Compact variants are 142 tall, but a
 * temporary instance created from `2466:14783` shows their content only reaches y=110 of 142:
 * Title y 16..44, Key fact y 53..77, Body y 85..105 (padding 16, gap 8 both, absolutely no
 * hidden layer). The 20 remaining pixels are dead space at the bottom, i.e. the variant is
 * counterAxisSizingMode=FIXED and was never re-hugged after the set's width was resized from 720
 * to 370. No Compact/Payment instance exists on page 21 or page 30, and every card that IS placed
 * on a driver screen is an auto-height Layout=Wide instance whose geometry (pad 16 / gap 8) this
 * component reproduces exactly. The component therefore hugs its content; the 142-tall variant is
 * reproduced by the `CompactPaymentPendingFixed142` story, which pins the height.
 *
 * props: title, children, fact, status, country, action
 *   title    — text slot (Figma `Title#2576:0`); it carries layoutGrow 1, so it takes whatever
 *              width is left after the flag (24 + 8) and the action (measured 56.56 + 8 for the
 *              12-char "Call" Button link) — Figma's own "Pickup contact" + Call instance has a
 *              271-wide title box, and so does this component
 *   children — slot for the Body line(s) (Figma `Body#2576:1`)
 *   fact     — convenience for a plain-text Body/16 key fact (Figma `Key fact#2576:2`)
 *   status   — Figma `Show status#2576:5`; { label, tone } renders the Status chip in place of
 *              the key fact (the design has no card that shows both)
 *   country  — Figma `Show country flag#2576:3` + `Country flag#2576:4` (INSTANCE_SWAP, 24x24)
 *   action   — Figma `Show action#2576:6`: a slot for the trailing Button link, vertically
 *              centred in the 28-tall title row
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         radius-md, text-heading-20, text-body-16, text-body-14 (the chip comes from StatusPill,
 *         the flag from Flag). No new token needed for this component.
 * TODO(token): none.
 */
export type InformationLayout = 'wide' | 'compact';
export type InformationType = 'information' | 'payment';

type Props = {
  /** Slot for the Figma `Title` text layer. */
  title: string;
  /** Slot for the Figma `Body` text layer — becomes the Body/14 line(s). */
  children?: ReactNode;
  /** Figma `Key fact` — a plain string renders as Body/16 in the lead row. */
  fact?: ReactNode;
  /** Figma `Show status` + the `Pharos/Status` instance. Replaces `fact` in the lead row. */
  status?: { label: string; tone?: Tone };
  /** Figma `Show country flag` — a 24x24 flag after the title. */
  country?: string;
  /** Figma `Show action` — the `Pharos/Button link` instance, centred in the title row. */
  action?: ReactNode;
  /**
   * Figma variants. The two axes do not change geometry today: Wide differs from Compact only
   * in the set's canvas width (720 vs 370) and Information/Payment only in the default copy
   * (Title "Trip information"/"Payment", Body "Order terms, contacts or documents."/
   * "Agreed term: within 7 days"). State exists only for Type=Payment and only changes the copy
   * of the Key fact + Body. They are accepted and exposed as data attributes so the four Figma
   * variants map 1:1 onto four stories.
   */
  layout?: InformationLayout;
  type?: InformationType;
  state?: 'default' | 'pending' | 'early-available' | 'received';
};

export function InformationSection({
  title,
  children,
  fact,
  status,
  country,
  action,
  layout = 'wide',
  type = 'information',
  state = 'default',
}: Props) {
  return (
    <div
      data-layout={layout}
      data-type={type}
      data-state={state}
      className="flex w-full flex-col gap-[8px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px]"
    >
      {/* "Title and country" — 28 tall, HORIZONTAL gap 8, CENTER, clipsContent */}
      <div className="flex h-[28px] shrink-0 items-center gap-[8px] overflow-hidden">
        <span className="min-w-0 grow text-heading-20 text-[var(--color-text-primary)]">{title}</span>
        {country && <Flag country={country} size={24} />}
        {action && (
          // Figma: the Button link has a FIXED counter axis, so its 48px height does not stretch
          // the 28px row — it overflows 10px above and below and the card keeps its height.
          <div className="shrink-0">{action}</div>
        )}
      </div>

      {/* Lead row — Status chip or Key fact, never both */}
      {status ? (
        <div className="flex shrink-0">
          <StatusPill label={status.label} tone={status.tone ?? 'neutral'} dot={false} />
        </div>
      ) : (
        fact != null && (
          <span className="shrink-0 text-body-16 text-[var(--color-text-primary)]">{fact}</span>
        )
      )}

      {/* Body — Body/14, secondary; 8px under the lead row from the stack gap */}
      {children != null && (
        <span className="shrink-0 text-body-14 text-[var(--color-text-secondary)]">{children}</span>
      )}
    </div>
  );
}
