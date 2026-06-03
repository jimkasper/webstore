# SPACE — Spec
Last updated: 2026-04-24

---

## What is a SPACE?

A SPACE is a personal website on nTogether. Every user gets one. It is their primary presence on the platform and on the open web.

Each SPACE runs in its own isolated container. No SPACE shares infrastructure with another. The user's content lives on their SPACE — when they delete it, it is gone from the platform, from CONNECT, and from all search indexes.

SPACEs are built and managed with BUILDSPACE (the site builder) and hosted by nTogether at a custom domain.

---

## Ownership

A SPACE supports multiple co-owners. This allows bands, businesses, couples, or any group to jointly manage a single SPACE.

| Role | Capabilities |
|------|-------------|
| **Primary owner** | Full control — billing, deletion, ownership transfer, all settings |
| **Co-owner** | All editorial and moderation controls; cannot delete the SPACE or change billing |
| **Editor** | Can create and edit content; cannot change settings or manage members |
| **Moderator** | Can moderate comments, board posts, and community content; cannot edit SPACE content |

- The primary owner is the account that created the SPACE. Primary ownership can be transferred to a co-owner.
- Co-owners are added by invitation. Invitees must have an nTogether account.
- Each co-owner's identity is independently verified for Tier requirements.
- For billing: the primary owner's subscription tier governs the SPACE's tier level.

---

## Account deletion and content

When a user deletes their account:
- Their SPACE is deleted — all pages, posts, media, and blocks hosted on it are permanently removed.
- Their content is removed from CONNECT indexes, search, and all feeds.
- Comments they posted on **other users' SPACEs** are deleted and replaced with nothing (no "deleted user" tombstone). The comment thread collapses around the gap.
- Reactions they gave on other SPACEs are removed; reaction counts on those posts update accordingly.
- Their username is released and becomes available after a 90-day hold.
- If the user was a co-owner of another SPACE, their co-owner access is removed. The primary owner is notified.

---

## Domain

Every SPACE gets:
- A default subdomain: `username.ntogether.com`
- Support for a custom domain: `www.yourdomain.com`

Custom domain setup is managed from SPACE settings. DNS configuration is the user's responsibility; nTogether provides the target record and validates ownership.

---

## Default pages

Every SPACE is created with four default pages:

| Page | Purpose |
|------|---------|
| **Wall** | The user's social feed. Posts, media, and activity visible to the public (or selectively shared). |
| **About** | The user's bio, links, and profile information. |
| **Contact** | A contact form and social links. |
| **Media Gallery** | A curated gallery of photos, videos, and audio. |

These pages are editable and removable. Additional pages are added via BUILDSPACE.

---

## Wall

The Wall is the social surface of a SPACE. It is where posts live.

- Posts can be text, image, video, audio, links, or any combination.
- Each post has its own privacy setting: private / selectively shared / fully public.
- Fully public posts are indexed by CONNECT and appear in the unified post feed.
- Comments on posts are stored on the SPACE, not on a central server.
- Reactions (likes etc.) are stored in the reacting user's DATA HUB; aggregate counts are surfaced on the post.

See `social-spec.md` for full social mechanics.

---

## DASH page

Every SPACE includes an optional DASH page — a personal dashboard visible on the user's public or private profile. It is block-based, pulling live data from LIFE apps, the coin wallet, repositories, and social activity. The user configures which widgets are visible publicly.

---

## BOARD page

Every SPACE can include a BOARD — a SPACE-level message board owned and moderated by the SPACE owner. Visitors can post if permitted. SPACE-level boards can optionally be surfaced in the network-level BOARD platform for broader discovery.

---

## Communities

SPACEs can host communities — groups and channel spaces within the SPACE. Communities have their own membership, moderation rules, and visibility settings. They function like sub-spaces within the owner's SPACE.

---

## Live streaming and audio rooms

SPACEs support live video streaming and live audio rooms. Live events are hosted from the SPACE and can be set to public (indexed by CONNECT) or selectively shared.

---

## Purpose and use

During SPACE setup, users declare their SPACE's purpose(s) and use(s):

**Purposes (multi-select):** Personal / Business / Content/Influencer / Organization

**Uses (multi-select, cross-purpose allowed):**
- Personal: Blog/journal, Portfolio, Resume/CV, Professional networking, Personal networking, Hobby site, Fan site, Family site, Other
- Business: Company website, E-commerce/store, Retail store, Professional services, Restaurant, Real estate, Agency, Startup/SaaS, Other
- Content/Influencer: Video creator, Podcaster, Streamer, Writer/blogger, Photographer, Musician/band, Newsletter, Community builder, Other
- Organization: Nonprofit, Charity, Church, School, Club, Political/advocacy, Events-based, Other

Purpose and use selection affects template suggestions in BUILDSPACE only — they do not restrict any feature.

---

## Privacy and tier interaction

A SPACE's content visibility is governed by two independent settings:

1. **The user's tier** — controls what the platform can see and index in the background, regardless of what content is public-facing.
2. **Per-content privacy** — controls who can view each post, page, or block.

A Tier 1 user's fully public post is visible to anyone but invisible to the platform's indexing systems. A Tier 5 user's private post is hidden from viewers but visible to the platform's data collection systems.

When a SPACE is viewed by another user, the viewing user's tier does not affect what they see — visibility is governed entirely by the SPACE owner's per-content settings.

---

## SPACE settings

| Setting | Description |
|---------|-------------|
| Display name | Name shown on the SPACE |
| Username | The `username.ntogether.com` subdomain |
| Avatar | Profile image |
| Cover image | Banner image shown at the top of the SPACE |
| Bio | Short description (appears on About page and in CONNECT search results) |
| Custom domain | Point a custom domain to this SPACE |
| Privacy tier | The user's current subscription tier |
| Default post visibility | Default privacy setting for new posts (can be overridden per post) |
| CONNECT indexing | Whether public content is discoverable via CONNECT (can be disabled even for public content) |
| Comments | Whether visitors can comment on posts |
| Direct messages | Whether visitors can initiate a message via MESSENGER |

---

## Container isolation

Each SPACE runs in its own isolated container. This means:
- A compromise or performance issue on one SPACE cannot affect another.
- There is no shared database or file system between SPACEs.
- Scaling is per-SPACE — high-traffic SPACEs can be allocated more resources without impacting others.

**Operational trade-off:** Per-SPACE containers are operationally complex at scale. Container orchestration, cold-start latency, and resource allocation must be managed carefully. This is acknowledged as the primary ops challenge of the architecture. See `platform-analysis.md`.

---

## Open items

- Cold-start latency mitigation for inactive SPACE containers
- CDN strategy for SPACEs serving high volumes of media (music, video)
- Storage quotas per tier
- What happens to a SPACE when a user's subscription lapses (grace period, read-only mode, deletion timeline)
- SPACE transfer or inheritance (relevant to the Posthumous LIFE app)
- ~~Multiple co-owners~~ — **resolved**: supported; role system defined above
- ~~Deleted account content~~ — **resolved**: all content removed on deletion; no tombstones
