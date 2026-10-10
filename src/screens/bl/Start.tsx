import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BlFrame } from '../../components/bl/BlFrame';
import { bl, useBl } from '../../lib/bl/state';
import type { Body } from '../../lib/bl/logic';

/**
 * Backload (PL) · Rejestracja i wprowadzenie (route `/bl/start`, spec §7.1–7.2).
 * Steps: phone → SMS code → role, body, ADR → three onboarding slides → Kursy.
 * Demo: any 6+ digit phone and any 4 digits are accepted; no SMS is sent.
 * props: none. tokens: color-action-primary, color-border-default, color-status-warning-*, radius-sm
 */
const ROLES = [
  { id: 'Własny samochód', sub: 'Jestem właścicielem lub prowadzę jednoosobową działalność' },
  { id: 'Pracuję dla przewoźnika', sub: 'Firma prowadzi, ja jestem kierowcą' },
];
const BODIES: Body[] = ['Plandeka', 'Chłodnia', 'Kontener', 'Platforma'];
/** Demo code shown on the screen; a real app would send it by SMS. */
const DEMO_CODE = '1234';
const MAX_TRIES = 3;
const LOCK_MS = 60_000;
const RESEND_S = 30;
const SLIDES = [
  { title: 'Nie jedź pusto', text: 'Po rozładunku znajdziemy zlecenie po drodze — zarobisz w drodze powrotnej.' },
  { title: 'Opłacalność widać od razu', text: 'Objazd, cena za kilometr i kwota po opłatach drogowych — na każdej karcie.' },
  { title: 'Bezpiecznie', text: 'Sprawdzeni zleceniodawcy i CMR w telefonie. Bez sieci aplikacja działa: statusy wyślą się po połączeniu.' },
];

