/** figma: new Balance proposal Wave 1, not measured; tokens: inherited from Balance */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { Balance, BalanceHistory, CashOut, PayoutMethodScreen } from './Balance';

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
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset(); });

it('shows available vs pending with cash out CTA and empty method state', async () => {
  setup('/v2/account/balance');
  await screen.findByText('Available balance');
  expect(screen.getByText(/EUR 570\.00/)).toBeTruthy();
  expect(screen.getByText(/EUR 290\.00.*pending/)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Add payout method to cash out/ })).toBeTruthy();
  expect(screen.getByText('Add payout method')).toBeTruthy();
});

it('adds an IBAN method with check-digit validation', async () => {
  setup('/v2/account/balance/method');
  await screen.findByText('Add method');
  const iban = screen.getByLabelText(/IBAN/, { exact: false });
  fireEvent.change(iban, { target: { value: 'FR00 0000' } });
  await screen.findByText('Check the IBAN - wrong check digits.');
  fireEvent.change(iban, { target: { value: 'de89 3704 0044 0532 0130 00' } });
  fireEvent.change(screen.getByLabelText(/nickname/, { exact: false }), { target: { value: 'Business' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));
  await screen.findByText(/1 saved/);
  const methods = await api.getPayoutMethods();
  expect(methods.length).toBe(1);
  expect(methods[0].kind).toBe('iban');
  if (methods[0].kind === 'iban') expect(methods[0].iban).toBe(VALID_IBAN);
});

it('adds a card without persisting the PAN', async () => {
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
  await screen.findByText(/1 saved/);
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
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'First' });
  const tok = (await import('../../lib/profile')).tokeniseCard(VALID_CARD);
  await api.addCardMethod({ ...tok, label: 'Second' });
  setup('/v2/account/balance/method');
  await screen.findByText(/2 saved/);
  const defaults = screen.getAllByRole('button', { name: 'Default' });
  expect(defaults.length).toBe(1);
  fireEvent.click(defaults[0]);
  await screen.findByText(/2 saved/);
  const methods = await api.getPayoutMethods();
  expect(methods.filter(m => m.isDefault).length).toBe(1);
});

it('blocks cash out without method and completes SEPA withdrawal', async () => {
  setup('/v2/account/balance/cashout');
  await screen.findByText('Add a payout method first');
  fireEvent.click(screen.getByRole('button', { name: 'Add payout method' }));
  await screen.findByLabelText(/IBAN/, { exact: false });
  fireEvent.change(screen.getByLabelText(/IBAN/, { exact: false }), { target: { value: VALID_IBAN } });
  fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));
  await screen.findByText(/1 saved/);
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

it('quotes the card fee and executes via the mock provider ref', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Bank' });
  const tok = (await import('../../lib/profile')).tokeniseCard(VALID_CARD);
  const card = await api.addCardMethod({ ...tok, label: 'Fuel' });
  const quote = api.quoteFor(card, 100);
  expect(quote.rail).toBe('instant-card');
  expect(quote.fee).toBe(1.5);
  const { entry } = await api.requestWithdrawal(100, card.id);
  expect(entry.id).toMatch(/^mock_card_/);
  expect(entry.fee).toBe(1.5);
  expect(entry.methodLabel).toBe('Fuel');
  // Card rail deducts amount + EUR 1.50 prototype fee from available.
  expect((await api.getBalance()).available).toBeCloseTo(468.5, 2);
});

it('lists trips and withdrawals in history with rail notes', async () => {
  await api.addIbanMethod({ iban: VALID_IBAN, label: 'Business' });
  setup('/v2/account/balance/history');
  await screen.findByText('Lille - Brussels');
  expect(screen.getByText(/C.te Fret/)).toBeTruthy();
  const { entry } = await api.requestWithdrawal(100);
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
  expect((await api.getBalance()).available).toBeCloseTo(570, 2);
});

it('shows a row-shaped loading skeleton and an empty method illustration', async () => {
  vi.spyOn(api, 'getPayoutMethods').mockImplementationOnce(() => new Promise(() => {}));
  setup('/v2/account/balance/method');
  expect(await screen.findByLabelText('Loading payout methods')).toBeTruthy();
  cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset();
  setup('/v2/account/balance/method');
  await screen.findByText('Add method');
  expect(screen.getByText('No payout methods yet')).toBeTruthy();
});
