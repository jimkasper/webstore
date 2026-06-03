# CONNECT — Spec
Last updated: 2026-04-24

---

## Overview

CONNECT is the discovery and aggregation layer of nTogether. It surfaces content, people, data, and media from across all user SPACEs in one unified interface.

**CONNECT does not host anything.** All content — music, video, posts, data — lives on the individual user's SPACE. CONNECT indexes it, makes it searchable and discoverable, and provides the playback/viewing interface. Streaming and delivery happen directly from the source SPACE.

A user's tier and per-content privacy settings govern what CONNECT can index and show. Content set to private or selectively shared is never indexed by CONNECT.

---

## Components

### 1. Music Library

A unified music discovery and playback experience across all user SPACEs. Comparable in interface to Spotify.

**How it works:**
- Musicians and artists upload tracks and albums to their SPACE (via the site builder's Audio player block or a dedicated upload flow)
- CONNECT indexes publicly available audio from all SPACEs
- Users browse, search, and play music through the CONNECT music library interface
- Playback streams directly from the artist's SPACE — CONNECT provides the player UI only
- Artists retain full control: unpublishing from their SPACE immediately removes it from CONNECT

**Features:**
- Browse by genre, artist, album, playlist
- User-curated playlists (stored in the user's DATA HUB)
- Artist profile pages (pulled from the artist's SPACE)
- Play counts and listener stats visible to the artist via their DATA HUB
- Liked tracks and albums saved to user's Lists app
- Offline playback: cached tracks available when offline; streaming requires connection

**Monetization:**
- Artists can gate tracks behind coin payment, subscription, or keep them free
- Advertising-supported free tier (Tier 5 users see ads; higher tiers ad-free)
- Revenue split TBD

---

### 2. Video Library

A unified video discovery and viewing experience across all user SPACEs. Comparable in interface to YouTube.

**How it works:**
- Creators upload videos to their SPACE (via the site builder's Video embed block or a dedicated upload flow)
- CONNECT indexes publicly available video from all SPACEs
- Users browse, search, and watch through the CONNECT video library interface
- Video streams directly from the creator's SPACE — CONNECT provides the player and interface only
- Creators retain full control: removing from their SPACE removes it from CONNECT immediately

**Features:**
- Browse by category, creator, topic, tag
- Subscriptions to creators (follow a creator's SPACE)
- Comments (linked to the post feed — see below)
- Watch history and saved videos stored in user's DATA HUB
- Creator analytics (views, watch time, engagement) surfaced in creator's DATA HUB
- Recommended feed based on watch history (algorithm configurable by user)
- Offline: downloaded videos available offline; streaming requires connection

**Monetization:**
- Creators can gate videos behind coin payment, membership, or keep them free
- Advertising-supported for Tier 5 viewers; higher tiers ad-free
- Revenue split TBD

---

### 3. Post Feed

A unified social post feed aggregated from user SPACE Wall pages. Comparable in experience to Twitter / Instagram.

**How it works:**
- Users post to their SPACE Wall (text, images, video, links, audio)
- CONNECT aggregates public Wall posts from all SPACEs into a unified discoverable feed
- Posts live on the user's SPACE — CONNECT surfaces them, it does not own them
- Deleting a post from the SPACE removes it from the CONNECT feed

**Features:**
- Global feed — all public posts from all SPACEs, ranked by algorithm or chronological
- Following feed — posts only from SPACEs the user follows
- Post types: text, image, video (streamed from SPACE), audio, link preview, quote post
- Comments — threaded, stored on the source SPACE; surfaced in CONNECT
- Reactions (likes, etc.) — stored in user DATA HUB, aggregated count shown
- Tagging other users and SPACEs
- Hashtag / topic discovery
- Repost / share — with or without added commentary
- Bookmarks saved to user's DATA HUB
- Algorithm is user-configurable (can swap or purchase algorithms from the Algorithm marketplace)

**Privacy:**
- Posts inherit the privacy setting set on the user's SPACE Wall
- A post set to "selectively shared" on the SPACE does not appear in the CONNECT public feed
- A post set to "fully public" is indexable by CONNECT and discoverable by anyone

---

### 4. Podcast Feed

A unified podcast discovery and listening experience across all user SPACEs. Comparable in interface to Spotify Podcasts / Apple Podcasts.

**How it works:**
- Podcasters upload episodes to their SPACE (via the site builder's Episode list block or a dedicated upload flow)
- CONNECT indexes publicly available podcast episodes from all SPACEs
- Users browse, search, and listen through the CONNECT podcast interface
- Audio streams directly from the podcaster's SPACE — CONNECT provides the player and interface only
- Removing an episode from the SPACE removes it from CONNECT immediately

**Features:**
- Browse by category, host, show, topic, tag
- Subscribe to shows (follow a podcaster's SPACE)
- Episode queue and listening history stored in user's DATA HUB
- Show and episode pages (pulled from the podcaster's SPACE)
- Chapters and show notes (if provided by the podcaster)
- Speed control, sleep timer, bookmark within episode
- New episode notifications for subscribed shows
- RSS feed generation per show — allows external podcast apps to subscribe
- Offline: downloaded episodes available offline; streaming requires connection

**Monetization:**
- Podcasters can gate episodes or shows behind coin payment, membership, or keep them free
- Advertising-supported for Tier 5 listeners; higher tiers ad-free
- Revenue split TBD

---

### 5. Global Profile Search and Discovery

Search for users, SPACEs, content, repos, and communities across the platform.

---

### 6. Algorithm Marketplace

Users can browse, purchase, and install feed algorithms that control how their CONNECT feeds (music, video, posts) are ranked and filtered. Algorithms are sandboxed and run client-side or in the user's SPACE container.

**Who can publish:** Any user. There is no developer-only gate. A user who trains or writes an algorithm on their own data can publish it to the marketplace. Published algorithms are reviewed for sandboxing compliance and malicious behavior before going live, but authorship is open to all.

**Publishing flow:** Author submits algorithm → automated sandbox compliance check → manual review queue → approved/rejected → live in marketplace. Author sets price (free or coin amount). Revenue split: author receives 80%, platform takes 20%.

---

### 7. Data Marketplace

Users on Tier 5 (or who have opted in to specific data sharing) can make their DATA HUB data available for purchase. Buyers (researchers, advertisers, developers) can purchase access through CONNECT. Revenue is paid to the user in coin.

---

### 8. Creator-Advertiser Marketplace

Connects creators (music, video, post) with advertisers for direct sponsorship deals. Managed through CONNECT; payments in coin.

---

### 9. Advertising Platform

Advertisers manage campaigns targeting CONNECT users. Ad delivery is governed by user tier:
- Tier 5: ads shown across music, video, post feed
- Tier 4: reduced ad surface (TBD)
- Tier 1–3: no ads

---

## Shared Architecture — Media Hosting Model

```
User SPACE (source of truth)
  └── Audio / video / posts / images uploaded and stored here
        └── CONNECT indexes publicly available content
              └── CONNECT provides UI for discovery, browsing, playback
                    └── Streaming/delivery served directly from source SPACE
```

This means:
- **No media duplication** — content is not copied to a CONNECT-owned CDN
- **Creator control is absolute** — remove from your SPACE, it's gone from CONNECT
- **Tier governs indexability** — Tier 1 SPACE content is zero-knowledge; CONNECT cannot index it even if the post is technically public-facing
- **SPACE bandwidth** — creator SPACEs serve their own media; at scale this may require CDN integration per SPACE (TBD)

---

## Open Items

- CDN strategy for high-traffic SPACEs serving media at scale
- Revenue split percentages for music and video monetization
- Comment storage model — stored on source SPACE or mirrored to CONNECT index
- Whether reactions/likes are visible across tiers
- Offline download model for music and video (DRM, caching scope)
- Advertising surface for Tier 4 (full, reduced, or none)
