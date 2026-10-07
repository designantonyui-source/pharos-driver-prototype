import { useState } from 'react';
import { DemoPanel } from '../DemoPanel';

/**
 * v2 · DemoToggle — the dev Demo panel collapsed into a small pill so it never covers a CTA on a phone-width view.
 * The existing `DemoPanel` is reused untouched.
 */
export function DemoToggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <DemoPanel />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`fixed right-4 z-50 rounded-full border border-[var(--color-border-default)] bg-white px-3 py-1 text-[12px] shadow-lg ${
          open ? 'bottom-[7.5rem]' : 'bottom-4'
        }`}
      >
        {open ? 'Hide demo' : 'Demo'}
      </button>
    </>
  );
}
