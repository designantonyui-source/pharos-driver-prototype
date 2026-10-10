# Аудит пользовательских строк src/

Дата: 2026-10-10. Код приложения не изменён.

Сканирование TS/TSX/JS/JSX через AST: текст JSX, строковые атрибуты, значения по умолчанию, сообщения, демо-данные и шаблонные строки. Дополнительно проверены вхождения кириллицы и польских диакритик. Повторения в разных местах сохранены; одинаковые вхождения на одной строке объединены. JSX-фрагменты перечислены как в исходнике; `${…}` обозначает динамическое значение.

Исключены комментарии, имена городов и чистые маршруты из названий городов, валюта zł, CSS, пути, идентификаторы и технические значения. В смешанном тексте города сохранены. Имена людей и компаний сохранены без перевода. English оставлен без изменений. Storybook и ссылки на строки в тестах приведены отдельно. Динамический текст, поступающий только через props/API, без литерала в src/ не имеет собственной строки в этой таблице. SVG-карты и флаги не содержат элементов text/tspan; текст, превращённый в векторные контуры, этим аудитом не распознаётся.

Всего записей: **1039**. В приложении: **712**; English: 383, Имя / бренд: 14, Нейтральный: 66, Польский: 232, Русский: 17.

## 1. Приложение: строки для перевода

