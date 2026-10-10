import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getLoad } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store, useStore } from '../../lib/store';
import { Button } from '../Button';
import { QuickApplyModal } from './QuickApplyModal';

/**
 * figma: prototype-led · shared application action for every load surface
 * props: loadId · application and price come from store/API
 * tokens: color-action-primary, color-text-secondary, spacing-8
 */
export function LoadCta({ loadId }: { loadId: string }) {
  useStore();
  const application = getApplicationForLoad(loadId);
  const load = getLoad(loadId);
  const [open, setOpen] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenario = params.get('scenario');
  const search = scenario === 'reject' || scenario === 'approve' ? `?scenario=${scenario}` : '';
  const statusPath = `/application/${loadId}${search}`;
  useEffect(() => {
    if (!duplicate) return;
    const timer = window.setTimeout(() => setDuplicate(false), 4000);
    return () => window.clearTimeout(timer);
  }, [duplicate]);
  const status = application?.status;
  const waiting = status === ApplicationStatus.SENT || status === ApplicationStatus.DISPATCHER_REVIEW || status === ApplicationStatus.CUSTOMER_REVIEW;
  const rejected = status === ApplicationStatus.REJECTED;

  function selectApplication() {
    if (application) store.set(application);
  }

  return (
    <div ref={anchor} onClick={(event) => event.stopPropagation()} className="flex flex-col gap-[8px]">
      {waiting || rejected ? (
        <>
          <Button label={rejected ? 'Application rejected' : 'Application sent'} disabled />
          <Link to={statusPath} onClick={selectApplication} className="text-center text-label-14 text-[var(--color-action-primary)] underline">
            {rejected ? 'View reason' : 'View status'}
          </Link>
        </>
      ) : status === ApplicationStatus.CONFIRMED ? (
        <Button label="View trip" onClick={() => { selectApplication(); navigate(`/trip/${loadId}`); }} />
      ) : (
        <Button label={status === ApplicationStatus.CANCELLED ? 'Apply again' : load ? `Apply for €${load.rate}` : 'Loading load details…'} disabled={!load} onClick={() => setOpen(true)} />
      )}
      {duplicate && createPortal(
        <p role="status" className="absolute inset-x-[16px] bottom-[117px] z-50 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-primary)] shadow-[var(--shadow-card)]">You already applied for this load</p>,
        anchor.current?.closest('[data-load-overlay-root]') ?? document.body,
      )}
      {open && load && createPortal(
        <QuickApplyModal loadId={loadId} load={load} onCancel={() => setOpen(false)} onAlreadyApplied={() => { setOpen(false); setDuplicate(true); }} onSubmitted={() => { setOpen(false); navigate(statusPath); }} />,
        anchor.current?.closest('[data-load-overlay-root]') ?? document.body,
      )}
    </div>
  );
}
