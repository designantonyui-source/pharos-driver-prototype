/** figma: new Schedules proposal (Wave 3), not measured; tokens: inherited */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Schedules } from './Schedules';
const meta = {
  title: 'Screens/V2/Schedules', component: Schedules,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Schedules>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
