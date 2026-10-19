/**
 * figma: prototype-led · TripDetails not-found guard (regression)
 * tokens: inherited from TripDetails
 *
 * The bug this locks down: `details` used `null` as the loading sentinel while
 * `getTripDetails` ALSO returns `null` for "no confirmed trip". Both states were
 * the same value, so a cold deep link rendered "Loading trip…" forever and the
 * not-found branch below it was dead code.
 */
import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { TripDetails } from './TripDetails';

let router: ReturnType<typeof createMemoryRouter>;

function setup(path: string) {
  router = createMemoryRouter([
    { path: '/v2', element: <p>Loads page</p> },
    { path: '/v2/account/balance', element: <p>Balance page</p> },
    { path: '/v2/account/balance/method', element: <p>Methods page</p> },
    { path: '/trip/:id', element: <TripDetails /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { localStorage.clear(); store.reset(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); localStorage.clear(); });

it('shows a not-found state instead of an endless spinner for an unbooked load', async () => {
  setup('/trip/paris-brussels');
  await screen.findByText('No confirmed trip for this load');
  expect(screen.queryByText('Loading trip…')).toBeNull();
  expect(screen.getByRole('button', { name: 'Back to loads' })).toBeTruthy();
});

it('still renders the itinerary once the trip is confirmed', async () => {
  const submittedAt = new Date().toISOString();
  store.set({
    loadId: 'nordcargo',
    status: ApplicationStatus.CONFIRMED,
    submittedAt,
    applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt, tripId: 'TR-4821', tripStage: 'at-pickup' },
    },
  });
  setup('/trip/nordcargo');
  expect((await screen.findAllByText(/TR-4821/)).length).toBeGreaterThan(0);
  expect(screen.queryByText('No confirmed trip for this load')).toBeNull();
});

it('never leaves the driver without a primary action before departure', async () => {
  // Regression: the sticky bar rendered nothing on the `confirmed`/`loaded` stages,
  // so the first thing the driver had to do hung on a secondary button.
  const submittedAt = new Date().toISOString();
  store.set({
    loadId: 'nordcargo',
    status: ApplicationStatus.CONFIRMED,
    submittedAt,
    applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt, tripId: 'TR-4821', tripStage: 'confirmed' },
    },
  });
  setup('/trip/nordcargo');
  await screen.findAllByText(/TR-4821/);
  expect(screen.getByRole('button', { name: 'Navigate to pickup' })).toBeTruthy();
  // The arrival milestone must NOT be offered before the driver has left.
  expect(screen.queryByRole('button', { name: "I've arrived at pickup" })).toBeNull();
});

/**
 * After delivery the primary action is no longer physical, it is financial.
 *
 * The bug this locks down: the sticky bar said "Upload POD" for every delivered
 * trip, including one whose POD had already been submitted or approved — so it
 * offered to re-upload a document the customer had already accepted.
 */
function setupDelivered(pod: { status: 'submitted' | 'approved' | 'rejected'; filename: string }) {
  const submittedAt = new Date().toISOString();
  store.set({
    loadId: 'nordcargo',
    status: ApplicationStatus.CONFIRMED,
    submittedAt,
    applications: {
      nordcargo: {
        loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt,
        tripId: 'TR-4821', tripStage: 'delivered',
        pod: {
          status: pod.status,
          filename: pod.filename,
          mimeType: 'application/pdf',
          dataUrl: 'data:application/pdf;base64,AAAA',
          uploadedAt: submittedAt,
        },
      },
    },
  });
  setup('/trip/nordcargo');
}

it('does not offer to upload a POD that is already under review', async () => {
  setupDelivered({ status: 'submitted', filename: 'signed-pod.pdf' });
  await screen.findAllByText(/TR-4821/);
  expect(screen.getByRole('button', { name: 'POD under review' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Upload POD' })).toBeNull();
});

it('does not offer to upload a POD that the customer already approved', async () => {
  setupDelivered({ status: 'approved', filename: 'signed-pod.pdf' });
  await screen.findAllByText(/TR-4821/);
  expect(screen.getByRole('button', { name: 'Awaiting customer payment' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Upload POD' })).toBeNull();
  // The copy must not keep asking for a document the customer already accepted.
  expect(screen.getByText(/Document accepted by the customer/)).toBeTruthy();
});

it('asks for a corrected document when the customer rejected the POD', async () => {
  setupDelivered({ status: 'rejected', filename: 'unreadable.pdf' });
  await screen.findAllByText(/TR-4821/);
  expect(screen.getByRole('button', { name: 'Upload a corrected document' })).toBeTruthy();
});
