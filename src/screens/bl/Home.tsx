import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BlFrame, BlSheet } from '../../components/bl/BlFrame';
import { bl, lateMinutes, orderById, useBl } from '../../lib/bl/state';
import { hm, netOf, tm } from '../../lib/bl/logic';

/**
 * Backload (PL) · Kursy — home (route `/bl`). States: no trip, unloading, unloaded, booked, done (spec §7.3).
 * props: none (state from `useBl`, actions from `bl`)
 * tokens: color-bg-surface, color-status-*, color-action-primary, radius-lg, radius-pill, shadow-card
 */
export function BlHome() {
  const s = useBl();
  const nav = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!s.registered) return <Navigate to="/bl/start" replace />;

  const trip = s.trip;
  const booked = s.booked;
  const order = booked ? orderById(booked.orderId) : null;
  const done = booked?.stage === 2;

  return (
    <BlFrame
      active="home"
      sheet={
        cancelOpen && order ? (
          <BlSheet onClose={() => setCancelOpen(false)}>
            <h2 className="text-heading-20 text-[var(--color-text-primary)]">Anulować zlecenie?</h2>
            <span className="text-body-14 text-[var(--color-text-secondary)]">
              {order.from} → {order.to}
            </span>
            <div className="flex flex-col gap-[4px] rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px]">
              <span className="text-label-12 text-[var(--color-text-secondary)]">Warunki anulowania</span>
              <span className="text-body-14 text-[var(--color-text-primary)]">
                {s.clock <= order.cancelFreeUntil
                  ? `Teraz bez kary · do ${tm(order.cancelFreeUntil)}`
                  : `Kara €${order.cancelPenalty} wg warunków zlecenia`}
              </span>
            </div>
            <button
              type="button"
              className="h-[48px] rounded-[var(--radius-sm)] bg-[var(--color-status-danger-bg)] text-label-14 text-[var(--color-status-danger-text)]"
              onClick={() => {
                const penalty = bl.cancel();
                setCancelOpen(false);
                setNote(penalty > 0 ? `Zlecenie anulowane · kara €${penalty}` : 'Zlecenie anulowane · bez kary');
              }}
            >
              {s.clock <= order.cancelFreeUntil ? 'Tak, anuluj zlecenie' : `Tak, anuluj · kara €${order.cancelPenalty}`}
            </button>
            <button
              type="button"
              className="h-[48px] rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-label-14 text-[var(--color-text-primary)]"
              onClick={() => setCancelOpen(false)}
            >
              Nie anuluj
            </button>
          </BlSheet>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[12px] pt-[4px]">
        <h1 className="text-heading-20 text-[var(--color-text-primary)]">Kursy</h1>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">Pt, 9 paź · godz. {tm(s.clock)}{s.offline ? ' · brak sieci' : ''}</span>

        {note && (
          <button type="button" onClick={() => setNote(null)} className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-left text-body-14 text-[var(--color-text-primary)]">
            {note}
          </button>
        )}

        {!trip && !order && (
          <div className="flex flex-col items-center gap-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[24px] text-center">
            <span className="text-heading-14 text-[var(--color-text-primary)]">Brak aktywnego kursu</span>
            <span className="text-body-14 text-[var(--color-text-secondary)]">
              Dodaj kurs, a znajdziemy zlecenia po drodze po rozładunku.
            </span>
            <button
              type="button"
              className="h-[48px] w-full rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
              onClick={() => bl.addTrip()}
            >
              Dodaj kurs demo
            </button>
            <Link to="/bl/search" className="text-label-14 text-[var(--color-action-primary)]">
              Szukaj zleceń bez kursu
            </Link>
          </div>
        )}

        {trip && (
          <div className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              {trip.status === 'unloading' ? (
                <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-warning-bg)] px-[10px] py-[4px] text-label-12 text-[var(--color-status-warning-text)]">Rozładunek</span>
              ) : (
                <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-success-bg)] px-[10px] py-[4px] text-label-12 text-[var(--color-status-success-text)]">Rozładowano</span>
              )}
              <span className="text-caption-12 text-[var(--color-text-secondary)]">
                Kurs #{trip.id} · do {tm(trip.unloadBy)}
              </span>
            </div>
            <span className="text-heading-14 text-[var(--color-text-primary)]">
              {trip.from} → {trip.to}
            </span>
            <span className="text-body-14 text-[var(--color-text-secondary)]">{trip.cargo}</span>
          </div>
        )}

        {order && !done && (
          <div className="flex flex-col gap-[12px] rounded-[var(--radius-lg)] border border-[var(--color-action-primary)] bg-[var(--color-status-match-bg)] p-[16px]">
            <div className="flex items-center justify-between">
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-[10px] py-[4px] text-label-12 text-[var(--color-action-text-inverse)]">Zarezerwowano</span>
              <span className="text-label-12 text-[var(--color-status-match-text)]">
                {booked?.stage === 0 ? 'jedziesz na załadunek' : 'ładunek w aucie'}
              </span>
            </div>
            <div className="flex items-end justify-between gap-[8px]">
              <div className="flex flex-col">
                <span className="text-heading-14 text-[var(--color-text-primary)]">
                  {order.from} → {order.to}
                </span>
                <span className="text-caption-12 text-[var(--color-text-secondary)]">
                  +{order.detourKm} km objazdu · netto €{netOf(order)}
                </span>
              </div>
              <span className="text-rate-24 text-[var(--color-action-primary)]">€{order.payout}</span>
            </div>
            <div className="flex gap-[10px]">
              <button
                type="button"
                className="h-[48px] flex-1 rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
                onClick={() => nav('/bl/route')}
              >
                Trasa
              </button>
              {booked?.stage === 0 && (
                <button
                  type="button"
                  className="h-[48px] flex-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-label-14 text-[var(--color-text-primary)]"
                  onClick={() => (s.offline ? setNote('Bez sieci nie można anulować') : setCancelOpen(true))}
                >
                  Anuluj
                </button>
              )}
            </div>
          </div>
        )}

        {order && !done && lateMinutes(s) > 0 && (
          <div role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-status-danger-bg)] p-[12px] text-body-14 text-[var(--color-status-danger-text)]">
            Spóźnienie: {lateMinutes(s)} min. Załadunek był o {tm(order.pickupAt)}. Zadzwoń do dyspozytora. Anulowanie teraz kosztuje €{order.cancelPenalty}.
          </div>
        )}

        {order && done && (
          <div className="flex flex-col gap-[12px] rounded-[var(--radius-lg)] bg-[var(--color-status-success-bg)] p-[16px]">
            <span className="text-label-12 text-[var(--color-status-success-text)]">Zrealizowano</span>
            <div className="flex items-end justify-between">
              <span className="text-heading-14 text-[var(--color-text-primary)]">
                {order.from} → {order.to}
              </span>
              <span className="text-rate-24 text-[var(--color-status-success-text)]">+€{order.payout}</span>
            </div>
            <button
              type="button"
              className="h-[48px] rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
              onClick={() => bl.clearTrip()}
            >
              Do nowych kursów
            </button>
          </div>
        )}

        {trip && trip.status === 'unloading' && (
          <div className="mt-[4px] flex flex-col gap-[10px]">
            <button
              type="button"
              className="h-[56px] rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
              onClick={() => {
                bl.unload();
                setNote('Rozładunek potwierdzony');
              }}
            >
              Rozładunek zakończony
            </button>
            {!booked && (
              <Link to="/bl/search" className="text-center text-label-14 text-[var(--color-action-primary)]">
                Ustaw trasę z wyprzedzeniem
              </Link>
            )}
          </div>
        )}

        {trip && trip.status === 'unloaded' && !booked && (
          <Link
            to="/bl/search"
            className="mt-[4px] flex h-[48px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
          >
            Szukaj zleceń po drodze
          </Link>
        )}

        {trip && (
          <span className="text-caption-12 text-[var(--color-text-tertiary)]">
            Stan z {hm(s.clock)}
          </span>
        )}
      </div>
    </BlFrame>
  );
}
