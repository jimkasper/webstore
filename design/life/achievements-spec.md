# ACHIEVEMENTS — Spec
Last updated: 2026-04-27

---

## Overview

ACHIEVEMENTS is the provable goal and reward system for nTogether. A user sets a goal, defines how it will be proven, and earns rewards when they follow through. The point is accountability with evidence — not self-reporting.

Proof is gathered from real data sources the user has already connected: location, motion, calendar, financial transactions, health data, receipt scans, streak counts, and custom LENS queries. The user owns all proof data locally; nothing is shared unless they choose to post an achievement to their SPACE.

Rewards are tiered with progressive bonuses. As streaks grow, reward multipliers increase. Rewards convert to platform credits usable in TRADING POST.

Achievement templates — pre-built goal + proof bundles — can be published to and purchased from TRADING POST.

---

## Goal types

| Type | Description | Example |
|------|-------------|---------|
| **Frequency** | Do X thing N times per time window | Go to the gym 3×/week |
| **Streak** | Do X thing every day / every week without breaking | Journal every day for 30 days |
| **Threshold** | Keep a metric above or below a value | Spend < $200 on dining this month |
| **Milestone** | Complete a one-time achievement | Run a 5K |
| **Abstention** | Avoid something for a period | No alcohol for 30 days |
| **Collaborative** | Goal shared between two or more users | Both partners cook at home 4×/week |

---

## Proof mechanisms

Each goal has one or more attached proof sources. All proof data is stored locally; the platform never reads it.

### Location-based
| Mechanism | How it works |
|-----------|-------------|
| **Venue check-in** | Device enters a saved place radius (gym, studio, office). Requires ≥ N minutes inside the zone to count. |
| **Route completion** | Device traces a path matching a saved route (running loop, commute). Completion = start point → end point within tolerance. |
| **New location visited** | Device visits a lat/lng not previously visited (travel goal). |
| **Venue avoidance** | Device does NOT enter a saved zone for the goal period (e.g. no bar check-ins this week). |

### Motion & activity
| Mechanism | How it works |
|-----------|-------------|
| **Step count** | Daily step count from device pedometer exceeds threshold. |
| **Distance covered** | GPS-tracked distance in a session (run, cycle, walk). |
| **Active minutes** | Device reports elevated activity for N continuous minutes. |
| **Workout session** | Health data import shows workout session (Apple Health, Google Fit, Garmin). |

### Calendar & schedule
| Mechanism | How it works |
|-----------|-------------|
| **Event completion** | A Scheduler event of a given type is marked complete. |
| **Blocked time** | A time block of N hours is protected in Scheduler (no meetings scheduled). |
| **Consistent bedtime** | Calendar + device activity shows lights-out before a target time. |

### Financial
| Mechanism | How it works |
|-----------|-------------|
| **Transaction below threshold** | Bank/card import shows spending in a category below limit for the period. |
| **No transaction in category** | Zero transactions flagged as a specific category (e.g. bars, fast food). |
| **Savings deposit** | Bank import shows a transfer to savings account. |
| **Receipt scan** | User photographs a receipt; OCR extracts merchant, date, and amount into Financial. Eligible receipts (grocery, healthy restaurant) count toward nutrition or budget goals. |

### Habit & LIFE app
| Mechanism | How it works |
|-----------|-------------|
| **Habit logged** | Planner habit entry recorded for the day. |
| **Journal written** | Journal entry exists for the day. |
| **Streak maintained** | Planner streak count for a habit reaches N days. |
| **Task completed** | A specific Scheduler or Lists task is marked done. |

### Social
| Mechanism | How it works |
|-----------|-------------|
| **Group accountability** | A named contact (accountability partner) confirms via a quick tap in CONTACTS. Both users see shared progress. |
| **Public commitment** | User posted goal to their SPACE Wall; followers can react. Post timestamp is proof of declaration. |

### LENS query (advanced)
Any LENS SQL query that returns a non-empty result set counts as proof. This enables arbitrarily complex goals:
```sql
-- Proof: cooked at home at least 4 times this week
SELECT 1 FROM activity_reflections r
JOIN events e ON r.event_id = e.id
WHERE e.type_tag = 'errand'
  AND r.spend_category = 'Groceries'
  AND r.created_at > datetime('now', '-7 days')
HAVING COUNT(*) >= 4
```

---

## Progressive reward tiers

Each goal has a reward tier that advances as consistency is maintained.

| Tier | Requirement | Reward multiplier | Badge |
|------|-------------|-------------------|-------|
| **Bronze** | First completion / 1–2 consecutive periods | 1× | 🥉 |
| **Silver** | 3–6 consecutive periods | 1.5× | 🥈 |
| **Gold** | 7–11 consecutive periods | 2× | 🥇 |
| **Platinum** | 12–23 consecutive periods | 3× | 💎 |
| **Diamond** | 24+ consecutive periods | 5× | 💠 |

A **period** is the goal's recurrence unit: day (for daily goals), week (for weekly goals), or month.

### Grace periods
Each goal gets **one grace period per calendar month** — miss once without breaking the streak. Grace periods do not stack. Using a grace period keeps the current tier but does not advance toward the next.

### Streak recovery
If a streak breaks (past the grace period), the user drops back to Bronze but retains a **personal best** record. Reaching a previously held tier again grants a **comeback badge** in addition to the standard tier badge.

