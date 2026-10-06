import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';

/**
 * figma: 2772:12931 — the screen is drawn in its empty state (notes on the disabled button are in
 * the component header). `Filled` shows the state the design implies once a city is chosen.
 */
const meta = {
  title: 'Screens/Search',
  component: Search,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Search>;
export default meta;
type Story = StoryObj<typeof Search>;

export const Empty: Story = {};

export const Filled: Story = { args: { initialOrigin: 'Lille, France', initialDestination: 'Brussels, Belgium' } };
