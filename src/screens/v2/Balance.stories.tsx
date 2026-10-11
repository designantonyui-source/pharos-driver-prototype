/** figma: new Balance proposal, not measured; tokens: inherited from Balance */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Balance, BalanceHistory, CashOut, PayoutMethodScreen } from './Balance';
const meta = {
  title: 'Screens/V2/Balance', component: Balance,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Balance>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Method: Story = { render: () => <MemoryRouter><PayoutMethodScreen /></MemoryRouter> };
export const Cashout: Story = { render: () => <MemoryRouter><CashOut /></MemoryRouter> };
export const History: Story = { render: () => <MemoryRouter><BalanceHistory /></MemoryRouter> };
