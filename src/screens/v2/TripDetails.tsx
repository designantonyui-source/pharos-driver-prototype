import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { type ProgressState } from '../../components/ProgressStep';
import { V2BackBar, useV2Back } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { CancelTripSheet } from '../../components/v2/CancelTripSheet';
import { RoutePreview } from '../../components/v2/RoutePreview';
import { TripDocumentsSheet } from '../../components/v2/TripDocumentsSheet';
import { Toast, useToast } from '../../components/v2/Toast';
import { TRIP_STAGE_STEPS, advanceTripStage, cancelTrip, cancellationPenalty, getDefaultMethod, getTripDetails, methodLabel, setEnRoute, submitProofOfDelivery, type PayoutMethod, type TripStage } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore, type LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';

/**
 * Payout row: shows the REAL payout method from the store, never the static load mock.
 * No method yet → explicit "Add payout method" CTA instead of a fake IBAN.
 */
function PayoutRow({ load, compact = false }: { load: V2Load; compact?: boolean }) {
  const [method, setMethod] = useState<PayoutMethod | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    getDefaultMethod().then((m) => { if (live) setMethod(m); }).catch(() => { if (live) setMethod(null); });
    return () => { live = false; };
  }, []);
  const body = method === undefined ? 'Checking payout method…'
    : method ? `${load.payoutDate} → ${methodLabel(method)}`
    : 'No payout method yet — add one to receive earnings';
  return (
    <Link
      to={method ? '/v2/account/balance' : '/v2/account/balance/method'}
      className={`flex min-h-[var(--size-control-mobile)] items-center gap-[8px] rounded-[var(--radius-md)] bg-[var(--color-nav-active)] px-[12px] text-body-14 text-[var(--color-text-inverse)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${compact ? 'mt-[8px]' : 'mt-[12px]'}`}
      aria-label={`Payout: ${body}. ${method ? 'Open Balance.' : 'Add payout method.'}`}
    >
      <span className="shrink-0" aria-hidden><Icon name="wallet" size="sm" /></span>
      <span className="min-w-0 flex-1">{body}</span>
      <span className="shrink-0" aria-hidden><Icon name="chevron-right" size="sm" /></span>
    </Link>
  );
}

/**
 * Horizontal stepper: 5 segments on one line (Postmates-style) with the
 * current step named. Same TRIP_STAGE_STEPS source — only the layout is compact.
 */
function TripStepper({ steps }: { steps: { done: boolean; current: boolean; label: string }[] }) {
  const currentIdx = steps.findIndex((s) => s.current);
  const current = steps[currentIdx]?.label ?? '';
  return (
    <div>
      <div className="flex items-center gap-[6px]" role="img" aria-label={`Trip progress: ${current}`}>
        {steps.map((s) => (
          <span
            key={s.label}
            className={`h-[4px] flex-1 rounded-full ${s.done || s.current ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-border-default)]'}`}
            title={s.done ? `${s.label}: done` : s.current ? `${s.label}: current` : s.label}
          />
        ))}
      </div>
      <p className="mt-[6px] text-caption-12 text-[var(--color-text-secondary)]">{current} · step {currentIdx + 1} of {steps.length}</p>
    </div>
  );
}

/**
 * figma: prototype-led · TripDetails — confirmed load itinerary; route /trip/:id
 * props: load, tripId (view); route id and global application state (screen)
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, color-status-success-bg, color-status-success-text, radius-lg, shadow-card
 */
/**
 * Earnings block: Delivered → POD submitted → POD accepted → Awaiting payment → Available.
 * Each state explains what happened, why money is not there yet, the expected date
 * (when known) and the next action — or that no action is needed.
 */
