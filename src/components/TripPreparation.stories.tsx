import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripPreparation, type TripPreparationState } from './TripPreparation';

/**
 * `Pharos/App/Trip preparation` `2715:1617` — four variants, one per preparation state.
 * Not to be confused with `Pharos/App/Trip checklist` `2715:1596`.
 */
const meta = { title: 'Components/TripPreparation', parameters: { layout: 'centered' } } satisfies Meta;
export default meta;
type Story = StoryObj;

const render = (state: TripPreparationState) => () => <TripPreparation state={state} />;

/** 2715:1597 · 370x110 · Status tone Warning "Awaiting trip details · 0 of 4" + two-line body */
export const Awaiting: Story = { render: render('awaiting') };

/** 2715:1602 · 370x90 · Status tone Info "Request sent · awaiting dispatcher" */
export const Requested: Story = { render: render('requested') };

/** 2715:1607 · 370x90 · Status tone Success "Trip details complete · 4 of 4" */
export const Complete: Story = { render: render('complete') };

/** 2715:1612 · 370x90 · Status tone Success "Readiness confirmed" */
export const Confirmed: Story = { render: render('confirmed') };
