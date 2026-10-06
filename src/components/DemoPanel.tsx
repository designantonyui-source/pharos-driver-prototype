import { useStore } from '../lib/store';

/**
 * Dev-only helper: the real journey waits for time-based events
 * (dispatcher approval, customer confirmation), so we jump between states.
 */
export function DemoPanel() {
  const { state, setStatus, reset } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-[var(--color-border-subtle)] bg-white p-3 text-[12px] shadow-lg">
      <div className="mb-2 font-semibold">Demo · application status: {state.status}</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatus('awaiting-dispatcher')}>→ sent</button>
        <button onClick={() => setStatus('awaiting-customer')}>→ dispatcher approved</button>
        <button onClick={() => setStatus('confirmed')}>→ customer confirmed</button>
        <button onClick={() => setStatus('none')}>⟲ reset</button>
        <button onClick={reset}>clear storage</button>
      </div>
    </div>
  );
}
