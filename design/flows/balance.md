# flows/balance.md — Balance + methods + cash out + history

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Полная история волн: `design/PORT-LOG-archive.md` (заморожен). Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-16, payments)

- Экраны: `/v2/account/balance` (Available/Pending card + Cash out CTA + methods + recent-3 + Documents) → `method` (IBAN + Card tabs, saved list) → `cashout` (rail picker + amount + confirm Sheet с breakdown + постоянный экран операции `Request accepted`, маршрут `/withdrawals/:id`) → `history` (unified ledger + invoice links). Код: `src/screens/v2/Balance.tsx`. Тесты: `Balance.test.tsx`, e2e `balance.spec.ts` (6).
- Ledger — единый источник правды (`src/lib/api.ts`): seed = settled history ONLY (BelRoute €210 + Calais €290 = €500 available); демо-трип денег не сидит — они появляются только через доставку (pending). Все писатели (`advanceTripStage`, `addAdjustment`, `requestWithdrawal`) строят ledger поверх `ensureLedger()` — иначе доставка на свежем сторе теряла сид-историю (поймано скриншот-спеком 2026-10-16).
- Cash out: `maxWithdrawalFor` (fee-aware, min-вывод — прототипный placeholder), INSUFFICIENT = amount+fee, confirm Sheet (получатель / сумма / fee / total debit / остаток / ETA), постоянный экран операции с outcome-блоками. `getBalance`: failed/returned — amount назад, fee остаётся минус (feeRefunded — исключение).
- PSP: экраны говорят только с `PayoutProvider` (`src/lib/psp.ts` + `MockPayoutProvider`, refs `mock_sepa_*`/`mock_card_*`). PAN не хранится (token + last4). Policy: SEPA free/1–2 дня, card €1.50/30 мин, min €10 — placeholders (§7 в `PAYMENTS-VISION.md`).
- Методы: список `id/kind/isDefault/verified`, Wave-0 IBAN мигрирует на чтении. IBAN: mod-97 + mask `DE89 .... 3000`. Карта: Luhn + brand + MM/YY + CVC → `tokeniseCard`. Новые методы `verified:false` → `true` после mock round-trip; cash out unverified не даёт.
- Скриншоты кейса (402px): `test-results/payments-{1-book,2-earnings,3-confirm,4-operation}.png`.
- Проверки: 14/14 e2e, `pnpm check` чистый (см. ниже).

## История

- **2026-10-16, payments-1–6** (ветка `codex/pharos-portfolio-payments`): демо-кейс поиска → бронь → доставка → POD → earnings → cash out → исход операции. `DEMO_LOAD_ID=nordcargo`, `OWNER_DRIVER_ASSUMPTION`; инвойсы только истории (`INV-2026-0038/0031` paid, `INV-2026-0042` пересоздаётся при доставке); `PayoutRow` без моков; `Earnings`-блок на TripDetails; POD-конвейер (submitted → approved/rejected → customer paid → available); `WithdrawalDetails` + `/withdrawals/:id`; Demo-панель (4 сценария + внешние события). E2E `balance.spec.ts` (6) + `application-flow` happy path. Unit 151+.
- **2026-10-16, ledger-seed fix:** доставка на свежем сторе дропала сид-историю €500 (писатели шли мимо `ensureLedger`). Все писатели теперь строят ledger поверх `ensureLedger()`. Поймано временным скриншот-спеком (4 PNG кейса), спек удалён после съёмки.

- **2026-10-11, A. Дисциплина состояний:** унифицированные row-скелетоны в Balance/Schedules/Invoices; empty methods + recent на главной + runs в Schedules; контракт состояний в шапке Balance. Тесты 106 (было 104).

- **2026-10-11, Toast сверху:** success-уведомления переведены с инлайн-`Alert` на `Toast` (см. `flows/account-ux.md`). Unit-ассёрты: `role=status` / store state вместо инлайн-текста.
- **2026-10-11, Wave 1** (`85162ce`): PSP-адаптер, мульти-методы, карта (Luhn/tokenise), verifying states, rail picker. Тесты 95 (было 91: +8 Balance Wave-1, +3 card/IBAN, −1 dismissed-count, +1 Earnings).
- **2026-10-11, Wave 0** (`a8e8206`): Available/Pending, SEPA IBAN mod-97, cash-out, ledger/history. Тесты 91.
- Mobbin (2026-10-11): ~30 wallet-скринов + 4 payout-флоу — скелет везде Available/Pending → Cash out → method → amount → confirm → history. Instant-card только в US; EU = SEPA 1–2 дня.
- Открытые решения (§7 `PAYMENTS-VISION.md`): real PSP, KYC/KYB, min/fee/ETA, pending-release, валюты.
