## Account first slice — approved new proposals, not measured ports

| Route | Implementation | Figma mapping/status |
| --- | --- | --- |
| `/v2/account` | `src/screens/v2/Account.tsx` | New proposal, redesigned (option A): NavigationBar home + grouped iOS rows + dismissed badge; reuses DriverProfile `769:10428`, no screen node assigned |
| `/v2/account/profile` | `Account.tsx` (detail) | New proposal, redesigned (option A): back nav + contact card + Edit CTA; no measured screen mapping |
| `/v2/account/profile/edit` | `Account.tsx` (EditContact) | New prototype-contact-only proposal, redesigned (option A): design-system Inputs + Alerts + skeleton; no auth/OTP |
| `/v2/account/dismissed` | `src/screens/v2/DismissedLoads.tsx` | New proposal, redesigned (option A): back nav + skeleton/empty/error + Restore/Undo, no measured screen mapping |

Uses existing tokens, V2Frame, Button and Sheet. See PORT-LOG Account first slice for scope and checks. These entries do not assert Figma fidelity of the proposed layouts.


# Figma ↔ code map

File: `sve9YrMmfz91XQX5IpZjGO` · page **30 — iOS App / Driver** · section **01 · Driver journey** (`2022:2949`)

| Figma node | Name | Route / component | Status |
|---|---|---|---|
| `2022:2949` | section «01 · Driver journey» | — | reference |
| `2689:15268` | iOS / map-unfiltered / NordCargo | `/v2` (Map tab) | replaced |
| `2767:27747` | iOS / details-v2 / NordCargo | `/v2` (load sheet) | replaced |
| `2219:8598` | iOS / search-pending-dispatcher / Loads | `/application/:id` | replaced by ApplicationTracker |
| `589:267` | iOS / pending / Application status | `/application/:id` | replaced by ApplicationTracker |
| `735:1152` | iOS / pending-customer / Application status | `/application/:id` (`CUSTOMER_REVIEW`) | replaced by ApplicationTracker |
| `589:334` | iOS / order / Trip TR-4821 | `/trip/:id` | prototype-led TripDetails (not a measured Figma port) |
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
| `Pharos/App/Route summary` | `671:977` | `src/components/RouteSummary.tsx` — page 30 (6 instances, marker rail + From/To rows). The Loads screens use a local frame `2668:14790` «Route summary v2» 370×78 |
| `Pharos/Route summary` | `26:27` | `src/components/RouteSummaryWeb.tsx` — a DIFFERENT component from `671:977`: the 358×170 mobile-web summary of page 21 (3 instances in the 390-wide screens, 1 in a 1440 frame) |
| `Pharos/Load card` | `14:146` | `src/components/LoadCard.tsx` — Mobile/Desktop × Available/Requested/Assigned |
| `Pharos/Rate offer card` | `384:368` | `src/components/RateOfferCard.tsx` — Proposed `384:356` / Counter `384:360` / Accepted `384:364` |
| `Pharos/Payment summary` | `412:389` | `src/components/PaymentSummary.tsx` — Pending `412:347` / Early available `412:361` / Received `412:375` |
| `Pharos/Offer preview` | `26:73` | `src/components/OfferPreview.tsx` — Desktop `106:17` `106:35` / Mobile `26:35` `26:53` (all 32 instances are Desktop; Figma cannot render this set) |
| `Pharos/App/Route card` | `2715:1535` | `src/components/RouteCard.tsx` — Addresses=Expected `2715:1465` / Known `2715:1500` |
| `Pharos/Route map` | `330:164` | `src/components/RouteMap.tsx` — Size=Desktop `330:2` `330:33` `330:67` / Size=Mobile `330:84` `330:114` `330:147`; artwork in `src/assets/maps` |
| `Pharos/App/Approach map` | `719:355` | `src/components/ApproachMap.tsx` — artwork `719:356` exported to `src/assets/maps/approach-402x646.svg` |
| `Pharos/App/Trip checklist` | `2715:1596` | `src/components/TripChecklist.tsx` — only `State=Awaiting` `2715:25520` (used by Bottom sheet Content=Request) |
| `Pharos/App/Progress step` | `2553:1238` | `src/components/ProgressStep.tsx` — Done `2553:1225` / Current `2553:1231` / Next `2553:1237`; shared by Trip steps and Application progress |
| `Pharos/Select` | `344:51` | `src/components/Select.tsx` — Closed `344:26` / Open `344:32` / Disabled `344:45` (redrawn, not composed from `Input`) |
| `Pharos/App/Offer route` | `693:995` | `src/components/OfferRoute.tsx` — the `View map` affordance is hidden in the component and in all 8 instances |
| `Pharos/Empty details panel` | `129:46` | `src/components/EmptyDetailsPanel.tsx` — icon is an INSTANCE_SWAP; the Refreshing copy uses `Lucide/Icon/Loader` |
| `Pharos/App/Offer terms` | `693:1013` | `src/components/OfferTerms.tsx` — **hidden in Figma with all 6 instances**, export is a 1×1 PNG, so it has no visual reference |
| `Pharos/Location suggestions` | `190:117` | `src/components/LocationSuggestions.tsx` — Results `190:59` / Loading `190:85` / Empty `190:98` / Error `190:107`; the flag swap is the round flag component `198:1640`/`198:1645`, not the rectangular `249:1646` |
| `Pharos/App/Keyboard` | `2776:1613` | `src/components/AppKeyboard.tsx` — a static visual mock (31 keys, no focus/interaction, as in Figma) |
| `Pharos/App/Upload field` | `2013:3064` | `src/components/UploadField.tsx` — Empty `2013:3060` / Chosen `2013:3061` / Rejected `2013:3062` / Uploading `2013:3063`; the 1.5px dashed stroke is an SVG overlay |
| `Pharos/Upload field/Driving licence preview` | `2091:441` | `src/components/DrivingLicencePreview.tsx` — built on top of `UploadField` via `preview` / `previewTone` |
| `Pharos/Message bubble` | `384:355` | `src/components/MessageBubble.tsx` — Incoming `384:347` / Outgoing `384:351`, plus `skin="plain"` for the 15 page-30 instances |
| `Pharos/Chat/Cargo context` | `2188:8055` | `src/components/ChatCargoContext.tsx` |
| `Pharos/Chat/Composer` | `2188:7944` | `src/components/ChatComposer.tsx` — Empty `2188:7863` / Draft `2188:7896` / Disabled `2188:7913` |
| `Pharos/Chat/Rate offer` | `2189:8453` | `src/components/ChatRateOffer.tsx` — Pending `2188:8107` / Accepted `2188:8129` (a different component from `Rate offer card` `384:368`) |
| `Pharos/App/Onboarding progress` | `2062:410` | `src/components/OnboardingProgress.tsx` — Filled=1..5 |
| `Pharos/App/Driver profile` | `769:10428` | `src/components/DriverProfile.tsx` + `DriverAvatar` (`755:366`, distinct from `Pharos/Avatar`) |
| `Pharos/App/Trip steps` | `2728:26593` | `src/components/TripSteps.tsx` — 8 variants |
| `Pharos/App/Day item` | `2021:2666` | `src/components/DayItem.tsx` — Trip / Decision / Free |
| `Pharos/App/Trip preparation` | `2715:1617` | `src/components/TripPreparation.tsx` — 4 variants |
| `Pharos/App/Application progress` | `734:426` | `src/components/ApplicationProgress.tsx` — 5 variants (Direct/DirectAssigned are never instanced) |
| `Pharos/App/View switch` | `2041:411` | `src/components/ViewSwitch.tsx` — 5 variants |
| `Pharos/Filters button` | `2646:1314` | `src/components/FiltersButton.tsx` — Badge=Shown `2646:1288` / Hidden `2646:1302` |
| `Pharos/Filter chip` | `338:211` | `src/components/FilterChip.tsx` |
| `Pharos/Filter chip v2` | `2621:1288` | `src/components/FilterChipV2.tsx` — Default / Selected / Disabled / Applied `2650:1306` |
| `Pharos/Route search + filters` | `340:404` | `src/components/RouteSearch.tsx` — **desktop, 1112 wide, page 21**; the phone sticky bar is a screen-local frame `2668:14779` |
| `Pharos/Sidebar` | `82:150` | `src/components/Sidebar.tsx` — **web chrome, page 21** — Role=Driver `82:146` / Dispatcher / FleetManager / Admin |
| `Pharos/Page header` | `167:65` | `src/components/PageHeader.tsx` — **web chrome, page 21** — Inline `167:49` / Actions `167:57` |
| `Pharos/Mobile header` | `26:24` | `src/components/MobileHeader.tsx` — **mobile web, page 21** — Type=Home `26:8` / Type=Back `26:13`; not the iOS `NavigationBar` |
| `Pharos/App/Tab bar` | `586:67` | `src/components/layout/TabBar.tsx` — Active=Loads/Applications/My day/Account |
| `Pharos/App/Status bar` | `2353:26430` | `src/components/layout/StatusBar.tsx` — Type=IOS `2305:25330` / Type=Default `586:20` |
| `Pharos/App/Navigation bar` | `586:33` | `src/components/layout/NavigationBar.tsx` — Type=Home `586:25` / Type=Back `586:32` |
| `Pharos/App/Home indicator` | `586:70` | `src/components/layout/HomeIndicator.tsx` |
| — (402×874 screen) | — | `src/components/layout/ScreenFrame.tsx` — composes the five shell parts |
| Icons (23 components) | `03 — Icons` page `9:5` | `src/components/Icon.tsx` — one registry; Figma↔lucide mapping in `design/PORT-LOG.md` §5 |

