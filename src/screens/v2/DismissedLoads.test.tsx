/** figma: not mapped · Driver v2 dismissed loads
 * props: controller UI tests
 * tokens: inherited from DismissedLoads
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { DismissedLoads } from './DismissedLoads';

const load = V2_LOADS[0];
function dismiss() {
  store.set({ applications: { [load.id]: { loadId: load.id, status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true } } });
}
function setup() { render(<MemoryRouter><DismissedLoads /></MemoryRouter>); }
beforeEach(() => { store.reset(); vi.spyOn(api, 'getLoads').mockResolvedValue(V2_LOADS); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); store.reset(); });

describe('DismissedLoads', () => {
  it('shows loading, actual routes and companies, and subscribes to dismissals', async () => {
    let resolve!: (loads: typeof V2_LOADS) => void;
    vi.mocked(api.getLoads).mockReturnValue(new Promise(done => { resolve = done; }));
    setup();
    expect(screen.getByLabelText('Loading dismissed loads')).toBeTruthy();
    await act(async () => resolve(V2_LOADS));
    expect(screen.getByText('No dismissed loads')).toBeTruthy();
    act(dismiss);
    expect(screen.getByText('Lille → Brussels')).toBeTruthy();
    expect(screen.getByText('NordCargo · €360 · today 14:00–15:00')).toBeTruthy();
    act(() => store.reset());
    expect(screen.getByText('No dismissed loads')).toBeTruthy();
  });

  it('offers retry after fetch failure without showing a false empty state', async () => {
    vi.mocked(api.getLoads).mockRejectedValueOnce(new Error('offline'));
    dismiss(); setup();
    await screen.findByText('Could not load dismissed loads');
    expect(screen.queryByText('No dismissed loads')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('Lille → Brussels');
    expect(api.getLoads).toHaveBeenCalledTimes(2);
  });

  it('guards overlapping restores and Undo, then returns the load to the list', async () => {
    dismiss();
    let finish!: () => void;
    const restore = vi.spyOn(api, 'restoreLoad').mockImplementation(() => new Promise(resolve => {
      finish = () => { store.set({}, [load.id]); resolve({ loadId: load.id, dismissed: false }); };
    }));
    const undo = vi.spyOn(api, 'dismissLoad');
    setup();
    const button = await screen.findByRole('button', { name: 'Restore NordCargo' });
    fireEvent.click(button); fireEvent.click(button);
    expect(restore).toHaveBeenCalledTimes(1);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    await act(async () => finish());
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await screen.findByRole('button', { name: 'Restore NordCargo' });
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('keeps failed restore and Undo retryable', async () => {
    dismiss();
    const realRestore = api.restoreLoad;
    vi.spyOn(api, 'restoreLoad').mockRejectedValueOnce(new Error('offline')).mockImplementation(realRestore);
    const realDismiss = api.dismissLoad;
    vi.spyOn(api, 'dismissLoad').mockRejectedValueOnce(new Error('offline')).mockImplementation(realDismiss);
    setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore NordCargo' }));
    await screen.findByText('Could not restore this load. Try Restore again.');
    fireEvent.click(screen.getByRole('button', { name: 'Restore NordCargo' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    await screen.findByText('Could not undo the restore. Try Undo again.');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await screen.findByRole('button', { name: 'Restore NordCargo' });
  });

  it('does not undo over a newer application', async () => {
    dismiss(); const undo = vi.spyOn(api, 'dismissLoad'); setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Restore NordCargo' }));
    await screen.findByRole('button', { name: 'Undo' });
    act(() => store.set({ applications: { [load.id]: { loadId: load.id, status: ApplicationStatus.SENT, submittedAt: null } } }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('can no longer be dismissed'));
  });
});
