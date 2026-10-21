import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { ApplicationStatus } from '../lib/models';
import {
  acceptDemoPod, customerPaysDemoTrip, DEMO_LOAD_ID, demoCustomerConfirm,
  demoDispatcherApprove, demoTripToDelivered, markWithdrawalDelayed, markWithdrawalFailed,
  markWithdrawalPaid, rejectDemoPod, resetDemoScenario, returnWithdrawalFunds,
  submitProofOfDelivery, type DemoScenarioId,
} from '../lib/api';

/**
 * Dev-only helper: portfolio demo scenarios for the payments case study.
 * Four entries (book → deliver → cash out → resolve an issue), managed external
 * events (dispatcher, customer, POD review, payout outcome), clean reset per
 * scenario. A new application has its own short auto-review loop; the presenter
 * can still drive any transition manually.
 */
const SCENARIOS: Array<{ id: DemoScenarioId; label: string; to: string }> = [
  { id: 'book', label: '1 · Find and book a load', to: '/v2' },
  { id: 'deliver', label: '2 · Complete delivery, unlock earnings', to: `/trip/${DEMO_LOAD_ID}` },
  { id: 'cashout', label: '3 · Cash out earnings', to: '/v2/account/balance' },
  { id: 'issue', label: '4 · Resolve a payout issue', to: '/v2/account/balance/history' },
];

const POD_FILE = { filename: 'signed-pod.pdf', mimeType: 'application/pdf', dataUrl: 'data:application/pdf;base64,AAAA' };

export function DemoPanel({ offset = false }: { offset?: boolean }) {
  const { state, setStatus, reset } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<unknown>, to?: string) {
    setBusy(label);
    setNote(null);
    try {
      await fn();
      if (to) navigate(to);
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  async function scenario(id: DemoScenarioId, to: string) {
    await run(`reset:${id}`, () => resetDemoScenario(id), to);
  }

  function lastWithdrawalId(): string | null {
    const entries = state.ledger.filter((e) => e.kind === 'withdrawal');
    return entries.length > 0 ? entries[entries.length - 1].id : null;
  }

  const wid = lastWithdrawalId();
  return (
    <div className={`fixed ${offset ? 'bottom-[7.5rem]' : 'bottom-4'} right-4 z-50 max-h-[70vh] w-[280px] overflow-y-auto rounded-xl border border-[var(--color-border-default)] bg-white p-3 text-[12px] shadow-lg`}>
      <div className="mb-2 font-semibold">Payments case · {state.status ?? 'none'}</div>
      <div className="mb-2 flex flex-col gap-1">
        {SCENARIOS.map((s) => (
          <button key={s.id} disabled={!!busy} onClick={() => { void scenario(s.id, s.to); }} className="rounded border border-[var(--color-border-default)] px-2 py-1 text-left disabled:opacity-50">
            {s.label} ⟲
          </button>
        ))}
      </div>
      <div className="mb-1 font-semibold">External events</div>
      <div className="flex flex-wrap gap-1">
        <button disabled={!!busy} onClick={() => { void run('dispatcher', () => demoDispatcherApprove()); }}>→ dispatcher + customer review</button>
        <button disabled={!!busy} onClick={() => { void run('confirm', () => demoCustomerConfirm(), `/trip/${DEMO_LOAD_ID}`); }}>→ confirmed</button>
        <button disabled={!!busy} onClick={() => { void run('delivered', () => demoTripToDelivered(), `/trip/${DEMO_LOAD_ID}`); }}>→ delivered</button>
        <button disabled={!!busy} onClick={() => { void run('pod', () => submitProofOfDelivery(DEMO_LOAD_ID, POD_FILE)); }}>→ POD submitted</button>
        <button disabled={!!busy} onClick={() => { void run('pod-ok', () => acceptDemoPod(DEMO_LOAD_ID)); }}>→ POD accepted</button>
        <button disabled={!!busy} onClick={() => { void run('pod-no', () => rejectDemoPod(DEMO_LOAD_ID, 'Unreadable signature')); }}>→ POD rejected</button>
        <button disabled={!!busy} onClick={() => { void run('paid', () => customerPaysDemoTrip(DEMO_LOAD_ID), '/v2/account/balance'); }}>→ customer paid</button>
      </div>
      <div className="mb-1 mt-2 font-semibold">Payout outcome</div>
      <div className="flex flex-wrap gap-1">
        <button disabled={!!busy || !wid} onClick={() => wid && void run('delayed', () => markWithdrawalDelayed(wid))}>→ delayed</button>
        <button disabled={!!busy || !wid} onClick={() => wid && void run('arrived', () => markWithdrawalPaid(wid))}>→ paid</button>
        <button disabled={!!busy || !wid} onClick={() => wid && void run('failed', () => markWithdrawalFailed(wid, 'Bank rejected the transfer'))}>→ failed</button>
        <button disabled={!!busy || !wid} onClick={() => wid && void run('returned', () => returnWithdrawalFunds(wid, false))}>→ funds returned</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button onClick={() => setStatus(ApplicationStatus.SENT)}>→ sent</button>
        <button onClick={() => setStatus(ApplicationStatus.CUSTOMER_REVIEW)}>→ dispatcher approved</button>
        <button onClick={() => setStatus(ApplicationStatus.CONFIRMED)}>→ customer confirmed</button>
        <button onClick={() => setStatus(ApplicationStatus.EXPIRED)}>→ expired</button>
        <button onClick={() => setStatus(null)}>⟲ reset</button>
        <button onClick={reset}>clear storage</button>
      </div>
      {busy && <p className="mt-2" role="status">Working: {busy}…</p>}
      {note && <p className="mt-2" role="alert">{note}</p>}
    </div>
  );
}
