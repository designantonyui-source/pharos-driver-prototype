import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlFrame } from '../../components/bl/BlFrame';
import { MAIN_CITY } from '../../lib/bl/logic';
import { bl, useBl } from '../../lib/bl/state';

/**
 * Backload (PL) · Szukaj — search setup (route `/bl/search`, spec §7.4).
 * Accepts only Poznań for now; other cities get a clear message, not an error state.
 * props: none. tokens: color-bg-surface, color-border-default, color-action-primary, radius-sm, radius-pill
 */
const VALID = ['poznań', 'poznan', 'познань'];

export function BlSearch() {
  const s = useBl();
  const nav = useNavigate();
  const [city, setCity] = useState(s.search?.city ?? '');
  const [deadlineH, setDeadlineH] = useState<number | null>(s.search?.deadlineH ?? 12);
  const valid = VALID.includes(city.trim().toLowerCase());
  const hasBooking = s.booked != null;

  const start = s.trip
    ? s.trip.status === 'unloaded'
      ? `${s.trip.to} · rozładowano`
      : `${s.trip.to} · po rozładunku o ${String(Math.floor(s.trip.unloadBy / 60)).padStart(2, '0')}:00`
    : null;

  return (
    <BlFrame active="search">
      <div className="flex flex-col gap-[20px] pt-[4px]">
        <h1 className="text-heading-20 text-[var(--color-text-primary)]">Szukaj</h1>

        {start ? (
          <div className="flex flex-col gap-[2px] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[14px]">
            <span className="text-caption-12 text-[var(--color-text-secondary)]">Start wyszukiwania</span>
            <span className="text-body-14 text-[var(--color-text-primary)]">{start}</span>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-status-warning-bg)] p-[14px]">
            <span className="text-label-14 text-[var(--color-status-warning-text)]">Brak aktywnego kursu</span>
            <p className="text-body-14 text-[var(--color-status-warning-text)]">Bez kursu nie sprawdzimy, czy zdążysz na załadunek.</p>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <label htmlFor="bl-city" className="text-label-12 text-[var(--color-text-secondary)]">
            Miasto następnego załadunku
          </label>
          <input
            id="bl-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Na przykład Poznań"
            autoComplete="off"
            className="h-[48px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[14px] text-body-16 text-[var(--color-text-primary)]"
          />
          {city.trim() && !valid && (
            <span className="text-caption-12 text-[var(--color-status-danger-text)]">
              Na razie zlecenia tylko w kierunku {MAIN_CITY}. Wpisz „{MAIN_CITY}”.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          <span className="text-label-12 text-[var(--color-text-secondary)]">Termin głównego załadunku</span>
          <div className="flex gap-[8px]" role="radiogroup" aria-label="Termin głównego załadunku">
            {[6, 12, 24].map((h) => {
              const on = deadlineH === h;
              return (
                <button
                  key={h}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setDeadlineH(h)}
                  className={`h-[44px] flex-1 rounded-[var(--radius-pill)] border text-label-14 ${
                    on
                      ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
                  }`}
                >
                  za {h} godz.
                </button>
              );
            })}
          </div>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">
            Zlecenia, na które nie zdążysz, zobaczysz z wyjaśnieniem, a nie zniknie.
          </span>
        </div>

        <div className="mt-[8px] flex flex-col gap-[10px]">
          {hasBooking && (
            <span className="text-caption-12 text-[var(--color-status-warning-text)]">
              Najpierw zakończ albo anuluj bieżące zlecenie na ekranie Kursy. Potem wyszukiwanie znów będzie dostępne.
            </span>
          )}
          <button
            type="button"
            disabled={!valid || hasBooking}
            onClick={() => {
              bl.setSearch({ city: MAIN_CITY, deadlineH, radius: 60, onlyProfitable: true });
              nav('/bl/list');
            }}
            className={`h-[50px] rounded-[var(--radius-sm)] text-label-14 ${
              !valid || hasBooking
                ? 'bg-[var(--color-bg-disabled)] text-[var(--color-action-text-disabled)]'
                : 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
            }`}
          >
            Znajdź zlecenia po drodze
          </button>
          <button
            type="button"
            disabled={hasBooking}
            onClick={() => {
              bl.setSearch({ city: MAIN_CITY, deadlineH: null, radius: 60, onlyProfitable: true });
              nav('/bl/list');
            }}
            className="h-[44px] text-label-14 text-[var(--color-action-primary)] disabled:text-[var(--color-action-text-disabled)]"
          >
            Pokaż wszystko po drodze, bez sprawdzania czasu
          </button>
        </div>
      </div>
    </BlFrame>
  );
}
