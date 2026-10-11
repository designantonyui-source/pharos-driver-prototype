# flows/schedules.md — Auto-withdraw + adjustments + statement

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Полная история волн: `design/PORT-LOG-archive.md` (заморожен). Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- Экран: `/v2/account/balance/schedules` (rule + destination + runs + statement CSV). Код: `src/screens/v2/Schedules.tsx`, правило `payoutSchedule` в store. Тесты: `Schedules.test.tsx` (5), e2e rule save + runs list (Chrome).
- Правило: off / threshold (дефолт €500, editable, min €10) / weekly Friday; destination picker по saved methods. Форма правила production-identical, отличается только раннер.
- Раннер: `evaluateSchedule` — threshold ≥ метки, weekly раз в пятницу; скипает unverified и below-min. Каждый run = `ScheduledRun` + обычная `processing`-строка (provider ref). Прототип: тик на открытии Balance; прод: server cron/webhook.
- Adjustments: отдельный kind (dispute/damage/bonus/correction) + обязательная note + опц. trip link; ± суммы через `getBalance`. Никогда silent edit. В History: reason + note + date + Applied.
- Экспорт: `ledgerToCsv` (трипы + выводы с rail/fee + adjustments с reason) + invoice CSV из Wave 2. Кнопка рядом с правилом. Вход: Documents → `Auto-withdraw`.
- Уведомления: `Rule saved` → `Toast` сверху (см. `flows/account-ux.md`); скриншот-урок: тост снизу перекрывал кнопку экспорта — больше не внизу.
- Состояния: row-скелетоны (shared shape), empty runs «No auto runs yet — turn on a rule above».
- Проверки: `pnpm test` 106/106, `pnpm check` чистый.

## История

- **2026-10-11, A. Дисциплина состояний:** см. `flows/balance.md` (скелетоны + empty runs).

- **2026-10-11, Wave 3** (`7b45c42`): schedules + adjustments + statement export. Тесты 104 (было 99).
- Открытые решения (§7): pending-release, валюты, tax export.
