import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { advanceStatus, cancelApplication, cancelTrip, dismissLoad, restoreLoad, submitApplication } from './api';
import { ApplicationStatus } from './models';
import { store } from './store';

describe('application lifecycle', () => {
  it('preserves cancellation metadata through updates and persistence', async () => {
    store.reset();
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const cancellation = cancelTrip('nordcargo', 'breakdown');
    await vi.advanceTimersByTimeAsync(300);
    await cancellation;
    store.set({ route: { from: 'A', to: 'B' } });
    const expected = { cancelReason: 'breakdown', cancelledAfterConfirm: true, tripId: 'TR-nordcargo' };
    expect(store.getApplicationForLoad('nordcargo')).toMatchObject(expected);
    expect(JSON.parse(localStorage.getItem('pharos-driver-prototype')!).applications.nordcargo).toMatchObject(expected);
  });

  it('restores a dismissed load without removing another application', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    await dismissLoad('belroute');
    await restoreLoad('belroute');
    expect(store.getApplicationForLoad('belroute')).toBeNull();
    expect(store.getApplicationForLoad('nordcargo')?.status).toBe(ApplicationStatus.SENT);
  });

  it('allows re-applying after a cancelled confirmed trip starts fresh', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const cancellation = cancelTrip('nordcargo', 'delay');
    await vi.advanceTimersByTimeAsync(300);
    await cancellation;
    const reapply = submitApplication('nordcargo');
    await vi.advanceTimersByTimeAsync(600);
    await reapply;
    expect(store.getApplicationForLoad('nordcargo')?.status).toBe(ApplicationStatus.SENT);
    expect(store.getApplicationForLoad('nordcargo')?.cancelledAfterConfirm).toBeUndefined();
  });

  it('dismisses a cancelled trip from the feed', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const cancellation = cancelTrip('nordcargo', 'delay');
    await vi.advanceTimersByTimeAsync(300);
    await cancellation;
    await dismissLoad('nordcargo');
    expect(store.getApplicationForLoad('nordcargo')?.dismissed).toBe(true);
  });

  it('preserves a cancelled trip through dismiss and restore', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const cancelling = cancelTrip('nordcargo', 'breakdown');
    await vi.advanceTimersByTimeAsync(300);
    await cancelling;
    const before = store.getApplicationForLoad('nordcargo');
    expect(before).toMatchObject({ cancelledAfterConfirm: true, cancelReason: 'breakdown' });

    await dismissLoad('nordcargo');
    expect(store.getApplicationForLoad('nordcargo')).toMatchObject({
      cancelledAfterConfirm: true, cancelReason: 'breakdown', dismissed: true,
    });

    await restoreLoad('nordcargo');
    expect(store.getApplicationForLoad('nordcargo')).toMatchObject({
      cancelledAfterConfirm: true, cancelReason: 'breakdown', dismissed: false,
      tripId: before?.tripId,
    });
  });

  it('preserves a rejected application after hide and restore', async () => {
    const submittedAt = '2026-10-14T10:00:00.000Z';
    store.set({ loadId: 'belroute', status: ApplicationStatus.REJECTED, submittedAt });
    await dismissLoad('belroute');
    await restoreLoad('belroute');
    expect(store.getApplicationForLoad('belroute')).toMatchObject({
      status: ApplicationStatus.REJECTED, submittedAt, dismissed: false,
    });
  });

  it('does not erase a confirmed trip when restoring or dismissing it', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    await expect(dismissLoad('nordcargo')).rejects.toThrow('cannot be dismissed');
    await restoreLoad('nordcargo');
    expect(store.getApplicationForLoad('nordcargo')?.status).toBe(ApplicationStatus.CONFIRMED);
  });

  beforeEach(() => {
    store.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    store.reset();
    vi.useRealTimers();
  });

  it.each([ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW])('cancels a matching application in %s', async (status) => {
    store.set({ loadId: 'nordcargo', status });

    const result = cancelApplication('nordcargo');
    await vi.advanceTimersByTimeAsync(300);

    await expect(result).resolves.toEqual({
      loadId: 'nordcargo',
      status: ApplicationStatus.CANCELLED,
    });
    expect(store.get().status).toBe(ApplicationStatus.CANCELLED);
  });

  it('rejects when the load does not match the active application', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });

    const assertion = expect(cancelApplication('belroute')).rejects.toThrow('Application not found');
    await vi.advanceTimersByTimeAsync(300);

    await assertion;
    expect(store.get().status).toBe(ApplicationStatus.SENT);
  });

  it('rejects cancellation after the application is confirmed', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });

    const assertion = expect(cancelApplication('nordcargo')).rejects.toThrow('This application can no longer be cancelled');
    await vi.advanceTimersByTimeAsync(300);

    await assertion;
    expect(store.get().status).toBe(ApplicationStatus.CONFIRMED);
  });

  it('submission stores the load, SENT status and timestamp', async () => {
    const result = submitApplication('nordcargo');
    await vi.advanceTimersByTimeAsync(600);
    await expect(result).resolves.toEqual({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    expect(store.get()).toMatchObject({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    expect(store.get().submittedAt).toBe(new Date().toISOString());
  });

  it.each([
    [ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW],
    [ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CONFIRMED],
  ])('updates a matching application from %s to %s', async (before, after) => {
    store.set({ loadId: 'nordcargo', status: before });
    const result = advanceStatus(after, 'nordcargo', before);
    await vi.advanceTimersByTimeAsync(300);
    await expect(result).resolves.toEqual({ status: after, updated: true });
    expect(store.get().status).toBe(after);
  });

  it('does not overwrite cancellation with a delayed status event', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    const result = advanceStatus(ApplicationStatus.DISPATCHER_REVIEW, 'nordcargo', ApplicationStatus.SENT);
    store.set({ status: ApplicationStatus.CANCELLED });
    await vi.advanceTimersByTimeAsync(300);
    await expect(result).resolves.toEqual({ status: ApplicationStatus.CANCELLED, updated: false });
    expect(store.get().status).toBe(ApplicationStatus.CANCELLED);
  });

  it('rejects a delayed event for a different application', async () => {
    store.set({ loadId: 'belroute', status: ApplicationStatus.SENT });
    const assertion = expect(advanceStatus(ApplicationStatus.CONFIRMED, 'nordcargo', ApplicationStatus.SENT)).rejects.toThrow('No active application');
    await vi.advanceTimersByTimeAsync(300);
    await assertion;
    expect(store.get()).toMatchObject({ loadId: 'belroute', status: ApplicationStatus.SENT });
  });
  it.each([ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW, ApplicationStatus.CONFIRMED])('rejects a duplicate in %s without changing the application', async (status) => {
    store.set({ loadId: 'nordcargo', status, submittedAt: 'original' });
    const assertion = expect(submitApplication('nordcargo')).rejects.toMatchObject({ code: 'ALREADY_APPLIED' });
    await vi.advanceTimersByTimeAsync(600);
    await assertion;
    expect(store.getApplicationForLoad('nordcargo')).toMatchObject({ status, submittedAt: 'original' });
  });

  it('allows only one of two concurrent submissions', async () => {
    const result = Promise.allSettled([submitApplication('nordcargo'), submitApplication('nordcargo')]);
    await vi.advanceTimersByTimeAsync(600);
    const outcomes = await result;
    expect(outcomes[0].status).toBe('fulfilled');
    expect(outcomes[1]).toMatchObject({ status: 'rejected', reason: { code: 'ALREADY_APPLIED' } });
    expect(Object.keys(store.get().applications)).toEqual(['nordcargo']);
  });

  it('blocks a repeat submission even after applying for another load', async () => {
    await Promise.all([submitApplication('nordcargo'), vi.advanceTimersByTimeAsync(600)]);
    await Promise.all([submitApplication('belroute'), vi.advanceTimersByTimeAsync(600)]);
    const assertion = expect(submitApplication('nordcargo')).rejects.toMatchObject({ code: 'ALREADY_APPLIED' });
    await vi.advanceTimersByTimeAsync(600);
    await assertion;
  });

  it.each([ApplicationStatus.CANCELLED, ApplicationStatus.REJECTED])('allows a new application after %s', async (status) => {
    store.set({ loadId: 'nordcargo', status });
    const result = submitApplication('nordcargo');
    await vi.advanceTimersByTimeAsync(600);
    await expect(result).resolves.toMatchObject({ status: ApplicationStatus.SENT });
  });

});
