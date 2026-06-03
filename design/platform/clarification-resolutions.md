# nTogether — Clarification Resolutions
Date: 2026-04-23

These resolutions close the 10 open issues identified in platform-analysis.md,
plus structural optimization decisions.

---

## Issue Resolutions

### Issue 1 & 9 — Cryptography layer
**Resolution:** zk-STARKs restricted to proof-generation use cases only.
- Encryption: AES-256-GCM (data at rest), X25519 (key exchange)
- Messaging E2E: Signal Protocol (Double Ratchet + X3DH)
- zk-STARKs reserved for: privacy coin transaction layer, data marketplace proofs, algorithm behavior verification

### Issue 2 — Data Hub home
**Resolution:** The personal Data Hub is a standalone backend service, separate from both ENGINE (identity/auth) and CONNECT (public search/marketplace). All apps write events to it; all intelligence engines read from it.

### Issue 3 — Multi-persona data isolation
**Resolution:** Cryptographically isolated. Each persona's data is encrypted with separate keys. No cross-persona analytics possible. The Tier 1 privacy guarantee is absolute — a Tier 5 persona cannot leak anything about a Tier 1 persona.

### Issue 4 — Coin conversion reference rate
**Resolution:** Internal platform floor-price algorithm. The rate is derived from total platform revenue, circulating supply, and transaction volume. Tiered conversion rates are discounts from the floor (e.g. Tier 1 converts at floor — best rate; Tier 5 pays the highest spread).

### Issue 5 — Ad moderation and legal liability
**Resolution:** Reporting-based moderation. No pre-screening of ads. Platform acts expeditiously on reports of illegal content, preserving Section 230 / DSA safe harbor.
- Additional decision: No users under 18 permitted initially. Eliminates COPPA entirely and significantly reduces GDPR-K obligations.

### Issue 6 — Tier immutability enforcement
**Resolution:** Cryptographic enforcement. Data is encrypted at creation time with a key derived from the user's tier and identity. Re-keying is structurally impossible without the original key. The promise is enforced by cryptography, not policy.

### Issue 7 — ActivityPub / federation
**Resolution:** No federation. ActivityPub is dropped entirely. nTogether is a closed network. SPACEs connect only with other SPACEs within nTogether. This significantly simplifies ENGINE — no federation protocol, no remote actor lookups, no HTTP Signatures for external servers.

### Issue 8 — Data buyout fee timing
**Resolution:** Flat-rate model in early phases, algorithmic valuation in Phase 4/5.
- Phase 1–3: flat rate per month of lower-tier membership when user upgrades
- Phase 4/5: full valuation engine replaces flat rate
- Early users get a fair, simple deal; the system improves over time

### Issue 10 — BOARD definition
**Resolution:** Both levels, connected.
- SPACE-level: a message board page type within a user's PROFILE site, owned and moderated by that user
- Network-level: boards can optionally be made public and discoverable across the nTogether network
- The SPACE-level board is the building block; the network platform surfaces them

---

## Structural Optimization Decisions

### Navigation Architecture
- Persistent left-side app rail showing all apps
- User can sort the rail manually, by most frequently used, or by recently used
- Global command palette (Cmd+K / Ctrl+K) accessible from anywhere in the suite for instant app switching, quick journal entries, task creation, and global search

### Frontend API Pattern
- REST for all standard CRUD operations across all apps
- GraphQL with persisted queries for DASH widgets, BUILDSPACE previews, and Data Hub queries (where data shape varies heavily per request)
- Revisit: decision deferred for further evaluation

### DASH Block Grid
- Two layout tiers for the marketplace:
  - **Standard layout** (3 sizes): Small (1×1), Medium (2×1), Large (2×2)
  - **Power layout** (5 sizes): adds Wide (3×1) and Full-width
- Block creators choose which layout tier they develop for
- Users filter marketplace blocks by layout type
- DASH detects and renders based on the user's active layout mode

### Time-Series Data Storage
- TimescaleDB extension added to the existing PostgreSQL instance
- Handles time-series data across all apps: journal entries, scheduler events, financial transactions, wearable readings, mood signals
- Automatic compression and fast range queries without adding a separate database to operate

---

## Architectural Changes from Resolutions

The following decisions change the architecture documented in the original ENGINE implementation plan (transcript-2026-04-22-356d00e2.md):

1. **ActivityPub dropped** — ENGINE no longer implements ActivityPub. The `ap_inbox_queue`, `ap_outbox_queue` tables, HTTP Signature middleware, WebFinger, and NodeInfo handlers are removed. ENGINE becomes a pure internal identity, auth, and data-transfer service.

2. **Data Hub is a new named service** — Not ENGINE, not CONNECT. A fifth top-level service alongside ENGINE, PROFILE, LIFE, and CONNECT. Consumes the Redis Streams event bus; maintains materialized views for cross-app intelligence engines; exposes the ANALYZER query interface.

