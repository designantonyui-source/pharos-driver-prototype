## Account first slice — approved new proposals, not measured ports

| Route | Implementation | Figma mapping/status |
| --- | --- | --- |
| `/v2/account` | `src/screens/v2/Account.tsx` | New proposal, redesigned (option A): NavigationBar home + grouped iOS rows + dismissed badge; reuses DriverProfile `769:10428`, no screen node assigned |
| `/v2/account/profile` | `Account.tsx` (detail) | New proposal, redesigned (option A): back nav + contact card + Edit CTA; no measured screen mapping |
| `/v2/account/profile/edit` | `Account.tsx` (EditContact) | New prototype-contact-only proposal, redesigned (option A): design-system Inputs + Alerts + skeleton; no auth/OTP |
| `/v2/account/dismissed` | `src/screens/v2/DismissedLoads.tsx` | New proposal, redesigned (option A): back nav + skeleton/empty/error + Restore/Undo, no measured screen mapping |
| `/v2/account/balance` | `src/screens/v2/Balance.tsx` (Balance) | New proposal; Available/Pending card + Cash out CTA + method row + recent-3, no measured screen mapping |
| `/v2/account/balance/method` | `src/screens/v2/Balance.tsx` (PayoutMethodScreen) | New proposal; SEPA IBAN + nickname, mod-97 validation, no measured mapping |
| `/v2/account/balance/cashout` | `src/screens/v2/Balance.tsx` (CashOut) | New proposal; amount + quick chips + confirm Sheet + success, no measured mapping |
| `/v2/account/balance/history` | `src/screens/v2/Balance.tsx` (BalanceHistory) | New proposal; unified trip/withdrawal ledger, no measured mapping |
| `/v2/account/balance/invoices` | `src/screens/v2/Invoices.tsx` (InvoiceList) | New proposal (Wave 2); awaiting hero + rows + CSV, no measured mapping |
| `/v2/account/balance/invoices/:id` | `src/screens/v2/Invoices.tsx` (InvoiceDetails) | New proposal (Wave 2); parties + VAT + PDF + Open trip, no measured mapping |
| `/v2/account/balance/schedules` | `src/screens/v2/Schedules.tsx` (Schedules) | New proposal (Wave 3); rule + destination + runs + statement, no measured mapping |

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
| `586:32` | Pharos/App/Navigation bar Type=Back | `V2BackBar` in `src/components/layout/NavigationBar.tsx` — used by all v2 back screens (tracker, trip, profile, edit, dismissed, balance, method, cashout, history) | done |
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
| `Pharos/App/Driver profile` | `769:10428` | `src/components/DriverProfile.tsx` + `DriverAvatar` (`755:366`, distinct from `Pharos/Avatar`); set state `Show verification#769:5` = own 16-tall row (100 tall) · `verifiedStyle="inline"` polish = shield-check + `Verified` badge on the name line (82 tall, used by `/v2/account`) |
| n/a (new proposal, Wave 3 polish) | — | `src/components/v2/Toast.tsx` + `useToast` — single notification pattern; success/info as top toast under the nav bar (`top: calc(var(--nav-bar-h)+8px)`, z-50, auto-dismiss 4s, `role=status`, 180ms slide-in, `prefers-reduced-motion` off); errors stay inline, confirmations stay in `Sheet` |
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
| `/v2` | Loads — unified List/Map home: default `Anywhere → Anywhere`, direction/filter counts from one `feed.ts`, route-match markers, quick apply, active-trip mini-player; empty state recovers via Clear filters + Change direction. Filter is `€2.50+/km net`; paid trips are history, not inventory. | V2Frame, SmartLoadList, QuickApplyModal, LoadSheet, ApplicationBanner, Sheet, DemoToggle, RouteSheet | prototype |
| `/application/:id` | Unified application tracker: live states only; `EXPIRED` is terminal, rejected/cancelled can reapply; waiting applications run through three steps in ~5s, then open the trip; `autoAdvance: false` keeps one manual; cancel via `CancelApplicationSheet`, dispute via `Sheet`; ended states stay on card + Trips Past | ApplicationTracker, CancelApplicationSheet, Toast | prototype |
| `/trip/:id` | Confirmed trip — одна скролл-поверхность: TRIP_ID + payout в summary, Trip progress stepper, Cargo, Route с адресами/контактами/гейтами + Call на стоп, En-route leg с действием прибытия, Customer + `Contact dispatcher`, Report a delay → `Sheet`, Documents через `TripDocumentsSheet`, handover + POD, Earnings после доставки, cancel через `CancelTripSheet` | TripDetails, TripDocumentsSheet, CancelTripSheet, Sheet, Toast | prototype |
| `/trip/:id/chat` | Тред диспетчера на один рейс — полоса контекста груза, сообщения, системные строки (репорт задержки, хендофф на человека), композер; автоответы помечены «AI dispatcher» | TripChat, ChatCargoContext, MessageBubble, ChatComposer, V2BackBar | prototype |
| `/v2/trips` | Trips hub: active hero, in-review applications, completed ledger rows (paid/pending) and past applications (rejected/expired/cancelled) | `screens/v2/Trips.tsx` — active hero + sections + StatusBlock/empty states | prototype |
| `/v2/account` | Account hub: contact/profile, payout methods entry, dismissed loads, sign-out surface | Account, V2Frame, RowLink | prototype |
| `/v2/account/profile` / `/edit` | Profile detail + contact edit with unsaved-changes guard | Account detail, EditContact, Input | prototype |
| `/v2/account/dismissed` | Dismissed loads with restore | DismissedLoads | prototype |
| `/v2/account/balance` | Balance: available/pending, verified payout method, cash-out CTA, recent activity, documents | Balance, StatusBlock, Toast | prototype |
| `/v2/account/balance/method` | Payout methods: verified IBAN/card, default/remove, add method behind operation-scoped SCA | PayoutMethodScreen, ScaSheet | prototype |
| `/v2/account/balance/cashout` | Manual cash out: destination rail, fee quote, confirm sheet, SCA challenge | CashOut, ScaSheet, Sheet | prototype |
| `/v2/account/balance/withdrawals/:id` | Permanent withdrawal receipt after cash out | WithdrawalDetails | prototype |
| `/v2/account/balance/history` | Ledger history: trips + withdrawals, invoice links | BalanceHistory, LedgerLine | prototype |
| `/v2/account/balance/invoices` / `/:id` | Invoice list + legal invoice detail: seller/buyer registry, route VAT, PDF/CSV export, void state | InvoiceList, InvoiceDetails | prototype |
| `/v2/account/balance/schedules` | Auto-withdraw rule, scheduled runs, accountant CSV | Schedules | prototype |

