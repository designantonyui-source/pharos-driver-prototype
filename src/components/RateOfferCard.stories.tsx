import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { RateOfferCard } from './RateOfferCard';

/** Figma fixes every variant at 280 wide; this frame is that parent width. */
const frame: Decorator = (Story) => (
  <div style={{ width: 280 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/RateOfferCard',
  component: RateOfferCard,
  parameters: { layout: 'centered' },
  decorators: [frame],
} satisfies Meta<typeof RateOfferCard>;

export default meta;
type Story = StoryObj<typeof RateOfferCard>;

/** `384:356` — info fill + brand stroke. */
export const Proposed: Story = { args: { state: 'proposed' } };

/** `384:360` — surface fill + strong stroke. */
export const Counter: Story = { args: { state: 'counter' } };

/** `384:364` — success fill + success stroke. */
export const Accepted: Story = { args: { state: 'accepted' } };

/** The strings the app's instances actually override in (page 21). */
export const AppInstances: Story = {
  args: { state: 'counter', title: 'Counter-offer', rate: '360 €', note: 'NordCargo is waiting for your decision' },
};
