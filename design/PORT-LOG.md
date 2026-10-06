# PORT-LOG — перенос Figma → код

Рабочий журнал переноса дизайн-системы Pharos в этот репозиторий. Ведётся по ходу работ:
каждый компонент получает запись с node-id, найденными расхождениями, правками и **замерами**,
которыми проверено совпадение с Figma.

- Файл Figma: `sve9YrMmfz91XQX5IpZjGO`
- Страницы приложения водителя: `21 — Driver / Search and request` (`21:3`), `30 — iOS App / Driver` (`586:9`)
- Карта «node-id ↔ файл»: [figma-map.md](figma-map.md)

Статусы: `done` — сверен и проверен замерами · `review` — в работе · `exists` — есть в коде, но с Figma не сверялся · `todo` — не начат · `n/a` — не компонент Pharos.

---

## 1. Метод сверки (повторяемый)

Сверка делается **по числам**, а не на глаз. Порядок для каждого компонента:

1. **Спека из Figma.** `use_figma` (read-only) отдаёт список вариантов, а затем дерево с геометрией,
   заливками, обводками, радиусами, паддингами и типографикой.
   Обязательно: сначала прочитать скилл `skill://figma/figma-use/SKILL.md`.
2. **Скриншот Figma** (`get_screenshot`) — визуальный эталон, читается глазами.
3. **Правка кода** по спеке, значения — только из токенов.
4. **Стори** на каждый вариант Figma.
5. **Замер в живом Storybook** через Playwright и **скриншот** своей стори.
6. **Запись в этот журнал** и в `figma-map.md`.

Storybook для проверки уже запущен на `http://localhost:6007`; второй поднимать не нужно.

```js
// Замер: Playwright управляет установленным Google Chrome.
// Встроенный Chromium Playwright не скачан — всегда channel: 'chrome'.
const { chromium } = require('playwright');           // запускать node из корня репозитория
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 500, height: 500 } });
await p.goto('http://localhost:6007/iframe.html?id=<story-id>&viewMode=story', { waitUntil: 'networkidle' });
// дальше p.evaluate(...) с getComputedStyle/getBoundingClientRect и сравнение с числами Figma
// если скрипт лежит в /tmp: NODE_PATH="$(pwd)/node_modules" node /tmp/script.cjs
```

Список id сторей: `curl -s http://localhost:6007/index.json`.

**Аудит токенов — часть `pnpm check`.** `tools/audit-tokens.mjs` (он же `pnpm lint:tokens`) сверяет
каждый `var(--x)` в `src/` с определениями в `tokens.css`/`globals.css` и падает с ошибкой, если
переменной нет. Динамические имена вида `var(--color-status-${tone}-bg)` он разворачивает и требует,
чтобы под шаблон подходил хотя бы один токен. Это защита от ловушки 4: без неё сломанный компонент
выглядит не сломанным, а «пустым».

---

## 2. Ловушки этого Figma-файла

Собраны по фактическим ошибкам, каждая стоила отдельной отладки.

1. **Имена слоёв врут.** Название инстанса не равно содержимому. Примеры: у таб-бара слой
   «Icon / doc.text» рисует кубик (`Lucide/Package`), «Icon / truck.box» — календарь; у Alert
   Neutral слой «Icon / Info», а главный компонент `Lucide/Icon/Circle Check`.
   **Правило: резолвить `getMainComponentAsync().name`, а не `node.name`.**
2. **`node.x/y` внутри auto-layout дают мусор** (отрицательные координаты за пределами фрейма).
   **Правило: считать смещения через `absoluteBoundingBox`.**
3. **`figma-map.md` врал по node-id.** `12:104` числился как `Pharos/Input`, а это вложенный
   текстовый слой `Label`. Реальный сет — `12:166`.
4. **Несуществующие CSS-переменные молчат.** `var(--color-input-*)` не была определена нигде;
   невалидный `var()` внутри шортката **отбрасывает объявление целиком** — контрол рендерился
   без рамки и фона и выглядел «пустым», а не сломанным. Аудит переменных — обязательный шаг.
5. **Tailwind не видит интерполяцию в классах.** `border-[${cond ? 'a' : 'b'}]` не сканируется,
   класс не генерируется, `border-color` падает в `currentColor`. **Правило: только литеральные классы.**
6. **Абсолютный элемент позиционируется от padding box, а не от border box.** Из-за focus-рамки
   2px кольцо садилось на 4px меньше; смещение пришлось считать как 4px + ширина рамки.
7. **Loading ≠ Disabled.** В Figma Loading сохраняет активные цвета и добавляет спиннер.
8. **Состояния могут быть в токенах, но не в коде.** `color-action-*-hover/-pressed` лежали
   в `tokens.json` и не использовались ни одним компонентом.
9. **Focus ring — отдельный слой.** Не тень: 2px на 4px наружу, радиус 12 (у Input и Button совпадает).
10. **`figma.get_metadata` без nodeId показывает не все страницы** — в файле их 17, а инструмент
    вернул одну. Список страниц надёжнее получать через `figma.root.children`.
11. **Шрифты не были подключены вообще.** В `tokens.json` названы DM Sans и Manrope, но ни
    `@font-face`, ни ссылки на Google Fonts не было — ни в `index.html`, ни в Storybook.
    `document.fonts.check('500 12px "DM Sans"')` возвращал `true` **только потому, что DM Sans
    установлен в macOS**; на другой машине всё молча уезжало в `system-ui`. Проверять надо не
    `check()`, а список `[...document.fonts]`.
12. **Tailwind v4 игнорирует `--text-<name>--font-family`.** В пространстве `--text-*` переносятся
    размер, line-height, letter-spacing и вес, а семейство — нет. Поэтому **все заголовки
    рендерились в DM Sans вместо Manrope**, и Manrope не загружался ни разу. Лечится мостом
    в генераторе токенов (см. 4.3).
13. **Голый текстовый узел не измерить и структура расходится с Figma.** Если лейбл отрендерен
    как `{label}` без обёртки, в DOM нет узла, соответствующего слою `Label`, и замер шрифта
    приходится делать по родителю. Обёртка `<span>` дешевле, чем потеря проверяемости.
14. **Ширина текста — не показатель совпадения.** Пилюля Status до подключения шрифтов давала
    51.27px при Figma 51, после — 50.28. Прежнее «совпадение» было случайным: мерился фолбэк.
