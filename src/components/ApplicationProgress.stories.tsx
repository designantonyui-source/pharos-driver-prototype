import type { Meta, StoryObj } from '@storybook/react-vite';
import { ApplicationProgress, type ApplicationStage } from './ApplicationProgress';

/**
 * `Pharos/App/Application progress` `734:426` — five variants, one per stage of the application.
 * Dispatcher / Customer / Assigned are 370x180 (4 rows); Direct / DirectAssigned are 370x148 (3 rows).
 */
const meta = { title: 'Components/ApplicationProgress', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const render = (stage: ApplicationStage) => () => <ApplicationProgress stage={stage} />;

/** 734:357 · 370x180 · Current on "Dispatcher approval" — the only stage instanced on a screen (735:1115) */
export const Dispatcher: Story = { render: render('dispatcher') };

/** 734:380 · 370x180 · Current on "Customer confirmation" (instance 735:1158) */
export const Customer: Story = { render: render('customer') };

/** 734:403 · 370x180 · all four rows Done (instance 735:1489) */
export const Assigned: Story = { render: render('assigned') };

/** 2020:373 · 370x148 · three rows — no instance in the file, ported from the set */
export const Direct: Story = { render: render('direct') };

/** 2020:396 · 370x148 · three rows, all Done — no instance in the file, ported from the set */
export const DirectAssigned: Story = { render: render('direct-assigned') };
