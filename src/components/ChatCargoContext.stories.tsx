import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ChatCargoContext } from './ChatCargoContext';

/** Figma fixes the frame at 370 (counterAxis FIXED); the component is fluid, so this pins it. */
const frame: Decorator = (Story) => (
  <div style={{ width: 370 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/ChatCargoContext',
  component: ChatCargoContext,
  parameters: { layout: 'centered' },
  decorators: [frame],
} satisfies Meta<typeof ChatCargoContext>;

export default meta;
type Story = StoryObj<typeof ChatCargoContext>;

/** `2188:8055` — the single component, 370x64, with its own `Route` / `Pickup summary` defaults. */
export const Default: Story = {};

/** What all 8 instances override the summary to (page 30, `2370:29256`). */
export const AppInstance: Story = {
  args: { summary: 'Today, 14:00–15:00 · €360 · Decision by 11:00  ›' },
};
