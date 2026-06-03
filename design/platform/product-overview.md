# nTogether — Product Overview
Last updated: 2026-04-24

---

## What is nTogether?

nTogether is a privacy-first social platform and personal productivity suite built on a single principle: **users should own their presence on the internet, not rent it.**

Every user gets:
- A **SPACE** — their own hosted website with a custom domain, built with a visual site builder
- The **LIFE suite** — a set of personal apps (journal, scheduler, lists, planner, diet, financial, research, and more) whose data belongs entirely to the user
- Access to **CONNECT** — a social network that aggregates music, video, podcasts, and posts from across all SPACEs without hosting any content centrally
- A **tokenTogether coin wallet** — an in-platform currency earned through engagement and data participation
- A **self-hosted Git repository** — a personal code and data hosting service backed by their SPACE

---

## The privacy tier model

nTogether operates on five privacy tiers. The tier controls what the platform can see and do with a user's data. It does not restrict any feature, social capability, or app access.

| Tier | Platform sees | Monthly | Annual |
|------|--------------|---------|--------|
| 1 | Nothing — zero knowledge | $50 | $500 |
| 2 | Aggregate stats only | $35 | $350 |
| 3 | Behavioral patterns, no identity | $25 | $250 |
| 4 | Full data, linked to identity, not sold | $12 | $120 |
| 5 | Full collection and monetization | Free | — |

Tier 5 users are not customers — they are the product. They exchange data access for free use of the platform and earn coin when their data is sold through the CONNECT data marketplace.

Tier 1–4 users pay to keep their data private. The platform earns from their subscription rather than their data. The platform is always more profitable on paid subscriptions than on free data sales.

---

## Key differentiators

### You own your SPACE
Other platforms own your content. On nTogether, your content lives on your SPACE — a hosted website in an isolated container. Delete something from your SPACE and it is gone from the platform immediately. No copies, no CDN cache, no archive.

### CONNECT hosts nothing
The music library, video library, podcast feed, and post feed in CONNECT are discovery layers — not hosting platforms. A song streams from the artist's SPACE. A video plays from the creator's SPACE. Removing content from your SPACE removes it from CONNECT instantly. Creators are never at the mercy of a platform's content policies for content they host themselves.

### The DATA HUB is yours first
Every tier generates the same personal data layer — the DATA HUB. Your journal, activity, health, spending, and behavioral patterns power your own intelligence engines (ANALYZER). The tier controls only what the platform gets to see — not what you get back.

### Privacy without friction
Privacy is not a settings menu buried in your account. It is the pricing tier you are already on. Every interaction also has its own visibility control: private, selectively shared, or fully public. A Tier 1 user can make a fully public post. A Tier 5 user can make a private post. Tier and per-interaction privacy are independent axes.

### Forkable social blocks
Polls, lists, and rankings on any SPACE can be forked by other users onto their own SPACE. The structure is shared; the answers are personal. Your network's responses are visible alongside yours, creating a social layer on top of any piece of content — without a centralized feed owning it.

---

## Platform components

### SPACE (PROFILE)
Your personal website. Built with BUILDSPACE, deployed to your own isolated container, accessible at a custom domain. Contains your Wall (social feed), About, Contact, Media Gallery, and any pages you build. See `space-spec.md`.

### BUILDSPACE
The site builder for your SPACE. Visual, block-based, with a full template library organized by purpose (Personal / Business / Content/Influencer / Organization) and use (27 use types). See `site-builder-system.md` and `site-builder-catalog.md`.

### LIFE
Nine personal productivity apps, each independently installable, all communicating via the DATA HUB event bus:
- Journal, Scheduler, Lists, Planner, Diet, Financial, Agreement, Research, Posthumous

See `life-suite-spec.md`.

### CONNECT
The social discovery layer. Music library, video library, podcast feed, post feed, global search, algorithm marketplace, data marketplace, creator-advertiser marketplace, and advertising platform. See `connect-spec.md`.

### DATA HUB
The personal intelligence backend. Consumes all LIFE and app events, powers ANALYZER (natural language queries across your own data), and surfaces materialized views to DASH widgets. See `data-hub-spec.md`.

### tokenTogether
The in-platform coin. Revenue-matched supply, tiered transaction fees, staking with fixed-base-plus-revenue-share rewards, governance via multi-group vote. Earned through engagement, data sales, and creator activity. See `coin-design.md`.

### Repository
Self-hosted Git hosting at `ntogether.com/<username>/<repo>` via HTTPS and SSH. All repos backed by the user's DATA HUB. External repos (GitHub, GitLab) can be imported or mirrored. See `repository-install.md`.

### MESSENGER
End-to-end encrypted messaging. Native standalone app for background push and persistent connection. Also embedded in the suite shell.

### BOARD
Community spaces at two levels: SPACE-level (owned by the SPACE owner) and network-level (platform-wide community forums accessible from the suite shell).

### CLOUD
Personal cloud storage. Self-hostable and deployable via BUILDSPACE — to the user's SPACE container, an external VPS, or a local machine. Also available as a managed nTogether-hosted option.

### BROWSER
Phase 1: Extension for Chrome, Firefox, and Safari. Password manager, media archiver (saves to CLOUD), bookmark manager, and research capture (sends to LIFE research organizer). Later: full standalone browser.

### DASH
The suite home screen and an embeddable PROFILE page. Block-based dashboard surfacing LIFE data, social activity, coin stats, repository activity, and any custom widgets.

---

## Launch

- **Free launch window**: All tiers free for all users for a defined period (duration TBD).
- **Lifetime subscriptions**: Available during the launch window for Tiers 1–4. Pricing TBD. Unavailable after launch closes.

---

## Open items

See `clarification-resolutions.md` for the full decision log. Key outstanding items:
- Lifetime subscription pricing
- Free launch window duration
- Full identity verification scope for Tier 5
- Staking rates and lock-in periods
- Transaction fee amounts per tier
- CDN strategy for high-traffic SPACEs serving media at scale
