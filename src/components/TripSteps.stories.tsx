import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripSteps, type TripStepsState } from './TripSteps';

/**
 * `Pharos/App/Trip steps` `2728:26593` — eight variants, one per step of the trip, each 370x278.
 * The six rows are identical in every variant; only their `State` moves (see TripSteps.tsx).
 */
const meta = { title: 'Components/TripSteps', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const render = (state: TripStepsState) => () => <TripSteps state={state} />;

/** 2728:26337 · "Arrived at pickup" is Current, the other five are Next */
export const ToPickup: Story = { render: render('to-pickup') };

/** 2728:26369 · row 1 Done, "Loading complete" Current */
export const AtPickup: Story = { render: render('at-pickup') };

/** 2728:26401 · rows 1–2 Done, "Departed" Current */
export const Loaded: Story = { render: render('loaded') };

/** 2728:26433 · rows 1–3 Done, "Arrived at delivery" Current */
export const Departed: Story = { render: render('departed') };

/** 2728:26465 · rows 1–4 Done, "Delivery complete" Current */
export const AtDelivery: Story = { render: render('at-delivery') };

/** 2728:26497 · rows 1–5 Done and row 6 Next — this variant has no Current row */
export const Delivered: Story = { render: render('delivered') };

/** 2728:26529 · rows 1–5 Done, "Proof of delivery sent" Current */
export const ProofSent: Story = { render: render('proof-sent') };

/** 2728:26561 · all six rows Done */
export const Completed: Story = { render: render('completed') };
