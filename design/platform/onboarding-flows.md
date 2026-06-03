# nTogether — Onboarding Flows
Last updated: 2026-04-24

---

## Consumer Onboarding

### Key decisions
- Users create a free account first, then upgrade to a paid tier when ready
- No free trial — Free tier is the entry point
- SPACE setup is a skippable guided wizard — users can return and complete it later
- Domain: prompted to accept a free subdomain (username.ntogether.com) or connect a custom domain
- No users under 18 permitted

---

### Flow

```
1. DISCOVERY
   └── Landing page (ntogether.com)
         ├── Value proposition — privacy-first, user-owned data, suite of tools
         ├── Tier comparison (Free → Tier 5)
         └── "Get started" CTA

2. SIGN UP
   └── Email + password (no third-party auth — privacy by design)
         ├── Username / handle selection
         ├── Age confirmation (18+)
         └── Email verification

3. DOMAIN SELECTION  ← prompted immediately after email verification
   └── Two options presented side by side:
         ├── Free subdomain — username.ntogether.com (instant, one click)
         └── Connect your domain — enter domain, shown DNS records to configure
               └── Verification runs in background; SPACE activates when DNS propagates

4. SPACE SETUP WIZARD  ← skippable at any step
   └── Step 1: Pick a PURPOSE (multi-select — choose one or more)
         └── Personal / Business / Content/Influencer / Organization
   └── Step 2: Pick USEs within that PURPOSE (multi-select — choose one or more; uses outside selected purpose(s) also available)
         └── Narrows template suggestions
         └── Uses per purpose:
               Personal:
                 - Blog / journal
                 - Portfolio
                 - Resume / CV
                 - Professional networking
                 - Personal networking
                 - Hobby site
                 - Fan site
                 - Family site
                 - Other
               Business:
                 - Company website
                 - E-commerce / store
                 - Retail store
                 - Professional services (consulting, legal, accounting)
                 - Restaurant / food & beverage
                 - Real estate
                 - Agency
                 - Startup / SaaS
                 - Other
               Content/Influencer:
                 - Video creator
                 - Podcaster
                 - Streamer
                 - Writer / blogger
                 - Photographer
                 - Musician / band
                 - Newsletter
                 - Community builder
                 - Other
               Organization:
                 - Nonprofit
                 - Charity
                 - Church / faith community
                 - School / educational institution
                 - Club / association
                 - Political / advocacy
                 - Events-based
                 - Other
   └── Step 3: Choose a template (full template library always accessible regardless of use)
         └── Pre-built page layouts based on PURPOSE + USE; pages within templates also selectable individually
   └── Step 4: Pick a theme
         └── Visual style applied to the template
   └── Step 5: SPACE goes live
         └── Default pages created: Wall, About, Contact, Media Gallery
         └── "Your SPACE is live" confirmation with link

   ← At any step the user can skip → lands on DASH with a "finish your SPACE setup" nudge

5. SUITE SHELL  ← where the user lands after wizard (or skip)
   └── DASH home screen
         ├── Welcome card with setup progress (SPACE, profile, first app)
         ├── App rail — all apps visible, sorted by recommended for new users
         └── Tier upgrade prompt — visible but non-blocking
               └── Shows what unlocks at each tier
               └── "You're on Free — here's what you're missing"

6. TIER SELECTION  ← user-initiated, not forced
   └── Triggered by:
         ├── Clicking upgrade prompt on DASH
         ├── Hitting a tier-gated feature
         └── Navigating to account settings → billing
   └── Tier comparison shown
   └── Payment via privacy coin or fiat (in-app)
   └── Tier activates immediately
   └── If upgrading from Free/lower tier:
         └── Prompted: "Would you like to manage your previously collected data?"
               ├── Keep as-is (governed by creation tier)
               ├── Anonymize (flat fee — Phase 1-3 rate)
               └── Delete (flat fee — Phase 1-3 rate)
```

---

### Consumer Onboarding — Step by Step Summary

| Step | Description | Skippable |
|------|-------------|-----------|
| Sign up | Email + password, handle, age confirmation, email verify | No |
| Domain | Accept free subdomain or connect custom domain | No — must pick one |
| PURPOSE + template | Guided SPACE setup wizard | Yes |
| SPACE live | Default pages created | Automatic on domain selection |
| DASH | Suite home screen, app rail, upgrade nudge | — |
| Tier selection | User-initiated when ready | Yes — Free tier is permanent option |

---

## Self-Hosted Deployment

### Key decisions
- Always licensed — tiered per-user subscription (same pricing as hosted users)
- All self-hosted instances are always connected to the main nTogether network
- Two install paths: Docker Compose (technical) and web installer wizard (non-technical)
- Each user on the instance pays their own tier subscription directly to nTogether

---

### Licensing model
Self-hosted instances are not separately licensed at the instance level. Instead, every user account on a self-hosted instance pays the same per-user tier subscription as hosted users. The instance owner does not pay a blanket license — nTogether's revenue comes from the users, not the infrastructure operator.

