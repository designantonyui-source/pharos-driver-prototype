import { Icon } from './Icon';

/**
 * figma: 2021:2666 · Pharos/App/Day item — Type=Trip (2021:2663) · Type=Decision (2021:2664) ·
 *        Type=Free (2021:2665)
 * props: type, time, title, second, third, window, tripTone, thirdTone
 *
 *   row HORIZONTAL gap 12, counterAxis MIN (the time sits at the top), width FIXED 370
 *     Time   68x16 fixed box, DM Sans Regular 12/16 color/text/primary. The 68px box is why the
 *            two Free instances wrap it ("After\n19:00" -> 32 tall).
 *     Card   290 wide, VERTICAL gap 4 pad 12, radius 12, hug height.
 *
 *   The card's chrome is NOT the same in the set and in the instances (traps 16/17):
 *
 *   type      component set                                  the 8 screen instances
 *   Trip      #ffffff + 1px #8093a0 solid,   290x86         #ebf3f7 + 1.5px #225d74 solid, 290x87
 *   Decision  #ffffff + 1px #8093a0 solid,   290x72         (both instances are hidden, 290x70)
 *   Free      #ffffff + 1.5px #225d74 dashed (dash 6/6), 290x87   same, dash 6/4
 *
 *   All screen instances live on `07 · Trip` → day-active / day-assigned. The Trip instance look is
 *   the one the app actually shows, so it is the default here (`tripTone="accent"`); the component
 *   set's own Trip chrome is `tripTone="plain"`.
 *
 *   Heights with box-border + border + pad 12 + gap 4:
 *     Trip/Free  1.5 + 12 + 20 + 4 + 16 + 4 + 16 + 12 + 1.5 = 87  (set Trip, 1px, is 86)
 *     Decision   1   + 12 + 20 + 4 + 22 + 12 + 1           = 72
 *   Decision's second row is 22 tall: the 12/16 line centred plus the 22-tall window pill
 *   (pad 3/8, radius 8, fill color/status/warning-bg, 12x12 Clock + "by 11:00" both #855300).
 *
 *   The dashed Free ring: Figma exports dash 6/6, CSS `border-dashed` uses the browser's own pattern
 *   (Chrome: 3x the border width). CSS has no dash-length property for borders, so the exact dash is
 *   the one number here that cannot be reproduced without an SVG ring.
 *
 *   Bound variables (resolved through the variables API), all present in tokens.json:
 *     Trip instance card   fill color/status/info-bg · stroke color/border/brand
 *     Free instance card   fill color/bg/surface     · stroke color/border/brand
 *     Decision window pill fill day-item/decision/bg = ALIAS color/status/warning-bg
 *     every text layer     day-item/text-primary     = ALIAS color/text/primary
 *   The Free instances paint their third line #225d74 = color/action/text, which the set keeps at
 *   color/text/primary — hence the `thirdTone` prop.
 *
 * tokens: color-bg-surface, color-border-strong, color-border-brand, color-status-info-bg,
 *         color-status-warning-bg, color-status-warning-text, color-text-primary, color-action-text,
 *         radius-md, radius-sm, spacing-4, spacing-8, spacing-12, card-w, text-label-14,
 *         text-caption-12
 * TODO(token): spacing/12.5 (or a ring-width token) for the accent padding. The card width 290, the
 *              time box 68, the Decision row's 22px height and the 12px clock are plain geometry with
 *              no token, the same way 72/144/64/20/40 are literals in PORT-LOG §4.6.
 * TODO(deviation): the accent ring. Figma draws a 1.5px INSIDE stroke; Chrome floors every
 *              `border-width` to a whole CSS px — measured `borderTopWidth: 1px` at dpr 1, 2 and 3,
 *              and the card laid out 86 tall instead of 87. The ring is therefore declared 1px and
 *              the missing 0.5px rides on the padding (12.5), so the card is 290x87 and its content
 *              starts 13.5px in, exactly as in Figma; only the ring's thickness is 1px, not 1.5.
 * TODO(deviation): the dashed border pattern. Figma exports dash 6/6 (the four Free instances carry
 *              a stale 6/4). CSS has no dash-length property for `border`, and a 1px border in Chrome
 *              dashes at 3/3. An exact ring needs an SVG overlay, which cannot follow the card's
 *              hug height.
 */
export type DayItemType = 'trip' | 'decision' | 'free';

/** The Trip card as the screens draw it (accent) or as the component set defines it (plain). */
export type DayItemTripTone = 'accent' | 'plain';

/** Ring + fill + padding of the card. See the ring and dash deviations in the header. */
const CARD_TONE: Record<Exclude<DayItemType, 'trip'>, string> = {
  decision:
    'border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)]',
  free: 'border border-dashed border-[var(--color-border-brand)] bg-[var(--color-bg-surface)] p-[12.5px]',
};

const TRIP_TONE: Record<DayItemTripTone, string> = {
  accent: 'border border-[var(--color-border-brand)] bg-[var(--color-status-info-bg)] p-[12.5px]',
  plain: 'border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)]',
};

/** `Decision window` pill — 22 tall, radius 8, pad x8, gap 4, fill color/status/warning-bg. */
function DecisionWindow({ label }: { label: string }) {
  return (
    <span className="flex h-[22px] shrink-0 items-center gap-[var(--spacing-4)] rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] px-[var(--spacing-8)] text-caption-12 text-[var(--color-status-warning-text)]">
      <Icon name="clock" size={12} />
      <span>{label}</span>
    </span>
  );
}

export function DayItem({
  type = 'trip',
  time,
  title,
  second,
  third,
  window,
  tripTone = 'accent',
  thirdTone = 'default',
}: {
  /** Figma variant property `Type`. */
  type?: DayItemType;
  /** Figma text property `Time#2030:0` — the 68px column on the left. */
  time: string;
  /** Figma text property `Title#2030:4`. */
  title: string;
  /** Figma text property `Second line#2030:8`. */
  second: string;
  /** Figma text property `Third line#2030:12` — Trip and Free only. */
  third?: string;
  /** Figma text property `Decision window#2030:16` — Decision only. */
  window?: string;
  /** Trip chrome: `accent` = the screen instances, `plain` = the component set's own variant. */
  tripTone?: DayItemTripTone;
  /** Free instances paint the third line as a link (color/action/text); the set keeps it primary. */
  thirdTone?: 'default' | 'link';
}) {
  const cardTone = type === 'trip' ? TRIP_TONE[tripTone] : CARD_TONE[type];

  return (
    <div className="flex w-[var(--card-w)] items-start gap-[var(--spacing-12)]">
      <div className="w-[68px] shrink-0 whitespace-pre-line text-caption-12 text-[var(--color-text-primary)]">
        {time}
      </div>

      <div className={`box-border flex w-[290px] flex-col gap-[var(--spacing-4)] rounded-[var(--radius-md)] ${cardTone}`}>
        <span className="text-label-14 text-[var(--color-text-primary)]">{title}</span>

        {type === 'decision' ? (
          <div className="flex h-[22px] w-full shrink-0 items-center gap-[var(--spacing-8)]">
            <span className="min-w-0 flex-1 text-caption-12 text-[var(--color-text-primary)]">{second}</span>
            {window && <DecisionWindow label={window} />}
          </div>
        ) : (
          <>
            <span className="text-caption-12 text-[var(--color-text-primary)]">{second}</span>
            {third && (
              <span
                className={`text-caption-12 ${
                  thirdTone === 'link' ? 'text-[var(--color-action-text)]' : 'text-[var(--color-text-primary)]'
                }`}
              >
                {third}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
