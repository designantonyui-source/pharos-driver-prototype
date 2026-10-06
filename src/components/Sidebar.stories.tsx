import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from './Sidebar';

/**
 * Figma 82:150 `Pharos/Sidebar` — one story per variant of the set, in set order.
 * The set is FIXED 280x720, so the decorator supplies exactly that box; the 30 instances on page 21
 * are stretched to 280x900 and the `flex-1` spacer absorbs the extra height (116 -> 296).
 */
const meta = {
  title: 'Web shell/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="h-[720px] w-[280px]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Role=Driver `82:146` — 5 rows, "Load search" active. */
export const Driver: Story = { args: { role: 'driver' } };

/** Role=Dispatcher `82:147` — 5 rows, "Orders" active. */
export const Dispatcher: Story = { args: { role: 'dispatcher' } };

/** Role=FleetManager `82:148` — 5 rows, "Overview" active. */
export const FleetManager: Story = { args: { role: 'fleet-manager' } };

/** Role=Admin `82:149` — 3 rows, "Access rights" active. */
export const Admin: Story = { args: { role: 'admin' } };
