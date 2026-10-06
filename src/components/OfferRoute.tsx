/**
 * figma: 693:995 · Pharos/App/Offer route (COMPONENT, 370x215) — page 30 has 8 instances
 *        (2689:15053, 688:19279, 2689:15131, …), every one 370x215.
 *        TEXT properties: Origin, Destination, Pickup window, Delivery window,
 *        Approach distance, Loaded distance.
 * props: origin, destination, pickupWindow, deliveryWindow, approachDistance, loadedDistance, showMap
 *
 *   root VERTICAL pad 16, gap 12, r16 (radius/lg), fill #ffffff, 1px INSIDE #d7e0e6.
 *   Box border-box: 1 + 16 + 20 + 12 + 108 + 12 + 1 + 12 + 16 + 16 + 1 = 215.
 *
 *   Route header 336x20, SPACE_BETWEEN/CENTER
 *     "Route"        DM Sans Medium 12/16 (Label/12) #586d79, vertically centered
 *     "View map →"   DM Sans Medium 14/20 #225d74 — **hidden in the component and absent from
 *                    every instance**, so `showMap` defaults to false (PORT-LOG trap 16/17).
 *   Pickup to delivery 336x108, HORIZONTAL gap 12, MIN/CENTER
 *     Markers 12x108 (absolute children, offsets from its own top-left):
 *       Route line        2x50  at x 5,  y 21   fill #d7e0e6
 *       Pickup marker     10x10 at x 1,  y 11   fill #225d74              (filled dot)
 *       Delivery marker   10x10 at x 1,  y 71   fill #ffffff + 2px INSIDE #225d74 (ring)
 *     Locations 312x108, VERTICAL gap 12: two 48-tall rows, each city 28 + window 20
 *       city   Manrope SemiBold 20/28 (Heading/20) #172a35
 *       window DM Sans Regular 14/20 (Body/14)     #586d79
 *   Section divider 336x1 fill #d7e0e6
 *   Route distances 336x16, SPACE_BETWEEN/CENTER
 *     both DM Sans Regular 12/16 (Caption/12) #586d79
 *
 * tokens: color-bg-surface, color-border-default, color-border-brand, color-text-primary,
 *         color-text-secondary, color-action-text, radius-lg, text-heading-20, text-body-14,
 *         text-label-12, text-caption-12
 * TODO(token): the marker offsets (5 / 21 / 1 / 11 / 71 / 10 / 50 / 2) and the 12-px marker
 *   column are inlined as the Figma numbers, the same way RouteSummary and BottomSheet do it —
 *   `spacing` has no 5/11/21/50/71.
 */
export function OfferRoute({
  origin,
  destination,
  pickupWindow,
  deliveryWindow,
  approachDistance,
  loadedDistance,
  showMap = false,
}: {
  origin: string;
  destination: string;
  pickupWindow: string;
  deliveryWindow: string;
  approachDistance: string;
  loadedDistance: string;
  /** `Map affordance` ("View map →"). Hidden in the component and missing from all 8 instances. */
  showMap?: boolean;
}) {
  return (
    <article className="flex w-full flex-col gap-[12px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px]">
      <header className="flex h-[20px] w-full items-center justify-between">
        <span className="text-label-12 text-[var(--color-text-secondary)]">Route</span>
        {showMap && (
          <button type="button" className="text-label-14 text-[var(--color-action-text)]">
            View map →
          </button>
        )}
      </header>

      <div className="flex w-full items-center gap-[12px]">
        <div className="relative h-[108px] w-[12px] shrink-0">
          <span className="absolute left-[5px] top-[21px] h-[50px] w-[2px] bg-[var(--color-border-default)]" />
          <span className="absolute left-[1px] top-[11px] h-[10px] w-[10px] rounded-full bg-[var(--color-border-brand)]" />
          <span className="absolute left-[1px] top-[71px] h-[10px] w-[10px] rounded-full border-2 border-[var(--color-border-brand)] bg-[var(--color-bg-surface)]" />
        </div>

        <div className="flex w-full flex-col gap-[12px]">
          <div className="flex flex-col">
            <span className="text-heading-20 text-[var(--color-text-primary)]">{origin}</span>
            <span className="text-body-14 text-[var(--color-text-secondary)]">{pickupWindow}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-heading-20 text-[var(--color-text-primary)]">{destination}</span>
            <span className="text-body-14 text-[var(--color-text-secondary)]">{deliveryWindow}</span>
          </div>
        </div>
      </div>

      <span className="h-[1px] w-full bg-[var(--color-border-default)]" aria-hidden />

      <div className="flex h-[16px] w-full items-center justify-between">
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{approachDistance}</span>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{loadedDistance}</span>
      </div>
    </article>
  );
}
