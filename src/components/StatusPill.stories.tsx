import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';

/**
 * Figma 11:148 `Pharos/Status` — one story per Figma tone, in the order of the component set.
 * Every variant of the set carries the same label, "In transit".
 */
const meta = { title: 'Components/StatusPill', component: StatusPill, args: { label: 'In transit' } } satisfies Meta<typeof StatusPill>;
export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Info: Story = { args: { tone: 'info' } };
export const Success: Story = { args: { tone: 'success' } };
export const Warning: Story = { args: { tone: 'warning' } };
export const Danger: Story = { args: { tone: 'danger' } };
export const Match: Story = { args: { tone: 'match' } };