15. **Шрифт текстового узла может не резолвиться.** У времени в статус-баре (`Type=IOS`)
    `fontName` возвращает `mixed`, а `getRangeFontName(i, i+1)` — `undefined` для всех символов:
    текстовый слой набран шрифтом, которого в файле нет (`listAvailableFontsAsync` не содержит
    ни SF Pro, ни другого подходящего). Значит и в самой Figma он рендерится фолбэком, и
    «сверить шрифт» тут не с чем — это надо фиксировать как неизвестность, а не подгонять.
16. **Компонент и его инстансы на экранах расходятся.** В component set `Pharos/App/Status bar`
    у варианта `Type=IOS` есть видимый **Dynamic Island** (`2305:25320`), а в инстансах на всех
    экранах его нет: у инстанса `2772:12932` в поддереве только `Time` и `Levels`. То есть
    деталь добавили в компонент после того, как экраны были собраны, и расхождение застыло.
    **Правило: то, что рисует экран, важнее того, что лежит в component set.** Такие случаи
    закрываются пропом (здесь `island`), а не выбором одной из сторон.
17. **Инстанс может отменять то, что есть в варианте.** В сетке `Pharos/Input` слой `Hint`
    виден во всех шести вариантах, а на экранах инстансы идут высотой 76 — то есть без подсказки
    (76 = 20 + 8 + 48). Поэтому у Input появился `hint={null}`, который строку убирает.
18. **У иконки имя компонента тоже врёт, но вложенный глиф не врёт.** Четыре иконки названы не по
    тому, что рисуют, зато внутри у них лежит фрейм с настоящим именем lucide-глифа:
    `Lucide/Icon/Orders` → `Lucide/Package`, `Overview` → `Lucide/LayoutDashboard`,
    `Reports` → `Lucide/ChartNoAxesColumn`, `Users` → `Lucide/Users`. Проверять так же, как
    в ловушке 1, — по вложенному узлу.
19. **Часть иконок на странице «03 — Icons» рисуется пустой.** `Bookmark`, `Overview`, `Users`,
    `Reports`, `Help` в доке не видны, хотя у компонентов есть видимые векторы с обводкой
    `#172a35` — то есть скриншот страницы как источник истины для иконок не годится, нужен
    разбор содержимого компонента.
20. **1px INSIDE stroke в Figma ≠ CSS `border-box`.** Если обводка фрейма нарисована внутрь, то в
    CSS комбинация `padding` + `border` сдвигает содержимое на 1px и увеличивает коробку на 2px по
    обеим осям: `RouteSummary` сначала отрендерился 372×94 вместо 370×92. Лечится `box-border` и
    уменьшением паддинга на толщину рамки, а не подгонкой чисел.
21. **API и рендер могут расходиться.** У ссылки `Navigate` в Route card Figma **рисует**
    подчёркивание, а `textDecoration` читается как `NONE`. Проверка трёх узлов по отдельности
    показала, что подчёркивание настоящее, а у `View application` в Offer его нет.
    **Правило: при конфликте верить рендеру и документировать расхождение.**
22. **Счётчик инстансов из грубого обхода врёт.** Первый обход страниц дал у `Arrow right` 1
    инстанс, адресный подсчёт — 120. Для решений «какой из двух одноимённых сетов используется»
    нужен адресный подсчёт с резолвом main component: на грубом счёте агент B заключил, что
    `26:27` не используется, и ошибся (поправка в 4.7).
23. **Высоты вариантов в Figma могут быть растянуты, а не выведены из содержимого.** У 8 вариантов
    `Pharos/Bottom sheet` стоит `primaryAxisSizingMode = FIXED`, и рамка растянута под самую
    высокую карточку в ряду: у `2197:8081` дети дают 406, а рамка 454. Экспорт PNG у таких узлов
    тоже обрезан, поэтому пиксельная сверка по ним невозможна — сверять надо численно по детям.

---

## 3. Инвентарь области работ

Скоуп определён точно: **компоненты, которые реально инстансируются на двух страницах водителя** —
58 штук (всего в файле 43 component set). Из них 6 — иконки Lucide и мок iOS-статус-бара, они не переносятся.

