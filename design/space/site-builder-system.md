# Site Builder System — Spec
Last updated: 2026-04-24

---

## Hierarchy

```
Purpose(s)
  └── Use(s)
        └── Page Template(s)
              └── Pages
                    └── Blocks (static + dynamic)
                          └── Modules
```

Each level is a starting point, never a constraint. Selections at any level suggest defaults at the next level — they never restrict access to the full library.

---

## Selection Rules

### Purposes
- Multi-select: Personal / Business / Content/Influencer / Organization
- Selecting a purpose surfaces its uses first in Step 2, but does not hide others

### Uses
- Multi-select
- Uses from the user's selected purpose(s) are shown first
- The full use library is always accessible — users can pick uses outside their purpose
- Selected uses suggest page templates in Step 3, but all templates remain available

### Page Templates
- One default template per use (templates TBD — see Open Items)
- When multiple uses are selected, templates from all selected uses are offered
- Users can choose pages from any template, including templates outside their selected uses
- Templates are starting points — every element is editable after selection

### Pages
- Each template comes with a set of pre-built pages
- Users can add any page from the full page library regardless of use or template
- Pages arrive pre-populated with blocks

---

## Blocks

Blocks are the layout units within a page. Each block contains one or more modules arranged in a defined layout zone.

### Block types

| Type | Description |
|------|-------------|
| **Static** | Pre-filled with starter/placeholder content. Edited manually. No live data connection. |
| **Dynamic** | Connected to a live data source. Content updates automatically. Source is configurable. |

### Dynamic block data sources

Dynamic blocks can pull from any of the following:

- **LIFE suite** — journal entries, scheduler events, lists, goals, research notes
- **Social** — wall posts, recent activity, follower/following counts
- **Repository** — latest commits, repo stats, pinned repos, README content
- **Coin / DATA HUB** — public wallet stats, data marketplace activity (tier-governed)
- **External feeds** — RSS, API endpoints, embedded third-party content
- **Form submissions** — contact forms, sign-up forms, user-submitted data
- **Media** — photo galleries, video feeds, audio players

### Block grid

Blocks snap to a standard grid:

| Size | Grid units | Typical use |
|------|-----------|-------------|
| Small | 1 × 1 | Stat, icon, avatar, button |
| Medium | 2 × 1 | Text + image, feed preview, card |
| Large | 2 × 2 | Hero, gallery, featured content |
| Full-width | Span | Banner, header, section divider |

Blocks can be resized, reordered, and nested within a page.

---

## Modules

Modules are the atomic content units inside a block. A block contains one or more modules.

### Module library (default)

| Module | Type | Static / Dynamic |
|--------|------|-----------------|
| Heading | Text | Static |
| Rich text | Text | Static |
| Image | Media | Static |
| Video | Media | Static / Dynamic |
| Audio player | Media | Static / Dynamic |
| Button / CTA | Action | Static |
| Link list | Navigation | Static |
| Divider / spacer | Layout | Static |
| Social feed | Feed | Dynamic |
| Activity feed | Feed | Dynamic |
| LIFE events (scheduler) | Feed | Dynamic |
| Journal excerpt | Feed | Dynamic |
| List (from Lists app) | Feed | Dynamic |
| Repository card | Data | Dynamic |
| Commit feed | Feed | Dynamic |
| Stat counter | Data | Dynamic / Static |
| Map | Embed | Static |
| Contact form | Form | Static |
| Sign-up form | Form | Dynamic |
| Embed (iframe) | Embed | Static |
| RSS feed | Feed | Dynamic |
| Poll | Interactive | Dynamic |
| Custom code | Code | Static |

> ⚠️ Module library is a starting set. Marketplace modules can be installed to extend it.

---

## Social Blocks — Forking and Network Responses

Certain blocks and modules can be forked and shared across profiles, creating a social layer where in-network responses are visible alongside your own.

### How forking works

1. Any forkable block on a public or selectively-shared profile has a **"Fork to my SPACE"** action.
2. Forking copies the block's *structure* — the question, list template, poll options, ranking format — not the original owner's answers.
3. The forked block is linked to its origin and all other forks (a fork graph). The platform tracks lineage but never exposes it without the user's consent.
4. The user fills in their own answers on their own SPACE.
5. In-network profiles who have forked the same block (or the original) are surfaced in a **"See how your network answered"** panel within the block.

### Network response display

- Shows responses from profiles the viewing user follows or is connected to, governed by each responder's privacy settings.
- Aggregate views (e.g. "14 people in your network also ranked [album] #1") shown without revealing who answered what, unless the responder's SPACE is set to fully public.
- Users control whether their own fork participates in network aggregation: **visible to network** (default for public SPACE) / **anonymous in aggregate** / **private** (does not appear in others' network views).

### Forkable module types

| Module | Fork behavior |
|--------|--------------|
| **Poll** | Copies question and options. Each fork collects its own votes. Network panel shows how your network voted. |
| **Lists block** | Copies the list title and tags. Each fork is filled with the user's own items. Network panel shows others' lists side-by-side. |
| **Ranking** *(future module)* | Copies the ranking prompt and candidate items. Network panel shows ranked order across the network. |

### Discovery via CONNECT

Forkable blocks with high fork counts surface in the CONNECT post feed and relevant category feeds, making them discoverable beyond the origin profile's immediate network. A block with many forks becomes a platform-wide conversation thread.

---

## Customization

Every level is fully customizable after any selection:

| Level | What can be changed |
|-------|-------------------|
| Purpose / Use | Re-selectable at any time; changes suggested defaults only, never removes content |
| Template | Swap to a different template; existing edits can be preserved or replaced |
| Page | Add, remove, rename, reorder, or duplicate any page |
| Block | Add, remove, resize, reorder, or replace any block on any page |
| Module | Add, remove, reorder, or replace any module within any block |
| Content | Every text, image, link, and data connection is editable |
| Style | Colors, fonts, spacing, borders — overridable per module, block, page, or globally via theme |

---

## Theme

A theme sets global visual defaults (colors, fonts, spacing, border radius) applied across all pages. Themes are selected in Step 4 of the onboarding wizard and can be changed at any time from BUILDSPACE. Individual blocks and modules can override theme defaults.

---

## Marketplace Extensions

Third-party blocks and modules are installable from the marketplace. They render in sandboxed iframes with strict CSP — marketplace blocks cannot access the parent page's DOM, read other blocks' data, or make unauthorized network requests.

---

## Open Items

- Full page template library per use (templates themselves not yet designed)
- Default block sets per page per use (pre-population specifics TBD)
- Block and module naming conventions for the UI
- Whether users can save custom blocks/modules as reusable components
- Collaborative editing (multiple users editing the same SPACE simultaneously)
- Version history and restore for pages
