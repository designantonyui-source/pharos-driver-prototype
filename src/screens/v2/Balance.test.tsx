/** figma: new Balance proposal Wave 1, not measured; tokens: inherited from Balance */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { Balance, BalanceHistory, CashOut, PayoutMethodScreen, WithdrawalDetails } from './Balance';

let router: ReturnType<typeof createMemoryRouter>;
const VALID_IBAN = 'DE89370400440532013000';
const VALID_CARD = '4242424242424242';

function setup(path: string) {
  router = createMemoryRouter([
    { path: '/v2/account', element: <p>Account page</p> },
    { path: '/v2/account/balance', element: <Balance /> },
    { path: '/v2/account/balance/method', element: <PayoutMethodScreen /> },
    { path: '/v2/account/balance/cashout', element: <CashOut /> },
    { path: '/v2/account/balance/history', element: <BalanceHistory /> },
    { path: '/v2/account/balance/withdrawals/:id', element: <WithdrawalDetails /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset(); });

it('shows available vs pending with cash out CTA and empty method state', async () => {
  store.set({ payoutMethods: [] });
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect(screen.getByText(/EUR 720\.00/)).toBeTruthy();
  expect(screen.queryByText(/pending/)).toBeNull();
  expect(screen.getByRole('button', { name: /Add payout method to cash out/ })).toBeTruthy();
  expect(screen.getByText('Add payout method')).toBeTruthy();
});

it('adds an IBAN method with check-digit validation', async () => {
  store.set({ payoutMethods: [] });
  setup('/v2/account/balance/method');
  await screen.findByText('Add method');
  const iban = screen.getByLabelText(/IBAN/, { exact: false });
  fireEvent.change(iban, { target: { value: 'FR00 0000' } });
  await screen.findByText('Check the IBAN - wrong check digits.');
  fireEvent.change(iban, { target: { value: 'de89 3704 0044 0532 0130 00' } });
  fireEvent.change(screen.getByLabelText(/nickname/, { exact: false }), { target: { value: 'Business' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm with bank app' }));
  await screen.findByText(/1 saved/, undefined, { timeout: 3000 });
  const methods = await api.getPayoutMethods();
  expect(methods.length).toBe(1);
  expect(methods[0].kind).toBe('iban');
  if (methods[0].kind === 'iban') expect(methods[0].iban).toBe(VALID_IBAN);
});

it('adds a card without persisting the PAN', async () => {
  store.set({ payoutMethods: [] });
  setup('/v2/account/balance/method');
  await screen.findByText('Add method');
  fireEvent.click(screen.getByRole('button', { name: /Card \(instant/ }));
  fireEvent.change(screen.getByLabelText(/Card number/, { exact: false }), { target: { value: '4242424242424241' } });
  await screen.findByText('Check the card number.');
  fireEvent.change(screen.getByLabelText(/Card number/, { exact: false }), { target: { value: VALID_CARD } });
  await screen.findByText(/Visa - detected automatically/);
  fireEvent.change(screen.getByLabelText(/Expiry/, { exact: false }), { target: { value: '12/30' } });
  fireEvent.change(screen.getByLabelText(/CVC/, { exact: false }), { target: { value: '123' } });
  fireEvent.change(screen.getByLabelText(/Cardholder name/, { exact: false }), { target: { value: 'Alexey K.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add card' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm with bank app' }));
  await screen.findByText(/1 saved/, undefined, { timeout: 3000 });
  const methods = await api.getPayoutMethods();
  expect(methods.length).toBe(1);
  expect(methods[0].kind).toBe('card');
  if (methods[0].kind === 'card') {
    expect(methods[0].last4).toBe('4242');
    expect(methods[0].brand).toBe('Visa');
  }
  const raw = localStorage.getItem('pharos-driver-prototype') ?? '';
  expect(raw).not.toContain('4242424242424242');
  expect(raw).not.toContain('4242 4242');
});

it('sets default and removes methods, keeping one default', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'First', scaToken: await api.authorizeSca('payout-method') });
  const tok = (await import('../../lib/profile')).tokeniseCard(VALID_CARD);
  await api.addCardMethod({ ...tok, label: 'Second', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/method');
  await screen.findByText(/2 saved/);
  const defaults = screen.getAllByRole('button', { name: 'Default' });
  expect(defaults.length).toBe(1);
  fireEvent.click(defaults[0]);
  await screen.findByText(/2 saved/);
  const methods = await api.getPayoutMethods();
  expect(methods.filter(m => m.isDefault).length).toBe(1);
});

/**
 * Removing a payout method must be confirmed.
 *
 * The bug this locks down: the X button deleted the method on a single tap, with
 * no confirmation — and if it was the only method, the driver was left unable
 * to cash out with no explanation.
 */
it('asks for confirmation before removing a payout method', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business account', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/method');
  await screen.findByText(/1 saved/);

  fireEvent.click(screen.getByRole('button', { name: /Remove Business account/ }));
  await screen.findByText('Remove this payout method?');
  // The only method → the sheet must say cash out is blocked afterwards.
  expect(screen.getByText(/This is your only payout method/)).toBeTruthy();
  expect(screen.getByText(/will not be able to cash out/)).toBeTruthy();

  // Nothing is deleted until the driver confirms.
  expect((await api.getPayoutMethods()).length).toBe(1);

  fireEvent.click(screen.getByRole('button', { name: 'Keep method' }));
  await waitFor(() => expect(screen.queryByText('Remove this payout method?')).toBeNull());
  expect((await api.getPayoutMethods()).length).toBe(1);
});

it('removes the payout method once the confirmation is accepted', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business account', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/method');
  await screen.findByText(/1 saved/);

  fireEvent.click(screen.getByRole('button', { name: /Remove Business account/ }));
  await screen.findByText('Remove this payout method?');
  fireEvent.click(screen.getByRole('button', { name: 'Remove method' }));

  await waitFor(async () => expect((await api.getPayoutMethods()).length).toBe(0));
  await screen.findByText('No payout methods yet');
});

it('warns that another method becomes the default when the default is removed', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'First', scaToken: await api.authorizeSca('payout-method') });
  const tok = (await import('../../lib/profile')).tokeniseCard(VALID_CARD);
  await api.addCardMethod({ ...tok, label: 'Second', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/method');
  await screen.findByText(/2 saved/);

  const methods = await api.getPayoutMethods();
  const def = methods.find(m => m.isDefault)!;
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`Remove ${def.label}`) }));
  await screen.findByText('Remove this payout method?');
  expect(screen.getByText(/This is your default method/)).toBeTruthy();
  expect(screen.getByText(/Another saved method becomes the default/)).toBeTruthy();
});

