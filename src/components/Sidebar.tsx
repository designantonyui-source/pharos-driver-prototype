import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';

/**
 * figma: 82:150 · Pharos/Sidebar — Role=Driver `82:146` · Role=Dispatcher `82:147` ·
 *        Role=FleetManager `82:148` · Role=Admin `82:149` (all 280x720, FIXED both axes)
 * props: role, active, user, organization, workspaceInitials, onNavigate
 *
 *   surface: fill color/nav/bg, pad 16, gap 16, VERTICAL
 *   Brand           248x32  `Pharos/Brand mark` 82:131 (32x32 r8 color/avatar/bg + a 22x22 stroked
 *                    glyph, 2.2px color/text/primary) + "Pharos" Heading/24 color/text/inverse
 *   Workspace context 248x64 `Pharos/Workspace context` 82:135 — r12 color/nav/hover, pad 12,
 *                    gap 12, initials frame 32x32 r8, Label Caption/12 + Name Label/14
 *   Section         248x16  literal "WORKSPACE", Caption/12 color/nav/text
 *   Main navigation 248xhug gap 4 — `Pharos/Navigation item` 14:15, Theme=Dark, 48 tall, r8,
 *                    pad 12, gap 12: [Active marker 3x24 r999 color/avatar/bg] [Icon 20] [Label]
 *                    the set also carries a `Count pill`, but BOTH sidebar instances delete the
 *                    layer (`82:165`, `82:276` have only marker/icon/label), so `count` stays
 *                    optional and the sidebar never passes it
 *   Flexible space  spacer that pushes the footer down: 116 in the 720 component, 296 in the
 *                    280x900 instances — it is the only thing that stretches
 *   Account and help 248x124 gap 12 — Help row + `Pharos/Account` 74:82 Theme=Dark (248x64, r12,
 *                    color/nav/hover, pad 12, gap 12: Avatar 40 + Name/Role + Arrow right 16)
 *
 *   Role differences are content only (the surface is identical in all four variants):
 *     Driver        5 rows, "Load search" active,       AK / Alexey K. / Driver
 *     Dispatcher    5 rows, "Orders" active,            LM / Lena M. / Dispatcher
 *     FleetManager  5 rows, "Overview" active,          NP / Nikita P. / Fleet manager
 *     Admin         3 rows, "Access rights" active,     ES / Elena S. / Administrator
 *   Height: the set is FIXED 720 but every one of the 30 instances is 280x900 (the sidebar is
 *   stretched to the 1440x900 screen), so the root is `h-full` with a 720 floor.
 *
 *   KNOWN DEVIATION — four icons render 20% larger in Figma than here. `Pharos/Navigation item`'s
 *   `Icon` slot is 20x20, and twelve of the sixteen rows draw a true 20px glyph (measured identical:
 *   Search 16x16 ink, Bookmark 14x16, Truck 18x14, Shield 14x18, CircleHelp 18x18). But the four
 *   components that carry an extra nested `Glyph` frame — `Lucide/Icon/Orders` `82:120`,
 *   `Overview` `82:114`, `Users` `82:124`, `Reports` `82:128`, the same four whose names lie
 *   (trap 18) — were resized to the 20px slot WITHOUT scaling that frame, so the glyph is drawn at
 *   its native 24px and overflows the slot by 2px on each side. Figma ink measured: Package 20x22,
 *   LayoutDashboard 20x20, Users 22x20, ChartNoAxesColumn 18x18 = exactly 24/20 of my 16x18, 16x16,
 *   18x16, 12x16. This is a construction defect in Figma, not a design choice, and reproducing it
 *   would make four rows visibly bigger than the other two in the same list, so the Icon registry's
 *   20px (`size-icon-md`) is used everywhere. Fix in Figma by scaling `Glyph` inside those four
 *   components; if the 24px render is wanted instead, pass `size="lg"` for those four rows.
 *
 *   Page 05 (`05 · Web / Workspace & load board`) holds the set; page 21
 *   (`21 — Driver / Search and request`) holds the 30 instances, all inside the 1440-wide `D*`
 *   responsive frames. It is desktop web chrome — it is not part of the 402x874 iOS shell and
 *   must not be wired into `layout/ScreenFrame`.
 *
 * tokens: color-nav-bg, color-nav-hover, color-nav-active, color-nav-text, color-avatar-bg,
 *         color-avatar-text, color-text-inverse, color-text-disabled, radius-sm, radius-md,
 *         radius-pill, size-icon-sm, size-icon-md, spacing-4, spacing-12, spacing-16, spacing-8,
 *         text-caption-12, text-heading-24, text-label-12, text-label-14
 * TODO(token): the sidebar box 280px x 720px, the brand glyph 22px, the active marker's 3px width
 *              and the account row's 64px height have no token (the shell only names the 402x874
 *              iOS frame); design/tokens.json belongs to the parent, so they stay literals here.
 */

