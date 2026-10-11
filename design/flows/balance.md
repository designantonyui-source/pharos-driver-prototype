# flows/balance.md — Balance + methods + cash out + history

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Полная история волн: `design/PORT-LOG-archive.md` (заморожен). Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- Экраны: `/v2/account/balance` (Available/Pending card + Cash out CTA + methods + recent-3 + Documents) → `method` (IBAN + Card tabs, saved list) → `cashout` (rail picker + amount + Sheet confirm + Toast) → `history` (unified ledger + invoice links). Код: `src/screens/v2/Balance.tsx`. Тесты: `Balance.test.tsx` (7), e2e `balance.spec.ts`.
- PSP: экраны говорят только с `PayoutProvider` (`src/lib/psp.ts` + `MockPayoutProvider`, refs `mock_sepa_*`/`mock_card_*`). PAN не хранится (token + last4, localStorage-asserted). Policy: SEPA free/1–2 дня, card €1.50/30 мин, min €10 — placeholders, не бизнес-правила (§7 в `PAYMENTS-VISION.md`).
- Методы: список `id/kind/isDefault/verified`, Wave-0 IBAN мигрирует на чтении. IBAN: mod-97 + mask `DE89 .... 3000`. Карта: Luhn + brand + MM/YY + CVC → `tokeniseCard` в хендлере. Новые методы `verified:false` → `true` после mock round-trip; cash out unverified не даёт.
- Уведомления: успехи → `Toast` сверху под навбаром (см. `flows/account-ux.md`); ошибки инлайн с Retry; подтверждение в `Sheet`.
- Проверки: `pnpm test` 104/104, `pnpm check` чистый.

## История

- **2026-10-11, Toast сверху:** success-уведомления переведены с инлайн-`Alert` на `Toast` (см. `flows/account-ux.md`). Unit-ассёрты: `role=status` / store state вместо инлайн-текста.
- **2026-10-11, Wave 1** (`85162ce`): PSP-адаптер, мульти-методы, карта (Luhn/tokenise), verifying states, rail picker. Тесты 95 (было 91: +8 Balance Wave-1, +3 card/IBAN, −1 dismissed-count, +1 Earnings).
- **2026-10-11, Wave 0** (`a8e8206`): Available/Pending, SEPA IBAN mod-97, cash-out, ledger/history. Тесты 91.
- Mobbin (2026-10-11): ~30 wallet-скринов + 4 payout-флоу — скелет везде Available/Pending → Cash out → method → amount → confirm → history. Instant-card только в US; EU = SEPA 1–2 дня.
- Открытые решения (§7 `PAYMENTS-VISION.md`): real PSP, KYC/KYB, min/fee/ETA, pending-release, валюты.
