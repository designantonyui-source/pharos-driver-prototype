# Pharos Driver — case study

**A payments-first prototype of a European freight-driver app.**

Role: product design + front-end engineering.
Scope: 25 screens, 76 components, a full payments domain, a design-token pipeline, and an
automated quality gate — built as a clickable prototype, then written up.

---

## 1. The brief I set myself

The obvious way to build a freight-app prototype is to start with the map: pins, matching, a
bottom sheet with a rate. It is what every competitor screenshots, and it is the part that is
least likely to be wrong.

I wanted to build the part that is hardest to get right and hardest to fake:

> **What happens to a driver's money — from the moment the load is delivered to the moment it lands
> in a bank account, including the paths where it does not.**

That decision shaped everything else. The map exists, but it is scaffolding for the ledger.

---

## 2. The problem, stated precisely

A driver in this market is a **carrier company** (`Northway Freight SAS`), not a gig worker. Three
consequences follow, and each one became a design requirement:

1. **Money is earned before it is payable.** Freight runs on net terms — the load says
   *"Paid in 7 days"*. A driver who delivered on Monday owns €435, but cannot withdraw it on Monday.
   A single "balance" number is a lie. → **The balance splits into Available and Pending.**

2. **The payout is to a company account, in EUR, inside the EU.** The rail is SEPA. → **IBAN is the
   base destination; a card is a paid speed option, not the foundation.**

3. **A B2B carrier needs paperwork.** The platform or the carrier issues a VAT invoice per trip.
   → **Invoices are part of the money flow, not a separate "documents" feature.**

The naïve design — one balance, one payout button, a receipt — fails all three.

---

## 3. Research: two schools of wallet design, and why only one transfers

I scanned roughly 45 wallet screens and 4 complete payout flows, and found two distinct patterns
that split cleanly by geography.

### 3.1 US gig — free weekly bank transfer, paid instant to debit

DoorDash, Uber, Upside. The universal skeleton:

```
Available / Pending → Cash out CTA → method (bank/card) → amount → review → confirm → success → history
```

Cash-out to a debit card is charged ~$0.50–1.99. I adopted the **skeleton** — it is rail-independent
and maps cleanly onto the balance, cash-out, confirm and history screens in this build.

### 3.2 EU contractor — IBAN in, cards out

BlaBlaCar, Deel, Upwork, Turo, Grab Driver, Uber Eats. Here IBAN is the only inbound method, and
cards appear in the **outbound** direction (spending the balance on virtual cards). IBAN forms
validate before saving — shape plus check digits — and display masked (`FR76 .... 985`).

**The finding that changed the product:** no EU freight app pays drivers to a card. The
instant-to-debit pattern is a US debit-network artefact. Copying it into an EU product would
promise what the rail cannot deliver.

### 3.3 The conclusion

I shipped **one method done properly** (validate → save → cash out → history) rather than two
methods faked, and made the card an opt-in **speed lane** on top of a free SEPA base. The
additional argument for IBAN-first: a card drags in PCI DSS scope, a tokeniser and 3DS; an IBAN
needs one string and a mod-97 checksum.

*Full analysis with sources: [`design/PAYMENTS-VISION.md`](../design/PAYMENTS-VISION.md) §3.*

---

## 4. The decisions, and what each one cost

### Decision 1 — Split the balance into Available and Pending

**What:** two derived numbers computed from a single ledger, not two stored counters.

**Why:** net terms mean earned ≠ payable. The UI has to be honest about which is which, or the
driver discovers the difference at the cash-out screen.

**How:** `getBalance()` walks the ledger once and accumulates. Nothing is stored twice, so the two
numbers cannot drift.

**Cost:** every balance-reading screen has to decide what to show. The "pending" line only renders
when pending > 0, and the recent-activity list labels each row `Paid` or `Pending`.

**Rejected alternative:** one balance with a "available from" date. Simpler, but it hides the
distinction and makes the cash-out screen responsible for explaining itself.

### Decision 2 — Quote before you execute

**What:** the provider is asked to price the rail *before* the user commits, and the confirm sheet
shows the **total debit**, not just the amount.

**Why:** a fee the driver discovers after the fact is a support ticket. `maxWithdrawalFor(available, fee)`
and the `amount + fee > available` check mean a €10 minimum can never overdraw on a €1.50 instant rail.

**Cost:** one extra round trip to the provider before the confirm sheet renders, and a provider
interface that must price without executing.

**Rejected alternative:** show the fee as a static table. Cheaper, but it cannot express
"the fee depends on the rail *and* the amount", and it rots the moment the fee table changes.

### Decision 3 — Put the PSP behind an interface, and put the PAN behind a token

