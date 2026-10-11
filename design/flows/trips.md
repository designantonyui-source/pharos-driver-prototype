# flows/trips.md — Trips hub + tracker + trip details

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- Хаб: `/v2/trips` → `src/screens/v2/Trips.tsx` (вкладка Trips в `V2Frame`; раньше заглушка `V2Soon`). Секции: Active trip hero (nav-bg card + Open trip) → In review → Past. Тесты: `Trips.test.tsx` (5), stories: Empty / Mixed / AllPast.
- Данные: `store.applications` + `V2_LOADS` через `api.getLoads`; новой модели нет. Dismissed скрыты (живут в `/v2/account/dismissed`). Cancelled-after-confirm ведёт в `/trip/:id`, остальное прошлое — в `/application/:id`.
- Чипы на палитре `color-status-*` (shared с LoadCard): booked = success, in review = warning, declined (rejected) = danger, cancelled = neutral. Контраст пар ≥ 5.2:1.
- Состояния: row-скелетоны (StatusBlock, shared shape) / inline Alert + Retry / empty icon+headline+explainer + Find loads CTA.
- Трекер (`/application/:id`) и детали (`/trip/:id`): отмена заявки — `CancelApplicationSheet` (Withdraw/Keep), отмена трипа — `CancelTripSheet`; демо-заглушки (Dispute/Chat/Navigation/Documents) — info-`Toast` сверху, нативных `alert/confirm` не осталось.
- Проверки: `pnpm test` 127/127, `pnpm check` чистый, `build-storybook` ок.

## История

- **2026-10-11, Feed polish:** тени `shadow-[var(--shadow-card)]` не резолвились в Tailwind v4 (замер: `box-shadow: none`) — весь фид переведён на утилиту `shadow-card`, замер Chrome: `rgba(23,42,53,.055) 0px 6px 20px`. Чипы RouteSheet стали тогглами: лейбл зеркалит фокус (`From/To`), выбранный город `aria-pressed` + залитая пилюля как в FiltersSheet. Строка техники — значение фида дословно (старый `km × 0.06` врал на 3 из 6 лоадов). Хедер считает loads, не trips (plural-aware). Empty-state: `No loads match — try widening the search.` + `Clear filters` и `Change direction` (`onOpenRoute`). Пины карты для трёх новых лоадов Paris/Amsterdam. Тесты 127 (было 126: +1 label-follows-focus, расширены chips + empty).

- **2026-10-11, Card pro:** крест убран (читался как «закрыть окно» + 44px пустоты) — скрытие свайпом влево (iOS mail, 88px Hide) + текст `Hide this load` для AT; правый угол отдан живому таймеру (`Decide in X` из decideMin/S8 до заявки, `Pickup in X` после confirm); trust-строка `Company semibold · ★ rating Verified · Paid · cross-border` вместо винегрета; пилюля FR→BE ушла в тихий суффикс. Тесты 125 (было 122: +2 swipe, +1 trust/cross-border).
- **2026-10-11, EU route + decision facts:** коды стран у городов (`Lille FR → Brussels BE`, freight-стиль вместо эмодзи-флагов по Mobbin: inDrive/Qantas/Lugg — флаги только где граница это решение); пилюля `FR → BE` только для трансграничных (nordcargo), внутри BE/FR её нет. Факты decision-first: строка 1 `body-14 primary` (день+окно+дедхед, ≥40 км — semibold warning), строка 2 `caption-12 quiet` (км+компания+рейтинг+оплата). Aria: «Lille, France to Brussels, Belgium». Тесты 122 (было 120: +2 country/cross-border/far-pickup).
- **2026-10-11, LoadCard route anchor:** маршрут поднят с `heading-14` до `heading-20` (второй якорь после ставки €28, стрелка sm→md); факты ужаты из трёх строк `body-14` в две строки `caption-12` (окно+подача+км в одну, компания+рейтинг+оплата в одну, пин убран как шум). Замер Chrome: маршрут 20px/600. Тесты 120 (было 119: +1 hierarchy).
- **2026-10-11, LoadCard header:** бейдж уезжал вправо к кресту (`justify-end`, слипались по центру) — ряд стал `justify-between`: бейдж влево, крест вправо (`min-h-44`, один ряд); пустой ряд скрыт, когда нет ни бейджа, ни креста. Замер Chrome: badge x29 / dismiss x329–373 в карточке x16–386. Тесты 119 (было 117: +2 header).
- **2026-10-11, Sheet width fix:** `QuickApplyModal` через `LoadCta` порталился в `document.body` и на десктопе растягивался во всю ширину вместо рамки 402px — портал переведён внутрь `[data-load-overlay-root]` (V2Frame), замер Chrome: dialog 402×404 внутри frame 402×874. Регресс-тест: диалог внутри overlay-root. Тесты 117 (было 116).
- **2026-10-11, Trips polish:** отмена заявки переведена с `window.confirm` на `CancelApplicationSheet` (Withdraw/Keep, stories Default/Loading); демо-заглушки трекера и деталей (Dispute/Chat/Navigation/Documents) — с `window.alert` на info-`Toast` сверху. E2E переведены на Sheet/Toast. Тесты 116 (было 113: +3 Sheet/keep/toast, +2 toast stubs, −2 confirm).
- **2026-10-11, Trips hub:** новый экран вместо `V2Soon`; группировка active/review/past; declined отделён от cancelled тоном danger vs neutral. Тесты 111 (было 106: +5 Trips).
