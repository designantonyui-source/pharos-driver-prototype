import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { store, type LoadApplication } from '../../lib/store';
import { V2_LOADS } from '../../lib/v2/loads';
import { CARD_STATE_STYLES, LoadCard, sortLoadsByApplication } from './LoadCard';
import { SmartLoadList } from './SmartLoadList';

beforeEach(() => store.reset());
afterEach(() => { store.reset(); vi.useRealTimers(); });
const load = { ...V2_LOADS[0], onRoute: true, pickupTime: '2026-10-10T14:00:00Z' };

const cases = [
  [null, 'available', 'On your route', 'Apply for €360', false],
  [ApplicationStatus.SENT, 'pending', 'In review', 'Application sent', true],
  [ApplicationStatus.DISPATCHER_REVIEW, 'pending', 'In review', 'Application sent', true],
  [ApplicationStatus.CUSTOMER_REVIEW, 'pending', 'In review', 'Application sent', true],
  [ApplicationStatus.CONFIRMED, 'booked', 'Booked · TR-nordcargo', 'View trip', false],
  [ApplicationStatus.REJECTED, 'rejected', 'Rejected', 'Application rejected', true],
  [ApplicationStatus.CANCELLED, 'cancelled', 'Cancelled by you', 'Apply again', false],
] as const;

describe('LoadCard states', () => {
  it.each(cases)('%s renders %s styles, badge and CTA', (status, state, badge, cta, disabled) => {
    if (status) store.set({ loadId: load.id, status });
    render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} /></MemoryRouter>);
    const card = screen.getByRole('article');
    for (const name of CARD_STATE_STYLES[state].container.split(' ')) expect(card).toHaveClass(name);
    expect(card).not.toHaveClass('border-l-4');
    expect(card).toHaveAttribute('data-state', state);
    const pill = screen.getByText(badge, { exact: true });
    expect(pill).toBeVisible();
    for (const name of CARD_STATE_STYLES[state].badge.split(' ')) expect(pill).toHaveClass(name);
    const button = screen.getByRole('button', { name: cta });
    if (disabled) expect(button).toBeDisabled(); else expect(button).toBeEnabled();
    if (status) expect(screen.queryByText('On your route')).not.toBeInTheDocument();
  });

  it('drops applications with a status outside the enum instead of rendering them as available', () => {
    store.set({ loadId: load.id, status: 'sent' as unknown as ApplicationStatus });
    render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.getByRole('article')).toHaveAttribute('data-state', 'available');
  });

  it('available off-route load has no badge', () => {
    render(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.queryByText('On your route')).not.toBeInTheDocument();
  });

  it('badge sits left and dismiss sits right in one header row', () => {
    store.set({ loadId: load.id, status: ApplicationStatus.CANCELLED });
    const { container } = render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} onDismiss={() => undefined} /></MemoryRouter>);
    const header = container.querySelector('article > div');
    expect(header).toHaveClass('justify-between');
    const badge = screen.getByText('Cancelled by you', { exact: true });
    const dismiss = screen.getByRole('button', { name: /Not interested/ });
    expect(header!.contains(badge)).toBe(true);
    expect(header!.contains(dismiss)).toBe(true);
    expect(badge.compareDocumentPosition(dismiss) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('route is the second anchor after the rate, facts sit quiet in caption', () => {
    const { container } = render(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    const route = screen.getByRole('button', { name: 'Lille to Brussels. Open details.' });
    expect(route).toHaveClass('text-heading-20');
    const facts = container.querySelectorAll('article > p.text-caption-12');
    expect(facts.length).toBe(2);
  });

  it('omits the header row when there is no badge and no dismiss', () => {
    const { container } = render(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Not interested/ })).not.toBeInTheDocument();
    expect(container.querySelector('article > div.justify-between')).toBeNull();
  });

  it('updates the booked countdown every minute and clears the timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
    store.set({ loadId: load.id, status: ApplicationStatus.CONFIRMED });
    const { unmount } = render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.getByText('Pickup in 2h 0m')).toBeVisible();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Pickup in 1h 59m')).toBeVisible();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('hides the booked countdown once the pickup window passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T14:00:00Z'));
    store.set({ loadId: load.id, status: ApplicationStatus.CONFIRMED });
    const { unmount } = render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.queryByText(/Pickup in/)).not.toBeInTheDocument();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([[ApplicationStatus.CONFIRMED, '/trip/nordcargo'], [ApplicationStatus.REJECTED, '/application/nordcargo']] as const)('tapping %s opens %s', (status, destination) => {
    store.set({ loadId: load.id, status });
    render(<MemoryRouter><Routes><Route path="/" element={<LoadCard load={load} onOpen={() => undefined} />} /><Route path={destination} element={<h1>Destination</h1>} /></Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('article'));
    expect(screen.getByRole('heading', { name: 'Destination' })).toBeVisible();
  });

  it('available card opens details; CTA opens confirmation without also opening details', () => {
    const onOpen = vi.fn();
    render(<MemoryRouter><LoadCard load={load} onOpen={onOpen} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('article'));
    expect(onOpen).toHaveBeenCalledWith(load);
    onOpen.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Apply for €360' }));
    expect(screen.getByRole('heading', { name: 'Apply for Lille → Brussels' })).toBeVisible();
    fireEvent.click(screen.getByText('Vehicle matches the load'));
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('pinned sorting', () => {
  it('pins booked before pending, preserves available order and does not mutate input', () => {
    const loads = ['available-b', 'pending', 'cancelled', 'booked', 'available-a', 'rejected'].map((id) => ({ ...load, id }));
    const applications: Record<string, LoadApplication> = Object.fromEntries(([
      ['pending', ApplicationStatus.SENT], ['booked', ApplicationStatus.CONFIRMED], ['rejected', ApplicationStatus.REJECTED], ['cancelled', ApplicationStatus.CANCELLED],
    ] as const).map(([loadId, status]) => [loadId, { loadId, status, submittedAt: null }]));
    expect(sortLoadsByApplication(loads, applications).map((item) => item.id)).toEqual(['booked', 'pending', 'available-b', 'available-a', 'cancelled', 'rejected']);
    expect(loads[0].id).toBe('available-b');
  });

  it('empty list offers to clear the filters', () => {
    const onClearFilters = vi.fn();
    render(<MemoryRouter><SmartLoadList loads={[]} currentRoute={{ from: '', to: '' }} onOpen={() => undefined} onClearFilters={onClearFilters} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('list and map use the same pinned order and react to status changes', () => {
    render(<MemoryRouter><SmartLoadList loads={V2_LOADS} currentRoute={{ from: '', to: '' }} onOpen={() => undefined} /></MemoryRouter>);
    act(() => {
      store.set({ loadId: 'belroute', status: ApplicationStatus.SENT });
      store.set({ loadId: 'calais-lille', status: ApplicationStatus.CONFIRMED });
    });
    const order = () => screen.getAllByRole('article').map((card) => card.getAttribute('aria-label'));
    expect(order()).toEqual(['Load calais-lille', 'Load belroute', 'Load nordcargo']);
    fireEvent.click(screen.getByRole('tab', { name: 'Map' }));
    expect(order()).toEqual(['Load calais-lille', 'Load belroute', 'Load nordcargo']);
  });
});
