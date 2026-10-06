import { Icon } from './Icon';

/**
 * figma: 2767:27908 / 2767:27913 / 2767:27915 / 2767:27917 inside
 *        Content=Sort, State=Sort by (2767:27860)
 * props: value, options, onChange
 * tokens: color-text-primary, color-text-tertiary, text-body-16
 * geometry: options are 370x48, HORIZONTAL, pad 12/0/12/0, gap 8, label 16/24 DM Sans Regular
 *   #172a35 FILL. The selected one carries a 20x20 `Lucide/Icon/Circle Check` (#225d74, 2px)
 *   that resolves from the component name, not the layer name (`Selected`).
 *   The rows are stacked with NO gap — the 48px box itself is the touch target.
 *   `Content=Sort` uses pad 12/16/24/16 (that is `pad="sort"` on the BottomSheet).
 */
export const SORT_OPTIONS = ['Highest €/km', 'Highest rate', 'Closest pickup', 'Soonest deadline'];

export function SortBy({
  value = SORT_OPTIONS[0],
  options = SORT_OPTIONS,
  onChange,
}: {
  value?: string;
  options?: string[];
  onChange?: (v: string) => void;
}) {
  return (
    <div role="radiogroup" className="flex w-full shrink-0 flex-col">
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(option)}
            className="flex h-[48px] w-full shrink-0 items-center gap-[8px] px-[12px] text-left"
          >
            <span className="w-full text-body-16 text-[var(--color-text-primary)]">{option}</span>
            {selected && (
              <Icon name="circle-check" size={20} className="text-[var(--color-border-brand)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
