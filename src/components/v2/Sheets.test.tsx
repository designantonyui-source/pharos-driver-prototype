import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FiltersSheet } from './FiltersSheet';
import { RouteSheet } from './RouteSheet';

describe('FiltersSheet draft semantics', () => {
  const countFor = (draft: string[]) => (draft.includes('rate') ? 2 : 3);

  it('opens on the committed filters and applies the draft', () => {
    const onApply = vi.fn();
    render(
      <MemoryRouter>
        <FiltersSheet open active={['rate']} countFor={countFor} onApply={onApply} onClose={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '€3+/km, selected. Activate to remove.' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Show 2 loads' })).toBeEnabled();
    // Toggling the draft updates the preview live, before Apply.
    fireEvent.click(screen.getByRole('button', { name: '€3+/km, selected. Activate to remove.' }));
    expect(screen.getByRole('button', { name: 'Show 3 loads' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 loads' }));
    expect(onApply).toHaveBeenCalledWith([]);
  });

  it('clears the draft and disables Apply when nothing matches', () => {
    render(
      <MemoryRouter>
        <FiltersSheet open active={['rate']} countFor={() => 0} onApply={() => undefined} onClose={() => undefined} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'No loads match' })).toBeDisabled();
  });
});

describe('RouteSheet draft semantics', () => {
  it('previews the count live and applies the route', () => {
    const onApply = vi.fn();
    const countFor = (route: { from: string; to: string }) =>
      route.to.trim().toLocaleLowerCase() === 'brussels' ? 1 : 0;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={onApply} onClose={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Paris' } });
    // Zero matches used to be a dead end: a disabled "No loads match" button and
    // no way out except clearing a field by hand.
    expect(screen.queryByRole('button', { name: 'No loads match' })).toBeNull();
    expect(screen.getByText(/No loads on Anywhere → Paris/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Show 1 load toward Brussels/ })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Brussels' } });
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'Paris' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
  });

  it('recovers from a zero-match direction in one tap', () => {
    const onApply = vi.fn();
    const countFor = (route: { from: string; to: string }) =>
      route.from.trim() === '' && route.to.trim().toLocaleLowerCase() === 'brussels' ? 4 : 0;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={onApply} onClose={() => undefined} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'Antwerp' } });
    expect(screen.getByText(/No loads on Antwerp → Brussels/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Show 4 loads toward Brussels/ }));
    expect(onApply).toHaveBeenCalledWith({ from: '', to: 'Brussels' });
  });

  it('shows the same title to the eye and to a screen reader', () => {
    const countFor = () => 1;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={() => undefined} onClose={() => undefined} />
      </MemoryRouter>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Change direction');
    expect(screen.getByRole('heading', { name: 'Change direction' })).toBeTruthy();
  });

  it('states that an empty origin means anywhere', () => {
    const countFor = () => 1;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={() => undefined} onClose={() => undefined} />
      </MemoryRouter>,
    );
    // The feed header says "Anywhere → Brussels"; the field must say the same thing.
    expect(screen.getByLabelText('From')).toHaveProperty('placeholder', 'Anywhere');
  });

  it('suggests cities while typing, with live counts', () => {
    const onApply = vi.fn();
    // Origin Paris leaves only paris-brussels for Brussels: every other
    // destination suggestion reads 0 — it never promises an empty feed.
    const countFor = (route: { from: string; to: string }) =>
      route.from.trim().toLocaleLowerCase() === 'paris' && route.to.trim().toLocaleLowerCase() === 'brussels' ? 1 : 0;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: 'Paris', to: '' }} countFor={countFor} onApply={onApply} onClose={() => undefined} cities={['Paris', 'Brussels', 'Lille']} />
      </MemoryRouter>,
    );
    // Typing 'l' matches Brussels and Lille — one live, one dead.
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'l' } });
    const box = within(screen.getByTestId('route-destination-suggestions'));
    expect(box.getByRole('option', { name: 'Brussels, 1 load' })).toBeEnabled();
    expect(box.getByRole('option', { name: 'Lille, no loads' })).toBeDisabled();
    fireEvent.click(box.getByRole('option', { name: 'Brussels, 1 load' }));
    expect(screen.getByLabelText('To')).toHaveValue('Brussels');
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
  });

  it('filters suggestions as the driver types', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris', 'Brussels', 'Lille']} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'a' } });
    const box = within(screen.getByTestId('route-destination-suggestions'));
    expect(box.getByRole('option', { name: 'Paris, 1 load' })).toBeVisible();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'bru' } });
    expect(box.queryByRole('option', { name: 'Paris, 1 load' })).not.toBeInTheDocument();
    expect(box.getByRole('option', { name: 'Brussels, 1 load' })).toBeVisible();
  });

  it('shows no catalog on a bare focus — suggestions only while typing', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris', 'Brussels']} />
      </MemoryRouter>,
    );
    fireEvent.focus(screen.getByLabelText('To'));
    expect(screen.queryByTestId('route-destination-suggestions')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'par' } });
    expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
  });

  it('a stale blur timer of the other field cannot close the open list', () => {
    vi.useFakeTimers();
    try {
      render(
        <MemoryRouter>
          <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris']} />
        </MemoryRouter>,
      );
      fireEvent.focus(screen.getByLabelText('From'));
      // Leaving From schedules its 150ms close — then the driver types in To.
      fireEvent.blur(screen.getByLabelText('From'));
      fireEvent.change(screen.getByLabelText('To'), { target: { value: 'par' } });
      expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(300));
      // The stale From timer fires here; the To list must survive.
      expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('refocusing the same field cancels its stale close timer', () => {
    vi.useFakeTimers();
    try {
      render(
        <MemoryRouter>
          <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris']} />
        </MemoryRouter>,
      );
      const to = screen.getByLabelText('To');
      fireEvent.focus(to);
      fireEvent.blur(to);
      fireEvent.focus(to); // focus cancels the pending close
      fireEvent.change(to, { target: { value: 'par' } });
      expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(300));
      expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('hides the list once the query exactly matches a city — the CTA owns that tap', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris', 'Brussels']} />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Bru' } });
    expect(screen.getByTestId('route-destination-suggestions')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Brussels' } });
    expect(screen.queryByTestId('route-destination-suggestions')).not.toBeInTheDocument();
  });

  it('recalls recent directions by filling the draft, then Show commits', () => {
    const onApply = vi.fn();
    render(
      <MemoryRouter>
        <RouteSheet
          open
          value={{ from: '', to: 'Brussels' }}
          countFor={() => 1}
          onApply={onApply}
          onClose={() => undefined}
          cities={['Brussels']}
          recentRoutes={[{ from: 'Paris', to: 'Brussels' }, { from: '', to: 'Brussels' }]}
        />
      </MemoryRouter>,
    );
    const recent = within(screen.getByRole('region', { name: 'Recent directions' }));
    // The committed route is not offered back to itself.
    expect(recent.queryByRole('button', { name: /Anywhere to Brussels/ })).toBeNull();
    // Tap fills the fields instead of applying behind your back.
    fireEvent.click(recent.getByRole('button', { name: 'Paris to Brussels, 1 load' }));
    expect(screen.getByLabelText('From')).toHaveValue('Paris');
    expect(screen.getByLabelText('To')).toHaveValue('Brussels');
    expect(onApply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
  });

  it('clears a filled field with one tap', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: 'Paris', to: 'Brussels' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris', 'Brussels']} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear From' }));
    expect(screen.getByLabelText('From')).toHaveValue('');
  });
});