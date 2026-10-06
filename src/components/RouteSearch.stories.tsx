import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteSearch } from './RouteSearch';

/**
 * One story per Figma variant of `Pharos/Route search + filters` (`340:404`).
 *
 * Every instance of this set lives on page 21 inside a 1440x900 desktop `Workspace` and is
 * 1112 wide, so the stories render it at that width on the canvas background instead of inside
 * the 402-wide phone frame the shared decorator draws. The phone sticky bar of page 30 is a
 * different composition — see the `StickyBarRow` story of `Components/FiltersButton`.
 */
const meta = {
  title: 'Components/RouteSearch',
  component: RouteSearch,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-[var(--color-bg-canvas)] p-[24px]">
        <div className="w-[1112px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof RouteSearch>;
export default meta;
type Story = StoryObj<typeof meta>;

/** `340:207` · State=Closed · 1112x128 — used by 16 of the 18 instances */
export const Closed: Story = {
  args: { state: 'closed' },
};

/** `340:241` · State=Expanded · 1112x386 — `340:5812` on `D01f · Поиск / Фильтры раскрыты` */
export const Expanded: Story = {
  args: { state: 'expanded' },
};

/** `340:355` · State=Applied · 1112x128 — `340:6020` on `D01f · Поиск / Фильтры применены` */
export const Applied: Story = {
  args: { state: 'applied' },
};
