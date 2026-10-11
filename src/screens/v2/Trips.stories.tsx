/** figma: new Trips hub proposal, not measured; tokens: inherited */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { Trips } from './Trips';

function seed(entries: Record<string, { loadId: string; status: ApplicationStatus; cancelledAfterConfirm?: boolean; dismissed?: boolean }>) {
  return function Seed({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      store.reset();
      store.set({ applications: Object.fromEntries(Object.entries(entries).map(([id, a]) => [id, { ...a, submittedAt: null }])) });
      return () => store.reset();
    }, []);
    return <>{children}</>;
  };
}

const meta = {
  title: 'Screens/V2/Trips', component: Trips,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Trips>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Mixed: Story = {
  decorators: [(Story) => {
    const Seed = seed({
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED },
      belroute: { loadId: 'belroute', status: ApplicationStatus.SENT },
      'calais-lille': { loadId: 'calais-lille', status: ApplicationStatus.REJECTED },
    });
    return <MemoryRouter><Seed><Story /></Seed></MemoryRouter>;
  }],
};
export const AllPast: Story = {
  decorators: [(Story) => {
    const Seed = seed({
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, cancelledAfterConfirm: true },
      belroute: { loadId: 'belroute', status: ApplicationStatus.REJECTED },
      'calais-lille': { loadId: 'calais-lille', status: ApplicationStatus.CANCELLED },
    });
    return <MemoryRouter><Seed><Story /></Seed></MemoryRouter>;
  }],
};
