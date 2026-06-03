import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

// ── Constants ──────────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'default',  label: 'Default',  desc: 'Lime accent · dark',      accent: '#84cc16', bg: '#0f172a', surface: '#1e293b' },
  { id: 'midnight', label: 'Midnight', desc: 'Indigo · deep navy',       accent: '#6366f1', bg: '#0f0f1a', surface: '#1a1a2e' },
  { id: 'sage',     label: 'Sage',     desc: 'Green · forest',           accent: '#4ade80', bg: '#0d1f14', surface: '#122016' },
  { id: 'sunset',   label: 'Sunset',   desc: 'Amber · coral',            accent: '#fb923c', bg: '#1a0f0a', surface: '#2a1a12' },
  { id: 'stone',    label: 'Stone',    desc: 'Off-white · monochrome',   accent: '#e5e7eb', bg: '#111111', surface: '#1c1c1c' },
  { id: 'neon',     label: 'Neon',     desc: 'Pink · electric blue',     accent: '#f472b6', bg: '#0a0a1a', surface: '#111128' },
]

const LAYOUTS = [
  { id: 'classic',  label: 'Classic',  desc: 'Cover photo + left avatar' },
  { id: 'centered', label: 'Centered', desc: 'Avatar centered, wide banner' },
  { id: 'minimal',  label: 'Minimal',  desc: 'Clean — avatar + bio only' },
  { id: 'wide',     label: 'Wide',     desc: 'Full-width feed + sidebar' },
]

const AVATAR_COLORS = [
  { id: 'lime',    gradient: 'linear-gradient(135deg,#84cc16,#4ade80)' },
  { id: 'indigo',  gradient: 'linear-gradient(135deg,#6366f1,#a78bfa)' },
  { id: 'pink',    gradient: 'linear-gradient(135deg,#f472b6,#fb923c)' },
  { id: 'cyan',    gradient: 'linear-gradient(135deg,#22d3ee,#60a5fa)' },
  { id: 'amber',   gradient: 'linear-gradient(135deg,#fbbf24,#f87171)' },
  { id: 'emerald', gradient: 'linear-gradient(135deg,#34d399,#4ade80)' },
]

const PURPOSES = [
  'Personal', 'Content Creator', 'Professional', 'Music',
  'Photography', 'Writing', 'Tech', 'Fitness', 'Travel', 'Art',
]

// Full catalog of available pages
const ALL_PAGES = [
  { id: 'wall',       icon: '🏠', label: 'Wall',       desc: 'Main feed — posts, updates & pinned blocks',          required: true,  category: 'Core' },
  { id: 'profile',    icon: '👤', label: 'Profile',    desc: 'Full bio, identity card & social handles',            required: true,  category: 'Core' },
  { id: 'about',      icon: 'ℹ️',  label: 'About',      desc: 'Bio, location, contact options & links',              required: false, category: 'Core' },
  { id: 'friends',    icon: '👥', label: 'Friends',    desc: 'Connections, followers & mutual friends',              required: false, category: 'Social' },
  { id: 'board',      icon: '💬', label: 'Board',      desc: 'Community message board & discussions',                required: false, category: 'Social' },
  { id: 'feed',       icon: '📡', label: 'Feed',       desc: 'Curated social feed from people you follow',          required: false, category: 'Social' },
  { id: 'blog',       icon: '📝', label: 'Blog',       desc: 'Long-form articles, essays & published posts',        required: false, category: 'Content' },
  { id: 'media',      icon: '🎬', label: 'Media',      desc: 'Photos, videos, music & playlists',                   required: false, category: 'Content' },
  { id: 'gallery',    icon: '🖼️', label: 'Gallery',    desc: 'Visual showcase — photos, art & screenshots',         required: false, category: 'Content' },
  { id: 'music',      icon: '🎵', label: 'Music',      desc: 'Tracks, albums, tour dates & embedded player',        required: false, category: 'Content' },
  { id: 'newsletter', icon: '📮', label: 'Newsletter', desc: 'Email list with subscribe widget & issue archive',    required: false, category: 'Content' },
  { id: 'lists',      icon: '📋', label: 'Lists',      desc: 'Favorites, bucket list, travel & ranked lists',       required: false, category: 'Life' },
  { id: 'fitness',    icon: '💪', label: 'Fitness',    desc: 'Workouts, personal bests & fitness challenges',       required: false, category: 'Life' },
  { id: 'travel',     icon: '✈️', label: 'Travel',     desc: 'Places visited, trips & travel wishlist',             required: false, category: 'Life' },
  { id: 'learning',   icon: '📚', label: 'Learning',   desc: 'Skills progress, courses & what I\'m studying',      required: false, category: 'Life' },
  { id: 'portfolio',  icon: '💼', label: 'Portfolio',  desc: 'Work showcase with project case studies',             required: false, category: 'Professional' },
  { id: 'resume',     icon: '📄', label: 'Resume',     desc: 'CV — work history, education & skills',              required: false, category: 'Professional' },
  { id: 'shop',       icon: '🛒', label: 'Shop',       desc: 'Sell products, merch or digital downloads',          required: false, category: 'Professional' },
  { id: 'events',     icon: '📅', label: 'Events',     desc: 'Upcoming events, meetups & appearances',              required: false, category: 'Professional' },
  { id: 'contact',    icon: '📬', label: 'Contact',    desc: 'Contact form, booking links & social handles',        required: false, category: 'Professional' },
  { id: 'links',      icon: '🔗', label: 'Links',      desc: 'Link-in-bio — all your important URLs in one place', required: false, category: 'Professional' },
  { id: 'reviews',    icon: '⭐', label: 'Reviews',    desc: 'Film, book, album & game reviews',                   required: false, category: 'Content' },
]

// Which pages each purpose suggests (beyond the always-shown required pages)
const PURPOSE_PAGES = {
  'Personal':        ['about', 'friends', 'media', 'lists', 'blog'],
  'Content Creator': ['about', 'blog', 'media', 'newsletter', 'shop', 'contact', 'links'],
  'Professional':    ['about', 'resume', 'portfolio', 'blog', 'contact', 'links'],
  'Music':           ['about', 'music', 'media', 'events', 'shop', 'links'],
  'Photography':     ['gallery', 'about', 'media', 'portfolio', 'shop'],
  'Writing':         ['about', 'blog', 'lists', 'newsletter', 'reviews'],
  'Tech':            ['about', 'blog', 'learning', 'portfolio', 'links'],
  'Fitness':         ['about', 'fitness', 'events', 'lists', 'blog'],
  'Travel':          ['about', 'travel', 'media', 'gallery', 'blog'],
  'Art':             ['gallery', 'about', 'portfolio', 'shop', 'blog', 'events'],
}

