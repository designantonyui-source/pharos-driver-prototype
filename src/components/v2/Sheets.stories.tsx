import { CancelApplicationSheet } from './CancelApplicationSheet';
import { CancelTripSheet } from './CancelTripSheet';
import { V2_LOADS } from '../../lib/v2/loads';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { FILTERS, FiltersSheet } from './FiltersSheet';
import { RouteSheet } from './RouteSheet';

const meta = {
  title: 'V2/Sheets',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div data-load-overlay-root className="relative h-[var(--screen-h)] w-[var(--screen-w)] p-[16px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Full feed: nothing committed, draft previews all three. */
export const FiltersEmpty: Story = {
  render: () => (
    <FiltersSheet open active={[]} countFor={(draft) => 3 - draft.length} onApply={() => undefined} onClose={() => undefined} />
  ),
};

/** Two filters committed: badge would read 2, draft starts there. */
export const FiltersActive: Story = {
  render: () => (
    <FiltersSheet open active={['today', 'near']} countFor={(draft) => 3 - draft.length} onApply={() => undefined} onClose={() => undefined} />
  ),
};

/** Dead-end draft: preview warns before Apply. */
export const FiltersNoMatch: Story = {
  render: () => (
    <FiltersSheet open active={[]} countFor={() => 0} onApply={() => undefined} onClose={() => undefined} />
  ),
};

export const RouteChange: Story = {
  render: () => (
    <RouteSheet
      open
      value={{ from: '', to: 'Brussels' }}
      countFor={(route) => (route.to.trim().toLocaleLowerCase() === 'brussels' ? 1 : 0)}
      onApply={() => undefined}
      onClose={() => undefined}
    />
  ),
};

export const FilterCatalog: Story = {
  render: () => (
    <ul className="flex flex-col gap-[8px] text-body-14 text-[var(--color-text-primary)]">
      {FILTERS.map((f) => (
        <li key={f.id}>{f.section} — {f.label}</li>
      ))}
    </ul>
  ),
};
export const CancelApplication: Story = {
  render: () => <CancelApplicationSheet open load={V2_LOADS[0]} cancelling={false} onConfirm={() => undefined} onClose={() => undefined} />,
};
export const CancelApplicationLoading: Story = {
  render: () => <CancelApplicationSheet open load={V2_LOADS[0]} cancelling onConfirm={() => undefined} onClose={() => undefined} />,
};
export const CancelTripWarning: Story = {
  render: () => <CancelTripSheet open load={V2_LOADS[0]} penalty="warning" cancelling={false} onConfirm={() => undefined} onClose={() => undefined} />,
};
export const CancelTripLoading: Story = {
  render: () => <CancelTripSheet open load={V2_LOADS[0]} penalty="warning" cancelling onConfirm={() => undefined} onClose={() => undefined} />,
};
export const CancelTripError: Story = {
  render: () => <CancelTripSheet open load={V2_LOADS[0]} penalty="warning" cancelling={false} error="Could not cancel this trip. Please try again." onConfirm={() => undefined} onClose={() => undefined} />,
};
