import type { Meta, StoryObj } from '@storybook/react-vite';
import { SuggestionCard } from './SuggestionCard';

/**
 * The 354x80 city card from the four "current / suggestions" states of `Content=Route`
 * (2197:7975, 2197:8028, 2197:8277, 2197:8330). Same box in all four; only the caption
 * above it (`Current selection` vs `Suggestions`) and the button label change.
 */
const meta = { title: 'Components/SuggestionCard', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2197:7975 / 2197:8277 */
export const Lille: Story = {
  render: () => (
    <div className="w-[354px]">
      <SuggestionCard actionLabel="Select Lille" />
    </div>
  ),
};

/** 2197:8028 / 2197:8330 */
export const Brussels: Story = {
  render: () => (
    <div className="w-[354px]">
      <SuggestionCard title="Brussels" subtitle="Belgium" actionLabel="Select Brussels" />
    </div>
  ),
};
