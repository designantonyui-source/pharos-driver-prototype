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
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { store } from '../../lib/store';
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
