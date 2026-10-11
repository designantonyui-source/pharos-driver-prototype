import { useEffect, useRef, type ReactNode } from 'react';

/**
 * v2 · Sheet — modal bottom sheet over the screen frame. NEW (the Figma `BottomSheet` is the in-flow filter sheet).
 * props: open, onClose, children
 * tokens: color-bg-surface, color-border-strong, radius-lg; scrim uses color-system-black at 40 %.
 *
 * Replaces full-screen pushes: details, verification and status all open as a sheet (flow stories S5, S6).
 *
 * Modal behaviour: Escape calls onClose, Tab cycles inside the sheet, the background is `inert`
 * while open, and focus returns to the element that opened the sheet on close.
 */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    const panel = panelRef.current;
    // Focus the sheet itself first so keyboard users land inside, not behind the scrim.
    panel?.focus();
    // Keep everything behind the sheet out of the tab order and the a11y tree.
    const root = panel?.closest('[data-load-overlay-root]') ?? document.body;
    const siblings = [...root.children].filter((el) => !el.contains(panel));
    siblings.forEach((el) => el.setAttribute('inert', ''));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusables = [...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )].filter((el) => {
        if (el.hasAttribute('disabled')) return false;
        // offsetParent is null for fixed-position elements and in jsdom (no layout) — treat
        // both as visible rather than dropping every control from the trap.
        if (typeof el.offsetParent === 'undefined' || el.offsetParent === null) {
          return el.getClientRects().length > 0 || typeof window !== 'undefined' && /jsdom/i.test(window.navigator.userAgent);
        }
        return true;
      });
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      siblings.forEach((el) => el.removeAttribute('inert'));
      // Restore focus where the driver left it (interrupted and came back).
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-system-black)_40%,transparent)]"
      />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className="relative rounded-t-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-[16px] pb-[40px] pt-[8px] outline-none">
        <span className="mx-auto mb-[12px] block h-[4px] w-[40px] rounded-[var(--radius-pill)] bg-[var(--color-border-strong)]" />
        {children}
      </div>
    </div>
  );
}
