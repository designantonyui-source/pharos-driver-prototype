/**
 * figma: 2553:1238 · Pharos/App/Progress step — State=Done (2553:1225), State=Current (2553:1231),
 *        State=Next (2553:1237)
 * props: state, number, label, status   (Figma: variant "State", text "Number"/"Title"/"Status")
 *
 * One row of a step list. It is a component of its own in Figma and is shared by two components of
 * this port — `Pharos/App/Trip steps` (2728:26593) and `Pharos/App/Application progress` (734:426) —
 * so it lives in its own file instead of being copied into both (AGENTS.md rule 4).
 *
 *   row       HORIZONTAL, gap 12, counterAxis CENTER, primaryAxis FIXED (the parent sets the width:
 *             336 inside Trip steps, 338 inside Application progress, so `w-full` here)
 *   Frame     24x24, radius 999, HORIZONTAL centred; holds the step number 12/16 DM Sans Medium
 *   Title     14/20, FILL -> taken out of the 24 + 12 + 12 + status budget, exactly like Figma
 *   Status    12/16 DM Sans Medium, hug; the Figma master text is "Done"/"Current"/"Next"
 *
 *   state     Frame fill                    number                Title                       Status
 *   Done      color/status/success-bg       color/status/success-text  DM Sans Regular 14/20 text/primary   success-text
 *   Current   color/action/primary          color/text/inverse         DM Sans Medium  14/20 action/text    action/text
 *   Next      color/bg/subtle               color/text/secondary       DM Sans Regular 14/20 text/secondary  text/tertiary
 *
 * Height check: 24 == Figma in all three variants (label 20 and status 16 are centred in it).
 *
 * tokens: color-status-success-bg, color-status-success-text, color-action-primary, color-text-inverse,
 *         color-bg-subtle, color-text-secondary, color-text-primary, color-action-text,
 *         color-text-tertiary, radius-pill, spacing-12, spacing-24, text-label-12, text-label-14,
 *         text-body-14
 * TODO(token): none — every value above resolves to an existing token.
 */
import type { LiHTMLAttributes, ReactNode } from 'react';

export type ProgressState = 'done' | 'current' | 'next';

const FRAME: Record<ProgressState, string> = {
  done: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
  current: 'bg-[var(--color-action-primary)] text-[var(--color-text-inverse)]',
  next: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
};

/** Title: Regular for Done/Next, Medium for the Current step (Figma switches the text style). */
const TITLE: Record<ProgressState, string> = {
  done: 'text-body-14 text-[var(--color-text-primary)]',
  current: 'text-label-14 text-[var(--color-action-text)]',
  next: 'text-body-14 text-[var(--color-text-secondary)]',
};

const STATUS: Record<ProgressState, string> = {
  done: 'text-[var(--color-status-success-text)]',
  current: 'text-[var(--color-action-text)]',
  next: 'text-[var(--color-text-tertiary)]',
};

/** The master text of each variant; instances override it, e.g. Trip steps writes the step name. */
const MASTER_STATUS: Record<ProgressState, string> = { done: 'Done', current: 'Current', next: 'Next' };

export function ProgressStep({
  state,
  number,
  label,
  status,
  showConnector = false,
  lineTone = 'bg-[var(--color-border-default)]',
  ...liProps
}: {
  state: ProgressState;
  /** Figma text property `Number` — the 1-based position in the list. */
  number: ReactNode;
  /** Figma text property `Title` — what the step is called. */
  label: string;
  /** Figma text property `Status`. Defaults to the master text of the variant ("Done"/"Current"/"Next"). */
  status?: string;
  /** Vertical connector to the next row (stepper lists only). */
  showConnector?: boolean;
  /** Connector colour (token class). */
  lineTone?: string;
  /**
   * Extra props for the list item this component renders.
   *
   * The step IS the `<li>` — wrapping it in another `<li>` produces invalid
   * nesting (`<li> cannot contain a nested <li>` in the a11y tree), so callers
   * that own an `<ol>`/`<ul>` pass list-item attributes straight through.
   */
} & Omit<LiHTMLAttributes<HTMLLIElement>, 'children' | 'className'>) {
  return (
    <li
      {...liProps}
      className="relative flex w-full shrink-0 items-start gap-[var(--spacing-12)] pb-[var(--spacing-12)] last:pb-0"
    >
      {showConnector && (
        <span
          aria-hidden
          className={`absolute left-[11px] top-[var(--spacing-24)] h-[calc(100%-var(--spacing-24))] w-[2px] ${lineTone}`}
        />
      )}
      <span
        className={`relative z-[1] flex h-[var(--spacing-24)] w-[var(--spacing-24)] shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-label-12 ${FRAME[state]}`}
      >
        {number}
      </span>
      <span className="flex min-h-[var(--spacing-24)] min-w-0 flex-1 flex-col justify-center">
        <span className={`${TITLE[state]}`}>{label}</span>
      </span>
      <span className={`flex min-h-[var(--spacing-24)] shrink-0 items-center whitespace-nowrap text-label-12 ${STATUS[state]}`}>
        {status ?? MASTER_STATUS[state]}
      </span>
    </li>
  );
}
