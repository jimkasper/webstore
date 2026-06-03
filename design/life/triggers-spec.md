# TRIGGERS — Spec
Last updated: 2026-04-27

---

## Overview

TRIGGERS is the condition engine that powers context-aware reminders across the nTogether platform. Instead of firing at a fixed date and time, a triggered reminder fires when a user-defined set of real-world conditions are all true at the same time.

A **Trigger** is a named bundle of one or more **Conditions**. When every condition in the bundle evaluates true simultaneously, the trigger fires and delivers the attached reminder or action.

Triggers are used in:
- **CONTACTS** — fire a reminder when you are near a contact, or when a contact's birthday is approaching and you are free
- **Scheduler** — fire a task prompt when your schedule clears
- **Journal** — prompt a nightly entry when you have been stationary at home for 30 minutes
- **Planner** — nudge when a milestone is approaching and you have open calendar time
- **Around Town** — alert when you are near a venue that has a current special active
- **TRADING POST** — community-made named presets that can be installed and traded

---

## Condition types

Every condition belongs to one of eight families. A single trigger can mix conditions from any families.

---

### 1. Location

| Condition | Description |
|-----------|-------------|
| `at_place` | Device is within a saved place radius (Home, Work, Gym, any named place) |
| `entered_zone` | Device just crossed into a geofenced circle (lat/lng + radius) |
| `left_zone` | Device just crossed out of a geofenced circle |
| `near_contact` | Device is within X miles of a CONTACTS record that has location sharing enabled |
| `at_transit_hub` | Device is at a detected airport, train station, or bus terminal |
| `left_familiar_area` | Device has moved outside all known/saved places (traveling) |
| `near_venue` | Device is within X miles of an Around Town entry |

