/**
 * figma: prototype-led · TripDocumentsSheet stories
 * props: open, load, onClose
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary, radius-md
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { V2_LOADS } from '../../lib/v2/loads';
import { TripDocumentsSheet } from './TripDocumentsSheet';

const meta = {
  title: 'V2/TripDocumentsSheet',
  component: TripDocumentsSheet,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: { open: true, load: V2_LOADS[0], onClose: () => undefined },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TripDocumentsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Closed: Story = { args: { open: false } };
