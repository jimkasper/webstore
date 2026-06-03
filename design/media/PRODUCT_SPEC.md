# Branching Media Player — Product Spec
> Living document. Generated from design session. Drop into `CLAUDE.md` or a Project for use in code sessions.

---

## What this is

A media player built around a **multi-dimensional tagging and branching system**. Content is not a fixed timeline — it is a mesh of tagged, versioned, interconnected nodes. The player is one window into that graph.

The core innovation: **sections of media can overlap non-linearly**, tagged across multiple dimensions simultaneously (tone, topic, speaker, story arc, viewer response data, anything). Viewers can filter, isolate, and navigate content by tag rather than just scrubbing a timeline.

Designed initially for a **comedy special use case** (the creator is a comedian), but built to serve podcasters, musicians, comic artists, and film/TV.

---

## The data model in plain terms

- A **piece of media** (video, audio, comic, etc.) is a container.
- That container has a **timeline**, but sections on the timeline are not chapters — they are **tagged nodes**.
- A single timestamp range can belong to multiple nodes simultaneously (e.g. the same 2-minute segment is tagged: `tone:dark`, `story:airport`, `format:crowd-work`, `response:highest-rated`).
- Nodes can be **linked across episodes** — the same story told differently in three specials can be chained as a retelling sequence.
- The player resolves which node to play based on the viewer's **preset preference profile**.

---

## Content types and their branching model

### Stand-up / live performance
- Multiple recorded sets layered into one **extended superset**.
- Viewers navigate rabbit holes: different jokes, different tellings, taglines, crowd kills vs bombs.
- **Animated bits** can be injected at tagged moments.
- **Preset modes** (dark, psychedelic, crowd work, etc.) govern which branches play by default.
- **Rated takes**: viewers rate individual takes. Ratings feed into viewer-response presets (highest rated, most controversial, most commented, lowest rated, average).
- **Filming approach**: hybrid of professional multi-camera + guerrilla audience cameras (select audience members given cameras/headsets, à la Beastie Boys: *I Fucking Shot That*). Enables seamless POV shifts between takes and unified themes across sets.
- **Retelling chains**: the same story told across multiple specials can be linked. Viewers can jump between versions and compare how the bit evolved.
- **Evolution archive** (merged from comics): creators can tag rough drafts, workshop versions, and early takes of a bit alongside the finished version. The creative process becomes navigable content — not just the final product.

### Film & TV
- Each viewer choice **alters future decision points** — not a static fork, but a living narrative with persistent state.
- Story remembers accumulated decisions, not just the last one.

### Music — two distinct modes

**Version branching** (same as stand-up/narrative model):
- Swap solos, alternate lyrics, different mixes or versions of a track.
- Creator curates and assembles versions. Viewer picks between them via preset or direct selection.
- A song is a set of creative decisions the listener can participate in.

**Concert / parallel stream mode** (distinct player mode — see full section below):
- Multiple camera feeds of the same live performance run simultaneously, frame-accurate synced.
- Viewer switches freely between feeds at any point during playback.
- Each feed is independently rewindable — viewer can go back to see what another camera caught at any moment.
- This is not a branch system. It is a live POV switcher with full seek capability across all feeds.

### Graphic
- Dedicated format for **comic books, graphic novels, and sequential visual art**.
- Works like Film / TV: branching narrative, choice memory, persistent reader state across decisions.
- Each reader choice alters future panels and story paths — not a static page-turn, a living narrative.
- Supports: panel-level branching, alternate endings, parallel story threads, reader-state-dependent dialogue.
- **Evolution archive** carries over: creators can expose drafts, pencils, inks, and colour passes as navigable layers alongside the finished work.
- Key distinction from Film / TV: the unit of content is a **panel**, not a scene. Pacing is reader-controlled, not time-based. The player UI is fundamentally different — no timeline, no playback cursor.

#### Graphic player — reading modes
Creator sets the mode per title. All three must be supported:

