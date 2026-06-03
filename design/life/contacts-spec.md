# CONTACTS — Spec
Last updated: 2026-04-24

---

## Overview

CONTACTS is the personal address book for nTogether. It is a LIFE sub-app that also powers the social layer on the user's SPACE. A single unified contact store serves both personal productivity (tagging people in Scheduler events, listing parties in Agreements, @-mentioning people in Journal entries) and the social graph (followers, following, connections on SPACE).

CONTACTS is the single source of truth for "people the user knows." Every other app that involves people — Scheduler, Journal, Agreement, Posthumous, MESSENGER — reads from and writes back to CONTACTS.

---

## Contact types

Every contact is one of two types:

| Type | Description |
|------|-------------|
| **On-platform** | Linked to an nTogether SPACE handle. Display name and avatar sync live from their SPACE profile. |
| **Off-platform** | A person not on nTogether. Stored with name, email, phone, and any custom fields the user adds. Fully private by default. |

A contact's type can change: an off-platform contact automatically upgrades to on-platform when merge detection links them to a registered SPACE handle.

---

## Following = Contact

When a user follows another user on nTogether, that person is automatically added to CONTACTS as an on-platform contact. The contact record is created silently with no user action required.

Unfollowing does **not** delete the contact — it removes the follow relationship only. The user must manually delete the contact record if they want it removed entirely.

---

## Core data fields

### Identity
| Field | Notes |
|-------|-------|
| Display name | On-platform: synced from SPACE profile. User can add a local alias that overrides the display. |
| Avatar | On-platform: synced from SPACE profile. Off-platform: user-uploaded photo or initials fallback. |
| SPACE handle | On-platform only (`@handle`). Links to their SPACE. |
| Email | Optional. Used for merge detection on off-platform contacts. |
| Phone | Optional. |
| Profession / hobby / skill | Free-text descriptor shown on the contact card. |
| Company | Optional organization name. |
| Location | City, country, or freeform text. |
| Birthday | Optional. Surfaces in Scheduler as a recurring soft reminder event. |
| Business card photo | Uploaded image of a physical or digital business card. |
| Source | How this contact was created: `manual`, `followed`, `imported`, `form_submission`, `suggested`. |

### Context — how you met
| Field | Notes |
|-------|-------|
| Where met (`met_at`) | Freeform text: conference, coffee shop, event name, etc. |
| When met (`when_met`) | Date (month/day/year — year optional). |
| Mutual friends | Freeform notes on shared connections. |
| Conversation | What you talked about at first meeting or most recently. Rich-text, private. |

### Organisation
| Field | Notes |
|-------|-------|
| Groups | User-defined groups (Work, Family, Close Friends, etc.). Multi-group allowed. |
| Tags | Free-form tags for search and filtering. |
| Custom fields | User-defined key/value pairs (e.g. "Instrument: Guitar"). |
| Flag | Manual flag for review — appears prominently on the contact card. |

### Private notes
| Field | Notes |
|-------|-------|
| Notes | Rich-text notes. Only visible to the owner. Never exposed to the contact. |

### Reach & social
| Field | Notes |
|-------|-------|
| Preferred contact methods | Multi-select: Email, Phone, Text, WhatsApp, Telegram, Signal, Discord, Instagram DM, X DM, LinkedIn. Drives required-field validation on the public Contact Form. |
| Social handles | List of platform + handle pairs. 16 platforms supported (Instagram, X, TikTok, YouTube, Spotify, LinkedIn, GitHub, Discord, Threads, etc.). |
| Personal links | Labeled URL pairs (website, portfolio, press kit, etc.). |
| Media links | Labeled URLs for media content (podcast, YouTube channel, album, etc.). |

