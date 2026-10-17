import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { ApplicationBanner } from './ApplicationBanner';

const load = V2_LOADS[0];

function renderBanner(status: ApplicationStatus) {
  const onOpen = vi.fn();
  const { container } = render(<ApplicationBanner load={load} status={status} onOpen={onOpen} />);
  return { container, onOpen };
}

describe('ApplicationBanner — live states only', () => {
  it.each([ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW])('shows a status banner while %s', (status) => {
    const { onOpen } = renderBanner(status);
    expect(screen.getByText(/Lille → Brussels · €360 · by/)).toBeVisible();
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('shows the confirmed mini-player, not a status banner', () => {
    renderBanner(ApplicationStatus.CONFIRMED);
    expect(screen.getByText(/km to go/)).toBeVisible();
    expect(screen.queryByText(/Step .* of 4/)).toBeNull();
  });

  it.each([ApplicationStatus.REJECTED, ApplicationStatus.EXPIRED, ApplicationStatus.CANCELLED])('renders nothing for ended state %s — card pill owns it', (status) => {
    const { container } = renderBanner(status);
    expect(container.firstChild).toBeNull();
  });
});
