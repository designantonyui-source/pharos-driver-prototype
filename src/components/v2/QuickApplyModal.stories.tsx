import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { V2_LOADS } from '../../lib/v2/loads';
import { QuickApplyModal } from './QuickApplyModal';

const screen: Decorator = (Story) => (
  <div className="relative h-[var(--screen-h)] w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
    <Story />
  </div>
);

const meta = {
  title: 'V2/QuickApplyModal',
  component: QuickApplyModal,
  parameters: { layout: 'fullscreen' },
  decorators: [screen],
  args: {
    loadId: V2_LOADS[0].id,
    load: V2_LOADS[0],
    onCancel: () => undefined,
    onSubmitted: () => undefined,
  },
} satisfies Meta<typeof QuickApplyModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
