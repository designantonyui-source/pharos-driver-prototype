## Unified back navigation — V2BackBar (all v2 screens)

Problem: three different back patterns coexisted — (1) Account/Balance/Dismissed used measured `NavigationBar type=back` with a fixed-route `navigate(backTo)`; (2) ApplicationTracker/TripDetails used a hand-rolled header (40px circle button, not the measured 44px bar) plus underline text-links `Back to loads`; (3) Home/Soon had no header at all. Behaviour also differed: fixed-route jumps lose the user's real history (deep link -> back -> wrong place).

Fix: `V2BackBar` in `src/components/layout/NavigationBar.tsx` (+ `useV2Back` hook) — the measured Type=Back bar (44x44, chevron-left 20/2px, Heading/20 title), with history-back-first behaviour and a per-screen fallback route. Convention documented in the NavigationBar contract header (AGENTS.md #2).

Applied:
- `ApplicationTracker` (main + loading/empty states): custom header -> V2BackBar `fallback=listPath`; underline `Back to loads` link -> secondary `Button`.
- `TripDetails` (main + empty state): custom header -> V2BackBar `fallback=/application/:id`; underline link -> secondary `Button` with `useV2Back('/v2')`.
- `AccountFrame`, `BalanceFrame`, `DismissedLoadsView`: fixed `navigate(backTo)` -> V2BackBar history-back + same fallback (deep-link safe).
- E2E `application-flow.spec.ts`: tracker assertions no longer depend on the visible h1 (now sr-only under the nav bar); back affordance is `button Back`, not `link Back to loads`.
- Storybook: `V2Back` story under App shell/Navigation bar; Icon gallery picks up wallet/landmark/history automatically from the registry.

No new tokens. `pnpm test` 91 passed; `pnpm check` passes (token audit + tsc + build, existing wildcard CSS warning only).

---

## Wave 3 — payout discipline (schedules, adjustments, statement)

New proposal, not a measured Figma port. Only NavigationBar (586:33), Button (12:38),
Input (12:166), Alert (575:9632), V2Frame shell and tokens are reused as measured components.

What changed and why:

1. **Schedules** (`payoutSchedule` in store + `Schedules` screen): off / threshold
   (default EUR 500, editable, min EUR 10) / weekly Friday. Destination picker over
   saved methods. Rule shape is production-identical — only the runner differs
   (prototype: evaluated on Balance open; production: server cron/webhook).
2. **Auto execution** (`evaluateSchedule`): threshold fires at/above the mark,
   weekly fires once per Friday; both skip unverified methods and below-minimum
   balances. Each run writes a `ScheduledRun` record + a normal `processing`
   withdrawal line (provider ref included). Balance shows a success Alert when
   a run fires on open.
3. **Adjustments** (explicit ledger kind): dispute / damage / bonus / correction
   with mandatory note + optional trip link. Positive and negative amounts both
   flow through `getBalance`. Never a silent edit — the Wave 3 discipline rule.
   Rendered in History with reason label, note, date and Applied state.
4. **Accountant export** (`ledgerToCsv`): every ledger line
   (trips, withdrawals with rail+fee, adjustments with reason) + invoice CSV
   from Wave 2. Statement button lives next to the schedule rule.
5. Entry from Balance Documents section (`Auto-withdraw` row) + index link.

Coverage: `pnpm test` 104 passed (was 99: +5 Schedules); `pnpm check` passes;
E2E covers rule save + runs list in Chrome.

---

## Wave 2 — invoices (list, details, PDF, CSV)

New proposal, not a measured Figma port. Only NavigationBar (586:33), Button (12:38),
Alert (575:9632), V2Frame shell and tokens are reused as measured components.
Mobbin reference (2026-10-11): Jobber, Fresha, PayPal, Faire, Starlink, Deel contractor
invoice — common skeleton list (number/date/amount/status) -> details (parties, lines,
VAT, totals) -> Download. Closest model: Deel/Remote generate the invoice per payout.

What changed and why:

1. **Invoice ledger** (`src/lib/invoices.ts`): `Invoice` type (seller/buyer blocks,
   lines, VAT rate + amount + reverse-charge note), seed = one invoice per mock trip
   (INV-2026-0042 pending EUR 360, -0038 paid EUR 210, -0031 paid EUR 290),
   `getInvoices/getInvoice/getInvoiceForLoad`, `invoicesToCsv` for the accountant.
2. **PDF without dependencies** (`src/lib/invoicePdf.ts`): self-contained A4 print
   document (own ink-on-paper stylesheet, no app tokens) opened in a print window;
   the driver picks Save-as-PDF. Selectable text, exact VAT math, no jsPDF.
3. **List** (`InvoiceList`): awaiting-payment hero card, rows with number/company/
   lane/date + amount + Paid/Pending/Overdue chip, Export-CSV button, empty state.
4. **Details** (`InvoiceDetails`): parties (Northway Freight SPRL FR VAT /
   customer BV + VAT), lines, Net/VAT 0%/Total, reverse-charge Alert (Art. 196),
   Download PDF + Open trip actions, not-found Alert state.
5. **Two-way links**: Balance Documents section -> invoices; History trip rows ->
   their invoice (chevron + `invoice` note); invoice -> trip via Open trip.
6. Prototype VAT default: intra-EU B2B 0% reverse charge — explicitly NOT an
   approved tax scheme (PAYMENTS-VISION.md §7).

Coverage: `pnpm test` 99 passed (was 95: +4 Invoices); `pnpm check` passes;
E2E covers list -> details -> PDF popup -> history link in Chrome.

---

## Wave 1 — payout methods v2 (PSP adapter + card + multi-methods)

New proposal, not a measured Figma port. Only NavigationBar (586:33), Button (12:38),
Input (12:166), Alert (575:9632), V2Frame shell and tokens are reused as measured components.

What changed and why:

1. **PSP adapter** (`src/lib/psp.ts`): `PayoutProvider` interface + `MockPayoutProvider`
   + `PROTOTYPE_FEES` (SEPA free/1-2 days, instant-card EUR 1.50/30 min).
   `api.ts` talks only to the interface — swapping in Stripe/Adyen changes no screen.
   Production wiring sketch in the contract header. Policy still prototype-only.
2. **Multi-methods**: `payoutMethod` (single) -> `payoutMethods` (list with
   `id/kind/isDefault/verified`). Wave-0 stores migrate on read
   (`migrateLegacyMethod`). Default-first ordering, remove keeps one default.
3. **Card**: form (number + Luhn, brand detect Visa/MC/Amex, expiry MM/YY, CVC 3/4,
   holder) -> `tokeniseCard` -> only `token/last4/brand` leave the handler; PAN never
   persisted (covered by a localStorage assertion test). Masked display `Visa .... 4242`.
4. **Verifying states**: new methods save as `verified: false`, flip to `true` after
   a mock round-trip (production: micro-deposits/open banking). Cash out refuses
   unverified methods with a dedicated error.
5. **Rail picker in Cash out**: radio list of methods, per-rail quote
   (fee + ETA), live remainder hint, confirm Sheet names the rail + fee + ETA.
   Withdrawal ledger lines carry `rail` + `fee` + provider ref (`mock_sepa_*`/`mock_card_*`).
6. **Methods screen** replaces the single-IBAN form: saved list (default/remove),
   IBAN + Card tabs, same design-system inputs and Alerts.

Coverage: `pnpm test` 95 passed (was 91: +8 Balance Wave-1, +3 card/IBAN unit, -1
replaced Account dismissed-count test, +1 Earnings entry test); `pnpm check` passes
(token audit + tsc + build, existing wildcard CSS warning only);
E2E `e2e/balance.spec.ts` covers SEPA flow + card instant-fee quote in Chrome.

---

## Balance first slice — new proposal (not a measured Figma port)

Routes: `/v2/account/balance`, `/v2/account/balance/method`, `/v2/account/balance/cashout`, `/v2/account/balance/history`.
These screens are approved prototype proposals, **not geometry/typography measured ports**. Only NavigationBar (`586:33`), Button (`12:38`), Input (`12:166`), Alert (`575:9632`), DriverProfile identity (`769:10428`), V2Frame shell and tokens are reused as measured components.

Mobbin reference (2026-10-11): ~30 wallet screens + 4 payout flows scanned — DoorDash Dasher (Payout methods + Payout history flows), Grab Driver, Uber Eats, BlaBlaCar (Add payout methods, 7 steps), Upwork, Deel (EU contractor IBAN), Turo, Upside (Cashing out to bank account, 7 steps), Vinted. Common skeleton everywhere: Available / Pending -> Cash out CTA -> method (bank/IBAN) -> amount -> review/confirm -> success -> history. Instant card payout exists in US apps only; EU flow is SEPA/IBAN with 1-2 day ETA — that is what we prototype.

Design decisions (Pharos specifics):

1. Available vs Pending split — mirrors customer net-7/14 terms already in the loads (`paidIn: Paid in 7/14 days`): settled trips (NordCargo EUR 360, BelRoute EUR 210) are Available; the newest trip (Cote Fret EUR 290) is Pending with `pending — released when the customer pays`. Dismiss/hide never touches the ledger (separate store slice, covered by test).
2. SEPA-only payout — one method row: IBAN + optional nickname. Full mod-97 checksum validation, grouped display, masked row (`DE89 .... 3000`). No card, no instant pay — out of scope and stated in the UI.
3. Prototype policy banner — min EUR 10, 1-2 business days, no fee, `Prototype only — no real money moves` on every screen. Explicitly NOT approved business rules (same status as the cancel-trip ladder).
4. Cash out flow — amount field with quick chips (50/100/200/Max) + live remainder hint, below-minimum / over-balance inline errors, confirm Sheet with destination + ETA + no-fee, success Alert with `See activity`, withdrawal appended as `processing` ledger line, balance recomputed.
5. History — unified ledger (trips + withdrawals), newest first, Paid/Pending/Processing states, empty state card. Recent-3 preview on the Balance home with `See all activity` row.
6. A11y — sr-only h1 per screen, role=status/alert preserved, 48px targets, focus rings inherited. No emoji; lucide-only (`wallet`, `landmark`, `history` added as prototype-led).

Coverage: `pnpm test` 91 passed (83 before: +6 Balance UI, +2 IBAN unit); `pnpm check` passes (token audit + tsc + build, existing wildcard CSS warning only); E2E `e2e/balance.spec.ts` covers method -> cash out -> history in Chrome.

Open questions for the human (do not decide alone): real payout rail/PSP, KYC/verification before first withdrawal, real minimum/fee/ETA, pending-release timing (webhook vs net terms), multi-method support, statement/tax export.

---

## Account redesign (option A) — same scope, proper iOS design

Routes unchanged: `/v2/account`, `/v2/account/profile`, `/v2/account/profile/edit`, `/v2/account/dismissed`.
These screens are still approved prototype proposals, **not geometry/typography measured ports**. Only DriverProfile (`769:10428`), NavigationBar (`586:33`), Input (`12:166`), Button (`12:38`), Alert (`575:9632`), V2Frame shell and tokens are reused as measured components.

What changed and why (audit of the previous slice):

1. Real nav bars — `NavigationBar type=home` on Account ("Account" + AK avatar), `type=back` on Profile / Edit / Dismissed. Before: raw `h1` + underline text-links, unreachable by thumb and inconsistent with every other v2 screen.
2. iOS grouped lists — sections with caption labels (Loads / Profile / Preferences) instead of three floating underline links. Rows are 48px tap targets with 32px icon tiles, one-line titles + secondary detail, chevrons, dividers.
3. Dismissed count badge — the menu row shows the live count from the store ("N hidden from your feed") instead of a dead link with no context.
4. Profile contact card — phone/email as icon rows (tel/mail glyphs) instead of an unstyled `<dl>`; primary "Edit contact" CTA instead of an underline link.
5. Design-system inputs — Edit uses measured `Input` (label row, 48px control, hint line, error state) with delayed error display (only after touch/dirty) instead of raw `<input>` + always-on red text.
6. Alert states — prototype note, save success/failure, load failure and mutation errors all use measured `Alert` tones instead of bare `<p>`.
7. Skeleton + empty states — loading shows pulsing card placeholders with sr-only labels (same pattern as LoadCardSkeleton); Dismissed empty state is an illustrated card, not "No dismissed loads."
8. Honest placeholders — Notifications/Language rows navigate to `/v2/account` (stay in place) instead of pretending to be dead links; prototype footer states the build and local-only storage.
9. Lucide-only icons — 8 bare-lucide names added to the registry (`bell`, `eye`, `languages`, `mail`, `phone`, `settings`, `shield-check`, `chevron-right`), documented as prototype-led in Icon.tsx. No emoji, no raw glyphs.
10. A11y — sr-only `h1` per screen (tests + screen readers), `role=status/alert` preserved through Alert wrappers, 48px targets, focus rings inherited from Button/NavigationBar.

Coverage: `pnpm test` 83 passed (was 82 — new dismissed-count test); `pnpm check` passes (token audit + tsc + build, existing wildcard CSS warning only); E2E `e2e/account.spec.ts` selectors updated for button/textbox/Alert markup.

---

## Account first slice — new proposal (not a measured Figma port)

Routes: `/v2/account`, `/v2/account/profile`, `/v2/account/profile/edit`, `/v2/account/dismissed`.
These screens are approved prototype proposals, **not geometry/typography measured ports**. Only the existing DriverProfile (`769:10428`) and Pharos shell/control/token components are reused; that node does not represent the new screens. No Documents, Vehicle or Help dead-end entries were added.

Contact API persists phone/email locally, with existing name/company/driver identity read-only. Blank fields are allowed; phone accepts 7–15 digits with common separators, email requires a basic address shape. No authentication, OTP or verification is implemented or claimed. Storage writes/removal precede memory updates and subscriber notification. Editor covers unchanged, invalid, saving, failure/retry and saved states. Router now uses a hash data router so useBlocker can confirm tab and browser-back navigation; beforeunload protects document exits. Dismissed loads show route/company, loading/empty/retry/error, Restore and Undo through existing guarded APIs.

Coverage: profile API/store tests, Account and DismissedLoads UI tests; Account/Profile/Edit interactive stories and dismissed-load state stories. `pnpm test`: 82 passed. `pnpm check`: token audit, TypeScript and production build passed (existing wildcard CSS warning). `pnpm exec playwright test e2e/account.spec.ts`: passed contact persistence plus tab/browser-back confirmation in Chrome. No Figma measurement claim is made.

---


# PORT-LOG — перенос Figma → код

Рабочий журнал переноса дизайн-системы Pharos в этот репозиторий. Ведётся по ходу работ:
каждый компонент получает запись с node-id, найденными расхождениями, правками и **замерами**,
которыми проверено совпадение с Figma.

- Файл Figma: `sve9YrMmfz91XQX5IpZjGO`
- Страницы приложения водителя: `21 — Driver / Search and request` (`21:3`), `30 — iOS App / Driver` (`586:9`)
- Карта «node-id ↔ файл»: [figma-map.md](figma-map.md)

Статусы: `done` — сверен и проверен замерами · `review` — в работе · `exists` — есть в коде, но с Figma не сверялся · `todo` — не начат · `n/a` — не компонент Pharos.

---

## 1. Метод сверки (повторяемый)

Сверка делается **по числам**, а не на глаз. Порядок для каждого компонента:

1. **Спека из Figma.** `use_figma` (read-only) отдаёт список вариантов, а затем дерево с геометрией,
   заливками, обводками, радиусами, паддингами и типографикой.
   Обязательно: сначала прочитать скилл `skill://figma/figma-use/SKILL.md`.
2. **Скриншот Figma** (`get_screenshot`) — визуальный эталон, читается глазами.
3. **Правка кода** по спеке, значения — только из токенов.
4. **Стори** на каждый вариант Figma.
5. **Замер в живом Storybook** через Playwright и **скриншот** своей стори.
6. **Запись в этот журнал** и в `figma-map.md`.

Storybook для проверки уже запущен на `http://localhost:6007`; второй поднимать не нужно.

```js
// Замер: Playwright управляет установленным Google Chrome.
// Встроенный Chromium Playwright не скачан — всегда channel: 'chrome'.
const { chromium } = require('playwright');           // запускать node из корня репозитория
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 500, height: 500 } });
await p.goto('http://localhost:6007/iframe.html?id=<story-id>&viewMode=story', { waitUntil: 'networkidle' });
// дальше p.evaluate(...) с getComputedStyle/getBoundingClientRect и сравнение с числами Figma
// если скрипт лежит в /tmp: NODE_PATH="$(pwd)/node_modules" node /tmp/script.cjs
```

Список id сторей: `curl -s http://localhost:6007/index.json`.

**Новые Tailwind-классы появляются в Storybook с задержкой.** Сканер Tailwind подхватывает
утилиты из только что созданных файлов не мгновенно: `h-[320px]` из свежего компонента сначала
отсутствует в CSS, элемент схлопывается, и это выглядит как ошибка вёрстки. Проверено на картах —
через пару минут те же классы применяются сами. **Не «чините» это хардкодом или инлайновыми
стилями: перезамерьте через минуту.** Быстрая диагностика — создать в консоли элемент с нужным
классом и посмотреть `getComputedStyle`.

**Аудит токенов — часть `pnpm check`.** `tools/audit-tokens.mjs` (он же `pnpm lint:tokens`) сверяет
каждый `var(--x)` в `src/` с определениями в `tokens.css`/`globals.css` и падает с ошибкой, если
переменной нет. Динамические имена вида `var(--color-status-${tone}-bg)` он разворачивает и требует,
чтобы под шаблон подходил хотя бы один токен. Это защита от ловушки 4: без неё сломанный компонент
выглядит не сломанным, а «пустым».

---

## 2. Ловушки этого Figma-файла

Собраны по фактическим ошибкам, каждая стоила отдельной отладки.

1. **Имена слоёв врут.** Название инстанса не равно содержимому. Примеры: у таб-бара слой
   «Icon / doc.text» рисует кубик (`Lucide/Package`), «Icon / truck.box» — календарь; у Alert
   Neutral слой «Icon / Info», а главный компонент `Lucide/Icon/Circle Check`.
   **Правило: резолвить `getMainComponentAsync().name`, а не `node.name`.**
2. **`node.x/y` внутри auto-layout дают мусор** (отрицательные координаты за пределами фрейма).
   **Правило: считать смещения через `absoluteBoundingBox`.**
3. **`figma-map.md` врал по node-id.** `12:104` числился как `Pharos/Input`, а это вложенный
   текстовый слой `Label`. Реальный сет — `12:166`.
4. **Несуществующие CSS-переменные молчат.** `var(--color-input-*)` не была определена нигде;
   невалидный `var()` внутри шортката **отбрасывает объявление целиком** — контрол рендерился
   без рамки и фона и выглядел «пустым», а не сломанным. Аудит переменных — обязательный шаг.
5. **Tailwind не видит интерполяцию в классах.** `border-[${cond ? 'a' : 'b'}]` не сканируется,
   класс не генерируется, `border-color` падает в `currentColor`. **Правило: только литеральные классы.**
6. **Абсолютный элемент позиционируется от padding box, а не от border box.** Из-за focus-рамки
   2px кольцо садилось на 4px меньше; смещение пришлось считать как 4px + ширина рамки.
7. **Loading ≠ Disabled.** В Figma Loading сохраняет активные цвета и добавляет спиннер.
8. **Состояния могут быть в токенах, но не в коде.** `color-action-*-hover/-pressed` лежали
   в `tokens.json` и не использовались ни одним компонентом.
9. **Focus ring — отдельный слой.** Не тень: 2px на 4px наружу, радиус 12 (у Input и Button совпадает).
10. **`figma.get_metadata` без nodeId показывает не все страницы** — в файле их 17, а инструмент
    вернул одну. Список страниц надёжнее получать через `figma.root.children`.
11. **Шрифты не были подключены вообще.** В `tokens.json` названы DM Sans и Manrope, но ни
    `@font-face`, ни ссылки на Google Fonts не было — ни в `index.html`, ни в Storybook.
    `document.fonts.check('500 12px "DM Sans"')` возвращал `true` **только потому, что DM Sans
    установлен в macOS**; на другой машине всё молча уезжало в `system-ui`. Проверять надо не
    `check()`, а список `[...document.fonts]`.
12. **Tailwind v4 игнорирует `--text-<name>--font-family`.** В пространстве `--text-*` переносятся
    размер, line-height, letter-spacing и вес, а семейство — нет. Поэтому **все заголовки
    рендерились в DM Sans вместо Manrope**, и Manrope не загружался ни разу. Лечится мостом
    в генераторе токенов (см. 4.3).
13. **Голый текстовый узел не измерить и структура расходится с Figma.** Если лейбл отрендерен
    как `{label}` без обёртки, в DOM нет узла, соответствующего слою `Label`, и замер шрифта
    приходится делать по родителю. Обёртка `<span>` дешевле, чем потеря проверяемости.
14. **Ширина текста — не показатель совпадения.** Пилюля Status до подключения шрифтов давала
    51.27px при Figma 51, после — 50.28. Прежнее «совпадение» было случайным: мерился фолбэк.
15. **Шрифт текстового узла может не резолвиться.** У времени в статус-баре (`Type=IOS`)
    `fontName` возвращает `mixed`, а `getRangeFontName(i, i+1)` — `undefined` для всех символов:
    текстовый слой набран шрифтом, которого в файле нет (`listAvailableFontsAsync` не содержит
    ни SF Pro, ни другого подходящего). Значит и в самой Figma он рендерится фолбэком, и
    «сверить шрифт» тут не с чем — это надо фиксировать как неизвестность, а не подгонять.
16. **Компонент и его инстансы на экранах расходятся.** В component set `Pharos/App/Status bar`
    у варианта `Type=IOS` есть видимый **Dynamic Island** (`2305:25320`), а в инстансах на всех
    экранах его нет: у инстанса `2772:12932` в поддереве только `Time` и `Levels`. То есть
    деталь добавили в компонент после того, как экраны были собраны, и расхождение застыло.
    **Правило: то, что рисует экран, важнее того, что лежит в component set.** Такие случаи
    закрываются пропом (здесь `island`), а не выбором одной из сторон.
17. **Инстанс может отменять то, что есть в варианте.** В сетке `Pharos/Input` слой `Hint`
    виден во всех шести вариантах, а на экранах инстансы идут высотой 76 — то есть без подсказки
    (76 = 20 + 8 + 48). Поэтому у Input появился `hint={null}`, который строку убирает.
18. **У иконки имя компонента тоже врёт, но вложенный глиф не врёт.** Четыре иконки названы не по
    тому, что рисуют, зато внутри у них лежит фрейм с настоящим именем lucide-глифа:
    `Lucide/Icon/Orders` → `Lucide/Package`, `Overview` → `Lucide/LayoutDashboard`,
    `Reports` → `Lucide/ChartNoAxesColumn`, `Users` → `Lucide/Users`. Проверять так же, как
    в ловушке 1, — по вложенному узлу.
19. **Часть иконок на странице «03 — Icons» рисуется пустой.** `Bookmark`, `Overview`, `Users`,
    `Reports`, `Help` в доке не видны, хотя у компонентов есть видимые векторы с обводкой
    `#172a35` — то есть скриншот страницы как источник истины для иконок не годится, нужен
    разбор содержимого компонента.
20. **1px INSIDE stroke в Figma ≠ CSS `border-box`.** Если обводка фрейма нарисована внутрь, то в
    CSS комбинация `padding` + `border` сдвигает содержимое на 1px и увеличивает коробку на 2px по
    обеим осям: `RouteSummary` сначала отрендерился 372×94 вместо 370×92. Лечится `box-border` и
    уменьшением паддинга на толщину рамки, а не подгонкой чисел.
21. **API и рендер могут расходиться.** У ссылки `Navigate` в Route card Figma **рисует**
    подчёркивание, а `textDecoration` читается как `NONE`. Проверка трёх узлов по отдельности
    показала, что подчёркивание настоящее, а у `View application` в Offer его нет.
    **Правило: при конфликте верить рендеру и документировать расхождение.**
22. **Счётчик инстансов из грубого обхода врёт.** Первый обход страниц дал у `Arrow right` 1
    инстанс, адресный подсчёт — 120. Для решений «какой из двух одноимённых сетов используется»
    нужен адресный подсчёт с резолвом main component: на грубом счёте агент B заключил, что
    `26:27` не используется, и ошибся (поправка в 4.7).
23. **Высоты вариантов в Figma могут быть растянуты, а не выведены из содержимого.** У 8 вариантов
    `Pharos/Bottom sheet` стоит `primaryAxisSizingMode = FIXED`, и рамка растянута под самую
    высокую карточку в ряду: у `2197:8081` дети дают 406, а рамка 454. Экспорт PNG у таких узлов
    тоже обрезан, поэтому пиксельная сверка по ним невозможна — сверять надо численно по детям.
    То же у Message bubble (6 из 15 инстансов растянуты на 20px) и у Application progress.
24. **Chrome округляет `border-width` до целых CSS-пикселей.** Обводку 1.5px внутри фрейма
    воспроизвести нельзя: замерено 1px при dpr 1, 2 и 3 — Blink снапит толщину рамки, это не
    округление растеризации. Лечится тем, что рисуется 1px, а недостающие 0.5px уходят в padding,
    поэтому коробка и позиция контента совпадают, а толщина штриха — нет. Касается **каждого**
    штриха 1.5px в файле (Day item, халo карт, маркеры Bottom sheet).
25. **Рендер и API могут расходиться по языку и контенту.** У `Pharos/Route search + filters`
    `get_screenshot` рисует поисковую строку по-русски («Текущее местоположение», «Лиль, Франция»),
    а Plugin API возвращает английский текст и для `characters`, и для свойств компонента, и не
    показывает оверрайдов. Слой локализации/контент-переменных управляет рендером, но через API
    не виден — та же семья, что ловушка 21. Отгружено по-английски (правило 5), решение вынесено
    в §7.
26. **Внутри компонентов бывают строительные дефекты, а не дизайн-решения.** У четырёх иконок
    сайдбара (`Orders`, `Overview`, `Users`, `Reports` — те самые, чьи имена врут, ловушка 18)
    вложенный фрейм `Glyph` не отмасштабировали при уменьшении инстанса в слот 20px, поэтому глиф
    рисуется в нативных 24px и вылезает на 2px с каждой стороны. В прототипе все шесть рисуются
    20px: воспроизводить дефект — значит делать 4 строки списка заметно крупнее соседних.
    Рядом: `Count pill` удалён во всех инстансах сайдбара; `Show verification` истинно в сете и
    ложно во всех 9 инстансах; у дефолта текстового свойства `Body#769:1` текст расходится с тем,
    что нарисовано в варианте. **Источник истины — то, что нарисовано.**
27. **В CSS нет длины штриха пунктира.** Пунктир 6/6 Figma Chrome рисует как 3/3: свойства
    `stroke-dasharray` у `border` не существует. Решение — рамка оверлеем SVG (тогда и 1.5px, и 6/6
    совпадают точно), но **фаза** пунктира всё равно не совпадёт: Figma начинает узор заново на
    каждой стороне, а SVG ведёт его непрерывно по периметру (замерено: +3 / +4 / −2 / 0 px по
    сторонам). Оверлей обязан рисоваться **после** контента, иначе кнопка внутри перекрывает его
    целиком — так и вышло с первого раза (ноль пикселей рамки).
28. **Скрытый компонент нельзя сверить визуально.** `Pharos/App/Offer terms` скрыт в Figma вместе
    со всеми шестью инстансами, экспорт даёт PNG 1×1 — числа сняты с дерева узлов, рендера нет.
    То же было у `Offer preview`. Пока дизайн не расчехлит компонент, пиксельная сверка невозможна,
    и это надо помечать как непроверенное, а не считать закрытым.
29. **В ассетах Figma бывают дефекты данных.** У бельгийского флага ведущая полоса задана
    `#000000` — и в квадратном сете (`249:1668`), и в круглом (`198:1645`), то есть это уже
    отгружено в `belgium.svg`. Порт ни при чём: экспорт верен, чинить надо дизайн и потом
    переэкспортировать оба ассета.
30. **UA-стили и preflight протекают в слоты.** `<button>` приносит `text-align: center` — текст
    в слоте уезжал на 44px, пока не добавили `text-left`; `img { max-width: 100% }` из preflight
    Tailwind молча обрезал круглый флаг 24px до 20px, хотя в Figma он переполняет слот (нужен
    `max-w-none`). Ещё: текстовый слой клавиши в Figma — бокс 20px высотой при `lineHeight: 24`,
    строка переполняет слой и чернила сидят на 2px ниже центра, так что флекс-центрирование даёт
    другой результат, чем `items-start pt-[11px]`.

---

## 3. Инвентарь области работ

Скоуп определён точно: **компоненты, которые реально инстансируются на двух страницах водителя** —
58 штук (всего в файле 43 component set). Из них 6 — иконки Lucide и мок iOS-статус-бара, они не переносятся.

| Компонент | Figma | Инстансов | Файл | Статус |
|---|---|---|---|---|
| Pharos/Button | `12:38` | 250 | `src/components/Button.tsx` | done |
| Pharos/App/Status bar | `2353:26430` | 139 | `src/components/layout/StatusBar.tsx` | done |
| Pharos/App/Navigation bar | `586:33` | 139 | `src/components/layout/NavigationBar.tsx` | done |
| Pharos/Information section | `2576:2265` | 116 | `src/components/InformationSection.tsx` | done |
| Pharos/Status | `11:148` | 109 | `src/components/StatusPill.tsx` | done |
| Pharos/App/Home indicator | `586:70` | 97 | `src/components/layout/HomeIndicator.tsx` | done |
| Pharos/Input | `12:166` | 76 | `src/components/Input.tsx` | done |
| Pharos/App/Tab bar | `586:67` | 61 | `src/components/layout/TabBar.tsx` | done |
| Pharos/Alert | `575:9632` | 54 | `src/components/Alert.tsx` | done |
| Pharos/App/Offer | `2594:22063` | 46 | `src/components/OfferCard.tsx` | done |
| Pharos/App/View switch | `2041:411` | 42 | `src/components/ViewSwitch.tsx` | done |
| Pharos/Offer preview | `26:73` | 32 | `src/components/OfferPreview.tsx` | done |
| Pharos/Sidebar | `82:150` | 30 | `src/components/Sidebar.tsx` — веб-хром страницы 21 | done |
| Pharos/Page header | `167:65` | 30 | `src/components/PageHeader.tsx` — веб-хром страницы 21 | done |
| Pharos/Message bubble | `384:355` | 25 | `src/components/MessageBubble.tsx` — тинт-сет + `skin="plain"` под инстансы | done |
| Pharos/Filters button | `2646:1314` | 21 | `src/components/FiltersButton.tsx` | done |
| Pharos/Button link | `168:118` | 20 | `src/components/Button.tsx` (`ButtonLink`) | done |
| Pharos/Route search + filters | `340:404` | 18 | `src/components/RouteSearch.tsx` — десктоп, 1112, страница 21 | done |
| Pharos/Avatar | `74:64` | 15 | `src/components/Avatar.tsx` | done |
| Pharos/App/Approach map | `719:355` | 15 | `src/components/ApproachMap.tsx` | done |
| Pharos/App/Route card | `2715:1535` | 15 | `src/components/RouteCard.tsx` | done |
| Pharos/Mobile header | `26:24` | 14 | `src/components/MobileHeader.tsx` — мобильный веб страницы 21 | done |
| Pharos/App/Onboarding progress | `2062:410` | 13 | `src/components/OnboardingProgress.tsx` | done |
| Pharos/Filter chip v2 | `2621:1288` | 11 | `src/components/FilterChipV2.tsx` | done |
| Pharos/App/Driver profile | `769:10428` | 9 | `src/components/DriverProfile.tsx` (+ `DriverAvatar`) | done |
| Pharos/Load card | `14:146` | 8 | `src/components/LoadCard.tsx` | done |
| Pharos/Rate offer card | `384:368` | 8 | `src/components/RateOfferCard.tsx` | done |
| Pharos/App/Offer route | `693:995` | 8 | `src/components/OfferRoute.tsx` | done |
| Pharos/App/Day item | `2021:2666` | 8 | `src/components/DayItem.tsx` | done |
| Pharos/Chat/Cargo context | `2188:8055` | 8 | `src/components/ChatCargoContext.tsx` | done |
| Pharos/App/Trip steps | `2728:26593` | 8 | `src/components/TripSteps.tsx` (+ `ProgressStep`) | done |
| Pharos/Select | `344:51` | 8 | `src/components/Select.tsx` — Closed / Open / Disabled | done |
| Pharos/Country flag Rectangle | `249:1646` | 8 | `src/components/Flag.tsx` | done |
| Pharos/App/Trip preparation | `2715:1617` | 7 | `src/components/TripPreparation.tsx` | done |
| Pharos/App/Trip checklist | `2715:1596` | 7 | `src/components/TripChecklist.tsx` — только `State=Awaiting` (`2715:25520`), нужен Content=Request у Bottom sheet | review |
| Pharos/Chat/Composer | `2188:7944` | 7 | `src/components/ChatComposer.tsx` | done |
| Pharos/Empty details panel | `129:46` | 6 | `src/components/EmptyDetailsPanel.tsx` | done |
| Pharos/App/Offer terms | `693:1013` | 6 | `src/components/OfferTerms.tsx` | done (без визуального эталона — скрыт в Figma) |
| Pharos/App/Route summary | `671:977` | 6 | `src/components/RouteSummary.tsx` | done |
| Pharos/Filter chip | `338:211` | 6 | `src/components/FilterChip.tsx` | done |
| Pharos/Route summary | `26:27` | 4 | `src/components/RouteSummaryWeb.tsx` — мобильно-веб сводка страницы 21 (не путать с `671:977`) | done |
| Pharos/Payment summary | `412:389` | 3 | `src/components/PaymentSummary.tsx` | done |
| Pharos/App/Application progress | `734:426` | 3 | `src/components/ApplicationProgress.tsx` (+ `ProgressStep`) | done |
| Pharos/Location suggestions | `190:117` | 3 | `src/components/LocationSuggestions.tsx` | done |
| Pharos/App/Keyboard | `2776:1613` | 3 | `src/components/AppKeyboard.tsx` | done |
| Pharos/Bottom sheet | `2197:8841` | 3 | `src/components/BottomSheet.tsx` + `BottomSheetHeader` (в нём же) · `RouteFields.tsx` · `SuggestionCard.tsx` · `SheetField.tsx` · `SortBy.tsx` · `TripChecklist.tsx` | done |
| Pharos/Chat/Rate offer | `2189:8453` | 3 | `src/components/ChatRateOffer.tsx` | done |
| Pharos/App/Upload field | `2013:3064` | 2 | `src/components/UploadField.tsx` — Empty / Chosen / Rejected / Uploading | done |
| Pharos/Upload field/Driving licence preview | `2091:441` | 2 | `src/components/DrivingLicencePreview.tsx` — собрано поверх UploadField | done |
| Pharos/Route map | `330:164` | 1 | `src/components/RouteMap.tsx` | done |
| Lucide/Icon/Clock | `2006:17` | 36 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Calendar | `2006:13` | 64 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Info | `575:9647` | 19 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Map pin | `279:5035` | 116 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Search | `279:5037` | 95 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Loader | `279:5034` | 3 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Arrow right | `279:5033` | 120 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Truck · Bookmark · Shield · User Round · Circle Check · Circle X · Triangle Alert · Camera | см. §5 | 237 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Orders · Overview · Users · Reports · Help · Sliders horizontal · X · Image | см. §5 | 221 | `src/components/Icon.tsx` | done |
| Status bar - iPhone 17 Pro | `2305:24705` | 1 | мок iOS | n/a |

### Покрытие на момент закрытия

Сверено с файлом целиком, а не только с инвентарём: **43 component set + одиночные компоненты**.

| Категория | Сколько | Что с ними |
|---|---|---|
| Сеты, инстансящиеся на страницах водителя | 38 | все портированы, у каждого стори по вариантам |
| Сеты, которые на страницах водителя не инстансятся напрямую | 5 | `App/Progress step` `2553:1238`, `Navigation item` `14:15` и `Account` `74:82` построены (используются через Trip steps / Application progress / Sidebar); `Route summary card` `587:2131` и `Route search` `203:395` встроены в `LoadCard` и `RouteSearch` |
| Одиночные компоненты (не сеты) | 8 | `Bottom sheet/Header` `2197:7908` → `BottomSheetHeader`; `Driver avatar` `755:366` → `DriverAvatar`; `Brand mark` `82:131` и `Workspace context` `82:135` → экспортируются из `Sidebar.tsx`; `Preview/Driving licence sample` `2090:439` → `LicenceSample`; плюс четыре карты и два summary, у каждого свой файл |
| Иконки Lucide | 23 | один реестр `src/components/Icon.tsx`, маппинг в §5 |
| **Архив** | 2 | `App/Offer unified` `2254:635` и `Offer unified compact` `2260:581` лежат на странице **«06 · Archive / Retired & unused patterns»** и имеют **0 инстансов во всём файле** — сознательно не портированы |

Проверка полноты сторей: смоук-тест обошёл **все 245 сторей** в 58 группах — каждая
регистрируется, рендерится непустой и не даёт ошибок в консоли (один 404 в стори Alert
оказался разовым сбоем дев-сервера и не воспроизвёлся). Единственный компонент без стори —
`DemoPanel`, дев-панель прототипа, она и не должна иметь стори.

---

## 4. Журнал

### 4.0. До начала работ

Первым делом сверялся Input — и оказался сломан (см. ловушку 4). Починка: `5a3a93f`.
Заведена проверочная обвязка (Playwright + Chrome), `b102ee3`.

### 4.1. Волна 0 — оболочка экрана · коммит `d62f804`

`AppShell.tsx` разбит на пять файлов (`layout/*`), у каждого появились стори; удалён `Icons.tsx`
(самодельные дубликаты `lucide-react`, который остальные компоненты уже используют).

**Pharos/App/Status bar** `2353:26430` — типы IOS `2305:25330` (402×62) и Default `586:20` (402×54).

| Что | Figma | Замер |
|---|---|---|
| высота, фон | 62, `#ffffff` | 62, `rgb(255,255,255)` |
| время | 17/22 SemiBold, центр бокса 124 на x=9 → центр 71 | 17/22, fw600, центр 71 |
| индикаторы | 129×13, отступ справа 9 | 129×13, отступ 9 |
| Dynamic Island | 125×37, r-pill, центр, y=14 | 125×37, r999, центр 202 при центре экрана 201, y=14 |

До правки: `Dynamic Island` отсутствовал, фон не задавался, тип Default не существовал.

**Pharos/App/Navigation bar** `586:33` — Home `586:25` (76) и Back `586:32` (60).

| Что | Figma | Замер |
|---|---|---|
| Home: высота, заголовок | 76, 24/32 Bold, x=16, w=370 | 76, 24/32 fw700, x=16, w=370 |
| Back: высота, кнопка | 60, 44×44 на x=16 | 60, 44×44 на x=16 |
| Back: заголовок | 20/28 SemiBold, x=68 | 20/28 fw600, x=68 |
| фон | `#f4f6f8` (канвас) | `rgb(244,246,248)` |

До правки: одна высота 76 на оба типа, заголовок по центру, «назад» — текстовый символ `←`.

**Pharos/App/Tab bar** `586:67` — четыре варианта (по активной вкладке).

| Что | Figma | Замер |
|---|---|---|
| корень | 402×83, pad top 8, белый | 402×83, `rgb(255,255,255)` |
| вкладки | 90×50, позиции 16 / 110 / 203 / 297 | 90×50, позиции 16 / 109 / 203 / 296 |
| активная | фон `#eff2f5`, r-pill | `rgb(239,242,245)`, r999 |
| лейбл активный / обычный | `#225d74` / `#586d79`, 12/16 Medium | `rgb(34,93,116)` / `rgb(88,109,121)`, 12/16 fw500 |
| иконки | 20×20, 2px, `#172a35` в обоих состояниях | 20×20, `rgb(23,42,53)` |

До правки: пилюля 64×32 вокруг иконки вместо всей вкладки 90×50, иконки 22px, активный лейбл `text-primary`.

**Pharos/App/Home indicator** `586:70` — 402×34, полоса 134×5 r3 `#172a35`. Замер совпал.

**ScreenFrame** (`src/components/layout/ScreenFrame.tsx`) — композиция пяти частей, метрики шелла
фиксированы: 402×874, статус-бар 62 (Default 54), навбар 76/60, таб-бар y757 h83, home indicator y840 h34.

### 4.2. Волна 1 — атомы · коммиты `591adcb`, Input ранее `5a3a93f`

**Pharos/Button** `12:38` — 24 варианта: Appearance Primary/Secondary × Size Web(40)/Mobile(48) ×
State Default/Hover/Pressed/Focus/Disabled/Loading.

| Что | Figma | Замер |
|---|---|---|
| primary | `#225d74`, текст белый, h48, r8 | `rgb(34,93,116)`, fw500 14/20, h48, r8 |
| primary hover / pressed | `#1b4f65` / `#153f50` | `rgb(27,79,101)` / `rgb(21,63,80)` |
| secondary | `#ffffff`, рамка 1px `#8093a0`, текст `#225d74` | совпало |
| secondary hover / pressed | `#ebf3f7` / `#d8e9f0` | `rgb(235,243,247)` / `rgb(216,233,240)` |
| disabled (оба) | фон `#c3d0d8`, текст `#80929e`; у secondary рамка `#d7e0e6` | совпало |
| loading | активные цвета + спиннер 20×20 (кольцо 15×15, 2px) | фон `#225d74`, бокс 20, кольцо 15 |
| focus | рамка 2px + кольцо 378×56 r12 при offset −4 | 378×56, offset −4, r12 |
| Size=Web | высота 40 | 40 |

Найдено и исправлено: hover/pressed не были подключены к существующим токенам; loading выглядел
выключенным; у secondary disabled был белый фон; focus ring был тенью 4px; рамка secondary падала
в `currentColor` из-за интерполяции класса (ловушка 5); не было размера Web.

**Pharos/Button link** `168:118` — 12 вариантов.

| Что | Figma | Замер |
|---|---|---|
| бокс | hug 118×48, pad x16, без фона | 118×48 |
| текст | 14/20 Medium `#225d74` | совпало |
| hover / pressed | фон `#ebf3f7` / `#d8e9f0` | `rgb(235,243,247)` / `rgb(216,233,240)` |
| disabled | текст `#80929e` | `rgb(128,146,158)` |
| loading | ширина 146 (+спиннер 20 и gap 8) | 146 |

До правки: `w-full` без паддингов, ни одного состояния.

**Pharos/Alert** `575:9632` — 5 типов, каждый 546×64.

| Что | Figma | Замер |
|---|---|---|
| бокс | pad12 gap12 r12, иконка 20×20 по центру | h64, r12, иконка 20 |
| title / description | 14/20 Medium, 12/16 Regular | 14/20 fw500, 12/16 fw400 |
| Info / Error / Neutral фон | `#ebf3f7` / `#fdedea` / `#eff2f5` | совпало |
| текст по типу | `#225d74` / `#b8332f` / `#526773` | совпало |
| иконки | Info, Triangle Alert, **Circle X**, Circle Check, **Circle Check** | исправлено |

Найдено: Error использовал `CircleAlert` вместо `CircleX`; Neutral показывал Info, хотя главный
компонент — `Circle Check` (слой назван неверно). Добавлена опциональная третья строка —
скрытый в Figma слой «Waiting detail».

**Pharos/Input** `12:166` — мобильные варианты `12:160`–`12:165` (Web `12:154`–`12:159`).

| Что | Figma | Замер |
|---|---|---|
| контрол | h48, r8, pad 0/12, рамка 1px `#8093a0`, фон белый | совпало |
| focus | рамка 2px `#225d74` + кольцо 368×56 r12 offset −4 | совпало |
| ошибка | рамка 1px `#b8332f`, подсказка `#b8332f` | совпало |
| disabled / readonly | фон `#eff2f5`, рамка та же | совпало |
| hint | есть во всех шести состояниях, 12/16 | есть |

### 4.3. Волна 1 (продолжение) — Status, Avatar, Country flag · коммит `8a58a9c`

**Pharos/Status** `11:148` — шесть тонов (Neutral `11:142`, Info `11:143`, Success `11:144`,
Warning `11:145`, Danger `11:146`, Match `11:147`), каждый 87×28. Свойства компонента в Figma:
текстовое `Label` = «In transit» и булево `Show dot`.

| Что | Figma | Замер |
|---|---|---|
| бокс | hug, pad 6/12, gap 6, radius 999 | 86.28×28, pad 6/12, gap 6, r999 |
| точка | 6×6, цвет текста тона | 6×6 на (12,11) |
| лейбл | DM Sans Medium 12/16 | 12/16 fw500, DM Sans |
| цвета тонов | `#eff2f5/#526773`, `#ebf3f7/#225d74`, `#e8f6ef/#216547`, `#fff4df/#855300`, `#fdedea/#b8332f`, `#bce5d5/#1c5644` | все шесть совпали |

Правки: высота была прибита `h-[28px]` вместо hug-паддингов Figma; `gap`/`px` были сырыми
числами, переведены на `--spacing-6`/`--spacing-12`; точка получила `bg-current` и `aria-hidden`;
шапка-контракт не содержала props и id вариантов и ссылалась на несуществующий токен;
единственная стори `Tones` с выдуманными подписями заменена на шесть сторей по тонам с текстом из Figma.
Отдельно: лейбл был голым текстовым узлом — обёрнут в `<span>`, чтобы соответствовать слою `Label`
(ловушка 13).

**Pharos/Avatar** `74:64` — новый компонент. Size=Small `74:56` (32×32, Label/12) и
Size=Medium `74:57` (40×40, Label/14); радиус 999, фон `color/avatar/bg`, инициалы
`color/avatar/text`; свойство `Initials` = «AK». Все 24 инстанса в приложении — Medium 40×40,
поэтому размер по умолчанию `medium`.

| Что | Figma | Замер |
|---|---|---|
| размеры | 32×32 и 40×40, radius 999 | 32×32 и 40×40, r999 |
| цвета | `#bce5d5` / `#1c5644` | `rgb(188,229,213)` / `rgb(28,86,68)` |
| шрифт | 12/16 fw500 и 14/20 fw500 | совпало |

**Pharos/Country flag Rectangle** `249:1646` — Country=France `249:1647`, Country=Belgium `249:1649`,
оба 24×24 (bbox сета 136×72 — это просто раскладка). В Figma: белый бокс 24×24, рисунок 3:2
высотой 16 по центру (y=4), обводка 1px `#cbd5da`, радиус 2.

SVG в репозитории — точный экспорт этого рисунка в масштабе 0.75, а приложение инстансит сет
в 18×18 (Offer `2658:1312`/`2658:1322`), поэтому `size = 18` оставлен значением по умолчанию:
смена молча изменила бы размер флагов в `OfferCard`. Добавлена стори на оба варианта в
геометрии сета (24×24) и шапка-контракт. Пиксельная сверка с рендерами Figma: **572 из 576
пикселей идентичны**, остальные 4 — сглаживание скруглённых углов; цвет обводки совпал точно.

### 4.4. Типографика — до и после

Проверка шрифтов вскрыла две системные проблемы (ловушки 11 и 12): **ни DM Sans, ни Manrope
не подключались**, а Tailwind игнорировал семейство из текстовых токенов, из-за чего заголовки
шли DM Sans'ом.

Сделано:

1. `index.html` и `.storybook/preview-head.html` — подключение DM Sans (400/500/700) и Manrope (600/700)
   с Google Fonts. Storybook подхватывает `preview-head.html` без перезапуска.
2. `tools/export-tokens.mjs` теперь генерирует **мост font-family**: по одному правилу на семейство,
   вне `@layer` (поэтому оно выигрывает у утилит Tailwind). Файл `tokens.css` больше не содержит
   бесполезных строк `--text-*--font-family`, зато содержит реальные правила.

Соответствие проверено прямо в Figma (семейство каждого текстового стиля):

| Текстовый стиль | Figma | Токен |
|---|---|---|
| Button label, Input label, Alert title, Status label, Tab label | DM Sans Medium | `text-label-14`, `text-label-12` (DM Sans) |
| Navigation bar Type=Home | **Manrope** Bold 24/32 | `text-heading-24` |
| Navigation bar Type=Back | **Manrope** SemiBold 20/28 | `text-heading-20` |
| Offer card «Rate» €360 | **Manrope** Bold 28/36 | `text-metric-28` |

После правки заголовок навбара считается как `Manrope, system-ui, sans-serif` и вес Manrope 700
числится загруженным. **Важно для честности:** ширина лейбла Status до правки была 51.27px
(фолбэк) против Figma 51, после — 50.28px. То есть прежнее совпадение было случайным.

Заодно в `tokens.json` добавлено семейство `font.ios`, а генератор больше не хардкодит iOS-стек:
все три семейства (`--font-ui`, `--font-heading`, `--font-ios`) теперь выводятся из токенов,
а `--text-*--font-family` ссылается на них через переменную.

**Что осталось неизвестным.** Время в статус-баре `Type=IOS` набрано шрифтом, которого в файле
нет (ловушка 15), поэтому сверить его не с чем. В коде оно наследует UI-семейство (DM Sans) —
это детерминированно и совпадает с тем, как Figma рисует фолбэк. Стили `text-ios-*` используют
стек SF Pro Text → system-ui: на устройствах Apple это системный шрифт, на остальных — фолбэк.
Отдельно: у типа `Type=Default` время — уже честный DM Sans Regular 16/24, это сверено.

---

### 4.5. Что вскрылось при разборе остальных компонентов

**`Pharos/Bottom sheet` (`2197:8841`) в коде не существует.** В репозитории лежал выдуманный
компонент «шторка карты» с состояниями Peek/Full, ручкой 36×4 и пагинатором — он был написан по
скриншотам, а не по сету. Настоящий сет — это **13 вариантов в четырёх группах**:

| Content | Состояния |
|---|---|
| Route | Route filled `2197:7919` (402×406) · Origin current `2197:7975` · Destination current `2197:8028` · Route filled vehicle `2197:8081` (454) · Route empty `2197:8167` · Route origin selected `2197:8222` · Origin suggestions `2197:8277` · Destination suggestions `2197:8330` · Route empty vehicle `2197:8383` · Route origin selected vehicle `2197:8438` (494) |
| Price | Price offer `2197:8777` (402×494) |
| Request | Trip data `2715:25486` (402×494) |
| Sort | Sort by `2767:27860` (402×360) |

Компонент отдан отдельному агенту на полный перенос, с требованием собрать его композицией
(контейнер + блоки содержимого), а не одним монолитом.

**`Pharos/App/Offer` (`2594:22063`) существует, но не сверялся.** В коде есть `OfferCard.tsx`
с состояниями Default/Disabled/Loading/Pending — геометрия с Figma не сверялась ни разу.

### 4.6. `Pharos/Bottom sheet` — 13 вариантов, композиция из шести блоков

Выдуманный компонент «шторка карты» удалён и заменён настоящим сетом. Один контейнер плюс блоки
содержимого, у каждого свои стори; варианты, отличающиеся только наличием под-блока, выражены
пропсами, а не копипастой.

| Файл | Что это в Figma | Стори |
|---|---|---|
| `BottomSheet.tsx` → `BottomSheet` | поверхность: белая, скругление сверху 16, паддинг группы, gap 16 | 13 (все варианты) |
| `BottomSheet.tsx` → `BottomSheetHeader` | `Pharos/Bottom sheet/Header` `2197:7908` (один компонент, не сет) | — |
| `BottomSheet.tsx` → `VehicleMatchingLine`, `SheetHint` | текстовые строки `2197:8103` / `2197:8189` / `2664:23032` | — |
| `RouteFields.tsx` | `Route / Connected stops` `2197:7929` — 354×144 | `Filled` · `DestinationEmpty` · `Empty` |
| `SuggestionCard.tsx` | внутренний `Frame` 354×80 четырёх состояний current/suggestions | `Lille` · `Brussels` |
| `SheetField.tsx` | инстансы `Pharos/Input` в Content=Price `2197:8787`, `2197:8796` | `YourRate` · `Comment` · `Empty` |
| `TripChecklist.tsx` | `Pharos/App/Trip checklist` `2715:1596`, только `State=Awaiting` `2715:25520` | `Awaiting` |
| `SortBy.tsx` | четыре строки 370×48 из `2767:27860` | `HighestPerKm` · `SoonestDeadline` |

**Геометрия контейнера.** Поверхность одна и та же во всех вариантах; различается только паддинг:
`Content=Route`/`Price` — 12/24/34/24, `Content=Sort`/`Request` — 12/16/24/16. Отсюда проп
`pad="route" | "sort"`.

| Что | Figma | Замер |
|---|---|---|
| поверхность | r16 сверху, `#ffffff`, gap 16 | `rgb(255,255,255)`, r16, gap 16 |
| ручка `Sheet / Drag handle` | 354×4, пилюля 36×4 r2 `#d7e0e6` | 354×4, пилюля 36×4 r4 `rgb(215,224,230)` |
| заголовок | 48 высотой, Manrope SemiBold 20/28 `#172a35` | 354×48, Manrope 600 20/28 `rgb(23,42,53)` |
| `Route / Connected stops` | 354×144 r16 `#f4f6f8` | 354×144 r16 `rgb(244,246,248)` |
| строка From/To | 354×72, pad 10/16/10/16, gap 12 | 354×72, pad 10/16/10/16, gap 12 |
| маркер | 8×8, обводка 1.5px `#225d74` INSIDE; origin залит, destination — канвас | 8×8; заливка и рамка совпали, толщину проверял по пикселям при dpr 8: 8 физ. px из 64 = 1 px CSS = 1.5 физ. px |
| коннектор | 1×64 `#d7e0e6` на x=20, y=40..104 | 1×64 на (20,40) `rgb(215,224,230)` |
| подписи строк | From/To: DM Sans Medium 12/16 `#586d79`; город: Manrope SemiBold 20/28 `#172a35` | совпало |
| строка сопоставления | 354×16 DM Sans Medium 12/16 `#586d79` | 354×16, fw500, 12/16, совпало |
| `Hint` | 354×32 DM Sans Regular 12/16 | 354×32, совпало |
| карточка предложения | 354×80 pad16 gap4 r12 `#f4f6f8` | 354×80, pad16, gap4, r12, `rgb(244,246,248)` |
| поле `Pharos/Input` | 354×76 (label 20 + gap 8 + control 48) | 354×76 |
| trip checklist | 370×190, pad16 gap12 r12, рамка `#d7e0e6`, 4 строки 20 | 370×190, pad16, gap12, r12 |
| строка Sort | 370×48, pad 12/0/12/0, gap 8, DM Sans Regular 16/24 `#172a35` | 370×48, pad 12/0, gap 8, 16/24 fw400 |
| галочка Sort | `Lucide/Icon/Circle Check` 20×20 `#225d74`, 2px | 20×20 `rgb(34,93,116)` |

**Высоты.** Три варианта сходятся с Figma точно, у остальных расхождение объясняется тем, что
высота фрейма в Figma задана вручную (`primaryAxisSizingMode = FIXED`) и не равна высоте
содержимого. Я рендерю настоящую hug-высоту и привожу её рядом с Figma:

| Вариант | Figma h | Сумма детей + gap 16 + паддинг | Мой замер |
|---|---|---|---|
| Route filled `2197:7919` | 406 | 406 | **406** |
| Route empty `2197:8167` | 454 | 454 | **454** |
| Route empty vehicle `2197:8383` | 454 | 454 | **454** |
| Trip data `2715:25486` | 494 | 494 | **494** |
| Route filled vehicle `2197:8081` | 454 | **406** | 406 |
| Route origin selected `2197:8222` | 454 | **406** | 406 |
| Origin/Destination suggestions `2197:8277`/`8330` | 454 | **414** | 414 |
| Route origin selected vehicle `2197:8438` | 494 | **406** | 406 |
| Origin/Destination current `2197:7975`/`8028` | 406 | **414** | 414 |
| Price offer `2197:8777` | 494 | **398** | 398 |
| Sort by `2767:27860` | 360 | **312** | 312 |

Это подтверждено дважды: у `2197:8081` шесть детей дают ровно 406, а `absolutelyBoundingBox`
фрейма — 454; у `2197:7975` дети стоят на y 12/32/96/188/220/316 с шагом ровно 16, то есть
содержимое занимает 414, а высота фрейма 406. **Это дефект сета, а не переноса** — в Figma
варианты растянуты под самую высокую карточку ряда. Если дизайн должен совпадать попиксельно,
высоты во фреймах надо поправить обратно в Figma (прототип ведёт, дизайн догоняет).

**Чего в сете нет.** Контрола обмена местами (swap) у точек в Figma нет: между строками From и To
лежит только статичный коннектор 1×64, кликабельных элементов там нет. Строки сделаны
`<button>` (в четырёх состояниях current/suggestions одна из строк как раз редактируется), но
иконки swap дизайн не содержит — выдумывать её я не стал.

**Отклонения от прежнего выдуманного компонента** (`git show 45c642a:src/components/BottomSheet.tsx`):
были состояния Peek/Full, ручка 36×4 на всю ширину, пагинатор `1 of 2` текстом, паддинг 12/24 и
`pb-[34px]`, рамка `border-t` по верху поверхности и привязка к низу экрана через `absolute`.
Ни одного из этих элементов в сете нет; пагинатора нет вообще. Стори `Peek`/`Full` удалены,
вместо них 13 сторей по вариантам Figma.

**Отдельно: `SortBy` и `TripChecklist` брали иконки напрямую из `lucide-react`,** хотя в репозитории
уже есть реестр `Icon.tsx` (§5) — заменено на `<Icon name="clock" />` и
`<Icon name="circle-check" />`, размеры те же (16 и 20).

**Токены.** Новых не потребовалось: цвета и типографика взяты из существующих групп (`color-bg-canvas`,
`color-border-default`, `color-border-brand`, `color-text-*`, `color-status-warning-text`).
Геометрические числа (`36`, `10`, `1.5`, `1`, `72`, `144`, `64`, `20`, `40`) оставлены литералами,
как и в остальных контролах репозитория — в `spacing` таких значений нет.

### 4.7. Волна 2 — карточки и информационные блоки

Три агента параллельно, каждый на своих файлах; общие файлы, проверка и коммит — за мной.
Все замеры перепроверены независимо: семь контрольных боксов совпали до десятых.

**`Pharos/App/Offer` `2594:22063`** (46 инстансов: 41 Default, 3 Pending, 2 Loading,
**0 Disabled**) — существовавший `OfferCard` сверен и починен, 10 расхождений:

- радиус был 12, в Figma **16**;
- Disabled гасил всю карточку через `opacity-50`, в Figma хром остаётся, а 38% получают только
  строки контента → появился токен `--opacity-disabled`;
- `Distance` и `Schedule` были вторичным цветом, в Figma привязаны к `color/text/primary`;
- `Deadhead` вместе с иконкой были primary/secondary, в Figma — `offer/text/highlight` `#225d74`;
- `Decision timer` **скрыт во всех четырёх вариантах и во всех 46 инстансах** → стал пропом
  `showTimer`, по умолчанию выключен (это изменение поведения для потребителей);
- строка цены выравнивалась по базовой линии, в Figma — по нижнему краю (counterAxis MAX);
- у пилюли таймера радиус был 8, в Figma — пилюля;
- скелетон Loading был выдуман; заменён на реальные полосы Figma (72×24, 68×16, 42×16, 149×20,
  129×16, 158×16, 217×16; ряды 36/28/24/20/20, gap 8, r4, `#e8edf0`).

Замеры: Default 370×190, r16, рамка 1px `#d7e0e6`, pad 16, gap 8 — точно; **Loading — 0 из 71 780
пикселей** отличий от рендера Figma; Pending 370×255.

**`Pharos/Offer preview` `26:73`** — новый `OfferPreview.tsx`. 32 инстанса, и **все Size=Desktop**
(460/628 ширины), поэтому размер по умолчанию `desktop` и есть проп `full`. 440×148, 440×182 и
мобильные 358×290, 358×318 воспроизведены. Ограничения честные: у мобильных вариантов вложенные
инстансы в Figma **пустые** (подписи неизвестны, взяты с десктопа), а сам сет Figma не рендерит —
экспорт даёт PNG 1×1, поэтому визуального эталона нет и сверялись с десктопными инстансами на
странице 21.

**`Pharos/App/Route card` `2715:1535`** — новый `RouteCard.tsx`: Expected `2715:1465` 370×235 и
Known `2715:1500` 370×339. Pixel diff для Expected — **0 отличий**. Находка: Figma **рисует**
ссылку Known «Navigate» подчёркнутой, хотя API отдаёт `textDecoration: NONE`; проверка трёх узлов
по отдельности показала, что у однотипной ссылки в Offer подчёркивания нет → у `ButtonLink`
появился проп `underline` (по умолчанию `false`, поведение существующих вызовов не меняется).

**`Pharos/Information section` `2576:2265`** (116 инстансов — второй по частоте элемент) — новый
`InformationSection.tsx`, 11 сторей, все 4 варианта (Wide `140:49`, Compact Payment `2466:14783`,
`14795`, `14807`), три булевых свойства Figma стали слотами (`country`, `status`, `action`).
Ключевое открытие: **чип статуса и «key fact» взаимоисключающие** — чип заменяет key fact в
ведущей строке. Найденное расхождение: 3 из 4 вариантов нарисованы высотой 142, а контент
заканчивается на y=110 — 20px мёртвого места; доказано временным инстансом (создан и удалён).
Стори `CompactPaymentPendingFixed142` фиксирует 142, как нарисовано.

**`Route summary` — поправка к выбору агента.** Агент B выбрал `671:977` и заявил, что `26:27` на
страницах водителя не инстанцируется вовсе. Адресный подсчёт (ловушка 22) показал иначе: используются
**оба**, просто на разных страницах.

| Сет | Инстансов | Где |
|---|---|---|
| `Pharos/App/Route summary` `671:977` (370×92) | 6 | страница 30 — iOS App / Driver |
| `Pharos/Route summary` `26:27` (358×170) | 4 | страница 21 — Driver / Search and request |
| локальный фрейм `2668:14790` «Route summary v2» (370×78) | — | экраны Loads, **не библиотечный компонент** |

Значит `RouteSummary.tsx` покрывает страницу 30; при переносе экранов страницы 21 понадобится второй
компонент из `26:27`, а для `/loads` — свой блок из `2668:14790`.

**Геометрия переехала в токены.** Все три агента независимо упёрлись в то, что метрики оболочки и
карточек лежат в `globals.css`, а не в `design/tokens.json`. Перенёс группами `screen`, `status-bar`,
`nav-bar`, `sticky-bar`, `viewport`, `tab-bar`, `home-indicator`, `card`, `control`; добавил
`opacity.disabled` (0.38), `spacing.10` (10px), `shadow.card`. Имена переменных сохранены, поэтому
ни один компонент не пришлось править, `globals.css` теперь содержит только `body`. Аудит токенов
подтвердил, что ни одна из 20 переменных не потерялась. Заодно ушли два приближения: спейсеры
10px в Offer Pending и Route card теперь настоящие (были 8px, из-за чего кнопка стояла на 2px левее).

### 4.8. Карты — `Pharos/App/Approach map` и `Pharos/Route map`

Обе карты — это векторный арт плюс живые подписи и маркеры. Арт **выгружен из Figma как SVG**
(MCP `download_assets` с `defaultFormat: 'svg'` отдаёт весь фрейм рисунка, а не по одному вектору)
и лежит в `src/assets/maps/`, как флаги в `src/assets/flags/`. Цвета самого арта живут в ассете,
поверхность карты и хало — в токенах (`color-map-land` `#f2f6f4`, `color-map-halo` `#d1ede8`).

**`Pharos/App/Approach map`** `719:355` — один компонент, 402×646, 15 инстансов. Арт `719:356` →
`approach-402x646.svg`. Замеры совпали точно: хало 64×64 на (58,333), обводка драйвера 30×30 на
(75,350), точка 20×20 на (80,355), пилюля «You · demo» 96×36 на (36,395), пилюля пикапа 145×44 на
(198,183) с белым пином 20×20, точка пикапа 16×16 на (272,227), подпись города (220,145), карточка
саммари 159×64 на (16,16), капшн на (16,436).

**`Pharos/Route map`** `330:164` — 6 вариантов: Size=Desktop 628×674 (`330:2` Results · `330:33`
Selected · `330:67` Loading) и Size=Mobile 358×320 (`330:84` · `330:114` · `330:147`). Арт выгружен
в двух размерах (`route-628x674.svg`, `route-358x320.svg`) — это разные нарезки одного рисунка.
Замеры после правок совпадают до пикселя: хало 40×40 на (50,227) / (110,170) / (258,71), диск 28×28,
хедер 218×74 (мобайл) и 250×78 (десктоп), саммари выбранного груза 580×66 на (24,563), точки
загрузки 18×18 и скелетоны 310×20 r10 / 205×12 r6.

Три вещи, которые пришлось выяснить:

1. **Рамка 1px сдвигала всё на пиксель.** Figma рисует обводку внутрь фрейма, а CSS-рамка съедает
   пиксель из padding box, от которого считаются абсолютные дети → каждый элемент уезжал на +1px
   по обеим осям (ловушка 20). Лечится не магическими −1, а тем, что рамка рисуется **оверлеем**
   (`absolute inset-0 border`), а коробка остаётся без рамки.
2. **Хало в Selected растёт вокруг центра, а не от угла.** В Results хало 40×40, в Selected — 50×50
   (и диск 34 вместо 28), но центр тот же: позиции надо считать от центра, иначе элемент уезжает
   на 5px. В первой версии были дельты от угла — исправлено.
3. **В Loading точки есть только у origin и destination**, у промежуточной остановки (Tourcoing) —
   нет. Первая версия рисовала три.

**Копирайт.** В этом сете Figma текст русский («Грузы по маршруту», «Лилль → Брюссель»), а по
правилу 5 приложение английское. Дефолты компонента английские; заголовок пришлось сделать короче
(«Loads on route») — дословный перевод «Loads on your route» в бокс 187px не влезает, переносится
на вторую строку и карточка вырастает с 74 до 102px.

### 4.9. Волна 3 — фильтры, чат, рейс, веб-хром

Пять агентов параллельно; ниже — то, что они нашли, с моими перепроверками. Общее число
перенесённых компонентов выросло с 21 до 50.

**Область работ уточнилась, и это важно.** Часть «компонентов водителя» на самом деле —
**веб-хром страницы 21**, а не iOS-оболочка страницы 30:

| Сет | Инстансов | Где живёт |
|---|---|---|
| `Pharos/Sidebar` `82:150` | 30 | страница 21, только 1440-широкие веб-фреймы |
| `Pharos/Page header` `167:65` | 30 | страница 21, те же 1440-фреймы (Inline 18, Actions 12) |
| `Pharos/Mobile header` `26:24` | 14 | страница 21, 390-широкие мобильно-веб фреймы |
| `Pharos/Route search + filters` `340:404` | 18 | страница 21, **все 1112 шириной**; в телефоне нет ни одного |

То есть страница 21 держит и веб-портал водителя (1440, сайдбар + page header), и его
мобильно-веб версию (390, mobile header). `MobileHeader` — не замена `NavigationBar`: другой сет,
другая страница, другая поверхность (390 против 402, 80 против 76/60, текстовая кнопка Back
88×48 против иконки-шеврона 44×44, инициалы 48 против 44). Компоновать их не стали, `ScreenFrame`
не тронут. **Телефонный sticky bar — это не библиотечный компонент, а screen-local фрейм
`2668:14779` (402×64) → `2668:14780` (370×48), собранный из Filters button + View switch**, а
применённые чипы живут отдельной строкой `2551:12646` (370×40).

**Фильтры** (View switch `2041:411`, Filters button `2646:1314`, Filter chip `338:211`,
Filter chip v2 `2621:1288`, Route search `340:404`): геометрия сошлась точно — сегменты 110×42
на 3/113/223, коробки 226×48 / 336×48 / 123×48 / 108×34 / 92×44 / 106×40, панель поиска 246
ровно, ряды на y25/y61/y153, колонки 253.5 / 257.5. Пиксельная разница панели фильтров — **1.31%**,
и вся она на строках текста. Два задокументированных отклонения: hug-ширины на 0–1px уже
(Figma округляет текстовые боксы вверх: «Filters» 40.5 → 41) и галочка в чипе v2 — рукописный
вектор Figma `M 0 4 L 3 7 L 9 0`, а не lucide-глиф (взяли lucide `Check` и подняли `strokeWidth`
до `2*24/14`, чтобы нарисованный штрих был 2px, как в Figma).

**Чат** (Message bubble `384:355`, Cargo context `2188:8055`, Composer `2188:7944`,
Chat/Rate offer `2189:8453`): коробки 280×94, 370×64, 370×48, 302×216 сошлись. Два содержательных
момента: у Message bubble **все 15 инстансов на странице 30 переопределяют вариант** (294 шириной,
r16, gap 6, без обводки, без строки отправителя, исходящий фон `#def5f0`) — добавлен `skin="plain"`,
дефолт следует экранам; а Empty-состояние Composer'а несёт Button `State=Disabled`, то есть
отправлять можно только из Draft (это поймал замер, первая версия рисовала активную кнопку).
`Chat/Rate offer` — **не** `Rate offer card`: 2 варианта против 3, 302 против 280, белая
поверхность без обводки против тонированной с рамкой, и живут они на разных страницах.

**Рейс и профиль** (Onboarding progress `2062:410`, Progress step `2553:1238`, Driver profile
`769:10428`, Trip steps `2728:26593`, Day item `2021:2666`, Trip preparation `2715:1617`,
Application progress `734:426`): все 33 коробки совпали точно (370×4, 338×24, 370×82/100, 370×278,
370×87/86/72, 370×110/90, 370×180/148). Попутно построен `ProgressStep` — он не был в инвентаре,
но Trip steps и Application progress инстансят его 14 раз. `DriverAvatar` (`755:366`) — отдельный
компонент от `Pharos/Avatar`: 48×48, `#eff2f5`, инициалы Manrope Bold 24/32 против 40×40,
`#bce5d5`, DM Sans Medium 14/20.

**Токены, добавленные по заявкам агентов** (все — реальные пробелы, а не самодеятельность):
`spacing.14` (14px), `radius.2xs` (2px), `radius.6` (6px), `text.heading-12` и `text.heading-14`
(Manrope SemiBold — рампа заголовков начиналась с 20/28), `color-chat.bubble-outgoing-bg`
(`#def5f0`). Проверено в Figma: **радиусы 2 и 6 в файле вообще не привязаны к переменным** —
в коллекции радиусов только none/xs/sm/md/lg/pill, то есть у самого дизайн-файла есть сырые
значения, которые репозиторий токенизирует.

**`Route summary` `26:27`** — последний компонент из инвентаря. Это одиночный компонент (не сет),
358×170, и он **мобильно-веб сводка страницы 21**: три инстанса в 390-широких экранах
(«03 · Проверка заявки», «04 · Заявка отправлена», «05 · Заявка принята») шириной 324/358 и один в
1440-фрейме. Это **другой** компонент, чем `671:977` со страницы 30 (370×92 с рельсой остановок),
а не его вариант — поэтому отдельный файл `RouteSummaryWeb.tsx`. Замеры: 358×170, r16, рамка 1px
`#d7e0e6`, pad 16, gap 12, строки на y17 (20/28 Manrope SemiBold), y57 и y89 (14/20 DM Sans Regular
`#586d79`), прайс-строка 324×32 на y121 с «360 €» 24/32 Manrope Bold слева и «111 km loaded»
12/16 справа — всё совпало. Ловушка 20 здесь **не** срабатывает: дети в потоке, поэтому border+pad
дают те же 17px, что и inside-stroke в Figma.

### 4.10. Волна 3 (продолжение) — ввод, загрузка и оффер

**Select** `344:51`, **Offer route** `693:995`, **Empty details panel** `129:46`,
**Offer terms** `693:1013`, **Location suggestions** `190:117`, **Keyboard** `2776:1613`,
**Upload field** `2013:3064`, **Driving licence preview** `2091:441`. Все восемь сошлись по
габаритам: 370×76, 370×215, 370×174 (инстанс `2207:8233`; сет 648×154), 370×256, 370×166 на 370,
402×258, 370×180, 370×180.

Решения по композиции: `Select` **намеренно не** собран из `Input` — у него нет слота под MapPin,
нет подсказки, нет focus-ring, это кнопка с шевроном по SPACE_BETWEEN и панелью 118 в высоту;
`DrivingLicencePreview` наоборот **собран поверх** `UploadField` через слоты `preview`/`previewTone`;
`LocationSuggestions` — это панель-дропдаун, а не поле. У `Offer terms` чат — настоящая `Button`
в слоте 82px (инстанс Figma на 16px шире естественного hug).

Два места, где честно **не** удалось совпасть: **фаза пунктира** у Upload field Empty (ловушка 27)
и **толщина 1.5px** (ловушка 24) — обе задокументированы в контрактах файлов. Плюс `Offer terms`
вообще не имеет рендера для сверки (ловушка 28).

Токены, добавленные по заявкам: `text.caption-10` (10/12), `size-icon.xl` (32px), `radius.5` (5px),
`color-select.option-selected-bg`. Ни одного нового цветового токена сверх этого не потребовалось.

### 4.11. Волна 4 — v2-фиксы по результатам `design/UI-REVIEW.md`

Волна не портирует из Figma, а закрывает дефекты прототипа, найденные численным аудитом
(`design/UI-REVIEW.md`). Прототип здесь ведущий, поэтому критерий — не node-id, а измеренная
геометрия, контраст по WCAG 2.1 и правило 5 (английский).

**P0-1 · русские строки в v2.** `QuickApplyModal.tsx` был русским целиком (заголовок, три строки
`dl`, чек-лист, обе кнопки, сообщение об ошибке), `ApplicationTracker.tsx` — на 4 строки
(REJECTED-сообщение, две кнопки отклонения, текст `alert`). Заменено на английский; i18n-слоя в
репозитории нет (`grep` по `i18n|react-intl|formatjs|useTranslation` пуст), то есть это был дрейф,
а не локаль. Кириллица, которая осталась в `src/`, — это **комментарии** о русских строках Figma
(их правило 8 требует) и `bl/Search.tsx:12`, где `познань` лежит в allowlist ввода польской демо.
Тесты, утверждавшие русские строки, обновлены в том же коммите: `QuickApplyModal.test.tsx`,
`LoadCta.test.tsx`, `LoadCard.test.tsx`.

**P0-2 · focus-ring.** `Pharos/Button` State=Focus (2px `color/focus/ring`, offset 4px) был
доступен только через ручной проп `focus`, поэтому с клавиатуры кольца не было ни на одной CTA.
Добавлен `FOCUS_VISIBLE` (`focus-visible:outline-2 … outline-offset-4`) в `Button` и `ButtonLink`.
Это восстановление уже задокументированного состояния Figma, а не новое решение.

**P1-1 · одна палитра вместо двух.** Группа `color-load-state-*` (8 токенов) удалена из
`design/tokens.json`, `tokens.css` перегенерирован: **192 → 184 переменных**. Состояния карточки
теперь выражаются только через `color-status-*`: левый акцент 4px берёт `-text`, пилюля — пару
`-bg`/`-text`. Замерено до и после (Chrome, `getComputedStyle` + WCAG):

| Канал | До | После |
|---|---|---|
| Акцент pending на своём фоне | `#f59e0b` на `#fffbeb` = **2.07:1** | `#855300` на `#ffffff` = **6.49:1** |
| Акцент booked | `#16a34a` на `#f0fdf4` = **3.15:1** | `#216547` на `#ffffff` = **6.96:1** |
| Акцент rejected | `#ef4444` на `#fef2f2` = **3.44:1** | `#b8332f` на `#ffffff` = **5.91:1** |
| Акцент cancelled | `#9ca3af` на `#f9fafb` = **2.43:1** | `#526773` на `#ffffff` = **5.92:1** |
| Пилюля против фона карточки | `#fffbeb` vs `#fff4df` = **1.05:1** (невидима) | 1.09–1.37:1 тонировка на белом |
| Текст пилюли | не нормировался | **5.20–6.25:1** (AA) |

Ключевая находка, которой не было в ревью: пилюля состояния была практически невидима на
собственной карточке (1.05:1), потому что фон карточки и фон пилюли брались из двух палитр и
оказались почти одним цветом. Теперь состояние дублируется тремя каналами: тонировка пилюли,
AA-текст пилюли и акцент ≥5.9:1.

**Отклонение (по просьбе клиента, 2026-10-10): полоса-акцент слева снята.** `CARD_STATE_STYLES`
больше не содержит `border-l-4`: `container` одинаков у всех пяти состояний (`bg-surface`), носитель
состояния — только пилюля (`badge`). Измеренный в таблице выше сигнал P0-3 «граница pending»
больше не существует в DOM: pending и available теперь геометрически идентичны, различие — лишь в
пилюле и CTA. Если водитель читает ленту на периферийном зрении, это потеря: возврат полосы —
одна строка на состояние (`border-l-4 status-dependent left-border utility`), токены на месте,
тест фиксирует отсутствие (`not.toHaveClass('border-l-4')`). Зафиксировано здесь, чтобы отклонение
не выглядело как недосмотр при следующем замере.

**P1-2 · иерархия ставки.** В `v2/LoadCard.tsx` ставка была `text-heading-20` (20px), хотя
`text-metric-28` — устоявшийся размер ставки в `OfferCard.tsx:134`, `OfferTerms.tsx:62` и даже в
v1 `LoadCard.tsx:216`. Замер после правки: **28px / 700 / Manrope** — совпадает с остальными
поверхностями. Это восстановление ответа собственной дизайн-системы, а не изобретение.

**P1-3 · глифы вместо реестра.** Бейджи состояний рисовали `⏳ ✓ ✕ ○`, рейтинг — `★` (U+2605),
который наследует шрифт текста вместо набора lucide с обводкой 2px. Заменено на `clock`,
`circle-check`, `circle-x`, `x`; в реестр добавлен `star` (§5). Замер: `class="lucide lucide-star"`,
бокс **12×12**, сырых глифов в карточке **0**. То же в `LoadSheet.tsx:59-65` (блок `Fact icon="shield"`). Попутно закрыт P2-6:
строка маршрута была 344×20, стала **344×44** (`min-h-[44px]`).

**P1-4 отозван.** Пункт «двойной знак валюты» (`€360 €2.85/km`) в ревью был ошибочным: `€X.XX/km`
со знаком евро — последовательная конвенция репозитория (`OfferCard`, `OfferTerms`, `OfferPreview`,
`LoadSheet`, v1 `LoadCard`, сторис, `bl/List.tsx` — все 8+ мест). Без `€` величина `2.85/km`
становится неоднозначной. Не реализовано.

**Осиротевший `LoadTile.tsx` удалён** вместе с `useCountdown.ts` (его единственным потребителем).
Слот под него существует — `SmartLoadList.tsx:95-97`, snap-карусель с обёртками `w-[340px]`, — но
занят `LoadCard`. Монтировать `LoadTile` как есть нельзя: в нём нет модели пяти состояний заявки,
то есть booked/rejected в карусели стали бы неотличимы от available, а видимость состояния — ядро
v2 (`sortLoadsByApplication` + `CARD_STATE_STYLES` существуют ради неё). Полноценный монтаж —
отдельная фича, а не UI-фикс. По DoD репозитория файл был мёртвым: без стори (единственный
v2-компонент без `.stories.tsx`), без теста, без записи в `figma-map.md`. Восстановим из git.

**Ловушки этого замера** (в §2 не добавляю, чтобы не перенумеровать ловушки 24/27, на которые
есть перекрёстные ссылки):

- **Роутер хешевый.** `src/main.tsx` использует `HashRouter`, поэтому `http://host:PORT/v2`
  рендерит **индекс**, а не ленту: роутер читает хэш, а не pathname. Правильный URL —
  `http://host:PORT/#/v2`, а query живёт внутри хеша (`#/application/nordcargo?scenario=reject`).
  Симптом обманчив: HTTP 200, страница живая, но `article` нет.
- **`ApplicationStatus` — UPPERCASE.** Значения enum `'SENT' | 'CONFIRMED' | …`, а не `'sent'`.
  Посев `localStorage` в нижнем регистре молча даёт `data-state="available"`: `store.read()`
  валидирует только верхнеуровневый `status` (через `LEGACY_STATUS`), а карта `applications`
  копируется как есть, и `getLoadCardState` уходит в `default`.
- **Пилюля с иконкой не находится как «лист».** Внутри `<svg>` + текстовый узел, поэтому проверка
  `children.length === 0` её отсекает. Искать надо по **собственным** текстовым узлам элемента
  (`childNodes`, `nodeType === 3`), а не по `textContent`.
- **Общие dev-серверы врут.** В системе висело четыре `vite` из разных каталогов
  (`~/.cline/worktrees/…` и `~/Downloads/Harness-Test/…`) на 5173/5174. Замерять надо против
  сервера, поднятого из своего worktree на выделенном порту (`--strictPort`), иначе часть проверок
  молча пройдёт по чужому коду.
- **Порог «отличимости» пилюли надо выбирать по смыслу.** WCAG нормирует контраст текста, а не
  тонировку чипа: первоначальный порог 1.15:1 на фон пилюли дал четыре ложных падения при живых
  5.20–6.25:1 на тексте и 5.91–6.96:1 на акценте.

Итог: **57/57** замеров, `pnpm check` зелёный (аудит токенов 1397 literal + 6 dynamic / 184 токена,
`tsc` чист, сборка 1943 модуля), `pnpm test` — **47/47** (4 файла). Скриншоты: `/tmp/ui-after/`

**Волна 1 (2026-10-10): сторож починен, три скрытых бага вскрыты.** E2E-спек переведён на английский,
добавлен `beforeEach` со сбросом `localStorage` (`pnpm test:e2e` **3/3**). По пути: `submitApplication`
принимал повторную заявку после CANCELLED (`api.ts:44-50` — guard теперь смотрит и топ-уровень, и
карту `applications`, тест `LoadCta.test.tsx` «does not resubmit after cancellation»); REJECTED-ветка
выделена из дефолтной в `LoadCta.tsx` (`Application rejected` + `View reason`, тест
`LoadCta.test.tsx:39` уже ждал именно это); мусор в карте `applications` отбрасывается
(`getApplicationForLoad` валидирует по enum, тест `LoadCard.test.tsx` «drops applications with a
status outside the enum»). `pnpm test` — **48/48** (4 файла).

**Волна 2 (2026-10-10): доступность и честность.** Пункты 3–8 сводки аудита. `Sheet.tsx` — Escape,
ловушка Tab, `inert` на фоне, возврат фокуса, `role="dialog" aria-modal` с обязательным `label`
(новый `Sheet.test.tsx`, 4 теста); дубль `role="dialog"` снят с `QuickApplyModal.tsx`.
`LoadSheet.tsx` — пилюля состояния в шапке (`role="status"`, те же `CARD_STATE_STYLES`, что у карточки).
Атрибуция отмены: `Cancelled` → `Cancelled by you` (`LoadCard.tsx:75`, `LoadSheet.tsx:45`,
`ApplicationBanner.tsx:12`, `ApplicationTracker.tsx:49`); `Cancel application` — за `window.confirm`
(новый `ApplicationTracker.test.tsx`, 2 теста). `View similar loads` → `Back to loads`
(вела на `listPath` без фильтрации). Тап-таргеты 44: `Home.tsx:77`, табы `SmartLoadList.tsx:67`,
`DemoToggle.tsx:17` (P2-6 закрыт полностью). `ApplicationProgress.tsx` — `ol`, `aria-current="step"`,
видимый «Step N of 4». `pnpm test` — **54/54** (6 файлов), `pnpm test:e2e` — **3/3**, `pnpm check` зелёный.

**Волна 3 (2026-10-10): прочность + карта + чипы.** Пункты 9–11 сводки плюс редизайн Map и крестик
чипов. Выбранный чип: `x` 16px + `aria-label` «…, selected. Activate to remove» (`Home.tsx:77-88`,
замер: высота 44, X в DOM; отклонение от Фигмы — там check — зафиксировано: `FilterChipV2` documents
check/X, инстансы Home используют свой ряд). R1: `getLoads` мемоизирован (`api.ts:17-21`). R2: карточка
читает `applications[load.id]` (`LoadCard.tsx:74-75`). R4: `PickupCountdown` — `memo` + `role="timer"`,
«Pickup in N min» под час. P2-4: empty-state с `Clear filters` (`SmartLoadList.tsx:175-180`,
`Home.tsx:100`, unit + E2E). C4: заголовок модалки «Apply for {from} → {to}». Map: `MapPin` 44px
(`PINS` фиксирует три демо-якоря — для бэка нужна привязка к координатам), `MapCard` 280px без CTA,
тап пина скроллит карусель, шит открывается из карусели (E2E «map pins mirror the feed»).
«Pickup in 0h 0m» убит (`diffMin <= 0 → null`, тест «hides once passed»). `pnpm test` — **57/57**,
`pnpm test:e2e` — **5/5**, `pnpm check` зелёный.

**Волна 4 (2026-10-10): фильтры и маршрут.** Ряд чипов в `Home.tsx` заменён на `FiltersButton`
(Figma `2646:1314`, `count` = число активных; оба варианта бейджа из Фигмы — Shown/Hidden).
Новый `FiltersSheet.tsx` (`FILTERS` + секции Loading day / Minimum rate / Pickup distance,
черновик, `countFor`, `Show N loads` / `No loads match`, `Clear`; крестик X у выбранной опции).
Новая `RouteSheet.tsx` (Destination city, живой счётчик, Apply → `store.route`; P2-1 закрыт).
Шапка — кнопка с `chevron-down` (`Home.tsx:60-79`). `Sheets.test.tsx` (3 теста), `Sheets.stories.tsx`
(5 стори). E2E: фильтры переписаны, +«direction changes». Самонанесённое: ожидал `Filters 2`
после одного фильтра (бейдж = число, не индекс) и фильтрацию ленты направлением (демо-фид
не фильтруется — оба пойманы спеком). `pnpm test` — **59/59** (7 файлов), `pnpm test:e2e` — **6/6**,
`pnpm check` зелёный.

**Волна 4b (2026-10-10): фильтры в ряд с List/Map.** Отдельный ряд кнопки убран: `FiltersButton`
стоит слева в одном ряду с сегментом через слот `tabsPrefix` (`SmartLoadList.tsx:27-28,157-159`;
сегмент `h-44 → h-48`, `Home.tsx:88-94`). Замер живьём: кнопка 95×48, сегмент 268×48, один y (138).
Шит поверх Map не конфликтует (пины под скримом живы — проверено).

**Волна 5 (2026-10-10): скелетон + статусы начисто.** P2-3 закрыт: новый `LoadCardSkeleton.tsx`
(ряды Фигмы `2594:22017` — 72×24 + 68×16/42×16 / 149×20 / 129×16 / 158×16 / 217×16, r4,
`color-offer-bg-skeleton`, `animate-pulse`; `role="status"` + sr-only «Searching for loads…»,
карточки `aria-hidden`) вместо текстового `<p role="status">`. По правилу 4 ряды не скопированы,
а собраны из тех же чисел (`SKELETON_BARS` экспортирован из `OfferCard.tsx`, его шапка
документирует связь). `LoadCardSkeleton.stories.tsx` (Loading), `LoadCardSkeleton.test.tsx`
(скелетон виден, анонс ровно один). Таблица статусов в `UI-REVIEW.md` переписана: каждый P2 —
со своей волной. `pnpm test` — **60/60** (8 файлов), `pnpm check` зелёный.

**Волна 4c (2026-10-10): карта во весь экран + прайс-пины.** Таб-панель на map сняла
`overflow-hidden` (иначе `absolute inset-0` схлопывался в 0px — поймано замером: арт был 402×0,
пины лежали поверх ленты), обёртка `h-full min-h-[300px]` (`SmartLoadList.tsx`). Пины —
пилюли `€{rate}` цветом состояния вместо точек `map-pin`; выбранный — кольцо `text-inverse`
(видно на цветном пине, `focus-ring` тонул). Замер: арт 402×563 (y 186–749, до таб-бара),
карусель 280px поверх низа, пины 44px.
(`card-{available,pending,booked,rejected,cancelled}.png`, `quickapply-modal.png`,
`focus-ring.png`, `v2-list.png`, `v2-map.png`, `tracker-rejected.png`).

## 5. Иконки

Иконки — не мелочь: на экранах водителя их **19 разных, суммарно 900+ инстансов**, самая частая
(`Arrow right`) встречается 120 раз. В Figma это отдельная страница `03 — Icons` (`9:5`) с 23
компонентами; в документации страницы написано: «A single set from Lucide. Size 24 px; 20 px
instances are used inside controls. Colour is bound to Pharos tokens», плюс правило «An icon-only
action needs a tooltip or an accessible name. For a driver the interactive area is at least 48 px».

Всё перенесено в один реестр — `src/components/Icon.tsx` (+ стори `Foundations/Icons`).
Компоненты берут иконку по имени (`<Icon name="map-pin" />`), цвет наследуется через `currentColor`,
обводка всегда 2px, размеры — из токенов (`--size-icon-sm/md/lg` = 16/20/24).
Именно поэтому реестр, а не прямые импорты из `lucide-react`: имя в Figma и имя в lucide
совпадают не всегда, и знать это нужно в одном месте.

| Компонент Figma | Node | lucide | Инстансов |
|---|---|---|---|
| `Lucide/Icon/Truck` | `279:5032` | `Truck` | 8 |
| `Lucide/Icon/Arrow right` | `279:5033` | `ArrowRight` | 120 |
| `Lucide/Icon/Loader` | `279:5034` | `LoaderCircle` | 3 |
| `Lucide/Icon/Map pin` | `279:5035` | `MapPin` | 116 |
| `Lucide/Icon/Bookmark` | `279:5036` | `Bookmark` | 60 |
| `Lucide/Icon/Search` | `279:5037` | `Search` | 95 |
| `Lucide/Icon/Shield` | `279:5038` | `Shield` | 38 |
| `Lucide/Icon/Overview` | `82:114` | **`LayoutDashboard`** | — |
| `Lucide/Icon/Orders` | `82:120` | **`Package`** | 88 |
| `Lucide/Icon/Users` | `82:124` | `Users` | — |
| `Lucide/Icon/Reports` | `82:128` | **`ChartNoAxesColumn`** | — |
| `Lucide/Icon/Help` | `431:19` | `CircleHelp` | 30 |
| `Lucide/Icon/Info` | `575:9647` | `Info` | 19 |
| `Lucide/Icon/Triangle Alert` | `575:9652` | `TriangleAlert` | 16 |
| `Lucide/Icon/Circle X` | `575:9657` | `CircleX` | 9 |
| `Lucide/Icon/Circle Check` | `575:9661` | `CircleCheck` | 28 |
| `Lucide/Icon/User Round` | `754:11` | `UserRound` | 60 |
| `Lucide/Icon/Calendar` | `2006:13` | `Calendar` | 64 |
| `Lucide/Icon/Clock` | `2006:17` | `Clock` | 36 |
| `Lucide/Icon/Camera` | `2008:11` | `Camera` | 2 |
| `Lucide/Icon/Image` | `2008:16` | `Image` | — |
| `Lucide/Icon/Sliders horizontal` | `2644:2` | `SlidersHorizontal` | 21 |
| `Lucide/Icon/X` | `2648:2` | `X` | 11 |
| *(вне неймспейса)* `Icon / chevron.left` | — | `ChevronLeft` | навбар Back |
| *(prototype-led)* рейтинг перевозчика | — | **`Star`** | v2 Load card / Load sheet |

Жирным — те четыре, где имя компонента не совпадает с глифом (ловушка 18). Размеры `11/12/14 px`
в дизайне тоже встречаются, но токенов под них нет — реестр принимает число, а вопрос вынесен в §7.

Проверено: лист иконок (`Foundations/Icons → Sheet`) отрисован и сверён с Figma — 24 иконки,
все 24×24, `stroke-width: 2px`, глифы совпадают. Стори `Sizes` показывает 16/20/24 и 14 без токена,
`InheritsColour` — что цвет приходит от родителя.

**Дополнение волны 4 (§4.11).** В реестр добавлен `star` (`Lucide/Star`) — теперь **27 имён**.
Причина: v2-карточка и `LoadSheet` рисовали рейтинг перевозчика сырым `★` (U+2605), который
наследует шрифт текста и поэтому не совпадает ни по толщине штриха, ни по оптическому размеру с
набором lucide. Статус тот же, что у `check` и `chevron-down`: голый глиф lucide, а не компонент,
зарегистрированный на странице `03 — Icons`. Замерено в Chrome: `class="lucide lucide-star"`,
бокс **12×12**, обводка 2 lucide-единицы, цвет наследуется от `currentColor` родителя; сырых
`⏳ ✓ ✕ ○ ★` в v2-карточке **0**. Отдельная стори не нужна — `Icon.stories.tsx` строит Controls и
лист из `Object.keys(ICONS)`, поэтому новое имя появляется в витрине само (строка 23 и 42 файла).

## 6. Экраны

### 6.1. `/search` — iOS / first-search-v2.1 / Loads (refined) · `2772:12931`

Первый собранный экран; делался только из уже проверенных компонентов (оболочка, Input, Button),
новых токенов не потребовал. Файл — `src/screens/Search.tsx`, стори `Screens/Search`.

| Элемент | Figma | Замер |
|---|---|---|
| экран | 402×874, канвас `#f4f6f8` | 402×874 |
| статус-бар | инстанс без Dynamic Island, 62 | 62, острова нет |
| навбар | Type=Home, 76, заголовок «Loads» 24/32 Manrope Bold на (16,84) | (0,62) 402×76; заголовок (16,84) Manrope 24/32 fw700 `#172a35` |
| заголовок блока | «Find loads on your route» 24/32 Manrope Bold на (16,162) | (16,162) Manrope 24/32 fw700 |
| Input «Start» | (16,214) 370×76, label 20, control 48 | (16,214) 370×76; label 20 на 214; control (16,242) 370×48; подсказка скрыта |
| Input «Destination (optional)» | (16,310) 370×76 | (16,310) 370×76; control (16,338) 370×48 |
| Button «Use my location» | (16,637) 370×48, Secondary | (16,637) 370×48, фон белый, текст `#225d74`, иконка-пин после лейбла |
| Button «Find loads» | (16,693) 370×48, **State=Disabled** | (16,693) 370×48, фон `#c3d0d8`, текст `#80929e` |
| таб-бар / home indicator | y757 h83 / y840 h34 | совпало |

Решения, которые стоит знать:

- **«Find loads» включается по вводу.** В Figma нарисовано только состояние Disabled; в прототипе
  кнопка активируется, когда заполнен `Start` — это поведение, которое дизайн подразумевает.
  Стори `Filled` показывает это состояние.
- **Переход на экран результатов не подключён** — экрана ещё нет. Кнопки не навигируют.
- **Иконки таб-бара сверил по рендеру, а не по именам.** В этом экране инстанс второй вкладки
  резолвится в `Lucide/Icon/Orders`, хотя рисует тот же куб, что `Lucide/Package` в component set.
  Рендер экрана подтвердил: Search, куб, календарь, user-round — как в `TabBar.tsx`.
- **Ширина боксов заголовков** у меня 370 (span тянется по `w-full`), в Figma — hug 354/144.
  Текст выровнен по левому краю, поэтому визуально и по позиции букв совпадает; это не расхождение.

_Остальные экраны — в работе._

## 7. Открытые вопросы

- **`Pharos/App/Offer terms` скрыт в Figma** вместе со всеми шестью инстансами, экспорт даёт PNG
  1×1. Числа сняты с дерева узлов и сходятся, но визуально компонент не подписан. Нужно решение
  дизайна: расчехлить компонент, иначе 1:1 остаётся подтверждённым только по геометрии.
- **У бельгийского флага ведущая полоса задана `#000000`** — и в квадратном сете `249:1668`, и в
  круглом `198:1645`. Это дефект данных Figma, а не порта: уже отгруженный `belgium.svg` его
  унаследовал. Нужно исправить в Figma и переэкспортировать оба ассета.
- **Штрих 1.5px и фаза пунктира в CSS не воспроизводятся** (ловушки 24 и 27): Chrome округляет
  толщину рамки до целых пикселей, а длины штриха у `border` нет вовсе. Обход — SVG-оверлей, но
  фаза пунктира всё равно расходится на 0–4px по сторонам. Либо дизайн переходит на 1px/2px и
  целые длины штриха, либо это остаётся задокументированным отклонением.
- **Веб-хром страницы 21 — продуктовый вопрос.** `Sidebar`, `Page header`, `Mobile header` и
  `Route search + filters` портированы (они инстансятся на странице водителя), но это веб-портал,
  а не iOS-приложение. Нужно подтвердить, что он входит в область прототипа.
- **Языковой слой в `Route search`.** Рендер рисует поиск по-русски, API отдаёт английский
  (ловушка 25). Отгружено по-английски по правилу 5 — если продукт локализуется на русский,
  решение надо пересмотреть.
- **Размер Web vs Mobile.** У Button и Input в Figma есть оба размера; приложение водителя
  использует Mobile (48). Реализованы оба, стори показывают Web отдельно.
- **Размеры иконок 11/12/14 px не покрыты токенами.** В дизайне они встречаются (`Arrow right`
  16/20, `Map pin` 11/16/20, `Search` 14/20/24, `Clock` 12/16/20), а токены есть только на
  16/20/24. Реестр принимает число, но по правилу 1 это хардкод — нужен либо токен на 12/14,
  либо подтверждение, что эти размеры вне системы.
- **Арт встроенной карты в Load card — закрыто.** Выгружен в `src/assets/maps/loadcard-inline-382x162.svg`,
  блок собран заново: 324×137 при ширине 324 (ровно 382:162), подписи городов живым текстом.
- **`Route summary` со страницы 21 — закрыто** (`RouteSummaryWeb.tsx`). Остаётся третий блок:
  экраны Loads рисуют свой локальный фрейм `2668:14790` (370×78), под него нужен компонент.
- **`Offer preview` нечем сверить визуально**: Figma отдаёт PNG 1×1 для всего сета, а мобильные
  варианты содержат пустые вложенные инстансы, поэтому их подписи выведены с десктопа. Нужен
  либо рабочий экспорт из Figma, либо решение дизайна по мобильным подписям.
- **`Trip checklist` перенесён только в `State=Awaiting`** (единственное состояние, которое
  использует Bottom sheet); остальные состояния не портированы.
- **Высоты вариантов `Pharos/Bottom sheet` в Figma не равны содержимому** (см. §4.6): это
  `primaryAxisSizingMode = FIXED`, выставленный по самой высокой карточке ряда. Прототип
  отрендерен по настоящей hug-высоте, поэтому числа расходятся на 8-96 px. Нужно решение дизайна:
  либо во фреймах выставить `AUTO` по вертикали, либо зафиксировать высоты сознательно и тогда
  перенести их в код как токены.
- **Шрифты идут с Google Fonts (CDN).** Офлайн-сборка уедет в `system-ui`. Если нужна
  автономность — скачать woff2 в `public/fonts` и заменить ссылки на `@font-face`.
- **Hover и Pressed нельзя показать стори.** Это CSS-псевдоклассы, поэтому в Storybook они не
  отдельные истории — проверяются замером с настоящим курсором. Если понадобится видеть их
  в витрине, нужен аддон pseudo-states.
- **Свойства компонентов не становятся стори.** У Status есть `Show dot` и `Label`, у Input —
  скрытый `Required`: это properties, а не варианты, поэтому стори ровно по вариантам.
- **`NavigationBar` держит свой `AvatarInitials` 44×44** — в Figma это отдельный фрейм `Profile`,
  а не инстанс `Pharos/Avatar` (там 40×40), так что дублирование оправдано, но при появлении
  третьего размера аватара это стоит свести в один компонент.
- **`storybook-static/` устаревает** после каждой правки — перед публикацией нужен `pnpm build-storybook`.
- **Встроенный Chromium Playwright не скачан** (загрузка висела). Проверки идут через
  установленный Google Chrome (`channel: 'chrome'`).


## Продолжение 2026-10-10: отмена трипа

Подключён CancelTripSheet к `/trip/:id`: причина, подтверждение, loading/error, Keep trip.
После отмены itinerary остаётся доступным со статусом Cancelled by you; действия Navigation/Documents скрыты.
Предупреждение явно демонстрационное: политика не утверждена, реальный штраф не применяется.
Store сохраняет метаданные при set/read; restore удаляет только dismissed-запись; новая заявка очищает dismissed.
Проверено: vitest 63/63, Playwright Chrome 7/7 (включая отмену и сохранение причины/tripId), pnpm check проходит.
Геометрия относительно Figma не измерена: это prototype-led дополнение, не подтверждённый 1:1 порт.
Открыто: утверждение политики, проверка undo на карте и перезагрузки, дополнительные UI-тесты и замеры.