**What:** `PayoutProvider` with `quote` / `execute`, and a `Destination` type that has no field a
card number could occupy.

```ts
type Destination =
  | { kind: 'iban'; iban: string; label: string }
  | { kind: 'card'; token: string; last4: string; brand: string; label: string };
```

**Why:** screens should not know which provider is behind the button. `MockPayoutProvider` and a
Stripe Connect implementation are interchangeable without touching a single screen. And a type that
*cannot* hold a PAN is a stronger guarantee than a code review that checks nobody stores one.

**Cost:** a slightly more abstract API than `fetch(...)`, and the mock's behaviour has to be
deliberately realistic (600 ms latency, `mock_sepa_*` refs) or the UI gets tuned against a fantasy.

**Rejected alternative:** call the provider from the screen component. Faster to write, and it is
the reason most prototypes end up with payment logic sprinkled across a codebase.

### Decision 4 — Model payout failure as a first-class state machine

**What:** `processing → delayed → failed → returned` (plus `paid`), with the outcome on a
**permanent screen** rather than a disappearing toast.

**Why:** "the bank rejected the transfer" is the single most common real-world driver complaint.
If the product only has a success path, it is wrong exactly when it matters. The rule
`returnWithdrawalFunds(id, feeRefunded)` credits the **amount** back and debits the **fee** unless
policy refunds it — because a failed transfer should not cost the driver money, but a provider
that actually attempted the transfer may have charged a fee.

**Cost:** four more states to design, plus the retry story. The retry is explicitly a **separate
operation**, not a re-run of the failed one.

**Guarded by idempotency:** every transition checks status *and* the idempotency key, so replays,
reloads and double clicks never debit or refund twice. This was a deliberate implementation
constraint, not a happy-path assumption.

### Decision 5 — Adjustments are rows, not edits

**What:** disputes, damage claims, bonuses and corrections are **explicit ledger entries with a
reason and a note**.

**Why:** the moment a balance can be silently adjusted, "why is my balance this?" becomes
unanswerable. With rows, the answer is always in the list.

**Cost:** the balance screen has to explain a fourth row type to users who only care about trips.

### Decision 6 — Invoices as EU B2B documents

**What:** seller and buyer blocks with VAT IDs, a VAT line, a reverse-charge note for intra-EU
supply, a dependency-free A4 PDF and a monthly CSV.

**Why:** this is what a carrier company needs to file. A receipt is not paperwork.

**Cost:** the VAT scheme and the question of *who issues the invoice* are business decisions I
deliberately did not invent — they are logged as open questions (§8) with what each answer would
change.

**On the PDF:** I generated it as a self-contained A4 document and print it via the system dialog,
rather than pulling in jsPDF or html2canvas. Selectable text, exact VAT arithmetic, no canvas
rasterisation, zero dependencies — and it looks identical on every machine because it carries its
own print stylesheet instead of app tokens.

---

## 5. How it is put together

```
screens (25)  ──▶  lib/api.ts  ──▶  lib/store.ts  (localStorage)
                        │
                        ├──▶ lib/psp.ts          PayoutProvider interface + mock
                        ├──▶ lib/invoices.ts    invoice model, mock API, CSV
                        └──▶ lib/profile.ts     methods, IBAN/card validation, schedules
```

**One ledger, many readers.** The ledger is the single source of truth for balance, history,
invoices and the withdrawal screen. Every writer goes through `ensureLedger()`, so a fresh store
never loses the seeded history. (That was a real bug: delivery on a fresh store dropped the €720 of
settled history, because the writers built the ledger from scratch. It was caught by a temporary
screenshot spec, not by a unit test — which is why the capture script became permanent.)

**The mock backend is one file.** `src/lib/api.ts` is the only place that would change to swap the
prototype for a real backend.

**Design tokens are exported from Figma, not re-typed.** `design/tokens.json` → `src/styles/tokens.css`.
No hardcoded values in components; `pnpm tokens` regenerates the stylesheet.

**The token guard.** An undefined CSS variable does not warn. Inside a shorthand, the browser drops
the entire declaration — so a control renders with no border and no background and looks *empty*
rather than *broken*. That is exactly how an `Input` shipped broken once. `tools/audit-tokens.mjs`
resolves every `var(--x)` in `src/` (including dynamic template-literal names) against the generated
set and **fails the build** on an undefined reference.

---

## 6. Edge cases the design had to survive

