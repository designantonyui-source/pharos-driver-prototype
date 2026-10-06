import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';

/**
 * Figma 167:65 `Pharos/Page header` — one story per variant of the set, in set order.
 * Both variants are 1112 wide on page 21 (the `Workspace` frame is 1160 with 24 padding), so the
 * decorator supplies that width; the component has no fill of its own and shows the canvas.
 */
const meta = {
  title: 'Web shell/Page header',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[1112px] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof PageHeader>;

/** Layout=Inline `167:49` — 1112x40, [Title hug 306] [Status 130], nothing stretched. */
export const Inline: Story = {
  args: {
    layout: 'inline',
    title: 'Loads on your route',
    status: { label: 'Vehicle available', tone: 'success' },
  },
};

/** Layout=Actions `167:57` — 1112x48, [Title fills 766] [Status 130] [Button 168]. */
export const Actions: Story = {
  args: {
    layout: 'actions',
    title: 'Loads on your route',
    status: { label: 'Vehicle available', tone: 'success' },
    action: { label: 'To the selected load' },
  },
};
