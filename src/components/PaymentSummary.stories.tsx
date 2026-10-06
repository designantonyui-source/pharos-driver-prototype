import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { PaymentSummary } from './PaymentSummary';

/**
 * Figma fixes every variant at 736 wide and its three instances sit in the page-21 frame
 * "Route and trip conditions" at 736x162; this frame is that parent width.
 * `layout: 'fullscreen'` skips the 402-wide screen decorator, which the 736 card would overflow.
 */
const frame: Decorator = (Story) => (
  <div style={{ width: 736 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/PaymentSummary',
  component: PaymentSummary,
  parameters: { layout: 'fullscreen' },
  decorators: [frame],
} satisfies Meta<typeof PaymentSummary>;

export default meta;
type Story = StoryObj<typeof PaymentSummary>;

/** `412:347` — Tone=Neutral "Expected", Amount label "To receive". */
export const Pending: Story = { args: { state: 'pending' } };

/** `412:361` — Tone=Info "Early payment available". */
export const EarlyAvailable: Story = { args: { state: 'early' } };

/** `412:375` — Tone=Success "Received"; the Amount label flips to "Received" too. */
export const Received: Story = { args: { state: 'received' } };
