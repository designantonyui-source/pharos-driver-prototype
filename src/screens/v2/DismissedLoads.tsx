/**
 * figma: not mapped · Driver v2 dismissed loads
 * props: none (controller); loads, loading, fetchError, mutationError, busy, restored, callbacks (view)
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary, color-text-danger,
 *   color-action-primary, color-action-text-inverse, color-border-default,
 *   spacing-8, spacing-12, spacing-16, radius-md, radius-sm, radius-pill,
 *   nav-bar-h, tab-bar-h, home-indicator-h, size-icon-xl, size-control-mobile
 */
import { useEffect, useRef, useState } from 'react';

import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { dismissLoad, getLoads, restoreLoad } from '../../lib/api';
import { store, useStore } from '../../lib/store';
import { dayLabel, type V2Load } from '../../lib/v2/loads';

type ViewProps = {
  loads: V2Load[];
  loading: boolean;
  fetchError: boolean;
  mutationError: string | null;
  busy: boolean;
  restored: V2Load | null;
  onRetry: () => void;
  onRestore: (load: V2Load) => void;
  onUndo: () => void;
};

export function DismissedLoadsView({ loads, loading, fetchError, mutationError, busy, restored, onRetry, onRestore, onUndo }: ViewProps) {
  return <V2Frame active="Account">
    <div className="absolute inset-x-0 top-0 z-20">
      <V2BackBar title="Dismissed loads" fallback="/v2/account" />
    </div>
    <main className="absolute inset-x-0 top-[var(--nav-bar-h)] bottom-[calc(var(--tab-bar-h)+var(--home-indicator-h))] overflow-y-auto px-[var(--spacing-16)] pb-[var(--spacing-24)] pt-[var(--spacing-8)] text-[var(--color-text-primary)]">
      <p className="px-[var(--spacing-12)] text-body-14 text-[var(--color-text-secondary)]">Hidden loads stay here. Restore one to see it in your feed again — hiding is free and never affects your score.</p>
      <h1 className="sr-only">Dismissed loads</h1>
      <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-12)]">
        {loading ? <div className="flex flex-col gap-[var(--spacing-12)]" role="status" aria-label="Loading dismissed loads">
          <div className="h-[96px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
          <div className="h-[96px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
          <span className="sr-only">Loading dismissed loads…</span>
        </div> : fetchError ? <Alert type="error" title="Could not load dismissed loads">Check your connection and try again.<span className="mt-[var(--spacing-8)] block"><Button label="Retry" appearance="secondary" onClick={onRetry} /></span></Alert> : loads.length === 0 ? <div className="flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
          <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="eye" size="md" /></span>
          <p className="text-heading-14 text-[var(--color-text-primary)]">No dismissed loads</p>
          <p className="text-body-14 text-[var(--color-text-secondary)]">Loads you hide from the feed will wait for you here.</p>
        </div> : <ul className="flex flex-col gap-[var(--spacing-12)]">
          {loads.map(load => <li key={load.id} className="rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)]">
            <div className="flex items-center gap-[var(--spacing-12)]">
              <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="truck" size="md" /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-14 text-[var(--color-text-primary)]">{load.from} → {load.to}</span>
                <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{load.company} · €{load.rate} · {dayLabel(load.date)} {load.window}</span>
              </span>
            </div>
            <div className="mt-[var(--spacing-12)]"><Button label={busy ? 'Restoring…' : `Restore ${load.company}`} appearance="secondary" disabled={busy} loading={busy} onClick={() => onRestore(load)} /></div>
          </li>)}
        </ul>}
        {restored && <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)]">
          <p role="status" className="text-body-14 text-[var(--color-text-primary)]">Restored {restored.from} → {restored.to} · {restored.company} to your feed.</p>
          <div className="mt-[var(--spacing-8)]"><Button label="Undo" appearance="secondary" disabled={busy} onClick={onUndo} /></div>
        </div>}
        {mutationError && <div role="alert"><Alert type="error" title="Something went wrong">{mutationError}</Alert></div>}
      </div>
    </main>
  </V2Frame>;
}

export function DismissedLoads() {
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState<V2Load | null>(null);
  const locked = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setFetchError(false);
    getLoads().then(result => { if (current) setLoads(result); }).catch(() => { if (current) setFetchError(true); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [attempt]);

  async function mutate(load: V2Load, undo: boolean) {
    if (locked.current) return;
    // Recheck live state, not the render snapshot, before starting a mutation.
    if (undo ? !!store.get().applications[load.id] : !store.get().applications[load.id]?.dismissed) {
      if (undo) { setRestored(null); setMutationError('This load has changed and can no longer be dismissed with Undo.'); }
      return;
    }
    locked.current = true;
    setBusy(true);
    setMutationError(null);
    try {
      await (undo ? dismissLoad(load.id) : restoreLoad(load.id));
      if (mounted.current) setRestored(undo ? null : load);
    } catch {
      if (mounted.current) setMutationError(undo ? 'Could not undo the restore. Try Undo again.' : 'Could not restore this load. Try Restore again.');
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return <DismissedLoadsView loads={loads.filter(load => state.applications[load.id]?.dismissed)} loading={loading} fetchError={fetchError} mutationError={mutationError} busy={busy} restored={restored} onRetry={() => setAttempt(value => value + 1)} onRestore={load => void mutate(load, false)} onUndo={() => { if (restored) void mutate(restored, true); }} />;
}
