# Figma ↔ code map

File: `sve9YrMmfz91XQX5IpZjGO` · page **30 — iOS App / Driver** · section **01 · Driver journey** (`2022:2949`)

| Figma node | Name | Route / component | Status |
|---|---|---|---|
| `2022:2949` | section «01 · Driver journey» | — | reference |
| `2689:15268` | iOS / map-unfiltered / NordCargo | `/map` | todo |
| `2767:27747` | iOS / details-v2 / NordCargo | `/load/:id` | todo |
| `2219:8598` | iOS / search-pending-dispatcher / Loads | `/loads?applied=:id` | todo |
| `589:267` | iOS / pending / Application status | `/application/:id` | todo |
| `735:1152` | iOS / pending-customer / Application status | same route, `status=awaiting-customer` | todo |
| `589:334` | iOS / order / Trip TR-4821 | `/trip/:id` | todo |
| `2772:12931` | iOS / first-search-v2.1 / Loads | `/search` | done |
| `2768:6789` | iOS / searching-v2 / Loads | `/search/loading` | todo |

## Component map (Figma component set → code component)

| Figma set | Node | Code |
|---|---|---|
| `Pharos/App/Offer` (v2 card) | `2594:22063` | `src/components/OfferCard.tsx` — states Default `2549:12618` / Disabled `2594:21989` / Loading `2594:22017` / Pending `2718:2176` (+ hidden `Decision timer`, opt-in) |
| `Pharos/Bottom sheet` | `2197:8841` | `src/components/BottomSheet.tsx` (surface + `BottomSheetHeader` + `VehicleMatchingLine` + `SheetHint`) composed with `RouteFields.tsx` · `SuggestionCard.tsx` · `SheetField.tsx` · `TripChecklist.tsx` · `SortBy.tsx` — 13 variants: Content=Route (Route filled `2197:7919` · Origin current `2197:7975` · Destination current `2197:8028` · Route filled vehicle `2197:8081` · Route empty `2197:8167` · Route origin selected `2197:8222` · Origin suggestions `2197:8277` · Destination suggestions `2197:8330` · Route empty vehicle `2197:8383` · Route origin selected vehicle `2197:8438`) · Content=Price (Price offer `2197:8777`) · Content=Request (Trip data `2715:25486`) · Content=Sort (Sort by `2767:27860`) |
| `Pharos/Input` | `12:166` | `src/components/Input.tsx` — Empty / Filled / Focus / Error / Disabled / Readonly (+ hidden `Required` layer) |
| `Pharos/Status` | `11:148` | `src/components/StatusPill.tsx` — 6 tones (Neutral `11:142` · Info `11:143` · Success `11:144` · Warning `11:145` · Danger `11:146` · Match `11:147`), one story each |
| `Pharos/Avatar` | `74:64` | `src/components/Avatar.tsx` — Size=Small `74:56` / Size=Medium `74:57` |
| `Pharos/Country flag Rectangle` | `249:1646` | `src/components/Flag.tsx` — Country=France `249:1647` / Country=Belgium `249:1649` (set 24×24, app instances 18×18) |
| `Pharos/Alert` | `575:9632` | `src/components/Alert.tsx` — Info / Warning / Error / Success / Neutral |
| `Pharos/Button` | `12:38` | `src/components/Button.tsx` |
| `Pharos/Button link` | `168:118` | `src/components/Button.tsx` — exports `ButtonLink` |
| `Pharos/Information section` | `2576:2265` | `src/components/InformationSection.tsx` — Wide `140:49` / Compact Payment `2466:14783` · `14795` · `14807` |
| `Pharos/App/Route summary` | `671:977` | `src/components/RouteSummary.tsx` — page 30 (6 instances). Page 21 uses `Pharos/Route summary` `26:27` (358×170, 4 instances, not ported yet), and the Loads screens use a local frame `2668:14790` «Route summary v2» 370×78 |
| `Pharos/Load card` | `14:146` | `src/components/LoadCard.tsx` — Mobile/Desktop × Available/Requested/Assigned |
| `Pharos/Rate offer card` | `384:368` | `src/components/RateOfferCard.tsx` — Proposed `384:356` / Counter `384:360` / Accepted `384:364` |
| `Pharos/Payment summary` | `412:389` | `src/components/PaymentSummary.tsx` — Pending `412:347` / Early available `412:361` / Received `412:375` |
| `Pharos/Offer preview` | `26:73` | `src/components/OfferPreview.tsx` — Desktop `106:17` `106:35` / Mobile `26:35` `26:53` (all 32 instances are Desktop; Figma cannot render this set) |
| `Pharos/App/Route card` | `2715:1535` | `src/components/RouteCard.tsx` — Addresses=Expected `2715:1465` / Known `2715:1500` |
| `Pharos/App/Trip checklist` | `2715:1596` | `src/components/TripChecklist.tsx` — only `State=Awaiting` `2715:25520` (used by Bottom sheet Content=Request) |
| `Pharos/App/Tab bar` | `586:67` | `src/components/layout/TabBar.tsx` — Active=Loads/Applications/My day/Account |
| `Pharos/App/Status bar` | `2353:26430` | `src/components/layout/StatusBar.tsx` — Type=IOS `2305:25330` / Type=Default `586:20` |
| `Pharos/App/Navigation bar` | `586:33` | `src/components/layout/NavigationBar.tsx` — Type=Home `586:25` / Type=Back `586:32` |
| `Pharos/App/Home indicator` | `586:70` | `src/components/layout/HomeIndicator.tsx` |
| — (402×874 screen) | — | `src/components/layout/ScreenFrame.tsx` — composes the five shell parts |
| Icons (23 components) | `03 — Icons` page `9:5` | `src/components/Icon.tsx` — one registry; Figma↔lucide mapping in `design/PORT-LOG.md` §5 |

## Shell metrics (fixed by the design)

screen 402 × 874 · status bar 62 · nav bar 76 · sticky bar 64 · content viewport 614 ·
tab bar y 757 h 83 · home indicator y 840 h 34
