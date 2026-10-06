import { MapPinIcon } from './Icons';

/**
 * figma: Pharos/Input Mobile variants — Empty / Filled / Focus / Error / Disabled (370 x 76)
 * props: label, value, placeholder, state, hint
 * tokens: input-*, radius-sm, text-label-14, text-body-16, text-caption-12
 */
export type InputState = 'empty' | 'filled' | 'focus' | 'error' | 'disabled';

export function Input({ label, value = '', placeholder = 'Start typing a city', state = 'empty', hint, icon = true }: { label: string; value?: string; placeholder?: string; state?: InputState; hint?: string; icon?: boolean }) {
  const border = state === 'focus' ? 'var(--color-input-border-focus)' : state === 'error' ? 'var(--color-input-border-error)' : 'var(--color-input-border-default)';
  const bg = state === 'disabled' ? 'var(--color-bg-disabled)' : 'var(--color-input-bg-default)';
  return (
    <div className="flex w-[370px] flex-col gap-[8px]">
      <span className="text-label-14 text-[var(--color-text-primary)]">{label}</span>
      <div className="flex h-[48px] items-center gap-[8px] rounded-[var(--radius-sm)] px-[12px]" style={{ background: bg, border: `1px solid ${border}`, boxShadow: state === 'focus' ? '0 0 0 2px var(--color-focus-ring)' : undefined }}>
        {icon && <MapPinIcon size={20} className="text-[var(--color-text-secondary)]" />}
        <span className={value ? 'text-body-16 text-[var(--color-input-text-value)]' : 'text-body-16 text-[var(--color-input-text-placeholder)]'}>
          {value || placeholder}
        </span>
      </div>
      {hint && <span className="text-caption-12 text-[var(--color-input-text-error)]">{hint}</span>}
    </div>
  );
}
