# GROUPS — Spec
Last updated: 2026-04-26

---

## Overview

GROUPS is a LIFE sub-app for creating and managing named collections of contacts. A group is an ordered, named set of people drawn from CONTACTS — it acts as the targeting layer for any action that involves multiple people at once.

Groups power mailing lists, event rosters, crews and teams, newsletter subscriber lists, and any other named set the user wants to define. A contact can belong to any number of groups simultaneously. Groups are always private — the people inside a group are never told they have been added, listed, or labelled.

GROUPS is tightly coupled to CONTACTS: membership always resolves to a contact record. Every member of a group has a canonical contact record that owns their identity data (name, email, phone, handle, and all other fields). GROUPS does not duplicate contact fields — it only stores a reference (foreign key) to the contact record plus per-group metadata (role, notes, join date, source).

---

## Group types

| Type | Description |
|------|-------------|
| **Mailing List** | A list of people who receive periodic communications — newsletters, updates, announcements. Optimised for bulk messaging and export. |
| **Event Roster** | The guest list or participant list for a Scheduler event. Created manually or auto-populated when the user invites contacts to a Scheduler event. |
| **Crew / Team** | An ongoing working group — a band, a production team, a sports crew, a business partnership. Has persistent role assignments (Admin, Member, Guest). |
| **Custom** | A free-form collection with no implied semantic. Catch-all for any use case not covered above (e.g. "People I met at SXSW 2026", "Potential collaborators"). |

The type is set at creation and can be changed later. The type influences the default form fields shown on the associated SPACE block (see SPACE block section below) and the bulk-action options shown in the member toolbar.

---

## Adding members

There are two ways a person enters a group: manual add by the owner, and form submission by a visitor.

### 1 — Manual add

The owner types a name in the "Add member" search field inside the group. The field autocompletes against CONTACTS using a live fuzzy search across `first_name`, `last_name`, `email`, and `space_handle`.

- If a match is found and selected, the contact is added immediately to the group. A per-group role is assigned at this point (default: Member).
- If no match is found, or the user types a name that doesn't exist, the field displays a **"Create new contact?"** prompt. Selecting it opens the standard new-contact dialog pre-filled with whatever the user has typed. On save, the new contact is added to CONTACTS and simultaneously added to the group.

### 2 — Form submission (via SPACE block)

When the group has a linked SPACE block (public form), visitors submit their contact information from the group's public page. The submission enters a **pending queue** — it does not directly modify CONTACTS or group membership.

Each incoming submission triggers the **contact resolution workflow** described in the next section.

---

## Contact resolution workflow

When a form submission arrives, the system attempts to match the submitted data to an existing contact record before creating anything new.

### Matching logic

The resolver runs three signals in priority order:

| Signal | Confidence |
|--------|------------|
| Exact email match (case-insensitive) | High — treated as definitive |
| Exact phone match (normalised digits) | High — treated as definitive |
| Name similarity only (Levenshtein / token sort, threshold ≥ 80%) | Low — requires human confirmation |

**High-confidence match**: email or phone matches an existing contact record exactly. The system surfaces a "Possible match found — high confidence" panel with the matched contact's name, handle (if on-platform), and email. The owner can confirm the link in one click.

**Low-confidence match**: the submitted name is similar to an existing contact (but no email or phone overlap). The system surfaces a "Possible match found" panel with a numeric confidence indicator (e.g. ●●●○○ 68%). The owner must review and confirm or reject.

**No match**: no existing contact record is close enough. The system shows a "No match found" state prompting the owner to create a new contact from the submission, or to add the person to the group only without creating a full contact record.

Multiple candidate matches may be surfaced in decreasing confidence order. The owner reviews them in sequence.

### Confirmation dialog

The resolution panel shows:

- The submitted data on the left (name, email, phone, any role/category fields from the form)
- The candidate match on the right (contact name, handle, email, and contact type badge)
- A confidence indicator: filled circles out of five (e.g. ●●●○○), with a percentage
- Two primary actions: **"Link to [Name]"** (confirm the match) and **"Not this person"** (reject and continue)
- Three secondary actions below: **"Create new contact"** (create a fresh contact record from the submission), **"Add to group only (no contact)"** (add an anonymous entry with just the submitted name/email, without creating a contact record), and **"Skip"** (defer review — submission stays pending)

### On confirm

- The submitted fields are merged into the existing contact record. Fields that already have values are not overwritten unless the owner explicitly chooses to update them (a merge-fields dialog appears for conflicts).
- The contact is added to the group with the role specified in the form submission (if any), defaulting to Member.
- The submission is moved from `group_submissions` (pending) to `group_members` and marked resolved.
- `source` on the contact record is updated to `form_submission` only if this is the first external submission for that contact.

### On reject

- The system moves to the next candidate match, or if there are none, to the "No match" state.
- The rejected candidate match is noted in the submission record so it is not surfaced again for this submission.

---

## SPACE block

A group can have an associated **SPACE block** — a public-facing form embedded on the owner's SPACE page (or shared as a standalone link). Visitors fill out the form and their submission enters the group's Inbox tab for review.

### Customisation

The owner controls the form in the group's Settings panel:

- **Fields**: toggle which standard contact fields appear (name is always required; email, phone, location, birthday, social handles, and personal links are optional). Additional free-text questions can be added.
- **Role / category selector**: the owner can add a role-selection widget — a set of named roles with icons and optional sub-panels (modelled on the groupMailer pattern). Each role card can expand to reveal additional fields specific to that role (e.g. for a music industry list: Rapper, Producer, DJ, Fan — each with genre, availability, and collaboration toggles).
- **Header copy**: custom title, subtitle, and badge label for the form header.
- **Privacy**: the owner can require a short-code or passphrase to access the form.
- **Confirmation message**: custom success copy shown to the visitor after submission.

