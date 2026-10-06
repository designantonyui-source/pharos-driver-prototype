import type { Meta, StoryObj } from '@storybook/react-vite';
import { SortBy } from './SortBy';

/**
 * The four 370x48 rows of `Content=Sort, State=Sort by` (2767:27860). The selected row
 * carries the 20x20 `Lucide/Icon/Circle Check` — resolve the icon from the main component
 * name, the layer itself is only called `Selected`.
 */
const meta = { title: 'Components/SortBy', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2767:27860 · first row checked */
export const HighestPerKm: Story = {
  render: () => (
    <div className="w-[370px]">
      <SortBy />
    </div>
  ),
};

/** the same list with another row selected — proves the check follows the value */
export const SoonestDeadline: Story = {
  render: () => (
    <div className="w-[370px]">
      <SortBy value="Soonest deadline" />
    </div>
  ),
};
