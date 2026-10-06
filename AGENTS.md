# AGENTS.md — how to work in this repo

This is a **1:1 prototype** of the Pharos driver app from Figma (file `sve9YrMmfz91XQX5IpZjGO`,
page `30 — iOS App / Driver`, section `01 · Driver journey` = `2022:2949`).
The prototype leads: design changes go back to Figma afterwards.

## Hard rules

1. **No hardcoded design values.** Colors, radii, spacing, typography come from CSS variables in
   `src/styles/tokens.css` (generated from `design/tokens.json`) or from Tailwind classes built on them.
   Need a new value? Add it to `design/tokens.json` first, run `pnpm tokens`, then use it.
2. **Every component and screen starts with a contract header**:
   ```
   figma: 2767:27747 (details-v2) · Pharos/App/Offer v2
   props: rate, perKm, distance, lane, window, deadhead, company, tone
   tokens: surface/card, border/subtle, text/primary, text/price, radius/md
   ```
3. **One Figma screen = one route + one entry in `design/figma-map.md`.**
   Update the map in the same commit.
4. **Components are composed, never copy-pasted.** If two screens need the same block, it becomes a
   component in `src/components/` with a story.
5. **All user-visible strings are English** (the product language of the Figma file).
6. **Data access goes through `src/lib/api.ts`.** Screens never talk to `localStorage` or `fetch` directly.
7. **Shell metrics are fixed**: screen 402×874, status bar 62, nav bar 76, sticky bar 64, viewport 614,
   tab bar y 757 h 83, home indicator y 840 h 34. Always reuse `src/components/layout/*`.
8. **Every ported component is documented in `design/PORT-LOG.md` in the same commit**: the Figma
   node ids, the variants covered, the deviations found and the measured numbers that prove the match.
   Update `design/figma-map.md` too. The log also lists the traps of this Figma file — read it before
   porting anything, it will save you the same debugging.
9. **A component is not "ported" until it is measured.** Rendering in Storybook proves nothing:
   compare geometry, colours and typography against the Figma numbers with Playwright
   (`channel: 'chrome'`, Storybook already runs on `localhost:6007`). The recipe is in `design/PORT-LOG.md`.

## Definition of done for a screen

- route added and reachable from `/`
- states from Figma reproduced (including loading / empty / error / disabled, where the design has them)
- story added for every component state it introduces
- `design/figma-map.md` updated
- `pnpm dev` renders it and `pnpm build` passes

## Storybook

`pnpm storybook` — one story per component state (mirrors the Figma variants):
`OfferCard` → Default / Loading / Pending; `BottomSheet` → Peek / Full;
`Input` → Empty / Filled / Focus / Error.
`pnpm build-storybook` → `storybook-static/` (publishable as a static site).
