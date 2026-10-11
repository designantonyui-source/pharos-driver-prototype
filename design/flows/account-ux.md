# flows/account-ux.md — Account shell: Toast + verification + back nav

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Полная история: `design/PORT-LOG-archive.md` (заморожен). Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- **Toast** (`src/components/v2/Toast.tsx` + `useToast`, stories Success + Interactive): success/info → топ-тост **под навбаром** (`top: calc(var(--nav-bar-h)+8px)`, z-50, iOS-style), auto-dismiss 4с, крестик, `role=status`, slide-in 180мс (off при `prefers-reduced-motion`). Конвенция в contract header. Ошибки остаются инлайн (Retry/actions), подтверждения — в `Sheet`. Подключён: Edit contact, Methods (IBAN+card), Cash out, Balance (auto-run), Schedules.
- **Verification** (`DriverProfile verifiedStyle`): Account использует `inline` — shield-check 14px (из Icon-реестра, `#216547`) + `Verified` бейджем на строке имени рядом с `Alexey K.`; подпись чистая серая; карточка 82 tall. `row` хранит состояние сета (`Show verification#769:5`, 100 tall) для `SetVariant`; сторис `VerifiedInline` для сравнения. Отклонено: `· ● Verified` в подписи (микс серого с зелёным = шум), отдельный зелёный баннер под карточкой (чужеродный).
- **Back nav**: `V2BackBar` + `useV2Back` (history-first + fallback) на всех v2-экранах; `V2Frame` контент ниже 62px статус-бара. Замеренный `NavigationBar Type=Back` 44×44.
- Проверки: `pnpm test` 104/104, `pnpm check` чистый. Unit-ассёрты тостов: `role=status` / store state (тост auto-dismisses).

- a11y-аудит: Toast подтверждает действие юзера (role=status без кражи фокуса — правильный паттерн); декоративная иконка скрыта от AT, крестик labelled; motion off под reduced-motion. Бейдж Verified: убран лишний aria-hidden (Icon сам скрывает unlabeled-иконки) — скринридер читает «Verified driver» один раз с бейджа. Контраст #216547 на белом — 7.1:1.

## История

- **2026-10-11, A. Дисциплина состояний:** Toast a11y contract header; Verified badge aria-hidden fix.

- **2026-10-11** (`13720cc`): бейдж верификации со строки подписи → на строку имени (shield-check + Verified у имени).
- **2026-10-11** (`d1fcb93`): тост снизу (перекрывал primary action — скрин `Rule saved` поверх CSV-кнопки) → наверх под навбар + slide-in; `verifiedStyle="inline"` первой версии (в подписи).
- **2026-10-11** (`4ce09c9`): зелёный баннер удалён → `DriverProfile verified`; инлайн-`Alert` успехов → единый `Toast` (тогда ещё снизу).
- **Ранее** (`8f7a485`, `42810ca`, `874cfb7`): unified back nav; Balance-home back fix; `V2Frame` status-bar overlap + content offsets.
