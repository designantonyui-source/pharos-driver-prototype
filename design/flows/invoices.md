# flows/invoices.md — Invoices (list → details → PDF)

> Рабочий файл потока. Правило: сверху 10 строк правды, снизу append-only история.
> Полная история волн: `design/PORT-LOG-archive.md` (заморожен). Маппинг: `design/figma-map.md`.

## Текущее состояние (2026-10-11)

- Экраны: `/v2/account/balance/invoices` (awaiting-hero + rows + CSV) → `:id` (parties + lines + VAT + PDF + Open trip). Код: `src/screens/v2/Invoices.tsx`, типы `src/lib/invoices.ts`, PDF `src/lib/invoicePdf.ts`.
- Данные: сид = 1 инвойс на mock-трип (INV-2026-0042 pending €360, −0038 paid €210, −0031 paid €290). `getInvoices/getInvoice/getInvoiceForLoad`, `invoicesToCsv`.
- PDF без зависимостей: self-contained A4 print window (своя ink-on-paper таблица, не app-токены), Save-as-PDF через драйвер; VAT-математика точная, текст selectable, без jsPDF.
- VAT: intra-EU B2B 0% reverse charge (Art. 196) — прототипный дефолт, НЕ утверждённая схема (§7 в `PAYMENTS-VISION.md`).
- Связки: Documents → invoices; History trip rows → свой инвойс (chevron + note); invoice → trip (Open trip).
- Проверки: `pnpm test` 104/104 (+4 Invoices в Wave 2), `pnpm check` чистый; e2e list → details → PDF popup → history link (Chrome).

## История

- **2026-10-11, Wave 2** (`154a09a`): инвойсы целиком (ledger, PDF, CSV, двухсторонние ссылки). Тесты 99 (было 95).
- Mobbin (2026-10-11): Jobber, Fresha, PayPal, Faire, Starlink, Deel contractor invoice — скелет list (number/date/amount/status) → details → Download. Ближайшая модель: Deel/Remote генерирует инвойс на выплату.
- Открытые решения (§7): VAT-схема, tax export.