export type SidebarRole = 'driver' | 'dispatcher' | 'fleet-manager' | 'admin';

type NavEntry = { key: string; label: string; icon: IconName };

/** Main navigation, in Figma order. `icon` is the lucide name, resolved through the Icon registry
 *  (trap 18: `Lucide/Icon/Orders` draws `Package`, `Overview` draws `LayoutDashboard`,
 *  `Reports` draws `ChartNoAxesColumn`). */
const NAVIGATION: Record<SidebarRole, NavEntry[]> = {
  driver: [
    { key: 'load-search', label: 'Load search', icon: 'search' },
    { key: 'applications', label: 'My applications', icon: 'bookmark' },
    { key: 'orders', label: 'My orders', icon: 'package' },
    { key: 'saved', label: 'Saved', icon: 'bookmark' },
    { key: 'profile', label: 'Profile and documents', icon: 'shield' },
  ],
  dispatcher: [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'applications', label: 'Applications', icon: 'bookmark' },
    { key: 'orders', label: 'Orders', icon: 'package' },
    { key: 'vehicles', label: 'Vehicles and drivers', icon: 'truck' },
    { key: 'customers', label: 'Customers', icon: 'users' },
  ],
  'fleet-manager': [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'orders', label: 'Orders', icon: 'package' },
    { key: 'fleet', label: 'Fleet', icon: 'truck' },
    { key: 'customers', label: 'Customers', icon: 'users' },
    { key: 'reports', label: 'Reports', icon: 'chart-column' },
  ],
  admin: [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'access-rights', label: 'Access rights', icon: 'shield' },
  ],
};

/** The active row baked into each Figma variant. */
const ACTIVE: Record<SidebarRole, string> = {
  driver: 'load-search',
  dispatcher: 'orders',
  'fleet-manager': 'overview',
  admin: 'access-rights',
};

/** `Pharos/Account` overrides per role. The Account master writes "AK / Alexey K." in all eight
 *  variants; the Sidebar is where the per-role person appears. */
const USER: Record<SidebarRole, { initials: string; name: string; role: string }> = {
  driver: { initials: 'AK', name: 'Alexey K.', role: 'Driver' },
  dispatcher: { initials: 'LM', name: 'Lena M.', role: 'Dispatcher' },
  'fleet-manager': { initials: 'NP', name: 'Nikita P.', role: 'Fleet manager' },
  admin: { initials: 'ES', name: 'Elena S.', role: 'Administrator' },
};

/** `Pharos/Brand mark` 82:131 — the only vector artwork in the set. */
export function BrandMark() {
  return (
    <span
      aria-hidden
      className="flex h-[var(--spacing-32)] w-[var(--spacing-32)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-avatar-bg)]"
    >
      {/* `Glyph` 82:132 is a 22x22 frame at (+5,+5); its own fill is switched off, so only the two
          2.2px strokes render. Paths are the Figma vectorPaths, translated into the frame. */}
      <svg
        viewBox="0 0 22 22"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="var(--color-text-primary)"
        strokeWidth={2.2}
        strokeLinecap="round"
      >
        <path d="M4 17.375 L8.95 5 L11.2417 11.5083 L13.5333 6.8333 L18.6667 17.375" strokeLinejoin="round" />
        <path d="M6 17 L15.1667 17" strokeLinejoin="miter" />
      </svg>
    </span>
  );
}

/** `Pharos/Workspace context` 82:135 — 248x64, r12, color/nav/hover, pad 12, gap 12.
 *  counterAxis is MIN in Figma, not CENTER: the 32px initials square sits at y12 while the 40px
 *  identity column fills the 40px content box, so `items-start` is what reproduces the offset. */
export function WorkspaceContext({
  organization = 'Northway Freight',
  initials = 'NF',
  label = 'Organisation',
}: {
  organization?: string;
  initials?: string;
  label?: string;
}) {
  return (
    <div className="flex w-full items-start gap-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-nav-hover)] p-[var(--spacing-12)]">
      <span className="flex h-[var(--spacing-32)] w-[var(--spacing-32)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-avatar-bg)] text-label-12 text-[var(--color-avatar-text)]">
        {initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-4)]">
        <span className="truncate text-caption-12 text-[var(--color-nav-text)]">{label}</span>
        <span className="truncate text-label-14 text-[var(--color-text-inverse)]">{organization}</span>
      </span>
    </div>
  );
}

/** `Pharos/Navigation item` 14:15, Theme=Dark — 48 tall, r8, pad 12, gap 12.
 *  Active = fill color/nav/active + a color/avatar/bg marker + inverse icon and label;
 *  Hover = fill color/nav/hover (a variant in Figma, a pseudo-class here — see PORT-LOG §7). */
