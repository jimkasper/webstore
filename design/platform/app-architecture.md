# nTogether — App Architecture Map
Last updated: 2026-04-24

---

## Platform Targets

| Platform | Supported |
|----------|-----------|
| Web (all browsers) | ✅ |
| iOS | ✅ |
| Android | ✅ |
| macOS | ✅ |
| Windows | ✅ |
| Linux | ✅ |

---

## Distribution

### Mobile (iOS & Android)
- **Primary:** Apple App Store (iOS) and Google Play Store (Android)
- **Secondary:** Direct APK download for Android; direct IPA sideload for iOS (for users who want to bypass the stores)
- Apple's 30% in-app purchase cut applies to App Store transactions; tokenTogether coin purchases may need to route through a web payment flow on iOS to avoid this

### Desktop (macOS, Windows, Linux)
- **Primary:** Direct download from ntogether.com for all three platforms
- **Secondary store presence:**
  - macOS: Mac App Store
  - Windows: Microsoft Store
  - Linux: package managers (apt, brew, flatpak)
- Direct download is canonical; store versions shadow it

### Browser Extension
- Chrome Web Store
- Firefox Add-ons
- Safari Extensions Gallery
- All three stores targeted simultaneously; CI/CD must produce signed builds for each

### CI/CD
> ⚠️ **DEFERRED.** Build, test, and deploy pipeline tooling has not been selected.

---

## App Hierarchy

### Backend Services (online only, no user-facing install)

| Service | Role |
|---------|------|
| **ENGINE** | Internal identity, auth, session management, data transfer between SPACEs |
| **DATA HUB** | Standalone service. Consumes event bus from all apps, powers cross-app intelligence engines, exposes the ANALYZER query interface |

---

### The Suite Shell

The suite shell is the **primary nTogether application** — the native desktop app, the web app, and the mobile app. It provides the app rail, command palette, and hosts embedded versions of several apps.

**Platforms:** Web, iOS, Android, macOS, Windows, Linux
**Offline:** Partial — app rail and cached data available offline; live features require connection

Apps accessible from the suite shell via the app rail:
- DASH (home screen)
- LIFE
- MESSENGER (embedded)
- CONNECT
- BOARD (network-level)
- CLOUD (embedded)
- tokenTogether wallet (embedded)
- BUILDSPACE (launch point)
- Password Manager

---

### App Map

#### PROFILE
- **Type:** Web (each SPACE is a hosted website with a custom domain)
- **Hosting model:** Per-SPACE containers — each SPACE runs in its own isolated container. Maximum isolation between user sites; ops complexity is the trade-off and must be managed at scale.
- **Platforms:** Web (all devices — viewing). Desktop + mobile for management via suite shell.
- **Offline:** No — SPACE sites require a live host
- **Contains:**
  - BOARD page type (SPACE-level message board, owned and moderated by the SPACE owner)
  - DASH (a personal dashboard page embedded in the SPACE profile)
  - Profile pages (Wall, About, Contact, Media Gallery)
  - Live streaming, audio rooms
  - Communities (groups and channel spaces)

