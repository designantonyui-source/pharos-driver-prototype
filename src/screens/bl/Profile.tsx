import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BlFrame, BlSheet } from '../../components/bl/BlFrame';
import { bl, orderById, useBl, type BlState, type HistoryItem } from '../../lib/bl/state';
import { reqBlock, tm, type Body } from '../../lib/bl/logic';

/**
 * Backload (PL) · Profil — account, earnings, history, demo controls (route `/bl/profile`, spec §7.10–7.11).
 * Earned = non-pending history; trips = backload entries, not pending. Penalties reduce earnings.
 * The demo block (offline, +1 h, reset) is for the case presentation and is labelled as such.
 * props: none. tokens: color-action-primary, color-status-*, color-bg-surface, radius-lg
 */
export function BlProfile() {
  const s = useBl();
  const [note, setNote] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  if (!s.registered) return <Navigate to="/bl/start" replace />;

  const earned = s.history.filter((h) => !h.pending).reduce((a, h) => a + h.amount, 0);
  const trips = s.history.filter((h) => h.kind === 'backload' && !h.pending).length;
  const pendingSum = s.history.filter((h) => h.pending).reduce((a, h) => a + h.amount, 0);

  return (
    <BlFrame
      active="profile"
      sheet={
        editOpen ? (
          <ProfileSheet
            current={s}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false);
              setNote("Profil zapisany. Lista zleceń jest już zaktualizowana.");
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[14px] pt-[4px]">
        <h1 className="text-heading-20 text-[var(--color-text-primary)]">Profil</h1>

        <div className="flex items-center gap-[14px] rounded-[var(--radius-lg)] bg-[var(--color-text-primary)] p-[16px]">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[var(--color-status-match-bg)] text-heading-14 text-[var(--color-status-match-text)]">
            AB
          </span>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span className="text-heading-14 text-[var(--color-action-text-inverse)]">Antoni B.</span>
            <span className="text-caption-12 text-[var(--color-status-match-bg)]">
              {s.role ?? 'Kierowca'} · {s.profile.body}
              {s.profile.adr ? ' · ADR' : ''} · ★ 4.9
            </span>
          </div>
        </div>

        <button type="button" onClick={() => setEditOpen(true)} className="h-[44px] rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-label-14 text-[var(--color-text-primary)]">
          Edytuj profil
        </button>

        <div className="grid grid-cols-2 gap-[10px]">
          <Metric label="W tym miesiącu" value={`€${String(earned).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}`} tone="primary" />
          <Metric label="Zlecenia po drodze" value={String(trips)} />
        </div>

        {pendingSum !== 0 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] p-[12px] text-label-12 text-[var(--color-status-warning-text)]">
            Oczekuje na synchronizację: €{pendingSum}
          </div>
        )}

        {note && <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-primary)]">{note}</div>}

        <div className="flex items-center justify-between">
          <h2 className="text-heading-14 text-[var(--color-text-primary)]">Historia</h2>
          {s.history.length > 0 && (
            <button type="button" onClick={() => { bl.clearHistory(); setNote('Historia wyczyszczona'); }} className="text-label-12 text-[var(--color-text-secondary)]">
              Wyczyść
            </button>
          )}
        </div>

        {s.history.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[20px] text-center text-body-14 text-[var(--color-text-secondary)]">
            Na razie pusto. Zarezerwuj pierwsze zlecenie po drodze — pojawi się tutaj.
          </div>
        ) : (
          <ul className="flex flex-col gap-[8px]">
            {s.history.map((h) => (
              <HistoryRow key={h.id} item={h} />
            ))}
          </ul>
        )}

        <div className="mt-[8px] flex flex-col gap-[8px] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] p-[14px]">
          <span className="text-label-12 text-[var(--color-text-secondary)]">Demo (dla prezentacji)</span>
          <div className="flex flex-wrap gap-[8px]">
            <button
              type="button"
              aria-pressed={s.offline}
              onClick={() => {
                if (s.offline) {
                  const sum = bl.setOffline(false);
                  setNote(sum ? `Zsynchronizowano · +€${sum}` : 'Połączenie przywrócone');
                } else {
                  bl.setOffline(true);
                  setNote('Tryb offline włączony');
                }
              }}
              className={`h-[36px] rounded-[var(--radius-pill)] border px-[12px] text-label-12 ${
                s.offline
                  ? 'border-[var(--color-status-warning-text)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-primary)]'
              }`}
            >
              {s.offline ? 'Przywróć sieć' : 'Wyłącz sieć'}
            </button>
            <button type="button" onClick={() => { bl.shiftClock(60); setNote(`Godzina: ${tm(s.clock + 60)}`); }} className="h-[36px] rounded-[var(--radius-pill)] border border-[var(--color-border-default)] px-[12px] text-label-12 text-[var(--color-text-primary)]">
              +1 godz. (teraz {tm(s.clock)})
            </button>
            <button type="button" onClick={() => { bl.reset(); }} className="h-[36px] rounded-[var(--radius-pill)] border border-[var(--color-border-default)] px-[12px] text-label-12 text-[var(--color-status-danger-text)]">
              Zresetuj demo
            </button>
          </div>
          <Link to="/bl/start" className="text-label-12 text-[var(--color-action-primary)]">
            Zobacz rejestrację
          </Link>
        </div>
      </div>
    </BlFrame>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'primary' }) {
  return (
    <div className="flex flex-col gap-[4px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[14px] shadow-[var(--shadow-card)]">
      <span className="text-caption-12 text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-metric-28 ${tone === 'primary' ? 'text-[var(--color-action-primary)]' : 'text-[var(--color-text-primary)]'}`}>{value}</span>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const penalty = item.kind === 'penalty';
  return (
    <li className="flex items-center justify-between gap-[8px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[14px]">
      <div className="flex min-w-0 flex-col">
        <span className={`text-heading-14 ${penalty ? 'text-[var(--color-status-danger-text)]' : 'text-[var(--color-text-primary)]'}`}>{item.route}</span>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{item.pending ? 'czeka na synchronizację' : item.date}</span>
      </div>
      <span className={`text-heading-14 ${item.amount < 0 ? 'text-[var(--color-status-danger-text)]' : 'text-[var(--color-status-success-text)]'}`}>
        {item.amount < 0 ? `−€${Math.abs(item.amount)}` : `+€${item.amount}`}
      </span>
    </li>
  );
}

const ROLE_OPTIONS = ['Własny samochód', 'Pracuję dla przewoźnika'];
const BODY_OPTIONS: Body[] = ['Plandeka', 'Chłodnia', 'Kontener', 'Platforma'];

/** Driver profile editor. Saving changes requirements at once: blocked orders become bookable or the reverse. */
function ProfileSheet({ current, onClose, onSaved }: { current: BlState; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState(current.role ?? ROLE_OPTIONS[0]);
  const [body, setBody] = useState<Body>(current.profile.body);
  const [adr, setAdr] = useState(current.profile.adr);
  const booked = current.booked ? orderById(current.booked.orderId) : null;
  const clash = booked ? reqBlock(booked, { body, adr }) : null;

  return (
    <BlSheet onClose={onClose}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Edytuj profil</h2>
      <span className="text-body-14 text-[var(--color-text-secondary)]">Zmiany od razu wpływają na listę zleceń.</span>

      <span className="text-label-12 text-[var(--color-text-secondary)]">Jak pracujesz</span>
      <div className="flex flex-col gap-[8px]" role="radiogroup" aria-label="Jak pracujesz">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={role === r}
            onClick={() => setRole(r)}
            className={`h-[44px] rounded-[var(--radius-sm)] border text-left px-[12px] text-label-14 ${
              role === r ? 'border-[var(--color-action-primary)] border-2 text-[var(--color-text-primary)]' : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <span className="text-label-12 text-[var(--color-text-secondary)]">Typ nadwozia</span>
      <div className="grid grid-cols-2 gap-[8px]" role="radiogroup" aria-label="Typ nadwozia">
        {BODY_OPTIONS.map((b) => (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={body === b}
            onClick={() => setBody(b)}
            className={`h-[44px] rounded-[var(--radius-sm)] border text-label-14 ${
              body === b ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-action-text-inverse)]' : 'border-[var(--color-border-default)] text-[var(--color-text-primary)]'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <label className="flex items-center justify-between gap-[12px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] p-[12px]">
        <span className="flex flex-col">
          <span className="text-label-14 text-[var(--color-text-primary)]">Mam uprawnienia ADR</span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">Bez nich nie wezmiesz towarów niebezpiecznych</span>
        </span>
        <input type="checkbox" checked={adr} onChange={(e) => setAdr(e.target.checked)} className="h-[24px] w-[24px] accent-[var(--color-action-primary)]" />
      </label>

      {clash && (
        <span role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-status-danger-bg)] p-[12px] text-body-14 text-[var(--color-status-danger-text)]">
          Bieżące zlecenie wymaga innego profilu ({clash.short}). Najpierw zakończ albo anuluj je na ekranie Kursy.
        </span>
      )}

      <button
        type="button"
        disabled={Boolean(clash)}
        onClick={() => {
          bl.updateProfile(role, body, adr);
          onSaved();
        }}
        className={`h-[50px] rounded-[var(--radius-sm)] text-label-14 ${
          clash
            ? 'bg-[var(--color-bg-disabled)] text-[var(--color-action-text-disabled)]'
            : 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
        }`}
      >
        Zapisz profil
      </button>
    </BlSheet>
  );
}
