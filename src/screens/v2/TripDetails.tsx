import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { V2Frame } from '../../components/v2/V2Frame';
import { getLoads } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';

/**
 * figma: prototype-led · TripDetails — confirmed load itinerary; route /trip/:id
 * props: load (view); route id and global application state (screen)
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, color-status-success-bg, color-status-success-text, radius-lg, shadow-card
 */
export function TripDetailsView({ load }: { load: V2Load }) {
  const stops = [
    { label: 'Pickup', city: load.from, day: load.day, window: load.window },
    { label: 'Delivery', city: load.to, day: load.deliveryDay, window: load.deliveryWindow },
  ];

  return (
    <V2Frame active="Trips">
      <div className="absolute inset-x-0 top-[70px] bottom-[117px] flex flex-col px-[16px]">
        <header className="flex shrink-0 items-center gap-[12px] py-[8px]">
          <Link to={`/application/${load.id}`} aria-label="Back to application" className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">
            <Icon name="chevron-left" />
          </Link>
          <h1 className="text-heading-20 text-[var(--color-text-primary)]">Trip details</h1>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto pb-[12px]">
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)]" aria-label="Trip summary">
            <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-status-success-bg)] px-[8px] py-[4px] text-label-12 text-[var(--color-status-success-text)]">Confirmed</span>
            <p className="mt-[12px] text-heading-32 text-[var(--color-text-primary)]">€{load.rate}</p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">{load.km} km loaded · {load.paidIn}</p>
          </section>

          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)]">
            <h2 className="text-heading-20 text-[var(--color-text-primary)]">Route</h2>
            <ol className="mt-[16px] flex flex-col gap-[16px]" aria-label="Route stops">
              {stops.map((stop) => (
                <li key={stop.label} className="flex items-start gap-[12px]">
                  <span className="mt-[4px] text-[var(--color-action-primary)]"><Icon name="map-pin" /></span>
                  <div>
                    <p className="text-label-12 text-[var(--color-text-secondary)]">{stop.label}</p>
                    <p className="mt-[4px] text-heading-20 text-[var(--color-text-primary)]">{stop.city}</p>
                    <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">{stop.day === 'today' ? 'Today' : 'Tomorrow'} · {stop.window}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)]">
            <h2 className="text-label-14 text-[var(--color-text-secondary)]">Customer</h2>
            <p className="mt-[8px] text-heading-20 text-[var(--color-text-primary)]">{load.company}</p>
            <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">Customer rating: {load.rating.toFixed(1)} / 5</p>
          </section>
        </main>

        <div className="flex shrink-0 flex-col gap-[8px] py-[8px]">
          <Button label="Navigation" icon={<Icon name="map-pin" />} onClick={() => window.alert('Navigation is not connected in this demo.')} />
          <Button label="Documents" appearance="secondary" onClick={() => window.alert('Trip documents are not connected in this demo.')} />
        </div>
      </div>
    </V2Frame>
  );
}

export function TripDetails() {
  const { id = '' } = useParams();
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);

  useEffect(() => {
    let active = true;
    getLoads().then((items) => { if (active) setLoads(items); });
    return () => { active = false; };
  }, []);

  const load = loads?.find((item) => item.id === id);
  if (load && state.loadId === id && state.status === ApplicationStatus.CONFIRMED) {
    return <TripDetailsView load={load} />;
  }

  return (
    <V2Frame active="Trips">
      <main className="absolute inset-x-0 top-[96px] px-[16px]">
        <h1 className="text-heading-20 text-[var(--color-text-primary)]">Trip details</h1>
        <p role="status" className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-secondary)]">{loads === null ? 'Loading trip…' : 'No confirmed trip is available for this load.'}</p>
        <Link to="/v2" className="mt-[16px] inline-flex text-label-14 text-[var(--color-action-primary)] underline">Back to loads</Link>
      </main>
    </V2Frame>
  );
}