| Mode | Behaviour | Best for |
|---|---|---|
| Panel by panel | One panel fills the screen, tap to advance | Manga, cinematic single-panel stories |
| Scrolling | Continuous vertical scroll | Webtoons, long-form vertical comics |
| Page view | Full page visible at once | Traditional comic book pages |

#### Graphic player — choice overlays
- Choices appear **on the panel itself**, overlaid directly on the art.
- Visual form of the choice is **creator-decided per branch point**. Options include: tap zones (invisible hotspots), illustrated choice buttons (styled to match the art), speech bubble style (choices as dialogue options).
- This allows a horror title to use silent invisible tap zones while a children's title uses large illustrated buttons — same system, different expression.

#### Graphic player — reader controls
- **Pinch to zoom** available in all three reading modes. Reader can inspect detail on dense art regardless of mode.
- Creator controls default framing and panel focus — zoom is a reader override, not the primary navigation.

#### Graphic panel editor — creator side

**Art input:** Upload pre-made image files per panel or per page. No in-tool drawing. Editor is a publishing and branching tool, not an art tool.

**Page layout:**
- Creator starts with a layout template (full page, 2-row, 2-col, banner+2, 4-panel, 6-panel).
- After selecting a template, panels can be freely repositioned and resized.
- Pages managed via a left-side strip showing thumbnail previews. Branch point pages marked with a dot.

**Panel properties (per panel):**
- Reading mode (panel-by-panel / scrolling / page view)
- Panel order
- Span full width toggle
- Evolution layers (per panel — e.g. final ink published, pencil sketch hidden)

**Choice overlay (per panel):**
- Style: illustrated buttons / speech bubble / tap zones — set per branch point
- Trigger: on panel enter / after delay / on reader tap
- In page view behaviour: fires on the panel itself, or takes over full screen — creator decides per panel
- Choice zone placed visually on the panel by clicking and dragging, refined in properties

**Branches (per panel):**
- Each branch has a label (the choice text) and a destination page
- Multiple branches per panel supported
- Add/remove branches inline in the properties panel

**Evolution layers (per panel):**
- Upload multiple versions of the same panel (final ink, pencil, rough, colour flats, etc.)
- Each layer toggled visible/hidden independently
- Published layer is what readers see by default; hidden layers available via evolution archive mode

---

## The tagging system

### Tag dimensions (creator-defined, fully customisable)
Creators define their own tag schema. Suggested defaults:

| Dimension | Example values |
|---|---|
| Tone | dark, psychedelic, strange, wholesome |
| Format | crowd work, heckler, animated, taglines only |
| Story | airport story, the divorce bit, opening five |
| Speaker | host, guest name, character name |
| Viewer response | highest rated, lowest rated, most controversial, most commented, average |
| Custom | anything the creator defines |

### Key properties
- Tags are **non-exclusive** — a segment can carry tags from multiple dimensions.
- Tags can be **public** (viewer-facing navigation) or **private** (creator production notes). Both live in the same system.
- Tag schemas can be saved as **templates** and reused across uploads.
- The tag editor uses a **multi-lane timeline** — each dimension gets its own lane, like a DAW track view.

### Cross-episode capabilities
- **Retelling chains**: link the same story across episodes. Viewers can jump between versions.
- **Cross-episode compilations**: auto-generate a playlist of every segment carrying a given tag across the entire back catalogue.
- **Tag browse feed**: viewers can follow a tag like a thread — subscribe to `story:airport` and see every version across every special.

---

## The preset preference engine

The preset system is a **viewer-side preference profile** that governs playback session-wide. It is not a one-time pick — it is a ranked ruleset.

### Structure
- Presets are organised into **categories** (e.g. Tone, Viewer Response, Format, Custom).
- Each category **drops down** into selectable options.
- Both categories and options are **fully customisable** by the creator.
- Viewers can also **add their own custom options** within creator-defined categories, or suggest new categories to the creator.

