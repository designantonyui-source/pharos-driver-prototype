import { useEffect } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { LoadCta } from './LoadCta';

const stateDecorator = (status: ApplicationStatus | null): Decorator => function State(Story) {
  useEffect(() => {
    store.reset();
    if (status) store.set({ loadId: 'nordcargo', status });
    return () => store.reset();
  }, []);
  return <MemoryRouter><div data-load-overlay-root className="relative h-[var(--screen-h)] w-[var(--screen-w)]"><Story /></div></MemoryRouter>;
};

const meta = {
  title: 'V2/LoadCta',
  component: LoadCta,
  args: { loadId: 'nordcargo' },
} satisfies Meta<typeof LoadCta>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = { decorators: [stateDecorator(null)] };
export const Sent: Story = { decorators: [stateDecorator(ApplicationStatus.SENT)] };
export const DispatcherReview: Story = { decorators: [stateDecorator(ApplicationStatus.DISPATCHER_REVIEW)] };
export const CustomerReview: Story = { decorators: [stateDecorator(ApplicationStatus.CUSTOMER_REVIEW)] };
export const Confirmed: Story = { decorators: [stateDecorator(ApplicationStatus.CONFIRMED)] };
export const Rejected: Story = { decorators: [stateDecorator(ApplicationStatus.REJECTED)] };
export const Cancelled: Story = { decorators: [stateDecorator(ApplicationStatus.CANCELLED)] };
