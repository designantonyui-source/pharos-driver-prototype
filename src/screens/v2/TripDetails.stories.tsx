import type { Meta, StoryObj } from '@storybook/react-vite';
import { V2_LOADS } from '../../lib/v2/loads';
import { TripDetailsView } from './TripDetails';

const meta = {
  title: 'Screens/V2/TripDetails',
  component: TripDetailsView,
  args: { load: V2_LOADS[0], tripId: 'TR-nordcargo' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TripDetailsView>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Confirmed: Story = {};
export const Tomorrow: Story = { args: { load: V2_LOADS[2], tripId: 'TR-calais-lille' } };
export const Loaded: Story = { args: { load: V2_LOADS[0], tripId: 'TR-nordcargo' } };
