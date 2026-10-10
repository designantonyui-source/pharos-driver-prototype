import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BlFrame, BlSheet } from '../../components/bl/BlFrame';
import { getBlOrders } from '../../lib/api';
import {
  blockOf,
  check,
  dur,
  eurPerKm,
  hm,
  isProfitable,
  netOf,
  reqBlock,
  tm,
  type BlOrder,
} from '../../lib/bl/logic';
import { bl, ctxOf, useBl } from '../../lib/bl/state';

/**
 * Backload (PL) · Zlecenia po drodze — list (route `/bl/list`) with details sheet and booking (spec §7.5–7.7).
 * Groups: free, not free (blocked by rule or time, with the reason on the card), taken (last, dimmed).
 * props: none. tokens: color-bg-surface, color-status-success-*, color-status-danger-*, color-action-primary, radius-lg
 */
export function BlList() {
  const s = useBl();
  const nav = useNavigate();
  const [orders, setOrders] = useState<BlOrder[] | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [bookedNow, setBookedNow] = useState<BlOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(60);

  useEffect(() => {
    getBlOrders().then(setOrders);
  }, []);

  const ctx = ctxOf(s);
  const search = s.search;
  const onlyProfitable = search?.onlyProfitable ?? true;

  const groups = useMemo(() => {
    const visible = (orders ?? []).filter((o) => o.detourKm <= radius && (!onlyProfitable || isProfitable(o)));
    const byRate = (a: BlOrder, b: BlOrder) => eurPerKm(b) - eurPerKm(a);
    const taken = visible.filter((o) => s.takenIds.includes(o.id));
    const rest = visible.filter((o) => !s.takenIds.includes(o.id));
    const free = rest.filter((o) => !blockOf(o, ctx, s.takenIds, s.offline, s.booked != null)).sort(byRate);
    const blocked = rest.filter((o) => blockOf(o, ctx, s.takenIds, s.offline, s.booked != null)).sort(byRate);
    return { free, blocked, taken };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, radius, onlyProfitable, s.clock, s.trip, s.search, s.profile, s.takenIds, s.offline, s.booked]);

  if (!s.registered) return <Navigate to="/bl/start" replace />;

  const open = orders?.find((o) => o.id === openId) ?? null;
  const openBlock = open ? blockOf(open, ctx, s.takenIds, s.offline, s.booked != null) : null;
  const openCheck = open ? check(open, ctx) : null;

  return (
    <BlFrame
      active="search"
      nav={{ title: "Zlecenia po drodze", back: "/bl/search" }}
      sheet={
        open && !bookedNow ? (
          <BlSheet onClose={() => setOpenId(null)}>
            <div className="flex items-start justify-between gap-[12px]">
              <div className="flex flex-col gap-[2px]">
                <h2 className="text-heading-20 text-[var(--color-text-primary)]">
                  {open.from} → {open.to}
                </h2>
                <span className="text-caption-12 text-[var(--color-text-secondary)]">
                  {open.cargo} · {open.weight}
                </span>
              </div>
              <span className="text-rate-24 text-[var(--color-action-primary)]">€{open.payout}</span>
            </div>

            <div
              className={`rounded-[var(--radius-sm)] p-[12px] text-body-14 ${
                isProfitable(open)
                  ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
                  : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'
              }`}
            >
              +{open.detourKm} km objazdu · €{eurPerKm(open).toFixed(2)}/km · po opłatach drogowych zostanie €{netOf(open)}
            </div>

            {openBlock && (
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-status-danger-bg)] p-[12px] text-body-14 text-[var(--color-status-danger-text)]">
                {openBlock.msg}
              </div>
            )}

            <div className="flex flex-wrap gap-[6px] text-label-12">
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-text-primary)] px-[10px] py-[4px] text-[var(--color-action-text-inverse)]">
                Rozładunek ✓
              </span>
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-bg-subtle)] px-[10px] py-[4px] text-[var(--color-text-secondary)]">
                Załadunek {tm(open.pickupAt)}
              </span>
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-success-bg)] px-[10px] py-[4px] text-[var(--color-status-success-text)]">
                Główny załadunek
              </span>
            </div>
            {openCheck?.buffer != null && (
              <span className="text-caption-12 text-[var(--color-text-secondary)]">Bufor do terminu: {dur(openCheck.buffer)}</span>
            )}

            <div className="flex flex-col gap-[4px] rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px]">
              <span className="text-label-12 text-[var(--color-text-secondary)]">Warunki anulowania</span>
              <span className="text-body-14 text-[var(--color-text-primary)]">
                Za darmo do {tm(open.cancelFreeUntil)}, potem €{open.cancelPenalty}
              </span>
            </div>

            {error && <span className="text-caption-12 text-[var(--color-status-danger-text)]">{error}</span>}

            <button
              type="button"
              disabled={Boolean(openBlock)}
              onClick={() => {
                const err = bl.book(open.id);
                if (err) return setError(err);
                setError(null);
                setBookedNow(open);
              }}
              className={`h-[50px] rounded-[var(--radius-sm)] text-label-14 ${
                openBlock
                  ? 'bg-[var(--color-bg-disabled)] text-[var(--color-action-text-disabled)]'
                  : 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
              }`}
            >
              Zarezerwuj
            </button>
          </BlSheet>
        ) : bookedNow ? (
          <BlSheet onClose={() => nav('/bl')}>
            <span className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--color-status-success-bg)] text-[28px] text-[var(--color-status-success-text)]">
              ✓
            </span>
            <h2 className="text-center text-heading-20 text-[var(--color-text-primary)]">Zarezerwowano!</h2>
            <span className="text-center text-body-14 text-[var(--color-text-secondary)]">
              Zlecenie nr {bookedNow.id} · {bookedNow.from} → {bookedNow.to}
            </span>
            <div className="flex flex-col gap-[8px]">
              <span className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14">
                CMR zapisany offline — pokażemy przy załadunku
              </span>
              <span className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14">
                Załadunek {hm(bookedNow.pickupAt)}
                {check(bookedNow, ctx).buffer != null ? ` · bufor ${dur(check(bookedNow, ctx).buffer as number)}` : ''}
              </span>
              <span className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14">
                Objazd +{bookedNow.detourKm} km już w trasie
              </span>
            </div>
            <button
              type="button"
              onClick={() => nav('/bl/route')}
              className="h-[50px] rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
            >
              Otwórz trasę
            </button>
          </BlSheet>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-[12px] pt-[4px]">
        
        <span className="text-caption-12 text-[var(--color-text-secondary)]">
          {search?.deadlineH ? `${search.city} · za ${search.deadlineH} godz.` : 'Wszystkie zlecenia po drodze, bez sprawdzania czasu'}
          {!s.trip ? ' · bez kursu' : ''}
        </span>

        {s.offline && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-status-warning-bg)] p-[12px] text-label-12 text-[var(--color-status-warning-text)]">
            Zlecenia z pamięci. Rezerwacja bez sieci niedostępna.
          </div>
        )}

        <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] shadow-[var(--shadow-card)]">
          <span className="text-label-14 text-[var(--color-text-primary)]">Odchylenie od trasy: do {radius} km</span>
          <div className="flex gap-[6px]">
            <button type="button" aria-label="Zmniejsz promień" onClick={() => setRadius((r) => Math.max(10, r - 10))} className="h-[36px] w-[36px] rounded-[var(--radius-pill)] bg-[var(--color-bg-subtle)] text-label-14">
              −
            </button>
            <button type="button" aria-label="Zwiększ promień" onClick={() => setRadius((r) => Math.min(100, r + 10))} className="h-[36px] w-[36px] rounded-[var(--radius-pill)] bg-[var(--color-bg-subtle)] text-label-14">
              +
            </button>
          </div>
        </div>

        {!orders && <span className="text-body-14 text-[var(--color-text-secondary)]">Szukamy zleceń…</span>}

        {orders && groups.free.length + groups.blocked.length + groups.taken.length === 0 && (
          <div className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-center shadow-[var(--shadow-card)]">
            <span className="text-heading-14 text-[var(--color-text-primary)]">Brak zleceń w promieniu {radius} km</span>
            <button type="button" onClick={() => setRadius((r) => Math.min(100, r + 25))} className="text-label-14 text-[var(--color-action-primary)]">
              Poszerz promień +25 km
            </button>
            <Link to="/bl/search" className="text-label-14 text-[var(--color-action-primary)]">
              Zmień wyszukiwanie
            </Link>
          </div>
        )}

        {groups.free.map((o) => (
          <OrderCard key={o.id} order={o} ctx={ctx} takenIds={s.takenIds} offline={s.offline} hasBooking={s.booked != null} onOpen={() => setOpenId(o.id)} />
        ))}

        {groups.blocked.length > 0 && <span className="pt-[4px] text-label-12 text-[var(--color-text-secondary)]">Nie możesz wziąć</span>}
        {groups.blocked.map((o) => (
          <OrderCard key={o.id} order={o} ctx={ctx} takenIds={s.takenIds} offline={s.offline} hasBooking={s.booked != null} onOpen={() => setOpenId(o.id)} />
        ))}

        {groups.taken.length > 0 && <span className="pt-[4px] text-label-12 text-[var(--color-text-secondary)]">Zajęte przez innych</span>}
        {groups.taken.map((o) => (
          <OrderCard key={o.id} order={o} ctx={ctx} takenIds={s.takenIds} offline={s.offline} hasBooking={s.booked != null} onOpen={() => setOpenId(o.id)} dim />
        ))}
      </div>
    </BlFrame>
  );
}

