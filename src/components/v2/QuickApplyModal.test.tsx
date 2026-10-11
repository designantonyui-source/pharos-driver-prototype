import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitApplication } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { QuickApplyModal } from './QuickApplyModal';

vi.mock('../../lib/api', () => ({
  submitApplication: vi.fn(),
}));

describe('QuickApplyModal', () => {
  beforeEach(() => {
    vi.mocked(submitApplication).mockReset();
  });

  it('renders load details and submits the application', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    const load = V2_LOADS[0];
    vi.mocked(submitApplication).mockResolvedValue({
      loadId: load.id,
      status: ApplicationStatus.SENT,
    });

    render(
      <QuickApplyModal
        loadId={load.id}
        load={load}
        onCancel={vi.fn()}
        onSubmitted={onSubmitted}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(`${load.from} → ${load.to}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send application' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Send application' }));

    expect(submitApplication).toHaveBeenCalledWith(load.id);
    expect(onSubmitted).toHaveBeenCalledOnce();
  });

  it('disables submission until load data is available', async () => {
    render(
      <QuickApplyModal
        loadId="nordcargo"
        load={null}
        onCancel={vi.fn()}
        onSubmitted={vi.fn()}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Send application' });
    expect(screen.getByRole('status')).toHaveTextContent('Loading load details');
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);
    expect(submitApplication).not.toHaveBeenCalled();
  });

  it('closes when the driver chooses cancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <QuickApplyModal
        loadId={V2_LOADS[0].id}
        load={V2_LOADS[0]}
        onCancel={onCancel}
        onSubmitted={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
