# Demo script — the money loop

A 6-minute walkthrough that shows the payments system end to end. Every beat is a real screen in
the prototype; nothing is mocked in the video.

**Setup**

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

Open **`http://localhost:5173/?demo=1`** and set the browser to a **402 × 874** viewport (a phone).
The `?demo=1` query adds a small **Walkthrough** pill in the bottom-right corner — it is the only
piece of dev chrome, it is collapsed by default, and it exists so you can drive the external events
a real system would push (dispatcher approval, customer payment, POD review, payout outcome).

> **Tip:** the pill is available on *every* screen, so you can drive an event and land directly on
> the screen it affects. Hide it before you talk about a screen — it is one tap on the pill.

**The story in one line:** a driver delivers a load, the money is *earned* but not *payable*, the
customer pays and it becomes *available*, the driver cashes out by SEPA, and when the bank rejects
the transfer the money comes back.

---

## Beat 1 · The loads feed (0:00 – 0:45)

**Screen:** `/v2`

The map-first feed. Four loads; the first is **NordCargo, Lille → Brussels, €435, €3.54/km,
111 km, "Paid in 7 days"**.

**Say:**

> "Freight apps all look like this. Map, cards, a rate. I'm not going to spend the demo here —
> the loads feed exists in this prototype to feed the part that actually matters, which is money."

**Tap:** **Apply for €435** → the load sheet opens.

> "One tap to apply, two taps to be in the running. The load says 'paid in 7 days' — hold on to
> that, it's the reason the balance screen looks the way it does."

---

## Beat 2 · Deliver the load (0:45 – 2:00)

**Screen:** application → trip → delivery

**Say:**

> "In a real system the dispatcher approves and the customer confirms. Both are pushes. I'll fire
> them from the walkthrough panel."

Open the **Walkthrough** pill → **→ dispatcher + customer review** → **→ confirmed** → close the panel.

**Screen:** `/trip/nordcargo`

> "The trip has stages: at pickup, loaded, at delivery, delivered — and then proof of delivery."

Open the pill → **→ delivered** → **→ POD submitted** → **→ POD accepted** → close the panel.

**Say:**

> "Proof of delivery has to be accepted before the customer can pay. That's a real gate — it's why
> the money can't just appear on delivery. It's a human on the other end confirming the load
> arrived."

**Screen:** scroll to the **Earnings** block on the trip

> "This is the same state the balance screen will show, one screen earlier: €435, awaiting customer
> payment, expected by 28 Oct. *Money is not available yet — the customer has not paid the
> invoice.* And notice the primary button up here no longer says 'Upload POD' — the deed is done,
> so the button names the next thing, which is money."

> **Watch for:** the sticky button changes with the POD — "Upload POD" → "POD under review" →
> "Awaiting customer payment" → "Cash out earnings" once the money lands. It always names the
> driver's actual next action, and it never offers to re-upload a document the customer already
> accepted.

---

## Beat 3 · Money lands as *pending* (2:00 – 2:30)

**Screen:** Account → Balance

Tap the **Account** tab → **Balance**. Or go directly to `/#/v2/account/balance`.

**Say:**

> "Here's the screen I actually want to be judged on. Available is €720. Pending is €435 — the
> NordCargo trip I just delivered."

> "The driver has *earned* €435. They cannot *withdraw* €435, because the load pays in 7 days.
> Most apps show one number, and the driver discovers the difference at the cash-out screen, which
> is the worst possible moment."

> "And note it's derived, not stored. Both numbers are computed from one ledger, so they can never
> disagree with each other or with the history."

**The line that sells it:** *"Pending money is not available money, and the UI never pretends otherwise."*

---

## Beat 4 · The customer pays (2:30 – 3:00)

**Say:**

> "Now the customer pays. In production that's a webhook; here it's a button."

Open the pill → **→ customer paid** → close the panel.

**Screen:** Balance

> "€435 moved from pending to available. Same trip, same €435, now withdrawable."

> "The invoice flipped to paid in the same operation — the paperwork and the money move together,
> because for a carrier company the invoice is the thing the accountant files."

---

## Beat 5 · Set up a payout method (3:00 – 3:45)

**Screen:** `/#/v2/account/balance/method`

**Say:**

> "Now the driver needs somewhere to get paid. Two options, and the order matters."

Tap the **Card (instant, EUR 1.50)** tab :

> "A card is the *speed* option: 30 minutes, €1.50. Luhn check, brand detection, expiry and CVC
> validation. And the important part — the card number is never stored. It gets tokenised down to
> a token and a last-4."

> "Look at the type on the provider boundary: a card destination is a token and a last-4. There is no
> field a card number could occupy. That's a stronger guarantee than a code review that checks
> nobody stores one."

Switch back to **Bank (SEPA, free)** and type a bad IBAN first — `DE89 3704 0044 0532 0130 01` —
to show the mod-97 rejection :

> "The IBAN is validated with a real mod-97 checksum, not a regex. Wrong check digits, it refuses
> to save — and the Add button stays disabled, so it can't be saved by accident either."

Then type the good one — `DE89 3704 0044 0532 0130 00`  and tap **Add bank account**.

**Say:**

> "Why is IBAN the base and not the card? Because the lanes are European. SEPA is the native rail
> for EU contractor payouts — there is no EU equivalent of the US instant-debit cash-out. A card in
> the EU is something you spend with, not something you receive freight revenue on. The card is
> here as a paid speed lane on top of a free SEPA base, not as the foundation."

---

## Beat 6 · Cash out — quote before execute (3:45 – 4:45)

**Screen:** `/#/v2/account/balance/cashout`