| Компонент | Figma | Инстансов | Файл | Статус |
|---|---|---|---|---|
| Pharos/Button | `12:38` | 250 | `src/components/Button.tsx` | done |
| Pharos/App/Status bar | `2353:26430` | 139 | `src/components/layout/StatusBar.tsx` | done |
| Pharos/App/Navigation bar | `586:33` | 139 | `src/components/layout/NavigationBar.tsx` | done |
| Pharos/Information section | `2576:2265` | 116 | `src/components/InformationSection.tsx` | done |
| Pharos/Status | `11:148` | 109 | `src/components/StatusPill.tsx` | done |
| Pharos/App/Home indicator | `586:70` | 97 | `src/components/layout/HomeIndicator.tsx` | done |
| Pharos/Input | `12:166` | 76 | `src/components/Input.tsx` | done |
| Pharos/App/Tab bar | `586:67` | 61 | `src/components/layout/TabBar.tsx` | done |
| Pharos/Alert | `575:9632` | 54 | `src/components/Alert.tsx` | done |
| Pharos/App/Offer | `2594:22063` | 46 | `src/components/OfferCard.tsx` | done |
| Pharos/App/View switch | `2041:411` | 42 | — | todo |
| Pharos/Offer preview | `26:73` | 32 | `src/components/OfferPreview.tsx` | done |
| Pharos/Sidebar | `82:150` | 30 | — | todo |
| Pharos/Page header | `167:65` | 30 | — | todo |
| Pharos/Message bubble | `384:355` | 25 | — | todo |
| Pharos/Filters button | `2646:1314` | 21 | — | todo |
| Pharos/Button link | `168:118` | 20 | `src/components/Button.tsx` (`ButtonLink`) | done |
| Pharos/Route search + filters | `340:404` | 18 | — | todo |
| Pharos/Avatar | `74:64` | 15 | `src/components/Avatar.tsx` | done |
| Pharos/App/Approach map | `719:355` | 15 | — | todo |
| Pharos/App/Route card | `2715:1535` | 15 | `src/components/RouteCard.tsx` | done |
| Pharos/Mobile header | `26:24` | 14 | — | todo |
| Pharos/App/Onboarding progress | `2062:410` | 13 | — | todo |
| Pharos/Filter chip v2 | `2621:1288` | 11 | — | todo |
| Pharos/App/Driver profile | `769:10428` | 9 | — | todo |
| Pharos/Load card | `14:146` | 8 | `src/components/LoadCard.tsx` | done |
| Pharos/Rate offer card | `384:368` | 8 | `src/components/RateOfferCard.tsx` | done |
| Pharos/App/Offer route | `693:995` | 8 | — | todo |
| Pharos/App/Day item | `2021:2666` | 8 | — | todo |
| Pharos/Chat/Cargo context | `2188:8055` | 8 | — | todo |
| Pharos/App/Trip steps | `2728:26593` | 8 | — | todo |
| Pharos/Select | `344:51` | 8 | — | todo |
| Pharos/Country flag Rectangle | `249:1646` | 8 | `src/components/Flag.tsx` | done |
| Pharos/App/Trip preparation | `2715:1617` | 7 | — | todo |
| Pharos/App/Trip checklist | `2715:1596` | 7 | `src/components/TripChecklist.tsx` — только `State=Awaiting` (`2715:25520`), нужен Content=Request у Bottom sheet | review |
| Pharos/Chat/Composer | `2188:7944` | 7 | — | todo |
| Pharos/Empty details panel | `129:46` | 6 | — | todo |
| Pharos/App/Offer terms | `693:1013` | 6 | — | todo |
| Pharos/App/Route summary | `671:977` | 6 | `src/components/RouteSummary.tsx` | done |
| Pharos/Filter chip | `338:211` | 6 | — | todo |
| Pharos/Route summary | `26:27` | 4 | — (страница 21, второй компонент) | todo |
| Pharos/Payment summary | `412:389` | 3 | `src/components/PaymentSummary.tsx` | done |
| Pharos/App/Application progress | `734:426` | 3 | — | todo |
| Pharos/Location suggestions | `190:117` | 3 | — | todo |
| Pharos/App/Keyboard | `2776:1613` | 3 | — | todo |
| Pharos/Bottom sheet | `2197:8841` | 3 | `src/components/BottomSheet.tsx` + `BottomSheetHeader` (в нём же) · `RouteFields.tsx` · `SuggestionCard.tsx` · `SheetField.tsx` · `SortBy.tsx` · `TripChecklist.tsx` | done |
| Pharos/Chat/Rate offer | `2189:8453` | 3 | — | todo |
| Pharos/App/Upload field | `2013:3064` | 2 | — | todo |
| Pharos/Upload field/Driving licence preview | `2091:441` | 2 | — | todo |
| Pharos/Route map | `330:164` | 1 | — | todo |
| Lucide/Icon/Clock | `2006:17` | 36 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Calendar | `2006:13` | 64 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Info | `575:9647` | 19 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Map pin | `279:5035` | 116 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Search | `279:5037` | 95 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Loader | `279:5034` | 3 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Arrow right | `279:5033` | 120 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Truck · Bookmark · Shield · User Round · Circle Check · Circle X · Triangle Alert · Camera | см. §5 | 237 | `src/components/Icon.tsx` | done |
| Lucide/Icon/Orders · Overview · Users · Reports · Help · Sliders horizontal · X · Image | см. §5 | 221 | `src/components/Icon.tsx` | done |
| Status bar - iPhone 17 Pro | `2305:24705` | 1 | мок iOS | n/a |

---

## 4. Журнал

### 4.0. До начала работ

Первым делом сверялся Input — и оказался сломан (см. ловушку 4). Починка: `5a3a93f`.
Заведена проверочная обвязка (Playwright + Chrome), `b102ee3`.

### 4.1. Волна 0 — оболочка экрана · коммит `d62f804`

`AppShell.tsx` разбит на пять файлов (`layout/*`), у каждого появились стори; удалён `Icons.tsx`
(самодельные дубликаты `lucide-react`, который остальные компоненты уже используют).

**Pharos/App/Status bar** `2353:26430` — типы IOS `2305:25330` (402×62) и Default `586:20` (402×54).

| Что | Figma | Замер |
|---|---|---|
| высота, фон | 62, `#ffffff` | 62, `rgb(255,255,255)` |
| время | 17/22 SemiBold, центр бокса 124 на x=9 → центр 71 | 17/22, fw600, центр 71 |
| индикаторы | 129×13, отступ справа 9 | 129×13, отступ 9 |
| Dynamic Island | 125×37, r-pill, центр, y=14 | 125×37, r999, центр 202 при центре экрана 201, y=14 |

До правки: `Dynamic Island` отсутствовал, фон не задавался, тип Default не существовал.

**Pharos/App/Navigation bar** `586:33` — Home `586:25` (76) и Back `586:32` (60).

| Что | Figma | Замер |
|---|---|---|
| Home: высота, заголовок | 76, 24/32 Bold, x=16, w=370 | 76, 24/32 fw700, x=16, w=370 |
| Back: высота, кнопка | 60, 44×44 на x=16 | 60, 44×44 на x=16 |
| Back: заголовок | 20/28 SemiBold, x=68 | 20/28 fw600, x=68 |
| фон | `#f4f6f8` (канвас) | `rgb(244,246,248)` |

До правки: одна высота 76 на оба типа, заголовок по центру, «назад» — текстовый символ `←`.

**Pharos/App/Tab bar** `586:67` — четыре варианта (по активной вкладке).

| Что | Figma | Замер |
|---|---|---|
| корень | 402×83, pad top 8, белый | 402×83, `rgb(255,255,255)` |
| вкладки | 90×50, позиции 16 / 110 / 203 / 297 | 90×50, позиции 16 / 109 / 203 / 296 |
| активная | фон `#eff2f5`, r-pill | `rgb(239,242,245)`, r999 |
| лейбл активный / обычный | `#225d74` / `#586d79`, 12/16 Medium | `rgb(34,93,116)` / `rgb(88,109,121)`, 12/16 fw500 |
| иконки | 20×20, 2px, `#172a35` в обоих состояниях | 20×20, `rgb(23,42,53)` |

До правки: пилюля 64×32 вокруг иконки вместо всей вкладки 90×50, иконки 22px, активный лейбл `text-primary`.

**Pharos/App/Home indicator** `586:70` — 402×34, полоса 134×5 r3 `#172a35`. Замер совпал.

**ScreenFrame** (`src/components/layout/ScreenFrame.tsx`) — композиция пяти частей, метрики шелла
фиксированы: 402×874, статус-бар 62 (Default 54), навбар 76/60, таб-бар y757 h83, home indicator y840 h34.

### 4.2. Волна 1 — атомы · коммиты `591adcb`, Input ранее `5a3a93f`

**Pharos/Button** `12:38` — 24 варианта: Appearance Primary/Secondary × Size Web(40)/Mobile(48) ×
State Default/Hover/Pressed/Focus/Disabled/Loading.

