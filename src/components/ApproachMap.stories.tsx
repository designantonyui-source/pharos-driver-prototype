import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApproachMap } from './ApproachMap';

/**
 * figma: 719:355 — a single component (15 instances). Fullscreen: it is a 402x646 map, i.e. the
 * width of the whole screen, so the 16px page padding of the default decorator would be wrong.
 */
const meta = {
  title: 'Components/ApproachMap',
  component: ApproachMap,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ApproachMap>;
export default meta;
type Story = StoryObj<typeof ApproachMap>;

export const Default: Story = {};

export const DepartureToPickup: Story = {
  args: {
    summaryLabel: 'To pickup',
    summaryValue: '12 km · about 18 min',
    driverLabel: 'You',
    pickupLabel: 'Pickup · €420',
    caption: 'Approach to pickup point',
  },
};
