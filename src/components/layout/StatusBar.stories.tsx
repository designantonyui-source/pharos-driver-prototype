import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { StatusBar } from './StatusBar';

/** Type=IOS (2305:25330) is what every driver screen uses; Type=Default (586:20) is the fallback. */
const meta = {
  title: 'App shell/Status bar',
  component: StatusBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof StatusBar>;
export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Ios: Story = { args: {} };

export const Default: Story = { args: { type: 'default' } };
