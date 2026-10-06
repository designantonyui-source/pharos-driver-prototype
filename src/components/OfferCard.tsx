import { StatusPill } from './StatusPill';

/**
 * figma: Pharos/App/Offer = 2594:22063 (variants Default / Loading / Pending), used on details-v2 2767:27747
 * props: rate, perKm, distance, lane, window, deadhead, company, meta, badge
 * tokens: color-offer-*, radius-md, text-rate-24, text-body-16, text-label-12, text-label-14, text-caption-12
 * geometry: card 370 x 222, inner rows 36/28/24/20/20/20 with 8px gaps (=188 + 2x17 padding)
 */
export type OfferCardProps = {
  rate: string;
  perKm: string;
  distance: string;
  lane: string;
  window: string;
  deadhead: string;
  company: string;
  meta?: string;
  badge?: { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'match' };
  state?: 'default' | 'loading' | 'pending';
};

const Row = ({ children, h }: { children?: React.ReactNode; h: number }) => (
  <div className="flex items-center justify-between" style={{ height: h }}>{children}</div>
);

const Bar = ({ w, h }: { w: number; h: number }) => (
  <span className="rounded-[var(--radius-xs)] bg-[var(--color-offer-bg-skeleton)]" style={{ width: w, height: h }} />
);

export function OfferCard(props: OfferCardProps) {
  const { rate, perKm, distance, lane, window, deadhead, company, meta, badge, state = 'default' } = props;
  if (state === 'loading') {
    return (
      <div className="flex w-[370px] flex-col gap-[8px] rounded-[var(--radius-md)] border border-[var(--color-offer-border)] bg-[var(--color-offer-bg)] p-[17px]">
        <Row h={36}><Bar w={72} h={24} /><Bar w={68} h={16} /><Bar w={42} h={16} /></Row>
        <Row h={28}><Bar w={149} h={20} /></Row>
        <Row h={24}><Bar w={129} h={16} /><Bar w={145} h={20} /></Row>
        <Row h={20}><Bar w={158} h={16} /></Row>
        <Row h={20}><Bar w={193} h={16} /></Row>
        <Row h={20}><Bar w={217} h={16} /></Row>
      </div>
    );
  }
  return (
    <div className="flex w-[370px] flex-col gap-[8px] rounded-[var(--radius-md)] border border-[var(--color-offer-border)] bg-[var(--color-offer-bg)] p-[17px]">
      {badge && <Row h={28}><StatusPill label={badge.label} tone={badge.tone} /></Row>}
      <Row h={36}>
        <span className="flex items-baseline gap-[8px]">
          <span className="text-rate-24 text-[var(--color-offer-text-price)]">{rate}</span>
          <span className="text-label-12 text-[var(--color-offer-text-secondary)]">{perKm}</span>
        </span>
        <span className="text-label-12 text-[var(--color-offer-text-secondary)]">{distance}</span>
      </Row>
      <Row h={28}><span className="text-body-16 text-[var(--color-offer-text-primary)]">{lane}</span></Row>
      <Row h={24}><span className="text-label-14 text-[var(--color-text-primary)]">{window}</span><span className="text-label-12 text-[var(--color-offer-text-secondary)]">{props.meta}</span></Row>
      <Row h={20}><span className="text-body-14 text-[var(--color-offer-text-secondary)]">{deadhead}</span></Row>
      <Row h={20}><span className="text-body-14 text-[var(--color-offer-text-secondary)]">{meta ? '' : ''}{company}</span></Row>
    </div>
  );
}
