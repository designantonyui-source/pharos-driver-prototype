/**
 * figma: prototype-led · Home — the feed and the counts it promises
 * tokens: inherited from Home
 *
 * The invariant this file locks down: **a count shown on a button is a
 * promise, and the feed has to keep it.** The feed has one direction model:
 * an empty route is `Anywhere → Anywhere`, never a hidden home city.
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { Home } from './Home';

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

it('empty direction reads Anywhere → Anywhere, never a hidden city', async () => {
  setup();
  await screen.findAllByRole('article');
  expect(screen.getByRole('button', { name: /Direction: Anywhere → Anywhere, 4 of 4 loads/ })).toBeTruthy();
  expect(screen.getAllByRole('article')).toHaveLength(4);
});

it('keeps the direction sheet count equal to the loads the feed shows', async () => {
  setup();
  await screen.findAllByRole('article');

  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  await screen.findByRole('dialog', { name: 'Change direction' });
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: 'Amsterdam' } });
  fireEvent.click(screen.getByRole('heading', { name: 'Change direction' }));
  const cta = screen.getByRole('button', { name: 'Show 1 load' });
  expect(cta).toBeTruthy();
  fireEvent.click(cta);
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Amsterdam, 1 of 1 loads/ })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});

it('clearing To keeps the committed direction and its one-load count', async () => {
  setup();
  await screen.findAllByRole('article');
  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  await screen.findByRole('dialog', { name: 'Change direction' });
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: 'Amsterdam' } });
  fireEvent.click(screen.getByRole('heading', { name: 'Change direction' }));
  fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Amsterdam, 1 of 1 loads/ })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole('button', { name: /Direction:/ }));
  await screen.findByRole('dialog', { name: 'Change direction' });
  fireEvent.change(screen.getByLabelText('To', { exact: true }), { target: { value: '' } });
  fireEvent.click(screen.getByRole('heading', { name: 'Change direction' }));
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Show 1 load' })).toBeTruthy();
  });
});

it('keeps the filters count equal to the loads the feed shows', async () => {
  setup();
  await screen.findAllByRole('article');
  fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
  await screen.findByRole('dialog', { name: 'Filters' });
  fireEvent.click(screen.getByRole('button', { name: '€2.50+/km net' }));
  const cta = await screen.findByRole('button', { name: 'Show 1 load' });
  fireEvent.click(cta);
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Anywhere, 1 of 4 loads/ })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});

it('keeps a waiting application on its card instead of a page banner', async () => {
  setup();
  await screen.findAllByRole('article');
  act(() => store.set({
    applications: {
      'nordcargo': {
        loadId: 'nordcargo',
        status: ApplicationStatus.SENT,
        submittedAt: new Date().toISOString(),
      },
    },
  }));
  expect(await screen.findByText('In review')).toBeVisible();
  expect(screen.getByRole('link', { name: 'View status' })).toBeVisible();
  expect(screen.queryByText(/Step 2 of 3/)).toBeNull();
});

it('keeps the badge denominator equal to the loads that still exist', async () => {
  setup();
  await screen.findAllByRole('article');
  expect(screen.getByRole('button', { name: /Direction: Anywhere → Anywhere, 4 of 4 loads/ })).toBeTruthy();
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
    expect(screen.getByRole('button', { name: /Direction: Anywhere → Anywhere, 3 of 3 loads/ })).toBeTruthy();
  });
});
