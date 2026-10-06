import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

/**
 * One story per Figma type (575:9632) plus the copy the driver journey uses.
 * Figma also carries a hidden third line — see `WithDetail`.
 */
const meta = { title: 'Components/Alert', component: Alert } satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = { args: { type: 'info', title: 'Notification title', children: 'Notification description' } };

export const Warning: Story = { args: { type: 'warning', title: 'Notification title', children: 'Notification description' } };

export const Error: Story = { args: { type: 'error', title: 'Notification title', children: 'Notification description' } };

export const Success: Story = { args: { type: 'success', title: 'Notification title', children: 'Notification description' } };

export const Neutral: Story = { args: { type: 'neutral', title: 'Notification title', children: 'Notification description' } };

export const WithDetail: Story = {
  args: { type: 'info', title: 'Notification title', children: 'Notification description', detail: 'Detail' },
};

export const WaitingDispatcher: Story = { args: { type: 'info', title: 'Awaiting dispatcher', children: 'This load isn’t secured yet. Both approvals are needed by 11:00.' } };

export const WaitingCustomer: Story = { args: { type: 'success', title: 'Awaiting customer', children: 'Dispatcher approved. Customer confirmation is needed by 11:00.' } };

export const LocationFailed: Story = { args: { type: 'error', title: 'Couldn’t get your location', children: 'Enter a city instead.' } };