### Fallback order
- Viewers **rank their selected options** by drag-to-reorder.
- When a viewer's top preference is not available for a chapter, the player **silently falls back** to the next option in their ranked list.
- **No notification is shown** when a fallback occurs. The experience flows seamlessly.
- The only passive indicator: the **preset pill in the player controls bar quietly updates** to reflect the currently active preset. It is visible if the viewer looks, invisible if they don't. No toast, no alert, no interruption.

### Preset pill behaviour
- Lives in the player controls bar at all times.
- Displays the name of the currently active preset (e.g. `dark`, `strange`, `highest rated`).
- Updates silently mid-watch when a fallback occurs.
- Does not animate or draw attention to itself on change.

### Saved profiles
- Viewers can save a full preset configuration as a named profile.
- Profiles persist across titles and sessions.

---

## Commentary tracks

Creators can record commentary that injects itself at tagged points during playback.

### Per-injection-point settings (creator-controlled, viewer-adjustable)

| Setting | Options |
|---|---|
| Format | Audio / Text overlay / Both |
| Playback behaviour | Pause media / Overlay (keep playing) |
| After commentary ends | Resume automatically / Wait for viewer to resume |

### Override hierarchy
Three layers, each overridable by the one below:
1. **Creator default** — applies session-wide.
2. **Viewer session preference** — viewer can override creator default in their playback settings.
3. **Per injection point** — creator can override both for specific commentary moments.

### UX notes
- Commentary appears as a clearly attributed overlay (avatar, name, "commentary" badge).
- Audio commentary pauses the main media by default (unless creator sets overlay mode).
- Text commentary overlays on-screen without pausing unless creator specifies pause.

---

## Podcast link popups

- Creators can place **titled hyperlink popups** at specific timestamps.
- Popup appears on-screen at the tagged moment with: title, URL preview, and action buttons (open / comment / save).
- Links open in the viewer's browser.
- **Links are commentable** — each link has its own comment thread, scoped to that link across every episode it appears in.
- Link comments are a persistent knowledge layer — fact-checks, context, corrections live alongside the link permanently.

---

## Comment scoping model

Comments exist at four scopes, unified in one panel with tab navigation:

| Scope | Behaviour | Analogous to |
|---|---|---|
| Episode | Top-level discussion of the whole piece | YouTube |
| Timestamp | Comment anchored to a specific moment | SoundCloud |
| Tag | Comment scoped to a named tag (e.g. `story:airport`) — stays together across all versions | Subreddit topic |
| Link | Comment scoped to a specific hyperlink popup | Unique to this platform |

### Tag-scoped comments
- A comment on `tag:airport story` appears in that tag's thread regardless of which episode or retelling it was left from.
- Viewers can "jump to tag" from a comment to navigate directly to the relevant segment.
- This is the primary differentiator from YouTube and SoundCloud comment models.

---

## Viewer navigation features

- **Story map**: optional view showing paths taken and untaken. Invites replay without spoiling.
- **Branch bookmarks**: save any decision point to revisit later.
- **Replay from choice**: one tap to jump back to any decision point and choose differently — no full rewatch.
- **Choice comparison**: after finishing, see what % of viewers made the same choices (shown post-watch, never during).
- **Choice history**: personal log of paths taken across all titles.
- **Spoiler-safe sharing**: share a moment or ending without revealing the path that led there. Branch-aware link previews.
- **Tag filter mode**: viewer selects a tag and the player skips everything outside it.
- **Isolation mode**: watch only segments carrying a specific tag — your own custom cut.
- **Tag-aware shuffle**: shuffle within a tag (e.g. random `crowd work` segments), not random full episodes.
- **Cross-episode tag compilations**: auto-generated playlists of a tag across the full catalogue.

---

## Creator tools