| Case | Behaviour |
|---|---|
| No payout method yet | Balance CTA becomes "Add payout method to cash out" instead of a dead button |
| Method still verifying | Cash-out blocked with a reason, not a spinner |
| Withdrawal below the minimum | Blocked with the amount stated ("Minimum withdrawal is EUR 10") |
| Fee pushes the total over the balance | Blocked — *amount + fee* is checked, not amount alone |
| Provider returns the money | Amount credited back, fee debited unless policy refunds it |
| Withdrawal replayed / double-clicked | Idempotency key + status guard — no double debit |
| Load disappears from the feed | Trip, invoice and ledger line keep the same `loadId`, so the money stays linked to the work |
| Empty ledger, empty methods, no invoices | Icon + headline + one-sentence explainer — never a bare row |
| API error | Inline `Alert` with a working **Retry** that re-runs the loader |
| Screen reader on the progress list | `aria-current="step"`, and `ProgressStep` **is** the `<li>` — no invalid nested list items |
| A filter or direction matches nothing | The sheet names what does not match and offers the tap that recovers — never a disabled button with no way out |
| Any count shown on a button | Computed with the same rules the feed applies, so the number is the number you get |

### 6.1 Eleven real defects the case-study pass found

Writing the case study forced me to walk the money loop screen by screen, and eleven things turned
out to be wrong. I fixed all eleven and locked each one with a test — a case study is not worth
much if the thing it describes is quietly broken.

**A count on a button is a promise, and the feed did not keep it.**
The direction sheet said *"Show 6 loads"* and the feed then showed 2. Two different rules for an
empty destination: the feed resolved it to the default one, the sheet counted it as *every*
destination. Both now go through one resolver, so the count cannot drift from the result. The
filters sheet had the same shape — it counted the whole catalogue (4) while the feed applied the
committed direction (2). A number on a button is a promise; it has to be computed with the rules
the feed applies.

**Zero matches was a dead end.**
The sheet offered a disabled *"No loads match"* button and no way out except clearing a field by
hand. It now says what does not match — *"No loads on Antwerp → Paris"* — and offers the tap that
recovers: *"Show 1 load toward Paris"*. The filters sheet gets the same explanation.

**The progress list was invalid HTML.**
`ApplicationProgress` wrapped `ProgressStep` in an `<li>`, and `ProgressStep` renders its own
`<li>` — so the accessibility tree contained `<li> cannot contain a nested <li>`. The step now *is*
the list item, and callers pass list-item attributes (`aria-current`) straight through.

**The visible title and the accessible name were different strings.**
The sheet read *"Loads towards"* to the eye and *"Change direction"* to a screen reader — and the
title described only the destination of a sheet that edits both ends. They now match.

**The optional field looked disabled.**
The browser's default placeholder is 50% alpha of the text colour, so the empty origin sat next to
the filled destination looking greyed out — as if it could not be edited. It now reads *"Anywhere"*,
the same word the feed header uses, at a legible contrast.

**The sticky action kept asking for a document the customer had already accepted.**
On a delivered trip the primary button read "Upload POD" unconditionally, so after the customer
accepted the POD the app still offered to re-upload it — and clicking it opened a file picker. The
button now follows the money state: *Upload POD → POD under review → Awaiting customer payment →
Cash out earnings*. After delivery the deed is no longer physical, it is financial, and the button
says so.

**The proof-of-delivery copy contradicted the state.**
The same panel said *"Upload a signed delivery document"* under a POD the customer had already
approved. It now has one message per POD status, including *"The customer rejected this document ·
Upload a corrected one below."*

**Removing a payout method took one tap and asked nothing.**
The X button deleted the saved method immediately — and if it was the only one, the driver was
left unable to cash out, with no warning and no way back. There is now a `RemoveMethodSheet` that
states the consequence before the driver commits: removing the only method says *"You will not be
able to cash out until you add another one"*, removing the default says *"Another saved method
becomes the default"*. The confirm button is a danger button; the escape hatch is "Keep method".
This was the one destructive action in the app without a confirmation — cancelling a trip and
cancelling an application already had sheets, and hiding a load is reversible with Restore + Undo.

**The balance did not follow the money.**
The money screens fetched once on mount, so when the customer paid while the balance screen was
already open, the card kept showing *"EUR 435.00 pending"* and EUR 720 available. The single most
important beat of the demo appeared to do nothing. The screens now refetch when the ledger
changes — and only then, via a stable ledger reference, so unrelated store writes (chat, profile,
dismissed loads) do not trigger a refetch.

**The decision deadline belonged to the load, not the application.**
The tracker reused the load's apply-by timestamp as the dispatcher decision deadline. On a load for
tomorrow it rendered *"Decision by tomorrow 10:24"* — a 24-hour wait after the driver had already
applied. The fix was product logic, not copy: the clock now starts at submit and is capped at
**20 minutes** (`submittedAt + 20 min`), with legacy local state capped on read so an old deadline
cannot resurrect the wait. The screen now reads *"Typical reply: ~15 min · Decision by 10:29."*

