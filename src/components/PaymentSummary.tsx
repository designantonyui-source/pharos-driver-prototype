import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: 412:389 · Pharos/Payment summary — State=Pending `412:347` · State=Early available
 *        `412:361` · State=Received `412:375` (each 736x162)
 *   box: VERTICAL, gap 12, pad 16, radius 12, fill color/bg/surface,
 *        1px INSIDE stroke color/border/default
 *   row 1 "Heading and status" 28 tall, HORIZONTAL gap 12, SPACE_BETWEEN:
 *     Title Text/Heading/20 (Manrope SemiBold 20/28, color/text/primary) = "Payment"
 *     Status = an instance of Pharos/Status (11:148) -> StatusPill:
 *       Pending         Tone=Neutral "Expected"
 *       Early available Tone=Info    "Early payment available"
 *       Received        Tone=Success "Received"
 *   row 2 "Amount and terms" 56 tall, HORIZONTAL gap 16, counterAxis MIN, both blocks VERTICAL gap 8:
 *     Amount  label Label/12 (color/text/secondary) + value Rate/24 Manrope Bold
 *             (color/text/primary) — the label is "To receive" in Pending and
 *             "Early available", and "Received" in State=Received
 *     Terms   label Label/12 (color/text/secondary) + value Body/14
 *             (color/text/primary) = the `Terms` property ("Paid within 7 days")
 *   row 3 "State explanation" (Body/14, color/text/secondary), full width, auto height
 *   vertical check: 16 + 28 + 12 + 56 + 12 + 20 + 16 = 160 content + 2 border = 162 == Figma height
 *   (all three variants are 162 tall — every explanation is one line at 702 wide)
 * variants: State=Pending / Early available / Received
 * props: state, amount, terms, amountLabel, explanation
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-status-{neutral,info,success}-bg / -text, radius-md, spacing-4, spacing-8,
 *         spacing-12, spacing-16, text-heading-20, text-rate-24, text-body-14, text-label-12
 *
 * NOTE — the Figma set description says this component belongs to a duplicate "Payment summary"
 *   family and "Overlaps with Pharos/App/Payment summary". A scan of every page found NO second
 *   component or component set with that name (only the three instances of `412:389` on page 21),
 *   so there is nothing to merge with in the file itself. Left to the parent to confirm.
 * NOTE — Figma fixes the card at 736 wide (counterAxisSizingMode FIXED) and all 3 instances are
 *   736x162 in the page-21 frame "Route and trip conditions". The component is fluid (`w-full`),
 *   so its width comes from the parent frame; the story pins that frame at 736 to match Figma.
 *   The explanation is a single text node, so at narrower widths it wraps and the card grows.
 * TODO(token): the 736 width has no token (closest is `--card-w` = 370, Pharos/App/Offer).
 */
export type PaymentState = 'pending' | 'early' | 'received';

/** Figma variant name -> the Figma `State` property values. */
const STATUS: Record<PaymentState, { tone: Tone; label: string }> = {
  pending: { tone: 'neutral', label: 'Expected' },
  early: { tone: 'info', label: 'Early payment available' },
  received: { tone: 'success', label: 'Received' },
};

/** `Amount label` per variant — State=Received relabels it to "Received". */
const AMOUNT_LABEL: Record<PaymentState, string> = {
  pending: 'To receive',
  early: 'To receive',
  received: 'Received',
};

/** `State explanation` per variant, verbatim from the Figma layers. */
const EXPLANATION: Record<PaymentState, string> = {
  pending: 'Payment is expected under the order terms. Term — 7 days.',
  early: 'You can request payment earlier. Check the terms and fee before requesting.',
  received: 'Payment for the order has been received.',
};

export function PaymentSummary({
  state = 'pending',
  amount = '360 €',
  terms = 'Paid within 7 days',
  amountLabel,
  explanation,
}: {
  state?: PaymentState;
  amount?: string;
  terms?: string;
  /** Figma `Amount label`; defaults to the label of the current variant. */
  amountLabel?: string;
  /** Figma `State explanation`; defaults to the copy of the current variant. */
  explanation?: string;
}) {
  const status = STATUS[state];

  return (
    <div className="flex w-full flex-col gap-[var(--spacing-12)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      {/* Heading and status */}
      <div className="flex w-full items-center justify-between gap-[var(--spacing-12)]">
        <span className="text-heading-20 text-[var(--color-text-primary)]">Payment</span>
        <StatusPill label={status.label} tone={status.tone} />
      </div>

      {/* Amount and terms */}
      <div className="flex w-full items-start gap-[var(--spacing-16)]">
        <span className="flex flex-col gap-[var(--spacing-8)]">
          <span className="text-label-12 text-[var(--color-text-secondary)]">{amountLabel ?? AMOUNT_LABEL[state]}</span>
          <span className="text-rate-24 text-[var(--color-text-primary)]">{amount}</span>
        </span>
        <span className="flex flex-col gap-[var(--spacing-8)]">
          <span className="text-label-12 text-[var(--color-text-secondary)]">Payment terms</span>
          <span className="text-body-14 text-[var(--color-text-primary)]">{terms}</span>
        </span>
      </div>

      {/* State explanation */}
      <span className="text-body-14 text-[var(--color-text-secondary)]">{explanation ?? EXPLANATION[state]}</span>
    </div>
  );
}
