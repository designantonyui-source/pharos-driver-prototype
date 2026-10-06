/**
 * figma: 671:977 · Pharos/App/Route summary (COMPONENT, 370x92) — the mobile set. Every one of
 *        the six instances on page 30 is this component at 370x92 inside a "Scroll content"
 *        frame (402 wide, pad 16): `748:2018`, `2219:8608`, `735:1393`, `2207:8232`,
 *        `2207:8278` (+ one 251.6x62.56 card inside a scaled case-study mock, `2320:9671`).
 *        Page 21 has zero instances of it. See the contract note on the other set below.
 *
 *   Box: HORIZONTAL, pad 12/16, gap 12, counterAxis CENTER, fill color/bg/surface, 1px INSIDE
 *   stroke color/border/default, radius 16. Both axes FIXED (370x92), so the height comes from
 *   the 68-tall content, not from hugging.
 *
 *   Route markers (12x68, plain frame, children absolutely placed from its top-left):
 *     Connecting line   2x32  at x 5,  y 18   fill color/border/default
 *     Origin marker     10x10 at x 0,  y 8    fill color/border/brand   (filled dot)
 *     Destination marker 10x10 at x 0, y 50   fill color/bg/surface + 2px INSIDE color/border/brand (ring)
 *
 *   Route points (grow 1, 68 tall, VERTICAL gap 12, MIN, clipsContent):
 *     From point 28 tall, HORIZONTAL gap 8, CENTER:
 *       "From" Label/12 DM Sans Medium (12/16, color/text/secondary) · "Lille" Heading/20
 *       Manrope SemiBold (20/28, color/text/primary) · text is CENTERed in the 28-tall row,
 *       so the 16-tall label sits at y 6 and the 28-tall city at y 0.
 *     To point 28 tall, same structure: "To" + "Brussels".
 *
 *   Edit action — a bare TEXT layer (12/16 DM Sans Medium, color/action/text), placed OUTSIDE
 *   the two columns: box x 330, y 38 relative to the card (23x16, so 16 from the right edge).
 *
 *   Measured in Storybook (chrome), the card box is 370x92 and its children land on:
 *     marker line x22 y30 2x32 · origin dot x17 y20 10x10 (rgb(34,93,116))
 *     dest ring x17 y62 10x10 (white fill, 2px rgb(34,93,116) ring)
 *     "From"/"To" x41 y18/y58 62x16 (rgb(88,109,121)) · "Lille" x111 y12 38.33x28,
 *     "Brussels" x111 y52 81.92x28 (rgb(23,42,53)) · "Edit" x330.66 y38 22.34x16 (rgb(34,93,116))
 *   Stroke caveat (trap 6): Figma draws its 1px INSIDE stroke inside the 370x92 box, so its
 *   children start 17 (=16+1) from the left while a CSS border takes its pixel from the box —
 *   everything here is exactly 1px left of Figma's x on the horizontal axis and identical on y.
 *   The card is fixed at 92 tall (px16 / py11 + a 68-tall content column) because padding 12 +
 *   68 content + the 1px border on each side would render 94.
 *
 * Note on the namesake set: `26:27` · Pharos/Route summary (358x170) is the *web* generation and
 * a different component entirely — VERTICAL, pad 16, gap 12, r16, one heading "Lille → Brussels"
 * (20/28), a schedule line, an equipment line and a price row ("360 €" rate-24 Manrope Bold +
 * "111 km loaded"). No instance of it is placed on either driver page, so it is NOT ported here.
 * What the app screens actually draw is a third thing: a local frame `2668:14790`
 * "Route summary v2" (370x78, "Lille area → Brussels area" + vehicle + a 44x44 pencil button)
 * that is not a library component at all.
 *
 * props: from, to, onEdit
 * tokens: color-bg-surface, color-border-default, color-border-brand, color-text-primary,
 *         color-text-secondary, color-action-text, radius-lg, text-label-12, text-heading-20
 * TODO(token): none — every value above resolves to an existing token.
 */
export type RouteSummaryProps = {
  /** Figma `From` value ("Lille"). */
  from: string;
  /** Figma `To` value ("Brussels"). */
  to: string;
  /** Figma `Edit action`. Omit it to render the label as static text. */
  onEdit?: () => void;
};

type PointProps = { label: string; city: string };

/** `From point` / `To point` — 28 tall, HORIZONTAL gap 8, counterAxis CENTER. */
function RoutePoint({ label, city }: PointProps) {
  return (
    <div className="flex h-[28px] min-w-0 items-center gap-[8px] overflow-hidden">
      <span className="w-[62px] shrink-0 text-label-12 text-[var(--color-text-secondary)]">{label}</span>
      <span className="min-w-0 text-heading-20 text-[var(--color-text-primary)]">{city}</span>
    </div>
  );
}

export function RouteSummary({ from, to, onEdit }: RouteSummaryProps) {
  return (
    <div className="relative box-border flex h-[92px] w-full items-center gap-[12px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[16px] py-[11px]">
      {/* Figma: "Route markers" is 12x68 at y 12 with the children at y 8 / 18 / 50 from its top */}
      <div className="relative h-[68px] w-[12px] shrink-0" aria-hidden>
        <span className="absolute left-[5px] top-[18px] h-[32px] w-[2px] bg-[var(--color-border-default)]" />
        <span className="absolute left-0 top-[8px] h-[10px] w-[10px] rounded-[var(--radius-pill)] bg-[var(--color-border-brand)]" />
        <span className="absolute left-0 top-[50px] h-[10px] w-[10px] rounded-[var(--radius-pill)] border-2 border-[var(--color-border-brand)] bg-[var(--color-bg-surface)]" />
      </div>

      <div className="flex h-[68px] min-w-0 grow flex-col justify-start gap-[12px] overflow-hidden">
        <RoutePoint label="From" city={from} />
        <RoutePoint label="To" city={to} />
      </div>

      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-label-12 text-[var(--color-action-text)]"
        >
          Edit
        </button>
      ) : (
        <span className="shrink-0 text-label-12 text-[var(--color-action-text)]">Edit</span>
      )}
    </div>
  );
}