**Saved places** are named lat/lng anchors. Default set: Home, Work. User adds custom places (Gym, Studio, Parents', etc.). Each place has a configurable radius (0.1–5 miles).

---

### 2. Motion & Activity

| Condition | Description |
|-----------|-------------|
| `moving` | Device is in motion (speed > threshold) |
| `stationary` | Device has not moved for N minutes |
| `in_vehicle` | Speed and movement pattern consistent with vehicle travel |
| `walking` | Pace consistent with walking |
| `arrived` | Motion stopped at a new location (not a known place) |
| `just_left` | Motion started after being stationary at a known place |

Motion is derived from the Web Geolocation API (web) and CoreMotion/SensorManager (native). On web, `in_vehicle` and `walking` are estimated from speed alone; native apps have full activity recognition.

---

### 3. Calendar & Schedule

| Condition | Description |
|-----------|-------------|
| `schedule_free` | No events in the next N hours on the user's calendar |
| `schedule_free_rest_of_day` | No more events today |
| `next_event_in` | The next calendar event starts in < N minutes |
| `just_finished_event` | A calendar event ended < N minutes ago |
| `event_type_next` | The next event has a specific type tag (Work, Exercise, Date, etc.) |
| `working_hours` | Current time falls within the user's configured working hours |
| `outside_working_hours` | Current time is outside working hours |

---

### 4. Time

| Condition | Description |
|-----------|-------------|
| `time_window` | Current time is between HH:MM and HH:MM |
| `day_of_week` | Today is one of the selected weekdays |
| `relative_to_sunrise` | N minutes before or after sunrise (uses location for calculation) |
| `relative_to_sunset` | N minutes before or after sunset |
| `morning` | Preset: 6am–10am |
| `afternoon` | Preset: 12pm–5pm |
| `evening` | Preset: 6pm–10pm |
| `late_night` | Preset: 10pm–2am |

---

### 5. Social & Contacts

| Condition | Description |
|-----------|-------------|
| `with_contact` | Device co-located with a specific CONTACTS record (location sharing) |
| `with_group_member` | Device co-located with any member of a named GROUPS group |
| `contact_birthday_in` | A contact's birthday is in N days |
| `contact_followup_overdue` | A contact has a follow-up date that has passed |
| `contact_posted` | A followed on-platform contact just published to their SPACE |
| `contact_anniversary_in` | N days until a contact's `when_met` anniversary |

---

### 6. LIFE app state

| Condition | Source app | Description |
|-----------|------------|-------------|
| `journal_not_written_today` | Journal | No journal entry for today |
| `task_overdue` | Scheduler / Lists | One or more tasks past their due date |
| `habit_not_logged_today` | Planner | A tracked habit has no entry today |
| `financial_budget_near` | Financial | Spending in a category > N% of budget |
| `goal_milestone_approaching` | Planner | A milestone deadline is within N days |
| `streak_at_risk` | Planner | A streak will break if no entry today |
| `venue_special_active` | Around Town | A saved venue currently has an active special |
| `water_target_not_met` | Diet | Daily hydration target not yet reached |
| `lens_query_true` | LENS | A saved LENS SQL query returns any rows |

---

### 7. Device & Network

| Condition | Description |
|-----------|-------------|
| `connected_to_wifi` | Device is on a specific saved WiFi SSID (Home network, Work network) |
| `disconnected_from_wifi` | Device just disconnected from a known WiFi network |
| `charging` | Device is plugged in |
| `battery_below` | Battery < N% |
| `app_opened` | User opened nTogether |
| `device_idle` | No device interaction for N minutes |

---

### 8. Environment (optional — requires user permission)

| Condition | Description |
|-----------|-------------|
| `weather_condition` | Current weather matches: sunny, cloudy, raining, snowing |
| `temperature_above` | Outside temperature > N °F/°C |
| `temperature_below` | Outside temperature < N °F/°C |
| `air_quality_poor` | AQI above threshold |

Weather conditions are fetched from a configurable weather API using the device's current location. They are evaluated at trigger-check time, not continuously.

---

## Evaluation logic

Triggers are checked on a **poll-and-event** model:

- **Event-driven checks** — a subset of conditions fire immediately on a state change: `entered_zone`, `left_zone`, `just_finished_event`, `contact_posted`, `app_opened`, `connected_to_wifi`, `disconnected_from_wifi`
- **Polled checks** — everything else is evaluated on a configurable interval (default: every 5 minutes when app is active; every 15 minutes when backgrounded)

When every condition in a trigger evaluates true in the same check cycle, the trigger fires. A **cooldown** (default: 1 hour) prevents the same trigger from firing again immediately. The cooldown is configurable per trigger.

A trigger can have an **expiry**: a date after which it is automatically disabled.

---

## Preset triggers (built-in defaults)

These ship with nTogether and are available in every installation. They are read-only but can be cloned and customized.

| Preset name | Conditions |
|-------------|-----------|
| **When I get moving and my schedule is free** | `moving` + `schedule_free(2h)` |
| **End of workday** | `outside_working_hours` + `schedule_free_rest_of_day` |
| **Weekend morning** | `day_of_week(Sat,Sun)` + `morning` + `stationary` |
| **On the commute** | `in_vehicle` + `time_window(7am–9am OR 5pm–7pm)` |
| **Just got home** | `entered_zone(Home)` + `stationary(10min)` |
| **Just got to work** | `entered_zone(Work)` |
| **Leaving work** | `left_zone(Work)` + `outside_working_hours` |
| **Lunch break** | `time_window(12pm–1:30pm)` + `schedule_free(45min)` |
| **Evening wind-down** | `evening` + `stationary` + `connected_to_wifi(Home)` |
| **Before a big meeting** | `next_event_in(30min)` + `event_type_next(Work)` |
| **After I land** | `arrived` + `at_transit_hub` |
| **When I'm near [Contact]** | `near_contact(?)` + `schedule_free(30min)` — user fills in contact |
| **Someone I know is working tonight** | `evening` + `near_venue(?)` — paired with Around Town friends-on-staff |
| **Streak at risk** | `evening` + `streak_at_risk` |
| **Journal not written** | `evening` + `journal_not_written_today` + `stationary` |
| **Budget alert** | `financial_budget_near(90%)` |
| **Habit window** | `morning` + `habit_not_logged_today` |

---

## Trigger builder UI

The trigger builder is accessible from:
- Any reminder field in CONTACTS, Scheduler, Journal, Planner, or Around Town
- The Triggers section in LIFE settings
- The TRADING POST publish flow

**Builder steps:**
1. **Name the trigger** — free text label
2. **Add conditions** — searchable list of all condition types, grouped by family; each condition has inline configuration controls (e.g. radius slider for `at_place`, contact picker for `near_contact`)
3. **Set logic** — AND (all must be true, default) or configure per-condition
4. **Set cooldown** — how long after firing before it can fire again
5. **Set expiry** — optional date
6. **Attach action** — the reminder text, app action, or notification to deliver on fire
7. **Test** — run a simulated check against current conditions

---

## LENS integration

Any LENS SQL query can be used as a trigger condition via `lens_query_true`. This is the most powerful condition type: if the user can express a data pattern in SQL, they can trigger a reminder on it.

Example:
```sql
-- Fire when I haven't exercised in 3 days
SELECT 1 FROM activity_reflections
WHERE event_id IN (SELECT id FROM events WHERE type_tag = 'exercise')
AND created_at > datetime('now', '-3 days')
HAVING COUNT(*) = 0
```

LENS query triggers are only available when LENS is installed. They are evaluated on the poll interval (not event-driven).

---

## TRADING POST integration

A user can **publish** any custom trigger preset to TRADING POST as a listing. The listing includes:
- Preset name and description
- Category tag (Work / Health / Social / Travel / Routines / Creative / Finance / Other)
- Required apps (e.g. "Requires Around Town", "Requires LENS")
- Price: free or paid (platform credits or direct payment)
- A preview of the condition bundle (conditions shown; values may be redacted for paid listings)

On install, the trigger is copied to the buyer's local trigger library with all conditions intact. Values that reference personal data (contact names, saved places) are left as empty slots for the buyer to fill in.

Published presets carry ratings and install counts. Popular presets surface in the TRADING POST "Trigger Presets" category.

---

## Schema

```sql
CREATE TABLE triggers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  conditions   JSON NOT NULL,    -- [{type, params, ...}, ...]
  logic        TEXT DEFAULT 'AND', -- 'AND' only for now
  cooldown_min INTEGER DEFAULT 60,
  expires_at   TEXT,             -- ISO date, nullable
  enabled      INTEGER DEFAULT 1,
  source       TEXT DEFAULT 'custom', -- 'builtin' | 'custom' | 'installed'
  tp_listing_id TEXT,            -- TRADING POST listing ID if installed
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE trigger_attachments (
  id           TEXT PRIMARY KEY,
  trigger_id   TEXT REFERENCES triggers(id) ON DELETE CASCADE,
  owner_type   TEXT NOT NULL,    -- 'contact_reminder' | 'scheduler_event' | 'journal_prompt' | 'standalone'
  owner_id     TEXT,             -- foreign key to the owning record
  action_type  TEXT NOT NULL,    -- 'notify' | 'open_app' | 'journal_prompt'
  action_text  TEXT,             -- notification body
  last_fired_at TEXT,
  fire_count   INTEGER DEFAULT 0
);

CREATE TABLE trigger_condition_types (
  -- read-only reference table, seeded at install
  id           TEXT PRIMARY KEY,
  family       TEXT NOT NULL,    -- location | motion | calendar | time | social | life | device | environment
  name         TEXT NOT NULL,
  params_schema JSON NOT NULL,   -- JSON Schema for the condition's configurable parameters
  requires_app TEXT,             -- null | 'lens' | 'around_town' | etc.
  native_only  INTEGER DEFAULT 0 -- 1 if this condition requires the native app
);
```

---

## Open items

- Whether AND-only logic is sufficient or if OR branches are needed (e.g. "when I'm at Home OR Work")
- Privacy implications of `near_contact` — requires mutual opt-in; consent model TBD
- Whether LENS query triggers run in a sandboxed worker to prevent query abuse
- Background execution limits on web (service workers have restricted wake intervals); native apps have more latitude
- Whether trigger presets purchased on TRADING POST are locked to one device or transferable across the user's devices
