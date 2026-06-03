# LIFE Suite — Spec
Last updated: 2026-04-24

---

## Overview

LIFE is a suite of twelve personal productivity apps bundled together for convenience but independently installable and usable. All sub-apps communicate through a shared local event log — no DATA HUB or network connection required for cross-app data sharing.

**Installation model:** Apps are installed individually — there is no "install all" bundle. Users choose which apps they want. Each app is independent and can be used without any other. Cross-app intelligence (shared event log, shared tags, cross-app references) activates automatically between whichever apps are installed. No app is pre-installed; the LIFE section of the platform presents the catalog and the user picks what they need.

**Offline:** All LIFE sub-apps are local-first. Full functionality — including all cross-app integration — is available offline. The shared local event log lives on the device. When DATA HUB is installed, events sync to the server-side store on reconnect.

**Platforms:** Web, iOS, Android, macOS, Windows, Linux.

---

## Sub-apps

---

### Contacts

The personal address book for nTogether. A single unified contact store that serves both personal productivity and the social layer on the user's SPACE. Full spec: `contacts-spec.md`.

**Contact types:**
- **On-platform** — linked to a SPACE handle; display name and avatar sync live
- **Off-platform** — name, email, phone, custom fields; fully private by default

**Following = Contact:** Following someone on-platform automatically adds them as a contact. Unfollowing does not delete the contact record.

**Cross-app integration:**
- Scheduler — @-mention contacts on events; birthday reminders surface as calendar entries
- Journal — @-mention contacts in entries
- Agreement — add parties to contracts from Contacts
- Posthumous — legacy contacts and role assignments draw from Contacts
- MESSENGER — Message button on any on-platform contact detail
- Lists — tag contacts on list items

**SPACE integration:** Powers the Friends page on the user's SPACE — following, followers, mutuals, and suggested connections. Private metadata (notes, groups, tags) is never exposed to visitors or to the contacts themselves.

---

### Groups

Manages named collections of contacts for mailing lists, event rosters, crews, and custom sets. Full spec: `groups-spec.md`.

**Group types:**
- **Mailing List** — periodic communications; optimised for bulk messaging and export
- **Event Roster** — guest or participant list for a Scheduler event; auto-populated when inviting contacts
- **Crew / Team** — ongoing working group with persistent role assignments (Admin, Member, Guest)
- **Custom** — free-form collection for any other use case

**Adding members:**
- Manual: autocomplete search from Contacts; "Create new contact?" fallback if no match
- Form submission: visitors fill out a public SPACE block form; submissions enter a pending queue

**Contact resolution workflow:** Each incoming form submission is matched against existing Contacts using email (exact, high confidence), phone (exact, high confidence), or name similarity (fuzzy, low confidence). The owner reviews candidate matches and confirms a link, rejects the match, creates a new contact from the submission, or adds the person to the group without a contact record.

**Cross-app integration:**
- Contacts — group membership resolves to Contacts records; every member has a canonical contact
- Scheduler — Event Roster groups can be attached to Scheduler events for bulk invites
- MESSENGER — bulk message to a group (when platform messaging limits permit)

---

### Journal

A personal journaling app with structured prompt types and a free-form editor.

**Prompt types:**
- **Morning** — intention-setting, gratitude, daily priorities
- **Nightly** — reflection, accomplishments, mood check-in
- **Event** — capture a specific experience or moment in time
- **Decision log** — record a decision, the options considered, and the reasoning

**Cross-app integration:**
- Completions of need-dos from the Lists app can trigger an optional journal prompt
- The decision log pulls from open need-dos as pending decisions
- Daily and weekly journal reviews surface unresolved should-dos and need-dos as context
- Journal entries can reference or embed list items, Scheduler events, and Planner goals inline
- Mood and sentiment signals from journal entries are written to the shared event log; when DATA HUB is installed they feed into server-side materialized views (mood trend, energy tracking)

**Data:**
- All journal entries encrypted locally first, synced to DATA HUB
- Entries are always private by default; individual entries can be selectively shared or made public (shared as posts on the SPACE Wall)

---

### Scheduler

A calendar and task scheduler with multiple views and cross-app event sourcing.

**Views:** Day, week, month, year.

