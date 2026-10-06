import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyDetailsPanel } from './EmptyDetailsPanel';

/**
 * `Pharos/Empty details panel` (129:46) is a single component whose `Title`, `Description` and
 * `Icon` are properties, so the stories are its six instances: the panel changes height with the
 * description (154 for one line, 174 for two) and the icon swaps for the loading copy.
 */
const meta = { title: 'Components/EmptyDetailsPanel', component: EmptyDetailsPanel } satisfies Meta<
  typeof EmptyDetailsPanel
>;
export default meta;
type Story = StoryObj<typeof EmptyDetailsPanel>;

/** 130:1108 / 565:6896 · 628x154 · Search icon. The component's own geometry is 648x154. */
export const SelectALoad: Story = {
  args: {
    title: 'Select a load',
    description: 'Select a card on the left to see trip terms, payment and customer details.',
  },
};

/** 130:1308 · 628x174 — the same panel, one line longer. */
export const NoMatchingLoads: Story = {
  args: {
    title: 'No matching loads',
    description:
      'No matches on the current route. Change the direction in the search above and tap “Find loads”.',
  },
};

/** 208:2413 · 636x154 — the `Icon` swap to `Lucide/Icon/Loader` (279:5034). */
export const Refreshing: Story = {
  args: {
    icon: 'loader',
    title: 'Refreshing the load list',
    description: 'Wait for the results to pick a load and check the terms.',
  },
};

/** 2207:8233 · 370x174 — the page-30 instance, i.e. the panel at real card width. */
export const NoLoadsForThisWindow: Story = {
  args: {
    title: 'No loads for this window',
    description:
      'Finish in Lille by 13:15. Allow 25 minutes to travel and a 20-minute buffer before pickup at 14:00.',
  },
};
