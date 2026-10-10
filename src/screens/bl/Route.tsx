import { Link, Navigate } from 'react-router-dom';
import { BlFrame } from '../../components/bl/BlFrame';
import { check, dur, hm, netOf, tm } from '../../lib/bl/logic';
import { bl, ctxOf, lateMinutes, orderById, useBl } from '../../lib/bl/state';

/**
 * Backload (PL) · Trasa — route stages (route `/bl/route`, spec §7.8).
 * Stage 0 loading → 1 loaded (driver confirms) → 2 unloaded (payout written to history).
 * Offline: stages still move, the status says it will be sent when the connection returns.
 * props: none. tokens: color-status-success-*, color-status-warning-*, color-action-primary, radius-lg
 */
export function BlRoute() {
  const s = useBl();
  const b = s.booked;
  if (!s.registered) return <Navigate to="/bl/start" replace />;
  const o = b ? orderById(b.orderId) : null;
  if (!b || !o) return <Navigate to="/bl" replace />;

  const ctx = ctxOf(s);
  const ch = check(o, ctx);
  const stage = b.stage;
  const unloading = s.trip?.status === 'unloading';
  const steps = [
    { title: 'Załadunek', sub: `${o.from} · ${tm(o.pickupAt)}` },
    { title: 'Rozładunek', sub: `${o.to} · ${tm(o.dropAt)}` },
    { title: 'Główny załadunek', sub: `Poznań${ctx.deadlineH != null && ch.deadlineAt ? ` · do ${tm(ch.deadlineAt)}` : ''}` },
  ];

  return (
    <BlFrame active="home" showTabs={false} nav={{ title: "Trasa", back: "/bl" }}>
      <div className="flex flex-col gap-[14px] pt-[4px]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-caption-12 text-[var(--color-text-secondary)]">Zlecenie nr {o.id}</span>
          <h1 className="text-heading-20 text-[var(--color-text-primary)]">
            {o.from} → {o.to}
          </h1>
        </div>

        <RouteSketch stage={stage} buffer={ch.buffer} detourKm={o.detourKm} />

        <ol className="flex flex-col gap-[8px]">
          {steps.map((st, i) => {
            const done = i < stage;
            const current = i === stage;
            return (
              <li
                key={st.title}
                className={`flex items-center gap-[12px] rounded-[var(--radius-lg)] border p-[12px] ${
                  current ? 'border-[var(--color-action-primary)] bg-[var(--color-bg-surface)]' : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)]'
                } ${done ? 'bg-[var(--color-status-success-bg)]' : ''}`}
              >
                <span
                  className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-label-12 ${
                    done
                      ? 'bg-[var(--color-status-success-text)] text-[var(--color-action-text-inverse)]'
                      : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <div className="flex flex-col">
                  <span className="text-heading-14 text-[var(--color-text-primary)]">{st.title}</span>
                  <span className="text-caption-12 text-[var(--color-text-secondary)]">{st.sub}</span>
                </div>
              </li>
            );
          })}
        </ol>

        {lateMinutes(s) > 0 && (
          <div role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-status-danger-bg)] p-[12px] text-body-14 text-[var(--color-status-danger-text)]">
            Spóźnienie: {lateMinutes(s)} min. Załadunek był o {tm(o.pickupAt)}.
          </div>
        )}

        {s.offline && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] p-[12px] text-label-12 text-[var(--color-status-warning-text)]">
            Status zapisany lokalnie. Wyślemy go po połączeniu z siecią.
          </div>
        )}

        {stage === 0 && unloading && (
          <div role="alert" className="rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] p-[12px] text-body-14 text-[var(--color-status-warning-text)]">
            Najpierw potwierdź rozładunek na ekranie Kursy. Załadunek odblokuje się po nim.
          </div>
        )}
        {stage === 1 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-primary)]">
            Ładunek w aucie. CMR zapisany offline.
          </div>
        )}
        {stage === 2 && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-status-success-bg)] p-[12px] text-body-14 text-[var(--color-status-success-text)]">
            Zlecenie zrealizowane: +€{o.payout} {s.offline ? 'po połączeniu' : 'zaksięgowano'}. Netto €{netOf(o)}.
          </div>
        )}

        <div className="flex flex-col gap-[10px] pt-[4px]">
          {stage === 0 && (
            <button
              type="button"
              disabled={unloading}
              onClick={() => bl.advance()}
              className={`h-[50px] rounded-[var(--radius-sm)] text-label-14 ${
                unloading
                  ? 'bg-[var(--color-bg-disabled)] text-[var(--color-action-text-disabled)]'
                  : 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
              }`}
            >
              Potwierdź załadunek
            </button>
          )}
          {stage === 1 && (
            <button type="button" onClick={() => bl.advance()} className="h-[50px] rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]">
              Potwierdź rozładunek
            </button>
          )}
          {stage === 2 && (
            <Link to="/bl" className="flex h-[50px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]">
              Do kursów
            </Link>
          )}
        </div>

        <span className="text-center text-caption-12 text-[var(--color-text-secondary)]">
          Objazd +{o.detourKm} km{ch.buffer != null ? ` · bufor ${dur(ch.buffer)}` : ''} · załadunek {hm(o.pickupAt)}
        </span>
      </div>
    </BlFrame>
  );
}

/** Schematic route: three points, the truck moves with the stage. Drawn in the Pharos map palette. */
function RouteSketch({ stage, buffer, detourKm }: { stage: number; buffer: number | null; detourKm: number }) {
  const truck = [
    { x: 30, y: 118 },
    { x: 92, y: 96 },
    { x: 150, y: 74 },
  ][stage];
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-map-land)]">
      <svg viewBox="0 0 340 200" className="h-full w-full" aria-hidden="true">
        <path d="M40 150 C 110 150 130 70 200 70 S 280 30 300 30" fill="none" stroke="var(--color-action-primary)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="150" r="7" fill={stage >= 1 ? 'var(--color-action-primary)' : '#fff'} stroke="var(--color-action-primary)" strokeWidth="2" />
        <circle cx="200" cy="70" r="7" fill={stage >= 2 ? 'var(--color-action-primary)' : '#fff'} stroke="var(--color-action-primary)" strokeWidth="2" />
        <circle cx="300" cy="30" r="7" fill="#fff" stroke="var(--color-action-primary)" strokeWidth="2" />
        <g transform={`translate(${truck.x},${truck.y})`}>
          <circle cx="0" cy="0" r="14" fill="var(--color-text-primary)" />
          <text x="0" y="5" textAnchor="middle" fontSize="13" fill="#fff">
            ▶
          </text>
        </g>
      </svg>
      <span className="absolute left-[12px] top-[12px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] px-[10px] py-[4px] text-label-12 text-[var(--color-text-primary)]">
        Objazd +{detourKm} km{buffer != null ? ` · bufor ${dur(buffer)}` : ''}
      </span>
    </div>
  );
}
