/** figma: not mapped · Driver v2 dismissed loads
 * props: DismissedLoadsView states
 * tokens: inherited from DismissedLoadsView
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { V2_LOADS } from '../../lib/v2/loads';
import { DismissedLoadsView } from './DismissedLoads';

const meta = {
  title: 'Screens/V2/DismissedLoads',
  component: DismissedLoadsView,
  decorators: [Story => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
  args: { loads: V2_LOADS, loading: false, fetchError: false, mutationError: null, busy: false, restored: null, onRetry: () => {}, onRestore: () => {}, onUndo: () => {} },
} satisfies Meta<typeof DismissedLoadsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { loads: [] } };
export const FetchError: Story = { args: { fetchError: true } };
export const Restoring: Story = { args: { busy: true } };
export const Restored: Story = { args: { loads: V2_LOADS.slice(1), restored: V2_LOADS[0] } };
export const UndoPending: Story = { args: { ...Restored.args, busy: true } };
export const RestoreError: Story = { args: { mutationError: 'Could not restore this load. Try Restore again.' } };
export const UndoError: Story = { args: { ...Restored.args, mutationError: 'Could not undo the restore. Try Undo again.' } };
