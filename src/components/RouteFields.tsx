/**
 * figma: 2197:7929 (Route / Connected stops) inside Content=Route, State=Route filled 2197:7919
 * props: from, to, onFromClick, onToClick
 * defaults are the `Route filled` variant content (Lille, France -> Brussels, Belgium); the
 * other route states pass EMPTY_CITY for whichever row they have not chosen yet.
 * tokens: color-bg-canvas, color-border-default, color-border-brand, color-text-primary,
 *         color-text-secondary, radius-lg, text-heading-20, text-label-12
 * geometry (all relative to the 354x144 frame, measured from absoluteBoundingBox):
 *   frame  354x144 r16 fill #f4f6f8 (color/bg/canvas), VERTICAL, gap 0
 *   row    354x72 · pad 10/16/10/16 · gap 12 · counter-axis CENTER
 *     marker 8x8 ellipse, 1.5px #225d74 INSIDE stroke, at x=16; origin filled,
 *            destination filled with the canvas colour (a ring, not a dot)
 *     text   282x48 at x=36 (16 + 8 + 12), VERTICAL gap 4:
 *            label 12/16 DM Sans Medium #586d79 · city 20/28 Manrope SemiBold #172a35
 *   connector 1x64 #d7e0e6 at x=20 (= marker centre 16 + 4), y=40..104 — it touches the
 *            origin marker's bottom edge and the destination marker's top edge.
 *   There is NO swap control in this Figma set: the only element between the two rows is
 *   that static 1px connector. Rows are clickable (the four "suggestions / current"
 *   states are this frame with one row being edited), so they render as <button>.
 *
 * figma: 2197:8222 (Route origin selected) / 2197:8438 (… vehicle) show the same block with
 *   the destination still empty — that is `to={EMPTY_CITY}` (the copy of the layer named
 *   `Select city`, whose characters in all four empty states are "Choose a city").
 */

/** What Figma renders in a row whose city is not chosen yet (layer `Select city`). */
export const EMPTY_CITY = 'Choose a city';

type StopProps = {
  label: string;
  city: string;
  origin?: boolean;
  onClick?: () => void;
};

function Stop({ label, city, origin = false, onClick }: StopProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[72px] w-full shrink-0 items-center gap-[12px] px-[16px] py-[10px] text-left ${
        origin ? 'rounded-t-[var(--radius-lg)]' : 'rounded-b-[var(--radius-lg)]'
      }`}
    >
      <span
        aria-hidden
        className={`h-[8px] w-[8px] shrink-0 rounded-[var(--radius-pill)] border-[1.5px] border-[var(--color-border-brand)] ${
          origin ? 'bg-[var(--color-border-brand)]' : 'bg-[var(--color-bg-canvas)]'
        }`}
      />
      <span className="flex w-full shrink-0 flex-col gap-[4px]">
        <span className="h-[16px] text-label-12 text-[var(--color-text-secondary)]">{label}</span>
        <span className="h-[28px] text-heading-20 text-[var(--color-text-primary)]">{city}</span>
      </span>
    </button>
  );
}

export function RouteFields({
  from = 'Lille, France',
  to = 'Brussels, Belgium',
  onFromClick,
  onToClick,
}: {
  from?: string;
  to?: string;
  onFromClick?: () => void;
  onToClick?: () => void;
}) {
  return (
    <div className="relative flex h-[144px] w-full shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-canvas)]">
      <Stop label="From" city={from} origin onClick={onFromClick} />
      <Stop label="To" city={to} onClick={onToClick} />
      {/* connector — between the markers, not a swap affordance */}
      <span aria-hidden className="pointer-events-none absolute left-[20px] top-[40px] h-[64px] w-[1px] bg-[var(--color-border-default)]" />
    </div>
  );
}
