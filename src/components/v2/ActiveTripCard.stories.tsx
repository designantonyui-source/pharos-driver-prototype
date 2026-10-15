import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import type { LoadApplication } from '../../lib/store';
import { V2_LOADS } from '../../lib/v2/loads';
import { ActiveTripCard } from './ActiveTripCard';

const load = V2_LOADS.find((l) => l.id === 'lille-paris') ?? V2_LOADS[0];

const enRoutePickup: LoadApplication = {
  loadId: load.id,
  status: ApplicationStatus.CONFIRMED,
  submittedAt: null,
  tripStage: 'confirmed',
  enRouteTo: 'pickup',
};

const meta = {
  title: 'V2/ActiveTripCard',
  component: ActiveTripCard,
  decorators: [(Story) => <MemoryRouter><div className="w-[370px] p-[16px]"><Story /></div></MemoryRouter>],
  args: { load, application: enRoutePickup, progress: 0.25, onOpen: () => undefined },
} satisfies Meta<typeof ActiveTripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mock state from the brief: ~25% along the line, en route to pickup. */
export const Default: Story = {};

export const Hover: Story = { args: { interactive: true } };

export const Step1: Story = { args: { stepIndex: 0, progress: 0 } };
export const Step2: Story = { args: { stepIndex: 1, progress: 0.25 } };
export const Step3: Story = { args: { stepIndex: 2, progress: 0.5 } };
export const Step4: Story = { args: { stepIndex: 3, progress: 0.75 } };
export const Step5: Story = { args: { stepIndex: 4, progress: 1 } };

export const WithStepCaption: Story = { args: { showStepCaption: true } };
