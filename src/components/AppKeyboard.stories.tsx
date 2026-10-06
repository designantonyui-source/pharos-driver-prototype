import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { AppKeyboard } from './AppKeyboard';

/**
 * `Pharos/App/Keyboard` (2776:1613) is a single 402x258 component with no properties; its three
 * page-30 instances (2776:1787, 2776:1961, 2776:2112) are identical. It is drawn full-bleed at
 * the screen width, so the story escapes the 16px screen padding of the default decorator.
 */
const meta = {
  title: 'Components/AppKeyboard',
  component: AppKeyboard,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[var(--screen-w)] bg-[var(--color-bg-canvas)]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof AppKeyboard>;
export default meta;
type Story = StoryObj<typeof AppKeyboard>;

/** 402x258 — four rows; the last 58px of the frame is empty in Figma. */
export const Default: Story = {};
