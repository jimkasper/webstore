# Privacy Model — Spec
Last updated: 2026-04-24

---

## Two independent privacy axes

Every piece of content on nTogether is governed by two independent privacy settings that never override each other:

1. **The user's tier** — controls what the *platform* can see and do in the background
2. **Per-content visibility** — controls who can *view* each post, page, block, or file

A Tier 1 user can post fully publicly. A Tier 5 user can post privately. These are orthogonal. Neither constrains the other.

---

## Axis 1 — Tier (platform data access)

The tier is a subscription-level setting. It governs every interaction, automatically.

| Tier | What the platform can see and do |
|------|----------------------------------|
| **Tier 1** | Zero-knowledge. Nothing beyond what is structurally required to deliver the service. No profiling, no analytics, no data linked to the user. |
| **Tier 2** | Aggregate, anonymized platform-level statistics only. No individual behavioral records. No identity linkage. |
| **Tier 3** | Behavioral patterns (usage, preferences, engagement signals). Not linked to identity. Not sold. Platform knows *what* the user does, not *who* they are. |
| **Tier 4** | Full behavioral data linked to identity. Internal use only. Shared in aggregate with partners. Not sold individually on the data marketplace. |
| **Tier 5** | Full collection and monetization. Behavioral data, identity data, all content metadata indexed and available for sale via the CONNECT data marketplace. |

---

## Axis 2 — Per-content visibility

Every post, page, block, file, or repo has its own visibility setting. This controls who can view it.

| Setting | Who can see it |
|---------|---------------|
| **Private** | Only the owner |
| **Selectively shared** | Chosen users or groups specified by the owner |
| **Fully public** | Anyone — on the platform, indexed by CONNECT, visible on the open web |

The default per-content visibility is configurable per SPACE. Individual items can override the default at any time.

---

## Data encryption

Data is encrypted at creation time using a key derived from the tier at which it was created.

- Tier changes do not retroactively re-encrypt existing data.
- Data created at Tier 1 remains Tier-1-encrypted even if the user later moves to Tier 5.
- Re-keying is architecturally impossible — this is an intentional design constraint that makes the privacy guarantee credible.

---

## Cross-tier interaction rules

When users at different tiers interact, the higher-privacy user is always protected.

### Social interactions
- The lower-tier party cannot expose the higher-tier party.
- If a Tier 5 user tags a Tier 1 user in a post, the Tier 1 identifier is scrubbed before storage — anonymized at the write path, not post-processed.
- Comments and reactions from higher-tier users contribute to aggregate counts but are not stored by the platform in any identity-linked form.

### Coin transactions
- The higher-tier user's privacy settings take precedence regardless of the lower-tier user's settings.
- A Tier 1 user transacting with a Tier 5 user: the Tier 1 side is fully shielded. The Tier 5 side is subject to Tier 5 transparency defaults.
- Partners may set their own minimum privacy level for transactions; this overrides the lower-tier user's default but cannot override a higher-tier user's protections.

### Selective sharing warnings
When a user shares content selectively (e.g. sends a post to specific users), the platform warns the sender if any recipient's tier means the platform will have access to that interaction. The sender can then decide whether to proceed.

---

## CONNECT indexing rules

CONNECT can only index content that is both:
1. Set to **fully public** by the content owner, AND
2. From a SPACE whose owner's **tier permits platform indexing**

| Tier | CONNECT indexing of public content |
|------|-----------------------------------|
| Tier 1 | Platform cannot deep-index. Public content is served directly from the SPACE container; CONNECT may hold a cached reference but not a searchable index of content or metadata. |
| Tier 2 | Platform may hold anonymized aggregate index (e.g. this SPACE exists and has N public posts) but not content-level indexing. |
| Tier 3 | Behavioral signals and content metadata indexable; not linked to real-world identity in the index. |
| Tier 4 | Full content and metadata indexable; linked to identity for internal personalization. Not available to data marketplace buyers. |
| Tier 5 | Full content, metadata, and identity linked; available to data marketplace buyers. |

A Tier 1 user who disables CONNECT indexing entirely (via SPACE settings) effectively becomes invisible to CONNECT discovery even for public content.

---

## Notifications privacy

Notifications involving higher-tier users are delivered but the platform does not retain metadata about who triggered them for lower-tier or platform-level analytics.

Example: A Tier 1 user follows a Tier 5 SPACE. The Tier 5 user is notified of the new follower. The platform delivers the notification but does not log "user X (Tier 1) followed user Y (Tier 5)" in any analytics or monetization pipeline.

---

## DATA HUB access model

The DATA HUB stores the user's complete personal data at every tier. The tier governs what platform systems can read from it:

| Tier | Platform read access to DATA HUB |
|------|----------------------------------|
| Tier 1 | Zero — platform systems cannot read any DATA HUB data |
| Tier 2 | Aggregate, anonymized platform stats only |
| Tier 3 | Behavioral patterns, no identity linkage |
| Tier 4 | Full read, identity-linked, internal use only |
| Tier 5 | Full read; data sold via CONNECT data marketplace |

The user always has full read and write access to their own DATA HUB at every tier.

---

## Repository privacy

Self-hosted repositories are stored in the user's DATA HUB cloud. Platform access to repo contents follows the user's tier exactly — a Tier 1 user's repositories are zero-knowledge to the platform even if the repos are set to fully public on their profile.

---

## ANALYZER privacy

ANALYZER queries are processed according to tier:
- **Tier 1–2**: On-device LLM. No query data leaves the device. Zero-knowledge to the platform.
- **Tier 3–5**: Platform LLM. Users are explicitly informed that queries are processed server-side. The platform does not use ANALYZER queries for advertising targeting or data marketplace sales — they are used only to service the query.

---

## User control summary

| Control | Where it lives | Who controls it |
|---------|---------------|-----------------|
| Tier (platform data access) | Account/subscription settings | User |
| Default post visibility | SPACE settings | User |
| Per-post/block visibility | Each individual piece of content | User |
| CONNECT indexing | SPACE settings | User |
| Follow approval | SPACE settings | User |
| ANALYZER processing location | Automatic by tier — Tier 1–2 on-device, Tier 3–5 platform | Determined by tier |
| Social block fork participation | Per block setting | User |
| Coin transaction privacy | Per transaction, within tier-allowed options | User |
| Notification preferences | Account/notification settings | User |

---

## Open items

- Precise definition of "structurally required to deliver the service" for Tier 1 (what minimum data must be retained?)
- Graceful degradation model when a Tier 1 SPACE serves high traffic (CDN edge caching without platform analytics)
- Whether Tier 2 aggregate stats include SPACE-level data or only platform-level
- Content takedown and legal compliance interaction with Tier 1 zero-knowledge guarantee