| Файл | Строка | Текущий язык | Предложенный English |
|---|---|---|---|
| `src/components/bl/BlFrame.tsx:15` | Kursy | Польский | Trips |
| `src/components/bl/BlFrame.tsx:16` | Szukaj | Польский | Search |
| `src/components/bl/BlFrame.tsx:17` | Profil | Польский | Profile |
| `src/components/bl/BlFrame.tsx:44` | Wstecz | Польский | Back |
| `src/components/bl/BlFrame.tsx:63` | Główna nawigacja | Польский | Main navigation |
| `src/components/v2/QuickApplyModal.tsx:41` | Автомобиль подходит | Русский | Vehicle matches |
| `src/components/v2/QuickApplyModal.tsx:42` | Время свободно | Русский | Schedule available |
| `src/components/v2/QuickApplyModal.tsx:48` | Быстрая заявка | Русский | Quick apply |
| `src/components/v2/QuickApplyModal.tsx:52` | Маршрут | Русский | Route |
| `src/components/v2/QuickApplyModal.tsx:56` | Цена | Русский | Price |
| `src/components/v2/QuickApplyModal.tsx:57` | /км | Русский | /km |
| `src/components/v2/QuickApplyModal.tsx:60` | Время загрузки | Русский | Pickup time |
| `src/components/v2/QuickApplyModal.tsx:62` | Сегодня | Русский | Today |
| `src/components/v2/QuickApplyModal.tsx:62` | Завтра | Русский | Tomorrow |
| `src/components/v2/QuickApplyModal.tsx:71` | Проверки заявки | Русский | Application checks |
| `src/components/v2/QuickApplyModal.tsx:83` | Не удалось отправить заявку. Попробуйте ещё раз. | Русский | Couldn’t send your application. Try again. |
| `src/components/v2/QuickApplyModal.tsx:89` | Отправить заявку | Русский | Send application |
| `src/components/v2/QuickApplyModal.tsx:90` | Отмена | Русский | Cancel |
| `src/lib/bl/logic.ts:33` | Plandeka | Польский | Curtainsider |
| `src/lib/bl/logic.ts:38` | Palety: sprzęt AGD | Польский | Pallets: household appliances |
| `src/lib/bl/logic.ts:41` | Chłodnia: mrożonki | Польский | Refrigerated load: frozen food |
| `src/lib/bl/logic.ts:44` | Ładunek ogólny: sanitariaty | Польский | General cargo: sanitaryware |
| `src/lib/bl/logic.ts:47` | ADR: butle z gazem (klasa 2) | Польский | ADR: gas cylinders (class 2) |
| `src/lib/bl/logic.ts:50` | Palety: napoje | Польский | Pallets: beverages |
| `src/lib/bl/logic.ts:63` | jutro  | Польский | tomorrow  |
| `src/lib/bl/logic.ts:69` | ${h} godz.${r ? ` ${r} min` : ''} | Польский | ${h} h${r ? ` ${r} min` : ''} |
| `src/lib/bl/logic.ts:100` | wymagane ADR | Польский | ADR certification required |
| `src/lib/bl/logic.ts:100` | Nie pasuje: wymagane uprawnienie ADR | Польский | Not compatible: ADR certification required |
| `src/lib/bl/logic.ts:102` | wymagana chłodnia | Польский | Refrigerated truck required |
| `src/lib/bl/logic.ts:102` | Nie pasuje: wymagana chłodnia, w profilu ${p.body} | Польский | Not compatible: refrigerated truck required. Your vehicle: ${p.body} |
| `src/lib/bl/logic.ts:104` | wymagany kuzow na palety | Польский | Pallet-compatible body required |
| `src/lib/bl/logic.ts:104` | Nie pasuje: na palety potrzebna plandeka, chłodnia lub platforma | Польский | Not compatible: pallets require a curtainsider, refrigerated truck or flatbed |
| `src/lib/bl/logic.ts:111` | Zlecenie zajęte przez innego kierowcę | Польский | Another driver has booked this load |
| `src/lib/bl/logic.ts:112` | Brak sieci: rezerwacja niedostępna | Польский | You’re offline. Booking is unavailable. |
| `src/lib/bl/logic.ts:113` | Najpierw zakończ lub anuluj bieżące zlecenie | Польский | Complete or cancel your current load first |
| `src/lib/bl/logic.ts:116` | Nie zdążysz na załadunek: przyjedziesz o ${hm(ch.arrive)}, załadunek o ${hm(o.pickupAt)} | Польский | You won’t reach pickup in time: arrival ${hm(ch.arrive)}, pickup ${hm(o.pickupAt)} |
| `src/lib/bl/logic.ts:117` | Nie zdążysz na główny załadunek: przyjedziesz o ${hm(ch.mainArrive)}, termin ${hm(ch.deadlineAt ?? 0)} | Польский | You won’t reach your main pickup in time: arrival ${hm(ch.mainArrive)}, deadline ${hm(ch.deadlineAt ?? 0)} |
| `src/lib/bl/state.ts:62` | 5 paź | Польский | 5 Oct |
| `src/lib/bl/state.ts:63` | 2 paź | Польский | 2 Oct |
| `src/lib/bl/state.ts:156` | Palety: części · 12 t | Польский | Pallets: parts · 12 t |
| `src/lib/bl/state.ts:171` | Zlecenie nie istnieje | Польский | Load not found |
| `src/lib/bl/state.ts:198` | dziś | Польский | today |
| `src/lib/bl/state.ts:216` | Anulowanie · ${o.from} → ${o.to} | Польский | Cancellation · ${o.from} → ${o.to} |
| `src/lib/bl/state.ts:216` | dziś | Польский | today |
| `src/screens/bl/Home.tsx:31` | Anulować zlecenie? | Польский | Cancel this load? |
| `src/screens/bl/Home.tsx:36` | Warunki anulowania | Польский | Cancellation terms |
| `src/screens/bl/Home.tsx:39` | Teraz bez kary · do ${tm(order.cancelFreeUntil)} | Польский | Free cancellation until ${tm(order.cancelFreeUntil)} |
| `src/screens/bl/Home.tsx:40` | Kara €${order.cancelPenalty} wg warunków zlecenia | Польский | Cancellation fee: €${order.cancelPenalty}, as stated in the load terms |
| `src/screens/bl/Home.tsx:49` | Zlecenie anulowane · kara €${penalty} | Польский | Load cancelled · €${penalty} fee |
| `src/screens/bl/Home.tsx:49` | Zlecenie anulowane · bez kary | Польский | Load cancelled · no fee |
| `src/screens/bl/Home.tsx:52` | Tak, anuluj zlecenie | Польский | Yes, cancel load |
| `src/screens/bl/Home.tsx:52` | Tak, anuluj · kara €${order.cancelPenalty} | Польский | Yes, cancel · €${order.cancelPenalty} fee |
| `src/screens/bl/Home.tsx:58` | Nie anuluj | Польский | Keep load |
| `src/screens/bl/Home.tsx:66` | Kursy | Польский | Trips |
| `src/screens/bl/Home.tsx:67` | Pt, 9 paź · godz. | Польский | Fri, 9 Oct · |
| `src/screens/bl/Home.tsx:67` |  · brak sieci | Польский |  · offline |
| `src/screens/bl/Home.tsx:77` | Brak aktywnego kursu | Польский | No active trip |
| `src/screens/bl/Home.tsx:78` | Dodaj kurs, a znajdziemy zlecenia po drodze po rozładunku. | Польский | Add a trip to find loads along your route after delivery. |
| `src/screens/bl/Home.tsx:85` | Dodaj kurs demo | Польский | Add demo trip |
| `src/screens/bl/Home.tsx:88` | Szukaj zleceń bez kursu | Польский | Find loads without a trip |
| `src/screens/bl/Home.tsx:98` | Rozładunek | Польский | Delivery |
| `src/screens/bl/Home.tsx:100` | Rozładowano | Польский | Unloaded |
| `src/screens/bl/Home.tsx:102` | Kurs # | Польский | Trip # |
| `src/screens/bl/Home.tsx:103` | · do | Польский | · by |
| `src/screens/bl/Home.tsx:116` | Zarezerwowano | Польский | Booked |
| `src/screens/bl/Home.tsx:118` | jedziesz na załadunek | Польский | On the way to pickup |
| `src/screens/bl/Home.tsx:118` | ładunek w aucie | Польский | Load on board |
| `src/screens/bl/Home.tsx:127` | km objazdu · netto € | Польский | km detour · net € |
| `src/screens/bl/Home.tsx:137` | Trasa | Польский | Route |
| `src/screens/bl/Home.tsx:144` | Bez sieci nie można anulować | Польский | You’re offline. Cancellation is unavailable. |
| `src/screens/bl/Home.tsx:145` | Anuluj | Польский | Cancel |
| `src/screens/bl/Home.tsx:154` | Spóźnienie: | Польский | Running late: |
| `src/screens/bl/Home.tsx:155` | min. Załadunek był o | Польский | min. Pickup was at |
| `src/screens/bl/Home.tsx:155` | . Zadzwoń do dyspozytora. Anulowanie teraz kosztuje € | Польский | . Call your dispatcher. Cancelling now costs € |
| `src/screens/bl/Home.tsx:161` | Zrealizowano | Польский | Completed |
| `src/screens/bl/Home.tsx:172` | Do nowych kursów | Польский | Find new trips |
| `src/screens/bl/Home.tsx:185` | Rozładunek potwierdzony | Польский | Delivery confirmed |
| `src/screens/bl/Home.tsx:187` | Rozładunek zakończony | Польский | Delivery complete |
| `src/screens/bl/Home.tsx:191` | Ustaw trasę z wyprzedzeniem | Польский | Plan your next route |
| `src/screens/bl/Home.tsx:202` | Szukaj zleceń po drodze | Польский | Find loads along your route |
| `src/screens/bl/Home.tsx:208` | Stan z | Польский | Updated at |
| `src/screens/bl/List.tsx:61` | Zlecenia po drodze | Польский | Loads along your route |
| `src/screens/bl/List.tsx:84` | km objazdu · € | Польский | km detour · € |
| `src/screens/bl/List.tsx:94` | Rozładunek ✓ | Польский | Delivery ✓ |
| `src/screens/bl/List.tsx:97` | Załadunek | Польский | Pickup |
| `src/screens/bl/List.tsx:100` | Główny załadunek | Польский | Main pickup |
| `src/screens/bl/List.tsx:105` | Bufor do terminu: | Польский | Time before deadline: |
| `src/screens/bl/List.tsx:109` | Warunki anulowania | Польский | Cancellation terms |
| `src/screens/bl/List.tsx:110` | Za darmo do | Польский | Free until |
| `src/screens/bl/List.tsx:111` | , potem € | Польский | , then € |
| `src/screens/bl/List.tsx:131` | Zarezerwuj | Польский | Book load |
| `src/screens/bl/List.tsx:140` | Zarezerwowano! | Польский | Load booked! |
| `src/screens/bl/List.tsx:141` | Zlecenie nr | Польский | Load no. |
| `src/screens/bl/List.tsx:145` | CMR zapisany offline — pokażemy przy załadunku | Польский | CMR saved offline — available at pickup |
| `src/screens/bl/List.tsx:148` | Załadunek | Польский | Pickup |
| `src/screens/bl/List.tsx:150` |  · bufor ${dur(check(bookedNow, ctx).buffer as number)} | Польский |  · time buffer ${dur(check(bookedNow, ctx).buffer as number)} |
| `src/screens/bl/List.tsx:152` | Objazd + | Польский | Detour + |
| `src/screens/bl/List.tsx:153` | km już w trasie | Польский | km included in your route |
| `src/screens/bl/List.tsx:160` | Otwórz trasę | Польский | View route |
| `src/screens/bl/List.tsx:170` | ${search.city} · za ${search.deadlineH} godz. | Польский | ${search.city} · in ${search.deadlineH} h |
| `src/screens/bl/List.tsx:170` | Wszystkie zlecenia po drodze, bez sprawdzania czasu | Польский | All loads along your route, without timing checks |
| `src/screens/bl/List.tsx:171` |  · bez kursu | Польский |  · no trip |
| `src/screens/bl/List.tsx:175` | Zlecenia z pamięci. Rezerwacja bez sieci niedostępna. | Польский | Showing saved loads. Go online to book. |
| `src/screens/bl/List.tsx:181` | Odchylenie od trasy: do | Польский | Detour limit: |
| `src/screens/bl/List.tsx:183` | Zmniejsz promień | Польский | Decrease radius |
| `src/screens/bl/List.tsx:186` | Zwiększ promień | Польский | Increase radius |
| `src/screens/bl/List.tsx:192` | Szukamy zleceń… | Польский | Finding loads… |
| `src/screens/bl/List.tsx:196` | Brak zleceń w promieniu | Польский | No loads within |
| `src/screens/bl/List.tsx:197` | Poszerz promień +25 km | Польский | Expand radius by 25 km |
| `src/screens/bl/List.tsx:200` | Zmień wyszukiwanie | Польский | Edit search |
| `src/screens/bl/List.tsx:210` | Nie możesz wziąć | Польский | Unavailable to you |
| `src/screens/bl/List.tsx:215` | Zajęte przez innych | Польский | Booked by other drivers |
| `src/screens/bl/List.tsx:245` | zajęte | Польский | Booked |
| `src/screens/bl/List.tsx:245` | nie zdążysz | Польский | Not enough time |
| `src/screens/bl/List.tsx:260` | netto € | Польский | net € |
| `src/screens/bl/List.tsx:284` | Odbiór | Польский | Pickup |
| `src/screens/bl/List.tsx:285` | · dostawa | Польский | · delivery |
| `src/screens/bl/List.tsx:290` | zleceń | Польский | loads |
| `src/screens/bl/List.tsx:296` | Szczegóły | Польский | Details |
| `src/screens/bl/Profile.tsx:34` | Profil zapisany. Lista zleceń jest już zaktualizowana. | Польский | Profile saved. Your load list is up to date. |
| `src/screens/bl/Profile.tsx:41` | Profil | Польский | Profile |
| `src/screens/bl/Profile.tsx:50` | Kierowca | Польский | Driver |
| `src/screens/bl/Profile.tsx:56` | Edytuj profil | Польский | Edit profile |
| `src/screens/bl/Profile.tsx:61` | W tym miesiącu | Польский | This month |
| `src/screens/bl/Profile.tsx:62` | Zlecenia po drodze | Польский | Loads along your route |
| `src/screens/bl/Profile.tsx:66` | Oczekuje na synchronizację: € | Польский | Pending sync: € |
| `src/screens/bl/Profile.tsx:74` | Historia | Польский | History |
| `src/screens/bl/Profile.tsx:76` | Historia wyczyszczona | Польский | History cleared |
| `src/screens/bl/Profile.tsx:76` | Wyczyść | Польский | Clear |
| `src/screens/bl/Profile.tsx:83` | Na razie pusto. Zarezerwuj pierwsze zlecenie po drodze — pojawi się tutaj. | Польский | No history yet. Book your first load along your route to see it here. |
| `src/screens/bl/Profile.tsx:95` | Demo (dla prezentacji) | Польский | Demo controls |
| `src/screens/bl/Profile.tsx:103` | Zsynchronizowano · +€${sum} | Польский | Synced · +€${sum} |
| `src/screens/bl/Profile.tsx:103` | Połączenie przywrócone | Польский | You’re back online |
| `src/screens/bl/Profile.tsx:106` | Tryb offline włączony | Польский | Offline mode enabled |
| `src/screens/bl/Profile.tsx:115` | Przywróć sieć | Польский | Go online |
| `src/screens/bl/Profile.tsx:115` | Wyłącz sieć | Польский | Go offline |
| `src/screens/bl/Profile.tsx:117` | Godzina: ${tm(s.clock + 60)} | Польский | Time: ${tm(s.clock + 60)} |
| `src/screens/bl/Profile.tsx:117` | +1 godz. (teraz | Польский | +1 h (now |
| `src/screens/bl/Profile.tsx:120` | Zresetuj demo | Польский | Reset demo |
| `src/screens/bl/Profile.tsx:124` | Zobacz rejestrację | Польский | View registration |
| `src/screens/bl/Profile.tsx:148` | czeka na synchronizację | Польский | Pending sync |
| `src/screens/bl/Profile.tsx:157` | Własny samochód | Польский | Owner-operator |
| `src/screens/bl/Profile.tsx:157` | Pracuję dla przewoźnika | Польский | Company driver |
| `src/screens/bl/Profile.tsx:158` | Plandeka | Польский | Curtainsider |
| `src/screens/bl/Profile.tsx:158` | Chłodnia | Польский | Refrigerated truck |
| `src/screens/bl/Profile.tsx:158` | Kontener | Польский | Container |
| `src/screens/bl/Profile.tsx:158` | Platforma | Польский | Flatbed |
| `src/screens/bl/Profile.tsx:170` | Edytuj profil | Польский | Edit profile |
| `src/screens/bl/Profile.tsx:171` | Zmiany od razu wpływają na listę zleceń. | Польский | Changes apply to your load list immediately. |
| `src/screens/bl/Profile.tsx:173` | Jak pracujesz | Польский | How do you work? |
| `src/screens/bl/Profile.tsx:174` | Jak pracujesz | Польский | How do you work? |
| `src/screens/bl/Profile.tsx:191` | Typ nadwozia | Польский | Body type |
| `src/screens/bl/Profile.tsx:192` | Typ nadwozia | Польский | Body type |
| `src/screens/bl/Profile.tsx:211` | Mam uprawnienia ADR | Польский | I have ADR certification |
| `src/screens/bl/Profile.tsx:212` | Bez nich nie wezmiesz towarów niebezpiecznych | Польский | ADR certification is required to carry dangerous goods |
| `src/screens/bl/Profile.tsx:218` | Bieżące zlecenie wymaga innego profilu ( | Польский | Your current load needs a different vehicle profile ( |
| `src/screens/bl/Profile.tsx:219` | ). Najpierw zakończ albo anuluj je na ekranie Kursy. | Польский | ). Complete or cancel it in Trips first. |
| `src/screens/bl/Profile.tsx:235` | Zapisz profil | Польский | Save profile |
| `src/screens/bl/Route.tsx:24` | Załadunek | Польский | Pickup |
| `src/screens/bl/Route.tsx:25` | Rozładunek | Польский | Delivery |
| `src/screens/bl/Route.tsx:26` | Główny załadunek | Польский | Main pickup |
| `src/screens/bl/Route.tsx:26` | Poznań${ctx.deadlineH != null && ch.deadlineAt ? ` · do ${tm(ch.deadlineAt)}` : ''} | Польский | Poznań${ctx.deadlineH != null && ch.deadlineAt ? ` · by ${tm(ch.deadlineAt)}` : ''} |
| `src/screens/bl/Route.tsx:26` |  · do ${tm(ch.deadlineAt)} | Польский |  · by ${tm(ch.deadlineAt)} |
| `src/screens/bl/Route.tsx:30` | Trasa | Польский | Route |
| `src/screens/bl/Route.tsx:33` | Zlecenie nr | Польский | Load no. |
| `src/screens/bl/Route.tsx:71` | Spóźnienie: | Польский | Running late: |
| `src/screens/bl/Route.tsx:72` | min. Załadunek był o | Польский | min. Pickup was at |
| `src/screens/bl/Route.tsx:77` | Status zapisany lokalnie. Wyślemy go po połączeniu z siecią. | Польский | Status saved on your device. We’ll sync it when you’re online. |
| `src/screens/bl/Route.tsx:83` | Najpierw potwierdź rozładunek na ekranie Kursy. Załadunek odblokuje się po nim. | Польский | Confirm delivery in Trips first to unlock pickup. |
| `src/screens/bl/Route.tsx:88` | Ładunek w aucie. CMR zapisany offline. | Польский | Load on board. CMR saved offline. |
| `src/screens/bl/Route.tsx:93` | Zlecenie zrealizowane: +€ | Польский | Load completed: +€ |
| `src/screens/bl/Route.tsx:94` | po połączeniu | Польский | once you’re online |
| `src/screens/bl/Route.tsx:94` | zaksięgowano | Польский | credited |
| `src/screens/bl/Route.tsx:94` | . Netto € | Польский | . Net € |
| `src/screens/bl/Route.tsx:109` | Potwierdź załadunek | Польский | Confirm pickup |
| `src/screens/bl/Route.tsx:114` | Potwierdź rozładunek | Польский | Confirm delivery |
| `src/screens/bl/Route.tsx:119` | Do kursów | Польский | Back to trips |
| `src/screens/bl/Route.tsx:125` | Objazd + | Польский | Detour + |
| `src/screens/bl/Route.tsx:126` |  · bufor ${dur(ch.buffer)} | Польский |  · time buffer ${dur(ch.buffer)} |
| `src/screens/bl/Route.tsx:126` | · załadunek | Польский | · pickup |
| `src/screens/bl/Route.tsx:154` | Objazd + | Польский | Detour + |
| `src/screens/bl/Route.tsx:155` |  · bufor ${dur(buffer)} | Польский |  · time buffer ${dur(buffer)} |
| `src/screens/bl/Search.tsx:24` | ${s.trip.to} · rozładowano | Польский | ${s.trip.to} · unloaded |
| `src/screens/bl/Search.tsx:25` | ${s.trip.to} · po rozładunku o ${String(Math.floor(s.trip.unloadBy / 60)).padStart(2, '0')}:00 | Польский | ${s.trip.to} · after delivery at ${String(Math.floor(s.trip.unloadBy / 60)).padStart(2, '0')}:00 |
| `src/screens/bl/Search.tsx:31` | Szukaj | Польский | Search |
| `src/screens/bl/Search.tsx:35` | Start wyszukiwania | Польский | Search starting point |
| `src/screens/bl/Search.tsx:40` | Brak aktywnego kursu | Польский | No active trip |
| `src/screens/bl/Search.tsx:41` | Bez kursu nie sprawdzimy, czy zdążysz na załadunek. | Польский | Add a trip so we can check whether you’ll reach pickup in time. |
| `src/screens/bl/Search.tsx:46` | Miasto następnego załadunku | Польский | Next pickup city |
| `src/screens/bl/Search.tsx:53` | Na przykład Poznań | Польский | For example, Poznań |
| `src/screens/bl/Search.tsx:58` | Na razie zlecenia tylko w kierunku | Польский | Demo loads are currently available only towards |
| `src/screens/bl/Search.tsx:59` | . Wpisz „ | Польский | . Enter “ |
| `src/screens/bl/Search.tsx:65` | Termin głównego załadunku | Польский | Main pickup deadline |
| `src/screens/bl/Search.tsx:66` | Termin głównego załadunku | Польский | Main pickup deadline |
| `src/screens/bl/Search.tsx:81` | za | Польский | in |
| `src/screens/bl/Search.tsx:82` | godz. | Польский | h |
| `src/screens/bl/Search.tsx:87` | Zlecenia, na które nie zdążysz, zobaczysz z wyjaśnieniem, a nie zniknie. | Польский | Loads you can’t reach in time stay visible with an explanation. |
| `src/screens/bl/Search.tsx:94` | Najpierw zakończ albo anuluj bieżące zlecenie na ekranie Kursy. Potem wyszukiwanie znów będzie dostępne. | Польский | Complete or cancel your current load in Trips to search again. |
| `src/screens/bl/Search.tsx:110` | Znajdź zlecenia po drodze | Польский | Find loads along your route |
| `src/screens/bl/Search.tsx:121` | Pokaż wszystko po drodze, bez sprawdzania czasu | Польский | Show all loads along the route without timing checks |
| `src/screens/bl/Start.tsx:14` | Własny samochód | Польский | Owner-operator |
| `src/screens/bl/Start.tsx:14` | Jestem właścicielem lub prowadzę jednoosobową działalność | Польский | I own my vehicle or run my own business |
| `src/screens/bl/Start.tsx:15` | Pracuję dla przewoźnika | Польский | Company driver |
| `src/screens/bl/Start.tsx:15` | Firma prowadzi, ja jestem kierowcą | Польский | The company manages the work; I drive |
| `src/screens/bl/Start.tsx:17` | Plandeka | Польский | Curtainsider |
| `src/screens/bl/Start.tsx:17` | Chłodnia | Польский | Refrigerated truck |
| `src/screens/bl/Start.tsx:17` | Kontener | Польский | Container |
| `src/screens/bl/Start.tsx:17` | Platforma | Польский | Flatbed |
| `src/screens/bl/Start.tsx:24` | Nie jedź pusto | Польский | Avoid empty journeys |
| `src/screens/bl/Start.tsx:24` | Po rozładunku znajdziemy zlecenie po drodze — zarobisz w drodze powrotnej. | Польский | Find a load along your route after delivery and earn on the return trip. |
| `src/screens/bl/Start.tsx:25` | Opłacalność widać od razu | Польский | See what you’ll earn |
| `src/screens/bl/Start.tsx:25` | Objazd, cena za kilometr i kwota po opłatach drogowych — na każdej karcie. | Польский | See the detour, rate per kilometre and earnings after tolls on every card. |
| `src/screens/bl/Start.tsx:26` | Bezpiecznie | Польский | Stay protected |
| `src/screens/bl/Start.tsx:26` | Sprawdzeni zleceniodawcy i CMR w telefonie. Bez sieci aplikacja działa: statusy wyślą się po połączeniu. | Польский | Verified shippers and CMR on your phone. Status updates are saved offline and synced when you reconnect. |
| `src/screens/bl/Start.tsx:67` | Wpisz 4 cyfry kodu. | Польский | Enter the 4-digit code. |
| `src/screens/bl/Start.tsx:81` | Za dużo nieudanych prób. | Польский | Too many unsuccessful attempts. |
| `src/screens/bl/Start.tsx:84` | Nieprawidłowy kod. Sprawdź SMS i spróbuj ponownie. Pozostało prób: ${left}. | Польский | Incorrect code. Check your SMS and try again. Attempts left: ${left}. |
| `src/screens/bl/Start.tsx:91` | Wysłaliśmy nowy kod. | Польский | We’ve sent a new code. |
| `src/screens/bl/Start.tsx:103` | Podaj numer telefonu | Польский | Enter your phone number |
| `src/screens/bl/Start.tsx:103` | Wyślemy kod potwierdzający. W demo SMS nie jest wysyłany. | Польский | We’ll send a verification code. No SMS is sent in this demo. |
| `src/screens/bl/Start.tsx:109` | Numer telefonu | Польский | Phone number |
| `src/screens/bl/Start.tsx:115` | Wyślij kod | Польский | Send code |
| `src/screens/bl/Start.tsx:122` | Wpisz kod | Польский | Enter code |
| `src/screens/bl/Start.tsx:122` | Wysłaliśmy 4-cyfrowy kod na ${phone &#124;&#124; 'Twój numer'}. | Польский | We’ve sent a 4-digit code to ${phone &#124;&#124; 'your number'}. |
| `src/screens/bl/Start.tsx:122` | Twój numer | Польский | your number |
| `src/screens/bl/Start.tsx:127` | Kod z SMS | Польский | SMS code |
| `src/screens/bl/Start.tsx:139` | Za dużo nieudanych prób. Spróbuj ponownie za ${lockLeft} s. | Польский | Too many unsuccessful attempts. Try again in ${lockLeft} s. |
| `src/screens/bl/Start.tsx:147` | Potwierdź | Польский | Confirm |
| `src/screens/bl/Start.tsx:156` | Wyślij kod ponownie za 0:${String(resendLeft).padStart(2, '0')} | Польский | Resend code in 0:${String(resendLeft).padStart(2, '0')} |
| `src/screens/bl/Start.tsx:156` | Wyślij kod ponownie | Польский | Resend code |
| `src/screens/bl/Start.tsx:158` | Zmień numer | Польский | Change number |
| `src/screens/bl/Start.tsx:161` | Demo: kod to | Польский | Demo code: |
| `src/screens/bl/Start.tsx:166` | Jak pracujesz? | Польский | How do you work? |
| `src/screens/bl/Start.tsx:166` | To wpiszemy w profilu i pod to dobierzemy zlecenia. | Польский | We’ll save this in your profile to find suitable loads. |
| `src/screens/bl/Start.tsx:167` | Rola | Польский | Role |
| `src/screens/bl/Start.tsx:188` | Typ nadwozia | Польский | Body type |
| `src/screens/bl/Start.tsx:189` | Typ nadwozia | Польский | Body type |
| `src/screens/bl/Start.tsx:211` | Mam uprawnienia ADR | Польский | I have ADR certification |
| `src/screens/bl/Start.tsx:212` | Bez nich nie wezmiesz towarów niebezpiecznych | Польский | ADR certification is required to carry dangerous goods |
| `src/screens/bl/Start.tsx:220` | Własny samochód | Польский | Owner-operator |
| `src/screens/bl/Start.tsx:223` | Zacznij pracę | Польский | Get started |
| `src/screens/bl/Start.tsx:244` | Wstecz | Польский | Back |
| `src/screens/bl/Start.tsx:253` | Dalej | Польский | Next |
| `src/screens/bl/Start.tsx:253` | Zacznij pracę | Польский | Get started |
| `src/screens/bl/Start.tsx:267` | Krok ${Math.min(n, 3)} z 3 | Польский | Step ${Math.min(n, 3)} of 3 |
| `src/screens/v2/ApplicationTracker.tsx:45` | Клиент выбрал другого перевозчика | Русский | The customer chose another carrier. |
| `src/screens/v2/ApplicationTracker.tsx:128` | Посмотреть похожие грузы | Русский | View similar loads |
| `src/screens/v2/ApplicationTracker.tsx:129` | Оспорить решение | Русский | Appeal decision |
| `src/screens/v2/ApplicationTracker.tsx:129` | Демо: оспаривание решения пока не подключено. | Русский | Appeals are not connected in this demo. |

## 2. Приложение: English и нейтральные значения

| Файл | Строка | Текущий язык | Предложенный English |
|---|---|---|---|
| `src/App.tsx:37` | Trips | English | Trips |
| `src/App.tsx:38` | Account | English | Account |
| `src/App.tsx:52` | NEW · Loads — map-first home (apply in one tap) | English | NEW · Loads — map-first home (apply in one tap) |
| `src/App.tsx:53` | Loads — first search (setup) | English | Loads — first search (setup) |
| `src/App.tsx:54` | Application status tracker | English | Application status tracker |
| `src/App.tsx:55` | Confirmed trip details | English | Confirmed trip details |
| `src/App.tsx:56` | Backloads | English | Backloads |
| `src/App.tsx:60` | Pharos Driver — prototype | English | Pharos Driver — prototype |
| `src/App.tsx:61` | Driver flow: loads list/map → quick apply → application status → back to loads. | English | Driver flow: loads list/map → quick apply → application status → back to loads. |
| `src/components/ApplicationProgress.tsx:38` | Application sent | English | Application sent |
| `src/components/ApplicationProgress.tsx:39` | Dispatcher approval | English | Dispatcher approval |
| `src/components/ApplicationProgress.tsx:40` | Customer confirmation | English | Customer confirmation |
| `src/components/ApplicationProgress.tsx:41` | Trip assigned | English | Trip assigned |
| `src/components/ApplicationProgress.tsx:44` | Application sent | English | Application sent |
| `src/components/ApplicationProgress.tsx:45` | Dispatcher approval | English | Dispatcher approval |
| `src/components/ApplicationProgress.tsx:46` | Customer confirmation | English | Customer confirmation |
| `src/components/ApplicationProgress.tsx:47` | Trip assigned | English | Trip assigned |
| `src/components/ApplicationProgress.tsx:50` | Application sent | English | Application sent |
| `src/components/ApplicationProgress.tsx:51` | Dispatcher approval | English | Dispatcher approval |
| `src/components/ApplicationProgress.tsx:52` | Customer confirmation | English | Customer confirmation |
| `src/components/ApplicationProgress.tsx:53` | Trip assigned | English | Trip assigned |
| `src/components/ApplicationProgress.tsx:56` | Application sent | English | Application sent |
| `src/components/ApplicationProgress.tsx:57` | Customer confirmation | English | Customer confirmation |
| `src/components/ApplicationProgress.tsx:58` | Trip assigned | English | Trip assigned |
| `src/components/ApplicationProgress.tsx:61` | Application sent | English | Application sent |
| `src/components/ApplicationProgress.tsx:62` | Customer confirmation | English | Customer confirmation |
| `src/components/ApplicationProgress.tsx:63` | Trip assigned | English | Trip assigned |
| `src/components/ApplicationProgress.tsx:69` | Application progress | English | Application progress |
| `src/components/ApproachMap.tsx:24` | To pickup | English | To pickup |
| `src/components/ApproachMap.tsx:25` | 18 km · about 25 min | English | 18 km · about 25 min |
| `src/components/ApproachMap.tsx:26` | You · demo | English | You · demo |
| `src/components/ApproachMap.tsx:27` | Pickup · €360 | English | Pickup · €360 |
| `src/components/ApproachMap.tsx:28` | Approach to selected load | English | Approach to selected load |
| `src/components/BottomSheet.tsx:72` | Vehicle matching · Curtainsider · 20 t · 33 pallets | English | Vehicle matching · Curtainsider · 20 t · 33 pallets |
| `src/components/BottomSheet.tsx:73` | Route search · vehicle matching off | English | Route search · vehicle matching off |
| `src/components/BottomSheet.tsx:83` | Choose pickup and destination — the button activates when both are set. | English | Choose pickup and destination — the button activates when both are set. |
| `src/components/ChatCargoContext.tsx:28` | Today, 14:00–15:00 · €360  › | English | Today, 14:00–15:00 · €360  › |
| `src/components/ChatComposer.tsx:49` | Message… | English | Message… |
| `src/components/ChatComposer.tsx:50` | Send | English | Send |
| `src/components/ChatRateOffer.tsx:52` | NordCargo · 10:34 | English | NordCargo · 10:34 |
| `src/components/ChatRateOffer.tsx:53` | Accepted · 10:35 | English | Accepted · 10:35 |
| `src/components/ChatRateOffer.tsx:54` | Accept €360 | English | Accept €360 |
| `src/components/ChatRateOffer.tsx:55` | Offer a different rate | English | Offer a different rate |
| `src/components/ChatRateOffer.tsx:76` | Rate unchanged | English | Rate unchanged |
| `src/components/ChatRateOffer.tsx:76` | Rate agreed | English | Rate agreed |
| `src/components/DemoPanel.tsx:12` | Demo · application status: | English | Demo · application status: |
| `src/components/DemoPanel.tsx:14` | → sent | English | → sent |
| `src/components/DemoPanel.tsx:15` | → dispatcher approved | English | → dispatcher approved |
| `src/components/DemoPanel.tsx:16` | → customer confirmed | English | → customer confirmed |
| `src/components/DemoPanel.tsx:17` | ⟲ reset | English | ⟲ reset |
| `src/components/DemoPanel.tsx:18` | clear storage | English | clear storage |
| `src/components/DriverProfile.tsx:46` | Driver | English | Driver |
| `src/components/DriverProfile.tsx:47` | Alexey K. | Имя / бренд | Alexey K. |
| `src/components/DriverProfile.tsx:48` | Northway Freight · driver | English | Northway Freight · driver |
| `src/components/DriverProfile.tsx:91` | Verified | English | Verified |
| `src/components/DrivingLicencePreview.tsx:39` | Driving licence | English | Driving licence |
| `src/components/DrivingLicencePreview.tsx:40` | Tap the photo to replace it | English | Tap the photo to replace it |
| `src/components/DrivingLicencePreview.tsx:66` | DRIVING LICENCE | English | DRIVING LICENCE |
| `src/components/DrivingLicencePreview.tsx:77` | SAMPLE | English | SAMPLE |
| `src/components/FiltersButton.tsx:37` | Filters | English | Filters |
| `src/components/Input.tsx:44` | Enter a city | English | Enter a city |
| `src/components/Input.tsx:84` | * | Нейтральный | * |
| `src/components/LoadCard.tsx:119` | On your route | English | On your route |
| `src/components/LoadCard.tsx:120` | Application under review | English | Application under review |
| `src/components/LoadCard.tsx:121` | Assigned to you | English | Assigned to you |
| `src/components/LoadCard.tsx:126` | Review application | English | Review application |
| `src/components/LoadCard.tsx:128` | View trip | English | View trip |
| `src/components/LoadCard.tsx:132` | Awaiting review | English | Awaiting review |
| `src/components/LoadCard.tsx:133` | A dispatcher is checking the vehicle and schedule. Nothing is needed from you right now. | English | A dispatcher is checking the vehicle and schedule. Nothing is needed from you right now. |
| `src/components/LoadCard.tsx:247` | Transport | English | Transport |
| `src/components/LoadCard.tsx:260` | Customer | English | Customer |
| `src/components/LoadCard.tsx:278` | Today, 14:00–15:00 | English | Today, 14:00–15:00 |
| `src/components/LoadCard.tsx:281` | Today, until 19:00 | English | Today, until 19:00 |
| `src/components/LoadCard.tsx:284` | Paid within 7 days | English | Paid within 7 days |
| `src/components/LoadCard.tsx:285` | €3.24/km · 111 km loaded | English | €3.24/km · 111 km loaded |
| `src/components/LoadCard.tsx:286` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/LoadCard.tsx:287` | 18 km to pickup | English | 18 km to pickup |
| `src/components/LoadCard.tsx:288` | NordCargo | Имя / бренд | NordCargo |
| `src/components/LoadCard.tsx:289` | Verified customer | English | Verified customer |
| `src/components/LoadCard.tsx:290` | 4.8 · 126 reviews | English | 4.8 · 126 reviews |
| `src/components/LoadCard.tsx:293` | Chat with NordCargo | English | Chat with NordCargo |
| `src/components/LoadCard.tsx:399` | Open full map | English | Open full map |
| `src/components/LoadCard.tsx:414` | Show map | English | Show map |
| `src/components/LocationSuggestions.tsx:53` | City not found | English | City not found |
| `src/components/LocationSuggestions.tsx:53` | Check the spelling or enter the nearest city. | English | Check the spelling or enter the nearest city. |
| `src/components/LocationSuggestions.tsx:54` | Could not load cities | English | Could not load cities |
| `src/components/LocationSuggestions.tsx:54` | Check your connection and try again. Your text has been saved. | English | Check your connection and try again. Your text has been saved. |
| `src/components/LocationSuggestions.tsx:87` | France | English | France |
| `src/components/LocationSuggestions.tsx:88` | France | English | France |
| `src/components/LocationSuggestions.tsx:90` | Choose a city | English | Choose a city |
| `src/components/LocationSuggestions.tsx:93` | Searching cities… | English | Searching cities… |
| `src/components/LocationSuggestions.tsx:134` | Try again | English | Try again |
| `src/components/MessageBubble.tsx:60` | Participant | English | Participant |
| `src/components/MessageBubble.tsx:61` | Message text | English | Message text |
| `src/components/MobileHeader.tsx:53` | Back | English | Back |
| `src/components/OfferCard.tsx:73` | €3.24/km loaded | English | €3.24/km loaded |
| `src/components/OfferCard.tsx:74` | 111 km loaded | English | 111 km loaded |
| `src/components/OfferCard.tsx:76` | France | English | France |
| `src/components/OfferCard.tsx:77` | Belgium | English | Belgium |
| `src/components/OfferCard.tsx:78` | Today · 14:00–15:00 | English | Today · 14:00–15:00 |
| `src/components/OfferCard.tsx:79` | Decide in 1 h 20 min | English | Decide in 1 h 20 min |
| `src/components/OfferCard.tsx:80` | 18 km to pickup · about 25 min | English | 18 km to pickup · about 25 min |
| `src/components/OfferCard.tsx:81` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/OfferCard.tsx:84` | NordCargo · 4.8 ★ · paid in 7 days | English | NordCargo · 4.8 ★ · paid in 7 days |
| `src/components/OfferCard.tsx:176` | Awaiting dispatcher | English | Awaiting dispatcher |
| `src/components/OfferCard.tsx:179` | View application | English | View application |
| `src/components/OfferPreview.tsx:63` | France | English | France |
| `src/components/OfferPreview.tsx:64` | Belgium | English | Belgium |
| `src/components/OfferPreview.tsx:66` | €3.24/km loaded | English | €3.24/km loaded |
| `src/components/OfferPreview.tsx:67` | Today · 14:00–15:00 | English | Today · 14:00–15:00 |
| `src/components/OfferPreview.tsx:68` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/OfferPreview.tsx:69` | 18 km to pickup · arrival ≈ 25 min | English | 18 km to pickup · arrival ≈ 25 min |
| `src/components/OfferPreview.tsx:70` | NordCargo · 4.8 ★ · paid in 7 days | English | NordCargo · 4.8 ★ · paid in 7 days |
| `src/components/OfferPreview.tsx:75` | Send application | English | Send application |
| `src/components/OfferPreview.tsx:84` | Load already assigned | English | Load already assigned |
| `src/components/OfferPreview.tsx:84` | On your route | English | On your route |
| `src/components/OfferRoute.tsx:55` | Route | English | Route |
| `src/components/OfferRoute.tsx:57` | View map → | English | View map → |
| `src/components/OfferTerms.tsx:47` | Chat | English | Chat |
| `src/components/OfferTerms.tsx:60` | Rate | English | Rate |
| `src/components/OfferTerms.tsx:71` | Cargo | English | Cargo |
| `src/components/PaymentSummary.tsx:43` | Expected | English | Expected |
| `src/components/PaymentSummary.tsx:44` | Early payment available | English | Early payment available |
| `src/components/PaymentSummary.tsx:45` | Received | English | Received |
| `src/components/PaymentSummary.tsx:50` | To receive | English | To receive |
| `src/components/PaymentSummary.tsx:51` | To receive | English | To receive |
| `src/components/PaymentSummary.tsx:52` | Received | English | Received |
| `src/components/PaymentSummary.tsx:57` | Payment is expected under the order terms. Term — 7 days. | English | Payment is expected under the order terms. Term — 7 days. |
| `src/components/PaymentSummary.tsx:58` | You can request payment earlier. Check the terms and fee before requesting. | English | You can request payment earlier. Check the terms and fee before requesting. |
| `src/components/PaymentSummary.tsx:59` | Payment for the order has been received. | English | Payment for the order has been received. |
| `src/components/PaymentSummary.tsx:65` | Paid within 7 days | English | Paid within 7 days |
| `src/components/PaymentSummary.tsx:83` | Payment | English | Payment |
| `src/components/PaymentSummary.tsx:94` | Payment terms | English | Payment terms |
| `src/components/ProgressStep.tsx:53` | Done | English | Done |
| `src/components/ProgressStep.tsx:53` | Current | English | Current |
| `src/components/ProgressStep.tsx:53` | Next | English | Next |
| `src/components/RateOfferCard.tsx:45` | Rate offer | English | Rate offer |
| `src/components/RateOfferCard.tsx:47` | Terms are negotiable | English | Terms are negotiable |
| `src/components/RouteCard.tsx:43` | Today, 14:00–15:00 | English | Today, 14:00–15:00 |
| `src/components/RouteCard.tsx:44` | Today, by 19:00 | English | Today, by 19:00 |
| `src/components/RouteCard.tsx:51` | France | English | France |
| `src/components/RouteCard.tsx:61` | Exact address received | English | Exact address received |
| `src/components/RouteCard.tsx:61` | Exact address expected | English | Exact address expected |
| `src/components/RouteCard.tsx:68` | Navigate | English | Navigate |
| `src/components/RouteCard.tsx:76` | Route | English | Route |
| `src/components/RouteFields.tsx:72` | From | English | From |
| `src/components/RouteFields.tsx:73` | To | English | To |
| `src/components/RouteMap.tsx:59` | Loads on route | English | Loads on route |
| `src/components/RouteMap.tsx:61` | NordCargo · €360 | English | NordCargo · €360 |
| `src/components/RouteMap.tsx:103` | · selected load | English | · selected load |
| `src/components/RouteSearch.tsx:71` | Current location | English | Current location |
| `src/components/RouteSearch.tsx:72` | Direction | English | Direction |
| `src/components/RouteSearch.tsx:75` | Filters | English | Filters |
| `src/components/RouteSearch.tsx:75` | Curtainsider | English | Curtainsider |
| `src/components/RouteSearch.tsx:75` | Today | English | Today |
| `src/components/RouteSearch.tsx:75` | up to 12.4 t | English | up to 12.4 t |
| `src/components/RouteSearch.tsx:75` | up to 18 pallets | English | up to 18 pallets |
| `src/components/RouteSearch.tsx:124` | Find loads | English | Find loads |
| `src/components/RouteSearch.tsx:134` | Choose load search criteria | English | Choose load search criteria |
| `src/components/RouteSearch.tsx:139` | Body type | English | Body type |
| `src/components/RouteSearch.tsx:139` | Any | English | Any |
| `src/components/RouteSearch.tsx:140` | Pickup date | English | Pickup date |
| `src/components/RouteSearch.tsx:140` | Any date | English | Any date |
| `src/components/RouteSearch.tsx:141` | Max. cargo weight, t | English | Max. cargo weight, t |
| `src/components/RouteSearch.tsx:141` | Not set | English | Not set |
| `src/components/RouteSearch.tsx:142` | Max. pallets | English | Max. pallets |
| `src/components/RouteSearch.tsx:142` | Not set | English | Not set |
| `src/components/RouteSearch.tsx:147` | Min. rate, € | English | Min. rate, € |
| `src/components/RouteSearch.tsx:147` | Not set | English | Not set |
| `src/components/RouteSearch.tsx:148` | Max. rate, € | English | Max. rate, € |
| `src/components/RouteSearch.tsx:148` | Not set | English | Not set |
| `src/components/RouteSearch.tsx:151` | Special conditions | English | Special conditions |
| `src/components/RouteSearch.tsx:153` | ADR · dangerous goods | English | ADR · dangerous goods |
| `src/components/RouteSearch.tsx:154` | LTL · part loads | English | LTL · part loads |
| `src/components/RouteSearch.tsx:185` | Hide filters | English | Hide filters |
| `src/components/RouteSearch.tsx:185` | Filters | English | Filters |
| `src/components/RouteSearch.tsx:200` | Reset | English | Reset |
| `src/components/RouteSearch.tsx:212` | 2 loads | English | 2 loads |
| `src/components/RouteSummary.tsx:83` | From | English | From |
| `src/components/RouteSummary.tsx:84` | To | English | To |
| `src/components/RouteSummary.tsx:92` | Edit | English | Edit |
| `src/components/RouteSummary.tsx:96` | Edit | English | Edit |
| `src/components/RouteSummaryWeb.tsx:21` | 30 Sep · pickup 14:00–15:00 | English | 30 Sep · pickup 14:00–15:00 |
| `src/components/RouteSummaryWeb.tsx:22` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/RouteSummaryWeb.tsx:24` | 111 km loaded | English | 111 km loaded |
| `src/components/Sidebar.tsx:69` | Load search | English | Load search |
| `src/components/Sidebar.tsx:70` | My applications | English | My applications |
| `src/components/Sidebar.tsx:71` | My orders | English | My orders |
| `src/components/Sidebar.tsx:72` | Saved | English | Saved |
| `src/components/Sidebar.tsx:73` | Profile and documents | English | Profile and documents |
| `src/components/Sidebar.tsx:76` | Overview | English | Overview |
| `src/components/Sidebar.tsx:77` | Applications | English | Applications |
| `src/components/Sidebar.tsx:78` | Orders | English | Orders |
| `src/components/Sidebar.tsx:79` | Vehicles and drivers | English | Vehicles and drivers |
| `src/components/Sidebar.tsx:80` | Customers | English | Customers |
| `src/components/Sidebar.tsx:83` | Overview | English | Overview |
| `src/components/Sidebar.tsx:84` | Orders | English | Orders |
| `src/components/Sidebar.tsx:85` | Fleet | English | Fleet |
| `src/components/Sidebar.tsx:86` | Customers | English | Customers |
| `src/components/Sidebar.tsx:87` | Reports | English | Reports |
| `src/components/Sidebar.tsx:90` | Overview | English | Overview |
| `src/components/Sidebar.tsx:91` | Users | English | Users |
| `src/components/Sidebar.tsx:92` | Access rights | English | Access rights |
| `src/components/Sidebar.tsx:107` | Alexey K. | Имя / бренд | Alexey K. |
| `src/components/Sidebar.tsx:107` | Driver | English | Driver |
| `src/components/Sidebar.tsx:108` | Lena M. | Имя / бренд | Lena M. |
| `src/components/Sidebar.tsx:108` | Dispatcher | English | Dispatcher |
| `src/components/Sidebar.tsx:109` | Nikita P. | Имя / бренд | Nikita P. |
| `src/components/Sidebar.tsx:109` | Fleet manager | English | Fleet manager |
| `src/components/Sidebar.tsx:110` | Elena S. | Имя / бренд | Elena S. |
| `src/components/Sidebar.tsx:110` | Administrator | English | Administrator |
| `src/components/Sidebar.tsx:141` | Northway Freight | Имя / бренд | Northway Freight |
| `src/components/Sidebar.tsx:143` | Organisation | English | Organisation |
| `src/components/Sidebar.tsx:251` | Northway Freight | Имя / бренд | Northway Freight |
| `src/components/Sidebar.tsx:272` | Pharos | Имя / бренд | Pharos |
| `src/components/Sidebar.tsx:278` | WORKSPACE | English | WORKSPACE |
| `src/components/Sidebar.tsx:298` | Help | English | Help |
| `src/components/SortBy.tsx:14` | Highest €/km | English | Highest €/km |
| `src/components/SortBy.tsx:14` | Highest rate | English | Highest rate |
| `src/components/SortBy.tsx:14` | Closest pickup | English | Closest pickup |
| `src/components/SortBy.tsx:14` | Soonest deadline | English | Soonest deadline |
| `src/components/SuggestionCard.tsx:16` | France | English | France |
| `src/components/TripChecklist.tsx:26` | Trip data | English | Trip data |
| `src/components/TripChecklist.tsx:28` | Pickup address | English | Pickup address |
| `src/components/TripChecklist.tsx:29` | Delivery address | English | Delivery address |
| `src/components/TripChecklist.tsx:30` | Pickup contact | English | Pickup contact |
| `src/components/TripChecklist.tsx:31` | Required documents | English | Required documents |
| `src/components/TripChecklist.tsx:45` | Waiting | English | Waiting |
| `src/components/TripPreparation.tsx:33` | Awaiting trip details · 0 of 4 | English | Awaiting trip details · 0 of 4 |
| `src/components/TripPreparation.tsx:34` | Request the missing trip details from your dispatcher. | English | Request the missing trip details from your dispatcher. |
| `src/components/TripPreparation.tsx:38` | Request sent · awaiting dispatcher | English | Request sent · awaiting dispatcher |
| `src/components/TripPreparation.tsx:39` | Your dispatcher will update the trip data. | English | Your dispatcher will update the trip data. |
| `src/components/TripPreparation.tsx:43` | Trip details complete · 4 of 4 | English | Trip details complete · 4 of 4 |
| `src/components/TripPreparation.tsx:44` | You can confirm your readiness to depart. | English | You can confirm your readiness to depart. |
| `src/components/TripPreparation.tsx:48` | Readiness confirmed | English | Readiness confirmed |
| `src/components/TripPreparation.tsx:49` | Your dispatcher can see that you are ready. | English | Your dispatcher can see that you are ready. |
| `src/components/TripSteps.tsx:45` | Arrived at pickup | English | Arrived at pickup |
| `src/components/TripSteps.tsx:46` | Loading complete | English | Loading complete |
| `src/components/TripSteps.tsx:47` | Departed | English | Departed |
| `src/components/TripSteps.tsx:48` | Arrived at delivery | English | Arrived at delivery |
| `src/components/TripSteps.tsx:49` | Delivery complete | English | Delivery complete |
| `src/components/TripSteps.tsx:50` | Proof of delivery sent | English | Proof of delivery sent |
| `src/components/TripSteps.tsx:66` | Trip progress | English | Trip progress |
| `src/components/UploadField.tsx:63` | Photograph your document | English | Photograph your document |
| `src/components/UploadField.tsx:63` | Show all edges and keep the text clear | English | Show all edges and keep the text clear |
| `src/components/UploadField.tsx:64` | Document photo | English | Document photo |
| `src/components/UploadField.tsx:64` | Tap the photo to replace it | English | Tap the photo to replace it |
| `src/components/UploadField.tsx:65` | Document photo | English | Document photo |
| `src/components/UploadField.tsx:65` | Photo unreadable · take another | English | Photo unreadable · take another |
| `src/components/UploadField.tsx:66` | Document photo | English | Document photo |
| `src/components/UploadField.tsx:66` | Sending… | English | Sending… |
| `src/components/UploadField.tsx:100` | Remove photo | English | Remove photo |
| `src/components/layout/NavigationBar.tsx:34` | Back | English | Back |
| `src/components/layout/NavigationBar.tsx:37` | Back | English | Back |
| `src/components/layout/StatusBar.tsx:33` | 5G · 100% | English | 5G · 100% |
| `src/components/layout/TabBar.tsx:16` | Loads | English | Loads |
| `src/components/layout/TabBar.tsx:17` | Applications | English | Applications |
| `src/components/layout/TabBar.tsx:18` | My day | English | My day |
| `src/components/layout/TabBar.tsx:19` | Account | English | Account |
| `src/components/v2/ApplicationBanner.tsx:7` | Application sent | English | Application sent |
| `src/components/v2/ApplicationBanner.tsx:8` | Awaiting dispatcher | English | Awaiting dispatcher |
| `src/components/v2/ApplicationBanner.tsx:9` | Dispatcher approved · awaiting customer | English | Dispatcher approved · awaiting customer |
| `src/components/v2/ApplicationBanner.tsx:10` | Confirmed · Trip TR-4821 | English | Confirmed · Trip TR-4821 |
| `src/components/v2/ApplicationBanner.tsx:11` | Application declined | English | Application declined |
| `src/components/v2/ApplicationBanner.tsx:12` | Application cancelled | English | Application cancelled |
| `src/components/v2/ApplicationBanner.tsx:49` | View | English | View |
| `src/components/v2/ApplicationBanner.tsx:49` | Step ${step} of 4 | English | Step ${step} of 4 |
| `src/components/v2/ApplicationBanner.tsx:52` | → | Нейтральный | → |
| `src/components/v2/ApplicationBanner.tsx:52` | · € | Нейтральный | · € |
| `src/components/v2/ApplicationBanner.tsx:53` |  · by ${load.approvalsBy} | English |  · by ${load.approvalsBy} |
| `src/components/v2/DemoToggle.tsx:21` | Hide demo | English | Hide demo |
| `src/components/v2/DemoToggle.tsx:21` | Demo | English | Demo |
| `src/components/v2/LoadSheet.tsx:51` | € | Нейтральный | € |
| `src/components/v2/LoadSheet.tsx:52` | € | Нейтральный | € |
| `src/components/v2/LoadSheet.tsx:53` | km loaded | English | km loaded |
| `src/components/v2/LoadSheet.tsx:65` | Today | English | Today |
| `src/components/v2/LoadSheet.tsx:65` | Tomorrow | English | Tomorrow |
| `src/components/v2/LoadSheet.tsx:65` | · | Нейтральный | · |
| `src/components/v2/LoadSheet.tsx:69` | km to pickup · about | English | km to pickup · about |
| `src/components/v2/LoadSheet.tsx:69` | min | English | min |
| `src/components/v2/LoadSheet.tsx:74` | · | Нейтральный | · |
| `src/components/v2/LoadSheet.tsx:74` | ★ · Verified · | English | ★ · Verified · |
| `src/components/v2/LoadSheet.tsx:79` | What happens next | English | What happens next |
| `src/components/v2/LoadSheet.tsx:80` | Your dispatcher checks the schedule, then the customer confirms — both by | English | Your dispatcher checks the schedule, then the customer confirms — both by |
| `src/components/v2/LoadSheet.tsx:81` | . Applying doesn’t reserve the load. | English | . Applying doesn’t reserve the load. |
| `src/components/v2/LoadSheet.tsx:87` | Apply for €${load.rate} · ${label} | English | Apply for €${load.rate} · ${label} |
| `src/components/v2/LoadTile.tsx:33` | € | Нейтральный | € |
| `src/components/v2/LoadTile.tsx:34` | € | Нейтральный | € |
| `src/components/v2/LoadTile.tsx:37` | Applied | English | Applied |
| `src/components/v2/LoadTile.tsx:47` | Decide in | English | Decide in |
| `src/components/v2/LoadTile.tsx:60` | Today | English | Today |
| `src/components/v2/LoadTile.tsx:60` | Tomorrow | English | Tomorrow |
| `src/components/v2/LoadTile.tsx:60` | · | Нейтральный | · |
| `src/components/v2/LoadTile.tsx:65` | km to pickup · about | English | km to pickup · about |
| `src/components/v2/LoadTile.tsx:65` | min | English | min |
| `src/components/v2/QuickApplyModal.tsx:53` | → | Нейтральный | → |
| `src/components/v2/QuickApplyModal.tsx:57` | € | Нейтральный | € |
| `src/components/v2/QuickApplyModal.tsx:57` | · € | Нейтральный | · € |
| `src/components/v2/QuickApplyModal.tsx:62` | · | Нейтральный | · |
| `src/components/v2/QuickApplyModal.tsx:66` | Loading load details… | English | Loading load details… |
| `src/components/v2/Sheet.tsx:16` | Close | English | Close |
| `src/components/v2/SmartLoadList.tsx:26` | List | English | List |
| `src/components/v2/SmartLoadList.tsx:27` | Map | English | Map |
| `src/components/v2/SmartLoadList.tsx:55` | € | Нейтральный | € |
| `src/components/v2/SmartLoadList.tsx:57` | € | Нейтральный | € |
| `src/components/v2/SmartLoadList.tsx:67` | On your route | English | On your route |
| `src/components/v2/SmartLoadList.tsx:74` | Today | English | Today |
| `src/components/v2/SmartLoadList.tsx:74` | Tomorrow | English | Tomorrow |
| `src/components/v2/SmartLoadList.tsx:74` | · | Нейтральный | · |
| `src/components/v2/SmartLoadList.tsx:77` | km to pickup · | English | km to pickup · |
| `src/components/v2/SmartLoadList.tsx:77` | min | English | min |
| `src/components/v2/SmartLoadList.tsx:79` | km loaded | English | km loaded |
| `src/components/v2/SmartLoadList.tsx:83` | · | Нейтральный | · |
| `src/components/v2/SmartLoadList.tsx:83` | ★ · | Нейтральный | ★ · |
| `src/components/v2/SmartLoadList.tsx:87` | View details | English | View details |
| `src/components/v2/SmartLoadList.tsx:90` | Application sent | English | Application sent |
| `src/components/v2/SmartLoadList.tsx:90` | Quick apply | English | Quick apply |
| `src/components/v2/SmartLoadList.tsx:125` | Matching loads | English | Matching loads |
| `src/components/v2/SmartLoadList.tsx:126` | Load view | English | Load view |
| `src/components/v2/SmartLoadList.tsx:149` | Searching for loads… | English | Searching for loads… |
| `src/components/v2/SmartLoadList.tsx:151` | No loads match these filters. | English | No loads match these filters. |
| `src/components/v2/SmartLoadList.tsx:153` | Loads list | English | Loads list |
| `src/components/v2/SmartLoadList.tsx:158` | Route map towards ${currentRoute.to} | English | Route map towards ${currentRoute.to} |
| `src/components/v2/SmartLoadList.tsx:160` | Loads towards | English | Loads towards |
| `src/components/v2/SmartLoadList.tsx:164` | Loads on map | English | Loads on map |
| `src/components/v2/V2Frame.tsx:18` | Loads | English | Loads |
| `src/components/v2/V2Frame.tsx:19` | Trips | English | Trips |
| `src/components/v2/V2Frame.tsx:20` | Account | English | Account |
| `src/lib/bl/logic.ts:38` | 3.2 t | English | 3.2 t |
| `src/lib/bl/logic.ts:41` | 1.8 t | English | 1.8 t |
| `src/lib/bl/logic.ts:44` | 800 kg | English | 800 kg |
| `src/lib/bl/logic.ts:47` | 2.4 t | English | 2.4 t |
| `src/lib/bl/logic.ts:50` | 1.5 t | English | 1.5 t |
| `src/lib/bl/logic.ts:69` |  ${r} min | English |  ${r} min |
| `src/lib/bl/logic.ts:69` | ${r} min | English | ${r} min |
| `src/lib/v2/loads.ts:31` | NordCargo | Имя / бренд | NordCargo |
| `src/lib/v2/loads.ts:39` | 14:00–15:00 | Нейтральный | 14:00–15:00 |
| `src/lib/v2/loads.ts:41` | 17:00–18:00 | Нейтральный | 17:00–18:00 |
| `src/lib/v2/loads.ts:44` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/lib/v2/loads.ts:45` | Paid in 7 days | English | Paid in 7 days |
| `src/lib/v2/loads.ts:47` | 11:00 | Нейтральный | 11:00 |
| `src/lib/v2/loads.ts:51` | BelRoute | Имя / бренд | BelRoute |
| `src/lib/v2/loads.ts:56` | Ghent | English | Ghent |
| `src/lib/v2/loads.ts:57` | Antwerp | English | Antwerp |
| `src/lib/v2/loads.ts:59` | 16:00–17:00 | Нейтральный | 16:00–17:00 |
| `src/lib/v2/loads.ts:61` | 18:00–19:00 | Нейтральный | 18:00–19:00 |
| `src/lib/v2/loads.ts:64` | Curtainsider · 10 t · 14 pallets | English | Curtainsider · 10 t · 14 pallets |
| `src/lib/v2/loads.ts:65` | Paid in 14 days | English | Paid in 14 days |
| `src/lib/v2/loads.ts:67` | 12:30 | Нейтральный | 12:30 |
| `src/lib/v2/loads.ts:71` | Côte Fret | Имя / бренд | Côte Fret |
| `src/lib/v2/loads.ts:76` | Calais | English | Calais |
| `src/lib/v2/loads.ts:79` | 08:00–09:00 | Нейтральный | 08:00–09:00 |
| `src/lib/v2/loads.ts:81` | 11:00–12:00 | Нейтральный | 11:00–12:00 |
| `src/lib/v2/loads.ts:84` | Curtainsider · 12 t · 16 pallets | English | Curtainsider · 12 t · 16 pallets |
| `src/lib/v2/loads.ts:85` | Paid in 7 days | English | Paid in 7 days |
| `src/lib/v2/loads.ts:87` | tomorrow 06:00 | English | tomorrow 06:00 |
| `src/screens/Search.tsx:37` | Loads | English | Loads |
| `src/screens/Search.tsx:39` | Find loads on your route | English | Find loads on your route |
| `src/screens/Search.tsx:42` | Start | English | Start |
| `src/screens/Search.tsx:43` | Start typing a city | English | Start typing a city |
| `src/screens/Search.tsx:50` | Destination (optional) | English | Destination (optional) |
| `src/screens/Search.tsx:51` | Start typing a city | English | Start typing a city |
| `src/screens/Search.tsx:62` | Use my location | English | Use my location |
| `src/screens/Search.tsx:66` | Find loads | English | Find loads |
| `src/screens/bl/Home.tsx:33` | → | Нейтральный | → |
| `src/screens/bl/Home.tsx:107` | → | Нейтральный | → |
| `src/screens/bl/Home.tsx:124` | → | Нейтральный | → |
| `src/screens/bl/Home.tsx:126` | + | Нейтральный | + |
| `src/screens/bl/Home.tsx:130` | € | Нейтральный | € |
| `src/screens/bl/Home.tsx:155` | . | Нейтральный | . |
| `src/screens/bl/Home.tsx:164` | → | Нейтральный | → |
| `src/screens/bl/Home.tsx:166` | +€ | Нейтральный | +€ |
| `src/screens/bl/List.tsx:68` | → | Нейтральный | → |
| `src/screens/bl/List.tsx:71` | · | Нейтральный | · |
| `src/screens/bl/List.tsx:74` | € | Нейтральный | € |
| `src/screens/bl/List.tsx:83` | + | Нейтральный | + |
| `src/screens/bl/List.tsx:137` | ✓ | Нейтральный | ✓ |
| `src/screens/bl/List.tsx:142` | · | Нейтральный | · |
| `src/screens/bl/List.tsx:142` | → | Нейтральный | → |
| `src/screens/bl/List.tsx:181` | km | English | km |
| `src/screens/bl/List.tsx:183` | − | Нейтральный | − |
| `src/screens/bl/List.tsx:186` | + | Нейтральный | + |
| `src/screens/bl/List.tsx:196` | km | English | km |
| `src/screens/bl/List.tsx:252` | → | Нейтральный | → |
| `src/screens/bl/List.tsx:255` | · | Нейтральный | · |
| `src/screens/bl/List.tsx:259` | € | Нейтральный | € |
| `src/screens/bl/List.tsx:271` | + | Нейтральный | + |
| `src/screens/bl/List.tsx:272` | km · € | English | km · € |
| `src/screens/bl/List.tsx:289` | ★ | Нейтральный | ★ |
| `src/screens/bl/List.tsx:290` | · | Нейтральный | · |
| `src/screens/bl/Profile.tsx:44` | AB | Имя / бренд | AB |
| `src/screens/bl/Profile.tsx:48` | Antoni B. | Имя / бренд | Antoni B. |
| `src/screens/bl/Profile.tsx:50` | · | Нейтральный | · |
| `src/screens/bl/Profile.tsx:51` |  · ADR | English |  · ADR |
| `src/screens/bl/Profile.tsx:51` | · ★ 4.9 | Нейтральный | · ★ 4.9 |
| `src/screens/bl/Profile.tsx:61` | €${String(earned).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')} | English | €${String(earned).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')} |
| `src/screens/bl/Profile.tsx:118` | ) | Нейтральный | ) |
| `src/screens/bl/Route.tsx:35` | → | Нейтральный | → |
| `src/screens/bl/Route.tsx:72` | . | Нейтральный | . |
| `src/screens/bl/Route.tsx:94` | . | Нейтральный | . |
| `src/screens/bl/Route.tsx:126` | km | English | km |
| `src/screens/bl/Route.tsx:149` | ▶ | Нейтральный | ▶ |
| `src/screens/bl/Route.tsx:155` | km | English | km |
| `src/screens/bl/Search.tsx:59` | ”. | Нейтральный | ”. |
| `src/screens/bl/Start.tsx:112` | +48 600 123 456 | Нейтральный | +48 600 123 456 |
| `src/screens/bl/Start.tsx:134` | 0000 | Нейтральный | 0000 |
| `src/screens/bl/Start.tsx:161` | . | Нейтральный | . |
| `src/screens/v2/ApplicationTracker.tsx:20` | Application sent | English | Application sent |
| `src/screens/v2/ApplicationTracker.tsx:21` | Your application has been sent to the dispatcher. | English | Your application has been sent to the dispatcher. |
| `src/screens/v2/ApplicationTracker.tsx:26` | Under dispatcher review | English | Under dispatcher review |
| `src/screens/v2/ApplicationTracker.tsx:27` | The dispatcher is reviewing your application. | English | The dispatcher is reviewing your application. |
| `src/screens/v2/ApplicationTracker.tsx:32` | Waiting for customer | English | Waiting for customer |
| `src/screens/v2/ApplicationTracker.tsx:33` | The dispatcher approved your application. The customer is reviewing it. | English | The dispatcher approved your application. The customer is reviewing it. |
| `src/screens/v2/ApplicationTracker.tsx:38` | Load confirmed | English | Load confirmed |
| `src/screens/v2/ApplicationTracker.tsx:39` | Your load is confirmed. View your trip details for the next steps. | English | Your load is confirmed. View your trip details for the next steps. |
| `src/screens/v2/ApplicationTracker.tsx:44` | Application declined | English | Application declined |
| `src/screens/v2/ApplicationTracker.tsx:49` | Application cancelled | English | Application cancelled |
| `src/screens/v2/ApplicationTracker.tsx:50` | You cancelled this application. You can apply for another load. | English | You cancelled this application. You can apply for another load. |
| `src/screens/v2/ApplicationTracker.tsx:89` | Back to loads | English | Back to loads |
| `src/screens/v2/ApplicationTracker.tsx:94` | Application status | English | Application status |
| `src/screens/v2/ApplicationTracker.tsx:109` | → | Нейтральный | → |
| `src/screens/v2/ApplicationTracker.tsx:110` | € | Нейтральный | € |
| `src/screens/v2/ApplicationTracker.tsx:110` | · | Нейтральный | · |
| `src/screens/v2/ApplicationTracker.tsx:110` | Today | English | Today |
| `src/screens/v2/ApplicationTracker.tsx:110` | Tomorrow | English | Tomorrow |
| `src/screens/v2/ApplicationTracker.tsx:119` | Average response time: ~15 min | English | Average response time: ~15 min |
| `src/screens/v2/ApplicationTracker.tsx:132` | View trip | English | View trip |
| `src/screens/v2/ApplicationTracker.tsx:134` | Contact dispatcher | English | Contact dispatcher |
| `src/screens/v2/ApplicationTracker.tsx:137` | Dispatcher chat is not connected in this demo. | English | Dispatcher chat is not connected in this demo. |
| `src/screens/v2/ApplicationTracker.tsx:141` | Cancel application | English | Cancel application |
| `src/screens/v2/ApplicationTracker.tsx:208` | Application status | English | Application status |
| `src/screens/v2/ApplicationTracker.tsx:210` | Loading application… | English | Loading application… |
| `src/screens/v2/ApplicationTracker.tsx:210` | This application is no longer available. | English | This application is no longer available. |
| `src/screens/v2/ApplicationTracker.tsx:212` | Back to loads | English | Back to loads |
| `src/screens/v2/Home.tsx:24` | Today | English | Today |
| `src/screens/v2/Home.tsx:25` | €3+/km | English | €3+/km |
| `src/screens/v2/Home.tsx:26` | Under 30 km | English | Under 30 km |
| `src/screens/v2/Home.tsx:63` | Loads towards | English | Loads towards |
| `src/screens/v2/Home.tsx:68` | ${visible.length} loads | English | ${visible.length} loads |
| `src/screens/v2/Soon.tsx:12` | Coming in the next step of the v2 journey. | English | Coming in the next step of the v2 journey. |
| `src/screens/v2/TripDetails.tsx:19` | Pickup | English | Pickup |
| `src/screens/v2/TripDetails.tsx:20` | Delivery | English | Delivery |
| `src/screens/v2/TripDetails.tsx:27` | Back to application | English | Back to application |
| `src/screens/v2/TripDetails.tsx:30` | Trip details | English | Trip details |
| `src/screens/v2/TripDetails.tsx:34` | Trip summary | English | Trip summary |
| `src/screens/v2/TripDetails.tsx:35` | Confirmed | English | Confirmed |
| `src/screens/v2/TripDetails.tsx:36` | € | Нейтральный | € |
| `src/screens/v2/TripDetails.tsx:37` | km loaded · | English | km loaded · |
| `src/screens/v2/TripDetails.tsx:41` | Route | English | Route |
| `src/screens/v2/TripDetails.tsx:42` | Route stops | English | Route stops |
| `src/screens/v2/TripDetails.tsx:49` | Today | English | Today |
| `src/screens/v2/TripDetails.tsx:49` | Tomorrow | English | Tomorrow |
| `src/screens/v2/TripDetails.tsx:49` | · | Нейтральный | · |
| `src/screens/v2/TripDetails.tsx:57` | Customer | English | Customer |
| `src/screens/v2/TripDetails.tsx:59` | Customer rating: | English | Customer rating: |
| `src/screens/v2/TripDetails.tsx:64` | Navigation | English | Navigation |
| `src/screens/v2/TripDetails.tsx:64` | Navigation is not connected in this demo. | English | Navigation is not connected in this demo. |
| `src/screens/v2/TripDetails.tsx:65` | Documents | English | Documents |
| `src/screens/v2/TripDetails.tsx:65` | Trip documents are not connected in this demo. | English | Trip documents are not connected in this demo. |
| `src/screens/v2/TripDetails.tsx:91` | Trip details | English | Trip details |
| `src/screens/v2/TripDetails.tsx:92` | Loading trip… | English | Loading trip… |
| `src/screens/v2/TripDetails.tsx:92` | No confirmed trip is available for this load. | English | No confirmed trip is available for this load. |
| `src/screens/v2/TripDetails.tsx:93` | Back to loads | English | Back to loads |

## 3. Storybook: демонстрационные строки

| Файл | Строка | Текущий язык | Предложенный English |
|---|---|---|---|
| `src/components/Alert.stories.tsx:12` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:12` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:14` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:14` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:16` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:16` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:18` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:18` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:20` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:20` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:23` | Notification title | English | Notification title |
| `src/components/Alert.stories.tsx:23` | Notification description | English | Notification description |
| `src/components/Alert.stories.tsx:23` | Detail | English | Detail |
| `src/components/Alert.stories.tsx:26` | Awaiting dispatcher | English | Awaiting dispatcher |
| `src/components/Alert.stories.tsx:26` | This load isn’t secured yet. Both approvals are needed by 11:00. | English | This load isn’t secured yet. Both approvals are needed by 11:00. |
| `src/components/Alert.stories.tsx:28` | Awaiting customer | English | Awaiting customer |
| `src/components/Alert.stories.tsx:28` | Dispatcher approved. Customer confirmation is needed by 11:00. | English | Dispatcher approved. Customer confirmation is needed by 11:00. |
| `src/components/Alert.stories.tsx:30` | Couldn’t get your location | English | Couldn’t get your location |
| `src/components/Alert.stories.tsx:30` | Enter a city instead. | English | Enter a city instead. |
| `src/components/ApproachMap.stories.tsx:20` | To pickup | English | To pickup |
| `src/components/ApproachMap.stories.tsx:21` | 12 km · about 18 min | English | 12 km · about 18 min |
| `src/components/ApproachMap.stories.tsx:22` | You · demo | English | You · demo |
| `src/components/ApproachMap.stories.tsx:23` | Pickup · €420 | English | Pickup · €420 |
| `src/components/ApproachMap.stories.tsx:24` | Approach to pickup point | English | Approach to pickup point |
| `src/components/BottomSheet.stories.tsx:37` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:38` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:41` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:52` | Where are you starting? | English | Where are you starting? |
| `src/components/BottomSheet.stories.tsx:53` | City | English | City |
| `src/components/BottomSheet.stories.tsx:53` | Start typing a city | English | Start typing a city |
| `src/components/BottomSheet.stories.tsx:54` | Current selection | English | Current selection |
| `src/components/BottomSheet.stories.tsx:55` | France | English | France |
| `src/components/BottomSheet.stories.tsx:55` | Select Lille | English | Select Lille |
| `src/components/BottomSheet.stories.tsx:57` | Select Lille | English | Select Lille |
| `src/components/BottomSheet.stories.tsx:68` | Where are you going? | English | Where are you going? |
| `src/components/BottomSheet.stories.tsx:69` | City | English | City |
| `src/components/BottomSheet.stories.tsx:69` | Start typing a city | English | Start typing a city |
| `src/components/BottomSheet.stories.tsx:70` | Current selection | English | Current selection |
| `src/components/BottomSheet.stories.tsx:71` | Belgium | English | Belgium |
| `src/components/BottomSheet.stories.tsx:71` | Select Brussels | English | Select Brussels |
| `src/components/BottomSheet.stories.tsx:73` | Select Brussels | English | Select Brussels |
| `src/components/BottomSheet.stories.tsx:84` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:85` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:88` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:99` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:100` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:104` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:115` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:116` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:119` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:130` | Where are you starting? | English | Where are you starting? |
| `src/components/BottomSheet.stories.tsx:131` | City | English | City |
| `src/components/BottomSheet.stories.tsx:131` | Start typing a city | English | Start typing a city |
| `src/components/BottomSheet.stories.tsx:132` | Suggestions | English | Suggestions |
| `src/components/BottomSheet.stories.tsx:133` | France | English | France |
| `src/components/BottomSheet.stories.tsx:133` | Select Lille | English | Select Lille |
| `src/components/BottomSheet.stories.tsx:135` | Select Lille | English | Select Lille |
| `src/components/BottomSheet.stories.tsx:146` | Where are you going? | English | Where are you going? |
| `src/components/BottomSheet.stories.tsx:147` | City | English | City |
| `src/components/BottomSheet.stories.tsx:147` | Start typing a city | English | Start typing a city |
| `src/components/BottomSheet.stories.tsx:148` | Suggestions | English | Suggestions |
| `src/components/BottomSheet.stories.tsx:149` | Belgium | English | Belgium |
| `src/components/BottomSheet.stories.tsx:149` | Select Brussels | English | Select Brussels |
| `src/components/BottomSheet.stories.tsx:151` | Select Brussels | English | Select Brussels |
| `src/components/BottomSheet.stories.tsx:162` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:163` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:167` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:178` | Route | English | Route |
| `src/components/BottomSheet.stories.tsx:179` | Choose your route. | English | Choose your route. |
| `src/components/BottomSheet.stories.tsx:182` | Show loads | English | Show loads |
| `src/components/BottomSheet.stories.tsx:195` | Offer a different rate | English | Offer a different rate |
| `src/components/BottomSheet.stories.tsx:196` | Customer’s rate — €360 | English | Customer’s rate — €360 |
| `src/components/BottomSheet.stories.tsx:199` | Your rate | English | Your rate |
| `src/components/BottomSheet.stories.tsx:200` | Comment | English | Comment |
| `src/components/BottomSheet.stories.tsx:200` | I can take this trip today. | English | I can take this trip today. |
| `src/components/BottomSheet.stories.tsx:201` | Send €380 offer | English | Send €380 offer |
| `src/components/BottomSheet.stories.tsx:214` | Request trip details | English | Request trip details |
| `src/components/BottomSheet.stories.tsx:215` | Your dispatcher will receive a request for the missing trip data. | English | Your dispatcher will receive a request for the missing trip data. |
| `src/components/BottomSheet.stories.tsx:219` | Send to dispatcher | English | Send to dispatcher |
| `src/components/BottomSheet.stories.tsx:221` | Cancel | English | Cancel |
| `src/components/BottomSheet.stories.tsx:234` | Sort by | English | Sort by |
| `src/components/Button.stories.tsx:14` | Send application | English | Send application |
| `src/components/Button.stories.tsx:16` | View load details | English | View load details |
| `src/components/Button.stories.tsx:18` | Find loads | English | Find loads |
| `src/components/Button.stories.tsx:20` | Find loads | English | Find loads |
| `src/components/Button.stories.tsx:22` | Use my location | English | Use my location |
| `src/components/Button.stories.tsx:24` | Use my location | English | Use my location |
| `src/components/Button.stories.tsx:26` | Send application | English | Send application |
| `src/components/Button.stories.tsx:28` | View load details | English | View load details |
| `src/components/Button.stories.tsx:33` | Send application | English | Send application |
| `src/components/Button.stories.tsx:34` | View load details | English | View load details |
| `src/components/Button.stories.tsx:40` | Resend code | English | Resend code |
| `src/components/Button.stories.tsx:42` | Resend code | English | Resend code |
| `src/components/Button.stories.tsx:44` | Resend code | English | Resend code |
| `src/components/Button.stories.tsx:46` | Resend code | English | Resend code |
| `src/components/ChatCargoContext.stories.tsx:26` | Today, 14:00–15:00 · €360 · Decision by 11:00  › | English | Today, 14:00–15:00 · €360 · Decision by 11:00  › |
| `src/components/ChatComposer.stories.tsx:26` | I can take this trip today. | English | I can take this trip today. |
| `src/components/ChatRateOffer.stories.tsx:32` | Accept €360 | English | Accept €360 |
| `src/components/DayItem.stories.tsx:19` | Assigned · TR-4821 | English | Assigned · TR-4821 |
| `src/components/DayItem.stories.tsx:33` | Heading | English | Heading |
| `src/components/DayItem.stories.tsx:43` | Heading | English | Heading |
| `src/components/DayItem.stories.tsx:43` | by 11:00 | English | by 11:00 |
| `src/components/DayItem.stories.tsx:53` | Window 11:00–13:15 | English | Window 11:00–13:15 |
| `src/components/DayItem.stories.tsx:66` | After 19:00 | English | After 19:00 |
| `src/components/DayItem.stories.tsx:67` | Window after delivery | English | Window after delivery |
| `src/components/DriverProfile.stories.tsx:25` | France | English | France |
| `src/components/DrivingLicencePreview.stories.tsx:18` | Document photo | English | Document photo |
| `src/components/EmptyDetailsPanel.stories.tsx:18` | Select a load | English | Select a load |
| `src/components/EmptyDetailsPanel.stories.tsx:19` | Select a card on the left to see trip terms, payment and customer details. | English | Select a card on the left to see trip terms, payment and customer details. |
| `src/components/EmptyDetailsPanel.stories.tsx:26` | No matching loads | English | No matching loads |
| `src/components/EmptyDetailsPanel.stories.tsx:28` | No matches on the current route. Change the direction in the search above and tap “Find loads”. | English | No matches on the current route. Change the direction in the search above and tap “Find loads”. |
| `src/components/EmptyDetailsPanel.stories.tsx:36` | Refreshing the load list | English | Refreshing the load list |
| `src/components/EmptyDetailsPanel.stories.tsx:37` | Wait for the results to pick a load and check the terms. | English | Wait for the results to pick a load and check the terms. |
| `src/components/EmptyDetailsPanel.stories.tsx:44` | No loads for this window | English | No loads for this window |
| `src/components/EmptyDetailsPanel.stories.tsx:46` | Finish in Lille by 13:15. Allow 25 minutes to travel and a 20-minute buffer before pickup at 14:00. | English | Finish in Lille by 13:15. Allow 25 minutes to travel and a 20-minute buffer before pickup at 14:00. |
| `src/components/FilterChip.stories.tsx:18` | Curtainsider | English | Curtainsider |
| `src/components/FilterChip.stories.tsx:23` | Curtainsider | English | Curtainsider |
| `src/components/FilterChip.stories.tsx:32` | ADR | Имя / бренд | ADR |
| `src/components/FilterChip.stories.tsx:36` | ADR | Имя / бренд | ADR |
| `src/components/FilterChip.stories.tsx:37` | Part loads | English | Part loads |
| `src/components/FilterChip.stories.tsx:38` | Tail lift | English | Tail lift |
| `src/components/FilterChip.stories.tsx:41` | Rear loading | English | Rear loading |
| `src/components/FilterChip.stories.tsx:42` | Side | English | Side |
| `src/components/FilterChip.stories.tsx:43` | Top | English | Top |
| `src/components/FilterChipV2.stories.tsx:18` | Tomorrow | English | Tomorrow |
| `src/components/FilterChipV2.stories.tsx:23` | Tomorrow | English | Tomorrow |
| `src/components/FilterChipV2.stories.tsx:28` | Tomorrow | English | Tomorrow |
| `src/components/FilterChipV2.stories.tsx:33` | Tomorrow | English | Tomorrow |
| `src/components/FilterChipV2.stories.tsx:42` | Today | English | Today |
| `src/components/FilterChipV2.stories.tsx:45` | Today | English | Today |
| `src/components/FiltersButton.stories.tsx:39` | List | English | List |
| `src/components/FiltersButton.stories.tsx:39` | Map | English | Map |
| `src/components/FiltersButton.stories.tsx:43` | List | English | List |
| `src/components/FiltersButton.stories.tsx:43` | Map | English | Map |
| `src/components/Flag.stories.tsx:13` | France | English | France |
| `src/components/Flag.stories.tsx:14` | Belgium | English | Belgium |
| `src/components/Icon.stories.tsx:25` | accessible name for an icon-only action | English | accessible name for an icon-only action |
| `src/components/Icon.stories.tsx:65` | · | Нейтральный | · |
| `src/components/Icon.stories.tsx:71` | 14 — no token | English | 14 — no token |
| `src/components/Icon.stories.tsx:82` | primary | English | primary |
| `src/components/Icon.stories.tsx:85` | action | English | action |
| `src/components/Icon.stories.tsx:102` | Close | English | Close |
| `src/components/Icon.stories.tsx:104` | 48 px target, per the icon page note | English | 48 px target, per the icon page note |
| `src/components/InformationSection.stories.tsx:17` | Trip information | English | Trip information |
| `src/components/InformationSection.stories.tsx:17` | Key fact | English | Key fact |
| `src/components/InformationSection.stories.tsx:17` | Order terms, contacts or documents. | English | Order terms, contacts or documents. |
| `src/components/InformationSection.stories.tsx:43` | Payment | English | Payment |
| `src/components/InformationSection.stories.tsx:44` | 360 € · awaiting payment | English | 360 € · awaiting payment |
| `src/components/InformationSection.stories.tsx:45` | Agreed term: within 7 days | English | Agreed term: within 7 days |
| `src/components/InformationSection.stories.tsx:72` | Payment | English | Payment |
| `src/components/InformationSection.stories.tsx:73` | 360 € · early option | English | 360 € · early option |
| `src/components/InformationSection.stories.tsx:74` | Review the fee before requesting | English | Review the fee before requesting |
| `src/components/InformationSection.stories.tsx:84` | Payment | English | Payment |
| `src/components/InformationSection.stories.tsx:85` | 360 € · received | English | 360 € · received |
| `src/components/InformationSection.stories.tsx:86` | Paid for trip TR-4821 | English | Paid for trip TR-4821 |
| `src/components/InformationSection.stories.tsx:95` | Pickup · Lille, FR | English | Pickup · Lille, FR |
| `src/components/InformationSection.stories.tsx:96` | Today, 14:00–15:00 | English | Today, 14:00–15:00 |
| `src/components/InformationSection.stories.tsx:97` | No exact address provided. | English | No exact address provided. |
| `src/components/InformationSection.stories.tsx:98` | France | English | France |
| `src/components/InformationSection.stories.tsx:105` | Delivery · Brussels, BE | English | Delivery · Brussels, BE |
| `src/components/InformationSection.stories.tsx:106` | Today, until 19:00 | English | Today, until 19:00 |
| `src/components/InformationSection.stories.tsx:107` | No exact address provided. | English | No exact address provided. |
| `src/components/InformationSection.stories.tsx:108` | Belgium | English | Belgium |
| `src/components/InformationSection.stories.tsx:118` | NordCargo · Lille → Brussels · €360 | English | NordCargo · Lille → Brussels · €360 |
| `src/components/InformationSection.stories.tsx:119` | Dispatcher declined | English | Dispatcher declined |
| `src/components/InformationSection.stories.tsx:120` | Dispatcher declined | English | Dispatcher declined |
| `src/components/InformationSection.stories.tsx:121` | Your vehicle does not meet the load requirements. Application closed. Choose another load. | English | Your vehicle does not meet the load requirements. Application closed. Choose another load. |
| `src/components/InformationSection.stories.tsx:128` | Trip assigned to you | English | Trip assigned to you |
| `src/components/InformationSection.stories.tsx:129` | All steps completed. | English | All steps completed. |
| `src/components/InformationSection.stories.tsx:130` | On your route | English | On your route |
| `src/components/InformationSection.stories.tsx:131` | All steps completed. View trip → | English | All steps completed. View trip → |
| `src/components/InformationSection.stories.tsx:138` | Pickup contact | English | Pickup contact |
| `src/components/InformationSection.stories.tsx:139` | Sophie Martin | English | Sophie Martin |
| `src/components/InformationSection.stories.tsx:140` | Dock 4 · Today, 14:00–15:00 | English | Dock 4 · Today, 14:00–15:00 |
| `src/components/InformationSection.stories.tsx:141` | Call | English | Call |
| `src/components/InformationSection.stories.tsx:148` | Fleet policy | English | Fleet policy |
| `src/components/InformationSection.stories.tsx:149` | Dispatcher approval for every application | English | Dispatcher approval for every application |
| `src/components/Input.stories.tsx:13` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:15` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:15` | Hamburg, Germany | English | Hamburg, Germany |
| `src/components/Input.stories.tsx:17` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:17` | Hamburg, Germany | English | Hamburg, Germany |
| `src/components/Input.stories.tsx:19` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:19` | Hamburg, Germany | English | Hamburg, Germany |
| `src/components/Input.stories.tsx:21` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:21` | Hamburg, Germany | English | Hamburg, Germany |
| `src/components/Input.stories.tsx:23` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:23` | Hamburg, Germany | English | Hamburg, Germany |
| `src/components/Input.stories.tsx:25` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:28` | Pickup city | English | Pickup city |
| `src/components/Input.stories.tsx:28` | Start and destination must differ | English | Start and destination must differ |
| `src/components/LoadCard.stories.tsx:87` | Saint-Jean-de-Maurienne, FR | English | Saint-Jean-de-Maurienne, FR |
| `src/components/LoadCard.stories.tsx:88` | Brussels — industrial zone, BE | English | Brussels — industrial zone, BE |
| `src/components/LoadCard.stories.tsx:89` | 18 km to pickup · about 25 min | English | 18 km to pickup · about 25 min |
| `src/components/LoadCard.stories.tsx:90` | Northway Freight & Logistics Europe | English | Northway Freight & Logistics Europe |
| `src/components/LoadCard.stories.tsx:91` | Payment within 30 calendar days after delivery | English | Payment within 30 calendar days after delivery |
| `src/components/LocationSuggestions.stories.tsx:24` | Belgium | English | Belgium |
| `src/components/LocationSuggestions.stories.tsx:35` | No cities found | English | No cities found |
| `src/components/LocationSuggestions.stories.tsx:35` | Check the spelling or try another city. | English | Check the spelling or try another city. |
| `src/components/MessageBubble.stories.tsx:45` | The load is available. Pickup today, 14:00–15:00. | English | The load is available. Pickup today, 14:00–15:00. |
| `src/components/MessageBubble.stories.tsx:52` | I can take this trip today for €380. | English | I can take this trip today for €380. |
| `src/components/MessageBubble.stories.tsx:58` | Pickup is at a warehouse in Lille. Give your application number at the entrance. | English | Pickup is at a warehouse in Lille. Give your application number at the entrance. |
| `src/components/MessageBubble.stories.tsx:70` | We can agree €360. Does that work? | English | We can agree €360. Does that work? |
| `src/components/MessageBubble.stories.tsx:74` | I can take this trip today. | English | I can take this trip today. |
| `src/components/MobileHeader.stories.tsx:10` | Web shell/Mobile header | English | Web shell/Mobile header |
| `src/components/MobileHeader.stories.tsx:25` | Load details | English | Load details |
| `src/components/MobileHeader.stories.tsx:28` | Load details | English | Load details |
| `src/components/OfferCard.stories.tsx:38` | Needs approval | English | Needs approval |
| `src/components/OfferCard.stories.tsx:44` | €3.05/km loaded | English | €3.05/km loaded |
| `src/components/OfferCard.stories.tsx:45` | 105 km loaded | English | 105 km loaded |
| `src/components/OfferCard.stories.tsx:46` | Tourcoing → Brussels | English | Tourcoing → Brussels |
| `src/components/OfferCard.stories.tsx:47` | Today · 15:00–16:00 | English | Today · 15:00–16:00 |
| `src/components/OfferCard.stories.tsx:48` | 26 km to pickup · about 35 min | English | 26 km to pickup · about 35 min |
| `src/components/OfferCard.stories.tsx:49` | Curtainsider · 10 t · 14 pallets | English | Curtainsider · 10 t · 14 pallets |
| `src/components/OfferCard.stories.tsx:50` | BelRoute · 4.7 ★ · paid in 14 days | English | BelRoute · 4.7 ★ · paid in 14 days |
| `src/components/OfferRoute.stories.tsx:17` | Pickup · today, 14:00–15:00 | English | Pickup · today, 14:00–15:00 |
| `src/components/OfferRoute.stories.tsx:18` | Delivery · today, by 19:00 | English | Delivery · today, by 19:00 |
| `src/components/OfferRoute.stories.tsx:19` | 18 km to pickup · about 25 min | English | 18 km to pickup · about 25 min |
| `src/components/OfferRoute.stories.tsx:20` | 111 km loaded | English | 111 km loaded |
| `src/components/OfferRoute.stories.tsx:27` | Tourcoing, France | English | Tourcoing, France |
| `src/components/OfferRoute.stories.tsx:29` | Pickup · today, 15:00–16:00 | English | Pickup · today, 15:00–16:00 |
| `src/components/OfferRoute.stories.tsx:30` | Delivery · today, by 19:00 | English | Delivery · today, by 19:00 |
| `src/components/OfferRoute.stories.tsx:31` | 26 km to pickup · about 35 min | English | 26 km to pickup · about 35 min |
| `src/components/OfferRoute.stories.tsx:32` | 105 km loaded | English | 105 km loaded |
| `src/components/OfferRoute.stories.tsx:42` | Pickup · today, 14:00–15:00 | English | Pickup · today, 14:00–15:00 |
| `src/components/OfferRoute.stories.tsx:43` | Delivery · today, by 19:00 | English | Delivery · today, by 19:00 |
| `src/components/OfferRoute.stories.tsx:44` | 18 km to pickup · about 25 min | English | 18 km to pickup · about 25 min |
| `src/components/OfferRoute.stories.tsx:45` | 111 km loaded | English | 111 km loaded |
| `src/components/OfferTerms.stories.tsx:17` | €3.24/km loaded | English | €3.24/km loaded |
| `src/components/OfferTerms.stories.tsx:18` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/OfferTerms.stories.tsx:19` | Paid within 7 days | English | Paid within 7 days |
| `src/components/OfferTerms.stories.tsx:20` | NordCargo · 4.8 ★ | English | NordCargo · 4.8 ★ |
| `src/components/OfferTerms.stories.tsx:21` | Verified customer | English | Verified customer |
| `src/components/OfferTerms.stories.tsx:30` | Curtainsider · 10 t · 14 pallets | English | Curtainsider · 10 t · 14 pallets |
| `src/components/OfferTerms.stories.tsx:31` | Paid within 14 days | English | Paid within 14 days |
| `src/components/OfferTerms.stories.tsx:32` | BelRoute · 4.7 ★ | English | BelRoute · 4.7 ★ |
| `src/components/OfferTerms.stories.tsx:33` | Verified customer | English | Verified customer |
| `src/components/PageHeader.stories.tsx:10` | Web shell/Page header | English | Web shell/Page header |
| `src/components/PageHeader.stories.tsx:28` | Loads on your route | English | Loads on your route |
| `src/components/PageHeader.stories.tsx:29` | Vehicle available | English | Vehicle available |
| `src/components/PageHeader.stories.tsx:37` | Loads on your route | English | Loads on your route |
| `src/components/PageHeader.stories.tsx:38` | Vehicle available | English | Vehicle available |
| `src/components/PageHeader.stories.tsx:39` | To the selected load | English | To the selected load |
| `src/components/ProgressStep.stories.tsx:16` | Application sent | English | Application sent |
| `src/components/ProgressStep.stories.tsx:25` | Dispatcher approval | English | Dispatcher approval |
| `src/components/ProgressStep.stories.tsx:34` | Customer confirmation | English | Customer confirmation |
| `src/components/RateOfferCard.stories.tsx:32` | Counter-offer | English | Counter-offer |
| `src/components/RateOfferCard.stories.tsx:32` | NordCargo is waiting for your decision | English | NordCargo is waiting for your decision |
| `src/components/RouteCard.stories.tsx:26` | Tourcoing, France | English | Tourcoing, France |
| `src/components/RouteCard.stories.tsx:26` | Today, 15:00–16:00 | English | Today, 15:00–16:00 |
| `src/components/RouteCard.stories.tsx:27` | Today, by 19:00 | English | Today, by 19:00 |
| `src/components/RouteSummaryWeb.stories.tsx:36` | Tourcoing → Antwerp | English | Tourcoing → Antwerp |
| `src/components/Select.stories.tsx:13` | Curtainsider | English | Curtainsider |
| `src/components/Select.stories.tsx:13` | Refrigerated | English | Refrigerated |
| `src/components/Select.stories.tsx:13` | Box truck | English | Box truck |
| `src/components/Select.stories.tsx:16` | Body type | English | Body type |
| `src/components/Select.stories.tsx:16` | Curtainsider | English | Curtainsider |
| `src/components/Select.stories.tsx:20` | Body type | English | Body type |
| `src/components/Select.stories.tsx:20` | Curtainsider | English | Curtainsider |
| `src/components/Select.stories.tsx:25` | Body type | English | Body type |
| `src/components/Select.stories.tsx:25` | Curtainsider | English | Curtainsider |
| `src/components/SheetField.stories.tsx:16` | Your rate | English | Your rate |
| `src/components/SheetField.stories.tsx:25` | Comment | English | Comment |
| `src/components/SheetField.stories.tsx:25` | I can take this trip today. | English | I can take this trip today. |
| `src/components/SheetField.stories.tsx:34` | Your rate | English | Your rate |
| `src/components/SheetField.stories.tsx:34` | Enter your rate | English | Enter your rate |
| `src/components/Sidebar.stories.tsx:10` | Web shell/Sidebar | English | Web shell/Sidebar |
| `src/components/SortBy.stories.tsx:26` | Soonest deadline | English | Soonest deadline |
| `src/components/StatusPill.stories.tsx:8` | In transit | English | In transit |
| `src/components/SuggestionCard.stories.tsx:17` | Select Lille | English | Select Lille |
| `src/components/SuggestionCard.stories.tsx:26` | Belgium | English | Belgium |
| `src/components/SuggestionCard.stories.tsx:26` | Select Brussels | English | Select Brussels |
| `src/components/ViewSwitch.stories.tsx:19` | Section 1 | English | Section 1 |
| `src/components/ViewSwitch.stories.tsx:19` | Section 2 | English | Section 2 |
| `src/components/ViewSwitch.stories.tsx:20` | Section 1 | English | Section 1 |
| `src/components/ViewSwitch.stories.tsx:20` | Section 2 | English | Section 2 |
| `src/components/ViewSwitch.stories.tsx:20` | Section 3 | English | Section 3 |
| `src/components/ViewSwitch.stories.tsx:24` | Section 1 | English | Section 1 |
| `src/components/ViewSwitch.stories.tsx:29` | Section 2 | English | Section 2 |
| `src/components/ViewSwitch.stories.tsx:34` | Section 1 | English | Section 1 |
| `src/components/ViewSwitch.stories.tsx:39` | Section 2 | English | Section 2 |
| `src/components/ViewSwitch.stories.tsx:44` | Section 3 | English | Section 3 |
| `src/components/ViewSwitch.stories.tsx:54` | Current | English | Current |
| `src/components/ViewSwitch.stories.tsx:54` | Expired | English | Expired |
| `src/components/ViewSwitch.stories.tsx:54` | Declined | English | Declined |
| `src/components/ViewSwitch.stories.tsx:55` | Current | English | Current |
| `src/components/layout/HomeIndicator.stories.tsx:6` | App shell/Home indicator | English | App shell/Home indicator |
| `src/components/layout/NavigationBar.stories.tsx:6` | App shell/Navigation bar | English | App shell/Navigation bar |
| `src/components/layout/NavigationBar.stories.tsx:20` | Loads | English | Loads |
| `src/components/layout/NavigationBar.stories.tsx:22` | Loads | English | Loads |
| `src/components/layout/NavigationBar.stories.tsx:24` | Load details | English | Load details |
| `src/components/layout/NavigationBar.stories.tsx:29` | Load details | English | Load details |
| `src/components/layout/NavigationBar.stories.tsx:31` | Loads | English | Loads |
| `src/components/layout/ScreenFrame.stories.tsx:6` | App shell/ScreenFrame | English | App shell/ScreenFrame |
| `src/components/layout/ScreenFrame.stories.tsx:14` | Loads | English | Loads |
| `src/components/layout/ScreenFrame.stories.tsx:19` | €320 | Нейтральный | €320 |
| `src/components/layout/ScreenFrame.stories.tsx:20` | €3.05/km loaded · 105 km loaded | English | €3.05/km loaded · 105 km loaded |
| `src/components/layout/ScreenFrame.stories.tsx:21` | Tourcoing → Brussels | English | Tourcoing → Brussels |
| `src/components/layout/ScreenFrame.stories.tsx:29` | Load details | English | Load details |
| `src/components/layout/ScreenFrame.stories.tsx:29` | Loads | English | Loads |
| `src/components/layout/StatusBar.stories.tsx:6` | App shell/Status bar | English | App shell/Status bar |
| `src/components/layout/TabBar.stories.tsx:6` | App shell/Tab bar | English | App shell/Tab bar |
| `src/components/layout/TabBar.stories.tsx:20` | Loads | English | Loads |
| `src/components/layout/TabBar.stories.tsx:22` | Applications | English | Applications |
| `src/components/layout/TabBar.stories.tsx:24` | My day | English | My day |
| `src/components/layout/TabBar.stories.tsx:26` | Account | English | Account |
| `src/components/v2/QuickApplyModal.stories.tsx:12` | V2/QuickApplyModal | English | V2/QuickApplyModal |
| `src/components/v2/SmartLoadList.stories.tsx:8` | NordCargo | Имя / бренд | NordCargo |
| `src/components/v2/SmartLoadList.stories.tsx:16` | 14:00–15:00 | Нейтральный | 14:00–15:00 |
| `src/components/v2/SmartLoadList.stories.tsx:18` | 17:00–18:00 | Нейтральный | 17:00–18:00 |
| `src/components/v2/SmartLoadList.stories.tsx:21` | Curtainsider · 12.4 t · 18 pallets | English | Curtainsider · 12.4 t · 18 pallets |
| `src/components/v2/SmartLoadList.stories.tsx:22` | Paid in 7 days | English | Paid in 7 days |
| `src/components/v2/SmartLoadList.stories.tsx:24` | 11:00 | Нейтральный | 11:00 |
| `src/components/v2/SmartLoadList.stories.tsx:28` | BelRoute | Имя / бренд | BelRoute |
| `src/components/v2/SmartLoadList.stories.tsx:33` | Ghent | English | Ghent |
| `src/components/v2/SmartLoadList.stories.tsx:34` | Antwerp | English | Antwerp |
| `src/components/v2/SmartLoadList.stories.tsx:36` | 16:00–17:00 | Нейтральный | 16:00–17:00 |
| `src/components/v2/SmartLoadList.stories.tsx:38` | 18:00–19:00 | Нейтральный | 18:00–19:00 |
| `src/components/v2/SmartLoadList.stories.tsx:41` | Curtainsider · 10 t · 14 pallets | English | Curtainsider · 10 t · 14 pallets |
| `src/components/v2/SmartLoadList.stories.tsx:42` | Paid in 14 days | English | Paid in 14 days |
| `src/components/v2/SmartLoadList.stories.tsx:44` | 12:30 | Нейтральный | 12:30 |
| `src/components/v2/SmartLoadList.stories.tsx:55` | V2/SmartLoadList | English | V2/SmartLoadList |
| `src/stories/Foundations.stories.tsx:35` | Loads on your route €360 | English | Loads on your route €360 |

## 4. Unit-тесты: ссылки на пользовательские строки

| Файл | Строка | Текущий язык | Предложенный English |
|---|---|---|---|
| `src/components/v2/QuickApplyModal.test.tsx:38` | Отправить заявку | Русский | Send application |
| `src/components/v2/QuickApplyModal.test.tsx:40` | Отправить заявку | Русский | Send application |
| `src/components/v2/QuickApplyModal.test.tsx:56` | Отправить заявку | Русский | Send application |
| `src/components/v2/QuickApplyModal.test.tsx:77` | Отмена | Русский | Cancel |

## Примечания

- Toast-библиотек и вызовов toast в src/ не найдено. Сообщения setNote/setCodeError/setCodeInfo включены.
- Польский `wymagany kuzow na palety` содержит опечатку; предложен смысловой English.
- При переводе Body/Requirement и ролей нужны отдельные английские подписи: эти значения участвуют в сравнениях и сохранённом состоянии.
- В SMS-демо есть сообщения об отправке кода, хотя реальный SMS не отправляется. В таблице дан перевод; формулировки требуют отдельного UX-решения.
- Это статический аудит исходников, не проверка всех экранов в браузере.