**Event types:**
- Standard calendar events (time-blocked)
- Recurring events (daily, weekly, monthly, custom cadence)
- Tasks (no fixed time, appear in agenda view)
- Shared calendar events (from other users' shared calendars)

**Cross-app integration:**
- Action list items from Lists (need-dos, should-dos, to-dos) can be pushed to the Scheduler as events or tasks
- Completing a Scheduler event marks the linked list item as done
- Need-dos that remain unscheduled past a configurable threshold surface as nudges in the Scheduler agenda view
- Planner goals generate milestone events in the Scheduler
- Diet plans can create meal events
- Financial bill reminders appear as Scheduler events
- Agreement deadlines and obligation dates appear as Scheduler events

**Shared calendars:**
- Users can share calendars with specific users or groups
- Shared calendars appear as overlaid layers in any view
- Events from other users' public SPACEs (e.g. concert tours, community events) can be subscribed to as calendar feeds
- Standard iCal/ICS import and export

**SPACE integration:**
- Scheduler events can be surfaced on the user's SPACE via the Events list block (dynamic)
- Public events are indexed by CONNECT

---

### Lists

A fast, lightweight list app for action tasks and personal collections. Full spec: see `life-lists-app.md`.

**Summary:**
- **Action lists**: Need-dos (must happen), should-dos (important, not urgent), to-dos (general)
- **Collection lists**: Christmas wish lists, gift ideas, favorite albums, likes/dislikes, code snippets, custom
- All lists and items are taggable
- Quick capture from anywhere in the suite via command palette or mobile widget
- Integrates with Scheduler and Journal via the shared local event log
- Lists can be shared as posts on the SPACE Wall and forked by network users (see `social-spec.md`)

---

### Planner

A goal and planning app for longer-horizon intentions across life domains.

**Planning domains:**
- Personal goals (health, relationships, learning, hobbies)
- Work tasks and career goals
- Diet plans (linked to Diet app)
- Financial plans (linked to Financial app)

**Features:**
- Goal creation with description, target date, milestones, and success criteria
- Milestone events pushed to Scheduler
- Progress tracking — manual check-ins and automatic signals from linked apps (e.g. Diet completion rate feeds into a health goal's progress)
- Habit tracking — recurring behaviors attached to goals
- Goal retrospectives — prompted when a goal's target date passes
- Cross-goal dependency linking (goal B requires goal A to be complete)

**Cross-app integration:**
- Milestone events appear in Scheduler
- Diet plans link to nutrition goals
- Financial plans link to savings and budget goals in the Financial app
- Journal prompts reference active goals in morning and nightly entries

---

### Diet

A meal logging and nutritional tracking app with a wellbeing ROI model.

**Features:**
- Meal logging — food items, portion sizes, macros, calories
- Meal plans — pre-planned day/week templates
- Nutritional targets — per-day goals for calories, protein, carbs, fat, fiber, water
- Wellbeing ROI — tracks how dietary choices correlate with mood (from Journal), energy, and other DATA HUB signals over time
- Grocery list generation — from meal plans, exported to Lists app
- Meal events in Scheduler — optional scheduling of planned meals

**Cross-app integration:**
- Grocery lists exported to Lists app
- Meal events pushed to Scheduler
- Mood and energy correlation tracked via shared event log; DATA HUB provides cross-app trend views when installed
- Nutritional progress feeds into Planner health goals via shared event log

**Data:**
- Food database: TBD (self-managed, third-party API, or user-contributed)

---

### Financial

A personal finance tracking and budgeting app.

**Features:**
- Spending tracking — manual entry and optional bank/card import (connection model TBD)
- Budget setup — category budgets per month/year
- Financial intelligence — spending pattern analysis, category breakdowns, trend visualization
- Bill reminders — recurring bills as Scheduler events
- Savings goals — linked to Planner financial plans
- Net worth tracking — assets and liabilities snapshot

**Cross-app integration:**
- Bill reminders appear in Scheduler
- Savings goals linked to Planner
- Spending summaries written to shared event log, surfaced in DASH via per-app dash_stats
- Journal can reference financial milestones ("paid off X", "hit savings goal")

**Data:**
- All financial data is private by default and never shared
- Tier governs what the platform can see — Tier 1 means zero-knowledge for financial data

---

### Agreement

A personal contract and obligation tracking app.

**Purpose:** Track agreements, commitments, terms, and obligations — both formal (contracts, subscriptions) and informal (promises made, expectations set).

**Features:**
- Agreement creation — parties, terms, obligations, deadlines
- Obligation tracking — what each party owes, by when
- Fulfillment recording — mark obligations as fulfilled with optional notes and attachments
- Deadline alerts — obligation deadlines pushed to Scheduler
- Subscription tracker — recurring agreements (software subscriptions, service contracts, memberships) with renewal alerts
- Document attachment — link agreement documents from CLOUD

**Cross-app integration:**
- Deadlines and renewals appear in Scheduler
- Unfulfilled obligations surface as need-dos in Lists
- Agreement milestones referenced in Journal

---

### Research

A thought organizer and research workspace.

**Purpose:** Capture, organize, and develop ideas, research, and knowledge — from a single passing thought to a structured research project.

**Features:**
- Quick capture — text, images, links, voice notes, clippings from BROWSER extension
- Note linking — bidirectional links between notes (wiki-style)
- Collections — group related notes into projects or topics
- Tagging — shared tag system with all LIFE apps
- Canvas view — spatial arrangement of notes for visual thinking
- Search — full-text search across all notes
- Web clipping — BROWSER extension sends articles and highlighted passages directly to Research
- Export — notes exportable as markdown

**Cross-app integration:**
- BROWSER extension sends web clippings, bookmarks, and highlighted passages to Research
- Research notes can be referenced in Journal entries
- Research project deadlines can be pushed to Scheduler
- Tags shared across all LIFE apps enable cross-app filtering (e.g. all items tagged #book-project across Journal, Research, and Lists)

---

### Posthumous

An estate management and posthumous content app.

**Purpose:** Manage what happens to a user's SPACE, data, accounts, and personal messages after they die.

**Features:**
- **Legacy contact designation** — designate one or more people who can access or manage the account after death
- **Posthumous messages** — write messages to specific people to be delivered after death (time-delayed or condition-triggered)
- **Content directives** — specify what should happen to each part of the SPACE: keep it public, archive it, transfer it, or delete it
- **Account and asset inventory** — document passwords (linked to Password Manager), accounts, and digital assets for the legacy contact
- **SPACE transfer instructions** — instructions for the legacy contact on what to do with the SPACE (relevant to SPACE transfer/inheritance open item)
- **Trusted contact verification** — release is triggered by a combination of three mechanisms (any one can initiate, all require confirmation):
  1. **Inactivity timer** — platform detects no login for a configurable period (default: 12 months); sends verification emails to the account and legacy contacts before acting
  2. **Legacy contact request** — a designated legacy contact manually requests access and submits an identity-verified claim
  3. **Manual release** — the account holder explicitly arms a release (e.g. terminal illness; sets a future activation date or delegates immediate control)

**Cross-app integration:**
- Linked to Password Manager for credential inventory
- CLOUD documents (e.g. will, legal documents) attached to directives
- Journal entries can be designated as posthumous

**Privacy:**
- All Posthumous content is private by default and encrypted
- Legacy contacts are only revealed to themselves — no other party knows who the legacy contacts are
- Trigger mechanism for posthumous delivery is a critical security surface (must resist both premature triggering and indefinite blocking)

---

### Around Town

A personal city guide for tracking places to go and things to do. Full spec: `aroundtown-spec.md`.

**Entry types:**
- **Place** — permanent venue (restaurant, bar, gym, café, shop) with specials and friends on staff
- **Event** — one-time occurrence (concert, art opening, game) with a single date
- **Recurring Event** — repeating event (weekly trivia night, monthly jazz session) with a full schedule

**Categories:** Restaurants, Bars/Nightlife, Events, Shows & Concerts, Fitness, Shops & Services, Cafés, Other.

**Specials tracking:** Each venue carries typed specials — Happy Hour, Weekly Special, One-Time Deal, Seasonal — each with its own schedule. When the user opens the app and asks "what's on tonight?", specials matching the current day/time surface first.

**Friends on staff:** Each venue entry links to CONTACTS records for friends who work there. Each link stores a work schedule (days + hours), enabling the user to see at a glance whether a friend is working before deciding where to go. The "working tonight" indicator is computed from the schedule.

**Schedule system:** Six types — No date, Single date, Weekly (pick days), Monthly by date, Monthly by Nth weekday, Holiday-relative. All schedule values are stored as JSON objects and converted to human-readable strings.

**Cross-app integration:**
- Contacts — friends-on-staff links go directly to Contacts records
- Scheduler — specials and recurring events can be pushed to the Scheduler as reminders
- Lists — places can be added to a "Want to try" or "Visited" list

---

## Shared behaviors across all LIFE apps

### Tagging
Tags are global across all LIFE apps. A tag applied in Journal, Lists, Research, or Scheduler surfaces consistently across all apps. Tags are stored in the shared local event log and enable cross-app filtering; when DATA HUB is installed they additionally power server-side correlation views.

### Quick capture
Any content type can be captured from anywhere in the suite via:
- **Command palette** (Cmd+K) — type content, assign to an app or list, create immediately
- **Mobile home screen widget** — one-tap capture for the most common capture type
- **BROWSER extension** — clips, bookmarks, and highlights sent directly to the appropriate LIFE app

### Shared local event log
All LIFE apps read from and write to a shared SQLite event log on the user's device (`packages/types/local-store.sql`). Cross-app integrations (e.g. completing a list item triggering a journal prompt) happen by reading the shared log, not through direct app-to-app calls or a network service. Any two apps benefit from integration when both are installed, with no additional infrastructure required.

When DATA HUB is installed, events are additionally published to the Redis Streams bus for server-side sync and advanced cross-app analytics. Apps do not change their write path — the Redis publish is a side effect that the DATA HUB layer adds transparently.

### Export
All LIFE apps support data export. Formats: JSON (always). Additional formats (CSV, markdown, iCal) vary by app. Full export of all LIFE data is available from account settings.

---

## Open items

- Diet food database source (self-managed, third-party API, or user-contributed)
- Financial bank/card import connection model (Plaid, manual CSV, or both)
- ~~Posthumous trigger mechanism~~ — **resolved**: combination of inactivity timer, legacy contact request, and manual release (see Posthumous section)
- SPACE transfer on account death or lapse
- Collaborative Planner (shared goals between two users, e.g. a couple tracking a shared financial goal)
- Whether Research supports real-time collaborative editing
- Code snippet syntax highlighting in Lists
- Whether Agreement supports digital signatures
