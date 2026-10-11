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
  it('asks for confirmation before cancelling', () => {
    const onCancel = vi.fn();
    renderView(ApplicationStatus.SENT, onCancel);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel application' }));
      expect(confirm).toHaveBeenCalledWith(
        'Cancel this application? The load will be open for other drivers.',
      );
      expect(onCancel).not.toHaveBeenCalled();
    } finally {
      confirm.mockRestore();
    }
  });

  it('cancels once confirmed', () => {
    const onCancel = vi.fn();
    renderView(ApplicationStatus.SENT, onCancel);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel application' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    } finally {
      confirm.mockRestore();
    }
  });
});