import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonLink } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { ProgressStep, type ProgressState } from '../../components/ProgressStep';
import { V2BackBar, useV2Back } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { CancelTripSheet } from '../../components/v2/CancelTripSheet';
import { TripDocumentsSheet } from '../../components/v2/TripDocumentsSheet';
import { Toast, useToast } from '../../components/v2/Toast';
import { TRIP_STAGE_STEPS, advanceTripStage, cancelTrip, cancellationPenalty, getTripDetails, submitProofOfDelivery, type TripStage } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore, type LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';

/**
 * figma: prototype-led · TripDetails — confirmed load itinerary; route /trip/:id
 * props: load, tripId (view); route id and global application state (screen)
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, color-status-success-bg, color-status-success-text, radius-lg, shadow-card
 */
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

  const stops = [
    { label: 'Pickup', city: load.from, day: load.day, window: load.window, site: load.pickupSite, mapsQuery: `${load.pickupSite.address}` },
    { label: 'Delivery', city: load.to, day: load.deliveryDay, window: load.deliveryWindow, site: load.deliverySite, mapsQuery: `${load.deliverySite.address}` },
  ];

  const stageIndex = TRIP_STAGE_STEPS.findIndex((step) => step.id === tripStage);
  const stepStates: ProgressState[] = TRIP_STAGE_STEPS.map((_, i) =>
    cancelled ? 'next' : i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'next',
  );

  return (
    <V2Frame active="Trips">
      <div className="absolute inset-x-0 top-0 z-20">
        <V2BackBar title={`Trip ${tripId}`} fallback="/v2/trips" />
      </div>

      <div className="absolute inset-x-0 top-[var(--nav-bar-back-h)] bottom-[117px] flex flex-col px-[16px]">
        <h1 className="sr-only">Trip details</h1>

        <main className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto pb-[12px]">
          {/* Summary */}
          <section
            className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card"
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
              <span className="text-caption-12 text-[var(--color-text-secondary)]">{tripId}</span>
            </div>

            {cancelled && (
              <p className="mt-[8px] text-body-14 text-[var(--color-text-secondary)]">
                This trip is no longer active.
              </p>
            )}

            <p className="mt-[12px] text-heading-32 text-[var(--color-text-primary)]">
              €{load.rate}
            </p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
              {load.km} km loaded · €{load.perKm.toFixed(2)}/km · {load.payoutDate} → {load.payoutMethod}
            </p>
          </section>

          {/* Progress */}
          {!cancelled && (
            <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card" aria-label="Trip progress">
              <h2 className="text-heading-20 text-[var(--color-text-primary)]">Trip progress</h2>
              <ol className="mt-[12px] flex flex-col" aria-label={`Step ${stageIndex + 1} of ${TRIP_STAGE_STEPS.length}`}>
                {TRIP_STAGE_STEPS.map((step, i) => (
                  <ProgressStep key={step.id} state={stepStates[i]} number={i + 1} label={step.label} />
                ))}
              </ol>
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

          {/* Route */}
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card">
            <h2 className="text-heading-20 text-[var(--color-text-primary)]">Route</h2>
            <ol className="mt-[16px] flex flex-col gap-[16px]" aria-label="Route stops">
              {stops.map((stop) => (
                <li key={stop.label} className="flex items-start gap-[12px]">
                  <span className="mt-[4px] text-[var(--color-action-primary)]">
                    <Icon name="map-pin" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-label-12 text-[var(--color-text-secondary)]">{stop.label}</p>
                    <p className="mt-[4px] text-heading-20 text-[var(--color-text-primary)]">
                      {stop.city}
                    </p>
                    <p className="mt-[4px] text-body-14 text-[var(--color-text-primary)]">
                      {stop.site.address}
                    </p>
                    <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
                      {stop.day === 'today' ? 'Today' : 'Tomorrow'} · {stop.window}
                    </p>
                    <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">
                      {stop.site.note} · {stop.site.contact}
                    </p>
                    <ButtonLink
                      label={`Navigate to ${stop.label.toLowerCase()}`}
                      onClick={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.mapsQuery)}&travelmode=driving`, '_blank', 'noopener,noreferrer');
                      }}
                    />
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
        </main>

        {!cancelled && <p role="status" className="text-body-14 text-[var(--color-text-secondary)]">
          {tripStage === 'confirmed' ? 'Next: travel to pickup, then confirm arrival.' : tripStage === 'loaded' ? 'Next: travel to delivery, then confirm arrival.' : tripStage === 'at-pickup' ? 'Check the cargo and confirm loading.' : tripStage === 'at-delivery' ? 'Confirm unloading and handover before completing delivery.' : 'Delivery recorded. Document review and payment are separate.'}
        </p>}
        {tripStage === 'at-delivery' && !cancelled && (
          <label className="flex items-start gap-[10px] py-[8px] text-body-14 text-[var(--color-text-primary)]">
            <input type="checkbox" checked={handoverConfirmed} onChange={(event) => setHandoverConfirmed(event.target.checked)} className="mt-[4px] h-[18px] w-[18px]" />
            Cargo has been unloaded and handed over to the recipient.
          </label>
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
        <div className="flex shrink-0 flex-col gap-[8px] py-[8px]">
          {!cancelled && (tripStage === 'confirmed' || tripStage === 'loaded') && (
            <Button label={tripStage === 'confirmed' ? 'Navigate to pickup' : 'Navigate to delivery'} onClick={() => {
              const destination = tripStage === 'confirmed' ? load.from : load.to;
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`, '_blank', 'noopener,noreferrer');
            }} />
          )}
          {!cancelled && nextAction && (
            <Button label={nextAction.label} appearance={tripStage === 'confirmed' || tripStage === 'loaded' ? 'secondary' : 'primary'} disabled={updatingStage || (tripStage === 'at-delivery' && !handoverConfirmed)} loading={updatingStage} onClick={() => { void confirmMilestone(); }} />
          )}
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
          {cancelled && (
            <Button label="Back to loads" onClick={() => navigate('/v2')} />
          )}
        </div>
      </div>

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
