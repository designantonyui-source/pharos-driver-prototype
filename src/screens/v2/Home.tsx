import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getLoads } from '../../lib/api';
import { useStore } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../../components/Icon';
import { V2Frame } from '../../components/v2/V2Frame';
import { LoadSheet } from '../../components/v2/LoadSheet';
import { ApplicationBanner } from '../../components/v2/ApplicationBanner';
import { SmartLoadList } from '../../components/v2/SmartLoadList';

/**
 * v2 · Home — unified list/map «Loads» (route `/v2`). Replaces search → list → map → details → review with ONE screen.
 * props: none (state from `useStore`, data from `api.getLoads`)
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-action-primary, color-action-text-inverse,
 *         color-border-default, radius-lg, radius-pill, shadow-card
 * epic: pharos-driver-flow-stories.md — S2 (tile → sheet), S4 (CTA), S6/S7 (banner + status), S8 (two deadlines)
 *
 * No form first: the feed is already there; direction + three quick filters narrow it. Applying is one tap and the
 * driver stays on the current view with a live banner. Status moves with the Demo panel (→ dispatcher approved, → confirmed).
 */
const FILTERS = [
  { id: 'today', label: 'Today', test: (l: V2Load) => l.day === 'today' },
  { id: 'rate', label: '€3+/km', test: (l: V2Load) => l.perKm >= 3 },
  { id: 'near', label: 'Under 30 km', test: (l: V2Load) => l.pickupKm < 30 },
] as const;

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get('scenario');
  const scenarioSearch = scenario === 'reject' || scenario === 'approve' ? `?scenario=${scenario}` : '';
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);
  const [on, setOn] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getLoads().then(setLoads);
  }, []);

  const visible = useMemo(
    () => (loads ?? []).filter((l) => FILTERS.every((f) => !on.includes(f.id) || f.test(l))),
    [loads, on],
  );
  const applied = loads?.find((l) => l.id === state.loadId) ?? null;
  const status = state.status;
  const open = loads?.find((l) => l.id === openId) ?? null;

  const toggle = (id: string) => setOn((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-[70px] bottom-[117px] z-20 flex flex-col gap-[8px] px-[16px]">
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] shadow-[var(--shadow-card)]">
          <span className="flex items-center gap-[8px] text-[var(--color-text-primary)]">
            <Icon name="map-pin" className="text-[var(--color-action-primary)]" />
            <span className="flex flex-col">
              <span className="text-caption-12 text-[var(--color-text-secondary)]">Loads towards</span>
              <span className="text-heading-14">{state.route.to.trim() || 'Brussels'}</span>
            </span>
          </span>
          <span className="text-label-12 text-[var(--color-text-secondary)]">
            {loads ? `${visible.length} loads` : 'Searching…'}
          </span>
        </div>

        <div className="flex shrink-0 gap-[8px]">
          {FILTERS.map((f) => {
            const sel = on.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                aria-pressed={sel}
                className={`h-[36px] rounded-[var(--radius-pill)] border px-[14px] text-label-14 shadow-[var(--shadow-card)] ${
                  sel
                    ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {applied && status && <ApplicationBanner load={applied} status={status} onOpen={() => navigate(`/application/${applied.id}${scenarioSearch}`)} />}

        <SmartLoadList
          loads={visible}
          loading={loads === null}
          currentRoute={{ from: state.route.from, to: state.route.to.trim() || 'Brussels' }}
          onOpen={(load) => setOpenId(load.id)}
        />
      </div>

      {open && (
        <LoadSheet
          load={open}
          open
          onClose={() => setOpenId(null)}

        />
      )}
    </V2Frame>
  );
}
