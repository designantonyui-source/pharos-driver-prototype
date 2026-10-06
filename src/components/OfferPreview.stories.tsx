import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfferPreview } from './OfferPreview';

/**
 * One story per Figma variant of `Pharos/Offer preview` (26:73): Size=Mobile/Desktop ×
 * State=Available/Unavailable, plus the `Show status` property and the app's FILL usage.
 * `layout: 'fullscreen'` keeps the screen decorator out of the way so the card renders at its own
 * Figma width (Desktop 440, Mobile 358) instead of the 370px driver-screen content box.
 */
const meta = {
  title: 'Components/OfferPreview',
  component: OfferPreview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OfferPreview>;
export default meta;
type Story = StoryObj<typeof OfferPreview>;

/** Size=Desktop 106:17 · 440x148 */
export const DesktopAvailable: Story = { args: {} };

/** Size=Desktop 106:35 · 440x182 · Match status Tone=Neutral "Load already assigned" last */
export const DesktopUnavailable: Story = { args: { state: 'unavailable' } };

/** the `Show status` component property on the Available state (Tone=Match "On your route") */
export const DesktopWithStatus: Story = { args: { status: true } };

/** how the app instances the card: FILL inside the load-board column (460/628 wide in Figma) */
export const DesktopFullWidth: Story = {
  render: () => (
    <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)] p-[var(--card-pad)]">
      <OfferPreview full />
    </div>
  ),
};

/** Size=Mobile 26:35 · 358x290 · the only size that carries a Rate row and an action button */
export const MobileAvailable: Story = { args: { size: 'mobile' } };

/** Size=Mobile 26:53 · 358x318 · full-width disabled action */
export const MobileUnavailable: Story = { args: { size: 'mobile', state: 'unavailable' } };