**Say:**

> "Cash out. The destination is preselected — the default method. Type an amount, say 120."

Type `120`, then tap **Cash out EUR 120.00**.

**Screen:** the confirm sheet

**This is the money shot. Point at each line.**

> "Before anything is called, we show: the destination, what you receive, the fee, the **total
> debit**, what remains, and when it arrives. The total debit is the line that matters — a driver
> who sees '120' and gets debited 121.50 does not come back."

> "The provider priced this before the user committed. That quote is what drives the fee-aware
> maximum: the €10 minimum can never overdraw on a €1.50 instant rail, because we check
> *amount + fee* against the balance, not the amount alone."

Tap **Confirm EUR 120.00** → **Confirm with bank app** (the SCA challenge).

**Screen:** the operation

> "The result is a permanent screen with the outcome, not a toast that disappears. If there's a
> problem, the driver needs a place to go back to."

---

## Beat 7 · When the bank says no (4:45 – 5:30)

**Screen:** `/#/v2/account/balance/history`

**Say:**

> "This is the part most prototypes skip, and it's the part that decides whether a driver trusts
> the product."

Open the pill → **→ delayed** → close the panel. Show the operation.

> "The provider needs more time. The withdrawal says so."

Open the pill → **→ failed** → **→ funds returned** → close the panel. Show the returned operation.

> "The bank rejected the transfer. The money comes *back* — the amount is credited to the balance,
> and the fee is debited unless policy refunds it, because a failed transfer shouldn't cost the
> driver money but the provider may have charged one."

> "And the retry is a *separate* withdrawal, not a re-run of the failed one. Every transition is
> guarded by status and an idempotency key, so a double click, a reload or a replayed webhook never
> debits or refunds twice."

> **If asked "what if the driver wants the fee back?"** — that is a policy decision, not a code
> decision. It's `feeRefunded` on the return, and it is one of the open questions in the payments
> vision. I left it explicit instead of burying it.

---

## Beat 8 · Discipline, and the paperwork (5:30 – 6:00)

**Screen:** `/#/v2/account/balance/invoices`

**Say:**

> "Every completed trip produces a real invoice. Seller and buyer, both with VAT IDs, a VAT line,
> and — because these are intra-EU lanes — a reverse-charge note."

Tap **INV-2026-0038** :

> "And it prints. A dependency-free A4 PDF with selectable text and exact VAT arithmetic — no
> jsPDF, no canvas rasterisation, it looks the same on every machine."

> "The invoice links both ways with the trip and the ledger row, so money, paperwork and the work
> itself are one story instead of three disconnected screens."

**Screen:** `/#/v2/account/balance/schedules`

> "Last: payout discipline. Auto-withdraw on a weekly rule or a balance threshold, an adjustment
> ledger where a dispute or a damage claim is an explicit row with a reason — never a silent edit
> to a balance number — and a monthly CSV for the accountant."

> "So: you can always answer *why is my balance this?*"

---

## Closing (6:00)

> "I built this backwards from the money. The map, the matching, the chat — all of that is table
> stakes. The part that's hard to get right is when the money arrives, how you get it out, and
> what happens when the bank says no. That's the part I wanted to be judged on, and it's the part
> I'd want to defend in a design review — because every number in it is derived from one ledger,
> and every decision behind it is written down, including the ones I deliberately didn't make."

---

## Appendix A · The walkthrough panel

The pill in the bottom-right corner, only with `?demo=1`. Four scenarios reset the demo, and the
external events drive the state machines:

| Group | Button | Fires |
|---|---|---|
| Scenarios | `1 · Find and book a load` | resets to the feed |
| | `2 · Complete delivery, unlock earnings` | resets to the trip |
| | `3 · Cash out earnings` | resets to the balance |
| | `4 · Resolve a payout issue` | resets to the history |
| External events | `→ dispatcher + customer review` | application → customer review |
| | `→ confirmed` | application → confirmed |
| | `→ delivered` | trip → at pickup → loaded → at delivery → delivered |
| | `→ POD submitted` / `→ POD accepted` / `→ POD rejected` | proof of delivery |
| | `→ customer paid` | pending → available, invoice → paid |
| Payout outcome | `→ delayed` / `→ paid` / `→ failed` / `→ funds returned` | withdrawal state machine |

Each scenario button **resets** first, so you can always re-run a beat cleanly.

## Appendix B — Recovering if it goes wrong

| Symptom | Fix |
|---|---|
| State is wrong | Walkthrough pill → the scenario button for that step → it resets first |
| The pill covers a screen | Tap the pill to collapse it (it is a toggle) |
| Nothing happens on a demo button | The walkthrough panel shows the error inline — read it |
| Fresh start | Walkthrough pill → `clear storage` |

## Appendix C — Files behind each beat

| Beat | Screen | Code |
|---|---|---|
| 1 | Loads feed | `src/screens/v2/Home.tsx` |
| 2 | Trip | `src/screens/v2/TripDetails.tsx` |
| 3–4 | Balance | `src/screens/v2/Balance.tsx` |
| 5 | Payout methods | `src/screens/v2/Balance.tsx` · `src/lib/profile.ts` |
| 6 | Cash out | `src/screens/v2/Balance.tsx` · `src/lib/psp.ts` |
| 7 | Withdrawal outcome | `src/screens/v2/Balance.tsx` · `src/lib/api.ts` |
| 8 | Invoices / Schedules | `src/screens/v2/Invoices.tsx` · `src/screens/v2/Schedules.tsx` |
| — | The walkthrough panel | `src/components/DemoPanel.tsx` |
