/** figma: new Schedules proposal (Wave 3), not measured; tokens: inherited */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { Schedules } from './Schedules';

let router: ReturnType<typeof createMemoryRouter>;
const VALID_IBAN = 'DE89370400440532013000';

function setup() {
  router = createMemoryRouter([
    { path: '/v2/account/balance', element: <p>Balance page</p> },
    { path: '/v2/account/balance/schedules', element: <Schedules /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: ['/v2/account/balance/schedules'] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset(); });

it('saves a threshold rule and fires it on evaluation', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Bank' });
  setup();
  await screen.findByText('Manual only');
  fireEvent.click(screen.getByRole('radio', { name: /Auto at/ }));
  await screen.findByText('Rule saved');
  expect((await api.getSchedule()).mode).toBe('threshold');
  const run = await api.evaluateSchedule();
  expect(run?.trigger).toBe('threshold');
  expect(run?.amount).toBeCloseTo(570, 2);
  expect((await api.getBalance()).available).toBeCloseTo(0, 2);
  const runs = await api.getScheduledRuns();
  expect(runs.length).toBe(1);
});

it('does not fire below the threshold and validates the method', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Bank' });
  await api.updateSchedule({ mode: 'threshold', threshold: 5000, methodId: null });
  expect(await api.evaluateSchedule()).toBeNull();
  await expect(api.updateSchedule({ mode: 'threshold', threshold: 100, methodId: 'nope' })).rejects.toThrow('Unknown payout method');
});

it('fires the weekly rule once per Friday', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Bank' });
  await api.updateSchedule({ mode: 'weekly', weekday: 'friday', methodId: null });
  const friday = new Date(2026, 9, 9, 12, 0, 0);
  const run = await api.evaluateSchedule(friday);
  expect(run?.trigger).toBe('weekly');
  expect(await api.evaluateSchedule(friday)).toBeNull();
});

it('records adjustments as explicit ledger lines affecting available', async () => {
  const before = (await api.getBalance()).available;
  await api.addAdjustment({ amount: -50, reason: 'damage', note: 'Pallet damage, trip TR-4821', relatedLoadId: 'nordcargo' });
  expect((await api.getBalance()).available).toBeCloseTo(before - 50, 2);
  await api.addAdjustment({ amount: 20, reason: 'bonus', note: 'On-time bonus' });
  expect((await api.getBalance()).available).toBeCloseTo(before - 30, 2);
  const csv = api.ledgerToCsv(await api.getLedger());
  expect(csv).toContain('adjustment:damage');
  expect(csv).toContain('adjustment:bonus');
  await expect(api.addAdjustment({ amount: 0, reason: 'correction', note: 'x' })).rejects.toThrow();
  await expect(api.addAdjustment({ amount: 10, reason: 'correction', note: '  ' })).rejects.toThrow();
});

it('exports the full statement CSV for the accountant', async () => {
  setup();
  await screen.findByText('Export monthly statement (CSV)');
  const csv = api.ledgerToCsv(await api.getLedger());
  expect(csv.split('\n')[0]).toBe('date,kind,detail,amount_eur,fee_eur,status');
  expect(csv).toContain('trip');
});
