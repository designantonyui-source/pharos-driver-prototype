/**
 * figma: the `Pharos/Input` instances inside the sheet — 2197:8787 (`Your rate`, State=Filled)
 *        and 2197:8796 (`Comment`, State=Filled), both `Size=Mobile, State=Filled` 12:161
 * props: label, value, placeholder, onChange
 * tokens: color-bg-surface, color-border-strong, color-text-primary, color-text-secondary,
 *         radius-sm, text-label-14, text-body-14
 * geometry: 354x76 · VERTICAL gap 8
 *   Label row 354x20 — DM Sans Medium 14/20 #172a35 (Figma style `Label/14`)
 *   Control   354x48 r8 pad 0/12 · fill #ffffff · stroke #8093a0 w1 INSIDE · DM Sans Regular 14/20
 * WHY NOT `Input.tsx`: `Pharos/Input` has three optional layers this sheet never turns on
 *   (the 20x20 MapPin slot, the 16px hint line and the focus ring), and its default icon would
 *   make the control 354 wide but only 328 of text — measured 328 here, no icon. Reusing it
 *   would silently add 20 + 8 px. The two components are genuine siblings, not duplicates.
 * TODO(token): there is no token for the sheet's field/gap rhythm; pad 0/12 and gap 8 are
 *   inlined as the Figma numbers (same approach as the other control components).
 */
export function SheetField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="flex w-full shrink-0 flex-col gap-[8px]">
      <span className="flex h-[20px] w-full items-center text-label-14 text-[var(--color-text-primary)]">
        {label}
      </span>
      <span className="flex h-[48px] w-full shrink-0 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-[12px]">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-full w-full bg-transparent text-body-14 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
        />
      </span>
    </label>
  );
}
