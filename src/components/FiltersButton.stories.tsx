import type { Meta, StoryObj } from '@storybook/react-vite';
import { FiltersButton } from './FiltersButton';
import { ViewSwitch } from './ViewSwitch';

/**
 * The two Figma variants of `Pharos/Filters button` (`2646:1314`). They differ only by the
 * 20x20 count badge, so a story per variant is a story per `count`.
 * Hug widths: 95 without the badge, 123 with it.
 */
const meta = {
  title: 'Components/FiltersButton',
  component: FiltersButton,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FiltersButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `2646:1288` · Badge=Shown · 123x48 */
export const BadgeShown: Story = {
  args: { count: 2 },
};

/** `2646:1302` · Badge=Hidden · 95x48 */
export const BadgeHidden: Story = {
  args: {},
};

/**
 * Not a Figma variant — the composition the screens actually use: `Search controls v2 /
 * sticky bar` (`2668:14779`, 402x64, pad 8/16) holds `... / filters and view` (`2668:14780`,
 * 370x48, gap 8) with the button on the left and the view switch on the right.
 * With the badge the switch is 239 wide (123 + 8 + 239 = 370); without it, 267 (95 + 8 + 267).
 */
export const StickyBarRow: Story = {
  render: () => (
    <div className="flex w-[402px] flex-col gap-[16px] bg-[var(--color-bg-canvas)] px-[16px] py-[8px]">
      <div className="flex w-[370px] items-center gap-[8px]">
        <FiltersButton count={2} />
        <ViewSwitch segments={['List', 'Map']} defaultValue="List" className="flex-1" />
      </div>
      <div className="flex w-[370px] items-center gap-[8px]">
        <FiltersButton />
        <ViewSwitch segments={['List', 'Map']} defaultValue="List" className="flex-1" />
      </div>
    </div>
  ),
};
