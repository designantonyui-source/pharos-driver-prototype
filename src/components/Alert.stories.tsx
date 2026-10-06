import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
const meta = { title: 'Components/Alert', component: Alert } satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof Alert>;
export const WaitingDispatcher: Story = { args: { type: 'info', title: 'Awaiting dispatcher', children: 'This load isn’t secured yet. Both approvals are needed by 11:00.' } };
export const WaitingCustomer: Story = { args: { type: 'success', title: 'Awaiting customer', children: 'Dispatcher approved. Customer confirmation is needed by 11:00.' } };
export const LocationFailed: Story = { args: { type: 'error', title: 'Couldn’t get your location', children: 'Enter a city instead.' } };
