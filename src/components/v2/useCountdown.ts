import { useEffect, useState } from 'react';

/** h:mm countdown to a fixed deadline; ticks every 30 s (no seconds — calm, not stressful). */
export function useCountdown(minutes: number) {
  const [deadline] = useState(() => Date.now() + minutes * 60_000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.ceil((deadline - now) / 60_000));
  const h = Math.floor(left / 60);
  const m = String(left % 60).padStart(2, '0');
  return { left, label: `${h}:${m}`, urgent: left <= 30 };
}
