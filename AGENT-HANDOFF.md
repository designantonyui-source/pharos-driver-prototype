# AGENT-HANDOFF — Pharos driver v2 · отмена заявок и скрытие лоадов

> Документ для **следующего агента**. Пишется по факту, а не по памяти: всё, что помечено
> «проверено», подтверждено командой из §6 и выводом, который здесь процитирован. То, что в этой
> сессии не запускалось (например, E2E), помечено явно — не считать это подтверждённым.

- Дата: 2026-10-10
- Ветка: `cline/27a46`, HEAD `8c07b21`
- Worktree: `/Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype`
- Стек: React 19.3 + Vite + Tailwind (токены только из `src/styles/tokens.css`), vitest, Playwright (`channel: 'chrome'`, viewport 402×874, база `http://127.0.0.1:4173`)

---

## 0. TL;DR

Мы добавляем в v2 (экран `/v2`) две вещи, которых в Фигме нет и которые клиент попросил как поведение:

1. **Скрыть лоад до отклика** (decline / dismiss) — бесплатно, обратимо, не влияет на рейтинг.
2. **Отмена подтверждённого трипа** — с причиной, предпросмотром последствий и финальным подтверждением.

Сделана примерно половина: **UI скрытия лоада подключён**, **шит отмены написан, но никуда не подключён**,
**логика на уровне `api.ts` нерабочая из-за бага в `store.set`** (см. §3 — это главное, что нужно починить
первым делом; сейчас обе фичи нельзя считать работающими).

`git status` чистого результата не даёт: изменения не закоммичены, поверх лежат артефакты прошлых волн.

---

## 1. Что именно просили (scope сессии)

- Скрывать (dismiss) доступные лоады — «не интересно» — и **отменять это решение** (undo).
- Отменять **уже подтверждённый** трип, с выбором причины и предупреждением о последствиях.
- Отменять заявку, которую диспетчер **ещё не рассмотрел** (это уже было, `cancelApplication`).
- Явно не смешивать эти два случая в данных: «скрыл лоад» ≠ «отменил трип».

Отложено по решению человека: **мультилоад** (несколько заявок одного водителя одновременно).
Приложения хранятся per-load (`applications`), но баннер/трекер/таймер до сих пор живут на
одном верхнеуровневом `loadId`/`status`. Не начинать мультилоад, не переписав это.

---

## 2. Что сделано и чем это доказано

| # | Изменение | Файлы | Доказательство |
|---|---|---|---|
| 1 | Кнопка «скрыть» на доступной карточке (44×44, `aria-label`, не всплывает в открытие карточки через `stopPropagation`) | `src/components/v2/LoadCard.tsx` | `getLoadCardState` сначала проверяет `dismissed`; `onDismiss` вызывается только при `state === 'available'` |
| 2 | Лента исключает скрытые + строка «N loads hidden / Show again» | `src/screens/v2/Home.tsx`, `src/components/v2/SmartLoadList.tsx` | `visible` фильтрует `dismissedIds`; карта и пины берут тот же `sortedLoads` из пропсов — значит скрытое не попадает и на карту |
| 3 | Шит отмены: причина (radio), предпросмотр штрафа, финальное подтверждение, `Keep trip` | `src/components/v2/CancelTripSheet.tsx` (новый, 90 строк) | контракт-заголовок + токены `color-status-warning-*`; **НЕ ПОДКЛЮЧЁН** к `TripDetails` — см. §4.2 |
| 4 | `dismissLoad` / `restoreLoad` / `cancelTrip` / `CancelTripPenalty` | `src/lib/api.ts` | tsc чистый; **семантика сломана стором** — §3 |
| 5 | Типы `dismissed`, `cancelReason`, `cancelledAfterConfirm` | `src/lib/store.ts` | — |
| 6 | Заглушка правила «нельзя перебронировать отменённый трип 24 ч» | `src/lib/api.ts` `submitApplication` | **МЁРТВЫЙ КОД** — флаг не выживает ни одного `store.set` (подтверждено пробником, §3.1) |
| 7 | `LoadCard` читает свою ячейку `applications[load.id]` | `src/components/v2/LoadCard.tsx` | подписка при этом **всё ещё на весь стор** — в коде стоит честный комментарий «open R2» |

Проверенный baseline после этих правок (команды из §6):

