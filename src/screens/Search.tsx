import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { ScreenFrame } from '../components/layout/ScreenFrame';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

/**
 * figma: 2772:12931 · iOS / first-search-v2.1 / Loads (refined) — route `/search`
 *
 *   status bar 62 (instanced without the Dynamic Island) · nav bar Type=Home, title "Loads", 76
 *   "First search / Setup" from y138, pad 16 top 24:
 *     heading 24/32 Manrope Bold at y162 · Input "Start" y214 (76, hint hidden) ·
 *     Input "Destination (optional)" y310 (76) — both Size=Mobile State=Empty
 *   "Bottom actions" y629, pad 16 top 8, gap 8:
 *     Button Secondary "Use my location" y637 with a trailing map pin ·
 *     Button Primary State=Disabled "Find loads" y693
 *   tab bar y757 Active=Loads · home indicator y840
 *
 * props: initialOrigin, initialDestination (deep links / stories)
 * tokens: color-text-primary; everything else comes from Input, Button and the shell
 *
 * Figma only draws the disabled State of "Find loads"; here it enables once the origin is set,
 * which is the behaviour the design implies. Navigation to the results screen is not wired yet —
 * that screen does not exist.
 */
export function Search({
  initialOrigin = '',
  initialDestination = '',
}: {
  initialOrigin?: string;
  initialDestination?: string;
}) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);

  return (
    <ScreenFrame title="Loads" activeTab="Loads">
      <div className="absolute inset-x-0 top-[138px] px-[16px] pt-[24px]">
        <h2 className="text-heading-24 text-[var(--color-text-primary)]">Find loads on your route</h2>
        <div className="mt-[20px] flex flex-col gap-[20px]">
          <Input
            label="Start"
            placeholder="Start typing a city"
            hint={null}
            value={origin}
            state={origin ? 'filled' : 'empty'}
            onChange={setOrigin}
          />
          <Input
            label="Destination (optional)"
            placeholder="Start typing a city"
            hint={null}
            value={destination}
            state={destination ? 'filled' : 'empty'}
            onChange={setDestination}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 top-[629px] flex flex-col gap-[8px] px-[16px] pt-[8px]">
        <Button
          label="Use my location"
          appearance="secondary"
          icon={<MapPin size={20} strokeWidth={2} />}
        />
        <Button label="Find loads" disabled={origin.length === 0} />
      </div>
    </ScreenFrame>
  );
}
