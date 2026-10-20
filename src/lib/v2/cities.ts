/**
 * v2 · cities — the predefined towns a direction can be set to.
 *
 * The direction sheet needs a stable, curated list: a driver has to be able to
 * reach a town by typing two letters ("Br" → Brussels), and the picker has to
 * offer the same spelling the loads use. The feed's own towns are merged in, so
 * a lane to a town that is not on this list still shows up — the list grows,
 * it never shrinks.
 *
 * props: none (data only)
 * tokens: none — data only
 */

/** The corridor this prototype routes over. Alphabetical — the picker sorts anyway. */
export const KNOWN_CITIES = [
  'Amsterdam',
  'Antwerp',
  'Brussels',
  'Calais',
  'Ghent',
  'Lille',
  'Paris',
] as const;

const norm = (city: string) => city.trim().toLocaleLowerCase();

/**
 * Curated towns plus any town the feed knows that the curated list misses.
 * Sorted alphabetically so the picker never reorders under the driver.
 */
export function mergeCities(feedCities: string[]): string[] {
  const known = [...KNOWN_CITIES];
  const extra = feedCities.filter(
    (city) => city.trim() !== '' && !known.some((k) => norm(k) === norm(city)),
  );
  return [...known, ...extra].sort((a, b) => a.localeCompare(b));
}
