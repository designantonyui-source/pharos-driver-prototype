# Pharos Driver — кликабельный прототип

HTML + Tailwind (React + Vite) прототип приложения водителя, собранный **1:1 с дизайном в Figma**.
Цель: сначала живой прототип, потом перенос решений обратно в Figma.

## Быстрый старт

```bash
pnpm install
pnpm dev          # прототип на http://localhost:5173
pnpm storybook    # витрина компонентов на http://localhost:6006
```

## Как пройти путь водителя

1. Открой `/` — это карта экранов.
2. Happy path: `Loads → карточка груза → details v2 → Send application → Loads с баннером → Application status → Trip`.
3. Ожидания (одобрение диспетчера, подтверждение клиента) в реальном времени не случаются —
   используй **Demo-панель** в правом нижнем углу: «→ sent», «→ dispatcher approved», «→ customer confirmed», «→ reset».
4. Состояние живёт в `localStorage`: перезагрузка страницы путь не сбрасывает.

## Где что лежит

| Путь | Что это |
|---|---|
| `src/components/` | компоненты (единственный источник правды), у каждого — стори-файл |
| `src/screens/` | экраны, один файл = один экран Figma |
| `src/lib/api.ts` | мок-API: переключение на реальный бэкенд = правка только этого файла |
| `src/lib/store.ts` | состояние заявки, persist в localStorage |
| `design/tokens.json` | токены (экспорт из Figma) → `src/styles/tokens.css` через `pnpm tokens` |
| `design/figma-map.md` | таблица «node-id в Figma ↔ файл/компонент в коде» |

## Правила (важно для агентов)

Читай `AGENTS.md`. Коротко: не хардкодить значения, брать их из токенов; у компонента и экрана —
шапка-контракт с node-id из Figma; новый экран = новый роут + запись в `figma-map.md`.
