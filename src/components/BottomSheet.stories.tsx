import type { Meta, StoryObj } from '@storybook/react-vite';
import { BottomSheet } from './BottomSheet';
import { OfferCard } from './OfferCard';
import { Button } from './Button';
import { Alert } from './Alert';
const card = { rate: '€320', perKm: '€3.05/km loaded', distance: '105 km loaded', lane: 'Tourcoing → Brussels', window: 'Today · 15:00–16:00', deadhead: '26 km to pickup · about 35 min', company: 'BelRoute · 4.7 ★ · paid in 14 days' };
const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[var(--screen-h)] w-[var(--screen-w)] overflow-hidden bg-[var(--color-bg-subtle)]">{children}</div>
);
const meta = { title: 'Components/BottomSheet', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;
export const Peek: Story = { render: () => (<Screen><BottomSheet state="peek" pager="1 of 2"><OfferCard {...card} badge={{ label: 'Needs approval', tone: 'warning' }} /><Button label="Request for €320" /></BottomSheet></Screen>) };
export const Full: Story = { render: () => (<Screen><BottomSheet state="full" pager="1 of 2"><OfferCard {...card} badge={{ label: 'Needs approval', tone: 'warning' }} /><Alert title="What happens next" type="info">Both approvals by 11:00. Your dispatcher checks the schedule, then the customer confirms.</Alert><Button label="Request for €320" /></BottomSheet></Screen>) };
