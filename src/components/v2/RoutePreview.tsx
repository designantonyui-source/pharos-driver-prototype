/**
 * RoutePreview — cropped Figma route art above the Trip summary (Postmates-style
 * composition: map on top, content as a sheet below). Reuses the measured
 * `route-358x320` export via <img> (RouteMap pattern) — inline SVG collapses
 * inside this scroll container, the asset does not.
 * Decorative: the real addresses stay as text in the sheet below (aria-hidden).
 */
import routeArt from '../../assets/maps/route-358x320.svg';

export function RoutePreview({ from, to }: { from: string; to: string }) {
  return (
    <div className="pointer-events-none relative w-full shrink-0 select-none overflow-hidden rounded-[var(--radius-lg)] shadow-card" style={{ height: 190 }} aria-hidden="true">
      <img
        src={routeArt}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8px] left-[8px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] px-[8px] py-[4px] text-caption-12 text-[var(--color-text-primary)]"
      >
        {from} → {to}
      </span>
    </div>
  );
}