### Shared load application action

`src/components/v2/LoadCta.tsx` is the sole entry CTA in SmartLoadList (list and map cards) and LoadSheet. It reads per-load applications from `store.getApplicationForLoad(loadId)`, opens QuickApplyModal, and routes to the matching tracker/trip. Applying requires a verified payout method; closed or unreachable pickup blocks the CTA. Pending states cannot resubmit; rejection and cancellation can reapply; `EXPIRED` is terminal and never offers “Apply again”. The API rejects duplicate pending/confirmed applications with `ALREADY_APPLIED`, including concurrent requests. Legacy single-application storage is migrated to the per-load map. No timeout/similar-load block exists in the current source tree; any future such surface should compose LoadCta.

### Feed, time and money contracts (2026-10-20)

- `src/lib/v2/feed.ts` is the only source of direction, filters, counters and eligibility. The header denominator is direction-eligible loads before filters; the numerator is after filters. Empty direction reads `Anywhere → Anywhere`, never a hidden city. Completed paid/pending trips and dismissed loads are excluded from the feed.
- `RouteSheet` opens the towns that carry loads for that half of the route, each with its live count; typing narrows the same list and dead towns appear only when asked for by name. An empty `To` draft keeps the committed destination on apply, and `countForRoute` resolves it the same way. If a dead end is caused by filters, the recovery says `Show N loads anywhere` rather than promising loads toward an empty town.
- Live offers use relative ISO dates/windows (`V2Load.date`, `window`, `approvalsAt`); `approvalsAt` is the apply window, not the post-submit decision deadline. The application snapshots `submittedAt + 20 min` into `approvalsDeadline`; legacy waiting applications are capped by `withApprovalWindow`. `EXPIRED` is the seventh status and terminal. A waiting application advances through `SENT → DISPATCHER_REVIEW → CUSTOMER_REVIEW → CONFIRMED` at 1.5 seconds per step, then opens the trip; `autoAdvance: false` is the manual escape hatch, and a legacy confirmed state does not auto-open. `advanceStatus` still checks the expected status, so a cancel or presenter decision wins a race.
- **Figma deviation — tracker:** the Figma master still has four rows. The shipped prototype uses three rows (`Application sent → Under review → Confirmed`), with `SENT` and both review statuses sharing `Under review` and a `With dispatcher` / `Dispatcher approved · waiting for customer` substatus. The 3-row variant has not been ported to Figma yet; do not describe the tracker port as complete.
- Waiting status never becomes a page banner: the load card carries `In review` and `View status`, and the tracker carries the deadline. `ApplicationBanner` is only the confirmed active-trip mini-player. Ended states (rejected / expired / cancelled / cancelled-after-confirm) also stay on the card and in Trips Past.
- Money: the demo starts with a verified French IBAN because its ledger already contains paid trips; a missing method blocks apply. Adding a payout method and manual cash out each require a fresh `authorizeSca(purpose)` token (`ScaSheet`); auto-withdraw uses a standing mandate. Cancelled trips pay €0, drop the pending ledger line and void the invoice. Invoice VAT is route-based (FR 20%, BE 21%, cross-border 0% reverse charge), seller is the French SAS `Northway Freight SAS`, and `overdue` is computed at read time.

