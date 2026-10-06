import type { Meta, StoryObj } from '@storybook/react-vite';
import { DayItem } from './DayItem';

/**
 * `Pharos/App/Day item` `2021:2666` — three variants (Type=Trip / Decision / Free).
 * `Trip` and `Decision` also show the difference between the component set and the screen
 * instances: see the DayItem contract header.
 */
const meta = { title: 'Components/DayItem', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

/** 2025:3320 · Type=Trip as the screens draw it — #ebf3f7 card, 1.5px #225d74 ring, 370x87 */
export const Trip: Story = {
  render: () => (
    <DayItem
      type="trip"
      time="14:00"
      title="Assigned · TR-4821"
      second="14:00–15:00 · pickup in Lille"
      third="By 19:00 · delivery in Brussels"
    />
  ),
};

/** 2021:2663 · Type=Trip as the component set defines it — white card, 1px #8093a0 ring, 370x86 */
export const TripSetVariant: Story = {
  render: () => (
    <DayItem
      type="trip"
      tripTone="plain"
      time="14:00"
      title="Heading"
      second="Second line"
      third="Third line"
    />
  ),
};

/** 2021:2664 · Type=Decision — the "by 11:00" window pill on the second row, 370x72 */
export const Decision: Story = {
  render: () => (
    <DayItem type="decision" time="10:00" title="Heading" second="Second line" window="by 11:00" />
  ),
};

/** 2731:1294 · Type=Free — dashed 1.5px #225d74 ring, third line is a link */
export const Free: Story = {
  render: () => (
    <DayItem
      type="free"
      time="11:00"
      title="Window 11:00–13:15"
      second="25 min travel + 20 min buffer"
      third="Check matching loads →"
      thirdTone="link"
    />
  ),
};

/** 2731:1301 · the Time column wraps inside its fixed 68px box ("After\n19:00") */
export const FreeWrappedTime: Story = {
  render: () => (
    <DayItem
      type="free"
      time={'After\n19:00'}
      title="Window after delivery"
      second="Brussels · time to be confirmed"
      third="Find the next load →"
      thirdTone="link"
    />
  ),
};