**A second status banner duplicated the card.**
The feed showed *"In review"* on the load card and repeated the same waiting state in a banner above
List/Map, with its own three-step progress bar. Removed: the card owns waiting status and
*"View status"*, and only a confirmed trip keeps the active-trip mini-player (km to go, stage,
*"Open"*). A second progress bar did not help the driver choose a load.

None of these were found by reading the code. The first three were found by *using* the app, the
fourth and fifth by looking at a screenshot, the sixth and seventh by walking the money loop, and
the eighth by pressing the destructive method removal without a confirmation. The last three came
from the presenter pressing "customer paid" while sitting on the balance screen, using a load
scheduled for tomorrow, and looking at the feed after applying. The balance bug was visible only
because the E2E run surfaced a console error that nobody was reading.

---

## 7. How I verified it

| Gate | What it covers | Result |
|---|---|---|
| `pnpm check` | token audit → `tsc --noEmit` → production build | clean |
| `pnpm test` | Vitest + Testing Library | **210 passing** |
| `pnpm test:e2e` | Playwright at 402×874 — the money loop as a user walks it | **16 passing** |
| `pnpm capture:case-study` | regenerates the screenshot set from the running app | 23 screens |

The E2E suite is not a smoke test — `e2e/balance.spec.ts` walks IBAN entry → cash-out → confirm
sheet → history, a card method with the instant fee quote, the invoice list → details → PDF link,
and the auto-withdraw rule. That is the money loop, asserted end to end.

CI runs all four gates on every push and every pull request.

---

## 8. What I did not decide

Eight questions belong to a human with commercial context, not to a designer with a prototype. I
left them open, and wrote down what each answer would change, instead of inventing plausible
numbers and presenting them as settled:

1. **PSP** — Stripe Connect vs Adyen for Platforms.
2. **KYB/KYC depth** before the first withdrawal.
3. **Real numbers** — minimum withdrawal, instant fee, ETA per rail.
4. **Pending release** — customer-payment webhook vs fixed net-7/14 terms.
5. **Method ownership** — per driver or per company.
6. **Who issues the invoice**, and under which VAT scheme.
7. **Currencies** — EUR only, or PLN too (the price type already permits it).
8. **Accounting integration** — CSV now, a real ledger later.

The UI marks the prototype policy as a placeholder for the same reason: the fee table in
`psp.ts` is annotated *"NOT approved business rules"*.

---

## 9. What I would do next

**In this order, because it is the order of risk:**

1. **Replace the mock PSP with a real sandbox** (Stripe Connect test mode) and keep the interface.
   The screens should not change — that is the point of the interface. This would also surface the
   real webhook shapes, which the current status machine only approximates.
2. **Make the pending-release rule explicit and event-driven.** Today "customer pays" is a walkthrough
   button; in production it is a webhook that must be idempotent. The ledger already carries an
   idempotency key, so the shape is there.
3. **Add a real KYB step before the first withdrawal.** Unverified methods are already blocked from
   cash-out — that stub is where KYB plugs in.
4. **Add a second currency (PLN)** with an FX quote and an FX line in the invoice.
5. **Reduce the bundle.** 612 kB in a single chunk is fine for a prototype and wrong for a product;
   route-level `React.lazy` on the payments screens is the obvious first move.
6. **Test the unhappy paths visually.** The state discipline is implemented, but the skeleton and
   error states have not been screenshotted into the case study yet.

---

## 10. Repository map

| Path | What it is |
|---|---|
| `src/lib/psp.ts` | The payout provider interface — the fintech boundary |
| `src/lib/api.ts` | Mock backend + the ledger, the single source of truth |
| `src/lib/invoices.ts` | EU B2B invoice model, mock API, CSV export |
| `src/lib/invoicePdf.ts` | Dependency-free printable invoice |
| `src/lib/profile.ts` | IBAN mod-97, card Luhn/tokenise, schedules, adjustments |
| `src/screens/v2/Balance.tsx` | Balance, payout methods, cash-out, history, withdrawal details |
| `src/screens/v2/Invoices.tsx` | Invoice list and details |
| `src/screens/v2/Schedules.tsx` | Auto-withdraw rules, runs, statement |
| `tools/audit-tokens.mjs` | The token guard that fails the build |
| `tools/capture-case-study.mjs` | Regenerates the screenshot set |
| `design/PAYMENTS-VISION.md` | Payments research, decisions, open questions |
| `design/figma-map.md` | Figma node ↔ route/component table |
| `docs/DEMO-SCRIPT.md` | The presenter script |