- `npx tsc --noEmit -p tsconfig.json` → **пусто (0 ошибок)**
- `node tools/audit-tokens.mjs` → `OK — every var() resolves to a token.` (1467 литеральных `var()` + 6 динамических, 184 токена)
- `npx vitest run` → **8 файлов / 60 тестов passed**
- `npx vite build` → см. §6 (результат вписан ниже)

---

## 3. 🔴 Блокеры: логика отмены/скрытия сейчас не работает

Это нашёл финальный разбор кода, а не тесты — тесты этого не ловят, потому что их нет (§4.1).
Порядок — по убыванию вреда.

### 3.1 `store.set()` затирает per-load метаданные → вся фича отмены мертва

`src/lib/store.ts:71-84`:

```ts
set(patch) {
  const next = { ...memory, ...patch, applications: { ...memory.applications, ...patch.applications } };
  if (next.loadId && next.status) {
    next.applications[next.loadId] = {          // <-- полная замена, не merge
      loadId: next.loadId, status: next.status, submittedAt: next.submittedAt,
      ...(next.status === CONFIRMED ? { tripId: ... } : {}),
    };
  }
  ...
}
```

Следствия. Первые два **подтверждены эмпирически** временным vitest-пробником
(`src/lib/*.test.ts`, jsdom, запуск `npx vitest run src/lib/probe.test.ts`, файл после проверки удалён):

```
FAIL probe > cancelTrip keeps cancelReason (EXPECTED TO FAIL)
  AssertionError: expected undefined to be 'breakdown'     # entry.cancelReason === undefined
FAIL probe > dismissLoad then restoreLoad removes the entry (EXPECTED TO FAIL)
  AssertionError: expected { loadId: 'belroute', …(3) } to be undefined
  Received: { "dismissed": true, "loadId": "belroute", "status": "CANCELLED", "submittedAt": null }
PASS probe > dismissed flag survives on a non-active load  # dismiss работает, когда лоад НЕ верхнеуровневый
```

Третье следствие (persist-часть) проверяется теми же вызовами в консоли браузера.

1. `cancelTrip()` (`src/lib/api.ts:93-104`) передаёт **и** `loadId`+`status: CANCELLED` на верхний уровень,
   **и** патч `applications[loadId]` с `cancelReason`/`cancelledAfterConfirm`. Патч применяется, а затем
   строка 74 затирает его объектом без этих полей. → **`cancelReason` и `cancelledAfterConfirm` не сохраняются никогда.**
2. Как следствие, guard в `src/lib/api.ts:42-45` (`if (existing?.cancelledAfterConfirm) throw ...`) —
   **недостижимый код**. Правило «нельзя перебронировать 24 ч», которое обещает комментарий в `api.ts:77`,
   не реализовано. Нужно либо реализовать, либо убрать обещание из комментария (правило бизнес-политикой
   не утверждено — см. §8).
3. Побочно теряется `tripId`: при отмене статус ≠ CONFIRMED, поэтому `tripId` не переносится, и пилюля
   «Booked · TR-…» превращается в «Cancelled by you» без идентификатора. Решить, нужно ли хранить `tripId` после отмены.

**Фикс (минимальный, не ломающий чтение из localStorage):** в `set()` мержить, а не заменять —
`next.applications[next.loadId] = { ...next.applications[next.loadId], loadId, status, submittedAt }`,
и не терять `tripId` при не-CONFIRMED статусах. Обязательно добавить юнит-тест в `src/lib/api.test.ts`
на то, что `cancelReason`/`cancelledAfterConfirm` выживают.

### 3.2 `restoreLoad()` не удаляет запись — кнопка «Show again» не работает

`src/lib/api.ts:63-69` кладёт `{ [loadId]: _removed, ...rest }` в `store.set({ applications: rest })`,
но `set()` **мержит**: `{ ...memory.applications, ...rest }`. Ключ, которого нет в `rest`, остаётся в памяти.
Пробник это подтвердил: после `dismissLoad` + `restoreLoad` запись живёт с `dismissed: true` — то есть
**Undo не работает вообще**, а не «срабатывает после перезагрузки». Плюс `read()` при загрузке восстановит
любую запись с верхнеуровневым `loadId`, поэтому «удалить через merge» — тупиковый путь в принципе.

**Фикс:** добавить в `store.set` поддержку удаления (например `removeApplications: string[]` или `setApplications(fn)`),
а не пытаться удалить ключ через merge. Не хардкодить `localStorage` в `api.ts` (правило 6 в `AGENTS.md`).

