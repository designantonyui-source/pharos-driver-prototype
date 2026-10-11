/**
 * figma: n/a · Toast (Wave 3 polish) — one notification pattern for the whole v2 journey.
 * props: toast (message or null), onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-border-default,
 *   color-status-success-text, color-status-danger-text, color-alert-*, radius-md,
 *   shadow-card, spacing-8/12/16
 *
 * Convention (replaces inline success/error Alerts in content flow):
 * - success/info confirmations appear as an auto-dismissing toast pinned under
 *   the navigation bar (top-[calc(var(--nav-bar-h)+8px)]), iOS-style — it never
 *   covers the tab bar or the primary action at the bottom of the screen.
 * - destructive/loading states keep inline placement: error Alerts stay in flow
 *   (they need Retry/actions), Sheet confirmations stay modal.
 * - auto-dismiss 4s, manual close button, role=status, slide-in from top.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';

export type ToastTone = 'success' | 'info';

export type ToastData = { tone: ToastTone; title: string; detail?: ReactNode } | null;

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);
  if (!toast) return null;
  const tone = toast.tone === 'success' ? 'text-[var(--color-status-success-text)]' : 'text-[var(--color-action-text)]';
  return (
    <div className="pointer-events-none absolute inset-x-[16px] top-[calc(var(--nav-bar-h)+8px)] z-50 flex justify-center" role="presentation">
      <div
        role="status"
        className="toast-slide-in pointer-events-auto flex w-full items-center gap-[12px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[12px] shadow-[var(--shadow-card)]"
      >
        <span className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center ${tone}`} aria-hidden>
          <Icon name={toast.tone === 'success' ? 'circle-check' : 'info'} size="md" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-14 text-[var(--color-text-primary)]">{toast.title}</span>
          {toast.detail && <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{toast.detail}</span>}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <Icon name="x" size="sm" />
        </button>
      </div>
    </div>
  );
}

/** Auto-dismissing toast state: `show()` replaces, timer handled by <Toast/>. */
export function useToast() {
  const [toast, setToast] = useState<ToastData>(null);
  return {
    toast,
    show: (next: Exclude<ToastData, null>) => setToast({ ...next }),
    dismiss: () => setToast(null),
  };
}