### Form behaviour

- Draft autosave to localStorage on every keystroke (visitor does not lose progress on accidental tab close).
- Bot protection: rate-limited per IP and per email address. Submissions matching known spam patterns are auto-flagged with a spam score in `group_submissions`.
- Submissions arrive in the group's **Inbox tab** as pending items, each with the full submitted payload stored in `group_submissions.submitted_data`.

---

## Groups management

The groups sidebar and group settings surface the following operations:

| Operation | Notes |
|-----------|-------|
| **Rename** | Edit the group name in-place. |
| **Description** | Optional free-text description, shown on the group detail header. |
| **Type** | Change the group type (Mailing List / Event Roster / Crew / Custom). |
| **Archive** | Removes the group from the active sidebar list. Archived groups are accessible under a collapsed "Archived" section. Members and history are preserved. |
| **Delete** | Permanent. Removes the group record and all `group_members` entries. Does not delete the underlying contact records. |
| **Member count** | Displayed as a badge next to the group name in the sidebar. Does not count pending (unresolved) submissions. |

---

## Member operations

Within a group's member list, the owner can:

| Operation | Notes |
|-----------|-------|
| **Add member** | Manual add (autocomplete + create-new flow described above). |
| **Remove member** | Removes the `group_members` record. Does not delete the contact from CONTACTS. |
| **Assign role** | Per-group role: Admin, Member, Guest. Defaults to Member on add. Role is private — the member is not notified. For Crew / Team type groups, Admin has a distinct visual indicator. |
| **Edit member notes** | Optional private note attached to this person's membership record (e.g. "Joined at SXSW 2026 — spoke about collab"). Separate from the main contact note. |
| **Export member list** | Exports the full member list as CSV (all contact fields) or vCard (.vcf). Export respects the same privacy rules as CONTACTS export — off-platform fields never leave the device unless cloud sync is enabled. |

---

## Cross-app integration

| App | Integration |
|-----|-------------|
| **MESSENGER** | "Message group" action sends a new MESSENGER thread addressed to all on-platform members of the group. Off-platform members are listed as recipients but cannot receive in-app messages; the user is prompted to use email export for those. |
| **Scheduler** | "Invite group to event" action adds all group members as event attendees. On-platform members receive an optional event notification. Off-platform members are added as attendees with their email address for external calendar invites. |
| **Agreement** | "Add group as party" action adds the group as a named party block in a contract. The group name appears on the agreement; individual member names expand in a sub-list. |
| **SPACE Board** | A group can be used as the membership list for a SPACE Board, granting board-level access to all group members who are on-platform. Membership changes to the group propagate to board access within 24 hours. |
| **CONTACTS** | Group membership is bidirectional: adding a contact to a group from within CONTACTS (via the contact's Groups field) is equivalent to adding them from within GROUPS. Both surfaces stay in sync. |

---

## Schema (SQLite)

```sql
CREATE TABLE groups (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'custom',
                -- 'mailing_list' | 'event_roster' | 'crew_team' | 'custom'
  space_block  INTEGER DEFAULT 0,  -- 1 if a public SPACE form is active
  space_form   JSON,               -- form config: fields, roles, header copy, etc.
  archived     INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE group_members (
  id           TEXT PRIMARY KEY,
  group_id     TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  contact_id   TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role         TEXT DEFAULT 'member',  -- 'admin' | 'member' | 'guest'
  note         TEXT,                   -- private per-membership note
  source       TEXT DEFAULT 'manual',  -- 'manual' | 'form_submission' | 'imported'
  joined_at    TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (group_id, contact_id)
);

CREATE TABLE group_submissions (
  id              TEXT PRIMARY KEY,
  group_id        TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  submitted_data  JSON NOT NULL,  -- raw payload from the SPACE block form
  spam_score      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending',
                  -- 'pending' | 'resolved' | 'skipped' | 'spam'
  resolved_to     TEXT REFERENCES contacts(id),
                  -- set on confirm; null for add-to-group-only or unresolved
  resolution_type TEXT,
                  -- 'linked' | 'new_contact' | 'group_only' | 'skipped'
  rejected_candidates JSON,       -- list of contact IDs ruled out during review
  submitted_at    TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  resolved_at     TEXT
);

-- Index for fast inbox queries
CREATE INDEX idx_group_submissions_pending
  ON group_submissions (group_id, status)
  WHERE status = 'pending';
```

---

## Open items

- Whether groups can be shared between co-owners of a SPACE (e.g. a band SPACE with a shared booking list managed by multiple members).
- Bulk-import of members from a CSV or vCard file directly into a group (rather than via the global CONTACTS import).
- Whether the Inbox badge count on the GROUPS sidebar item rolls up across all groups or is per-group only.
- MESSENGER group message flow for mixed on/off-platform groups — whether an integrated email fallback is built-in or deferred to a manual export step.
- Rate and spam policy for SPACE block forms: global settings vs. per-group overrides.
- Whether SPACE block forms support file uploads (e.g. press kit, demo link) and how those are stored given the local-first data model.
- Role naming conventions — whether Admin / Member / Guest are the only built-in roles or whether owners can define custom role names per group.
- Scheduler Event Roster sync direction: when an attendee is removed from a Scheduler event, should they also be removed from the linked Event Roster group, or are the two lists independently editable after initial sync?
