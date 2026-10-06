import approachArt from '../assets/maps/approach-402x646.svg';
import { Icon } from './Icon';

/**
 * figma: 719:355 · Pharos/App/Approach map — one component, 402x646, 15 instances
 * props: summaryLabel, summaryValue, driverLabel, pickupLabel, caption
 *
 *   root color/bg/subtle · artwork = Figma SVG export (roads, water, parks, approach path)
 *   city label 20/28 Manrope SemiBold color/text/secondary at (220,145)
 *   summary card (16,16) 159x64 r12 white, VERTICAL pad 12 gap 4:
 *     "To pickup" 12/16 DM Sans Medium color/text/secondary · "18 km · about 25 min" 14/20 Medium color/text/primary
 *   driver: halo 64x64 color/status/info/bg · outline 30x30 white · dot 20x20 color/action/primary,
 *     label pill (36,395) 96x36 r-pill white, text 14/20 Medium color/action/primary
 *   pickup: target pill (198,183) 145x44 r-pill color/action/primary with a white Map pin 20x20 and
 *     14/20 Medium white text · outline 26x26 white · location 16x16 color/action/primary
 *   caption 12/16 DM Sans Regular color/text/secondary at (16,436)
 *
 * tokens: color-bg-subtle, color-bg-surface, color-status-info-bg, color-action-primary,
 *         color-text-primary, color-text-secondary, radius-md, radius-pill
 * note: the artwork colours live in the SVG asset (src/assets/maps), like the flags
 */
export function ApproachMap({
  city = 'Lille',
  summaryLabel = 'To pickup',
  summaryValue = '18 km · about 25 min',
  driverLabel = 'You · demo',
  pickupLabel = 'Pickup · €360',
  caption = 'Approach to selected load',
}: {
  city?: string;
  summaryLabel?: string;
  summaryValue?: string;
  driverLabel?: string;
  pickupLabel?: string;
  caption?: string;
}) {
  return (
    <div className="relative h-[646px] w-[402px] overflow-hidden bg-[var(--color-bg-subtle)]">
      <img src={approachArt} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />

      <span className="absolute left-[220px] top-[145px] text-heading-20 text-[var(--color-text-secondary)]">{city}</span>

      <div className="absolute left-[16px] top-[16px] flex w-[159px] flex-col gap-[4px] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[12px] py-[12px]">
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{summaryLabel}</span>
        <span className="text-body-14 text-[var(--color-text-primary)]">{summaryValue}</span>
      </div>

      {/* driver position */}
      <span className="absolute left-[58px] top-[333px] h-[64px] w-[64px] rounded-[var(--radius-pill)] bg-[var(--color-status-info-bg)]" />
      <span className="absolute left-[75px] top-[350px] h-[30px] w-[30px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)]" />
      <span className="absolute left-[80px] top-[355px] h-[20px] w-[20px] rounded-[var(--radius-pill)] bg-[var(--color-action-primary)]" />
      <span className="absolute left-[36px] top-[395px] flex h-[36px] w-[96px] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] text-body-14 text-[var(--color-action-primary)]">
        {driverLabel}
      </span>

      {/* pickup target */}
      <span className="absolute left-[198px] top-[183px] flex h-[44px] w-[145px] items-center gap-[8px] rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] pl-[12px] text-body-14 text-[var(--color-bg-surface)]">
        <Icon name="map-pin" className="text-[var(--color-bg-surface)]" />
        {pickupLabel}
      </span>
      <span className="absolute left-[267px] top-[222px] h-[26px] w-[26px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)]" />
      <span className="absolute left-[272px] top-[227px] h-[16px] w-[16px] rounded-[var(--radius-pill)] bg-[var(--color-action-primary)]" />

      <span className="absolute left-[16px] top-[436px] text-caption-12 text-[var(--color-text-secondary)]">{caption}</span>
    </div>
  );
}
