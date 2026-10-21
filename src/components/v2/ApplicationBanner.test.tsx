import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../../lib/models';
import { V2_LOADS } from '../../lib/v2/loads';
import { ApplicationBanner } from './ApplicationBanner';

const load = V2_LOADS[0];

describe('ApplicationBanner — active-trip mini-player only', () => {
  it('shows the confirmed trip with the stage and opens it', () => {
    const onOpen = vi.fn();
    render(
      <ApplicationBanner
        load={load}
        application={{ loadId: load.id, status: ApplicationStatus.CONFIRMED, submittedAt: null, tripStage: 'at-pickup' }}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText(/km to go/)).toBeVisible();
    expect(screen.getByText('At pickup · Step 2 of 5')).toBeVisible();
    expect(screen.getByText('Open')).toBeVisible();
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('mirrors the active leg while en route', () => {
    render(
      <ApplicationBanner
        load={load}
        application={{ loadId: load.id, status: ApplicationStatus.CONFIRMED, submittedAt: null, tripStage: 'at-pickup', enRouteTo: 'delivery' }}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('En route to delivery · Step 2 of 5')).toBeVisible();
  });
});
