/**
 * figma: Pharos/Button (12:38) — Appearance Primary/Secondary, Size Mobile (48), States Default/Disabled/Loading/Focus
 *   HORIZONTAL gap8 pad(0/16/0/16) · Label/14 · focus ring 4px outside · loading indicator 20x20
 * figma: Pharos/Button link (168:118) — same box, text only
 * tokens: color-action-*, radius-sm, size-control-mobile, text-label-14
 */
type Appearance = 'primary' | 'secondary';

export function Button({ label, appearance = 'primary', disabled = false, loading = false, icon, full = true, focus = false, onClick }: { label: string; appearance?: Appearance; disabled?: boolean; loading?: boolean; icon?: React.ReactNode; full?: boolean; focus?: boolean; onClick?: () => void }) {
  const off = disabled || loading;
  const styles = appearance === 'primary'
    ? { background: off ? 'var(--color-action-disabled)' : 'var(--color-action-primary)', color: off ? 'var(--color-action-text-disabled)' : 'var(--color-action-text-inverse)', border: '1px solid transparent' }
    : { background: 'var(--color-action-secondary)', color: off ? 'var(--color-action-text-disabled)' : 'var(--color-action-text)', border: `1px solid ${off ? 'var(--color-border-default)' : 'var(--color-action-border)'}` };
  return (
    <button
      type="button"
      disabled={off}
      onClick={onClick}
      style={{ ...styles, boxShadow: focus ? '0 0 0 4px var(--color-focus-ring)' : undefined }}
      className={`flex h-[var(--control-h)] items-center justify-center gap-[8px] rounded-[var(--radius-sm)] px-[16px] text-label-14 ${full ? 'w-full' : ''}`}
    >
      {loading && <span className="h-[20px] w-[20px] shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {!loading && icon}
      {label}
    </button>
  );
}

export function ButtonLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-[var(--control-h)] w-full text-label-14 text-[var(--color-action-text)]">
      {label}
    </button>
  );
}
