import routeMobile from '../assets/maps/route-358x320.svg';
import routeDesktop from '../assets/maps/route-628x674.svg';
import { Icon } from './Icon';

/**
 * figma: 330:164 · Pharos/Route map — 6 variants
 *   Size=Desktop 628x674 (Results `330:2` · Selected `330:33` · Loading `330:67`)
 *   Size=Mobile  358x320 (Results `330:84` · Selected `330:114` · Loading `330:147`)
 * props: size, state, title, route, cities
 *
 *   surface 1px color/border/default r16, map land color/map/land, artwork = Figma SVG export
 *   stops: halo 40x40 color/map/halo (45%, 70% when selected) · disc 28x28 white + 1px border, or
 *          34x34 color/action/primary when selected · Map pin 18x18 inside the disc
 *   city label 12/16 DM Sans Medium color/text/primary, offset (31, -12) / (448, -16) from its disc
 *   header card: VERTICAL, white, 1px border, r12, pad 12/16 gap 4 (Desktop) or 10/14 (Mobile),
 *     title Heading/20 Manrope SemiBold · route Body/14 color/text/secondary
 *   Selected also draws "Selected load summary" 580x66, r12, pad 12/16 gap 4:
 *     company 14/20 Medium color/text/primary · route 12/16 Regular color/text/secondary
 *   Loading draws two 18x18 color/status/info/bg dots and two skeleton bars (310x20 r10, 205x12 r6)
 *
 * tokens: color-map-land, color-map-halo, color-bg-surface, color-border-default, color-text-primary,
 *         color-text-secondary, color-action-primary, color-status-info-bg, radius-md, radius-lg
 * note: the artwork colours live in the SVG asset (src/assets/maps), like the flags
 * note: Figma's copy in this set is Russian ("Грузы по маршруту", "Лилль → Брюссель"); AGENTS rule 5
 *       makes the app English, so the defaults here are English
 * TODO(token): the halo opacity (0.45 / 0.7) has no token
 */
export type RouteMapSize = 'mobile' | 'desktop';
export type RouteMapState = 'results' | 'selected' | 'loading';

const BOX: Record<RouteMapSize, string> = {
  mobile: 'h-[320px] w-[358px]',
  desktop: 'h-[674px] w-[628px]',
};

const ART: Record<RouteMapSize, string> = { mobile: routeMobile, desktop: routeDesktop };

/**
 * Stop centres taken from the Results variant (halo 40x40 top-left + 20). Selected grows the halo to
 * 50 and the disc to 34 around the SAME centre, which is why positioning is centre-based.
 * Mobile has no label for Tourcoing — that is what Figma draws.
 */
const STOPS: Record<RouteMapSize, { cx: number; cy: number; label?: string; lx?: number; ly?: number }[]> = {
  mobile: [
    { cx: 70, cy: 247, label: 'Lille', lx: 23, ly: 267 },
    { cx: 130, cy: 190 },
    { cx: 278, cy: 91, label: 'Brussels', lx: 232, ly: 107 },
  ],
  desktop: [
    { cx: 75, cy: 545, label: 'Lille', lx: 31, ly: 513 },
    { cx: 240, cy: 385, label: 'Tourcoing', lx: 270, ly: 393 },
    { cx: 500, cy: 155, label: 'Brussels', lx: 448, ly: 174 },
  ],
};

export function RouteMap({
  size = 'mobile',
  state = 'results',
  title = 'Loads on route',
  route = 'Lille → Brussels',
  company = 'NordCargo · €360',
}: {
  size?: RouteMapSize;
  state?: RouteMapState;
  title?: string;
  route?: string;
  company?: string;
}) {
  const desktop = size === 'desktop';
  const loading = state === 'loading';
  const selected = state === 'selected';

  return (
    /* The 1px frame is an overlay, not a border: a CSS border shifts every absolutely positioned
       child by 1px, while Figma draws its stroke INSIDE the frame (PORT-LOG trap 20). */
    <div className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-map-land)] ${BOX[size]}`}>
      <img src={ART[size]} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />

      {STOPS[size].map((stop, i) => (
        <Stop
          key={`${stop.cx}-${i}`}
          state={state}
          selected={selected && i === 0}
          loadingDot={i === 0 || i === STOPS[size].length - 1}
          {...stop}
        />
      ))}

      <div
        className={`absolute flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] ${
          desktop ? 'left-[24px] top-[24px] w-[250px] gap-[4px] px-[16px] py-[12px]' : 'left-[16px] top-[16px] w-[218px] gap-[4px] px-[14px] py-[10px]'
        }`}
      >
        <span className="text-heading-20 text-[var(--color-text-primary)]">{title}</span>
        <span className="text-body-14 text-[var(--color-text-secondary)]">{route}</span>
      </div>

      {selected && desktop && (
        <div
          className="absolute left-[24px] top-[563px] flex w-[580px] flex-col gap-[4px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[16px] py-[12px]"
        >
          <span className="text-body-14 text-[var(--color-text-primary)]">{company}</span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">{route} · selected load</span>
        </div>
      )}

      {loading && (
        <>
          <span
            className={`absolute rounded-[10px] bg-[var(--color-status-info-bg)] ${
              desktop ? 'left-[24px] top-[602px] h-[20px] w-[310px]' : 'left-[16px] top-[272px] h-[20px] w-[210px]'
            }`}
          />
          <span
            className={`absolute rounded-[6px] bg-[var(--color-status-info-bg)] ${
              desktop ? 'left-[24px] top-[632px] h-[12px] w-[205px]' : 'left-[16px] top-[299px] h-[12px] w-[140px]'
            }`}
          />
        </>
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]"
      />
    </div>
  );
}

function Stop({
  state,
  cx,
  cy,
  label,
  lx,
  ly,
  selected,
  loadingDot = false,
}: {
  state: RouteMapState;
  cx: number;
  cy: number;
  label?: string;
  lx?: number;
  ly?: number;
  selected?: boolean;
  /** Figma's Loading variants only place dots on the origin and the destination, not on Tourcoing */
  loadingDot?: boolean;
}) {
  if (state === 'loading') {
    if (!loadingDot) return null;
    return (
      <span
        className="absolute h-[18px] w-[18px] rounded-[var(--radius-pill)] bg-[var(--color-status-info-bg)]"
        style={{ left: cx - 9, top: cy - 9 }}
      />
    );
  }
  const disc = selected ? 34 : 28;
  const halo = selected ? 50 : 40;
  return (
    <>
      {/* TODO(token): halo opacity — Figma 45%, 70% when selected */}
      <span
        className="absolute rounded-[var(--radius-pill)] bg-[var(--color-map-halo)]"
        style={{ left: cx - halo / 2, top: cy - halo / 2, width: halo, height: halo, opacity: selected ? 0.7 : 0.45 }}
      />
      <span
        className={`absolute flex items-center justify-center rounded-[var(--radius-pill)] ${
          selected
            ? 'bg-[var(--color-action-primary)]'
            : 'border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]'
        }`}
        style={{ left: cx - disc / 2, top: cy - disc / 2, width: disc, height: disc }}
      >
        <Icon
          name="map-pin"
          size={18}
          className={selected ? 'text-[var(--color-bg-surface)]' : 'text-[var(--color-text-primary)]'}
        />
      </span>
      {label && lx !== undefined && ly !== undefined && (
        <span className="absolute whitespace-nowrap text-caption-12 text-[var(--color-text-primary)]" style={{ left: lx, top: ly }}>
          {label}
        </span>
      )}
    </>
  );
}
