import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteSummaryWeb } from './RouteSummaryWeb';

/**
 * figma: 26:27 — a single component (no variants). `AppWidth` renders it at the 324 px the page-21
 * mobile screens instance it at; the default story is the component's own 358.
 */
const meta = {
  title: 'Components/RouteSummaryWeb',
  component: RouteSummaryWeb,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RouteSummaryWeb>;
export default meta;
type Story = StoryObj<typeof RouteSummaryWeb>;

export const Default: Story = {
  render: () => (
    <div className="w-[358px]">
      <RouteSummaryWeb />
    </div>
  ),
};

export const AppWidth: Story = {
  render: () => (
    <div className="w-[324px]">
      <RouteSummaryWeb />
    </div>
  ),
};

export const OtherLoad: Story = {
  render: () => (
    <div className="w-[358px]">
      <RouteSummaryWeb
        route="Tourcoing → Antwerp"
        schedule="2 Oct · delivery 08:00–10:00"
        equipment="Box trailer · 24 t · 33 pallets"
        rate="480 €"
        distance="186 km loaded"
      />
    </div>
  ),
};
