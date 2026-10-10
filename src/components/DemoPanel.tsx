import { useStore } from '../lib/store';
import { ApplicationStatus } from '../lib/models';

/**
 * Dev-only helper: the real journey waits for time-based events
 * (dispatcher approval, customer confirmation), so we jump between states.
 */
export function DemoPanel() {
  const { state, setStatus, reset } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-[var(--color-border-default)] bg-white p-3 text-[12px] shadow-lg">
      <div className="mb-2 font-semibold">Demo · application status: {state.status ?? 'none'}</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatus(ApplicationStatus.SENT)}>→ sent</button>
        <button onClick={() => setStatus(ApplicationStatus.CUSTOMER_REVIEW)}>→ dispatcher approved</button>
        <button onClick={() => setStatus(ApplicationStatus.CONFIRMED)}>→ customer confirmed</button>
        <button onClick={() => setStatus(null)}>⟲ reset</button>
        <button onClick={reset}>clear storage</button>
      </div>
    </div>
  );
}
