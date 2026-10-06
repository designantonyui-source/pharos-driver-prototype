import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChip } from './FilterChip';

/**
 * The two Figma variants of `Pharos/Filter chip` (`338:211`), both 108x34 with the master label
 * "Curtainsider". The width hugs the label: 12 + text + 12 + the 1px INSIDE stroke.
 */
const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `338:207` · State=Default · 108x34 */
export const Default: Story = {
  args: { label: 'Curtainsider' },
};

/** `338:209` · State=Selected · 108x34 */
export const Selected: Story = {
  args: { label: 'Curtainsider', selected: true },
};

/**
 * Not a Figma variant — the six instances of page 30 (`2065:2813`…`2065:2824`) at their real
 * labels and hug widths: ADR 54 · Part loads 92 · Tail lift 69 · Rear loading 107 · Side 55 ·
 * Top 51, three per `Chips` row (231x34 and 229x34, gap 8).
 */
export const VehicleOnboardingRow: Story = {
  args: { label: 'ADR', selected: true },
  render: () => (
    <div className="flex w-[370px] flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <FilterChip label="ADR" selected />
        <FilterChip label="Part loads" />
        <FilterChip label="Tail lift" selected />
      </div>
      <div className="flex items-center gap-[8px]">
        <FilterChip label="Rear loading" selected />
        <FilterChip label="Side" />
        <FilterChip label="Top" />
      </div>
    </div>
  ),
};
