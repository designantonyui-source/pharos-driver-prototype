import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { TabBar } from './TabBar';

/** The four variants of 586:67 — one per active tab. */
const meta = {
  title: 'App shell/Tab bar',
  component: TabBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof TabBar>;
export default meta;
type Story = StoryObj<typeof TabBar>;

export const LoadsActive: Story = { args: { active: 'Loads' } };

export const ApplicationsActive: Story = { args: { active: 'Applications' } };

export const MyDayActive: Story = { args: { active: 'My day' } };

export const AccountActive: Story = { args: { active: 'Account' } };
