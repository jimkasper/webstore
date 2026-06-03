# Repository Install — Feature Spec
Last updated: 2026-04-24

---

## Overview

nTogether is a native Git host. Every user gets a personal repository namespace backed by their DATA HUB cloud storage. Repositories can be created directly on nTogether or imported/mirrored from external hosts (GitHub, GitLab, etc.).

Repos can also be added to a user's profile, making them discoverable and installable by other users.

---

## Self-Hosted Repository (Primary Model)

### Namespace
Each user gets a personal Git namespace:
```
https://ntogether.com/<username>/<repo>       # HTTPS
git@ntogether.com:<username>/<repo>.git       # SSH
```

### Access protocols
- **HTTPS** — clone, push, pull via standard HTTPS with token or password auth
- **SSH** — clone, push, pull via SSH key auth

### Storage
Repositories are stored in the user's DATA HUB cloud. The user's tier governs what the platform can see:
- Tier 1: zero-knowledge — platform cannot read repo contents
- Tier 2–4: governed by respective data access rules (see `tier-definitions.md`)
- Tier 5: full platform visibility and indexing

### Supported repository types
| Type | Description |
|------|-------------|
| Code | Any language, any project |
| Data | Datasets, data packages, structured feeds |
| App / plugin | Installable extensions for nTogether |

---

## External Import / Mirror (Secondary)

Users can import or mirror repositories from external Git hosts.

- **Import**: One-time copy — creates a self-hosted repo on nTogether from an upstream source.
- **Mirror**: Ongoing sync — the nTogether repo stays up to date with the upstream source on a configurable schedule (manual, daily, on push via webhook, etc.).

Supported sources: GitHub, GitLab, Bitbucket, any public Git URL.

After import or mirror setup, the repo lives in the user's nTogether namespace and behaves identically to a natively created repo.

---

## Profile Integration

### Adding a repo to your profile
Any self-hosted repo (or imported/mirrored repo) can be added to the user's profile.

- Appears as a portfolio/showcase item with: name, description, type, source, install count.
- Visibility follows per-interaction privacy controls (private / selectively shared / fully public).

### Installing from another user's profile
Other users can install any public profile repo in one click:
- Prompts the installing user to choose: cloud only, profile only, or both.
- Creates a fork in the installing user's nTogether namespace.
- Profile owner's install count increments.

---

## Install Flows

### Create a new repo on nTogether
1. User creates a repo — sets name, type, visibility.
2. Push via HTTPS or SSH to the provided remote URL.
3. Repo is live in the user's DATA HUB. Optionally add to profile.

### Import from external source
1. User provides an upstream URL.
2. Choose: one-time import or ongoing mirror.
3. Repo is created in the user's nTogether namespace.
4. Optionally add to profile.

### Install from another user's profile
1. User finds a repo on someone's profile.
2. Clicks "Install" — prompted for destination (cloud, profile, or both).
3. Fork created in the installing user's namespace.
4. Source of fork is the profile owner's nTogether-hosted copy (not the upstream).

---

## Privacy and Tier Interaction

- Repo storage is governed by the owner's tier (platform visibility of contents).
- When another user forks a repo, their fork is governed by their own tier — independent of the original owner's tier.
- A public profile repo from a Tier 1 user is visible to others, but the platform cannot track that the Tier 1 user owns it beyond what's structurally required to serve the content.
- Per-interaction privacy controls apply to profile-listed repos. A repo set to "private" is stored in the user's cloud but not visible on their profile.

---

## Open Items

- Authentication for HTTPS (token-based, OAuth, password — to be decided)
- SSH key management UI
- Storage quotas per tier (does Tier 1 get more storage since they pay more?)
- Whether app/plugin repos have an execution/activation model beyond storage
- Monetization: can users charge for installs via CONNECT?
- Whether install/fork counts are visible across all tiers or tier-gated
- Mirror conflict handling and sync failure notifications
