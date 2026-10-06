import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

/**
 * Mirrors the six Mobile variants of `Pharos/Input` (12:166):
 * State=Empty/Filled/Focus/Error/Disabled/Readonly (12:160..12:165).
 * `Required` documents the hidden `Required` layer the set carries in every variant.
 */
const meta = { title: 'Components/Input', component: Input } satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof Input>;

export const Empty: Story = { args: { label: 'Pickup city' } };

export const Filled: Story = { args: { label: 'Pickup city', value: 'Hamburg, Germany', state: 'filled' } };

export const Focus: Story = { args: { label: 'Pickup city', value: 'Hamburg, Germany', state: 'focus' } };

export const Error: Story = { args: { label: 'Pickup city', value: 'Hamburg, Germany', state: 'error' } };

export const Disabled: Story = { args: { label: 'Pickup city', value: 'Hamburg, Germany', state: 'disabled' } };

export const Readonly: Story = { args: { label: 'Pickup city', value: 'Hamburg, Germany', state: 'readonly' } };

export const Required: Story = { args: { label: 'Pickup city', required: true } };

export const CustomHint: Story = {
  args: { label: 'Pickup city', state: 'error', hint: 'Start and destination must differ' },
};
