# Pharos Driver — Payments Vision

> Living case-study document. Records product reasoning behind every payments
> decision in the driver prototype: why IBAN first (not cards), what Mobbin
> references taught us, and the 3-wave roadmap for payouts and invoicing.
> Sources: Mobbin scans 2026-10-11 (~45 wallet screens + 4 payout flows),
> prototype ledger in `src/lib/`, PORT-LOG slices.
---

## 1. Context: who gets paid and how

| Fact | Implication |
|---|---|
| Lanes are EU (Lille → Brussels, Ghent → Antwerp), currency EUR | SEPA is the native rail; US instant-pay rails do not exist here |
| Loads carry `paidIn: Paid in 7/14 days` (net terms) | Balance must split **Available vs Pending** — money is earned before it is payable |
| Driver identity is `Alexey K. / Northway Freight · driver` — a carrier company | Payouts go to the **company account**; invoices are mandatory, not optional |
| Prototype has no backend (`src/lib/api.ts` mock + `localStorage`) | No real money, no PSP, no KYC — policy numbers are placeholders by design |
| Design language is measured Figma tokens + iOS grouped lists | Every payments screen reuses `NavigationBar`, `Button`, `Input`, `Alert`, `V2Frame` — no bespoke chrome |

## 2. Why IBAN-only in the first slice

The first Balance slice (`a8e8206`) ships a single payout method: SEPA IBAN.
That was a deliberate product call, not a design shortcut:

1. **EU standard.** Contractor payouts in the EU travel by SEPA transfer
   (1–2 business days). A card in the EU is a spending instrument,
   not a way to receive freight revenue.
2. **No US instant-pay rail.** DoorDash/Uber instant cash-out rides on US debit
   networks (+$0.50–1.99 fee). There is no EU equivalent for driver payouts;
   copying the pattern would promise what the rail cannot deliver.
3. **No PCI burden in prototype.** Storing PAN/CVV — even masked — drags in
   PCI DSS scope, a tokeniser (Stripe/Adyen) and card verification (3DS,
   micro-charges). IBAN needs one string + a mod-97 checksum: zero dependencies.
4. **B2B carrier, not gig worker.** The driver does not need “$20 now”.
   He needs the trip revenue on the company account plus a proper invoice.
5. **Honest scope.** One method done well (validate → save → cash out →
   history) beats two methods faked. The card arrives in Wave 1 as a
   speed option, not as the foundation.


---

## 0. TL;DR

- EU freight pays by **SEPA transfer to IBAN**, not by instant card cash-out.
  The US gig pattern (DoorDash/Uber instant pay to debit) does not transfer.
- Our driver is a **B2B carrier** (Northway Freight), not a gig worker:
  money goes to the company account, and every trip needs an **invoice**.
- Roadmap: **Wave 1** — multi-methods + card-as-speed-option;
  **Wave 2** — invoices (list → details → PDF); **Wave 3** — payout discipline
  (schedules, adjustments, accountant export).
- Open decisions for the human are listed in §7 — the agent does not decide them.
---

## 3. What the market does (Mobbin scan, 2026-10-11)

~45 wallet screens + 4 payout flows. Two schools, split by geography:

### 3.1 US gig — bank transfer + paid instant to debit

- Pattern: free weekly bank transfer as default, **Instant Pay to a debit card**
  as the paid speed option (~$0.50-1.99 per cash-out).
