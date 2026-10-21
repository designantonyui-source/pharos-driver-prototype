import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApplicationProgress, type ApplicationStage } from './ApplicationProgress';

/**
 * `Pharos/App/Application progress` `734:426` — the Figma master has five 4-row variants.
 *
 * Product deviation (2026-10-21): the driver-facing tracker renders three rows for every stage —
 * Application sent / Under review / Confirmed — because dispatcher approval and customer
 * confirmation are one waiting period for the driver. The substatus carries the internal state.
 * Figma still needs this 3-row variant.
 */
const meta = { title: 'Components/ApplicationProgress', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const render = (stage: ApplicationStage) => () => <ApplicationProgress stage={stage} />;

/** Current on "Under review" — "With dispatcher" */
export const Dispatcher: Story = { render: render('dispatcher') };

/** Current on "Under review" — "Dispatcher approved · waiting for customer" */
export const Customer: Story = { render: render('customer') };

/** All three driver-facing rows Done */
export const Assigned: Story = { render: render('assigned') };

/** Direct path — Current on "Under review" with "With customer" */
export const Direct: Story = { render: render('direct') };

/** Direct path, all three rows Done */
export const DirectAssigned: Story = { render: render('direct-assigned') };
