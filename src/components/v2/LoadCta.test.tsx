import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store } from '../../lib/store';
import { V2_LOADS } from '../../lib/v2/loads';
import { LoadCta } from './LoadCta';
import { LoadSheet } from './LoadSheet';

beforeEach(() => store.reset());
afterEach(() => store.reset());

function renderCta() {
  return render(<MemoryRouter><LoadCta loadId="nordcargo" /></MemoryRouter>);
}

describe('LoadCta', () => {
  it('without an application shows the price and opens confirmation', () => {
    renderCta();
    fireEvent.click(screen.getByRole('button', { name: 'Apply for €360' }));
    expect(screen.getByRole('heading', { name: 'Apply for Lille → Brussels' })).toBeVisible();
  });

  it.each([ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW])('disables applying and links to status in %s', (status) => {
    store.set({ loadId: 'nordcargo', status });
    renderCta();
    expect(screen.getByRole('button', { name: 'Application sent' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'View status' })).toHaveAttribute('href', '/application/nordcargo');
    expect(screen.queryByRole('button', { name: 'Apply for €360' })).not.toBeInTheDocument();
  });

  it('CONFIRMED opens the trip', () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    render(<MemoryRouter><Routes><Route path="/" element={<LoadCta loadId="nordcargo" />} /><Route path="/trip/:id" element={<h1>Trip destination</h1>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'View trip' }));
    expect(screen.getByRole('heading', { name: 'Trip destination' })).toBeVisible();
  });

  it('REJECTED disables applying and links to the reason', () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.REJECTED });
    renderCta();
    expect(screen.getByRole('button', { name: 'Application rejected' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'View reason' })).toHaveAttribute('href', '/application/nordcargo');
  });

  it('CANCELLED allows applying again', () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CANCELLED });
    renderCta();
    fireEvent.click(screen.getByRole('button', { name: 'Apply again' }));
    expect(screen.getByRole('heading', { name: 'Apply for Lille → Brussels' })).toBeVisible();
  });

  it('updates when global application state changes', () => {
    renderCta();
    act(() => store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT }));
    expect(screen.getByRole('button', { name: 'Application sent' })).toBeDisabled();
  });

  it('another load’s application does not disable this load', () => {
    store.set({ loadId: 'belroute', status: ApplicationStatus.SENT });
    renderCta();
    expect(screen.getByRole('button', { name: 'Apply for €360' })).toBeEnabled();
  });

  it('details View status opens the matching tracker and preserves the scenario', () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CUSTOMER_REVIEW });
    store.set({ loadId: 'belroute', status: ApplicationStatus.SENT });
    render(<MemoryRouter initialEntries={['/v2?scenario=reject']}><Routes>
      <Route path="/v2" element={<LoadSheet load={V2_LOADS[0]} open onClose={() => undefined} />} />
      <Route path="/application/nordcargo" element={<h1>NordCargo tracker</h1>} />
    </Routes></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'View status' });
    expect(link).toHaveAttribute('href', '/application/nordcargo?scenario=reject');
    fireEvent.click(link);
    expect(screen.getByRole('heading', { name: 'NordCargo tracker' })).toBeVisible();
    expect(store.get()).toMatchObject({ loadId: 'nordcargo', status: ApplicationStatus.CUSTOMER_REVIEW });
  });

  it('selector returns null for unknown loads and retains previous applications', () => {
    expect(getApplicationForLoad('nordcargo')).toBeNull();
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    store.set({ loadId: 'belroute', status: ApplicationStatus.CONFIRMED });
    expect(getApplicationForLoad('nordcargo')).toMatchObject({ status: ApplicationStatus.SENT });
    expect(getApplicationForLoad('belroute')).toMatchObject({ status: ApplicationStatus.CONFIRMED });
  });
  it('notifies the owning screen if another request applied while confirmation was open', async () => {
    vi.useFakeTimers();
    try {
      const onNotice = vi.fn();
      render(<MemoryRouter><LoadCta loadId="nordcargo" onNotice={onNotice} /></MemoryRouter>);
      fireEvent.click(screen.getByRole('button', { name: 'Apply for €360' }));
      act(() => store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT }));
      fireEvent.click(screen.getByRole('button', { name: 'Send application' }));
      await act(async () => { await vi.advanceTimersByTimeAsync(600); });
      expect(onNotice).toHaveBeenCalledWith('Already applied', 'This application is still in review.');
      expect(screen.queryByRole('heading', { name: 'Apply for Lille → Brussels' })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

});