export function SidebarNavItem({
  icon,
  label,
  active = false,
  disabled = false,
  count,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** the set's optional `Count pill` (31x24 r999); no sidebar instance keeps it */
  count?: string;
  onClick?: () => void;
}) {
  const surface = disabled
    ? 'bg-[var(--color-nav-bg)]'
    : active
      ? 'bg-[var(--color-nav-active)]'
      : 'bg-[var(--color-nav-bg)] hover:bg-[var(--color-nav-hover)]';
  const ink = disabled
    ? 'text-[var(--color-text-disabled)]'
    : active
      ? 'text-[var(--color-text-inverse)]'
      : 'text-[var(--color-nav-text)]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={`flex h-[var(--size-control-mobile)] w-full items-center gap-[var(--spacing-12)] rounded-[var(--radius-sm)] p-[var(--spacing-12)] text-left ${surface} ${ink}`}
    >
      <span
        aria-hidden
        className={`h-[var(--spacing-24)] w-[3px] shrink-0 rounded-[var(--radius-pill)] ${
          active ? 'bg-[var(--color-avatar-bg)]' : 'bg-transparent'
        }`}
      />
      <Icon name={icon} />
      <span className="min-w-0 flex-1 truncate text-label-14">{label}</span>
      {count !== undefined && (
        <span className="flex h-[var(--spacing-24)] shrink-0 items-center rounded-[var(--radius-pill)] bg-[var(--color-nav-hover)] px-[var(--spacing-8)] text-label-12">
          {count}
        </span>
      )}
    </button>
  );
}

/** `Pharos/Account` 74:82 Theme=Dark — 248x64, r12, color/nav/hover, pad 12, gap 12.
 *  The avatar is the real `Pharos/Avatar` Size=Medium (`74:83`, 40x40), unlike the 48px
 *  `Driver initials` frame of the mobile header. */
export function SidebarAccount({
  initials,
  name,
  role,
  onClick,
}: {
  initials: string;
  name: string;
  role: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[64px] w-full items-center gap-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-nav-hover)] p-[var(--spacing-12)] text-left"
    >
      <Avatar initials={initials} size="medium" />
      <span className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-4)]">
        <span className="truncate text-label-14 text-[var(--color-text-inverse)]">{name}</span>
        <span className="truncate text-caption-12 text-[var(--color-nav-text)]">{role}</span>
      </span>
      <Icon name="arrow-right" size="sm" className="text-[var(--color-text-inverse)]" />
    </button>
  );
}

export function Sidebar({
  role = 'driver',
  active,
  user,
  organization = 'Northway Freight',
  workspaceInitials = 'NF',
  onNavigate,
}: {
  role?: SidebarRole;
  /** key of the active row; defaults to the row that is active in the Figma variant */
  active?: string;
  /** person in the footer; defaults to the one the Figma instance writes for this role */
  user?: { initials: string; name: string; role: string };
  organization?: string;
  workspaceInitials?: string;
  onNavigate?: (key: string) => void;
}) {
  const activeKey = active ?? ACTIVE[role];
  const person = user ?? USER[role];

  return (
    <div className="flex h-full min-h-[720px] w-[280px] flex-col gap-[var(--spacing-16)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)]">
      {/* `Brand` 248x32 */}
      <div className="flex w-full items-center gap-[var(--spacing-12)]">
        <BrandMark />
        <span className="text-heading-24 text-[var(--color-text-inverse)]">Pharos</span>
      </div>

      <WorkspaceContext organization={organization} initials={workspaceInitials} />

      {/* `Section` 248x16 — the string is uppercase in Figma, not text-transformed */}
      <p className="w-full text-caption-12 text-[var(--color-nav-text)]">WORKSPACE</p>

      {/* `Main navigation` 248xhug, gap 4 */}
      <div className="flex w-full flex-col gap-[var(--spacing-4)]">
        {NAVIGATION[role].map((entry) => (
          <SidebarNavItem
            key={entry.key}
            icon={entry.icon}
            label={entry.label}
            active={entry.key === activeKey}
            onClick={onNavigate ? () => onNavigate(entry.key) : undefined}
          />
        ))}
      </div>

      {/* `Flexible space` — the only stretching child */}
      <div aria-hidden className="min-h-0 flex-1" />

      {/* `Account and help` 248x124, gap 12 */}
      <div className="flex w-full flex-col gap-[var(--spacing-12)]">
        <SidebarNavItem icon="circle-help" label="Help" onClick={onNavigate ? () => onNavigate('help') : undefined} />
        <SidebarAccount initials={person.initials} name={person.name} role={person.role} />
      </div>
    </div>
  );
}
