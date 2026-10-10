import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { SmartLoadList } from './SmartLoadList';
import type { V2Load } from '../../lib/v2/loads';

const loads: V2Load[] = [
  {
    id: 'nordcargo',
    company: 'NordCargo',
    rating: 4.8,
    rate: 360,
    perKm: 3.24,
    km: 111,
    from: 'Lille',
    to: 'Brussels',
    day: 'today',
    window: '14:00–15:00',
    deliveryDay: 'today',
    deliveryWindow: '17:00–18:00',
    pickupKm: 18,
    pickupMin: 25,
    vehicle: 'Curtainsider · 12.4 t · 18 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 80,
    approvalsBy: '11:00',
  },
  {
    id: 'belroute',
    company: 'BelRoute',
    rating: 4.6,
    rate: 210,
    perKm: 3.1,
    km: 68,
    from: 'Ghent',
    to: 'Antwerp',
    day: 'today',
    window: '16:00–17:00',
    deliveryDay: 'today',
    deliveryWindow: '18:00–19:00',
    pickupKm: 42,
    pickupMin: 45,
    vehicle: 'Curtainsider · 10 t · 14 pallets',
    paidIn: 'Paid in 14 days',
    decideMin: 125,
    approvalsBy: '12:30',
  },
];

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