### 3.3 `cancelTrip` считает временем подтверждения время отклика

`src/lib/api.ts:87`: `confirmedAt = Date.parse(application.submittedAt)`. `submittedAt` — это когда водитель
**откликнулся**, а не когда диспетчер **подтвердил**. Окно «15 минут после подтверждения» из Uber-лестницы
поэтому считается не от того события. Нужно поле `confirmedAt` (писать его в момент перехода в `CONFIRMED` —
это место уже есть: `store.ts:76-78`) и общий расчёт штрафа, используемый и шитом, и `cancelTrip`,
чтобы UI и API не разошлись.

### 3.4 Отмена не подключена к интерфейсу

`src/components/v2/CancelTripSheet.tsx` написан, но **нигде не импортируется** (`grep` по `src` даёт только
сам файл). `src/screens/v2/TripDetails.tsx` (97 строк) не содержит ни слова `cancel`; блок CTA — строки 63-66
(`Navigation` / `Documents`). Значит, отмену подтверждённого трипа пользователь сделать не может,
а после отмены нет ни состояния «Trip cancelled», ни возврата в ленту.

---

## 4. Что делать дальше (в этом порядке)

### 4.1 Сначала — тесты на уже написанное (сейчас 0 тестов на новое)

`src/lib/api.test.ts` покрывает только `submitApplication`, `cancelApplication`, `advanceStatus`.
Добавить, до всех UI-правок:

- `dismissLoad` скрывает лоад; `getLoadCardState` для него возвращает `available`; карточка не считается «отменённой водителем».
- guard: скрывать можно **только доступный** лоад (нет активной заявки) — иначе вернуть ошибку, а не молча терять данные.
- `restoreLoad` реально удаляет запись (падает на текущем коде — это ожидаемо, см. §3.2).
- `cancelTrip`: границы политики ровно на 15 мин / 24 ч (ниже — warning, выше — none), запись причины, `cancelledAfterConfirm`.
- guard `cancelTrip` на не-CONFIRMED статус.
- повторный `submitApplication` после отмены (что бы мы ни decided в §8 — тест фиксирует решение).

### 4.2 Затем — UI отмены

`TripDetails.tsx`: в блок CTA (63-66) добавить `Cancel trip` (appearance `secondary`, destructive-стиль не изобретать —
взять существующие токены) → открыть `CancelTripSheet` → `cancelTrip(loadId, reason)` → показать состояние
«Cancelled after confirm» с причиной и кнопкой возврата в ленту. Нужны: `cancelling` (loading на кнопке),
ошибка (Alert/`role="alert"`), `penalty` считается из тех же данных, что использует `cancelTrip` (§3.3).

### 4.3 Согласованность баннера/карточки/трекера после отмены

`ApplicationBanner`, `ApplicationTracker`, `LoadCta` читают верхнеуровневые `loadId`/`status`. После отмены
нужно, чтобы все три показывали одно и то же («Cancelled by you» / «Trip cancelled»), без «Cancelled» на карточке
лоада и одновременно «Booked» в баннере. Проверять вручную на `/v2` + `/application/:id` + `/trip/:id`.

### 4.4 Потом — то, что осталось от аудита

- **P2-7** вложенные интерактивные элементы (кнопка внутри кликабельной карточки) — сейчас обходится `stopPropagation`.
- **V2 spatial-state маркер** и **R5 таймер трекера** — см. `design/UI-REVIEW.md` (там же статусы волн).
- **Мульталлоад** — отдельная задача, не начинать без переписывания верхнеуровневого состояния.
- **Figma-handoff:** всё, что мы добавили (две палитры состояния, шиты, dismiss-кнопка), в Фигме отсутствует —
  по правилу 3 это надо вернуть в файл и отразить в `design/figma-map.md`.

---

## 5. Ловушки этого репозитория (проверено на себе)

1. **`store.set` — это merge, а не replace** (§3.1). Любой код, который «удаляет» или «дописывает метаданные»
   через `applications`, обязан учитывать и merge, и clobber верхнеуровневой записи.
2. **Tailwind сканирует markdown.** Строка `design/PORT-LOG.md:788` содержит литерал
   `border-l-[var(--color-status-*-text)]`, и сборка CSS выдаёт
   `Unexpected token Delim('*')`. Это не влияет на результат сборки, но засоряет вывод — правь текст в доке
   (перефразируй так, чтобы не выглядело как утилита), а не игнорируй.