| Что | Figma | Замер |
|---|---|---|
| primary | `#225d74`, текст белый, h48, r8 | `rgb(34,93,116)`, fw500 14/20, h48, r8 |
| primary hover / pressed | `#1b4f65` / `#153f50` | `rgb(27,79,101)` / `rgb(21,63,80)` |
| secondary | `#ffffff`, рамка 1px `#8093a0`, текст `#225d74` | совпало |
| secondary hover / pressed | `#ebf3f7` / `#d8e9f0` | `rgb(235,243,247)` / `rgb(216,233,240)` |
| disabled (оба) | фон `#c3d0d8`, текст `#80929e`; у secondary рамка `#d7e0e6` | совпало |
| loading | активные цвета + спиннер 20×20 (кольцо 15×15, 2px) | фон `#225d74`, бокс 20, кольцо 15 |
| focus | рамка 2px + кольцо 378×56 r12 при offset −4 | 378×56, offset −4, r12 |
| Size=Web | высота 40 | 40 |

Найдено и исправлено: hover/pressed не были подключены к существующим токенам; loading выглядел
выключенным; у secondary disabled был белый фон; focus ring был тенью 4px; рамка secondary падала
в `currentColor` из-за интерполяции класса (ловушка 5); не было размера Web.

**Pharos/Button link** `168:118` — 12 вариантов.

| Что | Figma | Замер |
|---|---|---|
| бокс | hug 118×48, pad x16, без фона | 118×48 |
| текст | 14/20 Medium `#225d74` | совпало |
| hover / pressed | фон `#ebf3f7` / `#d8e9f0` | `rgb(235,243,247)` / `rgb(216,233,240)` |
| disabled | текст `#80929e` | `rgb(128,146,158)` |
| loading | ширина 146 (+спиннер 20 и gap 8) | 146 |

До правки: `w-full` без паддингов, ни одного состояния.

**Pharos/Alert** `575:9632` — 5 типов, каждый 546×64.

| Что | Figma | Замер |
|---|---|---|
| бокс | pad12 gap12 r12, иконка 20×20 по центру | h64, r12, иконка 20 |
| title / description | 14/20 Medium, 12/16 Regular | 14/20 fw500, 12/16 fw400 |
| Info / Error / Neutral фон | `#ebf3f7` / `#fdedea` / `#eff2f5` | совпало |
| текст по типу | `#225d74` / `#b8332f` / `#526773` | совпало |
| иконки | Info, Triangle Alert, **Circle X**, Circle Check, **Circle Check** | исправлено |

Найдено: Error использовал `CircleAlert` вместо `CircleX`; Neutral показывал Info, хотя главный
компонент — `Circle Check` (слой назван неверно). Добавлена опциональная третья строка —
скрытый в Figma слой «Waiting detail».

**Pharos/Input** `12:166` — мобильные варианты `12:160`–`12:165` (Web `12:154`–`12:159`).

| Что | Figma | Замер |
|---|---|---|
| контрол | h48, r8, pad 0/12, рамка 1px `#8093a0`, фон белый | совпало |
| focus | рамка 2px `#225d74` + кольцо 368×56 r12 offset −4 | совпало |
| ошибка | рамка 1px `#b8332f`, подсказка `#b8332f` | совпало |
| disabled / readonly | фон `#eff2f5`, рамка та же | совпало |
| hint | есть во всех шести состояниях, 12/16 | есть |

### 4.3. Волна 1 (продолжение) — Status, Avatar, Country flag · коммит `8a58a9c`

**Pharos/Status** `11:148` — шесть тонов (Neutral `11:142`, Info `11:143`, Success `11:144`,
Warning `11:145`, Danger `11:146`, Match `11:147`), каждый 87×28. Свойства компонента в Figma:
текстовое `Label` = «In transit» и булево `Show dot`.

| Что | Figma | Замер |
|---|---|---|
| бокс | hug, pad 6/12, gap 6, radius 999 | 86.28×28, pad 6/12, gap 6, r999 |
| точка | 6×6, цвет текста тона | 6×6 на (12,11) |
| лейбл | DM Sans Medium 12/16 | 12/16 fw500, DM Sans |
| цвета тонов | `#eff2f5/#526773`, `#ebf3f7/#225d74`, `#e8f6ef/#216547`, `#fff4df/#855300`, `#fdedea/#b8332f`, `#bce5d5/#1c5644` | все шесть совпали |

Правки: высота была прибита `h-[28px]` вместо hug-паддингов Figma; `gap`/`px` были сырыми
числами, переведены на `--spacing-6`/`--spacing-12`; точка получила `bg-current` и `aria-hidden`;
шапка-контракт не содержала props и id вариантов и ссылалась на несуществующий токен;
единственная стори `Tones` с выдуманными подписями заменена на шесть сторей по тонам с текстом из Figma.
Отдельно: лейбл был голым текстовым узлом — обёрнут в `<span>`, чтобы соответствовать слою `Label`
(ловушка 13).

**Pharos/Avatar** `74:64` — новый компонент. Size=Small `74:56` (32×32, Label/12) и
Size=Medium `74:57` (40×40, Label/14); радиус 999, фон `color/avatar/bg`, инициалы
`color/avatar/text`; свойство `Initials` = «AK». Все 24 инстанса в приложении — Medium 40×40,
поэтому размер по умолчанию `medium`.

| Что | Figma | Замер |
|---|---|---|
| размеры | 32×32 и 40×40, radius 999 | 32×32 и 40×40, r999 |
| цвета | `#bce5d5` / `#1c5644` | `rgb(188,229,213)` / `rgb(28,86,68)` |
| шрифт | 12/16 fw500 и 14/20 fw500 | совпало |

**Pharos/Country flag Rectangle** `249:1646` — Country=France `249:1647`, Country=Belgium `249:1649`,
оба 24×24 (bbox сета 136×72 — это просто раскладка). В Figma: белый бокс 24×24, рисунок 3:2
высотой 16 по центру (y=4), обводка 1px `#cbd5da`, радиус 2.

SVG в репозитории — точный экспорт этого рисунка в масштабе 0.75, а приложение инстансит сет
в 18×18 (Offer `2658:1312`/`2658:1322`), поэтому `size = 18` оставлен значением по умолчанию:
смена молча изменила бы размер флагов в `OfferCard`. Добавлена стори на оба варианта в
геометрии сета (24×24) и шапка-контракт. Пиксельная сверка с рендерами Figma: **572 из 576
пикселей идентичны**, остальные 4 — сглаживание скруглённых углов; цвет обводки совпал точно.

### 4.4. Типографика — до и после

Проверка шрифтов вскрыла две системные проблемы (ловушки 11 и 12): **ни DM Sans, ни Manrope
не подключались**, а Tailwind игнорировал семейство из текстовых токенов, из-за чего заголовки
шли DM Sans'ом.