function OrderCard({
  order: o,
  ctx,
  takenIds,
  offline,
  hasBooking,
  onOpen,
  dim,
}: {
  order: BlOrder;
  ctx: ReturnType<typeof ctxOf>;
  takenIds: number[];
  offline: boolean;
  hasBooking: boolean;
  onOpen: () => void;
  dim?: boolean;
}) {
  const block = blockOf(o, ctx, takenIds, offline, hasBooking);
  const rq = reqBlock(o, ctx.profile);
  const ch = check(o, ctx);
  const profitable = isProfitable(o);
  const reason = takenIds.includes(o.id) ? 'zajęte' : rq?.short ?? (ch.conflict ? 'nie zdążysz' : null);

  return (
    <article className={`flex flex-col gap-[10px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)] ${dim ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-heading-14 text-[var(--color-text-primary)]">
            {o.from} → {o.to}
          </span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">
            {o.cargo} · {o.weight}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-rate-24 text-[var(--color-action-primary)]">€{o.payout}</span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">netto €{netOf(o)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[6px]">
        <span
          className={`rounded-[var(--radius-pill)] px-[10px] py-[4px] text-label-12 ${
            profitable
              ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
              : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'
          }`}
        >
          +{o.detourKm} km · €{eurPerKm(o).toFixed(2)}/km
        </span>
        {o.reqs.map((r) => (
          <span key={r} className="rounded-[var(--radius-pill)] bg-[var(--color-bg-subtle)] px-[10px] py-[4px] text-label-12 text-[var(--color-text-secondary)]">
            {r}
          </span>
        ))}
        {reason && (
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-danger-bg)] px-[10px] py-[4px] text-label-12 text-[var(--color-status-danger-text)]">{reason}</span>
        )}
      </div>

      <span className="text-caption-12 text-[var(--color-text-secondary)]">
        Odbiór {hm(o.pickupAt)} · dostawa {hm(o.dropAt)}
      </span>

      <div className="flex items-center justify-between">
        <span className="text-caption-12 text-[var(--color-text-secondary)]">
          ★ {o.shipperRating} · {o.shipperJobs} zleceń
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="h-[44px] rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] px-[16px] text-label-14 text-[var(--color-action-text-inverse)]"
        >
          Szczegóły
        </button>
      </div>
      {block && !reason && <span className="text-caption-12 text-[var(--color-status-danger-text)]">{block.msg}</span>}
    </article>
  );
}
