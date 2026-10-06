import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteCard } from './RouteCard';

/**
 * Both variants of `Pharos/App/Route card` (2715:1535): Addresses=Expected (5 instances in the app)
 * and Addresses=Known (10), plus a real-content example.
 */
const meta = {
  title: 'Components/RouteCard',
  component: RouteCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RouteCard>;
export default meta;
type Story = StoryObj<typeof RouteCard>;

/** Addresses=Expected 2715:1465 · 370x235 · warning-coloured "Exact address expected", no action */
export const Expected: Story = { args: {} };

/** Addresses=Known 2715:1500 · 370x339 · success-coloured address + `Address action` row with Navigate */
export const Known: Story = { args: { addresses: 'known' } };

/** real trip copy, Addresses=Known */
export const TripKnown: Story = {
  args: {
    addresses: 'known',
    pickup: { flag: 'Belgium', city: 'Tourcoing, France', kind: 'Pickup', window: 'Today, 15:00–16:00' },
    delivery: { flag: 'Belgium', city: 'Brussels, Belgium', kind: 'Delivery', window: 'Today, by 19:00' },
  },
};