Instance operators must register their instance with nTogether to:
- Connect to the main network
- Receive platform updates
- Validate user subscriptions

---

### Flow

```
1. DISCOVERY
   └── ntogether.com/self-host  or  github.com/ntogether
         ├── Requirements: server specs, OS, ports
         ├── License terms
         ├── Install options (Docker Compose / Web Installer)
         └── Instance registration explained

2. INSTANCE REGISTRATION  ← before install
   └── Create an operator account at ntogether.com
         ├── Operator is not a regular user account — it's an instance admin account
         ├── Register instance: provide intended domain, expected user count
         └── Receive instance credentials (instance ID + secret key)
               └── Used to authenticate the instance with the main nTogether network

3A. INSTALL PATH — Docker Compose (technical users)
   └── Clone repo or download release
   └── Copy .env.example → .env, fill in:
         ├── Instance ID + secret key (from registration)
         ├── Domain
         ├── Database credentials
         ├── SMTP for email
         └── Storage path (local or S3-compatible)
   └── Run: docker compose up -d
   └── All services start: ENGINE, DATA HUB, suite shell, PostgreSQL, Redis
   └── Navigate to domain → admin setup screen

3B. INSTALL PATH — Web Installer (non-technical users)
   └── Download installer script (single file, runs a local web server)
   └── Run: ./ntogether-install  (opens browser automatically)
   └── Web wizard walks through:
         ├── Step 1: Paste instance credentials (ID + secret key)
         ├── Step 2: Enter domain
         ├── Step 3: Database — use bundled PostgreSQL or connect external
         ├── Step 4: Storage — local disk or S3-compatible bucket
         ├── Step 5: Email — SMTP config for verification emails
         ├── Step 6: Review + install
         └── Step 7: Installation runs, progress shown
   └── On completion → opens admin setup screen in browser

4. ADMIN SETUP  ← same for both install paths
   └── Create first admin user account
         ├── This is a full nTogether user account with admin privileges
         ├── Admin picks their own tier (pays subscription like any user)
         └── Email + password + handle
   └── Instance settings:
         ├── Instance name and description (shown on network)
         ├── Open registration (anyone can sign up) or invite-only
         ├── User limits (optional cap on total users)
         └── Content policies (any local additions beyond platform baseline)
   └── Instance goes live — connected to main nTogether network

5. USER ONBOARDING ON SELF-HOSTED INSTANCE
   └── Identical to consumer onboarding flow above
         ├── Users sign up at the instance's domain
         ├── Email verification sent via the instance's SMTP
         ├── Tier selection and payment handled by nTogether directly
         │     └── Instance operator is not in the payment flow
         └── User's SPACE domain options:
               ├── Subdomain of the instance domain (username.instancedomain.com)
               └── Connect their own custom domain

6. UPDATES
   └── Instance receives update notifications from nTogether network
         ├── Docker Compose: docker compose pull && docker compose up -d
         └── Web installer: one-click update available in admin panel
```

---

### Self-Hosted — Step by Step Summary

| Step | Who | Description |
|------|-----|-------------|
| Register instance | Operator | Create operator account, register instance, receive credentials |
| Install | Operator | Docker Compose (one command) or web wizard |
| Admin setup | Operator | Create first admin user, configure instance settings |
| Go live | Automatic | Instance connects to main nTogether network |
| User sign-up | Users | Same as consumer onboarding, on the instance's domain |
| Payments | Users → nTogether | Users pay tier subscriptions directly to nTogether |
| Updates | Operator | Pull latest via Docker or one-click in admin panel |

---

## Existing Host Integration

For users who already have a website hosted elsewhere and want to bring nTogether in without abandoning their current setup. Four paths are supported — they can use one or combine them.

---

### Path 1 — Subdomain Deployment

The user's main site stays untouched at their existing host. Their nTogether SPACE runs on a subdomain they control (e.g. `space.theirsite.com`).

```
1. SIGN UP
   └── User creates nTogether account at ntogether.com
         └── Chooses "I have my own hosting" during domain step

2. SUBDOMAIN CONFIGURATION
   └── User enters their intended subdomain (e.g. space.theirsite.com)
   └── nTogether displays the DNS record to add:
         └── CNAME  space  →  hosted.ntogether.com
   └── User logs into their domain registrar or DNS provider
         └── Adds the CNAME record
   └── nTogether polls for DNS propagation (shows live status)
   └── Once detected:
         ├── SSL certificate auto-provisioned (Let's Encrypt)
         └── SPACE activates at the subdomain

3. BUILD + PUBLISH
   └── User opens BUILDSPACE
   └── Designs their SPACE (PURPOSE → template → theme → customize)
   └── Publishes — live at space.theirsite.com

4. EXISTING SITE RELATIONSHIP
   └── Main site at theirsite.com — untouched, still on existing host
   └── SPACE at space.theirsite.com — hosted and served by nTogether
   └── User can link between the two freely
   └── Optional: embed widgets from the SPACE back into the main site (see Path 2)
```

