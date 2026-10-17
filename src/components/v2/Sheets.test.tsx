import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FiltersSheet } from './FiltersSheet';
import { RouteSheet } from './RouteSheet';
import { isoDayOffset } from '../../lib/v2/loads';

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
    expect(screen.getByRole('button', { name: 'No loads match' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Brussels' } });
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'Paris' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels', day: '' });
  });

  it('suggests cities inside the field with live counts', () => {
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
    fireEvent.focus(screen.getByLabelText('To'));
    const box = within(screen.getByTestId('route-destination-suggestions'));
    expect(box.getByRole('option', { name: 'Brussels, 1 load' })).toBeEnabled();
    expect(box.getByRole('option', { name: 'Lille, no loads' })).toBeDisabled();
    fireEvent.click(box.getByRole('option', { name: 'Brussels, 1 load' }));
    expect(screen.getByLabelText('To')).toHaveValue('Brussels');
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels', day: '' });
  });

  it('filters suggestions as the driver types', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Paris', 'Brussels', 'Lille']} />
      </MemoryRouter>,
    );
    fireEvent.focus(screen.getByLabelText('To'));
    const box = within(screen.getByTestId('route-destination-suggestions'));
    expect(box.getByRole('option', { name: 'Paris, 1 load' })).toBeVisible();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'bru' } });
    expect(box.queryByRole('option', { name: 'Paris, 1 load' })).not.toBeInTheDocument();
    expect(box.getByRole('option', { name: 'Brussels, 1 load' })).toBeVisible();
  });

  it('applies a strip day with the route', () => {
    const onApply = vi.fn();
    const todayIso = isoDayOffset(0);
    const countFor = (route: { from: string; to: string; day?: string }) =>
      route.day ? (route.day === todayIso ? 2 : 0) : 3;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={onApply} onClose={() => undefined} cities={['Brussels']} />
      </MemoryRouter>,
    );
    const group = within(screen.getByRole('group', { name: 'Pickup day' }));
    fireEvent.click(group.getByRole('button', { name: /2 loads/ }));
    expect(screen.getByRole('button', { name: 'Show 2 loads' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show 2 loads' }));
    expect(onApply).toHaveBeenCalledWith({ from: '', to: 'Brussels', day: todayIso });
  });

  it('tapping the selected strip day again clears it back to any day', () => {
    const onApply = vi.fn();
    const todayIso = isoDayOffset(0);
    const countFor = (route: { from: string; to: string; day?: string }) =>
      route.day ? (route.day === todayIso ? 2 : 0) : 3;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels' }} countFor={countFor} onApply={onApply} onClose={() => undefined} cities={['Brussels']} />
      </MemoryRouter>,
    );
    const group = within(screen.getByRole('group', { name: 'Pickup day' }));
    fireEvent.click(group.getByRole('button', { name: /2 loads/ }));
    expect(screen.getByRole('button', { name: 'Show 2 loads' })).toBeEnabled();
    fireEvent.click(group.getByRole('button', { name: /selected\. Activate to remove\./ }));
    expect(screen.getByRole('button', { name: 'Show 3 loads' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 loads' }));
    expect(onApply).toHaveBeenCalledWith({ from: '', to: 'Brussels', day: '' });
  });

  it('opens on the committed day', () => {
    const tomorrowIso = isoDayOffset(1);
    const full = new Date(`${tomorrowIso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const countFor = (route: { from: string; to: string; day?: string }) =>
      route.day === tomorrowIso ? 1 : 0;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: '', to: 'Brussels', day: tomorrowIso }} countFor={countFor} onApply={() => undefined} onClose={() => undefined} cities={['Brussels']} />
      </MemoryRouter>,
    );
    const group = within(screen.getByRole('group', { name: 'Pickup day' }));
    expect(group.getByRole('button', { name: `${full}, selected. Activate to remove.` })).toBeVisible();
  });

  it('recalls recent directions and applies one in one tap', () => {
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
    fireEvent.click(recent.getByRole('button', { name: 'Paris to Brussels, 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels', day: '' });
  });

  it('offers popular destinations with live counts', () => {
    const onApply = vi.fn();
    const countFor = (route: { from: string; to: string }) =>
      route.from === '' && route.to === 'Brussels' ? 2 : 0;
    render(
      <MemoryRouter>
        <RouteSheet
          open
          value={{ from: '', to: 'Antwerp' }}
          countFor={countFor}
          onApply={onApply}
          onClose={() => undefined}
          cities={['Brussels', 'Antwerp']}
        />
      </MemoryRouter>,
    );
    const popular = within(screen.getByRole('region', { name: 'Popular destinations' }));
    fireEvent.click(popular.getByRole('button', { name: 'Anywhere to Brussels, 2 loads' }));
    expect(onApply).toHaveBeenCalledWith({ from: '', to: 'Brussels', day: '' });
  });
});