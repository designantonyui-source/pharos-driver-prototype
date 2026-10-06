import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteSummary } from './RouteSummary';

/**
 * Figma `671:977` — `Pharos/App/Route summary`, the mobile set (370x92). It has no variants:
 * every one of its six instances on page 30 is the same 370x92 card. The stories below are the
 * widths the instance is used at (370 in a 402-wide screen, 251.6 in a scaled case-study mock)
 * plus the no-action state.
 *
 * `26:27` · `Pharos/Route summary` (358x170) is a different, web-only component and is not
 * ported — no instance of it is placed on page 21 or page 30. See the component contract header.
 */
const meta = {
  title: 'Components/RouteSummary',
  component: RouteSummary,
  parameters: { layout: 'centered' },
  args: { from: 'Lille', to: 'Brussels' },
  decorators: [
    (Story) => (
      <div style={{ width: 370 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RouteSummary>;
export default meta;
type Story = StoryObj<typeof RouteSummary>;

/** `671:977` at its component geometry — 370x92, the size all six page-30 instances use. */
export const Default: Story = {};

/** Without `onEdit` the `Edit action` layer is static text (Figma draws it as a bare TEXT layer). */
export const WithoutEdit: Story = { args: { onEdit: undefined } };

/** The same card at the scaled case-study instance width, `2320:9671` (251.6x62.56). */
export const CaseStudyWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 251.6 }}>
        <Story />
      </div>
    ),
  ],
};