function EarningsBlock({ load }: { load: V2Load }) {
  const { state } = useStore();
  const application = state.applications[load.id];
  const podStatus = application?.pod?.status;
  const tripEntry = state.ledger.find((e) => e.kind === 'trip' && e.loadId === load.id);
  const available = tripEntry?.kind === 'trip' && tripEntry.status === 'available';
  const copy: { title: string; what: string; why: string; expected: string; action: string } =
    podStatus === 'rejected'
      ? {
        title: 'POD needs attention',
        what: 'The customer rejected the delivery document.',
        why: 'A rejected POD blocks the invoice — fix the document to restart review.',
        expected: 'No payout date yet.',
        action: 'Upload a corrected document below. No other action is needed.',
      }
      : podStatus === 'approved' && !available
      ? {
        title: 'Awaiting customer payment',
        what: 'POD accepted. The invoice is with the customer.',
        why: 'Money is not available yet — the customer has not paid the invoice.',
        expected: `Expected by ${load.payoutDate}.`,
        action: 'No action needed — we will notify you when the money is available.',
      }
      : available
      ? {
        title: 'Earnings available',
        what: 'The customer paid the invoice.',
        why: 'Money is now available for cash out.',
        expected: `Paid ${tripEntry?.kind === 'trip' && tripEntry.paidAt ? new Date(tripEntry.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : load.payoutDate}.`,
        action: 'Cash out from Balance whenever you are ready.',
      }
      : podStatus === 'submitted'
      ? {
        title: 'POD under review',
        what: 'Delivery document submitted and waiting for the customer.',
        why: 'Money is not available yet — the invoice is issued only after POD approval.',
        expected: 'Payout date appears after approval.',
        action: 'No action needed — we will notify you of the decision.',
      }
      : {
        title: 'Upload POD to unlock earnings',
        what: 'Delivery confirmed. The invoice is not issued yet.',
        why: 'Money is not available yet — the customer reviews the delivery document first.',
        expected: `Expected payout ${load.payoutDate} after approval.`,
        action: 'Upload the signed POD below. No other action is needed.',
      };
  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card" aria-label="Earnings">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Earnings</h2>
      <p className="mt-[8px] text-body-14 font-medium text-[var(--color-text-primary)]">{copy.title}</p>
      <p className="mt-[4px] text-body-14 text-[var(--color-text-primary)]">{copy.what}</p>
      <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">{copy.why}</p>
      <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">{copy.expected}</p>
      <p className="mt-[8px] text-body-14 text-[var(--color-text-primary)]">{copy.action}</p>
      {podStatus === 'rejected' && (
        <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">Reason: unreadable signature — re-take the photo and upload again.</p>
      )}
    </section>
  );
}

