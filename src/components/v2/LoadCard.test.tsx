import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { store, type LoadApplication } from '../../lib/store';
import { V2_LOADS } from '../../lib/v2/loads';
import { CARD_STATE_STYLES, LoadCard, cityLabel, crossBorder, routeAriaLabel, sortLoadsByApplication } from './LoadCard';
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

  it('header shows badge left, no decide timer, no X button — hide is swipe only', () => {
    store.set({ loadId: load.id, status: ApplicationStatus.CANCELLED });
    render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} onDismiss={() => undefined} /></MemoryRouter>);
    expect(screen.getByText('Cancelled by you', { exact: true })).toBeVisible();
    expect(screen.queryByText(/Decide in/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Not interested/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hide this load' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Hide load ${load.id}. You can restore it later.` })).toBeVisible();
  });

  it('route is the second anchor after the rate, facts split decision and trust', () => {
    const { container } = render(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    const route = screen.getByRole('button', { name: 'Lille, France to Brussels, Belgium. Open details.' });
    expect(route).toHaveClass('text-heading-20');
    expect(route).not.toHaveTextContent('FR → BE');
    const facts = screen.getByLabelText(/km loaded, .* minutes to pickup/);
    expect(facts.tagName).toBe('DIV');
    const lines = facts.querySelectorAll('p');
    expect(lines.length).toBe(2);
    expect(lines[0]).toHaveClass('text-body-14');
    expect(lines[1]).toHaveClass('text-body-14');
    const trust = container.querySelector('article > p.text-label-14');
    expect(trust).toBeVisible();
    expect(screen.getByText('NordCargo')).toHaveClass('font-semibold');
    expect(screen.getByLabelText('NordCargo, rating 4.8, verified, Paid in 7 days, cross-border')).toBeVisible();
  });

  it('domestic route has no cross-border suffix', () => {
    render(<MemoryRouter><LoadCard load={{ ...V2_LOADS[1], onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.queryByText(/cross-border/)).not.toBeInTheDocument();
  });

  it('country codes mark EU cities, cross-border pill only for FR/BE crossings', () => {
    expect(cityLabel('Lille')).toBe('Lille FR');
    expect(cityLabel('Antwerp')).toBe('Antwerp BE');
    expect(cityLabel('Unknown')).toBe('Unknown');
    expect(crossBorder('Lille', 'Brussels')).toBe('FR → BE');
    expect(crossBorder('Calais', 'Lille')).toBeNull();
    expect(crossBorder('Ghent', 'Antwerp')).toBeNull();
    expect(routeAriaLabel('Lille', 'Brussels')).toBe('Lille, France to Brussels, Belgium. Open details.');
  });

  it('far pickup reads semibold warning, near pickup stays plain', () => {
    const { rerender } = render(<MemoryRouter><LoadCard load={{ ...V2_LOADS[1], onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.getByLabelText('Today 16:00–17:00, 68 km loaded, 42 km 45 minutes to pickup')).toBeVisible();
    expect(screen.getByText('42 km').closest('p')).toHaveClass('font-semibold');
    rerender(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.getByText('18 km').closest('p')).not.toHaveClass('font-semibold');
  });

  it('swipe-to-hide reveals the Hide action and hides the card', () => {
    const onDismiss = vi.fn();
    render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} onDismiss={onDismiss} /></MemoryRouter>);
    const card = screen.getByRole('article');
    fireEvent.touchStart(card, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(card);
    const hide = screen.getByRole('button', { name: `Hide load ${load.id}. You can restore it later.` });
    expect(hide).toBeVisible();
    fireEvent.click(hide);
    expect(onDismiss).toHaveBeenCalledWith(expect.objectContaining({ id: load.id }));
  });

  it('vertical scroll does not trigger the swipe', () => {
    render(<MemoryRouter><LoadCard load={load} onOpen={() => undefined} onDismiss={() => undefined} /></MemoryRouter>);
    const card = screen.getByRole('article');
    fireEvent.touchStart(card, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 195, clientY: 300 }] });
    fireEvent.touchEnd(card);
    expect(card).not.toHaveStyle({ transform: 'translateX(-88px)' });
  });

  it('header renders nothing when there is no badge and no booked countdown', () => {
    render(<MemoryRouter><LoadCard load={{ ...load, onRoute: false }} isOnRoute={false} onOpen={() => undefined} /></MemoryRouter>);
    expect(screen.queryByRole('status', { name: /On your route/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Decide in/)).not.toBeInTheDocument();
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
