import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';
const meta = { title: 'Components/StatusPill', component: StatusPill } satisfies Meta<typeof StatusPill>;
export default meta;
type Story = StoryObj<typeof StatusPill>;
export const Tones: Story = { render: () => (<div className="flex flex-wrap gap-2 p-4">{(['neutral','info','success','warning','danger','match'] as const).map(t => <StatusPill key={t} tone={t} label={t === 'match' ? 'On your route' : t === 'warning' ? 'Needs approval' : t} />)}</div>) };
