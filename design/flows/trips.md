# flows/trips.md — Trips hub + tracker + trip details

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- Хаб: `/v2/trips` → `src/screens/v2/Trips.tsx` (вкладка Trips в `V2Frame`; раньше заглушка `V2Soon`). Секции: Active trip hero (nav-bg card + Open trip) → In review → Past. Тесты: `Trips.test.tsx` (5), stories: Empty / Mixed / AllPast.
- Данные: `store.applications` + `V2_LOADS` через `api.getLoads`; новой модели нет. Dismissed скрыты (живут в `/v2/account/dismissed`). Cancelled-after-confirm ведёт в `/trip/:id`, остальное прошлое — в `/application/:id`.
- Чипы на палитре `color-status-*` (shared с LoadCard): booked = success, in review = warning, declined (rejected) = danger, cancelled = neutral. Контраст пар ≥ 5.2:1.
- Состояния: row-скелетоны (StatusBlock, shared shape) / inline Alert + Retry / empty icon+headline+explainer + Find loads CTA.
- Трекер (`/application/:id`) и детали (`/trip/:id`): отмена заявки — `CancelApplicationSheet` (Withdraw/Keep), отмена трипа — `CancelTripSheet`; демо-заглушки (Dispute/Chat/Navigation/Documents) — info-`Toast` сверху, нативных `alert/confirm` не осталось.
- Проверки: `pnpm test` 117/117, `pnpm check` чистый, `build-storybook` ок.

## История

- **2026-10-11, Sheet width fix:** `QuickApplyModal` через `LoadCta` порталился в `document.body` и на десктопе растягивался во всю ширину вместо рамки 402px — портал переведён внутрь `[data-load-overlay-root]` (V2Frame), замер Chrome: dialog 402×404 внутри frame 402×874. Регресс-тест: диалог внутри overlay-root. Тесты 117 (было 116).
- **2026-10-11, Trips polish:** отмена заявки переведена с `window.confirm` на `CancelApplicationSheet` (Withdraw/Keep, stories Default/Loading); демо-заглушки трекера и деталей (Dispute/Chat/Navigation/Documents) — с `window.alert` на info-`Toast` сверху. E2E переведены на Sheet/Toast. Тесты 116 (было 113: +3 Sheet/keep/toast, +2 toast stubs, −2 confirm).
- **2026-10-11, Trips hub:** новый экран вместо `V2Soon`; группировка active/review/past; declined отделён от cancelled тоном danger vs neutral. Тесты 111 (было 106: +5 Trips).