3. **Порт Storybook расходится в документах.** `package.json` → `storybook dev -p 6006`;
   `AGENTS.md` и рецепт в `design/PORT-LOG.md` → `localhost:6007`. Перед замерами проверь `curl -s localhost:6007/index.json`.
4. **UI-строки — только английский** (правило 5), доки в `design/` — русский. Не смешивать.
5. **Никаких новых хардкод-значений**: цвет/радиус/кегль — только из токенов. Группа `color-load-state-*`
   удалена намеренно (была второй палитрой для тех же пяти состояний) — не возвращать.
6. **`LoadCard` всё ещё подписан на весь стор.** Комментарий в файле это честно фиксирует («open R2»).
   Не писать в доки, что R2 закрыт, и не считать, что карточка не ререндерится.
7. **`LoadTile.tsx` и `useCountdown.ts` удалены** как мёртвый код — не восстанавливать.
8. **Только `src/lib/api.ts` знает про источник данных** (правило 6). Не читать `localStorage` из экранов.
9. `forEach(onRestore)` в `SmartLoadList.tsx:214` передаёт `(value, index, array)` — сейчас безвредно,
   но сломается, если у `onRestore` появится второй параметр. Писать `(id) => onRestore(id)`.
10. При ручной проверке состояния держи свежую сессию: `localStorage['pharos-driver-prototype']` переживает
    перезагрузку, поэтому старые лишние записи (`applications`) могут имитировать «баги». Есть `store.reset()`
    (кнопка демо-режима).

---

## 6. Команды проверки (и что они выдали в этой сессии)

```bash
cd /Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype

npx tsc --noEmit -p tsconfig.json      # 0 ошибок (пустой вывод)
node tools/audit-tokens.mjs            # OK — every var() resolves to a token.
                                       #   1467 literal var() + 6 dynamic, 184 tokens
npx vitest run                         # 8 файлов / 60 тестов passed (~1.4 s)
npx vite build                         # ✓ built in 294 ms, dist/assets/index-*.js 387.20 kB (gzip 112.35 kB)
pnpm test:e2e                          # НЕ ЗАПУСКАЛОСЬ в этой сессии (6 тестов в e2e/application-flow.spec.ts,
                                       #   последний известный результат 6/6 ДО правок dismiss/cancel)
```

`pnpm check` = `audit-tokens && tsc && vite build` — все три шага проверены по отдельности выше;
целиком одной командой в этой сессии **не запускалось**.

Полезное:

- `pnpm dev` — Vite на 5173 (на нём делались замеры в `design/UI-REVIEW.md`).
- Playwright сам поднимает Vite на `127.0.0.1:4173` (`playwright.config.ts`, `reuseExistingServer: true`).
  Если оставишь свой сервер на 4173, тесты пойдут против него — проверяй, что он не устарел.
- `pnpm storybook` (см. ловушку 3 про порт), `pnpm tokens` — регенерация `src/styles/tokens.css` из `design/tokens.json`.

---

## 7. Инвентарь рабочего дерева (`git status`, HEAD `8c07b21`)

Всё **не закоммичено**. `dist/`, `storybook-static/`, `test-results/`, `playwright-report/` — в `.gitignore`.

**Изменено (M)** — 24 файла, из них к этой задаче относятся:

- `src/lib/api.ts`, `src/lib/store.ts` — новые функции и поля (§3)
- `src/components/v2/LoadCard.tsx`, `src/screens/v2/Home.tsx`, `src/components/v2/SmartLoadList.tsx` — dismiss + undo (§2.1, §2.2)
- `src/components/v2/LoadCard.test.tsx`, `LoadCta.test.tsx`, `QuickApplyModal.test.tsx`, `Sheet.tsx`, `LoadSheet.tsx` — правки прошлых волн
- `design/tokens.json`, `src/styles/tokens.css` — токены прошлых волн
- `e2e/application-flow.spec.ts` — 6 тестов
- `design/PORT-LOG.md`, `design/figma-map.md` — логи (см. ловушку 2)
- `src/components/Button.tsx`, `Icon.tsx`, `OfferCard.tsx`, `ApplicationProgress.tsx`, `DemoToggle.tsx`, `ApplicationBanner.tsx`, `src/screens/v2/ApplicationTracker.tsx` — прошлые волны

