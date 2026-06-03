# Social — Spec
Last updated: 2026-04-24

---

## Overview

nTogether's social layer is distributed. There is no central social graph database that owns the connections between users. Social content (posts, comments, reactions) lives on the user's SPACE. CONNECT aggregates it into unified feeds. The platform facilitates discovery — it does not own the content or the relationships.

---

## Following

Users follow SPACEs, not accounts. Following a SPACE subscribes the follower to that SPACE's public content in their CONNECT following feed.

- **Follow**: One-click from a SPACE or from CONNECT search. No approval required (unless the SPACE owner has enabled follow approval).
- **Follow approval**: SPACE owners can require manual approval of follow requests (private SPACE mode).
- **Mutual follow**: When two users follow each other they become connected. Connected users appear in each other's in-network panels for social blocks (polls, lists, rankings).
- **Follow counts**: Public by default. Can be hidden by the SPACE owner.
- **Follower lists**: Visible to the SPACE owner; visibility to others is configurable.

---

## Posts

Posts are the primary content unit on a SPACE Wall. They appear in the CONNECT post feed if set to fully public.

### Post types

| Type | Description |
|------|-------------|
| **Text** | Plain text or rich text with formatting |
| **Image** | One or more images with optional caption |
| **Video** | Video hosted on the user's SPACE; appears in CONNECT video library if public |
| **Audio** | Audio hosted on the user's SPACE; appears in CONNECT music or podcast library if tagged appropriately |
| **Link** | URL with auto-generated preview card (title, description, thumbnail) |
| **Quote post** | Repost of another user's post with optional added commentary |
| **Poll** | Forkable poll block (see `site-builder-system.md` — Social Blocks) |
| **List share** | A list from the Lists app shared as a post; forkable by network |
| **Mixed** | Any combination of the above types in a single post |

### Post visibility

Every post has an independent visibility setting:

| Setting | Who can see it |
|---------|---------------|
| **Private** | Only the posting user |
| **Selectively shared** | Chosen users or groups. Platform warns if any recipient's tier means the platform will have access. |
| **Fully public** | Anyone on the platform, indexed by CONNECT, visible on the open web |

Default post visibility is configurable in SPACE settings; each post can override the default.

---

## Comments

Comments are threaded and stored on the source SPACE — not on a central server.

- Comments can be text, image, or link.
- Threading supports replies to any comment in the thread.
- The SPACE owner can delete any comment on their SPACE.
- Commenters can delete their own comments.
- The SPACE owner can disable comments globally or per post.
- CONNECT surfaces comment counts and allows viewing the comment thread inline, loading from the source SPACE.

---

## Reactions

Reactions (likes, etc.) are stored in the reacting user's DATA HUB. Aggregate reaction counts are surfaced on posts.

- Reaction types: TBD (at minimum: a standard positive reaction; additional types may be added).
- Removing a reaction updates the count immediately.
- The post owner can see aggregate counts but not individual reactor identities, unless the reactor's SPACE is fully public.
- Reactions from private or selectively-shared users contribute to the aggregate count but are not individually attributed.

---

## Reposts and shares

A repost copies a link to the original post onto the reposter's Wall. It does not duplicate content.

- **Simple repost**: Shares the original post to the reposter's Wall with attribution.
- **Quote post**: Adds the reposter's commentary above the original post.
- Reposts of private or selectively-shared posts are blocked — you cannot repost content that wasn't fully public.
- The original post owner is notified of reposts (notification preference configurable).

---

## Mentions and tags

- **Mention** (`@username`): Notifies the mentioned user. Mention is linked to their SPACE.
- **Hashtag** (`#topic`): Posts tagged with a hashtag are discoverable in CONNECT topic search.
- **SPACE tag**: A post can be tagged to a SPACE (e.g. an event's SPACE), making it appear in that SPACE's tagged content feed.

---

## Notifications

| Event | Notified party | Configurable? |
|-------|---------------|---------------|
| New follower | SPACE owner | Yes |
| Follow request | SPACE owner | N/A (required) |
| New comment on post | Post author | Yes |
| Reaction on post | Post author | Yes |
| Mention | Mentioned user | Yes |
| Repost | Original post author | Yes |
| New post from followed SPACE | Follower | Yes (per SPACE) |
| Block fork | Original block author | Yes |

Notifications are delivered in-app (suite shell notification panel) and optionally via push (mobile) and email.

---

## In-network visibility

"In-network" means mutual follows (connected users). In-network status unlocks:

- **Network response panels** on forked social blocks — see other connected users' answers on polls, lists, rankings
- **Suggested connections** — CONNECT may suggest follows based on mutual connections
- **Selective sharing** — "selectively shared" posts can be targeted to specific network groups

---

## Social block forking

Polls, lists, and rankings can be forked from any SPACE onto another SPACE. The structure (question, template, options) is copied; answers are personal. See `site-builder-system.md` — Social Blocks for full spec.

Key social mechanics:
- Forks are linked to their origin in the fork graph
- In-network responses are visible in the block's network panel
- High-fork blocks surface in CONNECT feeds for platform-wide discovery
- Each fork is independent — the original owner cannot edit or delete forks

---

## CONNECT post feed

The CONNECT post feed is the unified view of all public posts from all SPACEs, surfaced in one place. See `connect-spec.md` — Post Feed for full spec.

Feed types available in CONNECT:
- **Global feed** — all public posts, ranked by algorithm or chronological
- **Following feed** — posts only from followed SPACEs
- **Topic feed** — posts filtered by hashtag
- **SPACE feed** — all posts from a single SPACE (equivalent to visiting the Wall directly)

---

## Privacy cross-reference

Social mechanics interact with tiers in specific ways:

- **Posts from a Tier 1 SPACE**: Fully public posts are visible to viewers but the platform cannot index or track them beyond what is structurally necessary to serve the content. They appear in CONNECT only via a cached reference, not a deep index.
- **Comments and reactions from Tier 1 users**: Contribute to aggregate counts but are not stored by the platform in any identity-linked way.
- **Notifications involving Tier 1 users**: The notification is delivered but the platform does not retain metadata about who triggered it.

See `privacy-model.md` for full cross-tier rules.

---

## Open items

- Reaction types (how many, which ones)
- Block / mute mechanics (block a user, mute a SPACE)
- Content moderation model (who moderates public posts? Platform-level reports?)
- Spam and bot detection
- Whether follow counts can be gated by tier (e.g. Tier 1 users have private follower counts by default)
- Story / ephemeral post format (24-hour auto-delete posts)