Сделано:

1. `index.html` и `.storybook/preview-head.html` — подключение DM Sans (400/500/700) и Manrope (600/700)
   с Google Fonts. Storybook подхватывает `preview-head.html` без перезапуска.
2. `tools/export-tokens.mjs` теперь генерирует **мост font-family**: по одному правилу на семейство,
   вне `@layer` (поэтому оно выигрывает у утилит Tailwind). Файл `tokens.css` больше не содержит
   бесполезных строк `--text-*--font-family`, зато содержит реальные правила.

Соответствие проверено прямо в Figma (семейство каждого текстового стиля):

| Текстовый стиль | Figma | Токен |
|---|---|---|
| Button label, Input label, Alert title, Status label, Tab label | DM Sans Medium | `text-label-14`, `text-label-12` (DM Sans) |
| Navigation bar Type=Home | **Manrope** Bold 24/32 | `text-heading-24` |
| Navigation bar Type=Back | **Manrope** SemiBold 20/28 | `text-heading-20` |
| Offer card «Rate» €360 | **Manrope** Bold 28/36 | `text-metric-28` |

После правки заголовок навбара считается как `Manrope, system-ui, sans-serif` и вес Manrope 700
числится загруженным. **Важно для честности:** ширина лейбла Status до правки была 51.27px
(фолбэк) против Figma 51, после — 50.28px. То есть прежнее совпадение было случайным.

Заодно в `tokens.json` добавлено семейство `font.ios`, а генератор больше не хардкодит iOS-стек:
все три семейства (`--font-ui`, `--font-heading`, `--font-ios`) теперь выводятся из токенов,
а `--text-*--font-family` ссылается на них через переменную.

**Что осталось неизвестным.** Время в статус-баре `Type=IOS` набрано шрифтом, которого в файле
нет (ловушка 15), поэтому сверить его не с чем. В коде оно наследует UI-семейство (DM Sans) —
это детерминированно и совпадает с тем, как Figma рисует фолбэк. Стили `text-ios-*` используют
стек SF Pro Text → system-ui: на устройствах Apple это системный шрифт, на остальных — фолбэк.
Отдельно: у типа `Type=Default` время — уже честный DM Sans Regular 16/24, это сверено.

---

### 4.5. Что вскрылось при разборе остальных компонентов

**`Pharos/Bottom sheet` (`2197:8841`) в коде не существует.** В репозитории лежал выдуманный
компонент «шторка карты» с состояниями Peek/Full, ручкой 36×4 и пагинатором — он был написан по
скриншотам, а не по сету. Настоящий сет — это **13 вариантов в четырёх группах**:

| Content | Состояния |
|---|---|
| Route | Route filled `2197:7919` (402×406) · Origin current `2197:7975` · Destination current `2197:8028` · Route filled vehicle `2197:8081` (454) · Route empty `2197:8167` · Route origin selected `2197:8222` · Origin suggestions `2197:8277` · Destination suggestions `2197:8330` · Route empty vehicle `2197:8383` · Route origin selected vehicle `2197:8438` (494) |
| Price | Price offer `2197:8777` (402×494) |
| Request | Trip data `2715:25486` (402×494) |
| Sort | Sort by `2767:27860` (402×360) |

Компонент отдан отдельному агенту на полный перенос, с требованием собрать его композицией
(контейнер + блоки содержимого), а не одним монолитом.

**`Pharos/App/Offer` (`2594:22063`) существует, но не сверялся.** В коде есть `OfferCard.tsx`
с состояниями Default/Disabled/Loading/Pending — геометрия с Figma не сверялась ни разу.

### 4.6. `Pharos/Bottom sheet` — 13 вариантов, композиция из шести блоков

Выдуманный компонент «шторка карты» удалён и заменён настоящим сетом. Один контейнер плюс блоки
содержимого, у каждого свои стори; варианты, отличающиеся только наличием под-блока, выражены
пропсами, а не копипастой.

| Файл | Что это в Figma | Стори |
|---|---|---|
| `BottomSheet.tsx` → `BottomSheet` | поверхность: белая, скругление сверху 16, паддинг группы, gap 16 | 13 (все варианты) |
| `BottomSheet.tsx` → `BottomSheetHeader` | `Pharos/Bottom sheet/Header` `2197:7908` (один компонент, не сет) | — |
| `BottomSheet.tsx` → `VehicleMatchingLine`, `SheetHint` | текстовые строки `2197:8103` / `2197:8189` / `2664:23032` | — |
| `RouteFields.tsx` | `Route / Connected stops` `2197:7929` — 354×144 | `Filled` · `DestinationEmpty` · `Empty` |
| `SuggestionCard.tsx` | внутренний `Frame` 354×80 четырёх состояний current/suggestions | `Lille` · `Brussels` |
| `SheetField.tsx` | инстансы `Pharos/Input` в Content=Price `2197:8787`, `2197:8796` | `YourRate` · `Comment` · `Empty` |
| `TripChecklist.tsx` | `Pharos/App/Trip checklist` `2715:1596`, только `State=Awaiting` `2715:25520` | `Awaiting` |
| `SortBy.tsx` | четыре строки 370×48 из `2767:27860` | `HighestPerKm` · `SoonestDeadline` |

**Геометрия контейнера.** Поверхность одна и та же во всех вариантах; различается только паддинг:
`Content=Route`/`Price` — 12/24/34/24, `Content=Sort`/`Request` — 12/16/24/16. Отсюда проп
`pad="route" | "sort"`.

