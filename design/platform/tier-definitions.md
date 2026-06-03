# nTogether — Tier Definitions
Last updated: 2026-04-24 (pricing revised)

---

## Core Principles

- **5 tiers.** Tier 1 is the most private and most expensive. Tier 5 is fully public and free.
- **User DATA HUB access is constant across all tiers.** Every tier generates the same data for the user's personal DATA HUB and intelligence engines. The tier controls only what the *platform* can see and do with that data — not what the user gets back from it.
- **Social capability is constant across all tiers.** No tier restricts what a user can post or who they can interact with. Every user controls privacy per interaction: private (self only), selectively shared (chosen users or groups, with privacy-level warnings), or fully public.
- **Tier is not a social label.** Other users cannot see someone's tier. It is an infrastructure and pricing setting, not a status signal.
- **Data is encrypted at creation time, keyed to the tier it was created at.** Immutable — re-keying is structurally impossible. Upgrading or downgrading a tier does not retroactively change the encryption on existing data.

---

## Tier Pricing Model

Fixed pricing. All tiers include monthly and annual options; annual saves ~17%.

| Tier | Monthly | Annual | Lifetime |
|------|---------|--------|----------|
| Tier 1 | $50/mo | $500/yr | TBD — launch offer |
| Tier 2 | $35/mo | $350/yr | TBD — launch offer |
| Tier 3 | $25/mo | $250/yr | TBD — launch offer |
| Tier 4 | $12/mo | $120/yr | TBD — launch offer |
| Tier 5 | Free | Free | — |

### Launch offer — free subscriptions
At launch, all tiers are free for all users for a defined period. Duration TBD. This allows early adopters to experience any tier before committing to a subscription.

### Lifetime subscriptions
Lifetime subscriptions for Tiers 1–4 will be offered during the launch window. Pricing TBD. Once the launch window closes, lifetime subscriptions are no longer available.

---

## Identity Requirements

| Tier | Identity required |
|------|------------------|
| Tier 1 | None — fully anonymous |
| Tier 2 | None — fully anonymous |
| Tier 3 | Verified email (minimum) |
| Tier 4 | Verified email (minimum) |
| Tier 5 | Full identity verification |

> ⚠️ What constitutes "full identity verification" for Tier 5 is TBD (e.g. government ID, phone, address — scope not yet defined).

---

## Tier Definitions

### Tier 1 — Zero Knowledge

**Platform data access:** None beyond what is structurally required to deliver the service. The platform cannot see, store, or index any behavioral or identity data. No profiling, no analytics, no data linked to the user.

**Identity:** None required. Fully anonymous.

**ANALYZER:** Queries processed on-device by a local LLM. No query data leaves the user's machine.

**Coin:**
- Conversion rate at floor — best available rate
- Lowest transaction fees
- Full choice across all transaction privacy options

**Pricing:** $50/month · $500/year · Lifetime TBD (launch only)

---

### Tier 2 — Aggregate Only

**Platform data access:** Aggregate and anonymized statistics only. The platform can see platform-level usage patterns (e.g. feature usage rates across the user base) but holds no individual behavioral records and cannot link any data point to the user's identity.

**Identity:** None required. Fully anonymous.

**ANALYZER:** Queries processed on-device by a local LLM.

**Coin:**
- Near-floor conversion rate
- Low transaction fees
- Transaction parties hidden by default

**Pricing:** $35/month · $350/year · Lifetime TBD (launch only)

---

### Tier 3 — Behavioral, No Identity

**Platform data access:** Behavioral patterns visible to the platform — usage, preferences, engagement signals, content interactions. Used for personalization and platform improvement. Data is not sold and is not linked to a real-world identity. The platform knows *what* the user does, not *who* they are.

**Identity:** Verified email required.

**ANALYZER:** Queries processed by platform LLM. Users are explicitly informed that queries are processed server-side.

**Coin:**
- Mid conversion rate
- Mid transaction fees
- Transaction parties hidden; amounts visible

**Pricing:** $25/month · $250/year · Lifetime TBD (launch only)

---

### Tier 4 — Identified, Not Sold

**Platform data access:** Full behavioral data collected and linked to the user's verified identity. The platform can use this data internally — for personalization, product development, and internal analytics — and may share it in aggregate with partners. Individual data is not sold on the marketplace.

**Identity:** Verified email required.

**ANALYZER:** Queries processed by platform LLM.

**Coin:**
- Near-spread conversion rate
- Near-highest transaction fees
- Transaction amounts hidden; parties visible

**Pricing:** $12/month · $120/year · Lifetime TBD (launch only)

---

### Tier 5 — Fully Public (Free)

**Platform data access:** Full collection and monetization. All behavioral data, identity data, and usage patterns are indexed and available for sale through the CONNECT data marketplace. The user earns coin from their data sales.

**Identity:** Full identity verification required. ⚠️ *Verification scope TBD.*

**ANALYZER:** Queries processed by platform LLM.

**Coin:**
- Highest spread on conversion
- Highest transaction fees
- All transactions fully public by default (partner minimums may override)

**Pricing:** Free.

---

## Cross-Tier Interactions

When two users at different tiers interact, the higher-privacy user's data is always protected at their tier level:
- The lower-privacy side of the interaction cannot expose the higher-privacy side
- When a Tier 5 user tags a Tier 1 user, the Tier 1 identifier is anonymized before storage — scrubbed at the write path, not post-process
- Coin transactions between tiers: the higher-tier user's privacy settings take precedence regardless of the lower-tier user's settings

---

## Per-Interaction Privacy Controls (All Tiers)

Regardless of tier, every user controls the visibility of every interaction individually:

| Setting | Who can see it |
|---------|---------------|
| Private | Only the posting user |
| Selectively shared | Chosen users or groups. Platform warns the poster if any recipient's tier means the platform will have access to that interaction. |
| Fully public | Anyone on the platform or (for public PROFILE content) the open web |

The tier does not restrict which of these a user can choose. A Tier 1 user can post fully publicly. A Tier 5 user can post privately. The tier controls what the platform collects in the background — not what the user chooses to share.

---

## Open Items

- Full identity verification scope for Tier 5
- Free launch window duration
- Lifetime subscription pricing for Tiers 1–4
- Exact coin conversion rates and transaction fee amounts per tier
- Staking rates and lock-in periods per tier
