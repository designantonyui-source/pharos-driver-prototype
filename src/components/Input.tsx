import { Icon } from './Icon';

/**
 * figma: 12:166 · Pharos/Input — Mobile variants 12:160..12:165
 *        (Web 12:154..12:159 differ only by the 40px control and the 368x48 ring)
 * props: label, value, placeholder, state, hint, icon, required, onChange
 *
 *   root VERTICAL gap8, no padding · label row h20 gap4 (Label/14 Medium + optional '*' danger)
 *   control h48 r8 pad(0/12/0/12) gap8 · borders: default/error 1px, focus 2px
 *   Focus ring is a separate layer: control + 4px on each side, r12, 2px
 *     (Mobile 368x56, Web 368x48) — present in BOTH sizes, not only Web
 *   fills: white; disabled & readonly = color/bg/subtle #eff2f5, border stays color/border/strong
 *   icon 20x20 — neutral on default/disabled/readonly, primary on focus/error
 *   value + label Label/14 #172a35 · placeholder #586d79 · hint Caption/12 lh16, always visible
 *   hint copy: default "Start typing a city name", error "Choose a city from the list"
 *
 * tokens: color-bg-surface, color-bg-subtle, color-border-strong, color-border-brand,
 *         color-border-danger, color-focus-ring, color-text-primary, color-text-secondary,
 *         color-text-danger, radius-sm, radius-md
 */
export type InputState = 'empty' | 'filled' | 'focus' | 'error' | 'disabled' | 'readonly';

const DEFAULT_HINT = 'Start typing a city name';
const ERROR_HINT = 'Choose a city from the list';

export function Input({
  label,
  value,
  placeholder = 'Enter a city',
  state = 'empty',
  hint,
  icon = true,
  required = false,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  state?: InputState;
  /** omit for the Figma copy, pass a string to override it, pass null to hide the line (the screens do: 76 tall) */
  hint?: string | null;
  icon?: boolean;
  required?: boolean;
  onChange?: (v: string) => void;
}) {
  const inactive = state === 'disabled' || state === 'readonly';
  const isError = state === 'error';
  const isFocus = state === 'focus';
  const active = isFocus || isError;

  const borderColor =
    isFocus ? 'var(--color-border-brand)' :
    isError ? 'var(--color-border-danger)' :
    'var(--color-border-strong)';
  const borderWidth = isFocus ? 2 : 1;
  const background = inactive ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)';
  const hintColor = isError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)';

  return (
    <label className="flex w-full flex-col gap-[8px]">
      <span className="flex h-[20px] items-center gap-[4px]">
        <span className="text-label-14 text-[var(--color-text-primary)]">{label}</span>
        {required && (
          <span aria-hidden className="text-label-14 text-[var(--color-text-danger)]">
            *
          </span>
        )}
      </span>

      <span className="relative block">
        <span
          className="flex h-[var(--control-h)] items-center gap-[8px] rounded-[var(--radius-sm)] px-[12px]"
          style={{ background, border: `${borderWidth}px solid ${borderColor}` }}
        >
          {icon && (
            <Icon
              name="map-pin"
              className={
                active
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }
            />
          )}
          <input
            value={value}
            placeholder={placeholder}
            disabled={state === 'disabled'}
            readOnly={state === 'readonly'}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-full w-full bg-transparent text-body-14 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </span>
        {isFocus && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-[4px] rounded-[var(--radius-md)] border-2 border-[var(--color-focus-ring)]"
          />
        )}
      </span>

      {hint !== null && (
        <span className="h-[16px] text-caption-12" style={{ color: hintColor }}>
          {hint ?? (isError ? ERROR_HINT : DEFAULT_HINT)}
        </span>
      )}
    </label>
  );
}
