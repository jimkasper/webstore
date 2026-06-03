# DATA IMPORT — Spec
Last updated: 2026-04-27

---

## Overview

nTogether can import data from virtually any platform or service the user already uses. Imported data flows into LENS as historical events, enriches LIFE apps with pre-existing records, and can seed ACHIEVEMENTS goals with past proof. The user owns everything locally — imports never leave the device.

Two import modes:

| Mode | Description |
|------|-------------|
| **File import** | User downloads their data export from the source platform and imports the file into nTogether. One-time or repeated. |
| **Live connection** | nTogether connects directly to the source service via API or OAuth. Data stays current automatically. |

Live connections require the user's permission and are revocable at any time from Settings → Connections.

---

## Social media & content platforms

| Platform | Export type | What imports |
|----------|-------------|--------------|
| **Twitter / X** | Archive ZIP (`data/tweets.js`, `data/like.js`, `data/following.js`) | Posts, likes, following list → CONTACTS, LENS timeline |
| **Instagram** | JSON export (Meta Download Your Data) | Posts, stories metadata, followers/following → CONTACTS, LENS |
| **Facebook** | JSON export (Meta Download Your Data) | Posts, events, friends → CONTACTS, LENS |
| **TikTok** | JSON export | Posts, favorites, following → CONTACTS, LENS |
| **LinkedIn** | CSV export (`Connections.csv`, `Messages.csv`) | Connections → CONTACTS (with job title/company auto-filled), messages summary → LENS |
| **Reddit** | JSON export | Posts, comments, saved → LENS, Research notes |
| **YouTube** | Google Takeout (`watch-history.json`, `subscriptions.csv`) | Watch history → LENS, subscriptions → CONTACTS |
| **Mastodon / Fediverse** | ActivityPub archive | Posts, follows → CONTACTS, LENS |
| **Substack** | CSV subscriber export | Subscribers → CONTACTS (Groups: Newsletter) |
| **Patreon** | CSV patron export | Patrons → CONTACTS (Groups: Supporters) |

**What happens to following/followers lists:** Each account found is matched against existing CONTACTS. New accounts are offered as suggested contacts with source tagged `imported`. The user reviews before any contact record is created.

---

## Health & fitness

| Source | Connection type | What imports |
|--------|----------------|--------------|
| **Apple Health** | Native iOS HealthKit API | Steps, workouts, sleep, heart rate, weight → ACHIEVEMENTS proof, LENS, Diet |
| **Google Fit** | OAuth live connection | Steps, workouts, sleep → ACHIEVEMENTS, LENS |
| **Garmin Connect** | OAuth live connection | Workouts, GPS tracks, sleep, stress → ACHIEVEMENTS, LENS |
| **Fitbit** | OAuth live connection | Steps, sleep, heart rate → ACHIEVEMENTS, LENS |
| **Whoop** | OAuth live connection | Recovery, strain, sleep → ACHIEVEMENTS, LENS |
| **Strava** | OAuth live connection | Runs, rides, routes → ACHIEVEMENTS (route completion proof), Around Town (saved routes) |
| **Oura Ring** | OAuth live connection | Sleep, readiness, activity → LENS, Journal (mood seed) |
| **Samsung Health** | File export | Workouts, steps → ACHIEVEMENTS, LENS |
| **MyFitnessPal** | CSV export | Food log, calorie history → Diet app, LENS |

Health data is stored in the local LENS event log with source tag. It is never synced to nTogether servers at T1–T3.

---

## Financial

| Source | Connection type | What imports |
|--------|----------------|--------------|
| **Bank account (Plaid)** | OAuth live connection | Transactions, balances → Financial, ACHIEVEMENTS proof |
| **Credit card (Plaid)** | OAuth live connection | Transactions → Financial, ACHIEVEMENTS (spending goals) |
| **Bank CSV / OFX / QFX** | File import | Historical transactions → Financial, LENS |
| **Mint export** | CSV file import | Transactions, budgets, categories → Financial |
| **YNAB export** | CSV / JSON file import | Budget entries, transactions → Financial |
| **PayPal** | CSV export | Transactions → Financial, LENS |
| **Venmo** | CSV export | Transactions → Financial |
| **Crypto wallets** | Address watch (read-only) | Balance and transaction history → Financial, LENS |
| **Receipt scan** | Camera capture (in-app) | OCR extracts merchant, date, total, line items → Financial. Uses vision AI (local or cloud). |
| **Grocery receipt** | Camera capture | Items parsed → Diet app (nutrition tracking), Financial |

**Plaid integration:** Plaid is the live bank connection layer. The user authenticates once with their bank through Plaid's hosted flow. nTogether receives read-only transaction data. No bank credentials are stored by nTogether. The Plaid connection token is stored in the device keychain.

**Receipt scan flow:**
1. User taps "Scan receipt" in Financial or the quick-capture menu
2. Camera opens — user photographs receipt
3. Image is sent to vision AI (local model if capable, cloud if permitted)
4. AI extracts: merchant name, date, subtotal, tax, total, line items
5. User reviews extracted data, corrects if needed, confirms
6. Entry saved to Financial with category auto-suggested by merchant name