- **Visual branch editor**: node-based canvas to connect scenes, episodes, or panels. Full story map visible at once.
- **Choice prompt builder**: design decision moments — timed overlays, subtle prompts, or hard gates.
- **Conditional logic**: branch based on prior choices, watch history, or viewer profile — not just a single decision point.
- **Path analytics**: which branches viewers take, where they abandon, which endings get replayed.
- **Reusable segments**: shared scenes that appear across multiple branches without duplicating the asset.
- **Playtest mode**: walk every path before publishing. Catch dead ends, broken jumps, missing transitions.
- **Multi-lane tag timeline**: DAW-style editor with one lane per tag dimension.
- **Public/private tag toggle**: viewer-facing tags and internal production notes coexist in one system.
- **Tag schema templates**: save and reuse a tagging structure across uploads.
- **Brand customisation**: custom colour themes, logo placement, shareable creator profile pages.
- **Engagement analytics**: heatmaps of viewer drop-off, replay, and tag exploration patterns.
- **Complexity indicator**: surface a branch depth/complexity score in the editor to prevent creators from overbuilding.

---

## First-viewer experience

The platform onboards through the content itself — no tutorial walls, no explainer overlays.

### Landing screen (first visit)
- Full poster/cover image fills the screen — creator-supplied art, title, creator name, brief description.
- **Preset selector** sits over the poster art before play. Categories drop down into options. Viewer picks their preferences before committing to play.
- Play meta line below the play button quietly summarises the current preset state: "watching: dark · no format set · no response filter." Updates live as selections are made.
- Play button drops straight into content — no additional gate.
- No first-time-only onboarding signal. The preset selector over the poster art is the entire onboarding. The category labels (tone: dark, format, viewer response) are self-explanatory.

### Content preference system — three states

Content type settings are **preferences that shape the default experience**, not final decisions. The viewer is still prompted at branch points when needed.

Each content type (crowd work, hecklers, animated bits, dark retelling, etc.) has three states:

| State | Behaviour |
|---|---|
| **Default** | No preference. Content type plays naturally in the flow — included if present, not sought out. |
| **Prioritize** | Viewer wants more of this. When a version with this type is available, it's served first. Multiple prioritized types are ranked against each other by drag-to-reorder. |
| **Skip** | Hard exclude. Segments tagged with this type are never played. If skipping would break narrative flow and no alternative exists, falls back to default silently. |

### Resolution logic

| Situation | Outcome |
|---|---|
| Skip set + alternative exists | Skip silently, play alternative |
| Skip set + no alternative | Fall back to default, play the segment |
| One prioritized type available | Resolve automatically, no prompt |
| Two prioritized types conflict | Prompt the viewer to choose in the moment |
| Default on all | Natural flow, no intervention |

### Conflict prompt
Appears only when two prioritized types are both available for the same segment and neither clearly outranks the other. Shows the available options with type tags and duration. Always includes "default version" as a third escape option. Choosing updates the priority order for this show — soft learning without requiring the viewer to return to settings.

### Priority ranking
Prioritized items are ranked by drag-to-reorder. Higher rank = resolved automatically when multiple prioritized types are available. Conflict prompt only fires when two top-ranked items genuinely tie.

### Controls bar pill states (playing)
- Prioritized content: purple pill with `↑` indicator
- Skipped content: struck-through red pill
- Standard on: white pill
- These are live — viewer can tap any pill to change state mid-watch without opening settings.

### First branch moment
- No tutorial. The comedian addresses the choice in the video — UI and performance are unified.
- Branch prompt copy is written by the creator. Feels like part of the bit, not a platform interruption.
- Choices appear as minimal overlaid buttons at the bottom of the frame.

### Returning viewer
- Brief resume screen: progress bar showing how far through, "start over" and "continue" buttons.
- "Start over" returns to the landing screen — resets preset selector.
- "Continue" drops straight back into content at the last position with the same preset active.

---

## Player modes — two distinct architectures