---

## Reward types

| Reward | Description |
|--------|-------------|
| **Platform credits** | Earned at each tier completion. Spendable in TRADING POST on themes, algorithms, trigger presets, and digital products. |
| **SPACE badges** | Visual badges displayed on the user's SPACE profile (optional — user chooses which to show). |
| **Feature unlocks** | Certain platform features are unlocked at achievement milestones (e.g. custom domain discount, extended cloud storage). |
| **Personal rewards** | User-defined rewards set at goal creation: "If I hit Gold on gym attendance, I buy the guitar pedal." Displayed as a reminder at each tier unlock. |
| **Trading Post credits** | Bonus credits usable specifically for TRADING POST purchases. |

### Credit rates (base, before multiplier)
| Goal difficulty | Credits per period |
|----------------|-------------------|
| Easy (e.g. journal daily) | 5 credits |
| Medium (e.g. gym 3×/week) | 15 credits |
| Hard (e.g. no alcohol 30 days) | 40 credits |
| Custom | User-set at goal creation |

---

## Achievement templates (TRADING POST)

A template bundles a complete goal configuration: type, proof mechanism(s), period, reward tier structure, and optional trigger presets. Templates can be:
- **Built-in** — shipped with nTogether, free
- **Community-made** — published by users to TRADING POST
- **Paid** — purchased with credits or direct payment

### Built-in templates (selection)

| Template name | Goal | Proof | Period |
|---------------|------|-------|--------|
| Gym regular | 3× gym visits | Location: entered gym zone | Weekly |
| Daily journaler | Write every day | Journal: entry exists | Daily |
| Sober week | No alcohol | Financial: no bar/liquor spend | Weekly |
| Morning mover | 30 active minutes before 9am | Motion: active minutes + time window | Daily |
| Cook at home | 4 home-cooked meals | Receipt scan: grocery + location home | Weekly |
| No fast food | Zero fast-food transactions | Financial: category = fast food | Weekly |
| 10k steps | 10,000 steps | Pedometer | Daily |
| Reading habit | 20 minutes of reading | Habit log: Reading | Daily |
| Budget week | Stay under weekly spending limit | Financial: total spend < threshold | Weekly |
| Run the loop | Complete saved running route | Route completion | Custom |
| No social media mornings | No social app use before 9am | Device: screen time API | Daily |
| Bedtime by midnight | In bed before midnight | Device idle + time window | Daily |

---

## Sharing & social

Achievements are **private by default**. The user can choose to:
- **Post to Wall** — shares the achievement badge, streak count, and goal name to their SPACE. Proof data is never included in the post.
- **Share with accountability partner** — sends a progress summary to a specific contact via MESSENGER.
- **Show on profile** — pins selected achievement badges to their SPACE About or Wall sidebar.

A special **#AchievementUnlocked** post template auto-formats the badge, tier, and streak for social sharing.

---

## Schema

```sql
CREATE TABLE achievements (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  goal_type       TEXT NOT NULL,  -- frequency | streak | threshold | milestone | abstention | collaborative
  proof_sources   JSON NOT NULL,  -- [{type, params}, ...]
  period          TEXT NOT NULL,  -- daily | weekly | monthly | once
  difficulty      TEXT NOT NULL,  -- easy | medium | hard | custom
  base_credits    INTEGER NOT NULL DEFAULT 15,
  personal_reward TEXT,           -- user-defined reward text
  partner_id      TEXT,           -- CONTACTS id for collaborative goals
  enabled         INTEGER DEFAULT 1,
  template_id     TEXT,           -- TRADING POST template id if installed
  created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE achievement_periods (
  id              TEXT PRIMARY KEY,
  achievement_id  TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  period_start    TEXT NOT NULL,
  period_end      TEXT NOT NULL,
  completed       INTEGER DEFAULT 0,
  grace_used      INTEGER DEFAULT 0,
  proof_snapshot  JSON,           -- proof data at time of completion (local only)
  credits_earned  INTEGER DEFAULT 0,
  tier            TEXT,           -- bronze | silver | gold | platinum | diamond
  completed_at    TEXT
);

CREATE TABLE achievement_streaks (
  id              TEXT PRIMARY KEY,
  achievement_id  TEXT UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  best_streak     INTEGER DEFAULT 0,
  current_tier    TEXT DEFAULT 'bronze',
  grace_used_this_month INTEGER DEFAULT 0,
  total_credits   INTEGER DEFAULT 0,
  last_completed  TEXT
);

CREATE TABLE credit_ledger (
  id          TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,  -- achievement | trading_post_refund | manual
  source_id   TEXT,
  amount      INTEGER NOT NULL,  -- positive = earned, negative = spent
  balance     INTEGER NOT NULL,
  note        TEXT,
  created_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

---

## Open items

- Whether collaborative goals require both users to be on nTogether (on-platform only) or if off-platform accountability partners can participate via email/text
- Credit exchange rate against TRADING POST prices — needs balancing
- Whether achievements from wearables (Garmin, Whoop, Apple Watch) auto-verify without user action
- Anti-gaming measures: minimum time-in-zone for location proof, route deviation tolerance, handling of airplane mode during proof windows
- Whether screen time API access is available on all platforms (iOS Screen Time API has restrictions)
