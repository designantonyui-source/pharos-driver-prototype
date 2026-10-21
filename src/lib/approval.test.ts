import { describe, expect, it } from 'vitest';
import { APPROVAL_WINDOW_MS, withApprovalWindow } from './approval';
import { ApplicationStatus } from './models';

const submittedAt = '2026-10-21T08:00:00.000Z';

describe('withApprovalWindow', () => {
  it('caps a legacy tomorrow deadline at the submit-time approval window', () => {
    const application = withApprovalWindow({
      status: ApplicationStatus.SENT,
      submittedAt,
      approvalsDeadline: '2026-10-22T08:00:00.000Z',
    });
    expect(Date.parse(application.approvalsDeadline!)).toBe(Date.parse(submittedAt) + APPROVAL_WINDOW_MS);
  });

  it('keeps a deadline that is already inside the window', () => {
    const deadline = new Date(Date.parse(submittedAt) + 10 * 60_000).toISOString();
    const application = withApprovalWindow({ status: ApplicationStatus.CUSTOMER_REVIEW, submittedAt, approvalsDeadline: deadline });
    expect(application.approvalsDeadline).toBe(deadline);
  });

  it('does not touch ended applications', () => {
    const application = withApprovalWindow({
      status: ApplicationStatus.CONFIRMED,
      submittedAt,
      approvalsDeadline: '2026-10-22T08:00:00.000Z',
    });
    expect(application.approvalsDeadline).toBe('2026-10-22T08:00:00.000Z');
  });

  it('does not invent a deadline without a submit time', () => {
    const application = withApprovalWindow({ status: ApplicationStatus.SENT, submittedAt: null, approvalsDeadline: undefined });
    expect(application.approvalsDeadline).toBeUndefined();
  });
});
