import { Button, ButtonLink } from './Button';
import { FilterChip } from './FilterChip';
import { Icon } from './Icon';
import { Input } from './Input';

/**
 * figma: 340:404 · Pharos/Route search + filters — COMPONENT_SET, 3 variants (18 instances)
 *   State=Closed `340:207` (1112x128) · State=Expanded `340:241` (1112x386)
 *   State=Applied `340:355` (1112x128)
 * props: state, origin, destination, resultCount, onFindLoads, onToggleFilters, onReset
 *
 *   Where it lives. All 18 instances are on page 21 (`D01`…`D09*`, 1440x900 `Workspace` frames)
 *   and every one is 1112 wide — this is the DESKTOP workspace bar, not the phone sticky bar of
 *   page 30 (that one is `Search controls v2 / sticky bar` `2668:14779`, 402x64, and it is built
 *   from `Pharos/Filters button` + `Pharos/App/View switch`, not from this component).
 *   There are no instances of 340:404 inside the 402x874 driver screens.
 *
 *   Root: VERTICAL, pad 0, gap 12, MIN/MIN. Closed and Applied are 76 + 12 + 40 = 128;
 *   Expanded adds the 246-tall Filter panel: 128 + 12 + 246 = 386.
 *
 *   `RouteSearchBar` — the Figma instance `116:23` of `Pharos/Route search` (`203:395`, a
 *   separate set with State=Closed / Origin / Destination). HORIZONTAL, pad 0, gap 16,
 *   MIN/**MAX** (bottom-aligned), FIXED/FIXED 1112x76. Origin `116:20` and Destination `116:21`
 *   are `Pharos/Input` Size=Mobile State=Filled instances, each `layoutGrow 1`, 460 wide =
 *   (1112 - 2*16 - 160) / 2; the Search action `116:22` is a `Pharos/Button` Primary/Mobile/
 *   Default instance fixed at 160x48 sitting at y 28 (bottom-aligned).
 *   Both inputs have `Show hint = false` (76 tall) and `input/bg/transparent`; `Input` paints
 *   `color/bg/surface` instead, which is the same pixel on the workspace's white surface.
 *   Labels are split by the layer: "Current location" 108 wide and "Direction" 61, values
 *   DM Sans Regular 14/20 #172a35 with a 20x20 `Lucide/Icon/Map pin`.
 *
 *   `FilterSummary` — `340:235` (Closed) / `340:269` (Expanded) / `340:383` (Applied), all
 *   1112x40 HORIZONTAL gap 12 SPACE_BETWEEN/CENTER. Left is the active-filter row, right the
 *   `Result and reset` frame. Closed shows one `Pharos/Filter chip` State=Default "Filters" (67)
 *   plus "2 loads". Expanded swaps it for State=Selected "Hide filters" (98) and hides the
 *   Reset button (`340:275`, `visible = false`). Applied shows six selected chips — "Filters" 67,
 *   "Curtainsider" 108, "Today" 66, "up to 12.4 t" 98, "up to 18 pallets" 125, "300–400 €" 106,
 *   gap 8, total 610 — and the Reset `Button link` Size=Web (`168:56`) fixed at 104x40.
 *   Only the Applied row carries a fill (`color/bg/surface`); the other two are transparent.
 *
 *   `FilterPanel` — `340:282`, 1112x246, pad 24, gap 16, radius 16, fill color/bg/surface,
 *   1px INSIDE color/border/default. `strokesIncludedInLayout`: 24 + 20 + 16 + 76 + 16 + 68 + 24
 *   = 244, plus the two 1px stroke rows = the 246 Figma reports.
 *     "Choose load search criteria" — DM Sans Medium 14/20, color/text/primary, 182x20.
 *     "Vehicle and cargo" `340:297` 1062x76 gap 16: four `layoutGrow 1` columns of 253.5
 *       — `Select / Body type` (`344:388`, 253.5x76) and three `Pharos/Input` Size=**Web**
 *       State=Empty instances (`340:298`, `340:311`, `340:322`), 253.5x68 = 20 label + 8 + 40.
 *     "Rates and special conditions" `368:49` 1062x68 gap 16: `Rate range` `374:347` 523x68
 *       gap 8 with two 257.5-wide Web inputs, and `Special conditions` `368:50` 523x68 gap 8
 *       holding the 122x20 label plus a 311x40 chip row (`340:292`, gap 8) with two
 *       `Pharos/Filter chip` State=Default instances: "ADR · dangerous goods" 178 and
 *       "LTL · part loads" 125.
 *
 *   `SelectField` below is a stand-in for `Pharos/Select` `344:51`, which is a separate library
 *   component owned by another wave. Only the one State=Closed variant this set needs is drawn:
 *   20px label + 8 + a 48px control with `SPACE_BETWEEN`, value "Any" at x 13 and a 16x16
 *   `Chevron down` (`344:30`) whose vector is 8x4 at 1.3333px — i.e. the lucide glyph at 16px.
 *
 * tokens: color-bg-surface, color-border-strong, color-border-default, color-text-primary,
 *         color-text-secondary, radius-sm, radius-lg, text-label-14, text-body-14,
 *         size-control-mobile, size-control-web
 * TODO(component): `Pharos/Select` `344:51` and `Pharos/Route search` `203:395` are not ported
 *   as standalone components; their geometry lives in the two sub-blocks below.
 * TODO(token): none — every value above resolves to an existing token.
 */
export type RouteSearchState = 'closed' | 'expanded' | 'applied';

type Field = { label: string; value: string };

