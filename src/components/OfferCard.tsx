import { Clock, MapPin, Star } from 'lucide-react';
import { Flag } from './Flag';
import { StatusPill, type Tone } from './StatusPill';

/**
 * figma: Pharos/App/Offer = 2594:22063 · State=Default (370x190)
 *   padding 16 · gap 8 · rows: Price 36 · Route 28 · Schedule 20 · Deadhead 20 · Company 20 (Cargo layer is hidden in State=Default)
 *   vertical rhythm check: 36+28+20+20+20 = 124, gaps 4x8 = 32, padding 32, border 2 -> 190 == Figma card height
 * variants: Default 190 · Disabled 190 · Loading 194 · Pending 255
 * props: rate, perKm, distance, lane, from, to, window, timer, deadhead, cargo, company, badge
 * tokens: color-offer-*, color-text-*, color-status-warning-*, radius-*, text-metric-28, text-heading-20,
 *         text-label-14, text-label-12, text-body-14
 * NOTE: the Loading skeleton rows are still approximated — the exact Figma skeleton dump is pending.
 */
export type OfferCardProps = {
  rate?: string;
  perKm?: string;
  distance?: string;
  lane?: string;
  from?: string;
  to?: string;
  window?: string;
  timer?: string;
  deadhead?: string;
  cargo?: string;
  company?: string;
  badge?: { label: string; tone?: Tone };
  /** the Cargo layer exists in the Figma set but is hidden in State=Default */
  showCargo?: boolean;
  state?: 'default' | 'disabled' | 'loading' | 'pending';
};

const Bar = ({ w, h }: { w: number; h: number }) => (
  <span className="rounded-[var(--radius-xs)] bg-[var(--color-offer-bg-skeleton)]" style={{ width: w, height: h }} />
);

export function OfferCard({
  rate = '€360',
  perKm = '€3.24/km loaded',
  distance = '111 km loaded',
  lane = 'Lille → Brussels',
  from = 'France',
  to = 'Belgium',
  window = 'Today · 14:00–15:00',
  timer = 'Decide in 1 h 20 min',
  deadhead = '18 km to pickup · about 25 min',
  cargo = 'Curtainsider · 12.4 t · 18 pallets',
  showCargo = false,
  company = 'NordCargo · 4.8 ★ · paid in 7 days',
  badge,
  showCargo = false,
  state = 'default',
}: OfferCardProps) {
  /*
   * Card is 370 wide; row heights and the 8px gap come from the Figma component.
   * Order: Price row → Route → Schedule + decision timer → Deadhead → Cargo → Company.
   */
  const base = 'flex flex-col rounded-[var(--radius-md)] border bg-[var(--color-offer-bg)] p-[var(--card-pad)] gap-[var(--card-gap)]';
  const skin = state === 'disabled'
    ? 'border-[var(--color-border-default)] opacity-50'
    : 'border-[var(--color-offer-border)]';

  if (state === 'loading') {
    return (
      <div className={`${base} ${skin} w-[var(--card-w)]`} style={{ minHeight: 'var(--card-h-loading)' }}>
        <div className="flex h-[36px] items-center justify-between"><span className="flex gap-[8px]"><Bar w={72} h={28} /><Bar w={114} h={16} /></span><Bar w={87} h={16} /></div>
        <div className="flex h-[28px] items-center gap-[8px]"><Bar w={18} h={18} /><Bar w={149} h={20} /></div>
        <div className="flex h-[20px] items-center justify-between"><Bar w={129} h={16} /><Bar w={145} h={20} /></div>
        <div className="flex h-[20px] items-center gap-[8px]"><Bar w={16} h={16} /><Bar w={201} h={16} /></div>
        <div className="flex h-[20px] items-center"><Bar w={217} h={16} /></div>
      </div>
    );
  }

  return (
    <div className={`${base} ${skin} w-[var(--card-w)]`}>
      {badge && <div className="flex h-[28px] items-center"><StatusPill label={badge.label} tone={badge.tone ?? 'warning'} /></div>}

      {/* Price row — 36 */}
      <div className="flex h-[36px] items-baseline justify-between">
        <span className="flex items-baseline gap-[8px]">
          <span className="text-metric-28 text-[var(--color-offer-text-price)]">{rate}</span>
          <span className="text-label-14 text-[var(--color-offer-text-secondary)]">{perKm}</span>
        </span>
        <span className="text-label-14 text-[var(--color-offer-text-secondary)]">{distance}</span>
      </div>

      {/* Route — 28: flag + Heading/20 lane + flag */}
      <div className="flex h-[28px] items-center gap-[4px]">
        <Flag country={from} />
        <span className="text-heading-20 text-[var(--color-text-primary)]">{lane}</span>
        <Flag country={to} />
      </div>

      {/* Schedule + decision timer — 24 */}
      <div className="flex h-[20px] items-center justify-between">
        <span className="text-body-14 text-[var(--color-text-secondary)]">{window}</span>
        <span className="flex h-[24px] items-center gap-[4px] rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] px-[8px] text-[var(--color-status-warning-text)]">
          <Clock size={12} />
          <span className="text-label-12">{timer}</span>
        </span>
      </div>

      {/* Deadhead — 20: Map pin + Label/14 */}
      <div className="flex h-[20px] items-center gap-[4px]">
        <MapPin size={16} className="text-[var(--color-text-secondary)]" />
        <span className="text-label-14 text-[var(--color-text-primary)]">{deadhead}</span>
      </div>

      {/* Cargo — hidden in State=Default, kept for variants that show it */}
      {showCargo && <div className="flex h-[20px] items-center text-body-14 text-[var(--color-text-secondary)]">{cargo}</div>}

      {/* Company — 20 */}
      <div className="flex h-[20px] items-center gap-[4px] text-body-14 text-[var(--color-text-secondary)]">
        <Star size={12} className="hidden" />
        {company}
      </div>
    </div>
  );
}
