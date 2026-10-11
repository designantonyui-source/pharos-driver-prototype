/** figma: 769:10428 · Account tests; tokens: inherited */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as api from '../../lib/api';
import { store } from '../../lib/store';
import { Account, EditContact } from './Account';
let router: ReturnType<typeof createMemoryRouter>;
beforeEach(() => store.reset());
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); store.reset(); });
function setup(edit = true, start: 'edit' | 'profile' | 'account' = 'profile') {
  const entry = edit ? '/v2/account/profile/edit' : start === 'account' ? '/v2/account' : '/v2/account/profile';
  router = createMemoryRouter([
    { path: '/v2', element: <p>Loads page</p> },
    { path: '/v2/trips', element: <p>Trips page</p> },
    { path: '/v2/account', element: <Account /> },
    { path: '/v2/account/profile', element: <Account detail /> },
    { path: '/v2/account/profile/edit', element: <EditContact /> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: ['/v2/account', entry] });
  render(<RouterProvider router={router} />);
}
function unload() { const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }
it('shows readonly prototype identity and profile navigation', async () => {
  setup(false);
  await screen.findByText('Alexey K.');
  expect(screen.getByText(/Driver identity is read-only/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Edit contact' }));
  await screen.findByLabelText('Phone', { exact: false });
  expect(screen.queryByLabelText('Driver')).toBeNull();
});
it('disables unchanged and invalid values, saves once and clears dirty state', async () => {
  const save = vi.spyOn(api, 'updateDriverProfile'); setup();
  const phone = await screen.findByLabelText('Phone', { exact: false });
  expect((screen.getByRole('button', { name: 'Save contact' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(phone, { target: { value: 'abc' } });
  expect(screen.getByText('Enter a valid phone — 7–15 digits.')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Save contact' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(phone, { target: { value: '+123456789' } });
  fireEvent.change(screen.getByLabelText('Email', { exact: false }), { target: { value: 'bad' } });
  expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Email', { exact: false }), { target: { value: 'driver@example.com' } });
  expect(unload()).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
  await screen.findByRole('status');
  expect(save).toHaveBeenCalledTimes(1);
  expect(unload()).toBe(false);
});
it('shows the Earnings entry to Balance on the Account menu', async () => {
  setup(false, 'account');
  await screen.findByText('Alexey K.');
  expect(screen.getByRole('link', { name: /Balance/ })).toBeTruthy();
  expect(screen.getByText('Available, pending, cash out, history')).toBeTruthy();
});
it('blocks tabs and data-router back, keeps editing or discards', async () => {
  setup(); fireEvent.change(await screen.findByLabelText('Phone', { exact: false }), { target: { value: '123456789' } });
  fireEvent.click(screen.getByRole('link', { name: 'Trips' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(router.state.location.pathname).toBe('/v2/account/profile/edit');
  await act(async () => { await router.navigate(-1); });
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
  await screen.findByRole('heading', { name: 'Account' });
  expect(unload()).toBe(false);
});
it('guards saving navigation and duplicate submissions; failure remains retryable', async () => {
  let reject!: (error: Error) => void;
  const save = vi.spyOn(api, 'updateDriverProfile').mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  setup(); fireEvent.change(await screen.findByLabelText('Phone', { exact: false }), { target: { value: '123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
  fireEvent.submit(screen.getByLabelText('Phone', { exact: false }).closest('form')!);
  expect(save).toHaveBeenCalledTimes(1); expect(unload()).toBe(true);
  await act(async () => { await router.navigate(-1); });
  expect((screen.getByRole('button', { name: 'Discard' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  await act(async () => reject(new Error('offline')));
  await screen.findByRole('alert'); expect(unload()).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
  await screen.findByRole('status'); expect(unload()).toBe(false);
});

it('continues guarding a blocked navigation until a pending save succeeds', async () => {
  const initial = await api.getDriverProfile();
  let finish!: (value: typeof initial) => void;
  vi.spyOn(api, 'updateDriverProfile').mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  setup(); fireEvent.change(await screen.findByLabelText('Phone', { exact: false }), { target: { value: '123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
  fireEvent.click(screen.getByRole('link', { name: 'Loads' }));
  await screen.findByRole('dialog');
  expect(unload()).toBe(true);
  await act(async () => finish({ ...initial, phone: '123456789' }));
  expect(unload()).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  await screen.findByRole('status');
  fireEvent.click(screen.getByRole('link', { name: 'Loads' }));
  await screen.findByText('Loads page');
});