---

## Professional & productivity

| Source | Connection type | What imports |
|--------|----------------|--------------|
| **Google Calendar** | OAuth live connection | Events → Scheduler (read-only overlay or full import) |
| **Apple Calendar / iCal** | ICS file import | Events → Scheduler |
| **Outlook / Exchange** | OAuth live connection | Calendar + contacts → Scheduler, CONTACTS |
| **Notion** | API + OAuth | Pages and databases → Research notes |
| **Obsidian** | Vault folder import | Markdown notes → Research |
| **GitHub** | OAuth live connection | Commit activity, repos → LENS (work pattern data), CONTACTS (collaborators) |
| **Toggl / Clockify** | OAuth live connection | Time entries → LENS (work hours), ACHIEVEMENTS (focused work goals) |
| **Harvest** | OAuth live connection | Time + invoice data → Financial, LENS |

---

## Entertainment & media

| Source | Connection type | What imports |
|--------|----------------|--------------|
| **Spotify** | OAuth live connection | Listening history, playlists, followed artists → LENS, CONTACTS (artists) |
| **Apple Music** | File export (Scrobble CSV or Last.fm) | Listening history → LENS |
| **Last.fm** | API | Scrobble history → LENS |
| **Netflix** | CSV export (viewing activity) | Watch history → LENS |
| **Letterboxd** | CSV export | Films watched, ratings → Lists app, LENS |
| **Goodreads** | CSV export | Books read, ratings, shelves → Lists app, LENS |
| **Steam** | API (public profile) | Game library, achievements, hours played → LENS |
| **Kindle** | File export (highlights) | Book highlights → Research notes |

---

## Custom / any platform

Any platform not listed can be imported via:

1. **CSV import** — user maps CSV columns to nTogether fields using a drag-and-drop column mapper
2. **JSON import** — raw JSON with a field-mapping interface
3. **LENS SQL import** — paste a JSON or CSV, define a mapping in SQL, preview the import before committing

The column mapper remembers custom mappings under a user-defined name ("My Bank CSV", "Custom Export from X") so repeat imports work in one click.

---

## How imported data appears in LENS

Every imported record becomes a LENS event with:
- `source` — the platform name (e.g. `spotify`, `garmin`, `plaid`)
- `type` — the record type (e.g. `fitness.workout`, `financial.transaction`, `media.listen`)
- `payload` — the full record as JSON
- `recorded_at` — original timestamp from the source

This means users can immediately query across all sources:
```sql
-- How many workouts did I log vs. how many bar transactions did I have each week?
SELECT
  strftime('%Y-W%W', recorded_at) as week,
  SUM(CASE WHEN source = 'garmin' AND type = 'fitness.workout' THEN 1 ELSE 0 END) as workouts,
  SUM(CASE WHEN source = 'plaid' AND json_extract(payload,'$.category') = 'Bars' THEN 1 ELSE 0 END) as bar_visits
FROM lens_events
GROUP BY week
ORDER BY week DESC
```

---

## Goal seeding from imported data

When ACHIEVEMENTS goals are created, the user can optionally **back-fill proof** from imported data. This means:
- A "gym 3×/week" goal seeded from 6 months of Garmin workout data immediately shows historical streaks
- A "budget week" goal seeded from Plaid transaction history shows which past weeks would have passed
- Historical streaks don't earn credits retroactively, but they establish a personal best baseline

---

## Import settings schema

```sql
CREATE TABLE import_connections (
  id           TEXT PRIMARY KEY,
  provider     TEXT NOT NULL,        -- 'plaid' | 'google_calendar' | 'garmin' | etc.
  display_name TEXT NOT NULL,
  auth_type    TEXT NOT NULL,        -- 'oauth' | 'api_key' | 'file'
  -- OAuth tokens stored in system keychain under 'ntogether.import.<id>'
  last_sync_at TEXT,
  sync_enabled INTEGER DEFAULT 1,
  sync_interval_min INTEGER DEFAULT 60,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE import_jobs (
  id           TEXT PRIMARY KEY,
  connection_id TEXT REFERENCES import_connections(id),
  status       TEXT NOT NULL,        -- 'pending' | 'running' | 'done' | 'failed'
  records_imported INTEGER DEFAULT 0,
  error_message TEXT,
  started_at   TEXT,
  finished_at  TEXT
);

CREATE TABLE import_column_maps (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,        -- user-defined name for this mapping
  source_format TEXT NOT NULL,       -- 'csv' | 'json'
  mapping      JSON NOT NULL,        -- column → field mapping
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

---

## Open items

- Plaid availability by country — Plaid covers US/CA/UK/EU; other regions need alternative open-banking APIs (Tink for EU, Basiq for AU)
- Whether Apple Health HealthKit access requires a separate native module in the Expo app or can use the Expo Health plugin
- Rate limits on live connections — some APIs (Spotify, GitHub) have strict rate limits that affect sync frequency
- Whether imported social media posts can be re-posted to the user's SPACE Wall or are LENS-only
- GDPR right-to-erasure handling for imported data — if user deletes a connection, how much of the imported data is purged vs. retained in LENS history
