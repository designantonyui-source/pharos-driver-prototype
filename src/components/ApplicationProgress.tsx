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

type Row = [ProgressState, string];

const STAGES: Record<ApplicationStage, Row[]> = {
  dispatcher: [
    ['done', 'Application sent'],
    ['current', 'Dispatcher approval'],
    ['next', 'Customer confirmation'],
    ['next', 'Trip assigned'],
  ],
  customer: [
    ['done', 'Application sent'],
    ['done', 'Dispatcher approval'],
    ['current', 'Customer confirmation'],
    ['next', 'Trip assigned'],
  ],
  assigned: [
    ['done', 'Application sent'],
    ['done', 'Dispatcher approval'],
    ['done', 'Customer confirmation'],
    ['done', 'Trip assigned'],
  ],
  direct: [
    ['done', 'Application sent'],
    ['current', 'Customer confirmation'],
    ['next', 'Trip assigned'],
  ],
  'direct-assigned': [
    ['done', 'Application sent'],
    ['done', 'Customer confirmation'],
    ['done', 'Trip assigned'],
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
  const currentIndex = rows.findIndex(([state]) => state === 'current');
  const doneCount = rows.filter(([state]) => state === 'done').length;
  // Screen readers get "Step 2 of 4" — the visual rows already carry Done/Current/Next.
  const position = currentIndex >= 0 ? currentIndex + 1 : doneCount;
  return (
    <div className="flex w-[var(--card-w)] flex-col gap-[var(--spacing-12)] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <span className="w-fit text-label-12 text-[var(--color-text-secondary)]">{label} · Step {position} of {rows.length}</span>
      <ol
        className="flex w-full list-none flex-col gap-[var(--spacing-8)] p-0"
        aria-label={`${label}: step ${position} of ${rows.length}`}
      >
        {rows.map(([state, title], i) => (
          <ProgressStep
            key={title}
            state={state}
            number={i + 1}
            label={title}
            aria-current={state === 'current' ? 'step' : undefined}
          />
        ))}
      </ol>
    </div>
  );
}