/** Figma's master instance values (`116:20` / `116:21`); the page-21 instances are localised. */
const DEFAULT_ORIGIN: Field = { label: 'Current location', value: 'Lille, France' };
const DEFAULT_DESTINATION: Field = { label: 'Direction', value: 'Brussels, Belgium' };

/** `340:384` — the six chips the Applied variant draws, at their measured widths. */
const APPLIED_FILTERS = ['Filters', 'Curtainsider', 'Today', 'up to 12.4 t', 'up to 18 pallets', '300–400 €'];

/**
 * `344:26` State=Closed · Select / Body type `344:388` — see TODO(component) in the header.
 * label 20 + gap 8 + control 48 = the 76 the panel row measures.
 */
export function SelectField({
  label,
  value,
  onClick,
  className,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex w-full flex-col gap-[8px] ${className ?? ''}`}>
      <span className="flex h-[20px] items-center">
        <span className="text-label-14 text-[var(--color-text-primary)]">{label}</span>
      </span>
      <button
        type="button"
        onClick={onClick}
        className="flex h-[var(--control-h)] w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-[12px]"
      >
        <span className="text-body-14 text-[var(--color-text-primary)]">{value}</span>
        <Icon name="chevron-down" size={16} className="text-[var(--color-text-secondary)]" />
      </button>
    </div>
  );
}

/** `116:23` · the search row of `Pharos/Route search` — 1112x76, gap 16, bottom-aligned. */
export function RouteSearchBar({
  origin = DEFAULT_ORIGIN,
  destination = DEFAULT_DESTINATION,
  onFindLoads,
}: {
  origin?: Field;
  destination?: Field;
  onFindLoads?: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_160px] items-end gap-[16px]">
      <Input label={origin.label} value={origin.value} hint={null} />
      <Input label={destination.label} value={destination.value} hint={null} />
      <div className="h-[var(--control-h)]">
        <Button label="Find loads" onClick={onFindLoads} />
      </div>
    </div>
  );
}

/** `340:282` · the Expanded filter panel — 1112x246, pad 24, gap 16. */
function FilterPanel() {
  return (
    <div className="flex w-full flex-col gap-[16px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[24px]">
      <span className="text-label-14 text-[var(--color-text-primary)]">
        Choose load search criteria
      </span>

      <div className="grid grid-cols-4 items-start gap-[16px]">
        <SelectField label="Body type" value="Any" />
        <Input label="Pickup date" placeholder="Any date" state="empty" size="web" hint={null} icon={false} />
        <Input label="Max. cargo weight, t" placeholder="Not set" state="empty" size="web" hint={null} icon={false} />
        <Input label="Max. pallets" placeholder="Not set" state="empty" size="web" hint={null} icon={false} />
      </div>

      <div className="grid grid-cols-2 items-start gap-[16px]">
        <div className="grid grid-cols-2 items-start gap-[8px]">
          <Input label="Min. rate, €" placeholder="Not set" state="empty" size="web" hint={null} icon={false} />
          <Input label="Max. rate, €" placeholder="Not set" state="empty" size="web" hint={null} icon={false} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-label-14 text-[var(--color-text-primary)]">Special conditions</span>
          <div className="flex h-[40px] items-center gap-[8px]">
            <FilterChip label="ADR · dangerous goods" />
            <FilterChip label="LTL · part loads" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** `340:235` / `340:269` / `340:383` · chips on the left, result count and Reset on the right. */
function FilterSummary({
  state,
  resultCount,
  onToggleFilters,
  onReset,
}: {
  state: RouteSearchState;
  resultCount: string;
  onToggleFilters?: () => void;
  onReset?: () => void;
}) {
  const applied = state === 'applied';
  const expanded = state === 'expanded';

  return (
    <div
      className={`flex h-[40px] w-full items-center justify-between gap-[12px] ${
        applied ? 'bg-[var(--color-bg-surface)]' : ''
      }`}
    >
      <div className="flex items-center gap-[8px]">
        <FilterChip
          label={expanded ? 'Hide filters' : 'Filters'}
          selected={expanded || applied}
          onClick={onToggleFilters}
        />
        {applied &&
          APPLIED_FILTERS.slice(1).map((filter) => (
            <FilterChip key={filter} label={filter} selected onClick={onReset} />
          ))}
      </div>

      <div className="flex h-[40px] items-center gap-[12px]">
        <span className="text-label-14 text-[var(--color-text-secondary)]">{resultCount}</span>
        {applied && (
          /* `340:399` is a `Pharos/Button link` Size=Web instance FIXED at 104x40 */
          <span className="block w-[104px]">
            <ButtonLink label="Reset" size="web" onClick={onReset} />
          </span>
        )}
      </div>
    </div>
  );
}

export function RouteSearch({
  state = 'closed',
  origin = DEFAULT_ORIGIN,
  destination = DEFAULT_DESTINATION,
  resultCount = '2 loads',
  onFindLoads,
  onToggleFilters,
  onReset,
  className,
}: {
  state?: RouteSearchState;
  origin?: Field;
  destination?: Field;
  /** Figma's `Result count` layer (`340:240` / `340:274` / `340:398`), DM Sans Medium 14/20 */
  resultCount?: string;
  onFindLoads?: () => void;
  onToggleFilters?: () => void;
  onReset?: () => void;
  /** the set is FIXED at 1112 wide; pass the container width (the workspace reserves 1160) */
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-[12px] ${className ?? ''}`}>
      <RouteSearchBar origin={origin} destination={destination} onFindLoads={onFindLoads} />
      <FilterSummary
        state={state}
        resultCount={resultCount}
        onToggleFilters={onToggleFilters}
        onReset={onReset}
      />
      {state === 'expanded' && <FilterPanel />}
    </div>
  );
}
