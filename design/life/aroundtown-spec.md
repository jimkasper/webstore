# Around Town — Design Specification

**App:** AROUND TOWN  
**Suite:** LIFE  
**Platform:** nTogether (privacy-first social platform)  
**Status:** Draft

---

## Overview

AROUND TOWN is a personal city guide — a living, curated list of places to go and things to do. It is the answer to "I don't know what to do tonight." Rather than a discovery feed or algorithmic suggestion engine, it is a personal, hand-curated record of venues, events, and recurring experiences the user actually cares about.

The app combines three ideas that belong together but rarely appear in the same tool:

1. **A place/event list** — the user's own annotated directory of restaurants, bars, gyms, cafés, shows, and recurring events.
2. **Specials tracking** — each venue can carry a list of time-bound deals or recurring promotions (happy hours, wing nights, seasonal openings) with their own rich scheduling so the user can answer "what's on tonight?" without opening a browser.
3. **Friends on staff** — each place entry can list friends who work there, with their work schedule, so the user can see at a glance whether a friend is working tonight before deciding where to go. These links go directly to CONTACTS records.

When the user doesn't know what to do, this is where they look first.

---

## Entry Types

### Place
A permanent venue that does not have an inherent end date. Examples: restaurant, bar, gym, coffee shop, record store.

- Has a name, category, notes, and optional priority flag.
- Can have zero or more specials.
- Can have zero or more friends on staff.
- The schedule field is used to describe a regular visit pattern (e.g. "we go every Friday") rather than the venue's hours — the venue itself is always open at some point.

### Event
A one-time occurrence. Examples: concert, art opening, sports game, pop-up dinner.

- Has a single date (stored as a freeform string, e.g. "Jun 14" or "Saturday August 2").
- Typically has no specials and no friends on staff, though both are permitted.
- Once the date passes the entry is not auto-deleted — the user decides when to remove it.

### Recurring Event
An event that repeats on a predictable schedule. Examples: weekly trivia night, monthly jazz session, annual holiday party.

- Uses the full schedule system (weekly, monthly by date, monthly by Nth weekday, holiday-relative).
- Can have a time window (e.g. "8pm–11pm").
- Can have friends tagged (e.g. "Jordan always comes to this one").
- Functionally the same data model as Place but the user's mental model is "this is something I do" rather than "this is somewhere I go."

The distinction between Place / Event / Recurring Event is a UI affordance, not a schema split. All three map to the same `places` table with a `schedule` column and a `category` column.

---

## Categories

| Icon | Label            | Color   | Notes                                      |
|------|------------------|---------|--------------------------------------------|
| 🍽️  | Restaurants      | #E8603C | Any sit-down or takeout food venue         |
| 🍺   | Bars / Nightlife | #D4A017 | Bars, clubs, cocktail lounges              |
| 📅   | Events           | #4A90D9 | One-time or recurring events               |
| 🎭   | Shows & Concerts | #27AE60 | Live music, theater, comedy, sports        |
| 🏋️  | Fitness          | #E91E63 | Gyms, studios, classes, sports leagues     |
| 🛍️  | Shops & Services | #A07850 | Retail, salons, bookshops, etc.            |
| ☕   | Cafés            | #A16207 | Coffee shops, tea houses, bakeries         |
| ✦    | Other            | #71717A | Anything that doesn't fit above            |

Category colors are used as accent stripes on cards and as badge backgrounds in the detail panel.

---

## Schedule System

Inherited directly from the aroundTown React source (`/home/user/nTogether/chat files/aroundTown/aroundTown.txt`). All schedule values are stored as a JSON object with a `type` field plus type-specific fields. The `describe()` function converts any schedule object to a human-readable string.

### Schedule Types

| Type               | Fields                                  | Example output                           |
|--------------------|-----------------------------------------|------------------------------------------|
| `none`             | —                                       | (no badge shown)                         |
| `single`           | `value: string`                         | "Jun 14"                                 |
| `weekly`           | `days: number[]` (0=Sun … 6=Sat)        | "Every Thursday" / "Every Mon, Wed, Fri" |
| `monthly_date`     | `day: number` (1–31)                    | "Monthly on the 15th"                    |
| `monthly_weekday`  | `ordinal: -1\|1\|2\|3\|4`, `day: 0–6`  | "Last Friday of each month"              |
| `holiday`          | `holiday: string`, `offset: number`     | "The day before Thanksgiving"            |