- References: [DoorDash Dasher — Payout methods](https://mobbin.com/flows/0e785b82-bbf7-4bec-bf7c-f9bbb2938353)
  (4 steps), [DoorDash Dasher — Payout history](https://mobbin.com/flows/919f86f8-71bc-4cfd-82b6-f87179a5371d)
  (3 steps), [Upside — Cashing out to bank account](https://mobbin.com/flows/059636af-8db8-4c65-a893-26170bd1b088)
  (7 steps: balance -> amount -> method -> review -> confirm -> success -> receipt).
- Universal skeleton: **Available / Pending -> Cash out CTA -> method
  (bank/card) -> amount -> review/confirm -> success -> history.**
  We adopted this skeleton for Balance — it is rail-independent.
- Lesson for Pharos: the card exists **for speed, not as the base**.
  The base is always the bank account. We mirror that: IBAN first, card later.

### 3.2 EU contractor — IBAN as the base, cards spend outward

- Pattern: IBAN/bank as the only inbound method; cards appear in the
  **outbound** direction (spend the balance: Deel virtual cards).
- References: [BlaBlaCar — Add payout methods](https://mobbin.com/flows/9253e5a8-2033-4bc8-9deb-7f858ce79d17)
  (7 steps), Deel (EU contractor IBAN + verification states), Upwork,
  Turo, Grab Driver, Uber Eats.
- IBAN forms everywhere validate before saving (shape + check digits) and
  display masked (`FR76 .... 985`) — exactly our `validateIban` / `maskIban`.
- Lesson for Pharos: our IBAN-first slice **matches the EU norm**.
  No reference EU freight app pays drivers to a card.

### 3.3 Invoices — a separate world with its own skeleton

- Screens found: Deel ([contractor invoice](https://mobbin.com/screens/e1618360-77b6-4b48-8a84-27a9f90ca2a4)),
  Revolut Business, PayPal, Jobber, Fresha, Remote Global HR.
- Universal skeleton: **invoice list (number/date/amount/status) ->
  invoice details -> download PDF -> archive.**
- Closest to us: **Deel/Remote generate the invoice per payout** — the platform
  issues contractor paperwork automatically. For Pharos that means:
  trip completed -> invoice exists -> driver sees it, accountant downloads it.
- EU B2B specifics spotted: VAT lines, reverse-charge notes, company details
  on both sides. Our Wave 2 must carry VAT from day one, not as an afterthought.

---

## 4. Can we add a card? Yes — as a speed option, not the base

### 4.1 Prototype (no PSP needed)

- Second method type `card`: number (mask + Luhn), expiry, CVC (never stored,
  never logged), cardholder name.
- Rail picker in Cash out: **SEPA free / 1-2 days** vs **Card instant / +EUR 1.50
  prototype fee** — same confirm Sheet, different ETA line.
- Verification stub: `verifying -> verified` status chip on the method row,
  mirroring Deel's states.

### 4.2 Production (requires PSP + compliance)

- Stripe Connect or Adyen for Platforms: SEPA payouts + card payouts,
  card tokenisation (PAN never touches our servers).
- KYB on the carrier (company documents, UBO, IBAN ownership check via
  micro-deposits or open banking) before the first withdrawal.
- 3DS for card verification; fee split decision: does the driver or the
  platform pay the instant fee?
- Explicit non-goals: storing PAN in our API/localStorage, card input without
  a tokeniser in production, promising "instant" without a confirmed limit.

### 4.3 Recommendation

Ship the card as the **paid speed lane** on top of the free SEPA base —
the US-gig economics, transplanted onto the EU rail reality.
Default stays IBAN; the card is opt-in per withdrawal.
---

## 5. Roadmap: three waves

Each wave is one commit-slice (design + tests + E2E + PORT-LOG entry),
per repo rules (AGENTS.md #3/#8). No wave starts before the human approves it.

### Wave 1 — Payout methods v2 (next)

- Multi-methods: several IBANs + one card, default flag, method badge in Cash out.
- Card form: number + Luhn + `.... 4242` mask, expiry/CVC, holder name.
- Rail picker in Cash out: SEPA free (1-2 days) vs Card instant (+EUR 1.50 prototype).
- Method verification stub: `verifying -> verified` chip.
- Entry criteria: human confirms card-in-scope + prototype fee number.

### Wave 2 — Invoices

- Route `/v2/account/balance/invoices`: list (INV-2026-XXXX, date, lane,
  amount, VAT, status Paid / Pending / Overdue).
- Invoice details: customer, lane, rate, VAT line + reverse-charge note (EU B2B),
  `Download PDF` (locally generated, like storybook-static).
- Links both ways: History trip row -> its invoice; invoice -> its trip.
- Entry criteria: human confirms VAT scheme + who issues the invoice
  (platform vs carrier).

### Wave 3 — Payout discipline

- Schedules: auto-withdraw Fridays / on EUR 500 threshold.
- Adjustments ledger lines: dispute, damage claim — explicit rows with reasons,
  never silent balance edits.
- Accountant export: monthly CSV, tax annotations.
- Entry criteria: human confirms schedule semantics + adjustment policy.

---

## 6. What is already built (prototype)

| Piece | Where | Notes |
|---|---|---|
| Balance home (Available / Pending card, Cash out CTA, method row, recent-3) | `src/screens/v2/Balance.tsx` (Balance) | Dark `color-nav-bg` card, `text-metric-28` |
| SEPA/IBAN method (mod-97, grouped display, mask) | `Balance.tsx` (PayoutMethodScreen) + `src/lib/profile.ts` | `validateIban` / `formatIban` / `maskIban` |
| Cash out (amount, quick chips, confirm Sheet, success) | `Balance.tsx` (CashOut) | `PAYOUT_POLICY` placeholder |
| Unified ledger (trips + withdrawals) | `Balance.tsx` (BalanceHistory) + `src/lib/store.ts` | `ledger` slice, seeded 2+1 |
| Entry from Account | `src/screens/v2/Account.tsx` (Earnings section) | Wallet row |
| Back navigation | `V2BackBar` (`NavigationBar.tsx`) | History-back + fallback on all v2 screens |
| Tests 91 + E2E + stories | `Balance.test.tsx`, `profile.test.ts`, `e2e/balance.spec.ts`, `Balance.stories.tsx` | IBAN unit, cash-out flow, history |

---

## 7. Open questions (human decides, agent does not)

1. PSP: Stripe Connect vs Adyen for Platforms (or other)? SEPA + card payouts.
2. KYB/KYC before the first withdrawal — yes/no, and how deep?
3. Real numbers: minimum withdrawal, instant fee, ETA per rail.
4. Pending release: webhook on customer payment vs fixed net-7/14 terms?
5. Multi-method: how many IBANs/cards, per-driver or per-company?
6. Invoices: platform-issued (Deel model) or carrier-issued? VAT scheme + reverse charge?
7. Currencies: EUR-only for now, or PLN already (present in `price.currency` type)?
8. Statements/tax export: CSV now, full accounting integration later?

---

## 8. Changelog

| Date | Entry |
|---|---|
| 2026-10-11 | Waves 1-3 built: PSP adapter + card/multi-methods (`85162ce`), invoices + PDF/CSV (`154a09a`), schedules + adjustments + statement (this slice). | IBAN-first rationale, market analysis, 3-wave roadmap, open questions. |