**What the existing host sees:** Nothing. DNS for the subdomain points away from their host. The main domain record is unchanged.

---

### Path 2 — Embed / Widget Script

A JavaScript snippet the user pastes into any existing page. Works on any platform that allows custom HTML — WordPress, Squarespace, Webflow, Wix, raw HTML.

```
1. SIGN UP
   └── Standard consumer onboarding (ntogether.com)
   └── User gets their SPACE set up (subdomain or custom domain)

2. GET EMBED CODE
   └── In suite shell → Settings → Integrations → Embed
   └── User selects which component to embed:
         ├── Profile card — avatar, handle, bio, follow button
         ├── Activity feed — recent posts from their SPACE
         ├── Live status — whether they're currently streaming or in an audio room
         ├── Wallet tip button — lets visitors send privacy coin tips
         ├── Marketplace widget — featured algorithms or data listings
         └── Custom block — any DASH block or SPACE block made embeddable
   └── User configures the widget:
         ├── Theme (light / dark / match site)
         ├── Size constraints
         └── Which content to include
   └── nTogether generates a <script> snippet:
         └── <script src="https://ntogether.com/embed.js"
                 data-space="username"
                 data-widget="profile-card"
                 data-theme="dark">
             </script>

3. PASTE INTO EXISTING SITE
   └── WordPress: paste into a Custom HTML block or theme template
   └── Squarespace / Webflow / Wix: paste into a Code Block element
   └── Raw HTML: paste directly into the page's <body>
   └── Widget renders inline — no iframe, no full-page redirect

4. BEHAVIOUR
   └── Widget loads asynchronously — does not block page load
   └── Content pulled live from the user's SPACE
   └── Interactions (follow, tip, etc.) open a lightweight nTogether modal
         └── Visitor does not leave the existing page
   └── Widget respects the visitor's tier visibility rules
         └── Tier 1 SPACE content shown only to connections, as configured
```

**Privacy note:** The embed script loads from nTogether's CDN. The existing site's visitors make a request to nTogether servers when the widget loads. This is disclosed in the embed settings and the platform's privacy policy.

---

### Path 3 — CMS Plugins

Deeper integration for users running a CMS. First-party plugins for WordPress and Ghost, with others to follow.

```
WORDPRESS PLUGIN

1. INSTALL
   └── Search "nTogether" in WordPress Plugin Directory → Install → Activate
         or: download from ntogether.com/integrations/wordpress → upload ZIP

2. CONNECT
   └── WordPress admin → nTogether → Connect Account
   └── Opens OAuth-style flow → user approves connection in nTogether suite
   └── Plugin receives an API key scoped to the user's SPACE

3. FEATURES UNLOCKED
   ├── Sync: publish a WordPress post → optionally cross-post to SPACE Wall
   ├── Sync: publish to SPACE → optionally cross-post to WordPress
   ├── Widgets: drag nTogether widgets into any widget area or block
   ├── Comments: replace WordPress comments with nTogether threaded comments
   ├── Login: visitors can log in with their nTogether account (no new password)
   ├── Tips: add a privacy coin tip button to any post or page
   └── Dashboard panel: see SPACE stats inside WordPress admin

4. CONTENT OWNERSHIP
   └── Content always originates on whichever platform the user publishes to first
   └── Cross-posting is a copy — both platforms hold a copy
   └── User controls which direction syncing runs (WP → SPACE, SPACE → WP, both, neither)

---

GHOST PLUGIN

1. INSTALL
   └── Ghost admin → Integrations → nTogether → Connect
   └── Same OAuth-style connection flow

2. FEATURES UNLOCKED
   ├── Sync: Ghost newsletter posts optionally published to SPACE
   ├── Privacy coin subscriptions: offer SPACE subscribers access to Ghost content
   ├── Tip button on Ghost posts
   └── SPACE activity widget in Ghost theme (via card)
```

---

### Integration Path Comparison

| Path | Technical skill needed | Existing site untouched | Full SPACE features | Setup time |
|------|----------------------|------------------------|---------------------|------------|
| Subdomain deployment | Low (DNS record) | ✅ Yes | ✅ Yes | Minutes–48hrs (DNS) |
| Embed / widget script | None (paste code) | ✅ Yes | Partial (widgets only) | Minutes |
| WordPress plugin | None (plugin install) | ✅ Yes | Partial + deep sync | Minutes |
| Ghost plugin | None (integration connect) | ✅ Yes | Partial + newsletter sync | Minutes |
| Self-host on their server | High (server admin) | ✅ Yes | ✅ Yes | Hours |

---

## Open Items

- Exact free subdomain format (username.ntogether.com vs. ntogether.com/username vs. other)
- Minimum server requirements for self-hosted instances
- Whether instance operators get any revenue share for hosting users
- Invite-only vs open registration default for new self-hosted instances
- What happens to a self-hosted instance's users if the operator shuts it down