## Shell metrics (fixed by the design)

screen 402 × 874 · status bar 62 · nav bar 76 · sticky bar 64 · content viewport 614 ·
tab bar y 757 h 83 · home indicator y 840 h 34

## v2 — simplified driver journey (prototype-led, branch `driver-v2`)

No Figma node yet: these screens lead and go back to Figma afterwards. Source of truth for flow logic:
`design/DRIVER-FLOWS.md` + `~/pharos-driver-flow-stories.md`. Old Figma-measured screens above are untouched.

| Route | Screen | Components (new, `src/components/v2/`) | Status |
|---|---|---|---|
| `/v2` | Loads — unified List/Map home: filters, route-match markers, quick apply, live banner | V2Frame, SmartLoadList, QuickApplyModal, LoadSheet, ApplicationBanner, Sheet, DemoToggle | prototype |
| `/application/:id` | Unified application tracker (replaces Pending screens); `?scenario=approve` (default) / `?scenario=reject`; rejection reason, similar loads and appeal mock | ApplicationTracker | prototype |
| `/trip/:id` | Confirmed trip — pickup/delivery windows, price, customer rating, navigation/documents demos | TripDetails | prototype |
| `/v2/trips` | Trips (Applications + My day merged) | placeholder `screens/v2/Soon.tsx` | todo |
| `/v2/account` | Account | placeholder `screens/v2/Soon.tsx` | todo |

