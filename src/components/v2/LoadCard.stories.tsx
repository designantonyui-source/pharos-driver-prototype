import { useEffect } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { V2_LOADS } from '../../lib/v2/loads';
import { LoadCard } from './LoadCard';

const withStatus = (status: ApplicationStatus | null): Decorator => function State(Story) {
  useEffect(() => {
    store.reset();
    if (status) store.set({ loadId: 'nordcargo', status });
    return () => store.reset();
  }, []);
  return <MemoryRouter><div data-load-overlay-root className="relative h-[var(--screen-h)] w-[var(--screen-w)] p-[16px]"><Story /></div></MemoryRouter>;
};
const meta = {
  title: 'V2/LoadCard',
  component: LoadCard,
  args: { load: V2_LOADS[0], isOnRoute: true, onOpen: () => undefined },
} satisfies Meta<typeof LoadCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = { decorators: [withStatus(null)] };
export const Pending: Story = { decorators: [withStatus(ApplicationStatus.SENT)] };
export const Booked: Story = { decorators: [withStatus(ApplicationStatus.CONFIRMED)] };
export const Rejected: Story = { decorators: [withStatus(ApplicationStatus.REJECTED)] };
export const Cancelled: Story = { decorators: [withStatus(ApplicationStatus.CANCELLED)] };