3. **Messaging uses Signal Protocol** — MESSENGER implements the Signal Protocol (Double Ratchet + X3DH). The platform server never holds plaintext message content. No Data Hub indexing of message content.

4. **Tier-keyed encryption is a core infrastructure requirement** — Before any data storage is implemented, a tier-keyed encryption scheme must be designed. Every record's encryption key is derived from the user's tier at creation time. This is a prerequisite for all app development, not a later addition.

---

## Session 2026-04-24 — Distribution & Infrastructure Decisions

### Distribution — Mobile
**Resolution:** App stores + direct download.
- iOS: Apple App Store (primary) + direct IPA sideload option
- Android: Google Play Store (primary) + direct APK download
- Apple's 30% in-app purchase fee applies to App Store transactions; tokenTogether coin purchases may need to route through a web payment flow on iOS to avoid this cut

### Distribution — Desktop
**Resolution:** Direct download (canonical) + app store presence.
- macOS: ntogether.com direct download + Mac App Store
- Windows: ntogether.com direct download + Microsoft Store
- Linux: ntogether.com direct download + apt, brew, and flatpak package managers
- Direct download is the source of truth; store versions are secondary distribution channels

### Distribution — Browser Extension
**Resolution:** All three stores.
- Chrome Web Store
- Firefox Add-ons
- Safari Extensions Gallery
- CI/CD must produce signed builds for all three simultaneously

### PROFILE Hosting Model
**Resolution:** Per-SPACE containers.
- Each user SPACE runs in its own isolated container
- Maximum isolation between user sites
- Operational complexity at scale is the primary trade-off; container orchestration strategy to be decided when infrastructure planning begins

### CI/CD Pipeline
**Resolution:** Deferred. Build, test, and deploy tooling not yet selected.

### CLOUD Backend Storage
**Resolution:** Deferred. Object storage backend (S3-compatible vs. self-managed) not yet selected. Note: this decision only applies to the nTogether-hosted CLOUD tier — self-hosted instances use whatever the user's deployment target provides.

### CLOUD Deployment Model
**Resolution:** CLOUD is a self-hostable, deployable unit. Users install it through BUILDSPACE.
- **Supported targets:**
  - nTogether-hosted (managed by nTogether — see CLOUD Hosting Pricing below)
  - User's PROFILE site (deploys into the SPACE's per-SPACE container)
  - External hosting platform (user-supplied server or VPS)
  - Local (home server, NAS, or local machine)
- **Multiple installs:** A user can run CLOUD on several targets at once. Each instance is fully independent — no auto-sync between installations.
- **nTogether remains an option** — it is not required. Users who don't want to self-host can purchase nTogether-managed storage instead.

### CLOUD Hosting Pricing
**Resolution:** nTogether-hosted CLOUD is a paid add-on, priced and billed separately from tier membership.
- A user's privacy tier (1–5) has no bearing on CLOUD hosting eligibility or price
- A Tier 1 user can purchase hosted CLOUD; a Tier 5 user can self-host for free
- Pricing structure (storage tiers, billing cadence) to be defined during product/monetization planning
- This is distinct from all other platform fees: it is infrastructure cost recovery, not a privacy or identity service

### BUILDSPACE Scope Expansion
**Resolution:** BUILDSPACE is no longer solely a site builder. It gains a CLOUD installation wizard as a second primary function.
- Site builder: builds and deploys the user's PROFILE site
- CLOUD installer/manager: deploys and manages CLOUD on any supported target from within the same app

### LIFE Sub-App Independence
**Resolution:** LIFE is a convenience bundle, not a dependency. Each sub-app (Journal, Scheduler, Planner, Diet, Financial, Agreement, Research, Posthumous) is independently installable and fully functional on its own.
- Sub-apps communicate with each other through the DATA HUB event bus — not through the LIFE container
- Installing a sub-app standalone does not break cross-app intelligence or data sharing
- LIFE bundles all sub-apps together for users who want everything in one install; standalone installation is for users who want only specific apps
- The event bus is the communication layer in both cases

---

## Session 2026-04-24 — Tier System Definitions

Full definitions captured in `tier-definitions.md`. Summary of decisions made:

### Tier numbering
Tier 1 = best (most private, most expensive). Tier 5 = free (fully public). Corrected from earlier coin doc which had this backwards.

### Pricing model
Tier 5 is free. Tiers 1–4 are priced at 120% of the estimated revenue the platform sacrifices by not monetizing that user at the Tier 5 level. The platform is always more profitable on paid tiers than on free-tier data sales. Per-user revenue estimation methodology is TBD.

