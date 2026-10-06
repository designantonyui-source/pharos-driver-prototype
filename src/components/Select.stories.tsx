import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

/**
 * One story per Figma variant of `Pharos/Select` (344:51):
 * State=Closed `344:26` · State=Open `344:32` · State=Disabled `344:45`.
 * `Open` is interactive: the control toggles on click, so the panel can be closed here.
 */
const meta = { title: 'Components/Select', component: Select } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof Select>;

const OPTIONS = ['Curtainsider', 'Refrigerated', 'Box truck'];

/** 344:26 · 206x76 — the 206 is the set's frame; the driver-page instance is 254 wide. */
export const Closed: Story = { args: { label: 'Body type', value: 'Curtainsider', options: OPTIONS } };

/** 344:32 · 206x202 — control border turns 1px #225d74 and the 118-tall options panel appears. */
export const Open: Story = {
  args: { label: 'Body type', value: 'Curtainsider', options: OPTIONS, defaultOpen: true },
};

/** 344:45 · 206x76 — fill #e8edf0, border #d7e0e6, value #80929e; the chevron keeps #586d79. */
export const Disabled: Story = {
  args: { label: 'Body type', value: 'Curtainsider', options: OPTIONS, disabled: true },
};