### Loads feed polish (2026-10-11, measured in Chrome on the preview build)

- `shadow-card` is the only shadow utility on the feed: the bare `shadow-[var(--shadow-card)]`
  form never resolved in Tailwind v4 (measured `box-shadow: none`), so card, header, skeleton,
  banner, toast, pins and the empty state all render the `0 6px 20px rgba(23,42,53,.055)` token —
  verified `rgba(23, 42, 53, 0.055) 0px 6px 20px 0px` on the live card. `pnpm check` is green,
  the one remaining build warning (`border-l-[var(--color-status-*-text)]`) is the known
  non-blocking one from AGENT.md.
- `RouteSheet` city chips are real toggles now: the group label mirrors the focused field
  (`From — {origin}` / `To — {destination}`), the tapped city reads `aria-pressed` selected
  with the same filled-primary face as the `FiltersSheet` pills. Unit: chips fill the focused
  field + selected state + label follows focus.
- The vehicle line renders the feed value verbatim (`Box · 8 t · 10 pallets`) — the old
  `km × 0.06` tonnage disagreed with the fixture on 3 of 6 loads (e.g. `7.5 t` vs `6.7 t`).
- The direction header counts loads, not trips (`2 loads`, plural-aware in label and badge).
- The empty state names the recovery (`No loads match — try widening the search.`) and offers
  both `Clear filters` and `Change direction` (new `onOpenRoute`, wired in `Home.tsx`);
  Map pins gained anchors for the three new Paris/Amsterdam feed loads.

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

## Продолжение 2026-10-16: чат диспетчера, AI-диспетчер, скролл рейса

Новый роут `/trip/:id/chat` — в таблице выше. Файл потока: `design/flows/dispatcher-chat.md`.
Разбор индустрии (6 продуктов) и обоснование AI лежат в кейсе: `dispatcher-communication-analysis.md`.

