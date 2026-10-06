import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterChipV2 } from './FilterChipV2';

/**
 * One story per Figma variant of `Pharos/Filter chip v2` (`2621:1288`). The first three are the
 * 44-tall toggle (a 34-tall pill under 5px of padding); State=Applied is its own 40-tall pill.
 */
const meta = {
  title: 'Components/FilterChipV2',
  component: FilterChipV2,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FilterChipV2>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `2621:1277` · State=Default · 92x44 */
export const Default: Story = {
  args: { label: 'Tomorrow' },
};

/** `2621:1283` · State=Selected · 112x44 */
export const Selected: Story = {
  args: { label: 'Tomorrow', state: 'selected' },
};

/** `2621:1287` · State=Disabled · 92x44 */
export const Disabled: Story = {
  args: { label: 'Tomorrow', state: 'disabled' },
};

/** `2650:1306` · State=Applied · 106x40 */
export const Applied: Story = {
  args: { label: 'Tomorrow', state: 'applied' },
};

/**
 * Not a Figma variant — the only shape the app uses (all 11 instances): the 370x40
 * `Applied filters` row `2551:12646`, gap 8, with `2650:21945` "Today" 80x40 and
 * `2650:21951` "€300–400" 117x40.
 */
export const AppliedFiltersRow: Story = {
  args: { label: 'Today', state: 'applied' },
  render: () => (
    <div className="flex w-[370px] items-center gap-[8px] py-[0px]">
      <FilterChipV2 label="Today" state="applied" />
      <FilterChipV2 label="€300–400" state="applied" />
    </div>
  ),
};