### Shared load application action

`src/components/v2/LoadCta.tsx` is the sole entry CTA in SmartLoadList (list and map cards) and LoadSheet. It reads per-load applications from `store.getApplicationForLoad(loadId)`, opens QuickApplyModal, and routes to the matching tracker/trip. Pending states cannot resubmit; rejection opens the reason; cancellation permits reapplying. The API rejects duplicate pending/confirmed applications with `ALREADY_APPLIED`, including concurrent requests. Legacy single-application storage is migrated to the per-load map. No timeout/similar-load block exists in the current source tree; any future such surface should compose LoadCta.

### Stateful load cards

`src/components/v2/LoadCard.tsx` composes LoadCta for both list and map. CARD_STATE_STYLES defines the five
application states; the pill (`badge`) carries state through the `color-status-*` `-bg`/`-text` pair, and
`container` is the shared `bg-surface` for all states (the 4px left accent was removed 2026-10-10 at the
client's request — see PORT-LOG §4.11 deviation note). Booked cards show a minute-updated countdown from pickupTime and the demo trip identifier. Stable sorting pins booked, then pending, followed by available in existing feed order, then rejected/cancelled. Card taps open trip / tracker / details as appropriate; interactive CTA/modal events do not trigger the card action. State is expressed through the `color-status-*` palette only: the pill takes the `-bg`/`-text` pair, so one meaning has one colour. The earlier `color-load-state-*` group was removed — it was a second palette for the same five states, it double-encoded the state (card fill plus pill), it left the pill invisible on its own card (1.05:1) and its accents failed contrast on their own fill (2.07–3.44:1). Every pair now measures >= 5.2:1. The rate renders in `text-metric-28`, matching OfferCard, OfferTerms, LoadSheet and the v1 LoadCard; state pills use lucide glyphs (`clock`, `circle-check`, `circle-x`, `x`) and the carrier rating uses the `star` icon instead of raw Unicode.


## Продолжение 2026-10-10: отмена трипа

Подключён CancelTripSheet к `/trip/:id`: причина, подтверждение, loading/error, Keep trip.
После отмены itinerary остаётся доступным со статусом Cancelled by you; действия Navigation/Documents скрыты.
Предупреждение явно демонстрационное: политика не утверждена, реальный штраф не применяется.
Store сохраняет метаданные при set/read; restore удаляет только dismissed-запись; новая заявка очищает dismissed.
Проверено: vitest 63/63, Playwright Chrome 7/7 (включая отмену и сохранение причины/tripId), pnpm check проходит.
Геометрия относительно Figma не измерена: это prototype-led дополнение, не подтверждённый 1:1 порт.
Открыто: утверждение политики, проверка undo на карте и перезагрузки, дополнительные UI-тесты и замеры.
