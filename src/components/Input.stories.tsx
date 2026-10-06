import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
const meta = { title: 'Components/Input', component: Input } satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof Input>;
export const Empty: Story = { args: { label: 'Start' } };
export const Filled: Story = { args: { label: 'Start', value: 'Lille, France', state: 'filled' } };
export const Focus: Story = { args: { label: 'Start', value: 'Li', state: 'focus' } };
export const Error: Story = { args: { label: 'Start', value: 'Lille, France', state: 'error', hint: 'Start and destination must differ' } };