| Что | Figma | Замер |
|---|---|---|
| поверхность | r16 сверху, `#ffffff`, gap 16 | `rgb(255,255,255)`, r16, gap 16 |
| ручка `Sheet / Drag handle` | 354×4, пилюля 36×4 r2 `#d7e0e6` | 354×4, пилюля 36×4 r4 `rgb(215,224,230)` |
| заголовок | 48 высотой, Manrope SemiBold 20/28 `#172a35` | 354×48, Manrope 600 20/28 `rgb(23,42,53)` |
| `Route / Connected stops` | 354×144 r16 `#f4f6f8` | 354×144 r16 `rgb(244,246,248)` |
| строка From/To | 354×72, pad 10/16/10/16, gap 12 | 354×72, pad 10/16/10/16, gap 12 |
| маркер | 8×8, обводка 1.5px `#225d74` INSIDE; origin залит, destination — канвас | 8×8; заливка и рамка совпали, толщину проверял по пикселям при dpr 8: 8 физ. px из 64 = 1 px CSS = 1.5 физ. px |
| коннектор | 1×64 `#d7e0e6` на x=20, y=40..104 | 1×64 на (20,40) `rgb(215,224,230)` |
| подписи строк | From/To: DM Sans Medium 12/16 `#586d79`; город: Manrope SemiBold 20/28 `#172a35` | совпало |
| строка сопоставления | 354×16 DM Sans Medium 12/16 `#586d79` | 354×16, fw500, 12/16, совпало |
| `Hint` | 354×32 DM Sans Regular 12/16 | 354×32, совпало |
| карточка предложения | 354×80 pad16 gap4 r12 `#f4f6f8` | 354×80, pad16, gap4, r12, `rgb(244,246,248)` |
| поле `Pharos/Input` | 354×76 (label 20 + gap 8 + control 48) | 354×76 |
| trip checklist | 370×190, pad16 gap12 r12, рамка `#d7e0e6`, 4 строки 20 | 370×190, pad16, gap12, r12 |
| строка Sort | 370×48, pad 12/0/12/0, gap 8, DM Sans Regular 16/24 `#172a35` | 370×48, pad 12/0, gap 8, 16/24 fw400 |
| галочка Sort | `Lucide/Icon/Circle Check` 20×20 `#225d74`, 2px | 20×20 `rgb(34,93,116)` |

**Высоты.** Три варианта сходятся с Figma точно, у остальных расхождение объясняется тем, что
высота фрейма в Figma задана вручную (`primaryAxisSizingMode = FIXED`) и не равна высоте
содержимого. Я рендерю настоящую hug-высоту и привожу её рядом с Figma:

| Вариант | Figma h | Сумма детей + gap 16 + паддинг | Мой замер |
|---|---|---|---|
| Route filled `2197:7919` | 406 | 406 | **406** |
| Route empty `2197:8167` | 454 | 454 | **454** |
| Route empty vehicle `2197:8383` | 454 | 454 | **454** |
| Trip data `2715:25486` | 494 | 494 | **494** |
| Route filled vehicle `2197:8081` | 454 | **406** | 406 |
| Route origin selected `2197:8222` | 454 | **406** | 406 |
| Origin/Destination suggestions `2197:8277`/`8330` | 454 | **414** | 414 |
| Route origin selected vehicle `2197:8438` | 494 | **406** | 406 |
| Origin/Destination current `2197:7975`/`8028` | 406 | **414** | 414 |
| Price offer `2197:8777` | 494 | **398** | 398 |
| Sort by `2767:27860` | 360 | **312** | 312 |

Это подтверждено дважды: у `2197:8081` шесть детей дают ровно 406, а `absolutelyBoundingBox`
фрейма — 454; у `2197:7975` дети стоят на y 12/32/96/188/220/316 с шагом ровно 16, то есть
содержимое занимает 414, а высота фрейма 406. **Это дефект сета, а не переноса** — в Figma
варианты растянуты под самую высокую карточку ряда. Если дизайн должен совпадать попиксельно,
высоты во фреймах надо поправить обратно в Figma (прототип ведёт, дизайн догоняет).

**Чего в сете нет.** Контрола обмена местами (swap) у точек в Figma нет: между строками From и To
лежит только статичный коннектор 1×64, кликабельных элементов там нет. Строки сделаны
`<button>` (в четырёх состояниях current/suggestions одна из строк как раз редактируется), но
иконки swap дизайн не содержит — выдумывать её я не стал.

**Отклонения от прежнего выдуманного компонента** (`git show 45c642a:src/components/BottomSheet.tsx`):
были состояния Peek/Full, ручка 36×4 на всю ширину, пагинатор `1 of 2` текстом, паддинг 12/24 и
`pb-[34px]`, рамка `border-t` по верху поверхности и привязка к низу экрана через `absolute`.
Ни одного из этих элементов в сете нет; пагинатора нет вообще. Стори `Peek`/`Full` удалены,
вместо них 13 сторей по вариантам Figma.

**Отдельно: `SortBy` и `TripChecklist` брали иконки напрямую из `lucide-react`,** хотя в репозитории
уже есть реестр `Icon.tsx` (§5) — заменено на `<Icon name="clock" />` и
`<Icon name="circle-check" />`, размеры те же (16 и 20).

**Токены.** Новых не потребовалось: цвета и типографика взяты из существующих групп (`color-bg-canvas`,
`color-border-default`, `color-border-brand`, `color-text-*`, `color-status-warning-text`).
Геометрические числа (`36`, `10`, `1.5`, `1`, `72`, `144`, `64`, `20`, `40`) оставлены литералами,
как и в остальных контролах репозитория — в `spacing` таких значений нет.

### 4.7. Волна 2 — карточки и информационные блоки

Три агента параллельно, каждый на своих файлах; общие файлы, проверка и коммит — за мной.
Все замеры перепроверены независимо: семь контрольных боксов совпали до десятых.

**`Pharos/App/Offer` `2594:22063`** (46 инстансов: 41 Default, 3 Pending, 2 Loading,
**0 Disabled**) — существовавший `OfferCard` сверен и починен, 10 расхождений:

- радиус был 12, в Figma **16**;
- Disabled гасил всю карточку через `opacity-50`, в Figma хром остаётся, а 38% получают только
  строки контента → появился токен `--opacity-disabled`;
- `Distance` и `Schedule` были вторичным цветом, в Figma привязаны к `color/text/primary`;
- `Deadhead` вместе с иконкой были primary/secondary, в Figma — `offer/text/highlight` `#225d74`;
- `Decision timer` **скрыт во всех четырёх вариантах и во всех 46 инстансах** → стал пропом
  `showTimer`, по умолчанию выключен (это изменение поведения для потребителей);
- строка цены выравнивалась по базовой линии, в Figma — по нижнему краю (counterAxis MAX);
- у пилюли таймера радиус был 8, в Figma — пилюля;
- скелетон Loading был выдуман; заменён на реальные полосы Figma (72×24, 68×16, 42×16, 149×20,
  129×16, 158×16, 217×16; ряды 36/28/24/20/20, gap 8, r4, `#e8edf0`).

Замеры: Default 370×190, r16, рамка 1px `#d7e0e6`, pad 16, gap 8 — точно; **Loading — 0 из 71 780
пикселей** отличий от рендера Figma; Pending 370×255.

**`Pharos/Offer preview` `26:73`** — новый `OfferPreview.tsx`. 32 инстанса, и **все Size=Desktop**
(460/628 ширины), поэтому размер по умолчанию `desktop` и есть проп `full`. 440×148, 440×182 и
мобильные 358×290, 358×318 воспроизведены. Ограничения честные: у мобильных вариантов вложенные
инстансы в Figma **пустые** (подписи неизвестны, взяты с десктопа), а сам сет Figma не рендерит —
экспорт даёт PNG 1×1, поэтому визуального эталона нет и сверялись с десктопными инстансами на
странице 21.