- **Смысл канала зафиксирован ДО отрисовки:** чат здесь не мессенджер, а канал исключений. На чистом рейсе сообщений быть не должно;
  каждое сообщение на сломанном должно конвертироваться в пруф, деньги или закрытие. Отсюда все решения ниже.
- **Убрана декоративная карта маршрута** (`RoutePreview`): была `aria-hidden`, `pointer-events-none`, занимала 190px из ~635px вьюпорта
  и дублировала строку маршрута. Вместе с ней ушли дубли кнопок: 2 иконки «в Maps» на стопах (тот же `goNavigate()`, что у sticky-primary)
  и полноширинная «Message dispatcher» (дубль входа). Кнопок 9 → 6.
- **Задержка и разговор — одно событие:** `reportDelay()` пишет системную строку в тот же тред, а не шлёт отдельный тост.
  Это денежный хук: отсюда позже вырастает строка detention в Earnings.
- **AI-диспетчер** — детерминированный мок без LLM (`chat.ts: aiDispatcherReply`): отвечает на рутину фактами рейса, эскалирует человеку
  деньги / detention / отмену, подписан честно (`automated` → «AI dispatcher»). Реальная модель встаёт за тем же интерфейсом `api.ts`,
  не трогая экраны. Позиционирование (почему на стороне диспетчера, а не водителя) — в §7 того же анализа.
- **Баг скролла (замерен, не на глаз):** блок кнопок лежал ВНЕ скролл-контейнера, а sticky-бар его накрывал — кнопки занимали 597–757
  при баре 688–757, поэтому `Cancel trip` была недостижима, а `Report a delay` наполовину скрыта; на стадии `delivered` блоки Earnings/POD
  тоже были вне скролла и сжимали его почти в ноль. Исправлено: один скролл-лист + `pb-[calc(var(--sticky-bar-h)+16px)]`.
  Замер после: `confirmed` 974/635, доскроллено до конца, `Cancel trip` 629–677 против бара 688; `delivered` 1222/635.
- **Подпись входа вернули.** В `3256bcb` подписанная, но мёртвая кнопка «Contact dispatcher» (только тост «not connected») была заменена
  на рабочую, но голую иконку в навбаре — водитель не понимал, что это, а телефонный глиф молча стал глифом чата. Теперь один подписанный
  вход: secondary-кнопка в карточке Customer, иконка `message-square` (канал: тред, не звонок), навбарная иконка убрана. E2E кликает кнопку
  до треда и обратно, поэтому подпись больше не может стать декоративной незаметно.
- **Деструктивное действие снова выглядит деструктивным.** `Cancel trip` был понижен до тихого teal-линка (`ButtonLink`) — исчезла
  единственная важная для водителя информация: что действие необратимо. Добавлен **prototype-led вариант `danger`** у `Button` (в Figma-сете
  только Primary/Secondary, поэтому нужно вернуть в Figma): белая заливка, бордер и лейбл `color/danger` (#b8332f), hover/pressed —
  `color/status/danger/bg`. Сознательно НЕ залитая красная плита: она конкурировала бы с primary. Контраст лейбла 5.91:1 (AA).
  Применён в двух местах: кнопка на экране рейса и подтверждение в `CancelTripSheet` (было `primary`, то есть деструктивное красилось как главное).
  Замер рендера: лейбл и бордер `rgb(184,51,47)`, фон белый; стори `Button / Danger{,Disabled,Loading,Focus}`.
- **Внутренние строки:** ошибка размера POD, internal throw и assumption-нота больше не содержат слова prototype; роут `/prototype-index` → `/screens`.
- Проверено: unit 160/160, Playwright Chrome 15/15, `pnpm check` чистый. Живой прод проверен отдельно (скролл и вход в чат).
- Открыто: вложения в треде (фото/голос), бейдж непрочитанных, проактивный входящий, detention-кнопка в треде, состояние закрытия исключения.
