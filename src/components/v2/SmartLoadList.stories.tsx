import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { SmartLoadList } from './SmartLoadList';
import { V2_LOADS } from '../../lib/v2/loads';

const loads = [V2_LOADS[0], V2_LOADS[1]];

const screen: Decorator = (Story) => (
  <div className="flex h-[var(--screen-h)] w-[var(--screen-w)] flex-col bg-[var(--color-bg-canvas)] p-[16px]">
    <MemoryRouter><Story /></MemoryRouter>
  </div>
);

const meta = {
  title: 'V2/SmartLoadList',
  component: SmartLoadList,
  decorators: [screen],
  parameters: { layout: 'fullscreen' },
  args: {
    loads,
    currentRoute: { from: 'Lille', to: 'Brussels' },
    onOpen: () => undefined,
  },
} satisfies Meta<typeof SmartLoadList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};
export const Loading: Story = { args: { loads: [], loading: true } };
export const Empty: Story = { args: { loads: [] } };
