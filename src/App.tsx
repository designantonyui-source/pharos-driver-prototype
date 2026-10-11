import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { DemoPanel } from './components/DemoPanel';
import { Search } from './screens/Search';
import { Home as HomeV2 } from './screens/v2/Home';
import { ApplicationTracker } from './screens/v2/ApplicationTracker';
import { TripDetails } from './screens/v2/TripDetails';
import { DemoToggle } from './components/v2/DemoToggle';
import { Account, EditContact } from './screens/v2/Account';
import { DismissedLoads } from './screens/v2/DismissedLoads';
import { Balance, BalanceHistory, CashOut, PayoutMethodScreen } from './screens/v2/Balance';
import { InvoiceDetails, InvoiceList } from './screens/v2/Invoices';
import { Schedules } from './screens/v2/Schedules';
import { Trips } from './screens/v2/Trips';
import { BlHome } from './screens/bl/Home';
import { BlStart } from './screens/bl/Start';
import { BlSearch } from './screens/bl/Search';
import { BlList } from './screens/bl/List';
import { BlRoute } from './screens/bl/Route';
import { BlProfile } from './screens/bl/Profile';

/**
 * Screen index — every Figma screen gets a route here.
 * See design/figma-map.md for the node-id <-> route table.
 * `/v2/*` is the simplified driver journey (design/DRIVER-FLOWS.md); the Figma-measured screens stay untouched.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
      <Route
        path="/v2"
        element={
          <>
            <HomeV2 />
            <DemoToggle />
          </>
        }
      />
      <Route path="/application/:id" element={<ApplicationTracker />} />
      <Route path="/trip/:id" element={<TripDetails />} />
      <Route path="/v2/trips" element={<Trips />} />
      <Route path="/v2/account" element={<Account />} />
      <Route path="/v2/account/profile" element={<Account detail />} />
      <Route path="/v2/account/profile/edit" element={<EditContact />} />
      <Route path="/v2/account/dismissed" element={<DismissedLoads />} />
      <Route path="/v2/account/balance" element={<Balance />} />
      <Route path="/v2/account/balance/method" element={<PayoutMethodScreen />} />
      <Route path="/v2/account/balance/cashout" element={<CashOut />} />
      <Route path="/v2/account/balance/history" element={<BalanceHistory />} />
      <Route path="/v2/account/balance/invoices" element={<InvoiceList />} />
      <Route path="/v2/account/balance/invoices/:id" element={<InvoiceDetails />} />
      <Route path="/v2/account/balance/schedules" element={<Schedules />} />
      <Route path="/bl" element={<BlHome />} />
      <Route path="/bl/start" element={<BlStart />} />
      <Route path="/bl/search" element={<BlSearch />} />
      <Route path="/bl/list" element={<BlList />} />
      <Route path="/bl/route" element={<BlRoute />} />
      <Route path="/bl/profile" element={<BlProfile />} />
      <Route path="*" element={<Navigate to="/v2" replace />} />
    </Routes>
  );
}

function Index() {
  const screens = [
    ['/v2', 'NEW · Loads — map-first home (apply in one tap)'],
    ['/v2/account/balance', 'NEW · Balance — available/pending, cash out, IBAN, history'],
    ['/v2/account/balance/schedules', 'NEW · Auto-withdraw — schedules, runs, statement'],
    ['/search', 'Loads — first search (setup)'],
    ['/application/nordcargo', 'Application status tracker'],
    ['/trip/nordcargo', 'Confirmed trip details'],
    ['/bl', 'Backloads'],
  ] as const;
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <h1 className="text-[24px] font-semibold">Pharos Driver — prototype</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
        Driver flow: loads list/map → quick apply → application status → back to loads.
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