The player has two fundamentally different operating modes. They share a UI shell but have different data models and infrastructure requirements.

### Mode 1 — take resolution (stand-up, film/TV, narrative)
- Creator assembles raw footage into discrete **takes** in post.
- Takes are tagged and become nodes in the content graph.
- At playback, the preset engine resolves which take to serve per segment.
- Viewer sees one assembled, curated version at a time.
- Viewer never touches raw feeds — that's the creator's layer.
- Guerrilla / audience camera footage is a **production input**, not a viewer feature. It gets cut into takes during assembly.
- Sync requirement: timecode alignment done once in post during upload/assembly. Suggest audio waveform sync as the ingest mechanism (clap/slate as fallback).

### Mode 2 — parallel stream switching (concert / live music)
- Multiple camera feeds of the same performance are uploaded and synced to a **shared timecode**.
- All feeds buffer simultaneously in the background during playback.
- Viewer has a **camera switcher UI** — can switch between any feed at any point.
- Switching behaviour: **viewer-chosen per session** (hard cut or crossfade).
- Each feed maintains an **independent playback cursor** — viewer can rewind any feed to see what that camera caught at a moment they've already passed.
- Seeking one feed does not move the others — each is independently rewindable while staying timecode-linked when playing forward.
- Sync requirement: **frame-accurate real-time sync** across N feeds. Harder infrastructure problem than Mode 1. Requires all feeds to buffer in parallel, not just the active one. Separate engineering track.

### Key distinction
| | Mode 1 | Mode 2 |
|---|---|---|
| Camera footage | Production input, assembled by creator | Viewer-facing feature |
| Viewer control | Picks a curated take | Switches raw feeds live |
| Sync | Post-production, one-time | Real-time, frame-accurate |
| Rewind | Single active feed | Each feed independently |
| Preset engine | Yes — governs take selection | No — viewer switches manually |

---

## Filming → branch data model (stand-up / Mode 1)

Two stages, clearly separated:

