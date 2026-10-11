/** figma: new Account proposal, not measured; reuses identity 769:10428
 * props: story states; tokens: inherited from Account
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Account, EditContact } from './Account';
import { DismissedLoads } from './DismissedLoads';
const meta = {
  title: 'Screens/V2/Account', component: Account,
  decorators: [(Story, context) => context.name === 'Edit' ? <Story /> : <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Account>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Profile: Story = { args: { detail: true } };
export const Dismissed: Story = {
  render: () => <MemoryRouter><DismissedLoads /></MemoryRouter>,
};
export const Edit: Story = {
  decorators: [],
  render: () => <RouterProvider router={createMemoryRouter([
    { path: '/v2/account/profile/edit', element: <EditContact /> },
    { path: '*', element: <Account detail /> },
  ], { initialEntries: ['/v2/account/profile/edit'] })} />,
};