### Holidays Supported
Easter, Thanksgiving, Memorial Day, Labor Day, New Year's Eve, 4th of July, Christmas.

### Offset Values (for holiday-relative)
−7 (1 week before), −3, −2, −1 (day before), 0 (that day), +1, +2, +3, +7 (1 week after).

The `DateSchedulePicker` component in the React source implements a tabbed UI for all six types and is reused as-is for both entry scheduling and specials scheduling. The `describe()` helper produces the schedule badge string shown on cards and in the detail panel.

---

## Specials Tracking

Each Place entry can carry a list of **specials** — time-bound deals, recurring promotions, or seasonal events tied to that venue.

### Special Fields

| Field         | Type         | Description                                                         |
|---------------|--------------|---------------------------------------------------------------------|
| `id`          | uuid         | Primary key                                                         |
| `place_id`    | fk → places  | Parent entry                                                        |
| `type`        | enum         | One of: `happy_hour`, `weekly_special`, `one_time_deal`, `seasonal` |
| `name`        | string       | Short label, e.g. "Wing Night"                                      |
| `description` | string       | Detail, e.g. "$0.50 wings all night"                                |
| `schedule`    | json         | Same schedule object as used for entries (see above)                |
| `time_window` | string       | Optional freeform time range, e.g. "4pm–7pm" or "11am–3pm"         |
| `ends_on`     | string       | Optional end date for seasonal specials, e.g. "Sep 1"              |

### Special Types

- **Happy Hour** — time-windowed drink/food deal, typically weekly on specific days.
- **Weekly Special** — a recurring feature (dish, event, theme) on a fixed day.
- **One-Time Deal** — a single promotional event; uses `single` schedule type.
- **Seasonal** — available for a date range; uses `ends_on` to mark expiry.

### Examples

- "Happy Hour — Half price cocktails + $2 drafts · Mon–Fri 4–6pm"
- "Wing Night — $0.50 wings all night · Every Tuesday"
- "Bottomless brunch $25 · Every Sunday 11am–3pm"
- "Summer patio opens · May 1 through Sep 1"
- "Anniversary tasting menu · One night only, Jun 20"

### UI Behavior

- Specials appear in a dedicated **Specials** section in the detail panel, below the notes.
- Each special shows: type badge (color-coded by type), name, description, schedule string, and time window.
- Specials active today are highlighted with an amber accent.
- The specials list is collapsed when empty and expanded by default when at least one special exists.
- Specials are added and edited via a modal that reuses the `DateSchedulePicker` component.

---

## Friends on Staff

Each Place entry can list **friends who work there**, linked directly to CONTACTS records. This is the primary integration point between Around Town and the CONTACTS app.

### Staff Record Fields

| Field          | Type             | Description                                            |
|----------------|------------------|--------------------------------------------------------|
| `id`           | uuid             | Primary key                                            |
| `place_id`     | fk → places      | Parent place                                           |
| `contact_id`   | fk → contacts    | Links to the CONTACTS record                           |
| `role`         | string           | Job title / role at this venue, e.g. "bartender"       |
| `schedule`     | json             | Work schedule (same schedule system)                   |
| `time_window`  | string           | Shift hours, e.g. "7pm–2am"                            |
| `notes`        | string           | Optional personal note, e.g. "ask for Alex directly"   |

### "Works Tonight" Logic

When viewing the detail panel, each staff member shows a green dot ("works tonight ●") if their work schedule includes the current day of the week. This is a local, client-side computation against the schedule object — no server call is needed.

Example schedule: `{ type: "weekly", days: [4, 5, 6] }` → works Thu, Fri, Sat → if today is Saturday, show the dot.

### UI in Detail Panel

- Section header: **Friends on Staff**
- Each entry: avatar (from CONTACTS, fallback to initials + color) · full name · role · schedule string + time window
- If the friend works tonight: a green dot and "works tonight" label appear inline
- Two action buttons per staff member: **Message** (opens MESSENGER compose to this contact) and **View Contact** (opens their CONTACTS detail)
- Staff list is editable via an "Add Friend" button that opens a contact picker filtered to existing CONTACTS records

---

## Priority / Want to Go

Any entry can be starred as **Priority** — meaning "I want to do this soon, don't let it fall off my radar."

