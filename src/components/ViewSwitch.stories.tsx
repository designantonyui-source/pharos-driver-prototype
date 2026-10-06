import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewSwitch } from './ViewSwitch';

/**
 * One story per Figma variant of `Pharos/App/View switch` (`2041:411`). The widths are the
 * variant boxes from the set (226 for two segments, 336 for three) — inside a segment the box
 * grows to fill, so a 370-wide instance divides as (370 - 4 padding - 2 stroke) / 3 = 121.33.
 * Labels come from the master `List` / `Map` layers: the component has no text property in
 * Figma, every screen instance overrides the layers by hand.
 */
const meta = {
  title: 'Components/ViewSwitch',
  component: ViewSwitch,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ViewSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

const SEGMENTS_2 = ['Section 1', 'Section 2'];
const SEGMENTS_3 = ['Section 1', 'Section 2', 'Section 3'];

/** `2041:406` · Segments=2, Selected=1 · 226x48 */
export const Segments2Selected1: Story = {
  args: { segments: SEGMENTS_2, defaultValue: 'Section 1', className: 'w-[226px]' },
};

/** `2041:407` · Segments=2, Selected=2 · 226x48 */
export const Segments2Selected2: Story = {
  args: { segments: SEGMENTS_2, defaultValue: 'Section 2', className: 'w-[226px]' },
};

/** `2041:408` · Segments=3, Selected=1 · 336x48 */
export const Segments3Selected1: Story = {
  args: { segments: SEGMENTS_3, defaultValue: 'Section 1', className: 'w-[336px]' },
};

/** `2041:409` · Segments=3, Selected=2 · 336x48 */
export const Segments3Selected2: Story = {
  args: { segments: SEGMENTS_3, defaultValue: 'Section 2', className: 'w-[336px]' },
};

/** `2041:410` · Segments=3, Selected=3 · 336x48 */
export const Segments3Selected3: Story = {
  args: { segments: SEGMENTS_3, defaultValue: 'Section 3', className: 'w-[336px]' },
};

/**
 * Not a Figma variant — the real copy at the real instance width: `2217:8769`
 * "View switch / заявки" is 370x48 inside `Scroll content` (402 wide, pad 16) and its
 * segments measure 121.33 each.
 */
export const CurrentExpiredDeclined: Story = {
  args: {
    segments: ['Current', 'Expired', 'Declined'],
    defaultValue: 'Current',
    className: 'w-[370px]',
  },
};
