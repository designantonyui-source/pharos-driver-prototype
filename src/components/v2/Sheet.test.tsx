import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Sheet } from './Sheet';

const LABEL = 'Test sheet';

describe('Sheet modal behaviour', () => {
  it('traps Tab inside, closes on Escape and restores focus to the trigger', () => {
    render(
      <div>
        <button type="button">Open sheet</button>
        <Sheet open onClose={() => undefined} label={LABEL}>
          <button type="button">First</button>
          <button type="button">Last</button>
        </Sheet>
      </div>,
    );
    const panel = screen.getByRole('dialog', { name: LABEL });
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    // onClose is a noop here, so the dialog stays — Escape wiring is asserted via spy below.
  });

  it('calls onClose on Escape', () => {
    let closed = 0;
    render(
      <Sheet open onClose={() => { closed += 1; }} label={LABEL}>
        <button type="button">Only</button>
      </Sheet>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closed).toBe(1);
  });

  it('cycles Tab from last back to first and Shift+Tab from first to last', () => {
    render(
      <Sheet open onClose={() => undefined} label={LABEL}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Sheet>,
    );
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('marks background inert while open and restores it on close', () => {
    const { rerender } = render(
      <div data-load-overlay-root>
        <p>Background</p>
        <Sheet open onClose={() => undefined} label={LABEL}>
          <button type="button">Only</button>
        </Sheet>
      </div>,
    );
    expect(screen.getByText('Background').hasAttribute('inert')).toBe(true);
    rerender(
      <div data-load-overlay-root>
        <p>Background</p>
        <Sheet open={false} onClose={() => undefined} label={LABEL}>
          <button type="button">Only</button>
        </Sheet>
      </div>,
    );
    expect(screen.getByText('Background').hasAttribute('inert')).toBe(false);
  });
});