### Collaboration
| Field | Notes |
|-------|-------|
| Collaboration entries | Typed list of collaboration opportunities. Each entry has a **type** (Project/Idea/Business, Hire/Employ, Make Offer, We Should…, Discussions/Podcast, We're Both Into, Look Up, Financier) and a free-text description. Multiple entries allowed. |

### Follow-up
| Field | Notes |
|-------|-------|
| Follow-up date | Target date for the next touchpoint. Displayed with overdue indicator (⏰) when the date has passed. |
| Reminders | Up to N reminders per contact — see Reminders section below. |

---

## Follow-up system

Each contact can have a follow-up date. When that date passes, the contact is flagged with an overdue indicator across the app. The home Dashboard shows a widget of overdue follow-ups.

Optional daily reminder email: if configured, the platform sends an email at a set time each morning listing all overdue contacts. Configurable in Settings — off by default.

---

## Reminders

Each contact supports multiple reminders, stored locally. Three reminder modes:

| Mode | Description |
|------|-------------|
| **Date & time** | Fire once on a specific date and time. |
| **Day of week** | Fire every week on a chosen day at a chosen time (e.g. "Every Monday at 9am"). |
| **Location proximity** | Fire when the device enters a radius (0.1–5 miles) around a saved lat/lng coordinate. Uses the device GPS via the Web Geolocation API. |

Each reminder has an optional note ("Follow up about the project…"). Reminders are stored locally in device storage and fire as push notifications if the user has granted permission. They are not synced to the server.

---

## Public Contact Form (SPACE integration)

Every SPACE can optionally enable a **Contact Form** page — a public-facing form where visitors submit their own contact information to the SPACE owner.

The form collects all the same fields the owner uses in their private directory: name, email, phone, profession, company, location, birthday, where/when met, preferred contact methods, social handles, personal links, media links, collaboration notes, and an optional photo + business card.

Key behaviours:
- **Draft autosave** — the form saves to localStorage on every keystroke so visitors don't lose progress on accidental tab close
- **Preferred contact methods drive required fields** — if the visitor selects "Instagram DM" as their preferred method, the Instagram handle field becomes required
- **Bot protection** — rate-limited per IP and per email address
- **Spam scoring** — submissions that pattern-match known spam are auto-flagged in the directory
- On submission, the contact appears in the owner's CONTACTS as a new record with `source: form_submission`

The owner reviews incoming submissions in a dedicated **Inbox** tab in CONTACTS. They can accept, merge with an existing contact, or discard.

---

## Privacy

- All contact data is stored in the user's local data store (SQLite, local-first). Server sync is optional per-tier.
- Notes, groups, tags, and custom fields are **private** — the contact cannot see them.
- No notification is ever sent to a contact about being added, tagged, noted, or grouped.
- Off-platform contact details (email, phone, etc.) never leave the user's own device unless the user explicitly enables server sync.
- The platform cannot read private contact metadata at Tier 1–3.

---

## Merge detection

When an off-platform contact has an email on file and a user with that same email registers on nTogether, the platform detects the match and surfaces a prompt: *"Someone you know joined nTogether — would you like to link them?"*

The user confirms before linking occurs. On confirmation:
- The contact type upgrades from off-platform → on-platform
- Their SPACE handle and avatar are pulled and merged into the existing record
- All existing notes, groups, and custom fields are preserved

---

## Groups

Users create named groups to organize contacts. A contact can belong to multiple groups. Groups appear in the sidebar for filtering. Groups are private — they are never exposed to the people inside them.

Suggested starting groups (pre-created at first launch, deletable): Friends, Family, Work.

---

## Import / Export

| Direction | Formats |
|-----------|---------|
| Import | vCard (.vcf), Google Contacts CSV, Apple Contacts export, CSV (from contactApp or spreadsheet) |
| Export | vCard (.vcf), CSV (all fields including collaboration entries and social handles) |

Imported contacts start as off-platform unless a SPACE handle match is detected. Duplicate detection runs on import (matches by name + email); user is shown conflicts and chooses merge or keep separate.

**Automated backup**: an optional weekly CSV export can be emailed to the owner's configured address. Off by default. Configurable in Settings.

---

## Contact schema (SQLite)

```sql
CREATE TABLE contacts (
  id                TEXT PRIMARY KEY,
  -- Identity
  first_name        TEXT,
  last_name         TEXT,
  email             TEXT,
  phone             TEXT,
  profession        TEXT,
  company           TEXT,
  location          TEXT,
  birthday          TEXT,           -- "MM/DD/YYYY" or partial
  photo             TEXT,           -- base64 data URL or file path
  business_card     TEXT,           -- base64 data URL or file path
  -- Context
  met_at            TEXT,
  when_met          TEXT,
  mutual_friends    TEXT,
  talked            TEXT,
  -- Structured
  contact_methods   JSON,           -- ["Email","WhatsApp",...]
  social_handles    JSON,           -- [{"platform":"Instagram","handle":"@..."},...]
  personal_links    JSON,           -- [{"label":"Portfolio","url":"https://..."},...]
  media_links       JSON,
  collaborations    JSON,           -- [{"type":"Project / Idea / Business","text":"..."},...]
  -- Organisation
  groups            JSON,           -- ["Work","Band"]
  tags              JSON,           -- ["#guitarist","#sxsw-2025"]
  custom_fields     JSON,           -- [{"key":"Instrument","value":"Guitar"}]
  -- nTogether identity
  space_handle      TEXT,           -- on-platform link; null for off-platform
  contact_type      TEXT DEFAULT 'off_platform', -- 'on_platform' | 'off_platform'
  -- Management
  note              TEXT,
  followup_date     TEXT,           -- ISO date "YYYY-MM-DD"
  flagged           INTEGER DEFAULT 0,
  spam_score        INTEGER DEFAULT 0,
  source            TEXT DEFAULT 'manual', -- manual|followed|imported|form_submission|suggested
  created_at        TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Reminders stored locally, not in main contacts table
CREATE TABLE contact_reminders (
  id           TEXT PRIMARY KEY,
  contact_id   TEXT REFERENCES contacts(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,   -- 'datetime' | 'dayofweek' | 'location'
  date         TEXT,            -- ISO date, for 'datetime'
  time         TEXT,            -- HH:MM, for 'datetime' and 'dayofweek'
  day          TEXT,            -- weekday name, for 'dayofweek'
  lat          REAL,            -- for 'location'
  lng          REAL,            -- for 'location'
  radius_miles REAL,            -- for 'location'
  note         TEXT,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

---

## Cross-app integration

| App | Integration |
|-----|------------|
| **Scheduler** | @-mention in event creation → autocomplete from CONTACTS. Tagged on-platform contacts receive an optional event notification. |
| **Journal** | @-mention in entries for people references. Mentions are indexed in the contact's activity timeline. |
| **Agreement** | Add parties to a contract from CONTACTS. Both on-platform and off-platform contacts can be parties. |
| **Research** | Tag a contact as a source or collaborator on a research note. |
| **MESSENGER** | "Message" button on any on-platform contact's detail → opens or creates a MESSENGER thread. |
| **Posthumous** | Legacy contacts are drawn from CONTACTS. Role assignments (executor, medical proxy, legacy contact) link back to CONTACTS records. |
| **Lists** | Tag a contact on a list item (e.g. a gift list tagged with the recipient). |
| **DASH** | Upcoming birthdays widget pulls from CONTACTS birthday fields. |

---

## SPACE / PROFILE integration

CONTACTS powers two surfaces on a user's SPACE:

### Friends page

The SPACE Friends page is a public (or privacy-controlled) view over the user's on-platform contacts. It surfaces:

- **Following** — on-platform contacts the user follows
- **Followers** — on-platform users who follow the user back
- **Mutuals** — people on both sides (following + follower)
- **Suggested** — people with high mutual-contact overlap

The Friends page pulls live from the social graph in ENGINE. It never exposes off-platform contacts, notes, custom fields, or any private metadata the user has added.

The SPACE owner sees a private sidebar overlay on their own Friends page showing each contact's groups and a note snippet — this overlay is invisible to all visitors.

### Contact card indicator

When viewing another user's SPACE, the viewer sees a small "in your contacts" badge if that person is already in their CONTACTS. A quick-add button appears for people not yet in CONTACTS.

---

## Notifications

| Event | Notification |
|-------|-------------|
| Birthday (birthday field set) | Soft reminder in Scheduler, 1 day before and day-of |
| Merge detection match | In-app prompt: "Someone you know joined nTogether" |
| On-platform contact deactivates their account | Silent — contact record stays, handle is marked inactive |

No notification is ever sent to a contact about being added, grouped, tagged, or noted.

---

## Open items

- Whether contacts can be shared between co-owners of a SPACE (e.g. a business SPACE with a shared client list)
- Import from LinkedIn profile URL
- OS-level contact sync (iOS Contacts, macOS Contacts, Android Contacts) — permission model TBD
- Smart contact suggestions based on Scheduler event co-attendees and Agreement co-parties
- Whether the Contacts app has a native (Expo/Tauri) implementation in addition to web
- Birthday calendar: whether birthday reminders appear as a separate calendar overlay in Scheduler or as system notifications only