**Stage 1 — post production (creator's edit suite)**
1. Pro multi-cam footage (3–5 locked angles) ingested.
2. Guerrilla / audience cam footage ingested and synced (audio waveform sync recommended).
3. Creator assembles footage into discrete **takes** in the branch editor — cutting, syncing, trimming across sources.
4. Each assembled take becomes a named, tagged node (e.g. Take A: clean pro cut / Take B: audience POV / Take C: dark retelling).

**Stage 2 — the player (viewer's session)**
1. Takes are nodes in the content graph, each carrying their tag set.
2. Viewer's preset engine resolves which take to serve per segment at runtime.
3. Preset pill in controls bar silently reflects the active take.
4. Viewer never sees the assembly layer — only the resolved playback.

---

## Open design questions

**Resolved:**
- [x] Multi-camera footage in stand-up → assembled by creator into takes (Mode 1). Guerrilla cams are a production input, not a viewer feature.
- [x] Concert / live music → parallel stream switching (Mode 2). Viewer switches raw feeds directly.
- [x] Camera switch feel in concert mode → viewer-chosen per session (hard cut or crossfade).
- [x] Independent rewind in concert mode → yes, each feed has its own seek cursor.
- [x] Fallback notification when preset silently changes → no notification. Preset pill updates passively.

**Resolved (continued):**
- [x] Rewind catch-up behaviour — seamless. No state change when rewound playhead reaches the current position. Rewound and live are the same state for recorded concerts. If live streaming is added later, revisit.

**Still open:**
- [ ] What does the tag timeline editor look like at scale — e.g. a special with 50+ tagged segments across 8 dimensions?
- [ ] How do viewer-suggested preset categories surface to creators? Notification, dashboard, or aggregate threshold?
- [ ] For animated bits — what formats are supported? CSS animation, video overlay, frame-by-frame?
- [ ] For film/TV: how is persistent choice state stored — per viewer account, per device, or both?
- [ ] Should viewers be able to share their full preset profile with others?
- [ ] Should the creator see in analytics which preset profile configurations viewers are using most?
- [x] Graphic: in page view, choice overlay fires on the panel or full screen → creator decides per panel. Both supported.
- [ ] Concert mode: does the camera switcher UI show live thumbnails of each feed, or just labelled buttons?
- [ ] Concert mode: can the creator label/name each camera feed (e.g. "stage left", "crowd", "drummer cam")?
- [ ] Ingest: is audio waveform sync the chosen method for multi-cam alignment, or is a different approach planned?

**Smart cut snap types (confirmed):** downbeat, bar, phrase, chorus, verse, silence, chapter.

---

## Concert ingest flow

Four steps, in order:

### Step 1 — feeds
- Creator uploads all camera feeds. Each feed is named inline (editable at any time).
- Duration mismatch flagged automatically — feeds should cover the same performance.
- No cap enforced in spec yet — recommended 4–6 feeds for infrastructure reasons (see open questions).

### Step 2 — sync
Three sync methods, creator chooses:
- **Audio waveform** (default) — detects shared transients across all feeds, aligns automatically. Best when all cameras captured the same loud moment early in the recording.
- **Clap/slate** — creator marks a visible or audible sync point per feed after upload.
- **Manual offset** — frame-level offset per feed relative to a reference. Fallback when automatic methods fail.

### Step 3 — analyse
Two tiers of boundary detection:

| Tier | Boundaries | Method |
|---|---|---|
| Auto-detect | downbeat, bar, phrase, silence, transient | Audio analysis on upload |
| Creator-tagged | chorus, verse, chapter, bridge, intro, outro | Manual in step 4 |

Creator selects which auto-detect types to run. Creator-tagged types always require step 4 input.

### Step 4 — boundary editor
- Waveform display with all detected and creator-tagged boundaries overlaid.
- Click waveform to drop a new chapter marker at any position.
- Auto-detected boundaries show confidence score. Creator can confirm (promotes to confirmed tier) or delete.
- Three visual tiers: auto (teal) / confirmed (purple) / chapter (amber).
- Boundary names are editable inline.

### Publish settings

**Boundaries:**
- **Auto-publish without review** toggle — on by default. When on, boundaries above the confidence floor go live on publish. Below the floor, excluded until reviewed.
- **Confidence floor** slider (50–99%, default 80%) — only active when auto-publish is on. Adjusts how many auto-detected boundaries go live immediately.
- **Chapter markers always require review** — on by default regardless of confidence floor. Mislabelled chapters are the most visible failure mode.
- **Show boundary type to viewer on smart cut** — off by default. When on, briefly surfaces the snap type (e.g. "downbeat") when a cut fires.

**Feeds:**
- **Default camera on load** — which feed viewers land on first.
- **Default switch mode** — smart or cut. Viewers can always override in session settings.

**Post-publish:**
- Pending (below-floor) boundaries don't affect playback. Viewers get smart cut on confirmed boundaries immediately.
- Creator can review and confirm pending boundaries at any time after publishing — smart cut improves without re-publishing.

---

## Key design principles

1. **Content has versions, not just timestamps.** Media is a living creative document — takes, branches, evolutions, and moods coexist.
2. **The audience is a creative participant.** Rating takes, choosing paths, toggling presets — the viewer is in a creative relationship with the material.
3. **Process is as valuable as product.** The evolution archive, the bomb vs kill toggle, the rough early take — creative process is visible and navigable.
4. **It is not a player. It is a creative graph with a playback interface.** The underlying structure is a mesh of tagged, versioned, interconnected content nodes. The player is one window into that graph.
5. **Silent fallbacks keep immersion intact.** The system works without drawing attention to itself. Passive indicators only — never interruptions.
6. **The content does the onboarding.** No tutorial walls. The first branch prompt, the first preset bar, the first commentary injection — these teach by doing.
