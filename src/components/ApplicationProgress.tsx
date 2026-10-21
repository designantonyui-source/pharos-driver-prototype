import { ProgressStep, type ProgressState } from './ProgressStep';

/**
 * figma: 734:426 · Pharos/App/Application progress — Stage=Dispatcher (734:357) · Customer (734:380) ·
 *        Assigned (734:403) · Direct (2020:373) · DirectAssigned (2020:396)
 * props: stage, label
 *
 *   box VERTICAL gap 12 pad 16, radius 16, fill color/bg/surface — note: NO stroke here, unlike
 *   Trip steps / Trip preparation, and the radius is 16 rather than 12
 *     "Application stages"  DM Sans Medium 12/16 color/text/secondary (text-label-12), hug width
 *     Frame VERTICAL gap 8, fills the 338 content width, one `Pharos/App/Progress step` per stage
 *   Height check: 16 + 16 + 12 + (steps) + 16
 *     4 steps  -> 4*24 + 3*8 = 120 -> 180 == Figma (Dispatcher / Customer / Assigned)
 *     3 steps  -> 3*24 + 2*8 =  88 -> 148 == Figma (Direct / DirectAssigned)
 *
 *   Stage order and per-row state (from the set and from instance 735:1115):
 *     Dispatcher   Done "Application sent" · Current "Dispatcher approval" · Next "Customer confirmation" · Next "Trip assigned"
 *     Customer     Done · Done · Current "Customer confirmation" · Next "Trip assigned"
 *     Assigned     all four Done
 *     Direct       Done "Application sent" · Current "Customer confirmation" · Next "Trip assigned"  (3 rows)
 *     DirectAssigned Done "Application sent" · Done "Customer confirmation" · Done "Trip assigned"   (3 rows)
 *
 *   PRODUCT DEVIATION (2026-10-21): the Figma master is the 4-row list above. The driver-facing
 *   tracker collapses dispatcher approval and customer confirmation into one "Under review" step
 *   with a substatus and one deadline. The stage prop still maps the underlying application status,
 *   but every variant now renders the same three driver-facing rows:
 *     Application sent -> Under review -> Confirmed
 *   Figma still needs this 3-row variant; do not treat the port as 1:1 until it is updated.
 *
 *   Only three of the five variants are placed on a screen — Dispatcher `735:1115`,
 *   Customer `735:1158`, Assigned `735:1489` (all on `01 · Driver journey`, "pending"/"confirmed").
 *   Direct and DirectAssigned have no instance anywhere in the file; they are ported because the
 *   set defines them, and the stage list is a prop so the two can be covered by stories.
 *
 * tokens: color-bg-surface, color-text-secondary, radius-lg, spacing-8, spacing-12, spacing-16,
 *         card-w, text-label-12
 * TODO(token): none — every value above resolves to an existing token.
 */
export type ApplicationStage = 'dispatcher' | 'customer' | 'assigned' | 'direct' | 'direct-assigned';

type Row = { state: ProgressState; label: string; detail?: string };

const STAGES: Record<ApplicationStage, Row[]> = {
  dispatcher: [
    { state: 'done', label: 'Application sent' },
    { state: 'current', label: 'Under review', detail: 'With dispatcher' },
    { state: 'next', label: 'Confirmed' },
  ],
  customer: [
    { state: 'done', label: 'Application sent' },
    { state: 'current', label: 'Under review', detail: 'Dispatcher approved · waiting for customer' },
    { state: 'next', label: 'Confirmed' },
  ],
  assigned: [
    { state: 'done', label: 'Application sent' },
    { state: 'done', label: 'Under review' },
    { state: 'done', label: 'Confirmed' },
  ],
  direct: [
    { state: 'done', label: 'Application sent' },
    { state: 'current', label: 'Under review', detail: 'With customer' },
    { state: 'next', label: 'Confirmed' },
  ],
  'direct-assigned': [
    { state: 'done', label: 'Application sent' },
    { state: 'done', label: 'Under review' },
    { state: 'done', label: 'Confirmed' },
  ],
};

export function ApplicationProgress({
  stage = 'dispatcher',
  label = 'Application progress',
}: {
  /** Figma variant property `Stage`. */
  stage?: ApplicationStage;
  /** Figma layer `Application stages` — the same string in all five variants. */
  label?: string;
}) {
  const rows = STAGES[stage];
  const currentIndex = rows.findIndex((row) => row.state === 'current');
  const doneCount = rows.filter((row) => row.state === 'done').length;
  // Screen readers get "Step 2 of 3" — the visual rows already carry Done/Current/Next.
  const position = currentIndex >= 0 ? currentIndex + 1 : doneCount;
  return (
    <div className="flex w-[var(--card-w)] flex-col gap-[var(--spacing-12)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <span className="w-fit text-label-12 text-[var(--color-text-secondary)]">{label} · Step {position} of {rows.length}</span>
      <ol
        className="flex w-full list-none flex-col gap-[var(--spacing-8)] p-0"
        aria-label={`${label}: step ${position} of ${rows.length}`}
      >
        {/* ProgressStep already renders the <li>; wrapping it produced a nested list
            item (React DOM warning) and doubled the step semantics for screen readers. */}
        {rows.map((row, i) => (
          <ProgressStep
            key={row.label}
            state={row.state}
            number={i + 1}
            label={row.label}
            detail={row.detail}
            aria-current={row.state === 'current' ? 'step' : undefined}
          />
        ))}
      </ol>
    </div>
  );
}
