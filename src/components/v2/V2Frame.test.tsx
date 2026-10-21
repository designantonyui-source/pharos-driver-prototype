import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { store } from '../../lib/store';
import { V2Frame } from './V2Frame';

function renderFrame() {
  render(
    <MemoryRouter>
      <V2Frame active="Loads"><p>Screen</p></V2Frame>
    </MemoryRouter>,
  );
}

beforeEach(() => { localStorage.clear(); store.reset(); });
afterEach(() => { cleanup(); localStorage.clear(); store.reset(); });

it('keeps the Trips tab quiet when no trip is active', () => {
  renderFrame();
  expect(screen.getByRole('link', { name: 'Trips' })).toBeTruthy();
});

it('marks the Trips tab when a confirmed trip is active', () => {
  store.set({
    applications: {
      nordcargo: { loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt: null },
    },
  });
  renderFrame();
  expect(screen.getByRole('link', { name: 'Trips, active trip' })).toBeTruthy();
});
