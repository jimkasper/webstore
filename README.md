# nTogether

A privacy-first social platform where every user owns their own corner of the internet — their **SPACE** — and chooses exactly how much of themselves they share with the world and the platform.

---

## Core idea

Every user gets a self-hosted website (their SPACE), a suite of personal productivity apps (LIFE), and access to a social network (CONNECT) that aggregates content from all SPACEs without hosting any of it centrally. The platform makes money from users who want it to, and stays out of the way of those who don't.

---

## Key principles

- **You own your SPACE.** Your site, your content, your data. Remove it from your SPACE and it's gone from everywhere.
- **Privacy is a product, not a policy.** Five tiers let users choose exactly how much the platform sees, indexed by price. Higher privacy costs more. Tier 5 is free — in exchange for full data access.
- **CONNECT hosts nothing.** Music, video, podcasts, and posts live on user SPACEs. CONNECT discovers and surfaces them.
- **The DATA HUB is yours.** Every tier generates the same data for the user's personal intelligence layer. The tier only controls what the *platform* can see — not what the user gets back.

---

## Documentation

All docs live in `design/`, organized by component.

### `design/platform/` — Cross-cutting platform docs
| Doc | What it covers |
|-----|---------------|
| `product-overview.md` | Vision, differentiators, component summary, launch plan |
| `app-architecture.md` | Full app map, platform matrix, offline support |
| `tier-definitions.md` | All 5 tiers: pricing, identity, data access, coin |
| `privacy-model.md` | Consolidated privacy rules across tiers and interactions |
| `onboarding-flows.md` | User onboarding and SPACE setup wizard |
| `platform-analysis.md` | Technical architecture analysis and decisions |
| `clarification-resolutions.md` | Design decision log |

### `design/space/` — SPACE, PROFILE, and site builder
| Doc | What it covers |
|-----|---------------|
| `space-spec.md` | The SPACE/PROFILE system: pages, domain, Wall, communities |
| `site-builder-system.md` | BUILDSPACE architecture: hierarchy, blocks, modules, social blocks |
| `site-builder-catalog.md` | Full page/block/module defaults by purpose and use |
| `repository-install.md` | Self-hosted Git repository system |

### `design/connect/` — Social discovery and media
| Doc | What it covers |
|-----|---------------|
| `connect-spec.md` | Music, video, podcast, post feed, marketplaces |
| `social-spec.md` | Social mechanics: follows, posts, comments, reactions, notifications |

### `design/life/` — Personal productivity suite
| Doc | What it covers |
|-----|---------------|
| `life-suite-spec.md` | All 9 LIFE apps: Journal, Scheduler, Lists, Planner, Diet, Financial, Agreement, Research, Posthumous |
| `life-lists-app.md` | Lists app — detailed spec |

### `design/coin/` — tokenTogether
| Doc | What it covers |
|-----|---------------|
| `coin-design.md` | Supply, staking, governance, distribution, transaction fees |

### `design/data-hub/` — Personal intelligence backend
| Doc | What it covers |
|-----|---------------|
| `data-hub-spec.md` | Event bus, materialized views, ANALYZER, storage, tier access |

### `design/transcripts/` — Session transcripts
Raw session logs from design and planning sessions.
