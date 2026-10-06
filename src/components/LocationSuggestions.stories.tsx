import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationSuggestions } from './LocationSuggestions';

/**
 * One story per Figma variant of `Pharos/Location suggestions` (190:117):
 * State=Results `190:59` · State=Loading `190:85` · State=Empty `190:98` · State=Error `190:107`,
 * plus the `Show second option` boolean, which the page-30 Results instances set to false.
 * The 440 width is the set's frame — the driver screens instance it at 370.
 */
const meta = { title: 'Components/LocationSuggestions', component: LocationSuggestions } satisfies Meta<
  typeof LocationSuggestions
>;
export default meta;
type Story = StoryObj<typeof LocationSuggestions>;

/** 190:59 · 440x166 — two options. */
export const Results: Story = { args: { state: 'results' } };

/** 2776:1761 / 2776:1935 · 370x108 — `Show second option` = false. */
export const ResultsSecondOptionOff: Story = { args: { state: 'results', showSecond: false } };

/** 203:513 · the Belgium swap (`First flag` = 198:1645, "Brussels, Belgium"). */
export const ResultsBelgium: Story = {
  args: { state: 'results', first: { city: 'Brussels', country: 'Belgium' }, showSecond: false },
};

/** 190:85 · 440x54. */
export const Loading: Story = { args: { state: 'loading' } };

/** 190:98 · 440x98. The instance 2776:2109 overrides both strings — see the second story. */
export const Empty: Story = { args: { state: 'empty' } };

/** 2776:2109 · 370x98 with the instance's own copy. */
export const EmptyInstanceCopy: Story = {
  args: { state: 'empty', heading: 'No cities found', details: 'Check the spelling or try another city.' },
};

/** 190:107 · 440x182 — heading, two-line details and the Secondary "Try again" button on the left. */
export const Error: Story = { args: { state: 'error' } };
