import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { HomeIndicator } from './HomeIndicator';

/** figma: 586:70 — a single component, 402x34, bar 134x5. */
const meta = {
  title: 'App shell/Home indicator',
  component: HomeIndicator,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof HomeIndicator>;
export default meta;
type Story = StoryObj<typeof HomeIndicator>;

export const Default: Story = {};
