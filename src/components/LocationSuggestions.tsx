import { Button } from './Button';
import { Flag } from './Flag';
import { Icon } from './Icon';

/**
 * figma: 190:117 · Pharos/Location suggestions — State=Results `190:59` (440x166) ·
 *        State=Loading `190:85` (440x54) · State=Empty `190:98` (440x98) ·
 *        State=Error `190:107` (440x182).
 *        COMPONENT PROPERTIES: First city / First country / First flag (INSTANCE_SWAP) /
 *        Second city / Second country / Second flag / **Show second option** (BOOLEAN) / State.
 *        The 440 width is the set's frame: every instance on a driver page is 370 (2776:1761,
 *        2776:1935, 2776:2109) and one doc instance is 460, so the card is fluid (`w-full`).
 * props: state, first, second, showSecond, guidance, heading, details, loadingMessage, onSelect, onRetry
 *
 *   Every state: r12 (radius/md), fill #ffffff, 1px INSIDE #d7e0e6, pad 16.
 *   Results   VERTICAL gap 16
 *     guidance  DM Sans Regular 12/16 (Caption/12) #586d79
 *     option    406x42, HORIZONTAL gap 12, pad 0/4, MIN/CENTER
 *       flag slot 20x20 holding the 24x24 circle flag — Figma's `First flag` instance is 20x20
 *         with a 24x24 child at (-2,-2): the circle overflows its slot by 2px on every side and
 *         no clipping is on, so it renders 24px wide, starting 2px left of the slot. Reproduced
 *         with a centered 24px img inside the 20px slot.
 *       column    city DM Sans Regular 14/20 (Body/14) #172a35, gap 6,
 *                 country DM Sans Regular 12/16 (Caption/12) #586d79
 *     heights: 1+16+16+16+42+16+1 = 108 with one option, +16+42 = 166 with two (the set's frame).
 *   Loading   VERTICAL gap 16, one 20-tall row: `Lucide/Icon/Loader` 20x20 #586d79 + gap 12 +
 *             "Searching cities…" DM Sans Regular 14/20 #586d79 → 1+16+20+16+1 = 54.
 *   Empty     heading Manrope SemiBold 20/28 (Heading/20) #172a35, details DM Sans Regular 14/20
 *             #586d79 → 1+16+28+16+20+16+1 = 98.
 *   Error     heading + details (wraps to 40) + gap 16 + a `Pharos/Button`
 *             (Size=Mobile, State=Default, Appearance=Secondary, label "Try again", hug 92x48)
 *             → 1+16+28+16+40+16+48+16+1 = 182.
 *   Copy overrides seen in the instances: 2776:2109 (State=Empty) says "No cities found" /
 *   "Check the spelling or try another city." where the component says "City not found" /
 *   "Check the spelling or enter the nearest city." — hence heading/details are props.
 *
 * Composition note: this is the dropdown PANEL, not the field. It composes no `Input`: there is
 * no label row, no 48-tall control and no hint line anywhere in the set — the field that the
 * panel belongs to lives on another level of the design.
 *
 * tokens: color-bg-surface, color-border-default, color-text-primary, color-text-secondary,
 *         color-action-secondary-hover, radius-md, size-icon-md, text-heading-20, text-body-14,
 *         text-caption-12
 * TODO(token): the 20x20 flag slot, the 42-tall option row and its 6px internal gap are Figma
 *   geometry with no spacing token (the repo inlines such numbers elsewhere too).
 */
export type LocationOption = { city: string; country: string };
export type LocationSuggestionsState = 'results' | 'loading' | 'empty' | 'error';

const DEFAULTS: Record<LocationSuggestionsState, { heading: string; details: string }> = {
  results: { heading: '', details: '' },
  loading: { heading: '', details: '' },
  empty: { heading: 'City not found', details: 'Check the spelling or enter the nearest city.' },
  error: { heading: 'Could not load cities', details: 'Check your connection and try again. Your text has been saved.' },
};

function Option({
  option,
  onSelect,
}: {
  option: LocationOption;
  onSelect?: (option: LocationOption) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      onClick={() => onSelect?.(option)}
      className="flex w-full items-center gap-[12px] px-[4px] text-left"
    >
      <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center">
        {/* `max-w-none` defeats Tailwind's `img { max-width: 100% }` preflight rule: Figma's
            instance is 20x20 but its flag child stayed 24x24 and nothing clips it, so the circle
            really renders 24px wide, 2px outside the slot on each side. */}
        <Flag country={option.country} shape="circle" size={24} className="max-w-none" />
      </span>
      <span className="flex w-full flex-col gap-[6px]">
        <span className="text-body-14 text-[var(--color-text-primary)]">{option.city}</span>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{option.country}</span>
      </span>
    </button>
  );
}

export function LocationSuggestions({
  state = 'results',
  first = { city: 'Lille', country: 'France' },
  second = { city: 'Lyon', country: 'France' },
  showSecond = true,
  guidance = 'Choose a city',
  heading,
  details,
  loadingMessage = 'Searching cities…',
  onSelect,
  onRetry,
}: {
  state?: LocationSuggestionsState;
  first?: LocationOption;
  second?: LocationOption;
  /** Figma's `Show second option` boolean — false in the page-30 Results instances. */
  showSecond?: boolean;
  guidance?: string;
  heading?: string;
  details?: string;
  loadingMessage?: string;
  onSelect?: (option: LocationOption) => void;
  onRetry?: () => void;
}) {
  const copy = { ...DEFAULTS[state], heading: heading ?? DEFAULTS[state].heading, details: details ?? DEFAULTS[state].details };

  return (
    <div className="flex w-full flex-col gap-[16px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[16px]">
      {state === 'results' && (
        <>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">{guidance}</span>
          <Option option={first} onSelect={onSelect} />
          {showSecond && <Option option={second} onSelect={onSelect} />}
        </>
      )}

      {state === 'loading' && (
        <div className="flex w-full items-center gap-[12px]">
          <Icon name="loader" className="text-[var(--color-text-secondary)]" />
          <span className="w-full text-body-14 text-[var(--color-text-secondary)]">{loadingMessage}</span>
        </div>
      )}

      {(state === 'empty' || state === 'error') && (
        <>
          <span className="w-full text-heading-20 text-[var(--color-text-primary)]">{copy.heading}</span>
          <span className="w-full text-body-14 text-[var(--color-text-secondary)]">{copy.details}</span>
          {state === 'error' && (
            <span className="block">
              <Button label="Try again" appearance="secondary" size="mobile" full={false} onClick={onRetry} />
            </span>
          )}
        </>
      )}
    </div>
  );
}
