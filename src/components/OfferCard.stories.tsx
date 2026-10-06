import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfferCard } from './OfferCard';

/**
 * One story per state of `Pharos/App/Offer` (2594:22063) — the design has four states, the app
 * instances three of them (41 Default, 3 Pending, 2 Loading; the remainder are scaled copies of
 * Default, and **Disabled is never instanced**).
 * `WithTimer` / `WithCargo` document the two layers the set carries hidden; `WithBadge` is an
 * app-level addition that is not a layer of this component.
 */
const meta = {
  title: 'Components/OfferCard',
  component: OfferCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof OfferCard>;
export default meta;
type Story = StoryObj<typeof OfferCard>;

/** State=Default 2549:12618 · 370x190 */
export const Default: Story = { args: {} };

/** State=Disabled 2594:21989 · 370x190 · content rows at 38% opacity, card chrome unchanged */
export const Disabled: Story = { args: { state: 'disabled' } };

/** State=Loading 2594:22017 · 370x194 · 336x160 skeleton, bars r4 */
export const Loading: Story = { args: { state: 'loading' } };

/** State=Pending 2718:2176 · 370x255 · Divider + Status Tone=Info + Button link */
export const Pending: Story = { args: { state: 'pending' } };

/** the `Decision timer` layer — present in the set, hidden in all four variants and all 46 instances */
export const WithTimer: Story = { args: { showTimer: true } };

/** the `Cargo` layer — present in the set, hidden in all four variants */
export const WithCargo: Story = { args: { showCargo: true } };

/** not a layer of the Figma set: an app-level status on top of the card */
export const WithBadge: Story = { args: { badge: { label: 'Needs approval', tone: 'warning' } } };

/** real load-board copy, same component */
export const BelRoute: Story = {
  args: {
    rate: '€320',
    perKm: '€3.05/km loaded',
    distance: '105 km loaded',
    lane: 'Tourcoing → Brussels',
    window: 'Today · 15:00–16:00',
    deadhead: '26 km to pickup · about 35 min',
    cargo: 'Curtainsider · 10 t · 14 pallets',
    company: 'BelRoute · 4.7 ★ · paid in 14 days',
  },
};
