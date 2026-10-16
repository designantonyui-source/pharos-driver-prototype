/**
 * Prototype demo controls are developer tooling, not part of the product.
 *
 * They render only when the URL explicitly asks for them (`?demo=1`, before or
 * after the hash), so screenshots and public deployments show the product as
 * designed — no "Demo" pill floating over the UI. Presenters still get the full
 * panel for recording flows:  /#/v2?demo=1
 */
const LOCATION = typeof window === 'undefined' ? '' : `${window.location.search}${window.location.hash}`;

export const DEMO_ENABLED = /[?&]demo\b/.test(LOCATION);
