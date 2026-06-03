# tokenTogether — Coin Design Decisions

> Working name: **tokenTogether** (final name TBD)
> Last updated: 2026-04-23

---

## Supply

- **Model**: Revenue matched — new tokens minted only as platform revenue grows; supply is fully backed at all times.
- **Burn**: None — supply is managed entirely through revenue matching.
- **Denomination**: 2 decimal places.

---

## Tiers

- 5 tiers, directly linked to the platform's existing pricing tiers (same names, same levels).
- Coin tier is determined solely by the user's current pricing tier.
- **Downgrade**: Coin tier drops immediately when pricing tier drops.
- Full tier definitions including pricing model, identity requirements, and platform data access: see `tier-definitions.md`.

---

## Privacy

Privacy options are unlocked by tier. Higher-numbered tiers cannot compromise the privacy of lower-numbered tiers — when transacting with a Tier 1 user, the Tier 1 side stays shielded regardless of the other party's settings.

Partners may enforce a minimum privacy level; this overrides even Tier 5's default.

| Tier | Options available |
|------|-------------------|
| Tier 1 | Full choice across all options |
| Tier 2 | Both hidden |
| Tier 3 | + Parties visible |
| Tier 4 | + Amounts visible |
| Tier 5 | Fully public (partner minimum may override) |

---

## Governance

**Model**: Hybrid — the platform proposes major changes; proposals are approved or denied by a multi-group vote.

**Voting groups**:
- Token holders (shareholder-style voting weight)
- Verified users
- Elected user council
- Most engaging / most influential user council
- Early adopter council (dissolves as members become inactive)

All council votes are public.

---

## Wallet

All features included:
- Send and receive
- Full transaction history (with context tags from suite apps)
- Conversion (coin to fiat or other currencies)
- Staking

---

## Staking

- **Reward model**: Hybrid — fixed base rate plus a revenue-share bonus.
- **Lock-in**: Tiered — longer commitment earns a higher rate.
- Specific rates and lock-in periods: TBD.

---

## Distribution

All four methods are in scope:

| Method | Description |
|--------|-------------|
| Earned through use | Users earn coins through achievements and engagement |
| Creator rewards | Data sellers and algorithm creators earn coins |
| Purchasable | Coins can be bought in-app with fiat or crypto |
| Founding allocation | Seeds the rewards and achievement pool |

### Founding Allocation
The founding allocation funds the rewards and achievement pool — it does not go to founders, investors, or early adopters.

### Creator Rewards
- **Base**: Flat reward per data sale or algorithm use.
- **Bonus**: Usage bonus that scales with how frequently a creator's algorithms are used.

### Earning Rates
Dynamic — rates are adjustable by the platform.

### Achievement Types
Three types of earning activities:
1. **Milestones** — one-time rewards for reaching a threshold (e.g. 100 posts).
2. **Streaks** — recurring rewards for consistent activity over time.
3. **Challenges** — both time-limited events and community goals (group targets the whole platform works toward together).

---

## Transaction Fees

- Tiered — Tier 1 pays the lowest fees; Tier 5 pays the highest.
- Specific fee rates: TBD.

---

## Off-Platform Use

- **Model**: Partnered — coin is accepted by platform-approved third parties only.
- **Approval**: Platform team approves partners case by case.
- Partners may set their own minimum privacy requirements for transactions.

---

## Purchasing

- In-app only — users buy coins directly inside nTogether with fiat or crypto.
- No external exchange listing at this time.

---

## Open Items

- Final coin name
- Staking rates and lock-in periods per tier
- Transaction fee amounts per tier
- Creator reward amounts (flat base + bonus structure)
- Achievement coin values (milestone amounts, streak rates, challenge rewards)
- Founding allocation size and release schedule
- Partner criteria and onboarding process details