// Block groups for the Blocks step
const BLOCK_GROUPS = [
  { app: 'Profile',  icon: '🪪', blocks: [
    { type: 'hero',         label: 'Hero banner',  desc: 'Name, avatar, cover photo',     default: true },
    { type: 'bio',          label: 'About me',     desc: 'Bio + social links',             default: true },
    { type: 'stats',        label: 'Stats',        desc: 'Followers, posts count',         default: false },
    { type: 'links',        label: 'Links',        desc: 'External URLs & handles',        default: false },
  ]},
  { app: 'Social',   icon: '📡', blocks: [
    { type: 'posts',        label: 'Posts feed',   desc: 'Recent posts from your wall',    default: true },
    { type: 'status',       label: 'Status',       desc: 'Current status or quote',        default: false },
  ]},
  { app: 'Goals',    icon: '🎯', blocks: [
    { type: 'goals_active', label: 'Active Goals', desc: 'Progress bars on your goals',   default: false },
    { type: 'goals_challenge', label: 'Challenge', desc: '"Join my challenge" block',      default: false },
  ]},
  { app: 'Fitness',  icon: '💪', blocks: [
    { type: 'fitness_stats', label: 'Fitness Stats', desc: 'Workouts, distance, streak',   default: false },
    { type: 'fitness_prs',   label: 'Personal Bests', desc: 'Lift & run PR leaderboard',  default: false },
  ]},
  { app: 'Media',    icon: '🎬', blocks: [
    { type: 'media_now',       label: 'Now',        desc: 'Currently watching / reading',  default: false },
    { type: 'media_favorites', label: 'Favorites',  desc: 'Top-rated albums, films, books',default: false },
  ]},
  { app: 'Lists',    icon: '📝', blocks: [
    { type: 'lists_favorites', label: 'Favorites list', desc: 'My favorite anything',      default: false },
    { type: 'lists_bucket',    label: 'Bucket list',    desc: 'Things I want to do',        default: false },
  ]},
  { app: 'Learning', icon: '📚', blocks: [
    { type: 'learning_skills',    label: 'Skills',    desc: 'Skill progress bars',          default: false },
    { type: 'learning_currently', label: 'Currently', desc: "What I'm learning now",        default: false },
  ]},
  { app: 'Journal',  icon: '📓', blocks: [
    { type: 'journal_mood',       label: 'Mood chart',  desc: '7-day mood trend',           default: false },
    { type: 'journal_highlights', label: 'Highlights',  desc: 'Recent moments feed',        default: false },
  ]},
]

const PAGE_CATEGORIES = ['Core', 'Social', 'Content', 'Life', 'Professional']

