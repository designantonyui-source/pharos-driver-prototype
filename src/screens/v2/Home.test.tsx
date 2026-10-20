/**
 * figma: prototype-led · Home — the feed and the counts it promises
 * tokens: inherited from Home
 *
 * The invariant this file locks down: **a count shown on a button is a
 * promise, and the feed has to keep it.**
 *
 * The bug: the direction sheet counted an empty destination as "every
 * destination" (6 loads) while the feed resolved an empty destination to the
 * default one (2 loads) — so the button said "Show 6 loads" and the feed then
 * showed 2. The filters sheet had the same shape: it counted the whole
 * catalogue (4) and the feed applied the committed direction (2).
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { Home, resolveDestination } from './Home';

let router: ReturnType<typeof createMemoryRouter>;

function setup() {
  router = createMemoryRouter([
    { path: '/v2', element: <Home /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: ['/v2'] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { localStorage.clear(); store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); localStorage.clear(); store.reset(); });

it('resolves an empty destination to the default one', () => {
  expect(resolveDestination('')).toBe('Brussels');
  expect(resolveDestination('   ')).toBe('Brussels');
  expect(resolveDestination(' Paris ')).toBe('Paris');
});

it('keeps the direction sheet count equal to the loads the feed shows', async () => {
  setup();
  await screen.findByRole('button', { name: /Direction:/ });
  const feedCount = () => screen.getAllByRole('article').length;

  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  const sheet = await screen.findByRole('dialog', { name: 'Change direction' });
  // Clearing the destination must not inflate the promise: it falls back to the
  // default destination, so the count has to fall back with it.
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: '' } });
  await waitFor(() => {
    const cta = screen.getByRole('button', { name: /Show \d+ loads?/ });
    const promised = Number((cta.textContent ?? '').match(/Show (\d+)/)![1]);
    expect(promised).toBe(feedCount());
  });
  expect(sheet).toBeTruthy();
});

it('keeps the sheet count on a non-default direction when To is cleared', async () => {
  setup();
  await screen.findByRole('button', { name: /Direction:/ });
  // Commit a non-default destination: the previous rule resolved an empty
  // draft to the global default and promised "Show 2 loads" over a 1-load feed.
  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  await screen.findByRole('dialog', { name: 'Change direction' });
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: 'Amsterdam' } });
  fireEvent.click(screen.getByRole('button', { name: /Show \d+ loads?/ }));
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Amsterdam, 1 of 6 loads/ })).toBeTruthy();
  });
  // Reopen, clear To: empty keeps Amsterdam on apply, so the count must be 1.
  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  await screen.findByRole('dialog', { name: 'Change direction' });
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: '' } });
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Show 1 load' })).toBeTruthy();
  });
});

it('keeps the filters count equal to the loads the feed shows', async () => {
  setup();
  await screen.findByRole('button', { name: /Direction:/ });
  const feedCount = () => screen.getAllByRole('article').length;

  fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
  await screen.findByRole('dialog', { name: 'Filters' });
  fireEvent.click(screen.getByRole('button', { name: '€3+/km' }));
  await waitFor(() => {
    const cta = screen.getByRole('button', { name: /Show \d+ loads?/ });
    const promised = Number((cta.textContent ?? '').match(/Show (\d+)/)![1]);
    expect(promised).toBe(feedCount());
  });
});

it('keeps the badge denominator equal to the loads that still exist', async () => {
  setup();
  await screen.findByRole('button', { name: /Direction:/ });
  // Two loads on the Brussels direction out of six in the catalogue.
  expect(screen.getByRole('button', { name: /Direction: Anywhere → Brussels, 2 of 6 loads/ })).toBeTruthy();
  // Dismiss one of the two: the feed shows 1, and the denominator has to drop
  // with it. "1 of 6" would claim six loads still exist while five remain.
  act(() => store.set({
    applications: {
      'paris-brussels': {
        loadId: 'paris-brussels',
        status: ApplicationStatus.CANCELLED,
        submittedAt: null,
        dismissed: true,
      },
    },
  }));
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Brussels, 1 of 5 loads/ })).toBeTruthy();
  });
});
