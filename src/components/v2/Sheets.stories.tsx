import { CancelApplicationSheet } from './CancelApplicationSheet';
import { CancelTripSheet } from './CancelTripSheet';
import { RemoveMethodSheet } from './RemoveMethodSheet';
import { V2_LOADS } from '../../lib/v2/loads';
import type { PayoutMethod } from '../../lib/profile';
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
    <FiltersSheet open active={['rate', 'near']} countFor={(draft) => 3 - draft.length} onApply={() => undefined} onClose={() => undefined} />
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

/** Recent: one tap recalls a route, no typing. */
export const RouteRecent: Story = {
  render: () => (
    <RouteSheet
      open
      value={{ from: '', to: 'Antwerp' }}
      countFor={(route) =>
        route.to.trim().toLocaleLowerCase() === 'brussels' ? 2
        : route.to.trim().toLocaleLowerCase() === 'antwerp' ? 1 : 0}
      onApply={() => undefined}
      onClose={() => undefined}
      cities={['Brussels', 'Antwerp', 'Paris']}
      recentRoutes={[{ from: 'Paris', to: 'Brussels' }, { from: '', to: 'Antwerp' }]}
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

const IBAN_METHOD: PayoutMethod = {
  kind: 'iban', id: 'iban-1', iban: 'DE89370400440532013000', label: 'Business account', isDefault: true, verified: true,
};
const CARD_METHOD: PayoutMethod = {
  kind: 'card', id: 'card-1', last4: '4242', brand: 'Visa', label: 'Fuel card', isDefault: false, verified: true,
};

/** The only saved method — removing it blocks cash out. */
export const RemoveMethodOnlyOne: Story = {
  render: () => <RemoveMethodSheet open method={IBAN_METHOD} remainingCount={0} removing={false} onConfirm={() => undefined} onClose={() => undefined} />,
};
/** The default method — another saved method takes over. */
export const RemoveMethodDefault: Story = {
  render: () => <RemoveMethodSheet open method={IBAN_METHOD} remainingCount={1} removing={false} onConfirm={() => undefined} onClose={() => undefined} />,
};
/** A card, and a non-default method — the other methods stay available. */
export const RemoveMethodCard: Story = {
  render: () => <RemoveMethodSheet open method={CARD_METHOD} remainingCount={2} removing={false} onConfirm={() => undefined} onClose={() => undefined} />,
};
export const RemoveMethodLoading: Story = {
  render: () => <RemoveMethodSheet open method={IBAN_METHOD} remainingCount={1} removing onConfirm={() => undefined} onClose={() => undefined} />,
};
export const RemoveMethodError: Story = {
  render: () => <RemoveMethodSheet open method={IBAN_METHOD} remainingCount={1} removing={false} error="Could not remove this method. Please try again." onConfirm={() => undefined} onClose={() => undefined} />,
};