- Priority entries get a ★ icon on their card (amber color, #D4A017).
- A filter pill on the list view allows showing only priority entries.
- Priority is a boolean flag (`priority: boolean`) on the places table.
- No ranking within priority — all priority entries are equal; ordering is by title.

---

## Cross-App Integration

### Scheduler
- Any entry (place or event) has an **"Add to Scheduler"** button in its detail panel.
- Tapping this opens the Scheduler's new-event modal pre-filled with: title from the place/event, date from the schedule, and a back-link to the Around Town entry.
- For recurring events, the Scheduler event is also created as recurring.
- For one-time events with a specific date, the Scheduler event is a single date.

### CONTACTS
- The "Friends on Staff" section links each staff member to their full CONTACTS record.
- Tapping **View Contact** opens the CONTACTS detail panel for that person in-place (slide-over or navigation).
- The CONTACTS record for a person may also surface "works at" entries back in Around Town (reverse link — see Open Items).

### MESSENGER
- Each entry's detail panel has a **"Let's go?"** quick-action button.
- Tapping it opens a MESSENGER compose pre-filled with: a suggested message ("Hey, want to check out [place name]?") and all tagged contacts (both "friends on staff" and any general tagged contacts) as recipients.
- If a group thread already exists with those contacts, it routes to the existing thread.

---

## Data Schema

### `places`
```
id            uuid        PK
user_id       uuid        FK → users
category      text        One of the category IDs
title         text        Display name
note          text        Personal notes / description
schedule      jsonb       Schedule object (see Schedule System)
priority      boolean     Default false
created_at    timestamptz
updated_at    timestamptz
```

### `place_specials`
```
id            uuid        PK
place_id      uuid        FK → places (cascade delete)
type          text        happy_hour | weekly_special | one_time_deal | seasonal
name          text        Short label
description   text        Detail copy
schedule      jsonb       Schedule object
time_window   text        e.g. "4pm–7pm"
ends_on       text        Optional end date for seasonal
sort_order    integer     Display order within a place
```

### `place_staff`
```
id            uuid        PK
place_id      uuid        FK → places (cascade delete)
contact_id    uuid        FK → contacts
role          text        e.g. "bartender"
schedule      jsonb       Work schedule object
time_window   text        e.g. "7pm–2am"
notes         text        Personal note
sort_order    integer
```

### `place_tags`
```
id            uuid        PK
place_id      uuid        FK → places (cascade delete)
contact_id    uuid        FK → contacts  — general "tagged friend" (not staff)
```

*Note: `place_tags` is for the existing "Tag Friends" feature from the React source (friends loosely associated with a place, e.g. "Jordan loves this bar"). `place_staff` is the richer record for friends who actually work there.*

---

## Open Items

1. **"Works tonight" accuracy** — The schedule system is day-of-week based, not calendar-aware. Holiday schedules ("works the day before Thanksgiving") will not be respected in the "works tonight" computation in v1. Flag as a known limitation.

2. **Staff schedule vs. personal visit schedule** — The entry-level schedule object currently means "when I visit" or "when this event occurs." For staff, the schedule means "when they work." Both use the same `DateSchedulePicker`. UX copy should make this distinction clear in the editing UI.

3. **Specials notifications** — A future feature could send a notification at (e.g.) 3:30pm on days when a happy hour at a priority venue is starting at 4pm. Requires a notification system and user preferences; out of scope for v1.

4. **Reverse link from CONTACTS** — Whether a person's CONTACTS detail page surfaces their "works at" entries from Around Town is an open design question. It requires either a join query from CONTACTS into Around Town's `place_staff` table, or a denormalized list on the contact record. Decision deferred.

5. **Venue search / import** — Currently all entries are manually created. A future version could integrate with a places API (Google Places, Foursquare) to pre-fill venue details. Privacy implications must be reviewed before any third-party API call. Out of scope for v1.

6. **Past events** — One-time events whose date has passed are not auto-archived. Users manually delete them. A future "archive" feature could move past events to a separate view. Open question: should the app warn the user that an event date has passed?

7. **Multiple locations** — If a chain venue has multiple locations (e.g. a gym with two branches), the current model requires two separate entries. Multi-location support is out of scope for v1.

8. **Specials "active now" accuracy** — The `time_window` field is freeform text. Computing whether a special is active at the current time requires parsing this string. In v1, "today" highlighting is sufficient; real-time "active now" computation is a future enhancement.