export function TripDetailsView({ load, tripId }: { load: V2Load; tripId: string }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const { toast, show, dismiss } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeCancel = useCallback(() => {
    if (!cancelling) setCancelOpen(false);
  }, [cancelling]);

  async function confirmCancel(reason: NonNullable<LoadApplication['cancelReason']>) {
    if (cancelling) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelTrip(load.id, reason);
      setCancelOpen(false);
    } catch {
      setError('Could not cancel this trip. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  const cancelled = state.applications[load.id]?.cancelledAfterConfirm === true;
  const tripStage: TripStage = state.applications[load.id]?.tripStage ?? 'confirmed';
  const enRouteTo = state.applications[load.id]?.enRouteTo ?? null;
  const [updatingStage, setUpdatingStage] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);
  const [uploadingPod, setUploadingPod] = useState(false);
  const [podError, setPodError] = useState<string | null>(null);
  async function uploadPod(file: File | undefined) {
    if (!file) return;
    setPodError(null);
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2_000_000) {
      setPodError('Choose a PDF or image smaller than 2 MB.');
      return;
    }
    setUploadingPod(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });
      await submitProofOfDelivery(load.id, { filename: file.name, mimeType: file.type, dataUrl });
    } catch { setPodError('Could not save the document. Please try again.'); }
    finally { setUploadingPod(false); }
  }
  const nextStage: Partial<Record<TripStage, { stage: TripStage; label: string }>> = {
    confirmed: { stage: 'at-pickup', label: "I've arrived at pickup" },
    'at-pickup': { stage: 'loaded', label: 'Confirm loading complete' },
    loaded: { stage: 'at-delivery', label: "I've arrived at delivery" },
    'at-delivery': { stage: 'delivered', label: 'Complete delivery' },
  };
  const nextAction = nextStage[tripStage];
  async function confirmMilestone() {
    if (!nextAction || updatingStage) return;
    setUpdatingStage(true);
    setStageError(null);
    try { await advanceTripStage(load.id, tripStage, nextAction.stage, handoverConfirmed); }
    catch { setStageError('Could not update the trip. Please try again.'); }
    finally { setUpdatingStage(false); }
  }

  /** Navigate leg: mark en route first (survives the Maps switch), then open Google Maps. */
  async function goNavigate(destination: 'pickup' | 'delivery', query: string) {
    try { await setEnRoute(load.id, destination); }
    catch { /* Offline or stale trip — still let the driver navigate. */ }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`, '_blank', 'noopener,noreferrer');
  }

  const stops = [
    { key: 'pickup' as const, label: 'Pickup', city: load.from, day: load.day, window: load.window, site: load.pickupSite, mapsQuery: `${load.pickupSite.address}` },
    { key: 'delivery' as const, label: 'Delivery', city: load.to, day: load.deliveryDay, window: load.deliveryWindow, site: load.deliverySite, mapsQuery: `${load.deliverySite.address}` },
  ];
  const navigateTarget: 'pickup' | 'delivery' = tripStage === 'confirmed' || tripStage === 'at-pickup' ? 'pickup' : 'delivery';
  const navigateStop = stops.find((stop) => stop.key === navigateTarget) ?? stops[0];
  // Arrival CTA lives ONLY in the sticky bar and ONLY once en-route to its leg.
  // Before Navigate the driver has not left yet — there is nothing to arrive from
  // (this is what the E2E asserts: toHaveCount(0) before Navigate).
  const legArrival = navigateTarget === 'pickup' ? nextStage.confirmed : nextStage.loaded;
  const arrivalAction = enRouteTo === navigateTarget ? legArrival ?? null : null;
  const enRouteActive = !cancelled && enRouteTo === navigateTarget
    && (navigateTarget === 'pickup' ? tripStage === 'confirmed' : tripStage === 'loaded');

  const stageIndex = TRIP_STAGE_STEPS.findIndex((step) => step.id === tripStage);
  const stepStates: ProgressState[] = TRIP_STAGE_STEPS.map((_, i) =>
    cancelled ? 'next' : i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'next',
  );
  const progressSteps = TRIP_STAGE_STEPS.map((step, i) => ({
    label: step.label,
    done: stepStates[i] === 'done',
    current: stepStates[i] === 'current',
  }));

  return (
    <V2Frame active="Trips">
      <div className="absolute inset-x-0 top-0 bottom-[117px] z-20 flex flex-col">
        <V2BackBar title={`Trip ${tripId}`} fallback="/v2/trips" />
        <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] pb-[12px] pt-[12px]">
        <h1 className="sr-only">Trip details</h1>

        {/* Summary — route map + compact payout hero (Postmates-style: map on top, sheet below) */}
        <div className="shrink-0 overflow-hidden rounded-[var(--radius-lg)] shadow-card">
            <RoutePreview from={load.from} to={load.to} />
            <section
              className="bg-[var(--color-nav-bg)] px-[16px] pb-[12px] pt-[10px] text-[var(--color-nav-text)]"
              aria-label="Trip summary"
            >
              <div className="flex items-center justify-between gap-[8px]">
                <span
                  className={`inline-flex rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${
                    cancelled
                      ? 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-text)]'
                      : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                  }`}
                >
                  {cancelled ? 'Cancelled by you' : tripStage === 'delivered' ? 'Delivered' : tripStage === 'confirmed' ? 'Confirmed' : tripStage === 'at-pickup' ? 'At pickup' : tripStage === 'loaded' ? 'Loaded · In transit' : 'At delivery'}
                </span>
                <span className="text-caption-12 opacity-80">{tripId}</span>
              </div>

              {cancelled && (
                <p className="mt-[8px] text-body-14 opacity-80">
                  This trip is no longer active.
                </p>
              )}

              <p className="mt-[6px] text-metric-28 text-[var(--color-text-inverse)]">
                €{load.rate}
              </p>
              <p className="text-caption-12 opacity-90">
                {load.km} km loaded · €{load.perKm.toFixed(2)}/km · {load.vehicle}
              </p>
              <PayoutRow load={load} compact />
            </section>
          </div>

          {/* Progress */}
          {!cancelled && (
            <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] shadow-card" aria-label="Trip progress">
              <TripStepper steps={progressSteps} />
            </section>
          )}

          {/* Cargo */}
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card" aria-label="Cargo">
            <h2 className="text-heading-20 text-[var(--color-text-primary)]">Cargo</h2>
            <p className="mt-[8px] flex items-center gap-[8px] text-body-14 text-[var(--color-text-primary)]">
              <span className="text-[var(--color-action-primary)]" aria-hidden><Icon name="package" /></span>
              {load.vehicle}
            </p>
            {!cancelled && (tripStage === 'confirmed' || tripStage === 'at-pickup') && (
              <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
                {load.pickupKm} km · {load.pickupMin} min to pickup
              </p>
            )}
          </section>

          {/* Route — compact timeline: address + window + gate per stop, actions as icons */}
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card" aria-label="Route">
            <div className="flex items-baseline justify-between gap-[8px]">
              <h2 className="text-heading-20 text-[var(--color-text-primary)]">Route</h2>
              <span className="shrink-0 text-caption-12 text-[var(--color-text-secondary)]">{load.km} km loaded</span>
            </div>
            <ol className="mt-[12px] flex flex-col" aria-label="Route stops">
              {stops.map((stop, i) => (
                <li key={stop.label} className="relative flex gap-[12px] pb-[12px] last:pb-0">
                  {i < stops.length - 1 && (
                    <span aria-hidden className="absolute left-[11px] top-[24px] h-[calc(100%-24px)] w-[2px] bg-[var(--color-border-default)]" />
                  )}
                  <span className="relative z-[1] flex h-[24px] w-[24px] shrink-0 items-center justify-center" aria-hidden>
                    <span className={`h-[10px] w-[10px] rounded-full ${i === 0 ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-border-strong)]'}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-14 text-[var(--color-text-primary)]">
                      {stop.site.address}
                    </p>
                    <p className="mt-[2px] text-caption-12 text-[var(--color-text-secondary)]">
                      {stop.day === 'today' ? 'Today' : 'Tomorrow'} · {stop.window} · {stop.site.note}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-[4px]">
                    <a
                      href={`tel:${stop.site.contact.replace(/[^+\d]/g, '')}`}
                      aria-label={`Call ${stop.label.toLowerCase()} ${stop.site.contact}`}
                      className="flex h-[44px] w-[44px] items-center justify-center rounded-[var(--radius-md)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-secondary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      <Icon name="phone" size="sm" />
                    </a>
                    <button
                      type="button"
                      onClick={() => { void goNavigate(stop.key, stop.mapsQuery); }}
                      aria-label={`Open ${stop.label.toLowerCase()} in Maps`}
                      className="flex h-[44px] w-[44px] items-center justify-center rounded-[var(--radius-md)] text-[var(--color-action-primary)] hover:bg-[var(--color-action-secondary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      <Icon name="map-pin" size="sm" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Customer */}
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card">
            <h2 className="text-label-14 text-[var(--color-text-secondary)]">Customer</h2>
            <p className="mt-[8px] text-heading-20 text-[var(--color-text-primary)]">
              {load.company}
            </p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
              Customer rating: {load.rating.toFixed(1)} / 5
            </p>
            {!cancelled && (
              <div className="mt-[12px]">
                <Button
                  label="Contact dispatcher"
                  appearance="secondary"
                  icon={<Icon name="phone" size="sm" />}
                  onClick={() =>
                    show({ tone: 'info', title: 'Dispatcher chat is not connected in this demo.' })
                  }
                />
              </div>
            )}
          </section>
        </div>

        {tripStage === 'at-delivery' && !cancelled && (
          <label className="flex items-start gap-[10px] py-[8px] text-body-14 text-[var(--color-text-primary)]">
            <input type="checkbox" aria-label="Cargo handed over" checked={handoverConfirmed} onChange={(event) => setHandoverConfirmed(event.target.checked)} className="mt-[4px] h-[18px] w-[18px]" />
            Cargo has been unloaded and handed over to the recipient.
          </label>
        )}
        {!cancelled && tripStage === 'delivered' && (
          <EarningsBlock load={load} />
        )}
        {!cancelled && tripStage === 'delivered' && (
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px]" aria-label="Proof of delivery">
            <h2 className="text-heading-20 text-[var(--color-text-primary)]">Proof of delivery</h2>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
              {state.applications[load.id]?.pod?.status === 'submitted'
                ? 'Document submitted · Awaiting review. Payment is tracked separately.'
                : 'Upload a signed delivery document. This does not automatically approve payment.'}
            </p>
            {state.applications[load.id]?.pod && <p className="mt-[8px] text-body-14">{state.applications[load.id].pod?.filename}</p>}
            <label className="mt-[8px] block text-body-14 text-[var(--color-text-primary)]">
              {uploadingPod ? 'Saving document…' : state.applications[load.id]?.pod ? 'Replace document' : 'Upload POD (PDF or image, max 2 MB)'}
              <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" disabled={uploadingPod} onChange={(event) => { void uploadPod(event.target.files?.[0]); event.target.value = ''; }} className="mt-[8px] block w-full text-body-14" />
            </label>
            {podError && <p role="alert" className="mt-[8px] text-body-14">{podError}</p>}
          </section>
        )}
        {stageError && <p role="alert" className="text-body-14 text-[var(--color-text-secondary)]">{stageError}</p>}
        {!cancelled && (tripStage === 'confirmed' || tripStage === 'loaded') && enRouteActive && arrivalAction && (
          <section className="shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card" aria-label={`En route to ${navigateTarget}`}>
            <p className="text-label-12 text-[var(--color-text-secondary)]">En route to {navigateTarget}</p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-primary)]">{navigateStop.site.address}</p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
              {navigateTarget === 'pickup' ? `${load.pickupKm} km · ~${load.pickupMin} min` : `${load.km} km loaded`}
            </p>
          </section>
        )}
        <div className="flex shrink-0 flex-col gap-[8px]">
          {!cancelled && (
            <Button
              label={`Documents (${load.documents.length})`}
              appearance="secondary"
              icon={<Icon name="file-text" size="sm" />}
              onClick={() => setDocsOpen(true)}
            />
          )}
          {!cancelled && tripStage === 'confirmed' && (
            <ButtonLink
              label="Cancel trip"
              full
              onClick={() => setCancelOpen(true)}
            />
          )}
          {!cancelled && (tripStage === 'confirmed' || tripStage === 'loaded') && !enRouteActive && (
            <Button
              label="Navigate in Google Maps"
              appearance="secondary"
              icon={<Icon name="map-pin" size="sm" />}
              onClick={() => { void goNavigate(navigateStop.key, navigateStop.mapsQuery); }}
            />
          )}
          {!cancelled && enRouteActive && (
            <ButtonLink
              label="Re-open navigation"
              full
              onClick={() => { void goNavigate(navigateStop.key, navigateStop.mapsQuery); }}
            />
          )}
          {cancelled && (
            <Button label="Back to loads" onClick={() => navigate('/v2')} />
          )}
        </div>
      </div>

      {/* Sticky primary action above the tab bar (Postmates-style sheet CTA).
          Arrival milestones live ONLY here (no inline duplicate): before Navigate
          arrivalAction is null, so nothing renders; other stages keep nextAction. */}
      {!cancelled && ((tripStage === 'confirmed' || tripStage === 'loaded') ? arrivalAction : nextAction) && (
        <div className="absolute inset-x-0 bottom-[117px] z-20 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[16px] pb-[12px] pt-[8px]">
          {(tripStage === 'confirmed' || tripStage === 'loaded') && arrivalAction ? (
            <Button label={arrivalAction.label} appearance="primary" disabled={updatingStage} loading={updatingStage} onClick={() => { void confirmMilestone(); }} />
          ) : nextAction && tripStage !== 'confirmed' && tripStage !== 'loaded' ? (
            <Button label={nextAction.label} appearance="primary" disabled={updatingStage || (tripStage === 'at-delivery' && !handoverConfirmed)} loading={updatingStage} onClick={() => { void confirmMilestone(); }} />
          ) : null}
        </div>
      )}

      <CancelTripSheet
        open={cancelOpen}
        load={load}
        penalty={cancellationPenalty(state.applications[load.id], load.pickupTime)}
        cancelling={cancelling}
        error={error}
        onConfirm={confirmCancel}
        onClose={closeCancel}
      />
      <TripDocumentsSheet open={docsOpen} load={load} onClose={() => setDocsOpen(false)} />
      <Toast toast={toast} onClose={dismiss} />
    </V2Frame>
  );
}

