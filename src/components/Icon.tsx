import {
  ArrowRight,
  Bookmark,
  Calendar,
  Camera,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock,
  Image,
  Info,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Package,
  Search,
  Shield,
  SlidersHorizontal,
  TriangleAlert,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';

/**
 * figma: 03 — Icons (page `9:5`) · "A single set from Lucide. Size 24 px; 20 px instances are used
 *        inside controls. Colour is bound to Pharos tokens." Stroke is 2 px everywhere.
 *        An icon-only action needs a tooltip or an accessible name; the driver touch target is 48 px.
 * props: name, size, className, label
 *
 * The Figma component name is NOT the lucide name for four of them. The nested `Lucide/*` glyph
 * frame inside the component is the truth (see PORT-LOG trap 18):
 *   `Lucide/Icon/Orders`   `82:120` → Package          (nested frame `Lucide/Package`)
 *   `Lucide/Icon/Overview` `82:114` → LayoutDashboard  (nested frame `Lucide/LayoutDashboard`)
 *   `Lucide/Icon/Reports`  `82:128` → ChartNoAxesColumn(nested frame `Lucide/ChartNoAxesColumn`)
 *   `Lucide/Icon/Users`    `82:124` → Users            (nested frame `Lucide/Users`)
 *   `Lucide/Icon/Loader`   `279:5034` → LoaderCircle   (one 18x18 arc — not the 8-spoke `Loader`)
 * `chevron-left` is used by the nav bar but lives outside the `Lucide/Icon/*` namespace.
 * `check` and `chevron-down` were added for the filter cluster: the check mark of
 * `Pharos/Filter chip v2` State=Selected (`2621:1280` "Check path", 14x14) and the chevron of
 * `Pharos/Select` (`344:30` "Chevron down", 16x16) — both are bare lucide glyphs, not registered
 * components on the `03 — Icons` page.
 *
 * tokens: size-icon-sm 16 · size-icon-md 20 · size-icon-lg 24
 * colour: never set here — the glyph inherits `currentColor` from its parent
 * stroke: 2 lucide units by default, i.e. 2 * size/24 CSS px. Only the check mark of
 *   `Pharos/Filter chip v2` needs another value — see the note in `FilterChipV2.tsx`.
 */
export const ICONS = {
  'arrow-right': ArrowRight,
  bookmark: Bookmark,
  calendar: Calendar,
  camera: Camera,
  'chart-column': ChartNoAxesColumn,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'circle-check': CircleCheck,
  'circle-help': CircleHelp,
  'circle-x': CircleX,
  clock: Clock,
  image: Image,
  info: Info,
  'layout-dashboard': LayoutDashboard,
  loader: LoaderCircle,
  'map-pin': MapPin,
  package: Package,
  search: Search,
  shield: Shield,
  sliders: SlidersHorizontal,
  'triangle-alert': TriangleAlert,
  truck: Truck,
  'user-round': UserRound,
  users: Users,
  x: X,
} as const;

export type IconName = keyof typeof ICONS;

/** The sizes the design tokens cover. Figma also instances 11/12/14 px — pass a number there. */
const BOX = {
  sm: 'h-[var(--size-icon-sm)] w-[var(--size-icon-sm)]',
  md: 'h-[var(--size-icon-md)] w-[var(--size-icon-md)]',
  lg: 'h-[var(--size-icon-lg)] w-[var(--size-icon-lg)]',
  xl: 'h-[var(--size-icon-xl)] w-[var(--size-icon-xl)]',
} as const;

export function Icon({
  name,
  size = 'md',
  strokeWidth = 2,
  className,
  label,
}: {
  name: IconName;
  size?: keyof typeof BOX | number;
  /** lucide units (the glyph is drawn in a 24 viewBox): 2 = the design rule. */
  strokeWidth?: number;
  className?: string;
  /** accessible name for an icon-only action; without it the icon is hidden from assistive tech */
  label?: string;
}) {
  const Glyph = ICONS[name];
  const box = typeof size === 'number' ? undefined : BOX[size];
  return (
    <Glyph
      size={typeof size === 'number' ? size : 24}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${box ?? ''} ${className ?? ''}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
