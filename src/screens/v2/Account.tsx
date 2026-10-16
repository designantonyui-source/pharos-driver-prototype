/**
 * figma: approved Account/Profile prototype · identity 769:10428
 * props: detail; tokens: spacing-16, spacing-8, radius-md, color-bg-surface, color-bg-subtle,
 *   color-text-primary, color-text-secondary, color-action-text, color-text-danger,
 *   color-border-default, color-status-success-bg, color-status-success-text
 *
 * New Account proposal (not a measured Figma port): the identity card is the measured
 * DriverProfile 769:10428; the rows below are prototype-led iOS grouped-list rows
 * (section label + icon rows with 44px tap targets and chevrons).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { DriverProfile } from '../../components/DriverProfile';
import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { Input } from '../../components/Input';
import { NavigationBar, V2BackBar } from '../../components/layout/NavigationBar';
import { Toast, useToast } from '../../components/v2/Toast';
import { V2Frame } from '../../components/v2/V2Frame';
import { Sheet } from '../../components/v2/Sheet';
import { getDriverProfile, updateDriverProfile, validateEmail, validatePhone, type ContactProfile } from '../../lib/api';
import { useStore } from '../../lib/store';
type ProfileData = Awaited<ReturnType<typeof getDriverProfile>>;
function Chevron() {
  return <Icon name="chevron-right" size="sm" className="shrink-0 text-[var(--color-text-tertiary)]" />;
}
function AccountFrame({ title, backTo, toast, children }: { title: string; backTo?: string; toast?: ReactNode; children: ReactNode }) {
  return <V2Frame active="Account">
    <div className="absolute inset-x-0 top-0 z-20">
      {backTo
        ? <V2BackBar title={title} fallback={backTo} />
        : <NavigationBar type="home" title={title} avatar="AK" />}
    </div>
    <main className="absolute inset-x-0 top-[var(--nav-bar-h)] bottom-[calc(var(--tab-bar-h)+var(--home-indicator-h))] overflow-y-auto px-[var(--spacing-16)] pb-[var(--spacing-24)] pt-[var(--spacing-8)] text-[var(--color-text-primary)]">
      <h1 className="sr-only">{title}</h1>
      {children}
    </main>
    {toast}
  </V2Frame>;
}
function AccountSection({ label, children }: { label: string; children: ReactNode }) {
  return <section aria-label={label} className="mt-[var(--spacing-16)]">
    <h2 className="px-[var(--spacing-12)] pb-[var(--spacing-8)] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</h2>
    <div className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]">{children}</div>
  </section>;
}
function MenuRow({ to, icon, title, detail, badge, danger = false, last = false, external = false }: { to: string; icon: IconName; title: string; detail?: string; badge?: number; danger?: boolean; last?: boolean; external?: boolean }) {
  return <Link to={to} className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:-outline-offset-2 ${last ? '' : 'border-b border-[var(--color-border-default)]'}`}>
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden>
      <Icon name={icon} size="md" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className={`text-body-14 ${danger ? 'text-[var(--color-text-danger)]' : 'text-[var(--color-text-primary)]'}`}>{title}</span>
      {detail && <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{detail}</span>}
    </span>
    {typeof badge === 'number' && badge > 0 && <span className="flex h-[var(--spacing-20)] min-w-[var(--spacing-20)] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-[var(--spacing-6)] text-caption-10 text-[var(--color-action-text-inverse)]">{badge}</span>}
    {external ? null : <Chevron />}
  </Link>;
}
function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true; setError(false);
    getDriverProfile().then(value => { if (live) setProfile(value); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  return { profile, error, retry: () => setAttempt(value => value + 1) };
}
function ProfileStatus({ error, retry }: { error: boolean; retry: () => void }) {
  if (error) {
    return <div className="mt-[var(--spacing-16)]"><Alert type="error" title="Could not load profile">Check your connection and try again.<span className="mt-[var(--spacing-8)] block"><Button label="Retry" appearance="secondary" onClick={retry} /></span></Alert></div>;
  }
  return <div className="mt-[var(--spacing-8)] flex flex-col gap-[var(--spacing-16)]" role="status" aria-label="Loading profile">
    <div className="h-[82px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <div className="h-[48px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <div className="h-[120px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <span className="sr-only">Loading profile…</span>
  </div>;
}
export function Account({ detail = false }: { detail?: boolean }) {
  const { profile, error, retry } = useProfile();
  const { state } = useStore();
  const navigate = useNavigate();
  const dismissedCount = Object.values(state.applications).filter(entry => entry.dismissed).length;
  if (detail) {
    return <AccountFrame title="Profile" backTo="/v2/account">
      {profile ? <>
        <div className="mt-[var(--spacing-8)]"><DriverProfile {...profile} verified={false} /></div>
        <div className="mt-[var(--spacing-16)]"><Alert type="info" title="Profile">Contact details are stored on this device only — not authenticated or verified. Driver identity is read-only.</Alert></div>
        <AccountSection label="Contact">
          <div className="flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)]">
            <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="phone" size="md" /></span>
            <span className="flex min-w-0 flex-1 flex-col"><span className="text-caption-12 text-[var(--color-text-secondary)]">Phone</span><span className="truncate text-body-14 text-[var(--color-text-primary)]">{profile.phone || 'Not added'}</span></span>
          </div>
          <div className="flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] border-t border-[var(--color-border-default)] px-[var(--spacing-12)] py-[var(--spacing-8)]">
            <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="mail" size="md" /></span>
            <span className="flex min-w-0 flex-1 flex-col"><span className="text-caption-12 text-[var(--color-text-secondary)]">Email</span><span className="truncate text-body-14 text-[var(--color-text-primary)]">{profile.email || 'Not added'}</span></span>
          </div>
        </AccountSection>
        <div className="mt-[var(--spacing-16)]"><Button label="Edit contact" onClick={() => navigate('/v2/account/profile/edit')} /></div>
        <p className="mt-[var(--spacing-8)] text-center text-caption-12 text-[var(--color-text-secondary)]">Changes save on this device only.</p>
      </> : <ProfileStatus error={error} retry={retry} />}
    </AccountFrame>;
  }
  return <AccountFrame title="Account">
    {profile ? <>
      <Link to="/v2/account/profile" aria-label="Open profile" className="mt-[var(--spacing-8)] block rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:outline-offset-4"><DriverProfile {...profile} verified verifiedStyle="inline" /></Link>
      <AccountSection label="Loads">
        <MenuRow to="/v2/account/dismissed" icon="eye" title="Dismissed loads" detail={dismissedCount > 0 ? `${dismissedCount} hidden from your feed` : 'Loads you hid from your feed'} badge={dismissedCount} />
        <MenuRow to="/v2" icon="search" title="Find loads" detail="Back to the loads feed" last />
      </AccountSection>
      <AccountSection label="Earnings">
        <MenuRow to="/v2/account/balance" icon="wallet" title="Balance" detail="Available, pending, cash out, history" last />
      </AccountSection>
      <AccountSection label="Profile">
        <MenuRow to="/v2/account/profile" icon="user-round" title="Profile" detail={`${profile.phone || 'No phone'} · ${profile.email || 'No email'}`} />
        <MenuRow to="/v2/account/profile/edit" icon="settings" title="Contact details" detail="Phone and email on this device" last />
      </AccountSection>
      <AccountSection label="Preferences">
        <MenuRow to="/v2/account" icon="bell" title="Notifications" detail="Push and email updates" />
        <MenuRow to="/v2/account" icon="languages" title="Language" detail="English" last />
      </AccountSection>
      <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Contact details stay on this device.</p>
    </> : <ProfileStatus error={error} retry={retry} />}
  </AccountFrame>;
}
export function EditContact() {
  const { profile, error, retry } = useProfile();
  return profile ? <ContactEditor initial={profile} /> : <AccountFrame title="Edit contact" backTo="/v2/account/profile"><ProfileStatus error={error} retry={retry} /></AccountFrame>;
}

export function ContactEditor({ initial }: { initial: ProfileData }) {
  const [contact, setContact] = useState<ContactProfile>({ phone: initial.phone, email: initial.email });
  const [saved, setSaved] = useState(contact);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { toast, show, dismiss } = useToast();
  const pending = useRef(false);
  const live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  const dirty = contact.phone !== saved.phone || contact.email !== saved.email;
  const validPhone = validatePhone(contact.phone);
  const validEmail = validateEmail(contact.email);
  const blocker = useBlocker(dirty || saving);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);
  async function save() {
    if (pending.current || !dirty || !validPhone || !validEmail) return;
    pending.current = true; setSaving(true); setSaveError(false);
    try {
      const result = await updateDriverProfile(contact);
      if (live.current) {
        const value = { phone: result.phone, email: result.email };
        setContact(value); setSaved(value);
        show({ tone: 'success', title: 'Contact details saved', detail: 'Stored on this device only.' });
      }
    } catch {
      if (live.current) setSaveError(true);
    } finally {
      pending.current = false;
      if (live.current) setSaving(false);
    }
  }
  const phoneState = !validPhone && (touchedPhone || contact.phone !== saved.phone) ? 'error' as const : contact.phone ? 'filled' as const : 'empty' as const;
  const emailState = !validEmail && (touchedEmail || contact.email !== saved.email) ? 'error' as const : contact.email ? 'filled' as const : 'empty' as const;
  return <AccountFrame title="Edit contact" backTo="/v2/account/profile" toast={<Toast toast={toast} onClose={dismiss} />}>
    <div className="mt-[var(--spacing-8)]"><DriverProfile {...initial} verified={false} /></div>
    <div className="mt-[var(--spacing-16)]"><Alert type="info" title="Profile">Contact details are stored on this device only — not authenticated or verified. Driver identity is read-only.</Alert></div>
    <form onSubmit={event => { event.preventDefault(); void save(); }} noValidate className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-16)]">
      <Input label="Phone" value={contact.phone} placeholder="+33 6 12 34 56 78" state={phoneState} icon={false} hint={phoneState === 'error' ? 'Enter a valid phone — 7–15 digits.' : 'Used for trip updates on this device.'} onChange={value => { setContact({ ...contact, phone: value }); setTouchedPhone(true); setSaveError(false); }} />
      <Input label="Email" value={contact.email} placeholder="driver@example.com" state={emailState} icon={false} hint={emailState === 'error' ? 'Enter a valid email address.' : 'Used for receipts on this device.'} onChange={value => { setContact({ ...contact, email: value }); setTouchedEmail(true); setSaveError(false); }} />
      <Button label={saving ? 'Saving…' : 'Save contact'} disabled={!dirty || !validPhone || !validEmail || saving} loading={saving} onClick={() => void save()} />
      <p className="text-center text-caption-12 text-[var(--color-text-secondary)]">{dirty ? 'Unsaved changes — they stay on this device.' : 'No unsaved changes.'}</p>
    </form>
    {saveError && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not save contact details">Check your connection and try again.</Alert></div>}
    <Sheet open={blocker.state === 'blocked'} label="Discard contact changes?" onClose={() => { if (blocker.state === 'blocked') blocker.reset(); }}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Discard contact changes?</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">{saving ? 'Contact details are still saving. Keep editing until saving finishes.' : 'Your unsaved contact changes will be lost.'}</p>
      <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
        <Button label="Keep editing" onClick={() => { if (blocker.state === 'blocked') blocker.reset(); }} />
        <Button label="Discard" appearance="secondary" disabled={saving} onClick={() => { if (blocker.state === 'blocked' && !pending.current) blocker.proceed(); }} />
      </div>
    </Sheet>
  </AccountFrame>;
}

