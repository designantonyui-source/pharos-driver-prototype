/**
 * figma: n/a · Invoice PDF (Wave 2) — dependency-free printable document.
 * props: invoice (render); downloadInvoicePdf(invoice) (action)
 * tokens: n/a — print document uses its own ink-on-paper stylesheet so the
 *   PDF looks identical on any machine (no app tokens, no Tailwind).
 *
 * Approach: open a print window with a self-contained A4 document and call
 * print() — the driver saves as PDF from the system dialog. No jsPDF/html2canvas
 * dependency, no canvas rasterisation: selectable text, exact VAT math.
 */
import type { Invoice } from './invoices';

export function formatEuro(amount: number): string {
  return `EUR ${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function invoiceHtml(invoice: Invoice): string {
  const d = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  const lines = invoice.lines.map(l => `
      <tr>
        <td>${l.description}<br><span class="muted">${l.lane}</span></td>
        <td class="num">${formatEuro(l.amount)}</td>
      </tr>`).join('');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${invoice.number} — ${invoice.seller.name}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #172a35; margin: 0; padding: 24px; }
  h1 { font-size: 28px; margin: 0 0 4px; }
  .sub { color: #586d79; font-size: 13px; }
  .grid { display: flex; gap: 24px; margin: 24px 0; }
  .party { flex: 1; font-size: 13px; line-height: 1.5; }
  .party h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #80929e; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #80929e; padding: 8px 0; border-bottom: 2px solid #172a35; }
  td { padding: 10px 0; border-bottom: 1px solid #d7e0e6; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-left: auto; width: 260px; font-size: 14px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { font-weight: 700; font-size: 18px; border-top: 2px solid #172a35; margin-top: 6px; padding-top: 8px; }
  .muted { color: #586d79; font-size: 12px; }
  .note { margin-top: 24px; font-size: 12px; color: #586d79; border: 1px solid #d7e0e6; border-radius: 8px; padding: 12px; }
  .status { display: inline-block; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; background: #e8f6ef; color: #216547; text-transform: uppercase; letter-spacing: .05em; }
  .status.pending { background: #fff4df; color: #855300; }
  .status.overdue { background: #fdecea; color: #8a1f17; }
  .status.void { background: #eef1f3; color: #52646f; text-decoration: line-through; }
  .foot { margin-top: 32px; font-size: 11px; color: #80929e; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>Invoice ${invoice.number}</h1>
  <div class="sub">Issued ${d(invoice.issuedAt)} · ${invoice.status === 'void' ? 'Voided' : `Due ${d(invoice.dueAt)} (${invoice.paymentTermDays}-day terms)`} · Trip ${invoice.tripId} · <span class="status ${invoice.status}">${invoice.status}</span></div>
  <div class="grid">
    <div class="party"><h2>From</h2><strong>${invoice.seller.name}</strong><br>${invoice.seller.address}<br>VAT ${invoice.seller.vatId}</div>
    <div class="party"><h2>Bill to</h2><strong>${invoice.buyer.name}</strong><br>${invoice.buyer.address}<br>VAT ${invoice.buyer.vatId}</div>
  </div>
  ${invoice.status === 'void' ? '<div class="note"><strong>Voided.</strong> This invoice must not be paid or sent to the customer.</div>' : ''}
  <table>
    <thead><tr><th>Description</th><th class="num">Amount</th></tr></thead>
    <tbody>${lines}</tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Net</span><span>${formatEuro(invoice.amount)}</span></div>
    <div class="row"><span>VAT (${Math.round(invoice.vatRate * 100)}%)</span><span>${formatEuro(invoice.vatAmount)}</span></div>
    <div class="row grand"><span>Total</span><span>${formatEuro(invoice.total)}</span></div>
  </div>
  <div class="note">${invoice.note}</div>
  <div class="foot">Generated locally by the Pharos driver app. Not a fiscal invoice until confirmed by accounting.</div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>
</body></html>`;
}

/** Opens the printable invoice; the driver picks “Save as PDF” in the dialog. */
export function downloadInvoicePdf(invoice: Invoice): void {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(invoiceHtml(invoice));
  win.document.close();
  win.focus();
}
