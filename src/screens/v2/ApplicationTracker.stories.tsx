import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { ApplicationTrackerView } from './ApplicationTracker';

const meta = {
  title: 'Screens/V2/ApplicationTracker',
  component: ApplicationTrackerView,
  args: {
    load: V2_LOADS[0],
    onCancel: () => undefined,
    onViewTrip: () => undefined,
    onSimilarLoads: () => undefined,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ApplicationTrackerView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sent: Story = { args: { status: ApplicationStatus.SENT } };
export const DispatcherReview: Story = { args: { status: ApplicationStatus.DISPATCHER_REVIEW } };
export const CustomerReview: Story = { args: { status: ApplicationStatus.CUSTOMER_REVIEW } };
export const Confirmed: Story = { args: { status: ApplicationStatus.CONFIRMED } };
export const Rejected: Story = { args: { status: ApplicationStatus.REJECTED } };
export const Cancelled: Story = { args: { status: ApplicationStatus.CANCELLED } };