const TOTAL_STEPS = 6

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SpaceSetup() {
  const nav = useNavigate()
  const { data, updateUser, addSpaceBlock } = useStore()
  const u = data.user

  const [step, setStep] = useState(1)

  // Step 1 — Account
  const [handle, setHandle] = useState(u.handle || '')
  const [displayName, setDisplayName] = useState(u.name || '')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState(u.location || '')
  const [title, setTitle] = useState(u.title || '')

  // Step 2 — Profile
  const [bio, setBio] = useState(u.bio || '')
  const [avatarColor, setAvatarColor] = useState(u.avatarColor || AVATAR_COLORS[0].id)
  const [purposes, setPurposes] = useState(u.purposes || [])

  // Step 3 — Pages
  const [selectedPages, setSelectedPages] = useState(
    () => new Set(['wall', 'profile', 'about'])
  )
  const [showAllPages, setShowAllPages] = useState(false)
  const [customPages, setCustomPages] = useState([])
  const [newPageIcon, setNewPageIcon] = useState('')
  const [newPageLabel, setNewPageLabel] = useState('')
  const [newPageDesc, setNewPageDesc] = useState('')
  const [showAddPage, setShowAddPage] = useState(false)

  // Page card hover preview
  const [previewPage, setPreviewPage] = useState(null)
  const [previewRect, setPreviewRect] = useState(null)

  // Step 4 — Design
  const [theme, setTheme] = useState(u.spaceTheme || 'default')
  const [layout, setLayout] = useState(u.spaceLayout || 'classic')

  // Step 5 — Blocks
  const defaultBlocks = useMemo(() => {
    const s = new Set()
    BLOCK_GROUPS.forEach(g => g.blocks.filter(b => b.default).forEach(b => s.add(b.type)))
    return s
  }, [])
  const [selectedBlocks, setSelectedBlocks] = useState(defaultBlocks)
  const [openGroups, setOpenGroups] = useState(new Set(['Profile', 'Social']))

  // Step 6 — done flag
  const [launched, setLaunched] = useState(false)

  const selectedTheme = THEMES.find(t => t.id === theme) || THEMES[0]
  const selectedAvatarGradient = AVATAR_COLORS.find(c => c.id === avatarColor)?.gradient || AVATAR_COLORS[0].gradient
  const initials = displayName.trim().split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ME'

  // Derive suggested page IDs from selected purposes
  const suggestedIds = useMemo(() => {
    const s = new Set(['wall', 'profile'])
    purposes.forEach(p => (PURPOSE_PAGES[p] || []).forEach(id => s.add(id)))
    return s
  }, [purposes])

  // All pages including custom ones
  const allPagesWithCustom = useMemo(() => [...ALL_PAGES, ...customPages], [customPages])

  // Pages visible in the grid: if showAll → everything; otherwise suggested + already selected + custom
  const visiblePages = useMemo(() => {
    if (showAllPages) return allPagesWithCustom
    return allPagesWithCustom.filter(p =>
      p.required || suggestedIds.has(p.id) || selectedPages.has(p.id) || p.custom
    )
  }, [showAllPages, allPagesWithCustom, suggestedIds, selectedPages])

  const hiddenCount = allPagesWithCustom.length - visiblePages.length

  // When arriving at step 3 (Pages), pre-select purpose-based suggestions
  useEffect(() => {
    if (step === 3) {
      setSelectedPages(new Set(suggestedIds))
      setShowAllPages(false)
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear preview when leaving pages step
  useEffect(() => {
    if (step !== 3) {
      setPreviewPage(null)
      setPreviewRect(null)
    }
  }, [step])

  function togglePurpose(p) {
    setPurposes(prev => prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 3 ? [...prev, p] : prev)
  }

  function togglePage(id) {
    const page = allPagesWithCustom.find(p => p.id === id)
    if (page?.required) return
    setSelectedPages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function addCustomPage() {
    if (!newPageLabel.trim()) return
    const slug = newPageLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const id = `custom_${slug}_${Date.now()}`
    const page = {
      id,
      icon: newPageIcon.trim() || '📄',
      label: newPageLabel.trim(),
      desc: newPageDesc.trim() || `Custom page — ${newPageLabel.trim()}`,
      required: false,
      custom: true,
      category: 'Custom',
    }
    setCustomPages(prev => [...prev, page])
    setSelectedPages(prev => { const n = new Set(prev); n.add(id); return n })
    setNewPageIcon('')
    setNewPageLabel('')
    setNewPageDesc('')
    setShowAddPage(false)
  }

  function removeCustomPage(id) {
    setCustomPages(prev => prev.filter(p => p.id !== id))
    setSelectedPages(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function handlePageHover(page, rect) {
    setPreviewPage(page)
    setPreviewRect(rect)
  }

  function handlePageHoverEnd() {
    setPreviewPage(null)
    setPreviewRect(null)
  }

  function toggleBlock(type) {
    setSelectedBlocks(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  function toggleGroup(app) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(app) ? next.delete(app) : next.add(app)
      return next
    })
  }

  function handleNext() {
    if (step === 1) {
      updateUser({ handle: handle.replace('@', ''), name: displayName, location, title })
    } else if (step === 2) {
      updateUser({ bio, avatarColor, purposes })
    } else if (step === 3) {
      // Pages step — save selected pages
      updateUser({ monogenesPages: [...selectedPages], monogenesCustomPages: customPages })
    } else if (step === 4) {
      // Design step — save theme and layout
      updateUser({ spaceTheme: theme, spaceLayout: layout })
    } else if (step === 5) {
      const wallPage = (data.spacePages || []).find(p => p.slug === 'wall') || (data.spacePages || [])[0]
      if (wallPage) {
        selectedBlocks.forEach(type => {
          const existing = (data.spaceBlocks || []).find(b => b.pageId === wallPage.id && b.type === type)
          if (!existing) {
            const group = BLOCK_GROUPS.find(g => g.blocks.some(b => b.type === type))
            const block = group?.blocks.find(b => b.type === type)
            addSpaceBlock({ pageId: wallPage.id, type, label: block?.label || type })
          }
        })
      }
      setLaunched(true)
    }
    setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  const canAdvance = step === 1
    ? displayName.trim().length >= 2 && handle.replace('@', '').trim().length >= 1
    : true

  const selectedPageObjects = allPagesWithCustom.filter(p => selectedPages.has(p.id))

  return (
    <div style={shell}>
      <div style={card}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button style={backLinkBtn} onClick={() => nav('/')}>← Barbelo</button>
          <div style={{ flex: 1, color: '#f1f5f9', fontWeight: 700, fontSize: 17 }}>
            Set up your Monogenes
          </div>
          <div style={{ color: '#475569', fontSize: 11 }}>{step}/{TOTAL_STEPS}</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#1e293b', borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: selectedTheme.accent, borderRadius: 99, transition: 'width .3s' }} />
        </div>

        {/* ── Step 1: Account ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={stepHeading}>Create your account</div>
            <div style={stepSub}>This becomes your Barbelo identity — your handle is your permanent @username.</div>

            <div style={formGrid}>
              <div style={fieldGroup}>
                <label style={labelSt}>Handle <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 14, pointerEvents: 'none' }}>@</span>
                  <input
                    value={handle}
                    onChange={e => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                    placeholder="yourhandle"
                    maxLength={32}
                    style={{ ...inputSt, paddingLeft: 26 }}
                  />
                </div>
                <div style={helpText}>Letters, numbers, underscores only</div>
              </div>

              <div style={fieldGroup}>
                <label style={labelSt}>Display name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Jordan Malik"
                  maxLength={60}
                  style={inputSt}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelSt}>Email <span style={{ color: '#475569', fontWeight: 400, fontSize: 11 }}>(not shared publicly)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputSt}
                />
              </div>

              <div style={fieldGroup}>
                <label style={labelSt}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Seattle, WA" maxLength={60} style={inputSt} />
              </div>

              <div style={{ gridColumn: '1 / -1', ...fieldGroup }}>
                <label style={labelSt}>Title / tagline</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Software developer, runner, coffee enjoyer" maxLength={80} style={inputSt} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Profile ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={stepHeading}>Set up your profile</div>
            <div style={stepSub}>Tell people who you are and what your Monogenes is for.</div>

            {/* Avatar preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: selectedAvatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: `0 0 0 3px ${selectedTheme.accent}40` }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{displayName || 'Your name'}</div>
                <div style={{ color: '#475569', fontSize: 13 }}>@{handle || 'handle'}</div>
                {title && <div style={{ color: selectedTheme.accent, fontSize: 12, marginTop: 2 }}>{title}</div>}
              </div>
            </div>

            {/* Avatar color */}
            <div style={{ ...fieldGroup, marginBottom: 20 }}>
              <label style={labelSt}>Avatar color</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAvatarColor(c.id)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: c.gradient,
                      border: avatarColor === c.id ? `3px solid ${selectedTheme.accent}` : '3px solid transparent',
                      cursor: 'pointer', padding: 0,
                      boxShadow: avatarColor === c.id ? `0 0 0 2px ${selectedTheme.accent}40` : 'none',
                      transition: 'border-color .15s, box-shadow .15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bio */}
            <div style={{ ...fieldGroup, marginBottom: 20 }}>
              <label style={labelSt}>Bio <span style={{ color: '#475569', fontWeight: 400, fontSize: 11 }}>{bio.length}/160</span></label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 160))}
                placeholder="A few sentences about you, what you care about, or what this space is for."
                rows={3}
                style={{ ...inputSt, resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* Purposes */}
            <div style={fieldGroup}>
              <label style={labelSt}>Purpose <span style={{ color: '#475569', fontWeight: 400, fontSize: 11 }}>up to 3</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PURPOSES.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePurpose(p)}
                    style={{
                      ...chip,
                      ...(purposes.includes(p) ? { background: `${selectedTheme.accent}18`, borderColor: selectedTheme.accent, color: selectedTheme.accent } : {}),
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Pages ────────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={stepHeading}>Choose your pages</div>
            <div style={stepSub}>
              {purposes.length > 0
                ? `Showing pages recommended for ${purposes.join(', ')}. Hover any page to preview it.`
                : 'Each page becomes a tab on your Monogenes. Hover any page to preview it.'}
            </div>

            {/* Count + show all toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 12, color: '#475569' }}>
                {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
              </span>
              <div style={{ flex: 1 }} />
              {hiddenCount > 0 && !showAllPages && (
                <button
                  onClick={() => setShowAllPages(true)}
                  style={{ ...ghostSm, color: selectedTheme.accent, borderColor: `${selectedTheme.accent}40` }}
                >
                  Show all ({ALL_PAGES.length + customPages.length} total)
                </button>
              )}
              {showAllPages && (
                <button onClick={() => setShowAllPages(false)} style={{ ...ghostSm }}>
                  Show fewer
                </button>
              )}
            </div>

            {/* Category groupings when showing all */}
            {showAllPages ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {PAGE_CATEGORIES.concat(customPages.length ? ['Custom'] : []).map(cat => {
                  const catPages = allPagesWithCustom.filter(p => p.category === cat)
                  if (!catPages.length) return null
                  return (
                    <div key={cat}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>{cat}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {catPages.map(page => (
                          <PageCard
                            key={page.id}
                            page={page}
                            selectedPages={selectedPages}
                            suggestedIds={suggestedIds}
                            accent={selectedTheme.accent}
                            onToggle={togglePage}
                            onRemoveCustom={removeCustomPage}
                            onHover={handlePageHover}
                            onHoverEnd={handlePageHoverEnd}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {visiblePages.map(page => (
                  <PageCard
                    key={page.id}
                    page={page}
                    selectedPages={selectedPages}
                    suggestedIds={suggestedIds}
                    accent={selectedTheme.accent}
                    onToggle={togglePage}
                    onRemoveCustom={removeCustomPage}
                    onHover={handlePageHover}
                    onHoverEnd={handlePageHoverEnd}
                  />
                ))}
              </div>
            )}

            {/* Add custom page */}
            <div style={{ marginTop: 20, borderTop: '1px solid #1e293b', paddingTop: 18 }}>
              {!showAddPage ? (
                <button
                  onClick={() => setShowAddPage(true)}
                  style={{ ...ghostSm, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add a custom page
                </button>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>New custom page</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
                    <div style={fieldGroup}>
                      <label style={{ ...labelSt, fontSize: 10 }}>Icon</label>
                      <input
                        value={newPageIcon}
                        onChange={e => setNewPageIcon(e.target.value)}
                        placeholder="📄"
                        maxLength={4}
                        style={{ ...inputSt, textAlign: 'center', fontSize: 18, padding: '7px 6px' }}
                      />
                    </div>
                    <div style={fieldGroup}>
                      <label style={{ ...labelSt, fontSize: 10 }}>Page name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        value={newPageLabel}
                        onChange={e => setNewPageLabel(e.target.value)}
                        placeholder="e.g. Recipes, Reviews, Services…"
                        maxLength={32}
                        style={inputSt}
                        onKeyDown={e => e.key === 'Enter' && addCustomPage()}
                      />
                    </div>
                  </div>
                  <div style={{ ...fieldGroup, marginBottom: 12 }}>
                    <label style={{ ...labelSt, fontSize: 10 }}>Description <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      value={newPageDesc}
                      onChange={e => setNewPageDesc(e.target.value)}
                      placeholder="One-line description of what's on this page"
                      maxLength={80}
                      style={inputSt}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={addCustomPage}
                      disabled={!newPageLabel.trim()}
                      style={{ ...primaryBtn, background: selectedTheme.accent, padding: '8px 18px', fontSize: 12, opacity: newPageLabel.trim() ? 1 : 0.4 }}
                    >
                      Add page
                    </button>
                    <button
                      onClick={() => { setShowAddPage(false); setNewPageIcon(''); setNewPageLabel(''); setNewPageDesc('') }}
                      style={{ ...ghostBtn, padding: '8px 14px', fontSize: 12 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Design ───────────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <div style={stepHeading}>Design your Monogenes</div>
            <div style={stepSub}>
              Choose a color theme and profile layout for your {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''}. You can change these any time.
            </div>

            <div style={{ ...fieldGroup, marginBottom: 24 }}>
              <label style={labelSt}>Color theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      border: `2px solid ${theme === t.id ? t.accent : '#334155'}`,
                      borderRadius: 10, padding: 10, cursor: 'pointer', textAlign: 'left',
                      background: t.surface, transition: 'border-color .15s',
                    }}
                  >
                    <div style={{ background: t.bg, borderRadius: 6, padding: 8, marginBottom: 7 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.accent, marginBottom: 5, opacity: 0.9 }} />
                      <div style={{ height: 5, width: '65%', background: '#fff', opacity: 0.6, borderRadius: 3, marginBottom: 3 }} />
                      <div style={{ height: 3, width: '40%', background: t.accent, borderRadius: 3, opacity: 0.8 }} />
                    </div>
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 12 }}>{t.label}</div>
                    <div style={{ color: '#64748b', fontSize: 10, marginTop: 1 }}>{t.desc}</div>
                    {theme === t.id && <div style={{ color: t.accent, fontSize: 10, fontWeight: 700, marginTop: 4 }}>✓ Active</div>}
                  </button>
                ))}
              </div>
            </div>

            <div style={fieldGroup}>
              <label style={labelSt}>Profile layout</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    style={{
                      border: `2px solid ${layout === l.id ? selectedTheme.accent : '#334155'}`,
                      borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'left',
                      background: layout === l.id ? `${selectedTheme.accent}0c` : '#0f172a',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: layout === l.id ? selectedTheme.accent : '#f1f5f9', fontSize: 13, marginBottom: 3 }}>{l.label}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Blocks ───────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <div style={stepHeading}>Choose your blocks</div>
            <div style={stepSub}>These sections will appear on your Wall page. You can add, remove, or move them to other pages in the editor later.</div>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>{selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''} selected</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {BLOCK_GROUPS.map(group => {
                const isOpen = openGroups.has(group.app)
                const checkedCount = group.blocks.filter(b => selectedBlocks.has(b.type)).length
                return (
                  <div key={group.app} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
                    <button
                      onClick={() => toggleGroup(group.app)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#f1f5f9' }}
                    >
                      <span style={{ fontSize: 15 }}>{group.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, flex: 1, textAlign: 'left' }}>{group.app}</span>
                      {checkedCount > 0 && (
                        <span style={{ fontSize: 10, background: `${selectedTheme.accent}22`, color: selectedTheme.accent, borderRadius: 99, padding: '1px 7px', fontWeight: 600 }}>
                          {checkedCount}
                        </span>
                      )}
                      <span style={{ color: '#475569', fontSize: 11 }}>{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: '1px solid #1e293b' }}>
                        {group.blocks.map(block => {
                          const checked = selectedBlocks.has(block.type)
                          return (
                            <label
                              key={block.type}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px 9px 20px', cursor: 'pointer', transition: 'background .1s', background: checked ? `${selectedTheme.accent}08` : 'transparent' }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleBlock(block.type)}
                                style={{ accentColor: selectedTheme.accent, width: 14, height: 14, flexShrink: 0 }}
                              />
                              <div>
                                <div style={{ fontWeight: checked ? 600 : 400, fontSize: 12, color: checked ? '#f1f5f9' : '#94a3b8' }}>
                                  {block.label}
                                </div>
                                <div style={{ fontSize: 10, color: '#475569' }}>{block.desc}</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 6: Launch ───────────────────────────────────────────────── */}
        {step === 6 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎉</div>
            <div style={stepHeading}>Your Monogenes is ready</div>
            <div style={stepSub}>Here's what we set up for you.</div>

            <div style={{ background: selectedTheme.surface, border: `1px solid ${selectedTheme.accent}30`, borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              {/* Mini profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedAvatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{displayName}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>@{handle}</div>
                  {title && <div style={{ color: selectedTheme.accent, fontSize: 12 }}>{title}</div>}
                </div>
                <div style={{ marginLeft: 'auto', background: `${selectedTheme.accent}20`, borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                  <div style={{ color: selectedTheme.accent, fontWeight: 700, fontSize: 13 }}>{selectedTheme.label}</div>
                  <div style={{ color: '#64748b', fontSize: 10 }}>theme</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bio && (
                  <div style={summaryRow}>
                    <span style={summaryLabel}>Bio</span>
                    <span style={summaryValue}>{bio.slice(0, 60)}{bio.length > 60 ? '…' : ''}</span>
                  </div>
                )}
                {location && (
                  <div style={summaryRow}>
                    <span style={summaryLabel}>Location</span>
                    <span style={summaryValue}>{location}</span>
                  </div>
                )}
                {purposes.length > 0 && (
                  <div style={summaryRow}>
                    <span style={summaryLabel}>Purpose</span>
                    <span style={summaryValue}>{purposes.join(', ')}</span>
                  </div>
                )}
                <div style={summaryRow}>
                  <span style={summaryLabel}>Layout</span>
                  <span style={summaryValue}>{LAYOUTS.find(l => l.id === layout)?.label}</span>
                </div>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Pages</span>
                  <span style={summaryValue}>
                    {selectedPageObjects.map(p => `${p.icon} ${p.label}`).join(' · ')}
                  </span>
                </div>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Blocks</span>
                  <span style={summaryValue}>{selectedBlocks.size} added to your Wall</span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => nav('/monogenes')}
                style={{ ...primaryBtn, background: selectedTheme.accent, fontSize: 15, padding: '13px 24px', width: '100%' }}
              >
                🏠 Open your Monogenes →
              </button>
              <button
                onClick={() => nav('/monogenes/editor')}
                style={{ ...ghostBtn, fontSize: 14, padding: '11px 24px', width: '100%' }}
              >
                ✦ Open BUILDMONOGENES editor
              </button>
              <button
                onClick={() => nav('/monogenes/customize')}
                style={{ ...ghostBtn, fontSize: 13, padding: '9px 24px', width: '100%', color: '#64748b', borderColor: '#1e293b' }}
              >
                ⚙ More customization options
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 6 && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 32, gap: 10 }}>
            {step > 1 && (
              <button style={ghostBtn} onClick={handleBack}>← Back</button>
            )}
            <div style={{ flex: 1 }} />
            {step < 5 && (
              <button
                style={{ ...primaryBtn, background: selectedTheme.accent, opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
                onClick={handleNext}
                disabled={!canAdvance}
              >
                Next →
              </button>
            )}
            {step === 5 && (
              <button
                style={{ ...primaryBtn, background: selectedTheme.accent }}
                onClick={handleNext}
              >
                Launch my Monogenes →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Page hover preview popup (only on step 3) */}
      {previewPage && previewRect && step === 3 && (
        <PagePreviewPopup
          page={previewPage}
          rect={previewRect}
          accent={selectedTheme.accent}
        />
      )}
    </div>
  )
}

// ── PageCard sub-component ────────────────────────────────────────────────────

function PageCard({ page, selectedPages, suggestedIds, accent, onToggle, onRemoveCustom, onHover, onHoverEnd }) {
  const active = selectedPages.has(page.id)
  const isSuggested = !page.required && suggestedIds.has(page.id)

  return (
    <button
      onClick={() => onToggle(page.id)}
      onMouseEnter={e => onHover?.(page, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHoverEnd?.()}
      style={{
        textAlign: 'left',
        cursor: page.required ? 'default' : 'pointer',
        border: `2px solid ${active ? accent : '#334155'}`,
        background: active ? `${accent}0c` : '#0f172a',
        borderRadius: 10,
        padding: '12px 14px',
        transition: 'border-color .15s, background .15s',
        position: 'relative',
      }}
    >
      {/* Required lock */}
      {page.required && (
        <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, color: '#475569' }}>🔒</span>
      )}

      {/* Custom remove */}
      {page.custom && (
        <span
          onClick={e => { e.stopPropagation(); onRemoveCustom(page.id) }}
          style={{ position: 'absolute', top: 6, right: 8, fontSize: 11, color: '#475569', cursor: 'pointer', zIndex: 1, padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}
          title="Remove custom page"
        >✕</span>
      )}

      {/* Check indicator */}
      {!page.required && !page.custom && (
        <span style={{
          position: 'absolute', top: 8, right: 8, width: 16, height: 16,
          borderRadius: '50%', border: `2px solid ${active ? accent : '#334155'}`,
          background: active ? accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, color: active ? '#0f172a' : 'transparent',
          transition: 'all .15s',
        }}>✓</span>
      )}

      <div style={{ fontSize: 20, marginBottom: 5 }}>{page.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 12, color: active ? '#f1f5f9' : '#94a3b8', marginBottom: 2 }}>
        {page.label}
        {isSuggested && !active && (
          <span style={{ marginLeft: 5, fontSize: 9, color: accent, fontWeight: 600, verticalAlign: 'middle' }}>✦</span>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{page.desc}</div>
      {page.required && (
        <div style={{ marginTop: 4, fontSize: 9, color: '#334155' }}>Always included</div>
      )}
      {page.custom && (
        <div style={{ marginTop: 4, fontSize: 9, color: accent, opacity: 0.7 }}>Custom</div>
      )}
    </button>
  )
}

// ── PagePreviewPopup ──────────────────────────────────────────────────────────

function PagePreviewPopup({ page, rect, accent }) {
  const popupW = 252
  const popupH = 240
  const margin = 14

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800

  // Prefer right side of card; fall back to left
  let left = rect.right + margin
  if (left + popupW > winW - 16) left = rect.left - popupW - margin
  if (left < 16) left = 16

  // Align to card top, clamp to viewport
  let top = rect.top
  if (top + popupH > winH - 16) top = winH - popupH - 16
  if (top < 16) top = 16

  return (
    <div style={{
      position: 'fixed',
      left,
      top,
      width: popupW,
      background: '#111827',
      border: `1px solid ${accent}50`,
      borderRadius: 12,
      overflow: 'hidden',
      zIndex: 9999,
      pointerEvents: 'none',
      boxShadow: '0 24px 64px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)',
      animation: 'fadeInPopup .12s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ fontSize: 14 }}>{page.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{page.label}</span>
          {page.required && <span style={{ fontSize: 9, color: '#475569', marginLeft: 'auto' }}>required</span>}
        </div>
        <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{page.desc}</div>
      </div>

      {/* Wireframe */}
      <div style={{ padding: 10, background: '#0d1424', minHeight: 168 }}>
        <WireframeForPage pageId={page.id} page={page} accent={accent} />
      </div>

      <style>{`@keyframes fadeInPopup { from { opacity: 0; transform: translateY(4px) scale(.97); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  )
}

// ── WireframeForPage ──────────────────────────────────────────────────────────

function WireframeForPage({ pageId, page, accent }) {
  const B = ({ w = 100, h = 5, c, r = 2 }) => (
    <div style={{ width: typeof w === 'number' ? `${w}%` : w, height: h, background: c || '#1e293b', borderRadius: r, flexShrink: 0 }} />
  )
  const Gap = ({ h }) => <div style={{ height: h }} />
  const Row = ({ children, gap = 6, align = 'center' }) => (
    <div style={{ display: 'flex', alignItems: align, gap }}>{children}</div>
  )
  const Circle = ({ size = 22, color }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color || `${accent}60`, flexShrink: 0 }} />
  )
  const Grid = ({ cols, gap = 5, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>{children}</div>
  )
  const Card = ({ children, style }) => (
    <div style={{ background: '#1e293b', borderRadius: 6, padding: 8, ...style }}>{children}</div>
  )
  const Rect = ({ h, color, r = 4 }) => (
    <div style={{ height: h, background: color || '#1e293b', borderRadius: r }} />
  )

  const isCustom = pageId?.startsWith('custom_')

  if (isCustom) {
    return (
      <div>
        <Rect h={44} color={`${accent}18`} r={6} />
        <Gap h={8} />
        <B w={65} h={6} />
        <Gap h={8} />
        <B w={95} h={4} c="#334155" />
        <Gap h={4} />
        <B w={80} h={4} c="#334155" />
        <Gap h={4} />
        <B w={70} h={4} c="#334155" />
      </div>
    )
  }

  switch (pageId) {
    case 'wall':
      return (
        <div>
          {/* compose */}
          <Card>
            <Row><Circle size={18} /><B w={60} h={5} c="#334155" /></Row>
          </Card>
          <Gap h={6} />
          {[0, 1].map(i => (
            <Card key={i} style={{ marginBottom: 6 }}>
              <Row><Circle size={18} /><div><B w={44} h={5} /><Gap h={3} /><B w={28} h={3} c="#334155" /></div></Row>
              <Gap h={6} />
              <B w={90} h={4} c="#334155" />
              <Gap h={3} />
              <B w={75} h={4} c="#334155" />
              <Gap h={6} />
              <Row gap={8}><B w={22} h={3} c="#334155" /><B w={22} h={3} c="#334155" /></Row>
            </Card>
          ))}
        </div>
      )

    case 'profile':
      return (
        <div>
          {/* cover */}
          <Rect h={38} color={`${accent}28`} r={6} />
          {/* avatar row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: -14, paddingLeft: 6, marginBottom: 8 }}>
            <Circle size={30} color={`${accent}80`} />
          </div>
          <B w={48} h={6} />
          <Gap h={3} />
          <B w={32} h={4} c="#334155" />
          <Gap h={10} />
          {/* stats */}
          <Row gap={12}>
            {['Posts', 'Followers', 'Following'].map(s => (
              <div key={s} style={{ textAlign: 'center' }}>
                <B w="18px" h={6} c={`${accent}60`} r={2} />
                <Gap h={3} />
                <B w="28px" h={3} c="#334155" r={2} />
              </div>
            ))}
          </Row>
        </div>
      )

    case 'about':
      return (
        <div>
          <Row gap={10}>
            <Circle size={32} />
            <div style={{ flex: 1 }}><B w={60} h={5} /><Gap h={4} /><B w={40} h={4} c="#334155" /></div>
          </Row>
          <Gap h={14} />
          {[['📍', 70], ['📧', 80], ['🔗', 60], ['💼', 55]].map(([icon, w], i) => (
            <Row key={i} gap={6} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, width: 14, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <B w={w} h={4} c="#334155" />
            </Row>
          ))}
        </div>
      )

    case 'friends':
      return (
        <div>
          {/* tabs */}
          <Row gap={8} style={{ marginBottom: 12 }}>
            <B w={32} h={4} c={`${accent}60`} r={99} />
            <B w={32} h={4} c="#334155" r={99} />
            <B w={32} h={4} c="#334155" r={99} />
          </Row>
          <Grid cols={4} gap={8}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Circle size={26} color={i % 3 === 0 ? `${accent}50` : '#334155'} />
                <B w="90%" h={3} c="#1e293b" r={2} />
              </div>
            ))}
          </Grid>
        </div>
      )

    case 'board':
      return (
        <div>
          {[0, 1, 2, 3].map(i => (
            <Card key={i} style={{ marginBottom: 5 }}>
              <B w={i === 0 ? 80 : 70} h={5} />
              <Gap h={5} />
              <Row gap={6}>
                <B w={22} h={3} c="#334155" />
                <B w={18} h={3} c="#334155" />
                <B w={20} h={3} c="#334155" />
              </Row>
            </Card>
          ))}
        </div>
      )

    case 'feed':
      return (
        <div>
          {[0, 1, 2].map(i => (
            <Row key={i} gap={8} align="flex-start" style={{ marginBottom: 10 }}>
              <Circle size={20} color={i === 1 ? `${accent}50` : '#334155'} />
              <div style={{ flex: 1 }}>
                <B w={52} h={5} />
                <Gap h={4} />
                <B w={95} h={4} c="#334155" />
                <Gap h={3} />
                <B w={75} h={4} c="#334155" />
              </div>
            </Row>
          ))}
        </div>
      )

    case 'blog':
      return (
        <div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < 2 ? '1px solid #1e293b' : 'none' }}>
              <B w={i === 0 ? 78 : i === 1 ? 65 : 82} h={6} />
              <Gap h={4} />
              <B w={35} h={4} c={`${accent}60`} />
              <Gap h={4} />
              <B w={95} h={3} c="#334155" />
              <Gap h={3} />
              <B w={80} h={3} c="#334155" />
            </div>
          ))}
        </div>
      )

    case 'media':
      return (
        <Grid cols={3} gap={4}>
          {[...Array(6)].map((_, i) => (
            <Rect key={i} h={52} color={i % 2 === 0 ? '#1e293b' : '#334155'} r={4} />
          ))}
        </Grid>
      )

    case 'gallery':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          <Rect h={72} color="#1e293b" r={4} />
          <Rect h={46} color="#334155" r={4} />
          <Rect h={60} color="#1e293b" r={4} />
          <Rect h={52} color="#334155" r={4} />
          <Rect h={72} color="#1e293b" r={4} />
          <Rect h={42} color="#334155" r={4} />
        </div>
      )

    case 'music':
      return (
        <div>
          {/* Album row */}
          <Row gap={5} style={{ marginBottom: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <Rect key={i} h={36} color={i === 0 ? `${accent}40` : '#1e293b'} r={4} />
            ))}
          </Row>
          {/* Tracks */}
          {[0, 1, 2, 3].map(i => (
            <Row key={i} gap={8} style={{ marginBottom: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? accent : '#334155', flexShrink: 0 }} />
              <B w={52} h={5} c={i === 0 ? '#94a3b8' : '#475569'} />
              <div style={{ flex: 1 }} />
              <B w={14} h={4} c="#334155" />
            </Row>
          ))}
        </div>
      )

    case 'newsletter':
      return (
        <div>
          {/* Subscribe box */}
          <div style={{ background: `${accent}18`, borderRadius: 6, padding: '8px 10px', marginBottom: 10, textAlign: 'center' }}>
            <B w={60} h={5} c={`${accent}50`} r={99} />
            <Gap h={7} />
            <Rect h={18} color="#1e293b" r={3} />
            <Gap h={6} />
            <Rect h={16} color={`${accent}50`} r={3} />
          </div>
          {[0, 1].map(i => (
            <Card key={i} style={{ marginBottom: 5 }}>
              <B w={70} h={5} />
              <Gap h={4} />
              <B w={35} h={4} c="#334155" />
            </Card>
          ))}
        </div>
      )

    case 'lists':
      return (
        <div>
          {[1, 0, 1, 0, 1, 1].map((checked, i) => (
            <Row key={i} gap={8} style={{ marginBottom: 9 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: checked ? accent : 'transparent', border: `2px solid ${checked ? accent : '#334155'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {checked ? <span style={{ fontSize: 8, color: '#0f172a', fontWeight: 900 }}>✓</span> : null}
              </div>
              <B w={i % 3 === 0 ? 65 : i % 2 === 0 ? 52 : 70} h={5} c={checked ? '#94a3b8' : '#475569'} />
            </Row>
          ))}
        </div>
      )

    case 'fitness':
      return (
        <div>
          <Grid cols={3} gap={5} style={{ marginBottom: 10 }}>
            {['🏃', '💪', '🔥'].map((icon, i) => (
              <div key={i} style={{ background: '#1e293b', borderRadius: 6, padding: '5px 6px', textAlign: 'center' }}>
                <span style={{ fontSize: 11 }}>{icon}</span>
                <Gap h={3} />
                <div style={{ width: '60%', height: 5, background: `${accent}60`, borderRadius: 2, margin: '0 auto' }} />
              </div>
            ))}
          </Grid>
          {[0, 1, 2].map(i => (
            <Row key={i} gap={6} style={{ marginBottom: 6 }}>
              <B w={20} h={4} c={`${accent}40`} />
              <B w={52} h={5} />
              <div style={{ flex: 1 }} />
              <B w={14} h={4} c="#334155" />
            </Row>
          ))}
        </div>
      )

    case 'travel':
      return (
        <div>
          <div style={{ height: 58, background: '#1e293b', borderRadius: 6, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, opacity: 0.25 }}>🗺</span>
          </div>
          {[0, 1].map(i => (
            <Card key={i} style={{ marginBottom: 5 }}>
              <Row gap={6}>
                <B w={60} h={5} />
                <div style={{ flex: 1 }} />
                <B w={24} h={4} c={`${accent}50`} />
              </Row>
              <Gap h={4} />
              <B w={40} h={4} c="#334155" />
            </Card>
          ))}
        </div>
      )

    case 'learning':
      return (
        <div>
          {[['Go', 74], ['React', 90], ['Rust', 38], ['Python', 62]].map(([skill, pct], i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <Row gap={6} style={{ marginBottom: 4, justifyContent: 'space-between' }}>
                <B w={skill.length * 7} h={4} c="#94a3b8" />
                <B w={16} h={4} c="#334155" />
              </Row>
              <div style={{ height: 5, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: `${accent}80`, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )

    case 'portfolio':
      return (
        <Grid cols={2} gap={5}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
              <Rect h={38} color={[`${accent}30`, '#334155', '#334155', `${accent}20`][i]} r={0} />
              <div style={{ padding: '5px 7px' }}>
                <B w={70} h={4} />
                <Gap h={3} />
                <B w={50} h={3} c="#334155" />
              </div>
            </div>
          ))}
        </Grid>
      )

    case 'resume':
      return (
        <div>
          {[0, 1, 2].map(i => (
            <Row key={i} gap={8} align="flex-start" style={{ marginBottom: i < 2 ? 0 : 0, paddingBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12, flexShrink: 0 }}>
                <Circle size={8} color={`${accent}70`} />
                {i < 2 && <div style={{ width: 2, height: 30, background: '#1e293b', marginTop: 3 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <B w={65} h={5} />
                <Gap h={4} />
                <B w={42} h={4} c="#334155" />
                <Gap h={3} />
                <B w={80} h={3} c="#334155" />
              </div>
            </Row>
          ))}
        </div>
      )

    case 'shop':
      return (
        <Grid cols={3} gap={5}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
              <Rect h={42} color="#334155" r={0} />
              <div style={{ padding: '5px 6px' }}>
                <B w={80} h={4} />
                <Gap h={4} />
                <B w={50} h={4} c={`${accent}60`} />
              </div>
            </div>
          ))}
        </Grid>
      )

    case 'events':
      return (
        <div>
          {[0, 1, 2].map(i => (
            <Row key={i} gap={8} style={{ marginBottom: 8 }}>
              <div style={{ width: 32, height: 34, background: `${accent}20`, borderRadius: 6, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <B w="55%" h={3} c={`${accent}70`} />
                <B w="65%" h={5} c={`${accent}50`} />
              </div>
              <div style={{ flex: 1 }}>
                <B w={75} h={5} />
                <Gap h={4} />
                <B w={50} h={4} c="#334155" />
              </div>
            </Row>
          ))}
        </div>
      )

    case 'contact':
      return (
        <div>
          {[{ label: 30, h: 20 }, { label: 24, h: 20 }, { label: 20, h: 38 }].map(({ label, h }, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <B w={label} h={3} c="#475569" />
              <Gap h={4} />
              <Rect h={h} color="#1e293b" r={4} />
            </div>
          ))}
          <Rect h={24} color={`${accent}60`} r={5} />
        </div>
      )

    case 'links':
      return (
        <div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: 26, background: i === 0 ? `${accent}25` : '#1e293b',
              borderRadius: 99, marginBottom: 7,
              border: `1px solid ${i === 0 ? `${accent}60` : '#334155'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <B w={i === 0 ? 45 : 38} h={4} c={i === 0 ? `${accent}80` : '#334155'} r={99} />
            </div>
          ))}
        </div>
      )

    case 'reviews':
      return (
        <div>
          {[[4, 72], [5, 60], [3, 80]].map(([stars, w], i) => (
            <Card key={i} style={{ marginBottom: 6 }}>
              <B w={w} h={5} />
              <Gap h={4} />
              <Row gap={2}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ fontSize: 8, color: s <= stars ? '#fbbf24' : '#334155' }}>★</span>
                ))}
              </Row>
              <Gap h={4} />
              <B w={92} h={3} c="#334155" />
            </Card>
          ))}
        </div>
      )

    default:
      return (
        <div>
          <Rect h={44} color={`${accent}18`} r={6} />
          <Gap h={8} />
          <B w={65} h={6} />
          <Gap h={8} />
          <B w={95} h={4} c="#334155" />
          <Gap h={4} />
          <B w={80} h={4} c="#334155" />
        </div>
      )
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const shell = {
  minHeight: '100vh',
  background: '#060c18',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px 16px 80px',
}

const card = {
  background: '#111827',
  border: '1px solid #1e293b',
  borderRadius: 18,
  padding: '28px 28px 32px',
  width: '100%',
  maxWidth: 560,
}

const stepHeading = { color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 6 }
const stepSub = { color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 22 }

const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
const fieldGroup = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelSt = { color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: '.03em' }
const helpText = { color: '#475569', fontSize: 11 }

const inputSt = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 7,
  padding: '9px 12px',
  color: '#f1f5f9',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
}

const chip = {
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#94a3b8',
  borderRadius: 99,
  padding: '5px 13px',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'all .15s',
}

const summaryRow = { display: 'flex', alignItems: 'baseline', gap: 10 }
const summaryLabel = { color: '#475569', fontSize: 11, fontWeight: 600, minWidth: 64, flexShrink: 0 }
const summaryValue = { color: '#94a3b8', fontSize: 12 }

const backLinkBtn = {
  background: 'transparent',
  border: 'none',
  color: '#475569',
  cursor: 'pointer',
  fontSize: 12,
  padding: 0,
}

const primaryBtn = {
  background: '#84cc16',
  color: '#0f172a',
  border: 'none',
  borderRadius: 9,
  padding: '11px 24px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'opacity .15s',
}

const ghostBtn = {
  background: 'transparent',
  border: '1px solid #334155',
  color: '#94a3b8',
  borderRadius: 9,
  padding: '11px 20px',
  fontSize: 13,
  cursor: 'pointer',
}

const ghostSm = {
  background: 'transparent',
  border: '1px solid #334155',
  color: '#64748b',
  borderRadius: 6,
  padding: '5px 12px',
  fontSize: 11,
  cursor: 'pointer',
}
