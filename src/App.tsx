import { Link, Route, Routes } from 'react-router-dom';
import { DemoPanel } from './components/DemoPanel';
import { Search } from './screens/Search';

/**
 * Screen index — every Figma screen gets a route here.
 * See design/figma-map.md for the node-id <-> route table.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
    </Routes>
  );
}

function Index() {
  const screens = [
    ['/search', 'Loads — first search (setup)'],
    ['/loads', 'Loads — list'],
    ['/map', 'Loads — map (peek / full sheet)'],
    ['/load/:id', 'Load details v2 (Send application)'],
    ['/loads?applied=:id', 'Loads with “Application in progress” banner'],
    ['/application/:id', 'Application status (2 stepper states)'],
    ['/trip/:id', 'Trip TR-4821'],
  ] as const;
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <h1 className="text-[24px] font-semibold">Pharos Driver — prototype</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
        Happy path: list → load → send application → banner → status → trip.
      </p>
      <ul className="mt-6 space-y-2">
        {screens.map(([to, label]) => (
          <li key={to}>
            <Link className="text-[var(--color-action-primary)] underline" to={to.replace(':id', 'nordcargo')}>
              {label}
            </Link>
            <span className="ml-2 text-[12px] text-[var(--color-text-tertiary)]">{to}</span>
          </li>
        ))}
      </ul>
      <DemoPanel />
    </div>
  );
}
