import { fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('button', { name: 'No loads match' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Brussels' } });
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'Paris' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
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
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
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

  it('offers popular destinations not already in Recent, tap fills To', () => {
    const onApply = vi.fn();
    const countFor = (route: { from: string; to: string }) =>
      route.from === '' && (route.to === 'Brussels' || route.to === 'Antwerp') ? 2 : 0;
    render(
      <MemoryRouter>
        <RouteSheet
          open
          value={{ from: '', to: 'Paris' }}
          countFor={countFor}
          onApply={onApply}
          onClose={() => undefined}
          cities={['Brussels', 'Antwerp']}
          recentRoutes={[{ from: '', to: 'Antwerp', at: new Date().toISOString() }]}
        />
      </MemoryRouter>,
    );
    const popular = within(screen.getByRole('region', { name: 'Popular destinations' }));
    // Antwerp lives in Recent — Popular must not duplicate it.
    expect(popular.queryByRole('button', { name: /Antwerp/ })).toBeNull();
    fireEvent.click(popular.getByRole('button', { name: 'Brussels, 2 loads' }));
    expect(screen.getByLabelText('To')).toHaveValue('Brussels');
    expect(onApply).not.toHaveBeenCalled();
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