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
        onContactDispatcher={noop}
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

describe('ApplicationTrackerView notices', () => {
  it('routes contact dispatcher to the trip thread', () => {
    const onContact = vi.fn();
    render(
      <MemoryRouter>
        <ApplicationTrackerView
          status={ApplicationStatus.SENT}
          load={load}
          onCancel={noop}
          onViewTrip={noop}
          onSimilarLoads={noop}
          onContactDispatcher={onContact}
        />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Message dispatcher' }));
    expect(onContact).toHaveBeenCalledTimes(1);
  });

  it('shows the approvals deadline while waiting', () => {
    renderView(ApplicationStatus.SENT);
    expect(screen.getByText(/Application closes unless both approve by/)).toHaveTextContent(load.approvalsBy);
  });

  it('sends a dispute through the sheet', async () => {
    const onDispute = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <ApplicationTrackerView
          status={ApplicationStatus.REJECTED}
          load={load}
          onCancel={noop}
          onViewTrip={noop}
          onSimilarLoads={noop}
          onContactDispatcher={noop}
          onDispute={onDispute}
        />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dispute decision' }));
    expect(screen.getByRole('dialog', { name: 'Dispute decision' })).toBeVisible();
    fireEvent.change(screen.getByLabelText('What should the dispatcher review?'), { target: { value: 'The customer approved late.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send dispute' }));
    await screen.findByText('Dispute sent');
    expect(onDispute).toHaveBeenCalledWith('The customer approved late.');
  });

  it('shows the expired outcome with a recovery path', () => {
    const onSimilar = vi.fn();
    render(
      <MemoryRouter>
        <ApplicationTrackerView
          status={ApplicationStatus.EXPIRED}
          load={load}
          onCancel={noop}
          onViewTrip={noop}
          onSimilarLoads={onSimilar}
          onContactDispatcher={noop}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Application expired' })).toBeVisible();
    expect(screen.getByText(/Needed both approvals by/)).toHaveTextContent(load.approvalsBy);
    expect(screen.queryByRole('button', { name: 'Cancel application' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Find similar loads' }));
    expect(onSimilar).toHaveBeenCalledTimes(1);
  });
});