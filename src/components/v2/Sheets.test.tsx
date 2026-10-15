import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FiltersSheet } from './FiltersSheet';
import { RouteSheet } from './RouteSheet';

describe('FiltersSheet draft semantics', () => {
  const countFor = (draft: string[]) => (draft.includes('today') ? 2 : 3);

  it('opens on the committed filters and applies the draft', () => {
    const onApply = vi.fn();
    render(
      <MemoryRouter>
        <FiltersSheet open active={['today']} countFor={countFor} onApply={onApply} onClose={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Today, selected. Activate to remove.' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Show 2 loads' })).toBeEnabled();
    // Toggling the draft updates the preview live, before Apply.
    fireEvent.click(screen.getByRole('button', { name: 'Today, selected. Activate to remove.' }));
    expect(screen.getByRole('button', { name: 'Show 3 loads' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 loads' }));
    expect(onApply).toHaveBeenCalledWith([]);
  });

  it('clears the draft and disables Apply when nothing matches', () => {
    render(
      <MemoryRouter>
        <FiltersSheet open active={['today']} countFor={() => 0} onApply={() => undefined} onClose={() => undefined} />
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
    fireEvent.change(screen.getByLabelText('Destination city'), { target: { value: 'Paris' } });
    expect(screen.getByRole('button', { name: 'No loads match' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Destination city'), { target: { value: 'Brussels' } });
    fireEvent.change(screen.getByLabelText('Origin city'), { target: { value: 'Paris' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
  });

  it('city chips fill the focused field and move focus on', () => {
    const onApply = vi.fn();
    // Origin Paris leaves only paris-brussels for Brussels: every destination chip
    // except Brussels reads 0 and is hidden — a chip never promises an empty feed.
    const countFor = (route: { from: string; to: string }) =>
      route.from.trim().toLocaleLowerCase() === 'paris' && route.to.trim().toLocaleLowerCase() === 'brussels' ? 1 : 0;
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: 'Paris', to: '' }} countFor={countFor} onApply={onApply} onClose={() => undefined} cities={['Paris', 'Brussels', 'Lille']} />
      </MemoryRouter>,
    );
    // Focus lands on destination on open: Brussels counts 1, Lille counts 0 and stays hidden.
    expect(screen.getByRole('button', { name: 'Use Brussels as destination, 1 load' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Lille — no loads as destination' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use Brussels as destination, 1 load' }));
    expect(screen.getByLabelText('Destination city')).toHaveValue('Brussels');
    // The tap moved focus to origin: the group label follows it.
    expect(screen.getByRole('group', { name: 'From — Paris' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Paris, 1 load as origin, selected. Activate to keep it.' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 load' }));
    expect(onApply).toHaveBeenCalledWith({ from: 'Paris', to: 'Brussels' });
  });

  it('labels the chips with the focused field', () => {
    render(
      <MemoryRouter>
        <RouteSheet open value={{ from: 'Lille', to: '' }} countFor={() => 1} onApply={() => undefined} onClose={() => undefined} cities={['Lille']} />
      </MemoryRouter>,
    );
    // Focus lands on destination on open; the chip group names it.
    expect(screen.getByRole('group', { name: 'To — pick a destination' })).toBeVisible();
    fireEvent.focus(screen.getByLabelText('Origin city'));
    expect(screen.getByRole('group', { name: 'From — Lille' })).toBeVisible();
  });
});