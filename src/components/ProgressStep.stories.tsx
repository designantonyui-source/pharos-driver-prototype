import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressStep } from './ProgressStep';

/**
 * `Pharos/App/Progress step` `2553:1238` — the shared row used by `Pharos/App/Trip steps` and
 * `Pharos/App/Application progress`. One story per Figma variant (State=Done/Current/Next).
 */
const meta = { title: 'Components/ProgressStep', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2553:1225 · Frame #e8f6ef, number #216547, Title DM Sans Regular 14/20 #172a35 */
export const Done: Story = {
  render: () => (
    <div className="w-[338px]">
      <ProgressStep state="done" number={1} label="Application sent" />
    </div>
  ),
};

/** 2553:1231 · Frame #225d74, number #ffffff, Title DM Sans Medium 14/20 #225d74 */
export const Current: Story = {
  render: () => (
    <div className="w-[338px]">
      <ProgressStep state="current" number={2} label="Dispatcher approval" />
    </div>
  ),
};

/** 2553:1237 · Frame #eff2f5, number #586d79, Title DM Sans Regular 14/20 #586d79 */
export const Next: Story = {
  render: () => (
    <div className="w-[338px]">
      <ProgressStep state="next" number={3} label="Customer confirmation" />
    </div>
  ),
};
