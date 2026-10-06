import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { StatusBar } from './StatusBar';

/** Type=Default (586:20) is the fallback; every driver screen instances Type=IOS (2305:25330). */
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

export const Ios: Story = { args: { island: true } };

/** How every screen instances it: the Dynamic Island is absent from the screen instances. */
export const IosInScreen: Story = { args: {} };

export const Default: Story = { args: { type: 'default' } };