export function BlStart() {
  const s = useBl();
  const nav = useNavigate();
  const [step, setStep] = useState<'phone' | 'code' | 'profile' | 'intro'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [body, setBody] = useState<Body>('Plandeka');
  const [adr, setAdr] = useState(false);
  const [slide, setSlide] = useState(0);
  const [tries, setTries] = useState(MAX_TRIES);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeInfo, setCodeInfo] = useState<string | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lockLeft = Math.max(0, Math.ceil((lockedUntil - tick) / 1000));
  const locked = lockLeft > 0;
  const resendLeft = Math.max(0, Math.ceil((resendAt - tick) / 1000));

  const startCode = () => {
    setStep('code');
    setCode('');
    setTries(MAX_TRIES);
    setCodeError(null);
    setCodeInfo(null);
    setResendAt(Date.now() + RESEND_S * 1000);
  };

  const verify = () => {
    if (locked) return;
    if (code.length < 4) {
      setCodeError('Wpisz 4 cyfry kodu.');
      return;
    }
    if (code === DEMO_CODE) {
      setCodeError(null);
      setStep('profile');
      return;
    }
    const left = tries - 1;
    setCode('');
    setCodeInfo(null);
    if (left <= 0) {
      setLockedUntil(Date.now() + LOCK_MS);
      setTries(MAX_TRIES);
      setCodeError('Za dużo nieudanych prób.');
    } else {
      setTries(left);
      setCodeError(`Nieprawidłowy kod. Sprawdź SMS i spróbuj ponownie. Pozostało prób: ${left}.`);
    }
  };

  const resend = () => {
    setCode('');
    setCodeError(null);
    setCodeInfo('Wysłaliśmy nowy kod.');
    setResendAt(Date.now() + RESEND_S * 1000);
  };

  if (s.registered && step !== 'intro') return <Navigate to="/bl" replace />;

  return (
    <BlFrame active="home" showTabs={false}>
      <div className="flex flex-col gap-[16px] pt-[8px]">
        <Progress step={step} />

        {step === 'phone' && (
          <Section title="Podaj numer telefonu" text="Wyślemy kod potwierdzający. W demo SMS nie jest wysyłany.">
            <input
              id="bl-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-label="Numer telefonu"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+48 600 123 456"
              className="h-[48px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[14px] text-body-16"
            />
            <PrimaryButton disabled={phone.trim().length < 6} onClick={startCode}>
              Wyślij kod
            </PrimaryButton>
          </Section>
        )}

        {step === 'code' && (
          <Section title="Wpisz kod" text={`Wysłaliśmy 4-cyfrowy kod na ${phone || 'Twój numer'}.`}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Kod z SMS"
              aria-invalid={codeError ? true : undefined}
              aria-describedby={codeError || locked ? 'code-error' : undefined}
              maxLength={4}
              disabled={locked}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              className="h-[56px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-center text-heading-20 tracking-[0.5em] disabled:opacity-50"
            />
            {(locked || codeError) && (
              <span id="code-error" role="alert" className="text-caption-12 text-[var(--color-status-danger-text)]">
                {locked ? `Za dużo nieudanych prób. Spróbuj ponownie za ${lockLeft} s.` : codeError}
              </span>
            )}
            {codeInfo && !codeError && !locked && (
              <span role="status" className="text-caption-12 text-[var(--color-text-secondary)]">
                {codeInfo}
              </span>
            )}
            <PrimaryButton disabled={locked} onClick={verify}>
              Potwierdź
            </PrimaryButton>
            <button
              type="button"
              disabled={resendLeft > 0 || locked}
              onClick={resend}
              className="text-label-14 text-[var(--color-action-primary)] disabled:text-[var(--color-action-text-disabled)]"
            >
              {resendLeft > 0 ? `Wyślij kod ponownie za 0:${String(resendLeft).padStart(2, '0')}` : 'Wyślij kod ponownie'}
            </button>
            <button type="button" onClick={() => setStep('phone')} className="text-label-14 text-[var(--color-action-primary)]">
              Zmień numer
            </button>
            <span className="text-caption-12 text-[var(--color-text-tertiary)]">Demo: kod to {DEMO_CODE}.</span>
          </Section>
        )}

        {step === 'profile' && (
          <Section title="Jak pracujesz?" text="To wpiszemy w profilu i pod to dobierzemy zlecenia.">
            <div className="flex flex-col gap-[8px]" role="radiogroup" aria-label="Rola">
              {ROLES.map((r) => {
                const on = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-start gap-[2px] rounded-[var(--radius-lg)] border bg-[var(--color-bg-surface)] p-[14px] text-left ${
                      on ? 'border-[var(--color-action-primary)] border-2' : 'border-[var(--color-border-default)]'
                    }`}
                  >
                    <span className="text-heading-14 text-[var(--color-text-primary)]">{r.id}</span>
                    <span className="text-caption-12 text-[var(--color-text-secondary)]">{r.sub}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-label-12 text-[var(--color-text-secondary)]">Typ nadwozia</span>
            <div className="grid grid-cols-2 gap-[8px]" role="radiogroup" aria-label="Typ nadwozia">
              {BODIES.map((b) => {
                const on = body === b;
                return (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setBody(b)}
                    className={`h-[44px] rounded-[var(--radius-sm)] border text-label-14 ${
                      on ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-action-text-inverse)]' : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center justify-between gap-[12px] rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[12px]">
              <span className="flex flex-col">
                <span className="text-label-14 text-[var(--color-text-primary)]">Mam uprawnienia ADR</span>
                <span className="text-caption-12 text-[var(--color-text-secondary)]">Bez nich nie wezmiesz towarów niebezpiecznych</span>
              </span>
              <input type="checkbox" checked={adr} onChange={(e) => setAdr(e.target.checked)} className="h-[24px] w-[24px] accent-[var(--color-action-primary)]" />
            </label>

            <PrimaryButton
              disabled={!role}
              onClick={() => {
                bl.register(role ?? 'Własny samochód', body, adr);
                setStep('intro');
              }}
            >
              Zacznij pracę
            </PrimaryButton>
          </Section>
        )}

        {step === 'intro' && (
          <div className="flex flex-col gap-[16px]">
            <div className="flex h-[200px] items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] text-center">
              <span className="text-[40px]" aria-hidden="true">
                {['⟶', '€', '✓'][slide]}
              </span>
            </div>
            <Section title={SLIDES[slide].title} text={SLIDES[slide].text}>
              <div className="flex justify-center gap-[6px]" aria-hidden="true">
                {SLIDES.map((_, i) => (
                  <span key={i} className={`h-[6px] rounded-[var(--radius-pill)] ${i === slide ? 'w-[22px] bg-[var(--color-action-primary)]' : 'w-[6px] bg-[var(--color-border-default)]'}`} />
                ))}
              </div>
              <div className="flex gap-[10px]">
                {slide > 0 && (
                  <button type="button" onClick={() => setSlide(slide - 1)} className="h-[50px] flex-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-label-14 text-[var(--color-text-primary)]">
                    Wstecz
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (slide < SLIDES.length - 1 ? setSlide(slide + 1) : nav('/bl', { replace: true }))}
                  className="h-[50px] flex-1 rounded-[var(--radius-sm)] bg-[var(--color-action-primary)] text-label-14 text-[var(--color-action-text-inverse)]"
                >
                  {slide < SLIDES.length - 1 ? 'Dalej' : 'Zacznij pracę'}
                </button>
              </div>
            </Section>
          </div>
        )}
      </div>
    </BlFrame>
  );
}

function Progress({ step }: { step: string }) {
  const n = { phone: 1, code: 2, profile: 3, intro: 4 }[step] ?? 1;
  return (
    <div className="flex gap-[6px]" aria-label={`Krok ${Math.min(n, 3)} z 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-[4px] flex-1 rounded-[var(--radius-pill)] ${i <= Math.min(n, 3) ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-border-default)]'}`} />
      ))}
    </div>
  );
}

function Section({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex flex-col gap-[6px]">
        <h1 className="text-heading-20 text-[var(--color-text-primary)]">{title}</h1>
        <p className="text-body-14 text-[var(--color-text-secondary)]">{text}</p>
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-[50px] rounded-[var(--radius-sm)] text-label-14 ${
        disabled ? 'bg-[var(--color-bg-disabled)] text-[var(--color-action-text-disabled)]' : 'bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
      }`}
    >
      {children}
    </button>
  );
}
