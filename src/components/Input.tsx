import { MapPin } from 'lucide-react';

/**
 * figma: Pharos/Input — Size=Mobile, 360x100 with hint (label 20 + gap 8 + control 48 + gap 8 + hint 16);
 *        screens hide the hint -> 76. In-app instance width is 370.
 *   root VERTICAL gap8 · label row gap4 Label/14 · control HORIZONTAL gap8 pad(0/12/0/12) r8
 *   borders: default/error 1px, focus 2px (Mobile variant has no extra ring)
 *   fills: white; disabled & readonly = color/bg/subtle #eff2f5
 *   icon 20x20 · value/placeholder Body/14 · hint Caption/12 (error colour in Error)
 * tokens: input-*, color-bg-subtle, text-label-14, text-body-14, text-caption-12, radius-sm
 */
export type InputState = 'empty' | 'filled' | 'focus' | 'error' | 'disabled' | 'readonly';

export function Input({
  label,
  value,
  placeholder = 'Enter a city',
  state = 'empty',
  hint,
  icon = true,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  state?: InputState;
  hint?: string;
  icon?: boolean;
  onChange?: (v: string) => void;
}) {
  const inactive = state === 'disabled' || state === 'readonly';
  const borderColor =
    state === 'focus' ? 'var(--color-input-border-focus)' :
    state === 'error' ? 'var(--color-input-border-error)' :
    'var(--color-input-border-default)';
  const background = inactive ? 'var(--color-bg-subtle)' : 'var(--color-input-bg-default)';
  const hintColor = state === 'error' ? 'var(--color-input-text-error)' : 'var(--color-input-text-placeholder)';
  const showHint = Boolean(hint) || state === 'error';
  const borderWidth = state === 'focus' ? 2 : 1;

  return (
    <label className="flex w-full flex-col gap-[8px]">
      <span className="flex h-[20px] items-center gap-[4px] text-label-14 text-[var(--color-text-primary)]">{label}</span>
      <span
        className="flex h-[var(--control-h)] items-center gap-[8px] rounded-[var(--radius-sm)] px-[12px]"
        style={{ background, border: `${borderWidth}px solid ${borderColor}` }}
      >
        {icon && <MapPin size={20} className="shrink-0 text-[var(--color-text-secondary)]" />}
        <input
          value={value}
          placeholder={placeholder}
          disabled={inactive}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-full w-full bg-transparent text-body-14 outline-none placeholder:text-[var(--color-input-text-placeholder)]"
          style={{ color: 'var(--color-input-text-value)' }}
        />
      </span>
      {showHint && (
        <span className="h-[16px] text-caption-12" style={{ color: hintColor }}>
          {hint ?? 'Start typing a city name'}
        </span>
      )}
    </label>
  );
}
