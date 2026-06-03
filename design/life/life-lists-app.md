# LIFE — Lists App
Last updated: 2026-04-24

---

## Overview

Lists is a LIFE sub-app for making quick, lightweight lists of anything. It handles two distinct modes: **action lists** (task-oriented, integrated with Scheduler and Journal) and **collection lists** (personal catalogs with no required workflow integration).

All lists and individual items are taggable. Lists is independently installable as a LIFE sub-app and communicates with Scheduler and Journal via the DATA HUB event bus.

---

## List Modes

### Action Lists

Task-oriented lists with three urgency levels. All three types can surface in the Scheduler and Journal.

| Type | Intent | Scheduler behavior | Journal behavior |
|------|--------|--------------------|-----------------|
| **Need-do** | Must happen — no flexibility | Can be scheduled; triggers reminders if unscheduled past a threshold | Completing one can prompt a journal entry |
| **Should-do** | Important but not urgent | Surfaces as a scheduling suggestion | Referenced in journal as in-progress or deferred |
| **To-do** | General task, no urgency pressure | Optional — user can schedule or leave in queue | Referenced in journal if user chooses |

Need-dos, should-dos, and to-dos coexist in the same list or can be separated into dedicated lists — user's choice. Items can be promoted or demoted between the three types at any time.

### Collection Lists

Personal catalogs with no inherent action or deadline. Built-in types ship by default; users can create any custom type.

**Built-in collection types:**
- Christmas wish list
- Gift ideas
- Favorite albums
- Likes / dislikes
- Code snippets (personal code reference and scratch notes)

**Custom lists:** Any user-defined list name and type. No constraints on what a collection list can contain.

---

## Tagging

Tags apply at two levels:
- **List level** — tag the entire list (e.g. `#personal`, `#work`, `#2026`)
- **Item level** — tag individual entries within any list

Tags are shared across all LIFE apps. A tag used in Lists surfaces in Journal entries and Scheduler events that share the same tag, enabling cross-app filtering.

---

## Scheduler Integration

Action list items can be pushed to the Scheduler as events or tasks:
- The item appears on the Scheduler with its urgency type (need-do / should-do / to-do) indicated
- Completing the scheduled event marks the list item as done
- Need-dos that remain unscheduled past a configurable threshold surface as nudges in the Scheduler's agenda view
- Recurring to-dos, should-dos, or need-dos can be linked to recurring Scheduler events

---

## Journal Integration

- Action list completions can trigger optional journal prompts ("You finished X — anything to note?")
- Journal entries can reference or embed list items inline
- The Journal's decision log can pull from need-dos as pending decisions
- Daily/weekly journal reviews can surface unresolved should-dos and need-dos as context

---

## Sharing and Privacy

Lists follow standard per-interaction privacy controls:
- **Private** — visible only to the owner (default)
- **Selectively shared** — shared with chosen users or groups (e.g. a Christmas wish list shared with family)
- **Fully public** — visible to anyone on the platform or the open web

Shared lists can be set to view-only or collaborative (others can add/edit items).

---

## Quick Capture

The primary design goal is speed. From anywhere in the suite:
- Command palette: type a list item and assign it to an existing list or create a new one in one action
- Mobile: one-tap quick-add from the home screen widget
- Items can be captured with no list assigned and sorted later from an inbox view

---

## Data Structure (per item)

Each list item holds:
- Text content
- Type (need-do / should-do / to-do / collection)
- Tags (zero or more)
- Status (open / done / deferred / deleted)
- Optional: due date, linked Scheduler event, linked Journal entry, notes, attachments

---

## Open Items

- Whether collection list items can have due dates or urgency levels (making them action-convertible)
- Collaborative list conflict resolution (two users editing simultaneously)
- Whether code snippet lists support syntax highlighting
- Export formats (markdown, CSV, JSON)
