import type { Meta, StoryObj } from '@storybook/react-vite';
import { InformationSection } from './InformationSection';
import { ButtonLink } from './Button';

/**
 * Figma `2576:2265` — `Pharos/Information section`. The set has exactly four variants and each
 * one gets a story below. `Show country flag` / `Show status` / `Show action` are Figma BOOLEAN
 * properties (not variants), so they are shown as extra stories instead of four more variants.
 *
 * The card is `w-full`; the wrapper pins the widths taken from the file: 370 for the app column
 * (the real instances on page 30) and 720 for the Wide variant's own geometry in the set.
 */
const meta = {
  title: 'Components/InformationSection',
  component: InformationSection,
  parameters: { layout: 'centered' },
  args: { title: 'Trip information', fact: 'Key fact', children: 'Order terms, contacts or documents.' },
  decorators: [
    (Story) => (
      <div style={{ width: 370 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InformationSection>;
export default meta;
type Story = StoryObj<typeof InformationSection>;

/** `140:49` Layout=Wide, Type=Information, State=Default — 720x122 in the set. */
export const WideInformation: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
};

/** `2466:14783` Layout=Compact, Type=Payment, State=Pending — 370x142. */
export const CompactPaymentPending: Story = {
  args: {
    title: 'Payment',
    fact: '360 € · awaiting payment',
    children: 'Agreed term: within 7 days',
    layout: 'compact',
    type: 'payment',
    state: 'pending',
  },
};

/**
 * `2466:14783` again, at the variant's own fixed frame height. The set's Compact variants are
 * 142 tall while their content stops at 110 (a temporary instance created from `2466:14783` puts
 * Title at 16..44, Key fact at 53..77 and Body at 85..105) — 20px of dead space at the bottom left
 * over from a FIXED counter axis. This story shows the variant as drawn; the component itself
 * hugs (see the contract header), and no Compact instance is placed on a driver screen.
 */
export const CompactPaymentPendingFixed142: Story = {
  args: CompactPaymentPending.args,
  decorators: [
    (Story) => (
      <div style={{ width: 370, minHeight: 142, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

/** `2466:14795` Layout=Compact, Type=Payment, State=Early available — 370x142. */export const CompactPaymentEarlyAvailable: Story = {
  args: {
    title: 'Payment',
    fact: '360 € · early option',
    children: 'Review the fee before requesting',
    layout: 'compact',
    type: 'payment',
    state: 'early-available',
  },
};

/** `2466:14807` Layout=Compact, Type=Payment, State=Received — 370x142. */
export const CompactPaymentReceived: Story = {
  args: {
    title: 'Payment',
    fact: '360 € · received',
    children: 'Paid for trip TR-4821',
    layout: 'compact',
    type: 'payment',
    state: 'received',
  },
};

/** `Show country flag` = true, flag instance `249:1647` — the pickup/delivery rows. 370x118. */export const WithCountryFlag: Story = {
  args: {
    title: 'Pickup · Lille, FR',
    fact: 'Today, 14:00–15:00',
    children: 'No exact address provided.',
    country: 'France',
  },
};

/** `Show country flag` = true with the Belgium instance `249:1649`. */
export const WithCountryFlagBelgium: Story = {
  args: {
    title: 'Delivery · Brussels, BE',
    fact: 'Today, until 19:00',
    children: 'No exact address provided.',
    country: 'Belgium',
  },
};

/**
 * `Show status` = true. The chip takes the lead row *instead of* the key fact — Figma has no
 * variant that shows both, and in `2466:14783` the Body sits 8px below a 28-tall lead row.
 */
export const WithStatus: Story = {
  args: {
    title: 'NordCargo · Lille → Brussels · €360',
    fact: 'Dispatcher declined',
    status: { label: 'Dispatcher declined', tone: 'danger' },
    children: 'Your vehicle does not meet the load requirements. Application closed. Choose another load.',
  },
};

/** `Show status` with the Success tone, as on the "Trip assigned to you" row. */
export const WithStatusSuccess: Story = {
  args: {
    title: 'Trip assigned to you',
    fact: 'All steps completed.',
    status: { label: 'On your route', tone: 'success' },
    children: 'All steps completed. View trip →',
  },
};

/** `Show action` = true: the `Pharos/Button link` instance `2078:2971` centered in the title row. */
export const WithAction: Story = {
  args: {
    title: 'Pickup contact',
    fact: 'Sophie Martin',
    children: 'Dock 4 · Today, 14:00–15:00',
    action: <ButtonLink label="Call" />,
  },
};

/** Body absent — the card loses 20px, exactly like the 370x70 "Fleet policy" instance. */
export const WithoutBody: Story = {
  args: {
    title: 'Fleet policy',
    fact: 'Dispatcher approval for every application',
    children: undefined,
  },
};
