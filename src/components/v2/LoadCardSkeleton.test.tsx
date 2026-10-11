import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SmartLoadList } from './SmartLoadList';

describe('feed skeleton', () => {
  it('renders measured skeleton cards while loading, announced once', () => {
    render(
      <SmartLoadList loads={[]} loading currentRoute={{ from: '', to: '' }} onOpen={() => undefined} />,
    );
    const status = screen.getByRole('status', { name: 'Searching for loads' });
    expect(status).toBeVisible();
    // Three skeleton cards, same 8px rhythm as the content rows; the text lives
    // in one sr-only node so SR announces it exactly once.
    expect(status.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
    expect(status.textContent).toContain('Searching for loads…');
  });
});