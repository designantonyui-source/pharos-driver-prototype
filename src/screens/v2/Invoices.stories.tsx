/** figma: new Invoices proposal (Wave 2), not measured; tokens: inherited */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { InvoiceDetails, InvoiceList } from './Invoices';
const meta = {
  title: 'Screens/V2/Invoices', component: InvoiceList,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InvoiceList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const List: Story = {};
export const Details: Story = {
  decorators: [],
  render: () => <RouterProvider router={createMemoryRouter([
    { path: '/v2/account/balance/invoices/:id', element: <InvoiceDetails /> },
    { path: '*', element: <InvoiceList /> },
  ], { initialEntries: ['/v2/account/balance/invoices/inv-2026-0042'] })} />,
};