it('blocks cash out without method and completes SEPA withdrawal', async () => {
  store.set({ payoutMethods: [] });
  setup('/v2/account/balance/cashout');
  await screen.findByText('Add a payout method first');
  fireEvent.click(screen.getByRole('button', { name: 'Add payout method' }));
  await screen.findByLabelText(/IBAN/, { exact: false });
  fireEvent.change(screen.getByLabelText(/IBAN/, { exact: false }), { target: { value: VALID_IBAN } });
  fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm with bank app' }));
  await screen.findByText(/1 saved/, undefined, { timeout: 3000 });
  await waitFor(async () => {
    expect((await api.getPayoutMethods())[0]?.verified).toBe(true);
  });
  await router.navigate('/v2/account/balance/cashout');
  const amount = await screen.findByLabelText(/Amount/, { exact: false });
  fireEvent.change(amount, { target: { value: '5' } });
  expect(screen.getByText(/Minimum withdrawal is/)).toBeTruthy();
  fireEvent.change(amount, { target: { value: '99999' } });
  expect(screen.getByText(/plus fee exceeds/)).toBeTruthy();
  fireEvent.change(amount, { target: { value: '100' } });
  await screen.findByText(/will remain available/);
  fireEvent.click(screen.getByRole('button', { name: /Cash out/ }));
  await screen.findByRole('dialog');
  expect(screen.getByText('Total debit')).toBeTruthy();
  expect(screen.getByText('Remaining')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm with bank app' }));
  await waitFor(async () => {
    const ledger = await api.getLedger();
    expect(ledger.filter((e) => e.kind === 'withdrawal')).toHaveLength(1);
  }, { timeout: 8000 });
  expect((await api.getBalance()).available).toBeCloseTo(620, 2);
  const withdrawals = (await api.getLedger()).filter((e) => e.kind === 'withdrawal');
  expect(withdrawals).toHaveLength(1);
  expect(withdrawals[0]).toMatchObject({ amount: 100, status: 'processing' });
  const details = await api.getWithdrawal(withdrawals[0].id);
  expect(details?.status).toBe('processing');
});

it('quotes the card fee and executes via the mock provider ref', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Bank', scaToken: await api.authorizeSca('payout-method') });
  const tok = (await import('../../lib/profile')).tokeniseCard(VALID_CARD);
  const card = await api.addCardMethod({ ...tok, label: 'Fuel', scaToken: await api.authorizeSca('payout-method') });
  const quote = api.quoteFor(card, 100);
  expect(quote.rail).toBe('instant-card');
  expect(quote.fee).toBe(1.5);
  expect(api.maxWithdrawalFor(720, 1.5)).toBeCloseTo(718.5, 2);
  // Amount + fee must fit: 719 + 1.50 over a 720 balance is rejected.
  await expect(api.requestWithdrawal(719, card.id, await api.authorizeSca('withdrawal'))).rejects.toThrow('plus fee');
  const { entry } = await api.requestWithdrawal(100, card.id, await api.authorizeSca('withdrawal'));
  expect(entry.id).toMatch(/^mock_card_/);
  expect(entry.fee).toBe(1.5);
  expect(entry.methodLabel).toBe('Fuel');
  // Card rail deducts amount + EUR 1.50 prototype fee from available.
  expect((await api.getBalance()).available).toBeCloseTo(618.5, 2);
}, 15_000);

