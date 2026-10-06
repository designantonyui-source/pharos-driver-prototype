import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ChatComposer } from './ChatComposer';

/** Figma fixes the row at 370 (all 3 variants and all 7 instances); the component is fluid. */
const frame: Decorator = (Story) => (
  <div style={{ width: 370 }}>
    <Story />
  </div>
);

const meta = {
  title: 'Components/ChatComposer',
  component: ChatComposer,
  parameters: { layout: 'centered' },
  decorators: [frame],
} satisfies Meta<typeof ChatComposer>;

export default meta;
type Story = StoryObj<typeof ChatComposer>;

/** `2188:7863` — 370x48, white input with the "Message…" placeholder, Send Disabled. */
export const Empty: Story = { args: { state: 'empty' } };

/** `2188:7896` — the input filled, Send switches to Primary. */
export const Draft: Story = {
  args: { state: 'draft', value: 'I can take this trip today.' },
};

/** `2188:7913` — input on `#eff2f5`, Send stays Disabled. */
export const Disabled: Story = { args: { state: 'disabled' } };