export function TripDetails() {
  const { id = '' } = useParams();
  const [details, setDetails] = useState<Awaited<ReturnType<typeof getTripDetails>> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    setDetails(null);
    getTripDetails(id).then((item) => { if (active) setDetails(item); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [id, loadAttempt]);

  const emptyBack = useV2Back('/v2');
  if (details) {
    if (details.cancelled) {
      return <TripDetailsView load={details.load} tripId={details.tripId} />;
    }
    if (details.application.status === ApplicationStatus.CONFIRMED) {
      return <TripDetailsView load={details.load} tripId={details.tripId} />;
    }
  }
  return (
    <V2Frame active="Trips">
      <div className="absolute inset-x-0 top-0 z-20">
        <V2BackBar title="Trip details" fallback="/v2" />
      </div>
      <main className="absolute inset-x-0 top-[var(--nav-bar-back-h)] px-[16px]">
        <h1 className="sr-only">Trip details</h1>
        <p role="status" className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-secondary)]">{loadError ? 'Could not load trip details. Check your connection and try again.' : details === null ? 'Loading trip…' : 'No confirmed trip is available for this load.'}</p>
        {loadError && <div className="mt-[16px]"><Button label="Retry" onClick={() => setLoadAttempt((n) => n + 1)} /></div>}
        <div className="mt-[16px]"><Button label="Back to loads" appearance="secondary" onClick={emptyBack} /></div>
      </main>
    </V2Frame>
  );
}
