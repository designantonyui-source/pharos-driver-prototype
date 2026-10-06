import type { Meta, StoryObj } from '@storybook/react-vite';
import { BottomSheet, BottomSheetHeader, SheetHint, VehicleMatchingLine } from './BottomSheet';
import { RouteFields, EMPTY_CITY } from './RouteFields';
import { SuggestionCard } from './SuggestionCard';
import { SheetField } from './SheetField';
import { SortBy } from './SortBy';
import { TripChecklist } from './TripChecklist';
import { Button, ButtonLink } from './Button';
import { Input } from './Input';

/**
 * All 13 variants of `Pharos/Bottom sheet` (2197:8841), one story each, named after the
 * Figma `Content` + `State` combination. Geometry is pinned per variant by the Figma dump —
 * see design/PORT-LOG.md §4.5 for the measured numbers.
 */
const meta = {
  title: 'Components/BottomSheet',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex h-[var(--screen-h)] w-[var(--screen-w)] flex-col justify-end overflow-hidden bg-[var(--color-bg-canvas)]">
    {children}
  </div>
);

// ── Content=Route ────────────────────────────────────────────────────────────

/** 2197:7919 · 402x406 · pad 12/24/34/24 */
export const RouteFilled: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields />
        <VehicleMatchingLine on={false} />
        <Button label="Show loads" />
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:7975 · 402x406 · Input + `Current selection` + card + button, with a 32px gap before the button */
export const OriginCurrent: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Where are you starting?" />
        <Input label="City" placeholder="Start typing a city" hint={null} icon={false} />
        <p className="h-[16px] w-full shrink-0 text-label-12 text-[var(--color-text-secondary)]">Current selection</p>
        <SuggestionCard title="Lille" subtitle="France" actionLabel="Select Lille" />
        {/* the flow states use a 32px gap before the button: the 16px container gap + this 16px wrapper */}
        <div className="shrink-0 mt-[16px]"><Button label="Select Lille" /></div>
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8028 · 402x406 */
export const DestinationCurrent: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Where are you going?" />
        <Input label="City" placeholder="Start typing a city" hint={null} icon={false} />
        <p className="h-[16px] w-full shrink-0 text-label-12 text-[var(--color-text-secondary)]">Current selection</p>
        <SuggestionCard title="Brussels" subtitle="Belgium" actionLabel="Select Brussels" />
        {/* the flow states use a 32px gap before the button: the 16px container gap + this 16px wrapper */}
        <div className="shrink-0 mt-[16px]"><Button label="Select Brussels" /></div>
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8081 · 402x454 */
export const RouteFilledVehicle: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields />
        <VehicleMatchingLine on />
        <Button label="Show loads" />
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8167 · 402x454 · both cities empty -> `Hint` line appears and the button is disabled */
export const RouteEmpty: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields from={EMPTY_CITY} to={EMPTY_CITY} />
        <VehicleMatchingLine on={false} />
        <SheetHint />
        <Button label="Show loads" disabled />
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8091+ · 402x454 · the same frame as RouteFilled, one row from Figma `Route origin selected` */
export const RouteOriginSelected: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields from="Lille, France" to={EMPTY_CITY} />
        <VehicleMatchingLine on={false} />
        <Button label="Show loads" disabled />
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8277 · 402x454 · caption is `Suggestions`, not `Current selection` */
export const OriginSuggestions: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Where are you starting?" />
        <Input label="City" placeholder="Start typing a city" hint={null} icon={false} />
        <p className="h-[16px] w-full shrink-0 text-label-12 text-[var(--color-text-secondary)]">Suggestions</p>
        <SuggestionCard title="Lille" subtitle="France" actionLabel="Select Lille" />
        {/* the flow states use a 32px gap before the button: the 16px container gap + this 16px wrapper */}
        <div className="shrink-0 mt-[16px]"><Button label="Select Lille" /></div>
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8330 · 402x454 */
export const DestinationSuggestions: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Where are you going?" />
        <Input label="City" placeholder="Start typing a city" hint={null} icon={false} />
        <p className="h-[16px] w-full shrink-0 text-label-12 text-[var(--color-text-secondary)]">Suggestions</p>
        <SuggestionCard title="Brussels" subtitle="Belgium" actionLabel="Select Brussels" />
        {/* the flow states use a 32px gap before the button: the 16px container gap + this 16px wrapper */}
        <div className="shrink-0 mt-[16px]"><Button label="Select Brussels" /></div>
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8383 · 402x454 · the only empty state with vehicle matching ON */
export const RouteEmptyVehicle: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields from={EMPTY_CITY} to={EMPTY_CITY} />
        <VehicleMatchingLine on />
        <SheetHint />
        <Button label="Show loads" disabled />
      </BottomSheet>
    </Screen>
  ),
};

/** 2197:8438 · 402x494 · vehicle ON and NO `Hint` — the 40px difference from RouteEmptyVehicle */
export const RouteOriginSelectedVehicle: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Route" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">Choose your route.</p>
        <RouteFields from="Lille, France" to={EMPTY_CITY} />
        <VehicleMatchingLine on />
        <Button label="Show loads" disabled />
      </BottomSheet>
    </Screen>
  ),
};

// ── Content=Price ────────────────────────────────────────────────────────────

/** 2197:8777 · 402x494 · two `Pharos/Input` (State=Filled), no hint line, no icons */
export const PriceOffer: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="route">
        <BottomSheetHeader title="Offer a different rate" />
        <p className="h-[20px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">
          Customer’s rate — €360
        </p>
        <SheetField label="Your rate" value="380 €" />
        <SheetField label="Comment" value="I can take this trip today." />
        <Button label="Send €380 offer" />
      </BottomSheet>
    </Screen>
  ),
};

// ── Content=Request ──────────────────────────────────────────────────────────

/** 2715:25486 · 402x494 · pad 12/16/24/16 · caption 2 lines + Trip checklist + 2 actions */
export const TripData: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="sort">
        <BottomSheetHeader title="Request trip details" />
        <p className="h-[40px] w-full shrink-0 text-body-14 text-[var(--color-text-secondary)]">
          Your dispatcher will receive a request for the missing trip data.
        </p>
        <TripChecklist />
        <Button label="Send to dispatcher" />
        {/* Figma aligns the link box (46x48) to the centre of the sheet, not to the left */}
        <div className="flex shrink-0 justify-center"><ButtonLink label="Cancel" /></div>
      </BottomSheet>
    </Screen>
  ),
};

// ── Content=Sort ─────────────────────────────────────────────────────────────

/** 2767:27860 · 402x360 · pad 12/16/24/16 · rows 48, no gap, no button */
export const SortBySheet: Story = {
  render: () => (
    <Screen>
      <BottomSheet pad="sort">
        <BottomSheetHeader title="Sort by" />
        <SortBy />
      </BottomSheet>
    </Screen>
  ),
};
