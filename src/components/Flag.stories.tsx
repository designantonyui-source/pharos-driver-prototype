import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flag } from './Flag';

/**
 * Figma 249:1646 `Pharos/Country flag Rectangle` — one story per Figma country variant.
 * Both stories use `size={24}`, the component set's own 24x24 geometry; inside the app the
 * Offer card instances the set at 18x18, which is the component default.
 */
const meta = { title: 'Components/Flag', component: Flag } satisfies Meta<typeof Flag>;
export default meta;
type Story = StoryObj<typeof Flag>;

export const France: Story = { args: { country: 'France', size: 24 } };
export const Belgium: Story = { args: { country: 'Belgium', size: 24 } };
