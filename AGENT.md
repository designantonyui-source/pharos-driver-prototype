# AGENT.md — Pharos Driver Prototype

> Входной файл для агента. Правила `AGENTS.md` главнее этого файла.

## 1. Проект
- Что: кликабельный HTML/Tailwind прототип приложения водителя Pharos, 1:1 к Figma.
- Figma: файл `sve9YrMmfz91XQX5IpZjGO`, страница `30 — iOS App / Driver`, секция `01 · Driver journey` = `2022:2949`.
- Стек: React 19.3 + Vite + Tailwind, React Router 7, Vitest, Playwright, Storybook.
- Язык UI: только английский.
- Бэкенда нет: мок-API + `localStorage`.

## 2. Где лежит
- Worktree: `/Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype`
- Ветка: `cline/27a46`
- Этот файл: `/Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype/AGENT.md`
- Правила: `AGENTS.md`
- Хендофф прошлых работ: `AGENT-HANDOFF.md`
- README: `README.md`
- Карта Figma ↔ код: `design/figma-map.md`
- Рабочие файлы потоков (`design/flows/*.md` — читать 1 за раз, не все):
  - `balance.md` — Balance + методы + cash out + history
  - `invoices.md` — инвойсы (list → details → PDF)
  - `schedules.md` — auto-withdraw + adjustments + statement
  - `trips.md` — trips hub + tracker + trip
  - `account-ux.md` — Toast + verification + back nav
- Архив журнала переноса (заморожен, только история): `design/PORT-LOG-archive.md`
- UI-разбор: `design/UI-REVIEW.md`
- Токены: `design/tokens.json` → `src/styles/tokens.css`

## 3. Ключевые пути
- Роуты: `src/App.tsx`, `src/main.tsx`
- Баланс: `src/screens/v2/Balance.tsx` (Balance, PayoutMethodScreen, CashOut, BalanceHistory, InvoiceList, InvoiceDetails, Schedules), `src/screens/v2/Balance.test.tsx`, `e2e/balance.spec.ts (incl. schedules + invoices)`
- Экраны v2: `src/screens/v2/Home.tsx`, `ApplicationTracker.tsx`, `TripDetails.tsx`, `Account.tsx`, `DismissedLoads.tsx`, `Soon.tsx`
- Компоненты v2: `src/components/v2/`
- Общие компоненты: `src/components/Button.tsx`, `Input.tsx`, `Icon.tsx`, `DriverProfile.tsx`
- Данные: `src/lib/api.ts` (incl. getBalance/getLedger/getPayoutMethod/updatePayoutMethod/requestWithdrawal + PAYOUT_POLICY), `src/lib/store.ts` (ledger + payoutMethod), `src/lib/profile.ts` (IBAN validate/format/mask), `src/lib/v2/loads.ts`
- Тесты: `*.test.tsx`, `src/lib/*.test.ts`
- E2E: `e2e/application-flow.spec.ts`, `e2e/account.spec.ts`, `e2e/balance.spec.ts (incl. schedules + invoices)`
- Storybook: `*.stories.tsx`

## 4. Маршруты
- `/` — индекс экранов
- `/v2` — Loads, список/карта
- `/application/:id` — статус заявки
- `/trip/:id` — подтверждённый трип
- `/v2/account` — Account
- `/v2/account/profile` — Profile
- `/v2/account/profile/edit` — Edit contact
- `/v2/account/dismissed` — Dismissed loads
- `/v2/account/balance` — Balance (Available/Pending, Cash out CTA, method, recent)
- `/v2/account/balance/method` — Bank account (SEPA IBAN)
- `/v2/account/balance/cashout` — Cash out (amount + confirm Sheet)
- `/v2/account/balance/history` — Activity (ledger)
- `/v2/account/balance/invoices` — Invoices (Awaiting hero, rows, CSV)
- `/v2/account/balance/invoices/:id` — Invoice details (parties, VAT, PDF, Open trip)
- `/v2/account/balance/schedules` — Auto-withdraw (rule, destination, runs, statement)
- `/v2/trips` — Trips hub (active + in review + past)
- `/search`, `/bl/*` — старый/BL контур

## 5. Состояние и API
- Единственный доступ к данным: `src/lib/api.ts`.
- Экраны напрямую не читают `localStorage` / `fetch`.
- Основное состояние: `src/lib/store.ts`, ключ `pharos-driver-prototype`.
- Профиль контактов: `src/lib/profile.ts`, только `phone` + `email`, без auth/OTP.
- Identity водителя read-only: `Alexey K. / Northway Freight · driver`.
- Dismiss ≠ отмена заявки ≠ отмена трипа.
- Политика отмены «15 мин / 24 ч» не утверждена, штрафы не применять как реальные.
- Политика выплат (SEPA 1–2 дня, мин €10, без комиссии) — прототип, не утверждённые бизнес-правила, реальных денег нет.

## 6. Правила
1. Значения дизайна только из токенов `src/styles/tokens.css`.
2. Нужен новый токен: сначала `design/tokens.json`, затем `pnpm tokens`.
3. Каждый компонент/экран начинается с contract header `figma / props / tokens`.
4. Один экран Figma = один роут + запись в `design/figma-map.md`.
5. Компоненты переиспользовать, не копипастить.
6. Метрики оболочки фиксированы 402×874, использовать `layout/*` и `V2Frame`.
7. Порт считается готовым только после замеров Playwright `channel: 'chrome'`.
8. Каждый порт документируется в своём `design/flows/*.md` (шапка «Текущее состояние» + append в «Историю») в том же коммите.
9. Новые Account layouts сейчас — это новые предложения, а не измеренные Figma-порты.

## 7. Команды
```bash
cd /Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm check
pnpm storybook
pnpm build-storybook
pnpm tokens
```

- `pnpm check` = аудит токенов + `tsc --noEmit` + `vite build`.
- E2E требует Chrome через `channel: 'chrome'`, viewport `402×874`.
- Известное неблокирующее предупреждение CSS про `border-l-[var(--color-status-*-text)]` может оставаться.

## 8. Текущее состояние
- Account/Profile/Edit contact/Dismissed loads реализованы первым срезом.
- Контакты сохраняются локально и переживают reload.
- Есть защита несохранённых изменений.
- Restore/Undo скрытых грузов работает с защитой активных заявок.
- Unit: 82 passed.
- E2E Chrome: 8 passed, включая Account и application-flow.
- `pnpm check` проходит.
- Документы, транспорт, Help, кошелёк, нотификации, логаут и удаление аккаунта не делать без ТЗ.
- Мультилоад не начинать без переработки верхнеуровневого `loadId/status`.
- Изменения сейчас незакоммичены.

## 9. Первые проверки агента
```bash
cd /Users/antonybozhatarnyk/.cline/worktrees/27a46/pharos-driver-prototype
git status --short --branch
pnpm test
pnpm check
sed -n '1,120p' AGENT-HANDOFF.md
sed -n '1,30p' design/flows/balance.md
```
