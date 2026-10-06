import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteFields, EMPTY_CITY } from './RouteFields';

/**
 * `Route / Connected stops` = 2197:7929 — the 354x144 block that every `Content=Route`
 * layout except the four suggestions/current ones carries.
 */
const meta = { title: 'Components/RouteFields', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2197:7919 · both cities set — origin dot filled, destination is a ring */
export const Filled: Story = {
  render: () => (
    <div className="w-[354px]">
      <RouteFields />
    </div>
  ),
};

/** 2197:8222 / 2197:8383 · destination still empty */
export const DestinationEmpty: Story = {
  render: () => (
    <div className="w-[354px]">
      <RouteFields from="Lille, France" to={EMPTY_CITY} />
    </div>
  ),
};

/** 2197:8167 · both rows on the Figma placeholder copy */
export const Empty: Story = {
  render: () => (
    <div className="w-[354px]">
      <RouteFields from={EMPTY_CITY} to={EMPTY_CITY} />
    </div>
  ),
};
