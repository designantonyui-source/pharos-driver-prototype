import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { ApplicationTrackerView } from './ApplicationTracker';

const load = V2_LOADS[0];
const noop = () => undefined;

function renderView(status: ApplicationStatus, onCancel: () => void = noop) {
  return render(
    <MemoryRouter>
      <ApplicationTrackerView
        status={status}
        load={load}
        onCancel={onCancel}
        onViewTrip={noop}
        onSimilarLoads={noop}
      />
    </MemoryRouter>,
  );
}

describe('ApplicationTrackerView cancel confirmation', () => {
  it('opens a sheet before cancelling', () => {
    const onCancel = vi.fn();
    renderView(ApplicationStatus.SENT, onCancel);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel application' }));
    expect(screen.getByRole('dialog', { name: 'Cancel application Lille to Brussels' })).toBeVisible();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels once confirmed in the sheet', () => {
    const onCancel = vi.fn();
    renderView(ApplicationStatus.SENT, onCancel);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel application' }));
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw application' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps the application when the sheet is dismissed', () => {
    const onCancel = vi.fn();
    renderView(ApplicationStatus.SENT, onCancel);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel application' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep application' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('ApplicationTrackerView demo notices', () => {
  it('shows dispatcher chat as a toast, not an alert', () => {
    renderView(ApplicationStatus.SENT);
    fireEvent.click(screen.getByRole('button', { name: 'Contact dispatcher' }));
    expect(screen.getByRole('status')).toHaveTextContent('Dispatcher chat is not connected in this demo.');
  });

  it('shows dispute as a toast, not an alert', () => {
    renderView(ApplicationStatus.REJECTED);
    fireEvent.click(screen.getByRole('button', { name: 'Dispute decision' }));
    expect(screen.getByRole('status')).toHaveTextContent('Disputing a decision is not connected yet.');
  });
});