**`Pharos/App/Route card` `2715:1535`** — новый `RouteCard.tsx`: Expected `2715:1465` 370×235 и
Known `2715:1500` 370×339. Pixel diff для Expected — **0 отличий**. Находка: Figma **рисует**
ссылку Known «Navigate» подчёркнутой, хотя API отдаёт `textDecoration: NONE`; проверка трёх узлов
по отдельности показала, что у однотипной ссылки в Offer подчёркивания нет → у `ButtonLink`
появился проп `underline` (по умолчанию `false`, поведение существующих вызовов не меняется).

**`Pharos/Information section` `2576:2265`** (116 инстансов — второй по частоте элемент) — новый
`InformationSection.tsx`, 11 сторей, все 4 варианта (Wide `140:49`, Compact Payment `2466:14783`,
`14795`, `14807`), три булевых свойства Figma стали слотами (`country`, `status`, `action`).
Ключевое открытие: **чип статуса и «key fact» взаимоисключающие** — чип заменяет key fact в
ведущей строке. Найденное расхождение: 3 из 4 вариантов нарисованы высотой 142, а контент
заканчивается на y=110 — 20px мёртвого места; доказано временным инстансом (создан и удалён).
Стори `CompactPaymentPendingFixed142` фиксирует 142, как нарисовано.

**`Route summary` — поправка к выбору агента.** Агент B выбрал `671:977` и заявил, что `26:27` на
страницах водителя не инстанцируется вовсе. Адресный подсчёт (ловушка 22) показал иначе: используются
**оба**, просто на разных страницах.

| Сет | Инстансов | Где |
|---|---|---|
| `Pharos/App/Route summary` `671:977` (370×92) | 6 | страница 30 — iOS App / Driver |
| `Pharos/Route summary` `26:27` (358×170) | 4 | страница 21 — Driver / Search and request |
| локальный фрейм `2668:14790` «Route summary v2» (370×78) | — | экраны Loads, **не библиотечный компонент** |

Значит `RouteSummary.tsx` покрывает страницу 30; при переносе экранов страницы 21 понадобится второй
компонент из `26:27`, а для `/loads` — свой блок из `2668:14790`.

**Геометрия переехала в токены.** Все три агента независимо упёрлись в то, что метрики оболочки и
карточек лежат в `globals.css`, а не в `design/tokens.json`. Перенёс группами `screen`, `status-bar`,
`nav-bar`, `sticky-bar`, `viewport`, `tab-bar`, `home-indicator`, `card`, `control`; добавил
`opacity.disabled` (0.38), `spacing.10` (10px), `shadow.card`. Имена переменных сохранены, поэтому
ни один компонент не пришлось править, `globals.css` теперь содержит только `body`. Аудит токенов
подтвердил, что ни одна из 20 переменных не потерялась. Заодно ушли два приближения: спейсеры
10px в Offer Pending и Route card теперь настоящие (были 8px, из-за чего кнопка стояла на 2px левее).

## 5. Иконки

Иконки — не мелочь: на экранах водителя их **19 разных, суммарно 900+ инстансов**, самая частая
(`Arrow right`) встречается 120 раз. В Figma это отдельная страница `03 — Icons` (`9:5`) с 23
компонентами; в документации страницы написано: «A single set from Lucide. Size 24 px; 20 px
instances are used inside controls. Colour is bound to Pharos tokens», плюс правило «An icon-only
action needs a tooltip or an accessible name. For a driver the interactive area is at least 48 px».

Всё перенесено в один реестр — `src/components/Icon.tsx` (+ стори `Foundations/Icons`).
Компоненты берут иконку по имени (`<Icon name="map-pin" />`), цвет наследуется через `currentColor`,
обводка всегда 2px, размеры — из токенов (`--size-icon-sm/md/lg` = 16/20/24).
Именно поэтому реестр, а не прямые импорты из `lucide-react`: имя в Figma и имя в lucide
совпадают не всегда, и знать это нужно в одном месте.

| Компонент Figma | Node | lucide | Инстансов |
|---|---|---|---|
| `Lucide/Icon/Truck` | `279:5032` | `Truck` | 8 |
| `Lucide/Icon/Arrow right` | `279:5033` | `ArrowRight` | 120 |
| `Lucide/Icon/Loader` | `279:5034` | `LoaderCircle` | 3 |
| `Lucide/Icon/Map pin` | `279:5035` | `MapPin` | 116 |
| `Lucide/Icon/Bookmark` | `279:5036` | `Bookmark` | 60 |
| `Lucide/Icon/Search` | `279:5037` | `Search` | 95 |
| `Lucide/Icon/Shield` | `279:5038` | `Shield` | 38 |
| `Lucide/Icon/Overview` | `82:114` | **`LayoutDashboard`** | — |
| `Lucide/Icon/Orders` | `82:120` | **`Package`** | 88 |
| `Lucide/Icon/Users` | `82:124` | `Users` | — |
| `Lucide/Icon/Reports` | `82:128` | **`ChartNoAxesColumn`** | — |
| `Lucide/Icon/Help` | `431:19` | `CircleHelp` | 30 |
| `Lucide/Icon/Info` | `575:9647` | `Info` | 19 |
| `Lucide/Icon/Triangle Alert` | `575:9652` | `TriangleAlert` | 16 |
| `Lucide/Icon/Circle X` | `575:9657` | `CircleX` | 9 |
| `Lucide/Icon/Circle Check` | `575:9661` | `CircleCheck` | 28 |
| `Lucide/Icon/User Round` | `754:11` | `UserRound` | 60 |
| `Lucide/Icon/Calendar` | `2006:13` | `Calendar` | 64 |
| `Lucide/Icon/Clock` | `2006:17` | `Clock` | 36 |
| `Lucide/Icon/Camera` | `2008:11` | `Camera` | 2 |
| `Lucide/Icon/Image` | `2008:16` | `Image` | — |
| `Lucide/Icon/Sliders horizontal` | `2644:2` | `SlidersHorizontal` | 21 |
| `Lucide/Icon/X` | `2648:2` | `X` | 11 |
| *(вне неймспейса)* `Icon / chevron.left` | — | `ChevronLeft` | навбар Back |

Жирным — те четыре, где имя компонента не совпадает с глифом (ловушка 18). Размеры `11/12/14 px`
в дизайне тоже встречаются, но токенов под них нет — реестр принимает число, а вопрос вынесен в §7.

