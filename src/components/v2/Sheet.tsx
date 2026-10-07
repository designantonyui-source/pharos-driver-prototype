import type { ReactNode } from 'react';

/**
 * v2 · Sheet — modal bottom sheet over the screen frame. NEW (the Figma `BottomSheet` is the in-flow filter sheet).
 * props: open, onClose, children
 * tokens: color-bg-surface, color-border-strong, radius-lg; scrim uses color-system-black at 40 %.
 *
 * Replaces full-screen pushes: details, verification and status all open as a sheet (flow stories S5, S6).
 */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-system-black)_40%,transparent)]"
      />
      <div className="relative rounded-t-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-[16px] pb-[40px] pt-[8px]">
        <span className="mx-auto mb-[12px] block h-[4px] w-[40px] rounded-[var(--radius-pill)] bg-[var(--color-border-strong)]" />
        {children}
      </div>
    </div>
  );
}
