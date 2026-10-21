/** figma: new Invoices proposal (Wave 2), not measured; tokens: inherited */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getInvoice, getInvoiceForLoad, getInvoices, invoicesToCsv } from '../../lib/invoices';
import { invoiceHtml } from '../../lib/invoicePdf';
import { BalanceHistory } from './Balance';
import { InvoiceDetails, InvoiceList } from './Invoices';

let router: ReturnType<typeof createMemoryRouter>;

function setup(path: string) {
  router = createMemoryRouter([
    { path: '/v2/account/balance', element: <p>Balance page</p> },
    { path: '/v2/account/balance/history', element: <BalanceHistory /> },
    { path: '/v2/account/balance/invoices', element: <InvoiceList /> },
    { path: '/v2/account/balance/invoices/:id', element: <InvoiceDetails /> },
    { path: '/trip/:id', element: <p>Trip page</p> },
    { path: '*', element: <p>Destination</p> },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); router?.dispose(); vi.restoreAllMocks(); localStorage.clear(); });

it('lists invoices newest-first with paid history', async () => {
  setup('/v2/account/balance/invoices');
  await screen.findByText('INV-2026-0038 · BelRoute');
  expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
  expect(screen.queryByText('pending')).toBeNull();
  fireEvent.click(screen.getByRole('link', { name: /INV-2026-0038/ }));
  await screen.findByText(/TVA 21%/);
});

it('shows invoice details with parties, VAT math and actions', async () => {
  setup('/v2/account/balance/invoices/inv-2026-0038');
  await screen.findByText('INV-2026-0038', { selector: 'p.sr-only' });
  expect(screen.getByText(/Northway Freight SAS/)).toBeTruthy();
  expect(screen.getByText(/BelRoute BV/)).toBeTruthy();
  expect(screen.getAllByText(/TVA 21%/).length).toBeGreaterThan(0);
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
  expect(open).toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Open trip' })).toBeNull();
});

it('links a history trip row to its invoice', async () => {
  setup('/v2/account/balance/history');
  const link = await screen.findByRole('link', { name: /Ghent → Antwerp.*invoice/ });
  fireEvent.click(link);
  await screen.findByText('INV-2026-0038', { selector: 'p.sr-only' });
});

it('exposes invoice lookup by load and accountant CSV', async () => {
  const invoices = await getInvoices();
  expect(invoices.length).toBe(2);
  expect(invoices[0].id).toBe('inv-2026-0038');
  expect(await getInvoice('nope')).toBeNull();
  expect(await getInvoiceForLoad('nordcargo')).toBeNull();
  const csv = invoicesToCsv(invoices);
  expect(csv.split('\n').length).toBe(3);
  expect(csv).toContain('INV-2026-0038');
  const html = invoiceHtml(invoices[0]);
  expect(html).toContain('INV-2026-0038');
  expect(html).toContain('TVA 21%');
  expect(html).toContain('EUR 350.90');
});