Проверено: лист иконок (`Foundations/Icons → Sheet`) отрисован и сверён с Figma — 24 иконки,
все 24×24, `stroke-width: 2px`, глифы совпадают. Стори `Sizes` показывает 16/20/24 и 14 без токена,
`InheritsColour` — что цвет приходит от родителя.

## 6. Экраны

### 6.1. `/search` — iOS / first-search-v2.1 / Loads (refined) · `2772:12931`

Первый собранный экран; делался только из уже проверенных компонентов (оболочка, Input, Button),
новых токенов не потребовал. Файл — `src/screens/Search.tsx`, стори `Screens/Search`.

| Элемент | Figma | Замер |
|---|---|---|
| экран | 402×874, канвас `#f4f6f8` | 402×874 |
| статус-бар | инстанс без Dynamic Island, 62 | 62, острова нет |
| навбар | Type=Home, 76, заголовок «Loads» 24/32 Manrope Bold на (16,84) | (0,62) 402×76; заголовок (16,84) Manrope 24/32 fw700 `#172a35` |
| заголовок блока | «Find loads on your route» 24/32 Manrope Bold на (16,162) | (16,162) Manrope 24/32 fw700 |
| Input «Start» | (16,214) 370×76, label 20, control 48 | (16,214) 370×76; label 20 на 214; control (16,242) 370×48; подсказка скрыта |
| Input «Destination (optional)» | (16,310) 370×76 | (16,310) 370×76; control (16,338) 370×48 |
| Button «Use my location» | (16,637) 370×48, Secondary | (16,637) 370×48, фон белый, текст `#225d74`, иконка-пин после лейбла |
| Button «Find loads» | (16,693) 370×48, **State=Disabled** | (16,693) 370×48, фон `#c3d0d8`, текст `#80929e` |
| таб-бар / home indicator | y757 h83 / y840 h34 | совпало |

Решения, которые стоит знать:

- **«Find loads» включается по вводу.** В Figma нарисовано только состояние Disabled; в прототипе
  кнопка активируется, когда заполнен `Start` — это поведение, которое дизайн подразумевает.
  Стори `Filled` показывает это состояние.
- **Переход на экран результатов не подключён** — экрана ещё нет. Кнопки не навигируют.
- **Иконки таб-бара сверил по рендеру, а не по именам.** В этом экране инстанс второй вкладки
  резолвится в `Lucide/Icon/Orders`, хотя рисует тот же куб, что `Lucide/Package` в component set.
  Рендер экрана подтвердил: Search, куб, календарь, user-round — как в `TabBar.tsx`.
- **Ширина боксов заголовков** у меня 370 (span тянется по `w-full`), в Figma — hug 354/144.
  Текст выровнен по левому краю, поэтому визуально и по позиции букв совпадает; это не расхождение.

_Остальные экраны — в работе._

## 7. Открытые вопросы

- **Размер Web vs Mobile.** У Button и Input в Figma есть оба размера; приложение водителя
  использует Mobile (48). Реализованы оба, стори показывают Web отдельно.
- **Размеры иконок 11/12/14 px не покрыты токенами.** В дизайне они встречаются (`Arrow right`
  16/20, `Map pin` 11/16/20, `Search` 14/20/24, `Clock` 12/16/20), а токены есть только на
  16/20/24. Реестр принимает число, но по правилу 1 это хардкод — нужен либо токен на 12/14,
  либо подтверждение, что эти размеры вне системы.
- **Часть компонентов ещё импортирует `lucide-react` напрямую** — остались только те, что писались
  агентами до появления реестра; все должны перейти на `src/components/Icon.tsx`, чтобы маппинг
  имён остался в одном месте (проверять `grep -rn "from 'lucide-react'" src/`).
- **Арт встроенной карты в Load card не портирован** (`TODO(asset)`): `Show map` рендерит
  корректную по размеру заглушку, поэтому раскрытая карточка на ~142px короче Figma-инстансов
  `541:2650`/`541:3640`. `Show map=false` у всех 8 инстансов на страницах водителя, так что в
  приложении это состояние недостижимо. Решение: экспортировать арт как SVG, как сделано с флагами.
- **`Route summary` со страницы 21 не портирован**: `26:27` (358×170) инстанцируется 4 раза на
  странице «Driver / Search and request», а `RouteSummary.tsx` построен по `671:977` со страницы 30.
  Плюс экраны Loads рисуют свой локальный фрейм `2668:14790` (370×78) — под него нужен третий блок.
- **`Offer preview` нечем сверить визуально**: Figma отдаёт PNG 1×1 для всего сета, а мобильные
  варианты содержат пустые вложенные инстансы, поэтому их подписи выведены с десктопа. Нужен
  либо рабочий экспорт из Figma, либо решение дизайна по мобильным подписям.
- **`Trip checklist` перенесён только в `State=Awaiting`** (единственное состояние, которое
  использует Bottom sheet); остальные состояния не портированы.
- **Высоты вариантов `Pharos/Bottom sheet` в Figma не равны содержимому** (см. §4.6): это
  `primaryAxisSizingMode = FIXED`, выставленный по самой высокой карточке ряда. Прототип
  отрендерен по настоящей hug-высоте, поэтому числа расходятся на 8-96 px. Нужно решение дизайна:
  либо во фреймах выставить `AUTO` по вертикали, либо зафиксировать высоты сознательно и тогда
  перенести их в код как токены.
- **Шрифты идут с Google Fonts (CDN).** Офлайн-сборка уедет в `system-ui`. Если нужна
  автономность — скачать woff2 в `public/fonts` и заменить ссылки на `@font-face`.
- **Hover и Pressed нельзя показать стори.** Это CSS-псевдоклассы, поэтому в Storybook они не
  отдельные истории — проверяются замером с настоящим курсором. Если понадобится видеть их
  в витрине, нужен аддон pseudo-states.
- **Свойства компонентов не становятся стори.** У Status есть `Show dot` и `Label`, у Input —
  скрытый `Required`: это properties, а не варианты, поэтому стори ровно по вариантам.
- **`NavigationBar` держит свой `AvatarInitials` 44×44** — в Figma это отдельный фрейм `Profile`,
  а не инстанс `Pharos/Avatar` (там 40×40), так что дублирование оправдано, но при появлении
  третьего размера аватара это стоит свести в один компонент.
- **`storybook-static/` устаревает** после каждой правки — перед публикацией нужен `pnpm build-storybook`.
- **Встроенный Chromium Playwright не скачан** (загрузка висела). Проверки идут через
  установленный Google Chrome (`channel: 'chrome'`).
