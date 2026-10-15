import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { Trips } from './Trips';

function setup() {
  return render(
    <MemoryRouter initialEntries={['/v2/trips']}>
      <Routes><Route path="/v2/trips" element={<Trips />} /></Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => { store.reset(); });

describe('Trips hub', () => {
  it('shows loading skeletons first', async () => {
    setup();
    expect(await screen.findByLabelText('Loading trips')).toBeTruthy();
  });

  it('shows the empty state with a CTA when there are no applications', async () => {
    setup();
    expect(await screen.findByText('No trips yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Find loads' })).toBeTruthy();
  });

  it('groups active, in-review and past entries', async () => {
    store.set({ applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt: null },
      belroute: { loadId: 'belroute', status: ApplicationStatus.SENT, submittedAt: null },
      'calais-lille': { loadId: 'calais-lille', status: ApplicationStatus.REJECTED, submittedAt: null },
    } });
    setup();
    expect(await screen.findByText('Active trip')).toBeTruthy();
    expect(screen.getAllByText('In review').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Past')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open trip TR–LILLE–BRUSSELS' })).toBeTruthy();
    expect(screen.getByText('Declined')).toBeTruthy();
  });

  it('routes cancelled-after-confirm past rows to the trip, not the tracker', async () => {
    store.set({ applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt: null, cancelledAfterConfirm: true },
    } });
    setup();
    const row = await screen.findByText('Cancelled trip');
    expect(row.closest('a')?.getAttribute('href')).toBe('/trip/nordcargo');
  });

  it('hides dismissed loads from the hub', async () => {
    store.set({ applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true },
    } });
    setup();
    expect(await screen.findByText('No trips yet')).toBeTruthy();
  });
});
