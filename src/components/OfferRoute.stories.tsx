import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfferRoute } from './OfferRoute';

/**
 * `Pharos/App/Offer route` (693:995) has no variants — it is one 370x215 component with six TEXT
 * properties. The stories below are the values its eight instances carry on page 30.
 */
const meta = { title: 'Components/OfferRoute', component: OfferRoute } satisfies Meta<typeof OfferRoute>;
export default meta;
type Story = StoryObj<typeof OfferRoute>;

/** 2689:15053 / 688:19279 — the default instance copy. */
export const Default: Story = {
  args: {
    origin: 'Lille, France',
    destination: 'Brussels, Belgium',
    pickupWindow: 'Pickup · today, 14:00–15:00',
    deliveryWindow: 'Delivery · today, by 19:00',
    approachDistance: '18 km to pickup · about 25 min',
    loadedDistance: '111 km loaded',
  },
};

/** 2689:15131 — the second copy seen on page 30. */
export const Tourcoing: Story = {
  args: {
    origin: 'Tourcoing, France',
    destination: 'Brussels, Belgium',
    pickupWindow: 'Pickup · today, 15:00–16:00',
    deliveryWindow: 'Delivery · today, by 19:00',
    approachDistance: '26 km to pickup · about 35 min',
    loadedDistance: '105 km loaded',
  },
};

/** The `Map affordance` layer ("View map →") is hidden in the component and absent from all 8
 *  instances; this story only exists to show what it would add. Not used by any screen. */
export const MapAffordance: Story = {
  args: {
    origin: 'Lille, France',
    destination: 'Brussels, Belgium',
    pickupWindow: 'Pickup · today, 14:00–15:00',
    deliveryWindow: 'Delivery · today, by 19:00',
    approachDistance: '18 km to pickup · about 25 min',
    loadedDistance: '111 km loaded',
    showMap: true,
  },
};