**Удалено (D):** `src/components/v2/LoadTile.tsx`, `src/components/v2/useCountdown.ts` — мёртвый код, не восстанавливать.

**Новое (??), к задаче относятся:**

- `src/components/v2/CancelTripSheet.tsx` — **не подключён** (§3.4)
- `src/components/v2/FiltersSheet.tsx`, `RouteSheet.tsx`, `Sheets.stories.tsx`, `Sheets.test.tsx`, `Sheet.test.tsx`
- `src/components/v2/LoadCardSkeleton.tsx` + `.stories.tsx` + `.test.tsx`
- `src/screens/v2/ApplicationTracker.test.tsx`
- `design/UI-REVIEW.md` — разбор интерфейса по замерам (читать до правок)
- не относятся к коду: `.agents/`, `.claude/`, `skills-lock.json`, `AGENT-HANDOFF.md` (этот файл)

---

## 8. Открытые вопросы к человеку (не решать самому)

1. **Политика отмены — прототип, не утверждённый бизнес-правилом.** Лестница «15 мин / 24 ч» взята
   из публичного описания Uber Freight, но первоисточник в сессии **не подтверждён** (веб-фетч результатов не дал).
   Нужно решение: оставляем как есть, или это placeholder?
2. **24-часовой запрет на перебронирование** после отмены подтверждённого трипа: реализуем или удаляем
   вместе с комментарием и guard'ом? Сейчас это обещание в комментарии без реализации (§3.1.2).
3. **Скрывать лоад — можно ли после отклика?** Сейчас скрытие только для `available`. Если можно после
   `SENT` — это уже отзыв заявки, а не «не интересно», и должно звучать и храниться иначе.
4. **Что показывать на месте отменённого трипа:** только в ленте, или ещё отдельный экран «отменённые»?
   В Фигме такого нет — это пойдёт в Figma-handoff.
5. **Хранить ли `tripId` после отмены** (для поддержки/истории) или трип исчезает целиком.

---

## 9. Правила репо, которые ломаются чаще всего

Полный список — `AGENTS.md`. Здесь — те четыре, о которые спотыкаются в этой задаче:

1. **Никаких хардкод-значений** — цвет/радиус/интервал только через токены (`design/tokens.json` → `pnpm tokens`).
2. **Каждый компонент начинается с контракт-заголовка** (`figma:` · `props:` · `tokens:`). У `CancelTripSheet.tsx`
   он есть; у новых компонентов ставить обязательно.
3. **Порт не считается сделанным, пока не измерен** — Playwright (`channel: 'chrome'`) против чисел Фигмы.
   Storybook ≠ доказательство. Рецепт — `design/PORT-LOG.md`.
4. **Каждый порт документируется в том же коммите:** `design/PORT-LOG.md` (node id, варианты, отклонения, замеры)
   и `design/figma-map.md` (один экран = один роут).

**Definition of done для этой задачи:** роут достижим, состояния из Фигмы воспроизведены (включая
loading/empty/error/disabled там, где они есть), стори на каждое состояние компонента, `figma-map.md` обновлён,
`pnpm dev` рендерит, `pnpm build` проходит.

---

## 10. Первые три команды для следующего агента

```bash
cd /Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype
npx vitest run                                    # подтвердить baseline 60/60
sed -n '60,110p' src/lib/store.ts                 # посмотреть set() — правится первым (§3.1)
sed -n '53,118p' src/lib/api.ts                   # dismiss/restore/cancelTrip — правятся сразу после
```

Дальше: §3.1 → §3.2 → тесты (§4.1) → UI отмены (§4.2) → согласованность состояний (§4.3).



## Продолжение 2026-10-10: отмена трипа

Подключён CancelTripSheet к `/trip/:id`: причина, подтверждение, loading/error, Keep trip.
После отмены itinerary остаётся доступным со статусом Cancelled by you; действия Navigation/Documents скрыты.
Предупреждение явно демонстрационное: политика не утверждена, реальный штраф не применяется.
Store сохраняет метаданные при set/read; restore удаляет только dismissed-запись; новая заявка очищает dismissed.
Проверено: vitest 63/63, Playwright Chrome 7/7 (включая отмену и сохранение причины/tripId), pnpm check проходит.
Геометрия относительно Figma не измерена: это prototype-led дополнение, не подтверждённый 1:1 порт.
Открыто: утверждение политики, проверка undo на карте и перезагрузки, дополнительные UI-тесты и замеры.
