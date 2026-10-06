import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfferTerms } from './OfferTerms';

/**
 * `Pharos/App/Offer terms` (693:1013) has no variants. It is HIDDEN in the Figma file and so are
 * all six of its instances, so Figma exports a 1x1 PNG for it — there is no visual reference.
 * These two stories are the property values its instances carry.
 */
const meta = { title: 'Components/OfferTerms', component: OfferTerms } satisfies Meta<typeof OfferTerms>;
export default meta;
type Story = StoryObj<typeof OfferTerms>;

/** 2689:15054 / 2004:2097 — the default instance copy. */
export const NordCargo: Story = {
  args: {
    rate: '€360',
    ratePerKm: '€3.24/km loaded',
    cargo: 'Curtainsider · 12.4 t · 18 pallets',
    payment: 'Paid within 7 days',
    customer: 'NordCargo · 4.8 ★',
    verification: 'Verified customer',
  },
};

/** 2689:15132 — the second copy seen on page 30. */
export const BelRoute: Story = {
  args: {
    rate: '€320',
    ratePerKm: '€3.05/km',
    cargo: 'Curtainsider · 10 t · 14 pallets',
    payment: 'Paid within 14 days',
    customer: 'BelRoute · 4.7 ★',
    verification: 'Verified customer',
  },
};
