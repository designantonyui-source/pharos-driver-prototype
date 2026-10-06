import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ChatRateOffer } from './ChatRateOffer';

/**
 * Each variant of `2189:8453` is 302 wide; the set frame's 350x420 is only its canvas
 * (302 + 2*24 padding). The component is fluid, so this pins the variant width.
 */
const frame: Decorator = (Story) => (
  <div style={{ width: 302 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/ChatRateOffer',
  component: ChatRateOffer,
  parameters: { layout: 'centered' },
  decorators: [frame],
} satisfies Meta<typeof ChatRateOffer>;

export default meta;
type Story = StoryObj<typeof ChatRateOffer>;

/** `2188:8107` — 302x216: title / rate / sender, then the primary Button and the underlined link. */
export const Pending: Story = { args: { state: 'pending' } };

/** `2188:8129` — 302x132: the actions are replaced by the success line `#216547`. */
export const Accepted: Story = { args: { state: 'accepted' } };

/** The strings the 3 app instances override in (`€360`, Pending `2370:29386`). */
export const AppInstances: Story = {
  args: { state: 'pending', rate: '€360', acceptLabel: 'Accept €360' },
};
