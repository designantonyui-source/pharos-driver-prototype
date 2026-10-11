import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getLoad } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store, useStore } from '../../lib/store';
import { Button } from '../Button';
import { QuickApplyModal } from './QuickApplyModal';

/**
 * figma: prototype-led · shared application action for every load surface
 * props: loadId, onNotice (info toast shown by the owning screen — one Toast standard)
 * tokens: color-action-primary, color-text-secondary, spacing-8
 */
export function LoadCta({ loadId, onNotice }: { loadId: string; onNotice?: (title: string, detail?: string) => void }) {
  useStore();
  const application = getApplicationForLoad(loadId);
  const load = getLoad(loadId);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenario = params.get('scenario');
  const search = scenario === 'reject' || scenario === 'approve' ? `?scenario=${scenario}` : '';
  const statusPath = `/application/${loadId}${search}`;
  const status = application?.status;
  const waiting = status === ApplicationStatus.SENT || status === ApplicationStatus.DISPATCHER_REVIEW || status === ApplicationStatus.CUSTOMER_REVIEW;
  const canReapply = status === ApplicationStatus.CANCELLED || status === ApplicationStatus.REJECTED;

  function selectApplication() {
    if (application) store.set(application);
  }

  function notifyAlreadyApplied() {
    onNotice?.('Already applied', 'This application is still in review.');
  }

  return (
    <div onClick={(event) => event.stopPropagation()} className="flex flex-col gap-[8px]">
      {waiting ? (
        <>
          <Button label="Application sent" disabled />
          <Link to={statusPath} onClick={selectApplication} className="text-center text-label-14 text-[var(--color-action-primary)] underline">
            View status
          </Link>
        </>
      ) : status === ApplicationStatus.CONFIRMED ? (
        <Button label="View trip" onClick={() => { selectApplication(); navigate(`/trip/${loadId}`); }} />
      ) : status === ApplicationStatus.REJECTED ? (
        <>
          <Button label="Application rejected" disabled />
          <Link to={statusPath} onClick={selectApplication} className="text-center text-label-14 text-[var(--color-action-primary)] underline">
            View reason
          </Link>
          <Button label="Apply again" onClick={() => setOpen(true)} />
        </>
      ) : (
        <Button label={canReapply ? 'Apply again' : load ? `Apply for €${load.rate}` : 'Loading load details…'} disabled={!load} onClick={() => setOpen(true)} />
      )}
      {open && load && createPortal(
        <QuickApplyModal loadId={loadId} load={load} onCancel={() => setOpen(false)} onAlreadyApplied={() => { setOpen(false); notifyAlreadyApplied(); }} onSubmitted={() => { setOpen(false); navigate(statusPath); }} />,
        // Keep the sheet inside the 402px phone frame (V2Frame = [data-load-overlay-root]);
        // portalling to document.body escapes the frame and stretches the sheet full-width on desktop.
        document.querySelector('[data-load-overlay-root]') ?? document.body,
      )}
    </div>
  );
}
