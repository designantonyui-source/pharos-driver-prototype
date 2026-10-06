import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MobileHeader } from './MobileHeader';

/**
 * Figma 26:24 `Pharos/Mobile header` — one story per variant of the set.
 * Both variants are 390x80; the instances on page 21 are resized to the 358 content width of their
 * frame, which the `w-full` root follows, so the decorator supplies the variant width of 390.
 */
const meta = {
  title: 'Web shell/Mobile header',
  component: MobileHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ((Story) => (
      <div className="w-[390px]">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof MobileHeader>;
export default meta;
type Story = StoryObj<typeof MobileHeader>;

/** Type=Home `26:8` — 390x80, [Title fills 298] [Driver initials 48]. */
export const Home: Story = { args: { type: 'home', title: 'Load details' } };

/** Type=Back `26:13` — 390x80, [Back button 88] [Title fills 258]. */
export const Back: Story = { args: { type: 'back', title: 'Load details' } };
