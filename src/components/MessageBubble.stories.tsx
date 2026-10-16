import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MessageBubble } from './MessageBubble';

/**
 * One story per Figma variant of `384:355` (Direction), plus the skin the app ships.
 * Figma pins the set at 280; the page-30 instances override it to 294 — the component is fluid,
 * so these frames pin the parent width exactly as the Figma frames do.
 */
const frame = (width: number): Decorator =>
  function Frame(Story) {
    return (
      <div style={{ width }}>
        <Story />
      </div>
    );
  };

const meta = {
  title: 'Components/MessageBubble',
  component: MessageBubble,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MessageBubble>;

export default meta;
type Story = StoryObj<typeof MessageBubble>;

/** `384:347` — 280x94, fill `#eff2f5`, 1px `#d7e0e6` inside. */
export const Incoming: Story = { decorators: [frame(280)], args: { direction: 'incoming' } };

/** `384:351` — 280x94, fill `#ebf3f7`, 1px `#225d74` inside. */
export const Outgoing: Story = { decorators: [frame(280)], args: { direction: 'outgoing' } };

/**
 * The mobile chat on page 30 (`2370:29252`, section `04 · Load details and negotiation`) — the
 * shape all 15 app instances are overridden to: 294 wide, radius 16, pad 12/14/10/14, gap 6, no
 * stroke, `Sender` row deleted, outgoing fill `#def5f0`. Strings are the instances' own.
 */
export const AppThread: Story = {
  decorators: [frame(294)],
  render: () => (
    <div className="flex flex-col gap-[var(--spacing-8)]">
      <MessageBubble
        skin="plain"
        sender={null}
        message="The load is available. Pickup today, 14:00–15:00."
        time="10:32"
      />
      <MessageBubble
        skin="plain"
        direction="outgoing"
        sender={null}
        message="I can take this trip today for €380."
        time="10:33 · Delivered"
      />
      <MessageBubble
        skin="plain"
        sender={null}
        message="Pickup is at a warehouse in Lille. Give your application number at the entrance."
        time="10:35"
      />
    </div>
  ),
};

/**
 * Prototype-led: the AI dispatcher's automated reply reuses the plain skin's `Sender` row as the
 * honest "this was automated" label — the driver must be able to tell it apart from a person.
 */
export const AiDispatcher: Story = {
  decorators: [frame(294)],
  args: {
    skin: 'plain',
    sender: 'AI dispatcher',
    message: 'Your documents are in the Documents tab — the CMR is prefilled. The POD is required before payout.',
    time: '10:36',
  },
};

/** The desktop chat on page 21 keeps the tinted skin and shows the sender line. */
export const WebThread: Story = {
  decorators: [frame(280)],
  render: () => (
    <div className="flex flex-col gap-[var(--spacing-8)]">
      <MessageBubble sender="NordCargo" message="We can agree €360. Does that work?" time="10:38" />
      <MessageBubble
        direction="outgoing"
        sender="You"
        message="I can take this trip today."
        time="10:34"
      />
    </div>
  ),
};