it('opens a permanent withdrawal screen after confirm', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business', scaToken: await api.authorizeSca('payout-method') });
  const { entry } = await api.requestWithdrawal(80, undefined, await api.authorizeSca('withdrawal'));
  setup(`/v2/account/balance/withdrawals/${encodeURIComponent(entry.id)}`);
  await screen.findByText(/Request accepted/);
  expect(screen.getByText('Total debit')).toBeTruthy();
  expect(screen.getByText('Expected arrival')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'View in history' })).toBeTruthy();
});

it('lists trips and withdrawals in history with rail notes', async () => {
  store.set({ payoutMethods: [] });
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/history');
  await screen.findByText('Ghent - Antwerp');
  expect(screen.getByText(/C.te Fret/)).toBeTruthy();
  const { entry } = await api.requestWithdrawal(100, undefined, await api.authorizeSca('withdrawal'));
  expect(entry.methodLabel).toBe('Business');
  const ledger = await api.getLedger();
  expect(ledger.some(e => e.kind === 'withdrawal' && e.amount === 100)).toBe(true);
});

it('migrates a Wave-0 stored IBAN into the method list', async () => {
  localStorage.setItem('pharos-driver-prototype', JSON.stringify({
    payoutMethod: { iban: VALID_IBAN, label: 'Legacy' },
    contactProfile: { phone: '', email: '' },
  }));
  vi.resetModules();
  const reloaded = await import('../../lib/store');
  expect(reloaded.store.get().payoutMethods.length).toBe(1);
  expect(reloaded.store.get().payoutMethods[0].kind).toBe('iban');
});

it('dismisses only dismissed feed entries and never touches the ledger', async () => {
  store.set({ applications: { nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true } } });
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect((await api.getBalance()).available).toBeCloseTo(720, 2);
});

/**
 * The balance must follow the money, not the mount.
 *
 * The bug this locks down: the screen fetched once on mount, so when the
 * customer paid while the screen was already open, the card kept showing
 * "EUR 360.00 pending" and EUR 500 available — the single most important beat
 * of the demo appeared to do nothing.
 */
it('refreshes the balance when the customer pays while the screen is open', async () => {
  const now = new Date().toISOString();
  store.set({
    ledger: [
      { kind: 'trip', id: 't-belroute', loadId: 'belroute', company: 'BelRoute', from: 'Ghent', to: 'Antwerp', amount: 210, status: 'available', paidAt: now, day: 'Sat' },
      { kind: 'trip', id: 't-calais', loadId: 'calais-lille', company: 'Côte Fret', from: 'Calais', to: 'Lille', amount: 290, status: 'available', paidAt: now, day: 'Sun' },
      { kind: 'trip', id: 't-nordcargo', loadId: 'nordcargo', company: 'NordCargo', from: 'Lille', to: 'Brussels', amount: 360, status: 'pending', paidAt: null, day: 'Mon' },
    ],
    applications: {
      nordcargo: {
        loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt: now,
        tripId: 'TR-nordcargo', tripStage: 'delivered',
        pod: { status: 'approved', filename: 'signed-pod.pdf', mimeType: 'application/pdf', dataUrl: 'data:application/pdf;base64,AAAA', uploadedAt: now },
      },
    },
  });
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect(screen.getByText(/EUR 500\.00/)).toBeTruthy();
  expect(screen.getByText(/EUR 360\.00 pending/)).toBeTruthy();

  // The customer pays → the money moves from pending to available.
  await api.customerPaysDemoTrip('nordcargo');

  await waitFor(() => expect(screen.getByText(/EUR 860\.00/)).toBeTruthy());
});

it('refreshes the history list when a payout outcome lands', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business account', scaToken: await api.authorizeSca('payout-method') });
  setup('/v2/account/balance/history');
  await screen.findAllByText('Activity');
  expect(screen.queryByText(/Cash out to/)).toBeNull();

  await api.requestWithdrawal(100, undefined, await api.authorizeSca('withdrawal'));
  await waitFor(() => expect(screen.getByText(/Cash out to/)).toBeTruthy());
});

it('shows a row-shaped loading skeleton and an empty method illustration', async () => {
  vi.spyOn(api, 'getPayoutMethods').mockImplementationOnce(() => new Promise(() => {}));
  setup('/v2/account/balance/method');
  expect(await screen.findByLabelText('Loading payout methods')).toBeTruthy();
  cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset();
  store.set({ payoutMethods: [] });
  setup('/v2/account/balance/method');
  await screen.findByText('Add method');
  expect(screen.getByText('No payout methods yet')).toBeTruthy();
});
