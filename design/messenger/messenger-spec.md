# MESSENGER — Spec
Last updated: 2026-04-24

---

## Overview

MESSENGER is nTogether's end-to-end encrypted direct messaging platform. It is Phase 6 of the build plan, implemented after ENGINE, SPACE, and CONNECT are stable.

All messages are encrypted client-side using the Signal Protocol (libsodium/NaCl). The server never holds plaintext message content. No message logs are stored server-side; messages live on the sender's and recipient's devices only.

---

## Scope — Phase 1 (launch)

**1-on-1 messaging only.** Group messaging is planned but not in scope for the initial release.

Any user can message any other user — no mutual follow required. Recipients can accept, decline, or block message requests from users they don't follow.

---

## Encryption

| Property | Value |
|----------|-------|
| Protocol | Signal Protocol |
| Library | libsodium / NaCl |
| Key storage | Client-side only (device keystore) |
| Server-side plaintext | Never — server stores only encrypted blobs |
| Forward secrecy | Yes — ratcheting keys per message |
| Key verification | Out-of-band safety number comparison (manual) |

Messages are encrypted end-to-end between sender and recipient. nTogether cannot read any message content. If the server is compromised, message content is not exposed.

---

## Message types (Phase 1)

- Text
- Images (sent as encrypted attachments hosted on sender's SPACE)
- File attachments (encrypted, hosted on sender's SPACE or CLOUD)
- Voice notes (short audio, encrypted)
- Link previews (generated client-side, not by server)
- Reactions (emoji response to a message)

---

## Message lifecycle

| State | Description |
|-------|-------------|
| Sent | Encrypted and delivered to server relay |
| Delivered | Received by recipient's device |
| Read | Opened by recipient (read receipts are opt-in, default off) |
| Deleted for me | Removed from sender's local store only |
| Deleted for everyone | Deletion request sent to recipient's device; recipient's client removes it |

**No server-side deletion.** Deletion requests are signals to the recipient's client. There is no guarantee of deletion if the recipient's client is offline or modified.

---

## Message requests

When a user receives a message from someone they don't follow:
- The message lands in **Message Requests** (separate from main inbox)
- The recipient sees a preview before accepting
- Accepting moves the thread to the main inbox
- Declining sends no notification to the sender
- Blocking prevents further contact

---

## Inbox structure

```
Inbox
├── Primary          ← accepted conversations, sorted by recency
├── Requests         ← messages from non-followers
└── Archived         ← conversations manually archived
```

---

## Privacy controls

| Control | Options |
|---------|---------|
| Who can message you | Everyone / Followers only / Nobody |
| Read receipts | On / Off (default: off) |
| Online status | Show / Hide |
| Typing indicators | Show / Hide |
| Link previews | Generate / Don't generate |

---

## Notifications

- Push notifications for new messages (device-level, encrypted payload)
- In-app badge on MESSENGER rail icon
- No email notifications by default (opt-in available)

---

## Phase 2 — Group messaging (planned)

Group chats will be added after the 1-on-1 system is stable. Key design decisions for groups (not yet resolved):

- Maximum group size
- Admin roles within groups
- Whether group history is available to new members
- Encrypted group key distribution model (Signal Groups vs. MLS protocol)
- Group invites — open link vs. admin-only

---

## Open items

- Key backup and account recovery (if a user loses their device, how do they recover message history?)
- Message expiry / disappearing messages — user-configurable timer per conversation
- Cross-device sync model (encrypted sync between a user's own devices)
- Desktop and mobile client synchronization
- Whether bots / automated messages are permitted in Phase 1
