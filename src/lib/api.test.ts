import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { advanceStatus, advanceTripStage, cancelApplication, cancelTrip, cancellationPenalty, dismissLoad, getTripDetails, restoreLoad, setEnRoute, submitApplication, submitProofOfDelivery } from './api';
import { ApplicationStatus } from './models';
import { store } from './store';

describe('cancel trip preview consequences', () => {
  const now = Date.parse('2026-10-15T12:00:00Z');

  it('has no expected impact within 15 minutes of confirmation', () => {
    expect(cancellationPenalty({
      loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED,
      submittedAt: new Date(now - 10 * 60_000).toISOString(),
    }, new Date(now + 60 * 60_000).toISOString(), now)).toBe('none');
  });

  it('warns close to pickup when confirmed more than 15 minutes ago', () => {
    expect(cancellationPenalty({
      loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED,
      submittedAt: new Date(now - 20 * 60_000).toISOString(),
    }, new Date(now + 2 * 3_600_000).toISOString(), now)).toBe('warning');
  });

  it('has no expected impact at least 24 hours before pickup', () => {
    expect(cancellationPenalty({
      loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED,
      submittedAt: new Date(now - 20 * 60_000).toISOString(),
    }, new Date(now + 24 * 3_600_000).toISOString(), now)).toBe('none');
  });

  it('does not assume free cancellation when timestamps are missing', () => {
    expect(cancellationPenalty({
      loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED, submittedAt: null,
    }, undefined, now)).toBe('warning');
  });
});

describe('proof of delivery', () => {
  beforeEach(() => store.reset());
  it('requires a delivered trip and keeps review separate', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const file = { filename: 'signed.pdf', mimeType: 'application/pdf', dataUrl: 'data:application/pdf;base64,AAAA' };
    await expect(submitProofOfDelivery('nordcargo', file)).rejects.toThrow();
    store.set({ applications: { nordcargo: { ...store.get().applications.nordcargo, tripStage: 'delivered' } } });
    await submitProofOfDelivery('nordcargo', file);
    expect(store.getApplicationForLoad('nordcargo')?.pod?.status).toBe('submitted');
    expect(store.getApplicationForLoad('nordcargo')?.status).toBe(ApplicationStatus.CONFIRMED);
  });
  it('rejects unsupported files', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    store.set({ applications: { nordcargo: { ...store.get().applications.nordcargo, tripStage: 'delivered' } } });
    await expect(submitProofOfDelivery('nordcargo', { filename: 'bad.svg', mimeType: 'image/svg+xml', dataUrl: 'data:image/svg+xml;base64,AAAA' })).rejects.toThrow();
  });
});

describe('driver trip execution', () => {
  beforeEach(() => {
    store.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    store.reset();
    vi.useRealTimers();
  });

  it('requires sequential driver confirmation', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    await expect(advanceTripStage('nordcargo', 'confirmed', 'loaded')).rejects.toThrow();
    await advanceTripStage('nordcargo', 'confirmed', 'at-pickup');
    expect(store.getApplicationForLoad('nordcargo')?.tripStage).toBe('at-pickup');
    await advanceTripStage('nordcargo', 'at-pickup', 'loaded');
    await advanceTripStage('nordcargo', 'loaded', 'at-delivery');
    await expect(advanceTripStage('nordcargo', 'at-delivery', 'delivered')).rejects.toThrow('Confirm cargo handover');
    await advanceTripStage('nordcargo', 'at-delivery', 'delivered', true);
    expect(store.getApplicationForLoad('nordcargo')?.tripStage).toBe('delivered');
  });

  it('blocks milestones after cancellation', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const cancelling = cancelTrip('nordcargo', 'delay');
    await vi.advanceTimersByTimeAsync(300);
    await cancelling;
    await expect(advanceTripStage('nordcargo', 'confirmed', 'at-pickup')).rejects.toThrow();
  });

  it('returns one trip view model with trip id, stage and site details', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const pending = getTripDetails('nordcargo');
    await vi.advanceTimersByTimeAsync(300);
    const details = await pending;
    expect(details?.tripId).toBe('TR-nordcargo');
    expect(details?.tripStage).toBe('confirmed');
    expect(details?.load.pickupSite.address).toContain('Lille');
    expect(details?.load.documents.length).toBeGreaterThan(0);
  });

  it('returns null when the trip is not confirmed', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    const pending = getTripDetails('nordcargo');
    await vi.advanceTimersByTimeAsync(300);
    await expect(pending).resolves.toBeNull();
  });

  it('marks the trip en route and clears the flag on arrival', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    const marking = setEnRoute('nordcargo', 'pickup');
    await vi.advanceTimersByTimeAsync(150);
    await expect(marking).resolves.toMatchObject({ loadId: 'nordcargo', enRouteTo: 'pickup' });
    const pending = getTripDetails('nordcargo');
    await vi.advanceTimersByTimeAsync(300);
    await expect(pending).resolves.toMatchObject({ enRouteTo: 'pickup' });
    await advanceTripStage('nordcargo', 'confirmed', 'at-pickup');
    const after = getTripDetails('nordcargo');
    await vi.advanceTimersByTimeAsync(300);
    await expect(after).resolves.toMatchObject({ enRouteTo: null, tripStage: 'at-pickup' });
  });

  it('rejects en route for a non-confirmed trip', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.SENT });
    const marking = setEnRoute('nordcargo', 'pickup');
    const assertion = expect(marking).rejects.toThrow('This trip is not active');
    await vi.advanceTimersByTimeAsync(150);
    await assertion;
  });

  it('posts a pending ledger entry on delivery without duplicates', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    await advanceTripStage('nordcargo', 'confirmed', 'at-pickup');
    await advanceTripStage('nordcargo', 'at-pickup', 'loaded');
    await advanceTripStage('nordcargo', 'loaded', 'at-delivery');
    await advanceTripStage('nordcargo', 'at-delivery', 'delivered', true);
    const trips = store.get().ledger.filter((entry) => entry.kind === 'trip' && entry.loadId === 'nordcargo');
    expect(trips).toHaveLength(1);
    expect(trips[0]).toMatchObject({ amount: 360, status: 'pending', company: 'NordCargo' });
  });
});

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

  it('does not replace a newer application when cancelling an older confirmed trip', async () => {
    store.set({ loadId: 'nordcargo', status: ApplicationStatus.CONFIRMED });
    store.set({ loadId: 'belroute', status: ApplicationStatus.SENT });
    const cancelling = cancelTrip('nordcargo', 'delay');
    await vi.advanceTimersByTimeAsync(300);
    await cancelling;
    expect(store.get()).toMatchObject({ loadId: 'belroute', status: ApplicationStatus.SENT });
    expect(store.getApplicationForLoad('nordcargo')).toMatchObject({
      status: ApplicationStatus.CANCELLED, cancelledAfterConfirm: true, cancelReason: 'delay',
    });
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
