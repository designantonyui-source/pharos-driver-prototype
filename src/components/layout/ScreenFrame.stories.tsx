import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScreenFrame } from './ScreenFrame';

/** The assembled 402x874 screen: status bar + nav bar + content + tab bar + home indicator. */
const meta = {
  title: 'App shell/ScreenFrame',
  component: ScreenFrame,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ScreenFrame>;
export default meta;
type Story = StoryObj<typeof ScreenFrame>;

export const LoadsHome: Story = {
  args: { title: 'Loads', activeTab: 'Loads' },
  render: (args) => (
    <ScreenFrame {...args}>
      <div className="absolute inset-x-0 top-[138px] px-[16px]">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-offer-border)] bg-[var(--color-offer-bg)] p-[17px]">
          <div className="text-rate-24 text-[var(--color-offer-text-price)]">€320</div>
          <div className="text-label-12 text-[var(--color-offer-text-secondary)]">€3.05/km loaded · 105 km loaded</div>
          <div className="mt-[8px] text-body-16 text-[var(--color-offer-text-primary)]">Tourcoing → Brussels</div>
        </div>
      </div>
    </ScreenFrame>
  ),
};

export const LoadDetails: Story = {
  args: { title: 'Load details', back: true, activeTab: 'Loads' },
  render: (args) => <ScreenFrame {...args} />,
};
