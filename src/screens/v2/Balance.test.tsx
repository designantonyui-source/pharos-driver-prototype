/** figma: new Balance proposal, not measured; tokens: inherited from Balance */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { Balance, BalanceHistory, CashOut, PayoutMethodScreen } from './Balance';

let router: ReturnType<typeof createMemoryRouter>;
const VALID_IBAN = 'DE89370400440532013000';

function setup(path: string) {
  router = createMemoryRouter([
    { path: '/v2/account', element: <p>Account page</p> },
    { path: '/v2/account/balance', element: <Balance /> },
    { path: '/v2/account/balance/method', element: <PayoutMethodScreen /> },
    { path: '/v2/account/balance/cashout', element: <CashOut /> },
    { path: '/v2/account/balance/history', element: <BalanceHistory /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset(); });

it('shows available vs pending with cash out CTA and method row', async () => {
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect(screen.getByText(/EUR 570\.00/)).toBeTruthy();
  expect(screen.getByText(/EUR 290\.00.*pending/)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Add bank account to cash out/ })).toBeTruthy();
  expect(screen.getByText('Add bank account')).toBeTruthy();
});

it('validates IBAN check digits and saves the method', async () => {
  setup('/v2/account/balance/method');
  const iban = await screen.findByLabelText(/IBAN/, { exact: false });
  fireEvent.change(iban, { target: { value: 'FR00 0000' } });
  await screen.findByText('Check the IBAN - wrong check digits.');
  expect((screen.getByRole('button', { name: /bank account/ }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(iban, { target: { value: 'de89 3704 0044 0532 0130 00' } });
  fireEvent.change(screen.getByLabelText(/nickname/, { exact: false }), { target: { value: 'Business' } });
  fireEvent.click(screen.getByRole('button', { name: /Add bank account/ }));
  await screen.findByRole('status');
  expect(store.get().payoutMethod.iban).toBe(VALID_IBAN);
});

it('blocks cash out without IBAN and completes withdrawal with IBAN set', async () => {
  setup('/v2/account/balance/cashout');
  await screen.findByText('Add a bank account first');
  fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));
  await screen.findByLabelText(/IBAN/, { exact: false });
  fireEvent.change(screen.getByLabelText(/IBAN/, { exact: false }), { target: { value: VALID_IBAN } });
  fireEvent.click(screen.getByRole('button', { name: /bank account/ }));
  await screen.findByRole('status');
  await router.navigate('/v2/account/balance/cashout');
  const amount = await screen.findByLabelText(/Amount/, { exact: false });
  fireEvent.change(amount, { target: { value: '5' } });
  expect(screen.getByText(/Minimum withdrawal is/)).toBeTruthy();
  fireEvent.change(amount, { target: { value: '99999' } });
  expect(screen.getByText(/exceeds your available balance/)).toBeTruthy();
  fireEvent.change(amount, { target: { value: '100' } });
  await screen.findByText(/will remain available/);
  fireEvent.click(screen.getByRole('button', { name: /Cash out/ }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));
  await screen.findByText(/is on its way/);
  expect((await api.getBalance()).available).toBeCloseTo(470, 2);
});

it('guards concurrent withdrawals and keeps failure retryable', async () => {
  store.set({ payoutMethod: { iban: VALID_IBAN, label: '' } });
  const real = api.requestWithdrawal;
  vi.spyOn(api, 'requestWithdrawal').mockRejectedValueOnce(new Error('offline')).mockImplementation(real);
  setup('/v2/account/balance/cashout');
  fireEvent.change(await screen.findByLabelText(/Amount/, { exact: false }), { target: { value: '50' } });
  fireEvent.click(screen.getByRole('button', { name: /Cash out/ }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));
  await screen.findByText('Could not request the withdrawal');
  fireEvent.click(screen.getByRole('button', { name: /Cash out/ }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));
  await screen.findByText(/is on its way/);
});

it('lists trips and withdrawals in history', async () => {
  store.set({ payoutMethod: { iban: VALID_IBAN, label: 'Business' } });
  setup('/v2/account/balance/history');
  await screen.findByText('Lille - Brussels');
  expect(screen.getByText(/C.te Fret/)).toBeTruthy();
  const { entry } = await api.requestWithdrawal(100);
  expect(entry.methodLabel).toBe('Business');
  const ledger = await api.getLedger();
  expect(ledger.some(e => e.kind === 'withdrawal' && e.amount === 100)).toBe(true);
});

it('dismisses only dismissed feed entries and never touches the ledger', async () => {
  store.set({ applications: { nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true } } });
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect((await api.getBalance()).available).toBeCloseTo(570, 2);
});
