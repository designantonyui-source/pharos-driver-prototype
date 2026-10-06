# Figma ↔ code map

File: `sve9YrMmfz91XQX5IpZjGO` · page **30 — iOS App / Driver** · section **01 · Driver journey** (`2022:2949`)

| Figma node | Name | Route / component | Status |
|---|---|---|---|
| `2022:2949` | section «01 · Driver journey» | — | reference |
| `2689:15268` | iOS / map-unfiltered / NordCargo | `/map` | todo |
| `2767:27747` | iOS / details-v2 / NordCargo | `/load/:id` | todo |
| `2219:8598` | iOS / search-pending-dispatcher / Loads | `/loads?applied=:id` | todo |
| `589:267` | iOS / pending / Application status | `/application/:id` | todo |
| `735:1152` | iOS / pending-customer / Application status | same route, `status=awaiting-customer` | todo |
| `589:334` | iOS / order / Trip TR-4821 | `/trip/:id` | todo |
| `2772:12931` | iOS / first-search-v2.1 / Loads | `/search` | todo |
| `2768:6789` | iOS / searching-v2 / Loads | `/search/loading` | todo |

## Component map (Figma component set → code component)

| Figma set | Node | Code |
|---|---|---|
| `Pharos/App/Offer` (v2 card) | `2594:22063` | `src/components/OfferCard.tsx` — states Default / Loading / Pending |
| `Pharos/Bottom sheet` | `2197:8841` | `src/components/BottomSheet.tsx` — Peek / Full |
| `Pharos/Input` | `12:166` | `src/components/Input.tsx` — Empty / Filled / Focus / Error / Disabled / Readonly (+ hidden `Required` layer) |
| `Pharos/Status` | `11:148` | `src/components/StatusPill.tsx` — tones |
| `Pharos/Alert` | `575:9632` | `src/components/Alert.tsx` — Info / Warning / Error / Success / Neutral |
| `Pharos/Button` | `12:38` | `src/components/Button.tsx` |
| `Pharos/Button link` | `168:118` | `src/components/Button.tsx` — exports `ButtonLink` |
| `Pharos/App/Tab bar` | `586:67` | `src/components/layout/TabBar.tsx` — Active=Loads/Applications/My day/Account |
| `Pharos/App/Status bar` | `2353:26430` | `src/components/layout/StatusBar.tsx` — Type=IOS `2305:25330` / Type=Default `586:20` |
| `Pharos/App/Navigation bar` | `586:33` | `src/components/layout/NavigationBar.tsx` — Type=Home `586:25` / Type=Back `586:32` |
| `Pharos/App/Home indicator` | `586:70` | `src/components/layout/HomeIndicator.tsx` |
| — (402×874 screen) | — | `src/components/layout/ScreenFrame.tsx` — composes the five shell parts |

## Shell metrics (fixed by the design)

screen 402 × 874 · status bar 62 · nav bar 76 · sticky bar 64 · content viewport 614 ·
tab bar y 757 h 83 · home indicator y 840 h 34
