import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripChecklist } from './TripChecklist';

/**
 * `Pharos/App/Trip checklist` = 2715:1596 in its `State=Awaiting` instance (2715:25520),
 * the only state the bottom sheet uses (Content=Request).
 */
const meta = { title: 'Components/TripChecklist', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2715:25520 · 370x190 · four `Waiting` rows */
export const Awaiting: Story = {
  render: () => (
    <div className="w-[370px]">
      <TripChecklist />
    </div>
  ),
};
