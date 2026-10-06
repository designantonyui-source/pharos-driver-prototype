/**
 * figma: Pharos/Button (12:38) · Pharos/Button link (168:118)
 * tokens: color-action-*, radius-sm, size-control-mobile (48), text-label-14
 */
type Appearance = 'primary' | 'secondary';

export function Button({ label, appearance = 'primary', disabled = false, loading = false, icon, full = true, onClick }: { label: string; appearance?: Appearance; disabled?: boolean; loading?: boolean; icon?: React.ReactNode; full?: boolean; onClick?: () => void }) {
  const off = disabled || loading;
  const styles = appearance === 'primary'
    ? { background: off ? 'var(--color-action-disabled)' : 'var(--color-action-primary)', color: off ? 'var(--color-action-text-disabled)' : 'var(--color-action-text-inverse)', border: '1px solid transparent' }
    : { background: 'var(--color-action-secondary)', color: 'var(--color-action-text)', border: `1px solid ${off ? 'var(--color-border-default)' : 'var(--color-action-border)'}` };
  return (
    <button type="button" disabled={off} onClick={onClick} style={styles} className={`flex h-[var(--size-control-mobile)] items-center justify-center gap-[8px] rounded-[var(--radius-sm)] px-[16px] text-label-14 ${full ? 'w-[370px]' : ''}`}>
      {loading ? <span className="h-[16px] w-[16px] animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      {label}
    </button>
  );
}

export function ButtonLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-[44px] w-[370px] text-label-14 text-[var(--color-action-text)]">
      {label}
    </button>
  );
}
