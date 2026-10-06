import { MapPin } from 'lucide-react';

/**
 * figma: Pharos/Input — Size Mobile 370x76 (label 20 + gap 8 + control 48)
 *   VERTICAL gap8 · label row Label/14 · control HORIZONTAL gap8 pad(0/12/0/12) · Icon 20x20 · value Body/14
 *   hint Caption/12 (error colour in the Error state) · focus ring 4px outside
 * tokens: input-*, color-text-primary, text-label-14, text-body-14, text-caption-12, radius-sm
 */
export type InputState = 'empty' | 'filled' | 'focus' | 'error' | 'disabled';

export function Input({ label, value = '', placeholder = 'Enter a city', state = 'empty', hint, icon = true }: { label: string; value?: string; placeholder?: string; state?: InputState; hint?: string; icon?: boolean }) {
  const border = state === 'focus' ? 'var(--color-input-border-focus)' : state === 'error' ? 'var(--color-input-border-error)' : 'var(--color-input-border-default)';
  const bg = state === 'disabled' ? 'var(--color-bg-disabled)' : 'var(--color-input-bg-default)';
  const showHint = Boolean(hint) || state === 'error';
  return (
    <div className="flex w-full flex-col gap-[8px]">
      <span className="flex h-[20px] items-center gap-[4px] text-label-14 text-[var(--color-text-primary)]">{label}</span>
      <div
        className="flex h-[var(--control-h)] items-center gap-[8px] rounded-[var(--radius-sm)] px-[12px]"
        style={{ background: bg, border: `1px solid ${border}`, boxShadow: state === 'focus' ? '0 0 0 4px var(--color-focus-ring)' : undefined }}
      >
        {icon && <MapPin size={20} className="shrink-0 text-[var(--color-text-secondary)]" />}
        <span className={value ? 'text-body-14 text-[var(--color-input-text-value)]' : 'text-body-14 text-[var(--color-input-text-placeholder)]'}>
          {value || placeholder}
        </span>
      </div>
      {showHint && <span className="text-caption-12" style={{ color: state === 'error' ? 'var(--color-input-text-error)' : 'var(--color-text-secondary)' }}>{hint ?? 'Choose a city from the list'}</span>}
    </div>
  );
}