#### BUILDSPACE
- **Type:** Standalone app — the site builder for PROFILE and the installer/manager for CLOUD deployments
- **Platforms:** Web, macOS, Windows, Linux (not mobile — too complex for small screens)
- **Offline:** Partial — local editing with sync on reconnect
- **Independent from PROFILE** — opened separately, deploys to the user's SPACE
- **CLOUD installer:** BUILDSPACE includes a CLOUD installation wizard. Users can deploy CLOUD to any supported target directly from BUILDSPACE:
  - Their PROFILE site (runs in the SPACE's container)
  - Another hosting platform (user-supplied VPS, server, etc.)
  - Locally (home server, NAS, local machine)
  - Multiple targets simultaneously — each installation is independent with no auto-sync between them

#### LIFE
- **Type:** Suite of independently installable apps, bundled together as a single container for convenience
- **Platforms:** Web, iOS, Android, macOS, Windows, Linux
- **Offline:** Full — all sub-apps designed local-first, sync on reconnect
- **Installation model:** Each sub-app can be installed and used on its own or as part of the LIFE bundle. LIFE is a convenience wrapper — it is not a dependency. Sub-apps communicate with each other through the DATA HUB event bus regardless of whether they are running inside LIFE or installed standalone.
- **Sub-apps (each independently installable):**
  - Journal (morning, nightly, event prompts, decision log)
  - Scheduler (day/week/month/year views, shared calendars, recurring events)
  - Lists (action lists: need-dos/should-dos/to-dos; collection lists: wish lists, gift ideas, albums, likes/dislikes, code snippets, custom; taggable; integrates with Scheduler and Journal)
  - Planner (goals, hobbies, work tasks, diet plans, financial plans)
  - Diet (meal logging, wellbeing ROI)
  - Financial (spending tracking, budget, financial intelligence)
  - Agreement (terms, obligations, tracking, fulfillment)
  - Research (thought organizer, research workspace)
  - Posthumous (estate management, posthumous content)

#### MESSENGER
- **Type:** Both — native standalone app + embedded in suite shell
- **Platforms:** iOS, Android, macOS, Windows, Linux (native); Web (embedded in suite)
- **Offline:** Partial — messages queued locally, delivered on reconnect. Call history available offline.
- **Standalone app** runs in the background for push notifications and background sync, independent of the suite shell being open

#### CONNECT
- **Type:** Standalone web app
- **Platforms:** Web, iOS, Android, macOS, Windows, Linux (via suite shell)
- **Offline:** No — discovery, search, and marketplace require live data
- **Contains:**
  - Global profile search and discovery
  - Algorithm marketplace
  - Data marketplace
  - Creator-advertiser marketplace
  - Advertising platform management
  - Music library — aggregates music hosted on user SPACEs (streaming from source SPACE)
  - Video library — aggregates video hosted on user SPACEs (streaming from source SPACE)
  - Post feed — unified social feed; posts and comments sourced from user SPACE Wall pages
- **Media hosting model:** CONNECT does not host media. All music, video, and post content lives on the uploading user's SPACE. CONNECT indexes, discovers, and surfaces it. Streaming and delivery happen directly from the source SPACE. Tier and privacy settings on the source SPACE govern what CONNECT can index.

#### BOARD
- **Type:** Two levels, connected
  - SPACE-level: page type within PROFILE (owned by the SPACE owner)
  - Network-level: standalone community platform accessible from the suite shell
- **Platforms:** Web, iOS, Android, macOS, Windows, Linux
- **Offline:** No — community content requires live data
- **SPACE-level boards** can optionally be surfaced in the network-level platform

#### CLOUD
- **Type:** Three access points
  - Web interface (browser-based file management)
  - Native sync client (background sync, local folder, all platforms)
  - Embedded in suite shell (quick access, upload, recent files)
- **Deployment model:** CLOUD is a self-hostable, deployable unit. Users install it via BUILDSPACE. Supported targets:
  - **nTogether-hosted** — managed by nTogether, paid add-on priced separately from tier membership. Backend storage for this tier is TBD.
  - **PROFILE site** — deployed into the user's SPACE container
  - **External hosting platform** — user-supplied server or VPS
  - **Local** — home server, NAS, or local machine
  - **Multiple targets** — a user can run CLOUD on several targets simultaneously; each instance is independent with no auto-sync between them
- **Pricing note:** nTogether-hosted CLOUD is billed independently of privacy tier. Any tier can purchase it; any tier can self-host instead.
- **Platforms:** Web, iOS, Android, macOS (sync client), Windows (sync client), Linux (sync client)
- **Offline:** Full for synced content — local copy always available; upload queue when reconnected

#### tokenTogether Wallet
- **Type:** Both — embedded in suite shell for everyday use + standalone native app for high-security operations (staking, large transfers, conversion)
- **Platforms:** iOS, Android, macOS, Windows, Linux, Web (embedded)
- **Offline:** Partial — balance and transaction history viewable offline; transactions require connection
- **Standalone app** provides additional security isolation from the browser for high-value operations

#### BROWSER
- **Phase 1 — Extension:** Chrome, Firefox, Safari
  - Password manager integration
  - Media archiving (yt-dlp style, saves to CLOUD)
  - Bookmarks with metadata tagging
  - Research capture (send to research organizer in LIFE)
- **Later phase — Full browser:** Standalone native browser (macOS, Windows, Linux)
  - All extension features built in natively
  - Deeper suite integration

#### DASH
- **Type:** Both
  - Suite home screen (the first thing users see when opening the suite)
  - PROFILE page (a personal dashboard visible on the user's public or private profile)
- **Platforms:** All (via suite shell and PROFILE)
- **Offline:** Partial — cached widget data available offline; live data requires connection

#### Password Manager
- **Type:** Component of the BROWSER extension (Phase 1). Also accessible from within the suite shell.
- **Platforms:** All browsers via extension; all platforms via suite shell
- **Offline:** Full — vault stored locally and encrypted; syncs to CLOUD backup

---

## Architecture Diagram

```
nTogether Suite
│
├── BACKEND SERVICES (online only)
│   ├── ENGINE — identity, auth, sessions, internal data transfer
│   └── DATA HUB — event bus consumer, intelligence engines, ANALYZER query interface
│
├── SUITE SHELL (native app + web — all platforms)
│   ├── App rail (sortable: manual / most-used / recent)
│   ├── Command palette (Cmd+K — global)
│   ├── DASH (home screen)
│   ├── LIFE (bundle — each app also installable standalone)
│   │   ├── Journal
│   │   ├── Scheduler
│   │   ├── Lists
│   │   ├── Planner
│   │   ├── Diet
│   │   ├── Financial
│   │   ├── Agreement
│   │   ├── Research
│   │   └── Posthumous
│   ├── MESSENGER (embedded)
│   ├── CONNECT
│   ├── BOARD (network-level)
│   ├── CLOUD (embedded)
│   ├── tokenTogether wallet (embedded)
│   ├── BUILDSPACE (launch point → opens standalone)
│   └── Password Manager
│
├── STANDALONE APPS (independently installed)
│   ├── MESSENGER native (iOS, Android, macOS, Windows, Linux)
│   ├── LIFE sub-apps — each installable independently, all communicate via DATA HUB event bus
│   │   ├── Journal
│   │   ├── Scheduler
│   │   ├── Lists
│   │   ├── Planner
│   │   ├── Diet
│   │   ├── Financial
│   │   ├── Agreement
│   │   ├── Research
│   │   └── Posthumous
│   ├── CLOUD sync client (macOS, Windows, Linux, iOS, Android)
│   ├── tokenTogether wallet native (all platforms — high-security ops)
│   └── BUILDSPACE (web, macOS, Windows, Linux)
│       ├── Site builder → deploys to PROFILE
│       └── CLOUD installer → deploys CLOUD to:
│           ├── nTogether-hosted (fee-based)
│           ├── PROFILE site container
│           ├── External hosting platform
│           └── Local (home server / NAS / machine)
│
├── BROWSER EXTENSION (Chrome, Firefox, Safari)
│   ├── Password manager
│   ├── Media archiver → CLOUD
│   ├── Bookmarks + metadata
│   └── Research capture → LIFE research organizer
│
└── PROFILE (hosted websites — each SPACE is its own site, per-SPACE container)
    ├── BUILDSPACE (deploys here)
    ├── CLOUD (optionally installed here via BUILDSPACE)
    ├── DASH page
    ├── BOARD page type (SPACE-level)
    ├── Profile pages (Wall, About, Contact, Media Gallery)
    ├── Communities (groups + channel spaces)
    └── Live streaming / audio rooms
```

---

## Offline Support

> ⚠️ **PINNED — decision deferred.** Offline support scope has not been finalized. A local-first architecture has significant infrastructure implications (local SQLite/IndexedDB, sync engine, conflict resolution) and must be scoped deliberately before committing. The table below reflects natural offline capability per app but should not be treated as a commitment until the offline strategy is formally decided.

| App / Function | Natural offline capability |
|---|---|
| LIFE (all sub-apps) | High — journal, scheduler, tasks, diet, financial have no inherent online requirement |
| Password manager | High — vault is inherently local |
| CLOUD (synced content) | High — sync client keeps local copy |
| BUILDSPACE | Medium — editing is local, deploying requires connection |
| MESSENGER | Medium — compose and queue offline, deliver on reconnect |
| tokenTogether wallet | Medium — view balance/history offline, transact requires connection |
| DASH | Medium — cached widget data offline, live data requires connection |
| Suite shell / app rail | Medium — navigation offline, live features require connection |
| PROFILE sites | Low — hosted sites require a live server |
| CONNECT | Low — discovery and marketplace require live data |
| BOARD | Low — community content requires live data |
| ENGINE / DATA HUB | N/A — backend services |

---

## Platform Matrix

| App | Web | iOS | Android | macOS | Windows | Linux |
|-----|-----|-----|---------|-------|---------|-------|
| Suite shell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PROFILE (viewing) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BUILDSPACE | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| LIFE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MESSENGER (native) | ✅ (embedded) | ✅ | ✅ | ✅ | ✅ | ✅ |
| CONNECT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BOARD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CLOUD (sync client) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tokenTogether wallet | ✅ (embedded) | ✅ | ✅ | ✅ | ✅ | ✅ |
| BROWSER extension | Chrome/Firefox/Safari | ❌ | ❌ | ✅ | ✅ | ✅ |
| Password manager | ✅ (extension) | ✅ | ✅ | ✅ | ✅ | ✅ |
| DASH | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
