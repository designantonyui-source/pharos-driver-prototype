import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { LoadCard } from './LoadCard';

/**
 * Figma re-widths this card per instance (320, 358 and 628 on page 09), so the component is
 * fluid and the stories pin the parent frame at the variant's own width: 358 (Mobile) / 628
 * (Desktop). Mobile stories keep the 402x874 screen decorator from `.storybook/preview.tsx`;
 * Desktop uses `layout: 'fullscreen'` because 628 does not fit that frame.
 */
const frame =
  (width: number): Decorator =>
  (Story) => (
    <div style={{ width }}>
      <Story />
    </div>
  );

const meta = {
  title: 'Components/LoadCard',
  component: LoadCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LoadCard>;

export default meta;
type Story = StoryObj<typeof LoadCard>;

/** `14:140` — 358x630, Tone=Match "On your route", primary "Review application". */
export const MobileAvailable: Story = {
  args: { size: 'mobile', state: 'available' },
  decorators: [frame(358)],
};

/** `14:141` — 358x670, adds the Info alert; the primary button is hidden in Figma. */
export const MobileRequested: Story = {
  args: { size: 'mobile', state: 'requested' },
  decorators: [frame(358)],
};

/** `14:142` — 358x630, Tone=Success "Assigned to you", primary "View trip". */
export const MobileAssigned: Story = {
  args: { size: 'mobile', state: 'assigned' },
  decorators: [frame(358)],
};

/** `14:143` — 628x474, pad 24, the two condition columns side by side, actions in a row. */
export const DesktopAvailable: Story = {
  args: { size: 'desktop', state: 'available' },
  parameters: { layout: 'fullscreen' },
  decorators: [frame(628)],
};

/** `14:144` — 628x554, adds the Info alert, primary button hidden. */
export const DesktopRequested: Story = {
  args: { size: 'desktop', state: 'requested' },
  parameters: { layout: 'fullscreen' },
  decorators: [frame(628)],
};

/** `14:145` — 628x474, Tone=Success, primary "View trip". */
export const DesktopAssigned: Story = {
  args: { size: 'desktop', state: 'assigned' },
  parameters: { layout: 'fullscreen' },
  decorators: [frame(628)],
};

/**
 * `Show map` is a component property (false on every instance on pages 21 and 30), not a variant.
 * ⚠ The inline map artwork is NOT ported (see `TODO(asset)` in LoadCard.tsx) — this story shows the
 * disclosure geometry with an empty placeholder box, so it does NOT match `541:2650` (320x803).
 */
export const MapExpanded: Story = {
  args: { size: 'mobile', state: 'available', showMap: true },
  decorators: [frame(358)],
};

/** `Show chat` = false, as on the 320-wide instances (`541:2141`, `541:2268`, `541:2402`). */
export const ChatHidden: Story = {
  args: { size: 'mobile', state: 'available', showChat: false },
  decorators: [frame(358)],
};

/** The long-content instance `541:2531` ("QA only — long route, company and payment terms"). */
export const LongContent: Story = {
  args: {
    size: 'mobile',
    state: 'available',
    origin: 'Saint-Jean-de-Maurienne, FR',
    destination: 'Brussels — industrial zone, BE',
    deadhead: '18 km to pickup · about 25 min',
    company: 'Northway Freight & Logistics Europe',
    paymentTerms: 'Payment within 30 calendar days after delivery',
  },
  decorators: [frame(358)],
};