### Platform data access per tier
- Tier 1: Zero — nothing beyond structural service delivery
- Tier 2: Aggregate and anonymized stats only — no individual records, no identity linkage
- Tier 3: Behavioral patterns (usage, preferences, engagement) — no identity linkage, not sold
- Tier 4: Full behavioral data linked to identity — internal use only, shared in aggregate with partners, not sold individually
- Tier 5: Full collection and monetization — sold via CONNECT data marketplace; user earns coin from sales

User DATA HUB access and intelligence engine benefits are identical across all tiers. The tier controls only what the platform sees — not what the user gets back.

### Identity requirements
- Tier 1–2: No identity required. Fully anonymous.
- Tier 3–4: Verified email minimum.
- Tier 5: Full identity verification. ⚠️ Scope of "full verification" is TBD.

### Social access
Identical across all tiers. No tier restricts social capability. Every user controls privacy per interaction: private (self only), selectively shared (chosen users/groups, with tier-aware warnings), or fully public. The tier is invisible to other users.

### ANALYZER query handling
- Tier 1–2: On-device LLM. Queries never leave the device.
- Tier 3–5: Platform LLM, with explicit disclosure.

---

## Session 2026-04-24 — Pricing Revised to Fixed Rates

Replaced the 120% sacrificed-revenue dynamic pricing model with fixed flat rates:

| Tier | Monthly | Annual |
|------|---------|--------|
| Tier 1 | $50/mo | $500/yr |
| Tier 2 | $35/mo | $350/yr |
| Tier 3 | $25/mo | $250/yr |
| Tier 4 | $12/mo | $120/yr |
| Tier 5 | Free | Free |

**Launch:** All tiers free for all users for a defined period (duration TBD).

**Lifetime subscriptions:** Offered during the launch window for Tiers 1–4. Pricing TBD. Unavailable after launch window closes.

---

## Session 2026-04-24 — Repository Install Feature

Full spec in `repository-install.md`. Decisions:

- **Supported types**: Code repos (GitHub, GitLab, etc.), data repos, app/plugin repos — all types supported.
- **Install to cloud**: Mirrors and syncs the repo to the user's DATA HUB. No execution. Private by default — does not appear on profile unless explicitly added.
- **Install to profile**: Displays repo as a portfolio item. Functional — other users can install it from the profile in one click. Profile owner earns install-count attribution.
- **Privacy**: Tier governs what the platform can see about cloud-installed content. Per-interaction privacy controls apply to profile-listed repos.
- **Install source** (when installing from another user's profile): fork from the profile owner's nTogether-hosted copy, not the upstream origin.
- **Primary model revised**: nTogether is a native Git host (HTTPS + SSH). External repos can be imported or mirrored into the user's nTogether namespace. Self-hosted is the primary model; external import/mirror is secondary.

---

## Session 2026-04-24 — Design Q&A Resolutions

### Posthumous release trigger
**Resolution:** Combination of three mechanisms (any one can initiate, all require confirmation before acting):
1. **Inactivity timer** — no login for a configurable period (default 12 months); platform sends verification emails to account and legacy contacts before triggering
2. **Legacy contact request** — a designated legacy contact submits a verified identity claim requesting access
3. **Manual release** — account holder explicitly arms a release (terminal illness, planned absence); sets a future activation date or delegates immediate control

All three paths require multi-step confirmation to prevent premature or accidental triggering.

### LIFE app installation model
**Resolution:** Individual install only. No bundle. No app is pre-installed. Users choose each app they want from the LIFE catalog. Cross-app intelligence (event bus, shared tags, LENS correlation) activates automatically between whichever apps are installed.

### Podcast hosting
**Resolution:** Audio files are hosted on the podcaster's own SPACE — the same model as music and video. CONNECT aggregates and streams from source SPACEs; it does not store any audio. RSS feeds are auto-generated per show so external podcast apps can subscribe.

### Algorithm Marketplace — who can publish
**Resolution:** Anyone. No developer-only gate. Any user can publish an algorithm. Published algorithms go through automated sandbox compliance check + manual review before going live. Revenue split: 80% author / 20% platform.

### Deleted account content
**Resolution:** Full removal. When an account is deleted:
- The user's SPACE and all hosted content is permanently deleted
- Their posts/comments on other users' SPACEs are deleted with no tombstone — threads collapse around the gap
- Their reactions are removed; affected posts' reaction counts update
- Username enters a 90-day hold before becoming available

### SPACE co-ownership
**Resolution:** Multiple co-owners supported. Role system: Primary owner / Co-owner / Editor / Moderator. Primary owner holds billing and deletion rights. Co-owners have full editorial and moderation control. Primary ownership is transferable. Full role table in `space-spec.md`.

### MESSENGER scope
**Resolution:** 1-on-1 messaging only at launch. Group messaging is planned for a later phase (Phase 2 of MESSENGER). Technical design for groups (key distribution model, admin roles, history policy for new members) is deferred. Full spec in `design/messenger/messenger-spec.md`.
