import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

/**
 * Figma 74:64 `Pharos/Avatar` — one story per Figma variant (Size=Small 74:56 / Size=Medium 74:57).
 * The Figma text property "Initials" is "AK"; the app also instances "NC" for NordCargo.
 */
const meta = { title: 'Components/Avatar', component: Avatar } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Small: Story = { args: { size: 'small', initials: 'AK' } };
export const Medium: Story = { args: { size: 'medium', initials: 'AK' } };
