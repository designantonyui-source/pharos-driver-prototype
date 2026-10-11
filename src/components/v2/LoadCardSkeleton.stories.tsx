import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { LoadCardSkeleton } from './LoadCardSkeleton';

const meta = {
  title: 'V2/LoadCardSkeleton',
  component: LoadCardSkeleton,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div data-load-overlay-root className="relative h-[var(--screen-h)] w-[var(--screen-w)] p-[16px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof LoadCardSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { count: 3 } };