import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { NavigationBar } from './NavigationBar';

/** Type=Home 586:25 (76 tall) · Type=Back 586:32 (60 tall). Figma hides the avatar in Home. */
const meta = {
  title: 'App shell/Navigation bar',
  component: NavigationBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof NavigationBar>;
export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Home: Story = { args: { type: 'home', title: 'Loads' } };

export const HomeWithAvatar: Story = { args: { type: 'home', title: 'Loads', avatar: 'AK' } };

export const Back: Story = { args: { type: 'back', title: 'Load details' } };

export const BackWithTrailing: Story = {
  args: {
    type: 'back',
    title: 'Load details',
    trailing: (
      <span className="flex h-[44px] w-[68px] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-bg-disabled)] text-label-14 text-[var(--color-action-primary)]">
        Loads
      </span>
    ),
  },
};
