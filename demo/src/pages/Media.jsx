import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store.jsx'

// Session-level blob caches
const photoBlobUrls = {}
const videoBlobUrls = {}

const TYPES = ['All', 'Book', 'Movie', 'Album', 'Podcast', 'Show', 'Game']
const STATUSES = ['All', 'completed', 'reading', 'watching', 'listening', 'following', 'want', 'dropped']
const STATUS_LABEL = { completed: '✓ Done', reading: '📖 Reading', watching: '👀 Watching', listening: '🎧 Listening', following: '🔔 Following', want: '+ Want', dropped: '✗ Dropped' }
const STATUS_COLOR = { completed: 'var(--accent)', reading: '#e0a040', watching: '#e0a040', listening: '#e0a040', following: '#7c6af7', want: '#888', dropped: '#555' }

// Session-only blob URL cache — survives React re-renders, cleared on page reload
const mediaBlobUrls = {}

function fmtTime(secs) {
  if (secs == null || isNaN(secs)) return ''
  const s = Math.floor(secs)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

function parseTime(str) {
  if (!str) return null
  const parts = String(str).split(':').map(Number)
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

function Initials({ name, size = 28 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function Stars({ n, onChange }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} onClick={onChange ? () => onChange(i) : undefined}
          style={{ color: i <= (n ?? 0) ? '#e0a040' : 'var(--text-3)', fontSize: 16, cursor: onChange ? 'pointer' : 'default' }}>★</span>
      ))}
    </span>
  )
}

// ── BranchCountdownRing ───────────────────────────────────────────────────────
function BranchCountdownRing({ secs, total }) {
  const r = 20, circ = 2 * Math.PI * r
  return (
    <svg width={54} height={54} viewBox="0 0 54 54">
      <circle cx={27} cy={27} r={r} fill="none" stroke="#334155" strokeWidth={4} />
      <circle cx={27} cy={27} r={r} fill="none" stroke="var(--accent)" strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - (total > 0 ? secs / total : 0))}
        style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '27px 27px' }} />
      <text x={27} y={32} textAnchor="middle" fontSize={13} fill="#f1f5f9">{secs}</text>
    </svg>
  )
}

// ── MediaPlayer ───────────────────────────────────────────────────────────────
function MediaPlayer({ media, onClose }) {
  const { data,
    updateMediaFile, addMediaChapter, updateMediaChapter, deleteMediaChapter,
    addMediaAnnotation, deleteMediaAnnotation,
    addMediaComment, deleteMediaComment, updateMediaEntry, addSpacePost,
    addMediaBranch, deleteMediaBranch, rateBranchOption,
    addMediaPreset, deleteMediaPreset,
    addViewerPreset,
    addTagComment, deleteTagComment,
    addMediaCommentary, deleteMediaCommentary,
    addLinkComment, deleteLinkComment,
    updatePersonalMedia, updateVideo,
  } = useStore()

  const mediaRef = useRef(null)
  const scrubRef = useRef(null)
  const branchTimerRef = useRef(null)

  // Basic player state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [blobUrl, setBlobUrl] = useState(mediaBlobUrls[media.id] || media._blobUrl || null)

  // Annotation state
  const [activeAnnotation, setActiveAnnotation] = useState(null)
  const [dismissedId, setDismissedId] = useState(null)

  // Branch state
  const [activeBranch, setActiveBranch] = useState(null)
  const [branchCountdown, setBranchCountdown] = useState(0)
  const [ratingPrompt, setRatingPrompt] = useState(null)

  // Preset / filter state
  const [activePresetId, setActivePresetId] = useState(null)
  const [tagFilter, setTagFilter] = useState([])
  const [showLayers, setShowLayers] = useState(false)

  // Compilation state
  const [showCompilationPicker, setShowCompilationPicker] = useState(false)
  const [compilationQueue, setCompilationQueue] = useState([])
  const [compilationIdx, setCompilationIdx] = useState(-1)

  // Tab / comment state
  const [playerTab, setPlayerTab] = useState('comments')
  const [commentTab, setCommentTab] = useState('episode')
  const [activeTagThread, setActiveTagThread] = useState(null)
  const [tagCommentText, setTagCommentText] = useState('')
  const [commentText, setCommentText] = useState('')
  const [pinTime, setPinTime] = useState(false)

  // Form state
  const [newChapter, setNewChapter] = useState({ startTime: '', endTime: '', label: '', tags: '', layer: 0 })
  const [newAnnotation, setNewAnnotation] = useState({ time: '', title: '', note: '', link: '', linkType: 'external' })
  const [newBranchTime, setNewBranchTime] = useState('')
  const [newBranchLabel, setNewBranchLabel] = useState('')
  const [newBranchSecs, setNewBranchSecs] = useState(10)
  const [newBranchOptions, setNewBranchOptions] = useState([])
  const [newBranchOptLabel, setNewBranchOptLabel] = useState('')
  const [newBranchOptJumpTo, setNewBranchOptJumpTo] = useState('')
  const [newPresetState, setNewPresetState] = useState({ icon: '', label: '', tags: '' })
  const [viewerPresetForm, setViewerPresetForm] = useState(null)

  // Landing / phase
  const [playerPhase, setPlayerPhase] = useState('landing')

  // Content preferences
  const [contentPrefs, setContentPrefs] = useState({})  // tag → 'prioritize' | 'skip'
  const [prefOrder, setPrefOrder] = useState([])         // ranked prioritized tags
  const [showPrefs, setShowPrefs] = useState(false)
  const [conflictPrompt, setConflictPrompt] = useState(null)

  // Session history
  const [lastBranchTime, setLastBranchTime] = useState(null)
  const [sessionChoices, setSessionChoices] = useState([])

  // Branch bookmarks (session-only)
  const [bookmarkedBranchIds, setBookmarkedBranchIds] = useState(new Set())

  // Commentary overlay
  const [activeCommentary, setActiveCommentary] = useState(null)
  const [dismissedCommentaryId, setDismissedCommentaryId] = useState(null)
  const [newCommentary, setNewCommentary] = useState({ time: '', text: '', playback: 'pause' })

  // Link-scoped comments
  const [activeLinkThread, setActiveLinkThread] = useState(null)
  const [linkCommentText, setLinkCommentText] = useState('')

  // Derived data
  const chapters = media.chapters || []
  const annotations = media.annotations || []
  const comments = media.comments || []
  const branches = media.branches || []
  const presets = media.presets || []
  const tagComments = media.tagComments || []
  const viewerPresets = data.viewerPresets || []

  const allTags = useMemo(() => [...new Set(chapters.flatMap(c => c.tags || []))], [chapters])
  const allPresets = useMemo(() => [...presets, ...viewerPresets.filter(vp => vp.mediaId === media.id)], [presets, viewerPresets, media.id])
  const sortedChapters = useMemo(() => [...chapters].sort((a, b) => (a.startTime ?? a.time ?? 0) - (b.startTime ?? b.time ?? 0)), [chapters])
  const sortedAnnotations = useMemo(() => [...annotations].sort((a, b) => a.time - b.time), [annotations])
  const layerNums = useMemo(() => [...new Set(chapters.map(c => c.layer || 0))].sort(), [chapters])
  const hasLayers = layerNums.length > 1

  const sortedEpisodeComments = useMemo(() => [...comments].sort((a, b) => {
    if (a.time != null && b.time != null) return a.time - b.time
    if (a.time != null) return -1
    if (b.time != null) return 1
    return a.timestamp.localeCompare(b.timestamp)
  }), [comments])
  const timestampComments = useMemo(() => sortedEpisodeComments.filter(c => c.time != null), [sortedEpisodeComments])
  const tagList = useMemo(() => {
    const s = new Set(allTags)
    tagComments.forEach(tc => s.add(tc.tagRef))
    return [...s]
  }, [allTags, tagComments])

  const commentary = media.commentary || []
  const sortedCommentary = useMemo(() => [...commentary].sort((a, b) => (parseTime(a.time) || 0) - (parseTime(b.time) || 0)), [commentary])
  const annotationsWithLinks = useMemo(() => annotations.filter(a => a.link), [annotations])

  const pct = duration ? (currentTime / duration) * 100 : 0
  const MediaEl = media.fileType === 'video' ? 'video' : 'audio'

  const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12 }
  const fLabel = { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 80 }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function controversial(opt) {
    const mn = Math.min(opt.ratings.up, opt.ratings.down)
    const mx = Math.max(opt.ratings.up, opt.ratings.down) || 1
    return mn / mx
  }

  function resolveDefaultOption(branch) {
    // Check content preferences first — prioritized tags steer the choice
    const prioritized = prefOrder.filter(tag => contentPrefs[tag] === 'prioritize')
    if (prioritized.length > 0) {
      const skipSet = new Set(Object.entries(contentPrefs).filter(([, v]) => v === 'skip').map(([k]) => k))
      const eligible = branch.options.filter(o => !(o.tags || []).some(t => skipSet.has(t)))
      // Find options that carry a prioritized tag (in order of prefOrder rank)
      for (const tag of prioritized) {
        const hit = eligible.find(o => (o.tags || []).includes(tag))
        if (hit) return hit
      }
      if (eligible.length > 0) return eligible[0]
    }
    const preset = allPresets.find(p => p.id === activePresetId)
    const rule = preset?.branchDefaults?.[branch.id]
    if (rule === 'highest') return branch.options.reduce((a, b) => b.ratings.up > a.ratings.up ? b : a)
    if (rule === 'worst') return branch.options.reduce((a, b) => b.ratings.down > a.ratings.down ? b : a)
    if (rule === 'controversial') return branch.options.reduce((a, b) => controversial(b) > controversial(a) ? b : a)
    if (rule) return branch.options.find(o => o.id === rule) || branch.options[0]
    return branch.options.find(o => o.id === branch.defaultOptionId) || branch.options[0]
  }

  function applyPreset(preset) {
    setActivePresetId(preset.id)
    setTagFilter(preset.tagFilter || [])
  }

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeAnnotation) return
    const t = setTimeout(() => { setDismissedId(activeAnnotation.id); setActiveAnnotation(null) }, 6000)
    return () => clearTimeout(t)
  }, [activeAnnotation?.id])

  useEffect(() => {
    if (!activeBranch) return
    setBranchCountdown(activeBranch.countdownSecs || 10)
    const id = setInterval(() => {
      setBranchCountdown(n => {
        if (n <= 1) {
          clearInterval(id)
          // Access branch and preset via closure — acceptable for short countdown
          setActiveBranch(ab => {
            if (ab) {
              const opt = resolveDefaultOption(ab)
              if (mediaRef.current && opt) {
                mediaRef.current.currentTime = opt.jumpTo
                mediaRef.current.play().then(() => setPlaying(true)).catch(() => {})
              }
              setRatingPrompt({ branchId: ab.id, optionId: opt?.id })
            }
            return null
          })
          return 0
        }
        return n - 1
      })
    }, 1000)
    branchTimerRef.current = id
    return () => clearInterval(id)
  }, [activeBranch?.id]) // eslint-disable-line

  useEffect(() => {
    if (!ratingPrompt) return
    const t = setTimeout(() => setRatingPrompt(null), 8000)
    return () => clearTimeout(t)
  }, [ratingPrompt?.branchId, ratingPrompt?.optionId])

  useEffect(() => {
    if (!activeCommentary) return
    if (activeCommentary.playback === 'pause' && mediaRef.current) {
      mediaRef.current.pause(); setPlaying(false)
    }
    if (activeCommentary.playback !== 'pause') {
      const t = setTimeout(() => setActiveCommentary(null), 8000)
      return () => clearTimeout(t)
    }
  }, [activeCommentary?.id]) // eslint-disable-line

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleTimeUpdate() {
    const el = mediaRef.current; if (!el) return
    const t = el.currentTime; setCurrentTime(t)
    // Annotations
    const hit = annotations.find(a => Math.abs(a.time - t) < 0.6 && a.id !== dismissedId)
    if (hit && hit.id !== activeAnnotation?.id) setActiveAnnotation(hit)
    else if (!hit) setActiveAnnotation(null)
    // Commentary
    setActiveCommentary(ac => {
      if (!ac) {
        const cmnt = sortedCommentary.find(c => Math.abs((parseTime(c.time) || 0) - t) < 0.6 && c.id !== dismissedCommentaryId)
        if (cmnt) return cmnt
      }
      return ac
    })
    // Branch detection
    setActiveBranch(ab => {
      if (!ab) {
        for (const b of branches) {
          if (Math.abs(t - b.time) < 0.3) {
            el.pause(); setPlaying(false)
            setBranchCountdown(b.countdownSecs || 10)
            return b
          }
        }
      }
      return ab
    })
    // Compilation advance
    if (compilationIdx >= 0 && compilationQueue.length > 0) {
      const seg = compilationQueue[compilationIdx]
      if (seg && seg.mediaId === media.id && t >= seg.segEnd) handleCompilationAdvance()
    }
  }

  function handleBranchChoice(branch, option) {
    clearInterval(branchTimerRef.current)
    setActiveBranch(null)
    if (branch) {
      setLastBranchTime(branch.time)
      setSessionChoices(prev => [...prev, { branchId: branch.id, branchLabel: branch.label, branchTime: branch.time, optionId: option?.id, optionLabel: option?.label, chosenAt: Date.now() }])
    }
    if (option && mediaRef.current) {
      mediaRef.current.currentTime = option.jumpTo
      mediaRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
    if (branch && option) setRatingPrompt({ branchId: branch.id, optionId: option.id })
  }

  function handleCompilationAdvance() {
    setCompilationIdx(prev => {
      const next = prev + 1
      if (next >= compilationQueue.length) return -1
      const seg = compilationQueue[next]
      if (seg.mediaId === media.id && mediaRef.current) {
        mediaRef.current.currentTime = seg.segStart
        mediaRef.current.play().then(() => setPlaying(true)).catch(() => {})
      }
      return next
    })
  }

  function startCompilation(tag) {
    const queue = []
    ;(data.mediaLog || []).forEach(m => {
      ;(m.chapters || []).forEach(seg => {
        if ((seg.tags || []).includes(tag)) {
          queue.push({ mediaId: m.id, segStart: seg.startTime ?? seg.time ?? 0, segEnd: seg.endTime ?? (seg.startTime ?? seg.time ?? 0) + 60, label: `${m.title} — ${seg.label}` })
        }
      })
    })
    if (!queue.length) return
    setCompilationQueue(queue); setCompilationIdx(0); setShowCompilationPicker(false)
    const first = queue[0]
    if (first.mediaId === media.id && mediaRef.current) {
      mediaRef.current.currentTime = first.segStart
      mediaRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  function togglePlay() {
    const el = mediaRef.current; if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  function seekTo(secs) {
    const el = mediaRef.current
    if (!el || !duration) return
    el.currentTime = Math.max(0, Math.min(secs, duration))
  }

  function handleScrubClick(e) {
    if (!scrubRef.current || !duration) return
    const rect = scrubRef.current.getBoundingClientRect()
    seekTo(((e.clientX - rect.left) / rect.width) * duration)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]; if (!file) return
    if (mediaBlobUrls[media.id]) URL.revokeObjectURL(mediaBlobUrls[media.id])
    const url = URL.createObjectURL(file)
    mediaBlobUrls[media.id] = url; setBlobUrl(url)
    const patch = { fileName: file.name, fileType: file.type.startsWith('video') ? 'video' : 'audio' }
    if (data.personalMedia?.some(m => m.id === media.id)) updatePersonalMedia(media.id, patch)
    else if (data.videos?.some(v => v.id === media.id)) updateVideo(media.id, patch)
    else updateMediaFile(media.id, patch)
  }

  function handleAddComment(e) {
    e.preventDefault(); if (!commentText.trim()) return
    addMediaComment(media.id, { text: commentText.trim(), time: pinTime ? currentTime : null })
    setCommentText(''); setPinTime(false)
  }

  function handleAddChapter(e) {
    e.preventDefault()
    const st = parseTime(newChapter.startTime), et = parseTime(newChapter.endTime)
    if (st == null || !newChapter.label.trim()) return
    const tags = newChapter.tags.split(',').map(t => t.trim()).filter(Boolean)
    addMediaChapter(media.id, { startTime: st, endTime: et ?? st + 60, label: newChapter.label.trim(), tags, layer: Number(newChapter.layer) || 0 })
    setNewChapter({ startTime: '', endTime: '', label: '', tags: '', layer: 0 })
  }

  function handleAddAnnotation(e) {
    e.preventDefault()
    const t = parseTime(newAnnotation.time)
    if (t == null || !newAnnotation.title.trim()) return
    addMediaAnnotation(media.id, { time: t, title: newAnnotation.title.trim(), note: newAnnotation.note.trim(), link: newAnnotation.link.trim(), linkType: newAnnotation.linkType })
    setNewAnnotation({ time: '', title: '', note: '', link: '', linkType: 'external' })
  }

  function postCommentToFeed(c) {
    const timeStr = c.time != null ? ` at ${fmtTime(c.time)}` : ''
    addSpacePost({ content: `🎵 [${media.title}]${timeStr}: "${c.text}"` })
    updateMediaEntry(media.id, { comments: comments.map(x => x.id === c.id ? { ...x, postedToFeed: true } : x) })
  }

  function addBranchOption() {
    if (!newBranchOptLabel.trim()) return
    const jumpTo = parseTime(newBranchOptJumpTo) ?? parseTime(newBranchTime) ?? 0
    setNewBranchOptions(prev => [...prev, { id: 'opt' + Date.now(), label: newBranchOptLabel.trim(), jumpTo, tags: [], ratings: { up: 0, down: 0 }, userVote: null }])
    setNewBranchOptLabel(''); setNewBranchOptJumpTo('')
  }

  function handleAddBranch() {
    const t = parseTime(newBranchTime)
    if (t == null || !newBranchLabel.trim() || newBranchOptions.length < 2) return
    addMediaBranch(media.id, { time: t, label: newBranchLabel.trim(), countdownSecs: Number(newBranchSecs) || 10, defaultOptionId: newBranchOptions[0]?.id || '', ratingSort: null, options: newBranchOptions })
    setNewBranchTime(''); setNewBranchLabel(''); setNewBranchSecs(10); setNewBranchOptions([])
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13 }}>◀ Library</button>
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        {allTags.length > 0 && (
          <button onClick={() => setShowCompilationPicker(c => !c)}
            style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>📑 Compile</button>
        )}
        <div style={{ fontWeight: 700, fontSize: 15, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media.title}</div>
        <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{media.creator}</span>
        {media.fileType && (
          <span style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', color: 'var(--text-3)', flexShrink: 0 }}>
            {media.fileType === 'video' ? '🎬 video' : '🎵 audio'}
          </span>
        )}
      </div>

      {/* Compilation picker */}
      {showCompilationPicker && (
        <div style={{ padding: '10px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Build compilation by tag:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => startCompilation(tag)}
                style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '3px 10px', cursor: 'pointer', color: 'var(--text-2)' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compilation status */}
      {compilationIdx >= 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(132,204,22,0.08)', borderBottom: '1px solid rgba(132,204,22,0.2)', fontSize: 12, flexShrink: 0 }}>
          <span>📑 {compilationQueue[compilationIdx]?.label}</span>
          <span style={{ color: 'var(--text-3)' }}>{compilationIdx + 1}/{compilationQueue.length}</span>
          <button onClick={handleCompilationAdvance}
            style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: 'var(--text-2)' }}>Next →</button>
          <button onClick={() => setCompilationIdx(-1)}
            style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ exit</button>
        </div>
      )}

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad">

          {/* Landing screen */}
          {playerPhase === 'landing' && (
            <div style={{ background: 'linear-gradient(135deg, rgba(132,204,22,0.15), rgba(15,23,42,0.95))', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px 24px', marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{media.fileType === 'video' ? '🎬' : '🎵'}</div>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{media.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>{media.creator}</div>
              {allPresets.length > 0 && (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                  {allPresets.map(p => (
                    <button key={p.id} onClick={() => applyPreset(p)}
                      style={{ fontSize: 12, background: activePresetId === p.id ? 'var(--accent)' : 'var(--surface)', color: activePresetId === p.id ? '#0f172a' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 12px', cursor: 'pointer' }}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
                watching: <strong style={{ color: 'var(--text-2)' }}>{allPresets.find(p => p.id === activePresetId)?.label ?? 'default'}</strong>
              </div>
              <button onClick={() => setPlayerPhase('playing')}
                style={{ background: 'var(--accent)', color: '#0f172a', border: 'none', borderRadius: 20, padding: '10px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                ▶ Play
              </button>
            </div>
          )}

          {/* Player area */}
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12, overflow: 'hidden', display: playerPhase === 'landing' ? 'none' : undefined }}>
            {blobUrl ? (
              <MediaEl ref={mediaRef} src={blobUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(mediaRef.current?.duration || 0)}
                onEnded={() => setPlaying(false)}
                onVolumeChange={() => setVolume(mediaRef.current?.volume ?? 1)}
                style={media.fileType === 'video' ? { width: '100%', maxHeight: 280, display: 'block', background: '#000' } : { display: 'none' }} />
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                {media.fileName
                  ? <div style={{ marginBottom: 8 }}>📂 <em>{media.fileName}</em> — re-upload to play</div>
                  : <div style={{ marginBottom: 8 }}>No file loaded</div>}
                <label style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Upload file
                  <input type="file" accept="audio/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            )}

            {/* Annotation overlay */}
            {activeAnnotation && !activeBranch && (
              <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, background: 'rgba(15,23,42,0.95)', border: '1px solid var(--accent)', borderRadius: 8, padding: '10px 14px', zIndex: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{activeAnnotation.title}</div>
                {activeAnnotation.note && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{activeAnnotation.note}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
                  {activeAnnotation.link && (
                    <a href={activeAnnotation.link} target={activeAnnotation.linkType === 'external' ? '_blank' : undefined} rel="noreferrer"
                      style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                      {activeAnnotation.linkType === 'external' ? '↗ Open link' : '→ Go to'}
                    </a>
                  )}
                  <button onClick={() => { setDismissedId(activeAnnotation.id); setActiveAnnotation(null) }}
                    style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', padding: 0 }}>✕</button>
                </div>
              </div>
            )}

            {/* Branch popup overlay */}
            {activeBranch && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{activeBranch.label}</div>
                  <button onClick={() => setBookmarkedBranchIds(prev => {
                    const next = new Set(prev)
                    next.has(activeBranch.id) ? next.delete(activeBranch.id) : next.add(activeBranch.id)
                    return next
                  })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: bookmarkedBranchIds.has(activeBranch.id) ? '#f59e0b' : 'var(--text-3)' }}>
                    {bookmarkedBranchIds.has(activeBranch.id) ? '⭐' : '☆'}
                  </button>
                </div>
                <BranchCountdownRing secs={branchCountdown} total={activeBranch.countdownSecs || 10} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {activeBranch.options.map(opt => {
                    const c = controversial(opt)
                    return (
                      <button key={opt.id} onClick={() => handleBranchChoice(activeBranch, opt)}
                        style={{ background: 'var(--surface)', border: '2px solid var(--accent)', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', minWidth: 130, textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                          ▲{opt.ratings.up} · ▼{opt.ratings.down}{c > 0.4 ? ' 🔥' : ''}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  Auto: "{resolveDefaultOption(activeBranch)?.label}" in {branchCountdown}s
                </div>
              </div>
            )}

            {/* Commentary overlay */}
            {activeCommentary && !activeBranch && (
              <div style={{ position: 'absolute', bottom: 50, left: 8, right: 8, background: 'rgba(30,41,59,0.97)', border: '1px solid #7c6af7', borderRadius: 8, padding: '10px 14px', zIndex: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, background: '#7c6af7', color: '#fff', borderRadius: 8, padding: '1px 7px' }}>🎙 Commentary</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{fmtTime(parseTime(activeCommentary.time) || 0)}</span>
                </div>
                <div style={{ fontSize: 13, color: '#f1f5f9' }}>{activeCommentary.text}</div>
                {activeCommentary.playback === 'pause' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => {
                      setDismissedCommentaryId(activeCommentary.id)
                      setActiveCommentary(null)
                      if (mediaRef.current) { mediaRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
                    }} style={{ fontSize: 11, background: 'var(--accent)', color: '#0f172a', border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>▶ Resume</button>
                    <button onClick={() => { setDismissedCommentaryId(activeCommentary.id); setActiveCommentary(null) }}
                      style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>✕ dismiss</button>
                  </div>
                )}
              </div>
            )}

            {/* Rating prompt */}
            {ratingPrompt && (
              <div style={{ position: 'absolute', bottom: 60, right: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', zIndex: 15, fontSize: 12 }}>
                <span style={{ marginRight: 8, color: 'var(--text-2)' }}>Rate this take:</span>
                <button onClick={() => { rateBranchOption(media.id, ratingPrompt.branchId, ratingPrompt.optionId, 'up'); setRatingPrompt(null) }}
                  style={{ marginRight: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>▲ Good</button>
                <button onClick={() => { rateBranchOption(media.id, ratingPrompt.branchId, ratingPrompt.optionId, 'down'); setRatingPrompt(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>▼ Weak</button>
                <button onClick={() => setRatingPrompt(null)}
                  style={{ marginLeft: 8, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>skip</button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 10 }}>

            {/* Prefs toggle row */}
            {allTags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showPrefs ? 0 : 8 }}>
                <button onClick={() => setShowPrefs(p => !p)}
                  style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 9px', cursor: 'pointer', color: 'var(--text-3)' }}>
                  {showPrefs ? '▾' : '▸'} ⚙ Prefs
                </button>
                {lastBranchTime != null && (
                  <button onClick={() => seekTo(lastBranchTime)}
                    style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 9px', cursor: 'pointer', color: 'var(--accent)' }}>
                    ↩ Replay
                  </button>
                )}
              </div>
            )}

            {/* Content preferences panel */}
            {showPrefs && allTags.length > 0 && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Content Preferences</div>
                {allTags.map(tag => {
                  const pref = contentPrefs[tag] || 'default'
                  return (
                    <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: 'var(--accent)', color: '#0f172a', borderRadius: 8, padding: '1px 7px', flexShrink: 0 }}>#{tag}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {['default', 'prioritize', 'skip'].map(v => (
                          <button key={v} onClick={() => {
                            setContentPrefs(cp => {
                              const next = { ...cp }
                              if (v === 'default') delete next[tag]
                              else next[tag] = v
                              return next
                            })
                            if (v === 'prioritize') setPrefOrder(po => po.includes(tag) ? po : [...po, tag])
                            if (v !== 'prioritize') setPrefOrder(po => po.filter(t => t !== tag))
                          }} style={{ fontSize: 10, background: pref === v ? (v === 'prioritize' ? 'var(--accent)' : v === 'skip' ? '#ef4444' : 'var(--surface-2)') : 'var(--bg)', color: pref === v ? (v === 'skip' ? '#fff' : '#0f172a') : 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 7px', cursor: 'pointer' }}>
                            {v === 'default' ? 'Default' : v === 'prioritize' ? '↑ Prioritize' : '✕ Skip'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {prefOrder.length > 1 && (
                  <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Prioritized order:</div>
                    {prefOrder.map((tag, i) => (
                      <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: 'var(--accent)', minWidth: 14 }}>{i + 1}.</span>
                        <span style={{ fontSize: 11, flex: 1 }}>#{tag}</span>
                        <button onClick={() => setPrefOrder(po => { const a = [...po]; if (i > 0) { [a[i-1],a[i]]=[a[i],a[i-1]] } return a })} disabled={i === 0} style={{ fontSize: 12, background: 'none', border: 'none', cursor: i===0?'default':'pointer', color: 'var(--text-3)', opacity: i===0?0.3:1 }}>↑</button>
                        <button onClick={() => setPrefOrder(po => { const a = [...po]; if (i < a.length-1) { [a[i],a[i+1]]=[a[i+1],a[i]] } return a })} disabled={i === prefOrder.length-1} style={{ fontSize: 12, background: 'none', border: 'none', cursor: i===prefOrder.length-1?'default':'pointer', color: 'var(--text-3)', opacity: i===prefOrder.length-1?0.3:1 }}>↓</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preset selector */}
            {allPresets.length > 0 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Preset:</span>
                <button onClick={() => { setActivePresetId(null); setTagFilter([]) }}
                  style={{ fontSize: 10, background: !activePresetId ? 'var(--accent)' : 'var(--bg)', color: !activePresetId ? '#0f172a' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 9px', cursor: 'pointer' }}>
                  ▶ Default
                </button>
                {allPresets.map(p => (
                  <button key={p.id} onClick={() => applyPreset(p)}
                    style={{ fontSize: 10, background: activePresetId === p.id ? 'var(--accent)' : 'var(--bg)', color: activePresetId === p.id ? '#0f172a' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 9px', cursor: 'pointer' }}>
                    {p.icon} {p.label}
                  </button>
                ))}
                <button onClick={() => setViewerPresetForm({ label: '', icon: '🎭', tagFilter: [...tagFilter], branchDefaults: {} })}
                  style={{ fontSize: 10, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>+ My preset</button>
              </div>
            )}

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Filter:</span>
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setTagFilter(f => f.includes(tag) ? f.filter(t => t !== tag) : [...f, tag])}
                    style={{ fontSize: 10, background: tagFilter.includes(tag) ? 'var(--accent)' : 'var(--bg)', color: tagFilter.includes(tag) ? '#0f172a' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', cursor: 'pointer' }}>
                    {tag}
                  </button>
                ))}
                {tagFilter.length > 0 && (
                  <button onClick={() => setTagFilter([])} style={{ fontSize: 10, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ clear</button>
                )}
              </div>
            )}

            {/* Playback row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <button onClick={togglePlay} disabled={!blobUrl}
                style={{ background: 'var(--accent)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: blobUrl ? 'pointer' : 'default', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {playing ? '⏸' : '▶'}
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, minWidth: 36 }}>{fmtTime(currentTime)}</span>

              {/* Scrubber */}
              <div ref={scrubRef} onClick={handleScrubClick} style={{ flex: 1, cursor: 'pointer', position: 'relative' }}>
                {showLayers && hasLayers ? (
                  <div>
                    {layerNums.map(layerNum => (
                      <div key={layerNum} style={{ position: 'relative', height: 12, marginBottom: 2, background: 'var(--bg)', borderRadius: 3 }}>
                        {chapters.filter(c => (c.layer || 0) === layerNum).map(seg => {
                          const st = seg.startTime ?? seg.time ?? 0
                          const et = seg.endTime ?? st + 60
                          const l = duration ? (st / duration * 100) : 0
                          const w = duration ? ((et - st) / duration * 100) : 0
                          const isActive = tagFilter.length === 0 || (seg.tags || []).some(t => tagFilter.includes(t))
                          return (
                            <div key={seg.id} title={seg.label}
                              style={{ position: 'absolute', left: `${l}%`, width: `${w}%`, height: '100%', background: 'var(--accent)', opacity: isActive ? 0.8 : 0.18, borderRadius: 2, overflow: 'hidden' }}>
                              {w > 5 && <span style={{ fontSize: 7, paddingLeft: 3, color: '#0f172a', lineHeight: '12px', display: 'block', whiteSpace: 'nowrap' }}>{seg.label}</span>}
                            </div>
                          )
                        })}
                        {layerNum === 0 && branches.map(b => (
                          <div key={b.id} title={b.label}
                            style={{ position: 'absolute', left: `${duration ? b.time / duration * 100 : 0}%`, top: -2, color: 'var(--accent)', fontSize: 10, transform: 'translateX(-50%)', pointerEvents: 'none' }}>◆</div>
                        ))}
                        <div style={{ position: 'absolute', left: `${pct}%`, top: 0, width: 2, height: '100%', background: '#fff', zIndex: 6, pointerEvents: 'none' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, position: 'relative' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, pointerEvents: 'none' }} />
                    {duration > 0 && branches.map(b => (
                      <div key={b.id} title={b.label}
                        style={{ position: 'absolute', left: `${b.time / duration * 100}%`, top: -3, color: 'var(--accent)', fontSize: 10, transform: 'translateX(-50%)', pointerEvents: 'none' }}>◆</div>
                    ))}
                    {duration > 0 && sortedAnnotations.map(an => (
                      <div key={an.id} title={an.title}
                        style={{ position: 'absolute', bottom: -2, left: `${(an.time / duration) * 100}%`, width: 2, height: 10, background: 'var(--accent)', borderRadius: 1, opacity: 0.6, transform: 'translateX(-50%)', pointerEvents: 'none' }} />
                    ))}
                  </div>
                )}
              </div>

              <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, minWidth: 36, textAlign: 'right' }}>{fmtTime(duration)}</span>
              <input type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => { const v = Number(e.target.value); setVolume(v); if (mediaRef.current) mediaRef.current.volume = v }}
                style={{ width: 60, accentColor: 'var(--accent)' }} title="Volume" />
              {/* Preset pill */}
              <span style={{ fontSize: 10, color: 'var(--text-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', flexShrink: 0 }}>
                ● {allPresets.find(p => p.id === activePresetId)?.label ?? 'default'}
              </span>
            </div>

            {/* Chapter chips + layer toggle */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {sortedChapters.map(ch => {
                const st = ch.startTime ?? ch.time ?? 0
                const isActive = tagFilter.length === 0 || (ch.tags || []).some(t => tagFilter.includes(t))
                return (
                  <button key={ch.id} onClick={() => seekTo(st)}
                    style={{ fontSize: 11, background: 'var(--bg)', border: `1px solid ${isActive && tagFilter.length > 0 ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '2px 9px', color: isActive || tagFilter.length === 0 ? 'var(--text-2)' : 'var(--text-3)', cursor: 'pointer', opacity: isActive || tagFilter.length === 0 ? 1 : 0.4 }}>
                    {ch.label}
                  </button>
                )
              })}
              {hasLayers && (
                <button onClick={() => setShowLayers(l => !l)}
                  style={{ fontSize: 10, background: showLayers ? 'var(--accent)' : 'var(--bg)', color: showLayers ? '#0f172a' : 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 9px', cursor: 'pointer' }}>
                  {showLayers ? '▦ Layers' : '▤ Layers'}
                </button>
              )}
            </div>

            {/* Branch bookmarks */}
            {bookmarkedBranchIds.size > 0 && (
              <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>⭐ Bookmarked branches</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {branches.filter(b => bookmarkedBranchIds.has(b.id)).map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 9px' }}>
                      <span style={{ fontSize: 11 }}>{b.label}</span>
                      <button onClick={() => seekTo(b.time)} style={{ fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0 }}>→ Jump</button>
                      <button onClick={() => setBookmarkedBranchIds(prev => { const n = new Set(prev); n.delete(b.id); return n })} style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { id: 'comments', label: `💬 Comments (${comments.length + tagComments.length})` },
              { id: 'annotations', label: `📍 Annotations (${annotations.length})` },
              { id: 'story', label: '🗺 Story' },
              { id: 'history', label: `📖 History (${sessionChoices.length})` },
              { id: 'manage', label: '⚙ Manage' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setPlayerTab(tab.id)}
                style={{ background: 'none', border: 'none', borderBottom: playerTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent', color: playerTab === tab.id ? 'var(--accent)' : 'var(--text-3)', padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontWeight: playerTab === tab.id ? 700 : 400 }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Comments tab ── */}
          {playerTab === 'comments' && (
            <div>
              {/* Sub-tab bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
                {[['episode', '📺 Episode'], ['timestamp', '⏱ Timestamp'], ['tag', '🏷 Tag'], ['links', `🔗 Links (${annotationsWithLinks.length})`]].map(([k, label]) => (
                  <button key={k} onClick={() => { setCommentTab(k); setActiveTagThread(null); setActiveLinkThread(null) }}
                    style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', borderBottom: commentTab === k ? '2px solid var(--accent)' : '2px solid transparent', color: commentTab === k ? 'var(--accent)' : 'var(--text-3)' }}>
                    {label}
                  </button>
                ))}
              </div>

              {commentTab === 'episode' && (
                <div>
                  {sortedEpisodeComments.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>No comments yet.</div>}
                  {sortedEpisodeComments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <Initials name={c.authorName} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{c.authorName}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>@{c.authorHandle}</span>
                          {c.time != null && (
                            <button onClick={() => seekTo(c.time)}
                              style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 6px', color: 'var(--accent)', cursor: 'pointer' }}>
                              {fmtTime(c.time)}
                            </button>
                          )}
                          <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{c.text}</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
                          {!c.postedToFeed && c.authorHandle === 'jordan' && (
                            <button onClick={() => postCommentToFeed(c)} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>Post to SPACE →</button>
                          )}
                          {c.postedToFeed && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>✓ Posted to SPACE</span>}
                          {c.authorHandle === 'jordan' && (
                            <button onClick={() => deleteMediaComment(media.id, c.id)} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>✕</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={handleAddComment} style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment…" rows={2}
                      style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
                      <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={pinTime} onChange={e => setPinTime(e.target.checked)} />
                        📍 Pin to {fmtTime(currentTime) || '0:00'}
                      </label>
                      <button type="submit" style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                    </div>
                  </form>
                </div>
              )}

              {commentTab === 'timestamp' && (
                <div>
                  {timestampComments.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No timestamp comments yet.</div>}
                  {timestampComments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <button onClick={() => seekTo(c.time)}
                        style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 10, padding: '2px 7px', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}>
                        {fmtTime(c.time)}
                      </button>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.authorName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>@{c.authorHandle}</span>
                        <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {commentTab === 'tag' && (
                <div>
                  {!activeTagThread ? (
                    <div>
                      {tagList.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No tags available.</div>}
                      {tagList.map(tag => {
                        const count = tagComments.filter(tc => tc.tagRef === tag).length
                        return (
                          <div key={tag} onClick={() => setActiveTagThread(tag)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface)', borderRadius: 6, marginBottom: 6, cursor: 'pointer' }}>
                            <span style={{ fontSize: 12, background: 'var(--accent)', color: '#0f172a', borderRadius: 8, padding: '1px 7px' }}>#{tag}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{count} comment{count !== 1 ? 's' : ''}</span>
                            <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 12 }}>›</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setActiveTagThread(null)} style={{ fontSize: 12, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, padding: 0 }}>← Back to tags</button>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>#{activeTagThread}</div>
                      {tagComments.filter(tc => tc.tagRef === activeTagThread).map(tc => (
                        <div key={tc.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                          <Initials name={tc.authorName} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{tc.authorName}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>{tc.text}</div>
                            {tc.authorHandle === 'jordan' && (
                              <button onClick={() => deleteTagComment(media.id, tc.id)} style={{ fontSize: 11, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, marginTop: 4 }}>✕</button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                        <textarea value={tagCommentText} onChange={e => setTagCommentText(e.target.value)}
                          placeholder={`Comment on #${activeTagThread}…`} rows={2}
                          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                        <button onClick={() => {
                          if (!tagCommentText.trim()) return
                          addTagComment(media.id, { tagRef: activeTagThread, text: tagCommentText.trim(), postedToFeed: false })
                          setTagCommentText('')
                        }} style={{ marginTop: 6, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {commentTab === 'links' && (
                <div>
                  {annotationsWithLinks.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No annotations with links yet.</div>}
                  {annotationsWithLinks.map(a => {
                    const isOpen = activeLinkThread === a.id
                    const linkComments = a.linkComments || []
                    return (
                      <div key={a.id} style={{ marginBottom: 10, background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <div onClick={() => setActiveLinkThread(isOpen ? null : a.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }}>
                          <button onClick={e => { e.stopPropagation(); seekTo(a.time) }}
                            style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 6px', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}>
                            {fmtTime(a.time)}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{a.title}</div>
                            <a href={a.link} target={a.linkType === 'external' ? '_blank' : undefined} rel="noreferrer" onClick={e => e.stopPropagation()}
                              style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
                              {a.linkType === 'external' ? '↗ ' : '→ '}{a.link.replace(/^https?:\/\//, '').slice(0, 40)}
                            </a>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{linkComments.length} {isOpen ? '▾' : '▸'}</span>
                        </div>
                        {isOpen && (
                          <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px' }}>
                            {linkComments.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>No comments yet.</div>}
                            {linkComments.map(lc => (
                              <div key={lc.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <Initials name={lc.authorName} size={24} />
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600 }}>{lc.authorName}</span>
                                  <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6 }}>{new Date(lc.ts).toLocaleDateString()}</span>
                                  <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 2 }}>{lc.text}</div>
                                  {lc.authorHandle === data.user.handle && (
                                    <button onClick={() => deleteLinkComment(media.id, a.id, lc.id)} style={{ fontSize: 10, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, marginTop: 2 }}>✕</button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input value={linkCommentText} onChange={e => setLinkCommentText(e.target.value)}
                                placeholder="Add a comment on this link…"
                                style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 12 }}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && linkCommentText.trim()) { e.preventDefault(); addLinkComment(media.id, a.id, { text: linkCommentText.trim() }); setLinkCommentText('') } }} />
                              <button onClick={() => { if (!linkCommentText.trim()) return; addLinkComment(media.id, a.id, { text: linkCommentText.trim() }); setLinkCommentText('') }}
                                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Story tab ── */}
          {playerTab === 'story' && (
            <div>
              {branches.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No branch points in this media.</div>}
              {[...branches].sort((a, b) => a.time - b.time).map(b => {
                const takenOptId = sessionChoices.filter(sc => sc.branchId === b.id).slice(-1)[0]?.optionId
                return (
                  <div key={b.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: 'var(--accent)', fontSize: 16 }}>◆</span>
                      <button onClick={() => seekTo(b.time)} style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 10, padding: '1px 6px', color: 'var(--accent)', cursor: 'pointer' }}>{fmtTime(b.time)}</button>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{b.label}</span>
                    </div>
                    <div style={{ marginLeft: 28 }}>
                      {b.options.map(opt => {
                        const taken = opt.id === takenOptId
                        return (
                          <div key={opt.id} onClick={() => seekTo(opt.jumpTo)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: taken ? 'rgba(132,204,22,0.1)' : 'var(--surface)', borderRadius: 6, marginBottom: 4, border: `1px solid ${taken ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer' }}>
                            <span style={{ fontSize: 14, color: taken ? 'var(--accent)' : 'var(--text-3)' }}>{taken ? '■' : '○'}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 12, fontWeight: taken ? 700 : 400 }}>{opt.label}</span>
                              <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 8 }}>→ {fmtTime(opt.jumpTo)}</span>
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>▲{opt.ratings.up} ▼{opt.ratings.down}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── History tab ── */}
          {playerTab === 'history' && (
            <div>
              {sessionChoices.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No choices made this session yet.</div>}
              {[...sessionChoices].reverse().map((sc, i) => {
                const elapsed = Date.now() - sc.chosenAt
                const relTime = elapsed < 60000 ? 'just now' : elapsed < 3600000 ? `${Math.floor(elapsed / 60000)} min ago` : `${Math.floor(elapsed / 3600000)}h ago`
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--surface)', borderRadius: 6, marginBottom: 8, border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{sc.branchLabel}</div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>→ {sc.optionLabel}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{relTime}</div>
                    </div>
                    <button onClick={() => seekTo(sc.branchTime)}
                      style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-2)', flexShrink: 0 }}>
                      ↩ Jump
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Annotations tab ── */}
          {playerTab === 'annotations' && (
            <div>
              {sortedAnnotations.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>No annotations yet.</div>}
              {sortedAnnotations.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start', background: 'var(--surface)', borderRadius: 6, padding: '8px 10px' }}>
                  <button onClick={() => seekTo(a.time)}
                    style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 7px', color: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }}>
                    {fmtTime(a.time)}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                    {a.note && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{a.note}</div>}
                    {a.link && (
                      <a href={a.link} target={a.linkType === 'external' ? '_blank' : undefined} rel="noreferrer"
                        style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginTop: 3 }}>
                        {a.linkType === 'external' ? '↗ ' : '→ '}{a.link.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                  <button onClick={() => deleteMediaAnnotation(media.id, a.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}
              <form onSubmit={handleAddAnnotation} style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <label style={fLabel}>Time (M:SS)
                  <input value={newAnnotation.time} onChange={e => setNewAnnotation(p => ({ ...p, time: e.target.value }))}
                    placeholder={fmtTime(currentTime) || '0:00'} style={iStyle} />
                </label>
                <label style={{ ...fLabel, flex: 2, minWidth: 140 }}>Title *
                  <input value={newAnnotation.title} onChange={e => setNewAnnotation(p => ({ ...p, title: e.target.value }))} required style={iStyle} />
                </label>
                <label style={{ ...fLabel, flex: 2, minWidth: 140 }}>Note
                  <input value={newAnnotation.note} onChange={e => setNewAnnotation(p => ({ ...p, note: e.target.value }))} style={iStyle} />
                </label>
                <label style={{ ...fLabel, flex: 2, minWidth: 160 }}>Link URL
                  <input value={newAnnotation.link} onChange={e => setNewAnnotation(p => ({ ...p, link: e.target.value }))} placeholder="https://…" style={iStyle} />
                </label>
                <label style={fLabel}>Type
                  <select value={newAnnotation.linkType} onChange={e => setNewAnnotation(p => ({ ...p, linkType: e.target.value }))} style={iStyle}>
                    <option value="external">External</option>
                    <option value="internal">Internal</option>
                  </select>
                </label>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-end' }}>Add</button>
                <button type="button" onClick={() => seekTo(parseTime(newAnnotation.time) ?? currentTime)}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', alignSelf: 'flex-end' }}>Preview ▶</button>
              </form>
            </div>
          )}

          {/* ── Manage tab ── */}
          {playerTab === 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* File */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Media File</div>
                {media.fileName && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Current: {media.fileName}</div>}
                <label style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                  {blobUrl ? 'Replace file' : 'Upload file'}
                  <input type="file" accept="audio/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Chapters */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Chapters / Segments</div>
                {sortedChapters.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>No chapters yet.</div>}
                {sortedChapters.map(ch => (
                  <div key={ch.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--accent)', minWidth: 90, flexShrink: 0 }}>
                      {fmtTime(ch.startTime ?? ch.time ?? 0)}–{fmtTime(ch.endTime ?? (ch.startTime ?? ch.time ?? 0) + 60)}
                    </span>
                    <input defaultValue={ch.label} onBlur={e => updateMediaChapter(media.id, ch.id, { label: e.target.value })}
                      style={{ ...iStyle, flex: 1 }} />
                    {(ch.tags || []).length > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{(ch.tags || []).join(', ')}</span>}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>L{ch.layer || 0}</span>
                    <button onClick={() => deleteMediaChapter(media.id, ch.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
                <form onSubmit={handleAddChapter} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  <input value={newChapter.startTime} onChange={e => setNewChapter(p => ({ ...p, startTime: e.target.value }))} placeholder="Start M:SS" style={{ ...iStyle, width: 80 }} />
                  <input value={newChapter.endTime} onChange={e => setNewChapter(p => ({ ...p, endTime: e.target.value }))} placeholder="End M:SS" style={{ ...iStyle, width: 80 }} />
                  <input value={newChapter.label} onChange={e => setNewChapter(p => ({ ...p, label: e.target.value }))} placeholder="Label" style={{ ...iStyle, flex: 1, minWidth: 90 }} />
                  <input value={newChapter.tags} onChange={e => setNewChapter(p => ({ ...p, tags: e.target.value }))} placeholder="tags (comma)" style={{ ...iStyle, width: 110 }} />
                  <select value={newChapter.layer} onChange={e => setNewChapter(p => ({ ...p, layer: Number(e.target.value) }))} style={iStyle}>
                    {[0, 1, 2].map(l => <option key={l} value={l}>L{l}</option>)}
                  </select>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                </form>
              </div>

              {/* Branches */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Branch Points</div>
                {branches.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>No branches yet.</div>}
                {branches.map(b => (
                  <div key={b.id} style={{ background: 'var(--surface)', borderRadius: 6, padding: '8px 10px', marginBottom: 6, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{fmtTime(b.time)} — {b.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.options.length} options · {b.countdownSecs}s countdown</div>
                    {b.options.map(o => (
                      <div key={o.id} style={{ fontSize: 11, marginLeft: 12, marginTop: 3, color: 'var(--text-2)' }}>
                        → {o.label} (→{fmtTime(o.jumpTo)}) · ▲{o.ratings.up} ▼{o.ratings.down}
                      </div>
                    ))}
                    <button onClick={() => deleteMediaBranch(media.id, b.id)}
                      style={{ fontSize: 10, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>✕ delete</button>
                  </div>
                ))}
                <div style={{ background: 'var(--surface)', borderRadius: 6, padding: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Add Branch</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <input value={newBranchTime} onChange={e => setNewBranchTime(e.target.value)} placeholder="Time M:SS" style={{ ...iStyle, width: 80 }} />
                    <input value={newBranchLabel} onChange={e => setNewBranchLabel(e.target.value)} placeholder="Label" style={{ ...iStyle, flex: 1 }} />
                    <input value={newBranchSecs} onChange={e => setNewBranchSecs(e.target.value)} type="number" placeholder="Secs" style={{ ...iStyle, width: 55 }} />
                  </div>
                  {newBranchOptions.map((o, i) => (
                    <div key={o.id} style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 8, marginBottom: 2 }}>{i + 1}. {o.label} → {fmtTime(o.jumpTo)}</div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input value={newBranchOptLabel} onChange={e => setNewBranchOptLabel(e.target.value)} placeholder="Option label" style={{ ...iStyle, flex: 1 }} />
                    <input value={newBranchOptJumpTo} onChange={e => setNewBranchOptJumpTo(e.target.value)} placeholder="Jump M:SS" style={{ ...iStyle, width: 80 }} />
                    <button onClick={addBranchOption}
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>+ Option</button>
                  </div>
                  <button onClick={handleAddBranch} disabled={newBranchOptions.length < 2}
                    style={{ marginTop: 8, background: newBranchOptions.length >= 2 ? 'var(--accent)' : 'var(--surface)', color: newBranchOptions.length >= 2 ? '#fff' : 'var(--text-3)', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: newBranchOptions.length >= 2 ? 'pointer' : 'default' }}>
                    Save Branch
                  </button>
                </div>
              </div>

              {/* Creator presets */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Creator Presets</div>
                {presets.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>No presets yet.</div>}
                {presets.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--surface)', borderRadius: 6, marginBottom: 4, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{p.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>tags: {p.tagFilter.join(', ') || 'all'}</span>
                    <button onClick={() => deleteMediaPreset(media.id, p.id)} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <input value={newPresetState.icon} onChange={e => setNewPresetState(p => ({ ...p, icon: e.target.value }))} placeholder="🎭" style={{ ...iStyle, width: 48 }} />
                  <input value={newPresetState.label} onChange={e => setNewPresetState(p => ({ ...p, label: e.target.value }))} placeholder="Label" style={{ ...iStyle, flex: 1 }} />
                  <input value={newPresetState.tags} onChange={e => setNewPresetState(p => ({ ...p, tags: e.target.value }))} placeholder="tags (comma)" style={{ ...iStyle, width: 100 }} />
                  <button onClick={() => {
                    if (!newPresetState.label.trim()) return
                    const tags = newPresetState.tags.split(',').map(t => t.trim()).filter(Boolean)
                    addMediaPreset(media.id, { icon: newPresetState.icon.trim() || '🎭', label: newPresetState.label.trim(), tagFilter: tags, branchDefaults: {} })
                    setNewPresetState({ icon: '', label: '', tags: '' })
                  }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                </div>
              </div>

              {/* Commentary tracks */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Commentary</div>
                {commentary.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>No commentary tracks yet.</div>}
                {sortedCommentary.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', background: 'var(--surface)', borderRadius: 6, marginBottom: 4, border: '1px solid var(--border)' }}>
                    <button onClick={() => seekTo(parseTime(c.time) || 0)} style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 6px', color: '#7c6af7', cursor: 'pointer', flexShrink: 0 }}>{c.time}</button>
                    <span style={{ flex: 1, fontSize: 12 }}>{c.text}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{c.playback}</span>
                    <button onClick={() => deleteMediaCommentary(media.id, c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <input value={newCommentary.time} onChange={e => setNewCommentary(p => ({ ...p, time: e.target.value }))} placeholder={`Time (${fmtTime(currentTime) || '0:00'})`} style={{ ...iStyle, width: 80 }} />
                  <input value={newCommentary.text} onChange={e => setNewCommentary(p => ({ ...p, text: e.target.value }))} placeholder="Commentary text…" style={{ ...iStyle, flex: 1, minWidth: 120 }} />
                  <select value={newCommentary.playback} onChange={e => setNewCommentary(p => ({ ...p, playback: e.target.value }))} style={iStyle}>
                    <option value="pause">Pause</option>
                    <option value="overlay">Overlay</option>
                  </select>
                  <button onClick={() => {
                    const t = newCommentary.time || fmtTime(currentTime) || '0:00'
                    if (!newCommentary.text.trim()) return
                    addMediaCommentary(media.id, { time: t, text: newCommentary.text.trim(), playback: newCommentary.playback })
                    setNewCommentary({ time: '', text: '', playback: 'pause' })
                  }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Viewer preset modal */}
      {viewerPresetForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setViewerPresetForm(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, minWidth: 280, maxWidth: 380 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>My Preset</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input value={viewerPresetForm.icon} onChange={e => setViewerPresetForm(p => ({ ...p, icon: e.target.value }))} placeholder="🎭" style={{ ...iStyle, width: 50 }} />
              <input value={viewerPresetForm.label} onChange={e => setViewerPresetForm(p => ({ ...p, label: e.target.value }))} placeholder="Preset name" style={{ ...iStyle, flex: 1 }} />
            </div>
            {allTags.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Tag filter:</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {allTags.map(tag => (
                    <button key={tag}
                      onClick={() => setViewerPresetForm(p => ({ ...p, tagFilter: p.tagFilter.includes(tag) ? p.tagFilter.filter(t => t !== tag) : [...p.tagFilter, tag] }))}
                      style={{ fontSize: 10, background: viewerPresetForm.tagFilter.includes(tag) ? 'var(--accent)' : 'var(--bg)', color: viewerPresetForm.tagFilter.includes(tag) ? '#0f172a' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', cursor: 'pointer' }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
            {branches.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Branch routing:</div>
                {branches.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, flex: 1 }}>{b.label}</span>
                    <select value={viewerPresetForm.branchDefaults[b.id] || ''}
                      onChange={e => setViewerPresetForm(p => ({ ...p, branchDefaults: { ...p.branchDefaults, [b.id]: e.target.value } }))}
                      style={{ ...iStyle, fontSize: 11 }}>
                      <option value="">Default</option>
                      <option value="highest">Highest rated</option>
                      <option value="worst">Lowest rated</option>
                      <option value="controversial">Most controversial</option>
                      {b.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setViewerPresetForm(null)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                if (!viewerPresetForm.label.trim()) return
                addViewerPreset({ ...viewerPresetForm, mediaId: media.id })
                setViewerPresetForm(null)
              }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Photos tab ────────────────────────────────────────────────────────────────
function PhotosTab() {
  const { data, addPhotoAlbum, deletePhotoAlbum, addPhoto, updatePhoto, deletePhoto } = useStore()
  const albums = data.photoAlbums || []
  const allPhotos = data.photos || []

  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [lightbox, setLightbox] = useState(null) // photo object
  const [showNewAlbum, setShowNewAlbum] = useState(false)
  const [newAlbum, setNewAlbum] = useState({ name: '', emoji: '📷' })
  const [editNote, setEditNote] = useState({}) // {[photoId]: string}
  const [tagInput, setTagInput] = useState({}) // {[photoId]: string}
  const [, forceUpdate] = useState(0)

  const COVER_COLORS = ['#1a3a2a','#1a2a3a','#2a1a3a','#3a2a1a','#1a2a2a','#3a1a2a','#2a2a1a']

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId)
  const albumPhotos = allPhotos.filter(p => p.albumId === selectedAlbumId)

  // Lightbox navigation
  const lightboxIdx = lightbox ? albumPhotos.findIndex(p => p.id === lightbox.id) : -1
  function prevPhoto() { if (lightboxIdx > 0) setLightbox(albumPhotos[lightboxIdx - 1]) }
  function nextPhoto() { if (lightboxIdx < albumPhotos.length - 1) setLightbox(albumPhotos[lightboxIdx + 1]) }

  function handlePhotoUpload(e, photoId) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoBlobUrls[photoId]) URL.revokeObjectURL(photoBlobUrls[photoId])
    const url = URL.createObjectURL(file)
    photoBlobUrls[photoId] = url
    forceUpdate(n => n + 1)
    updatePhoto(photoId, { fileName: file.name })
    e.target.value = ''
  }

  function handleNewAlbumFile(e, photoId) {
    handlePhotoUpload(e, photoId)
  }

  function handleAddPhoto(albumId) {
    addPhoto({ albumId, date: new Date().toISOString().slice(0, 10), note: '', tags: [], location: '', fileName: null })
  }

  function handleSaveNote(photoId) {
    updatePhoto(photoId, { note: editNote[photoId] ?? '' })
    setEditNote(p => { const n = { ...p }; delete n[photoId]; return n })
  }

  function handleAddTag(photoId) {
    const tag = (tagInput[photoId] || '').trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag) return
    const photo = allPhotos.find(p => p.id === photoId)
    if (!photo || (photo.tags || []).includes(tag)) return
    updatePhoto(photoId, { tags: [...(photo.tags || []), tag] })
    setTagInput(p => ({ ...p, [photoId]: '' }))
  }

  function handleRemoveTag(photoId, tag) {
    const photo = allPhotos.find(p => p.id === photoId)
    if (!photo) return
    updatePhoto(photoId, { tags: (photo.tags || []).filter(t => t !== tag) })
  }

  function createAlbum() {
    if (!newAlbum.name.trim()) return
    const color = COVER_COLORS[albums.length % COVER_COLORS.length]
    addPhotoAlbum({ name: newAlbum.name.trim(), emoji: newAlbum.emoji, date: new Date().toISOString().slice(0, 10), coverColor: color })
    setNewAlbum({ name: '', emoji: '📷' })
    setShowNewAlbum(false)
  }

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }

  // ── Album grid view ──
  if (!selectedAlbumId) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Albums</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewAlbum(p => !p)}>+ New album</button>
        </div>

        {showNewAlbum && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
              Emoji
              <input value={newAlbum.emoji} onChange={e => setNewAlbum(p => ({ ...p, emoji: e.target.value }))}
                style={{ ...iStyle, width: 50, textAlign: 'center', fontSize: 18 }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1 }}>
              Album name *
              <input value={newAlbum.name} onChange={e => setNewAlbum(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Summer 2026" autoFocus onKeyDown={e => e.key === 'Enter' && createAlbum()} style={iStyle} />
            </label>
            <button className="btn btn-primary btn-sm" onClick={createAlbum} disabled={!newAlbum.name.trim()}>Create</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNewAlbum(false)}>Cancel</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {albums.map(album => {
            const count = allPhotos.filter(p => p.albumId === album.id).length
            return (
              <div key={album.id} style={cardStyle} onClick={() => setSelectedAlbumId(album.id)}>
                <div style={{ height: 100, background: album.coverColor || '#1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative' }}>
                  {allPhotos.filter(p => p.albumId === album.id && photoBlobUrls[p.id]).slice(0, 1).map(p => (
                    <img key={p.id} src={photoBlobUrls[p.id]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                  ))}
                  <span style={{ position: 'relative', zIndex: 1 }}>{album.emoji}</span>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{album.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{count} photo{count !== 1 ? 's' : ''} · {album.date}</div>
                </div>
              </div>
            )
          })}
          {albums.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No albums yet. Create one to start organizing your photos.
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Photo grid view (inside album) ──
  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setSelectedAlbumId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
          ◀ Albums
        </button>
        <span style={{ color: 'var(--text-3)' }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedAlbum?.emoji} {selectedAlbum?.name}</span>
        <button onClick={() => { if (window.confirm(`Delete album "${selectedAlbum?.name}" and all its photos?`)) { deletePhotoAlbum(selectedAlbumId); setSelectedAlbumId(null) } }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>Delete album</button>
      </div>

      {/* Photo grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
        {albumPhotos.map(photo => (
          <div key={photo.id} style={{ ...cardStyle, cursor: 'default' }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', height: 140, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photoBlobUrls[photo.id] ? (
                <img src={photoBlobUrls[photo.id]} alt={photo.note || ''} onClick={() => setLightbox(photo)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                  <label style={{ background: 'var(--accent)', color: '#fff', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, photo.id)} />
                  </label>
                </div>
              )}
              {photoBlobUrls[photo.id] && (
                <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,.55)', borderRadius: 4, padding: '2px 7px', fontSize: 10, color: '#fff', cursor: 'pointer' }}>
                  ↺
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e, photo.id)} />
                </label>
              )}
              <button onClick={() => deletePhoto(photo.id)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                ✕
              </button>
            </div>
            {/* Info */}
            <div style={{ padding: '8px 10px' }}>
              {editNote[photo.id] !== undefined ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input value={editNote[photo.id]} onChange={e => setEditNote(p => ({ ...p, [photo.id]: e.target.value }))}
                    style={{ ...iStyle, flex: 1, fontSize: 12 }} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveNote(photo.id); if (e.key === 'Escape') setEditNote(p => { const n = { ...p }; delete n[photo.id]; return n }) }} />
                  <button onClick={() => handleSaveNote(photo.id)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 7px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div onClick={() => setEditNote(p => ({ ...p, [photo.id]: photo.note || '' }))}
                  style={{ fontSize: 12, color: photo.note ? 'var(--text-1)' : 'var(--text-3)', cursor: 'text', minHeight: 18 }}>
                  {photo.note || 'Add note…'}
                </div>
              )}
              {photo.location && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>📍 {photo.location}</div>}
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                {(photo.tags || []).map(tag => (
                  <span key={tag} style={{ fontSize: 10, background: 'var(--surface-2)', borderRadius: 8, padding: '1px 6px', color: 'var(--text-3)', cursor: 'pointer' }}
                    onClick={() => handleRemoveTag(photo.id, tag)}>
                    #{tag} ×
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <input value={tagInput[photo.id] || ''} onChange={e => setTagInput(p => ({ ...p, [photo.id]: e.target.value }))}
                    placeholder="+ tag" style={{ ...iStyle, width: 55, fontSize: 10, padding: '1px 5px' }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTag(photo.id) }} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add photo slot */}
        <div onClick={() => handleAddPhoto(selectedAlbumId)}
          style={{ height: 200, border: '2px dashed var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <span style={{ fontSize: 24 }}>+</span>
          <span>Add photo</span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={e => { e.stopPropagation(); prevPhoto() }}
            style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer', display: lightboxIdx > 0 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '85vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {photoBlobUrls[lightbox.id] ? (
              <img src={photoBlobUrls[lightbox.id]} alt={lightbox.note || ''} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
            ) : (
              <div style={{ width: 300, height: 300, background: 'var(--surface)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🖼️</div>
            )}
            <div style={{ textAlign: 'center' }}>
              {lightbox.note && <div style={{ color: '#f1f5f9', fontSize: 14 }}>{lightbox.note}</div>}
              {lightbox.location && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>📍 {lightbox.location}</div>}
              {(lightbox.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
                  {lightbox.tags.map(t => <span key={t} style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '1px 7px' }}>#{t}</span>)}
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#475569' }}>{lightboxIdx + 1} / {albumPhotos.length}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); nextPhoto() }}
            style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer', display: lightboxIdx < albumPhotos.length - 1 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ── Recordings tab ─────────────────────────────────────────────────────────────
const recBlobUrls = {}
const REC_TYPES = [
  { value: 'voice', label: '🎙️ Voice memo' },
  { value: 'video', label: '🎥 Home video' },
  { value: 'clip', label: '✂️ Saved clip' },
  { value: 'screencast', label: '🖥️ Screencast' },
]

function RecordingsTab() {
  const { data, addPersonalMedia, updatePersonalMedia, deletePersonalMedia } = useStore()
  const recordings = data.personalMedia || []

  const [playerRecId, setPlayerRecId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'voice', note: '', tags: '', fileType: 'audio' })
  const [blobUrls, setBlobUrls] = useState({}) // local state for re-render trigger
  const [tagInputs, setTagInputs] = useState({})

  function handleFileUpload(e, recId) {
    const file = e.target.files?.[0]
    if (!file) return
    if (recBlobUrls[recId]) URL.revokeObjectURL(recBlobUrls[recId])
    const url = URL.createObjectURL(file)
    recBlobUrls[recId] = url
    setBlobUrls(p => ({ ...p, [recId]: url }))
    const ft = file.type.startsWith('video') ? 'video' : 'audio'
    updatePersonalMedia(recId, { fileName: file.name, fileType: ft })
    e.target.value = ''
  }

  function handleCreate() {
    if (!form.name.trim()) return
    const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    const ft = ['video', 'screencast'].includes(form.type) ? 'video' : 'audio'
    addPersonalMedia({ name: form.name.trim(), type: form.type, note: form.note, tags, fileType: ft, durationMins: null, fileName: null })
    setForm({ name: '', type: 'voice', note: '', tags: '', fileType: 'audio' })
    setShowForm(false)
  }

  // If player open, show MediaPlayer for that recording
  const playerRec = playerRecId ? recordings.find(r => r.id === playerRecId) : null
  if (playerRec) {
    const mediaObj = {
      ...playerRec, title: playerRec.name, creator: 'Personal',
      chapters: playerRec.chapters || [], annotations: playerRec.annotations || [], comments: playerRec.comments || [],
      _blobUrl: recBlobUrls[playerRecId] || null,
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <MediaPlayer
          media={mediaObj}
          onClose={() => setPlayerRecId(null)}
        />
      </div>
    )
  }

  const typeLabel = Object.fromEntries(REC_TYPES.map(r => [r.value, r.label]))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Personal recordings</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(p => !p)}>+ New recording</button>
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 14 }}>
          <label style={{ ...fLabel, flex: 2, minWidth: 160 }}>
            Name *
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={iStyle} autoFocus placeholder="e.g. Idea brainstorm — April" />
          </label>
          <label style={fLabel}>
            Type
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={iStyle}>
              {REC_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label style={{ ...fLabel, flex: 2, minWidth: 140 }}>
            Note
            <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} style={iStyle} placeholder="What is this?" />
          </label>
          <label style={{ ...fLabel, flex: 1, minWidth: 120 }}>
            Tags (comma-sep)
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} style={iStyle} placeholder="ideas, work, personal" />
          </label>
          <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={!form.name.trim()} style={{ alignSelf: 'flex-end' }}>Add</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} style={{ alignSelf: 'flex-end' }}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recordings.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map(rec => (
          <div key={rec.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{rec.type === 'video' ? '🎥' : rec.type === 'screencast' ? '🖥️' : rec.type === 'clip' ? '✂️' : '🎙️'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{rec.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {rec.date} · {typeLabel[rec.type] ?? rec.type}
                {rec.durationMins ? ` · ${rec.durationMins}min` : ''}
              </div>
              {rec.note && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{rec.note}</div>}
              {(rec.tags || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {rec.tags.map(t => <span key={t} style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '1px 6px', color: 'var(--text-3)' }}>#{t}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              {recBlobUrls[rec.id] ? (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>📂 {rec.fileName?.slice(0, 16)}{(rec.fileName?.length || 0) > 16 ? '…' : ''}</span>
              ) : (
                <label style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', color: 'var(--text-2)', cursor: 'pointer' }}>
                  {rec.fileName ? `↺ Re-upload` : 'Upload'}
                  <input type="file" accept={rec.fileType === 'video' ? 'video/*' : 'audio/*,video/*'} style={{ display: 'none' }} onChange={e => handleFileUpload(e, rec.id)} />
                </label>
              )}
              <button onClick={() => setPlayerRecId(rec.id)} title="Open in player"
                style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '3px 10px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>▶</button>
              <button onClick={() => deletePersonalMedia(rec.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          </div>
        ))}
        {recordings.length === 0 && (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            No recordings yet. Create one and upload a file to play it back.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Videos tab ────────────────────────────────────────────────────────────────
function fmtSecs(s) {
  if (!s) return ''
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function VideoThumb({ src, style }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.currentTime = 1
  }, [src])
  if (!src) return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontSize: 32 }}>🎥</div>
  )
  return (
    <video ref={ref} src={src} preload="metadata" muted playsInline
      onLoadedMetadata={e => { e.target.currentTime = 1 }}
      style={{ ...style, objectFit: 'cover', display: 'block' }} />
  )
}

const VID_COVER_COLORS = ['#1a3a2a','#1a2a3a','#2a1a3a','#3a2a1a','#1a2a2a','#3a1a2a','#2a2a1a']

function VideosTab() {
  const { data, addVideoCollection, deleteVideoCollection, addVideo, updateVideo, deleteVideo } = useStore()
  const collections = data.videoCollections || []
  const allVideos   = data.videos || []

  const [selectedColId, setSelectedColId] = useState(null)
  const [playerVidId,   setPlayerVidId]   = useState(null)
  const [showNewCol,    setShowNewCol]     = useState(false)
  const [newCol,        setNewCol]         = useState({ name: '', emoji: '🎥' })
  const [editNote,      setEditNote]       = useState({})
  const [tagInput,      setTagInput]       = useState({})
  const [, forceUpdate] = useState(0)

  const selectedCol  = collections.find(c => c.id === selectedColId)
  const colVideos    = allVideos.filter(v => v.collectionId === selectedColId)

  // Open in player
  const playerVid = playerVidId ? allVideos.find(v => v.id === playerVidId) : null
  if (playerVid) {
    const mediaObj = {
      ...playerVid,
      id: playerVid.id,
      title: playerVid.note || playerVid.fileName || 'Untitled video',
      creator: 'Personal',
      fileType: 'video',
      chapters: playerVid.chapters || [], annotations: playerVid.annotations || [], comments: playerVid.comments || [],
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <MediaPlayer
          media={{ ...mediaObj, _blobUrl: videoBlobUrls[playerVid.id] }}
          onClose={() => setPlayerVidId(null)}
          _overrideBlobUrl={videoBlobUrls[playerVid.id]}
        />
      </div>
    )
  }

  function handleUpload(e, vidId) {
    const file = e.target.files?.[0]; if (!file) return
    if (videoBlobUrls[vidId]) URL.revokeObjectURL(videoBlobUrls[vidId])
    const url = URL.createObjectURL(file)
    videoBlobUrls[vidId] = url
    updateVideo(vidId, { fileName: file.name, fileType: 'video' })
    forceUpdate(n => n + 1)
    e.target.value = ''
  }

  function handleAddVideo(collectionId) {
    addVideo({ collectionId, date: new Date().toISOString().slice(0, 10), note: '', tags: [], location: '', fileName: null, fileType: 'video' })
  }

  function saveNote(vid) {
    updateVideo(vid.id, { note: editNote[vid.id] ?? vid.note })
    setEditNote(p => { const n = { ...p }; delete n[vid.id]; return n })
  }

  function addTag(vidId) {
    const tag = (tagInput[vidId] || '').trim().toLowerCase().replace(/\s+/g, '-'); if (!tag) return
    const vid = allVideos.find(v => v.id === vidId); if (!vid) return
    if ((vid.tags || []).includes(tag)) return
    updateVideo(vidId, { tags: [...(vid.tags || []), tag] })
    setTagInput(p => ({ ...p, [vidId]: '' }))
  }

  function removeTag(vidId, tag) {
    const vid = allVideos.find(v => v.id === vidId); if (!vid) return
    updateVideo(vidId, { tags: (vid.tags || []).filter(t => t !== tag) })
  }

  function createCollection() {
    if (!newCol.name.trim()) return
    addVideoCollection({ name: newCol.name.trim(), emoji: newCol.emoji, date: new Date().toISOString().slice(0, 10), coverColor: VID_COVER_COLORS[collections.length % VID_COVER_COLORS.length] })
    setNewCol({ name: '', emoji: '🎥' }); setShowNewCol(false)
  }

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer' }
  const thumbStyle = { width: '100%', height: 130 }

  // ── Collection grid ──
  if (!selectedColId) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Collections</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewCol(p => !p)}>+ New collection</button>
      </div>

      {showNewCol && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
            Emoji
            <input value={newCol.emoji} onChange={e => setNewCol(p => ({ ...p, emoji: e.target.value }))} style={{ ...iStyle, width: 50, textAlign: 'center', fontSize: 18 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1 }}>
            Collection name *
            <input value={newCol.name} onChange={e => setNewCol(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Family 2026"
              autoFocus onKeyDown={e => e.key === 'Enter' && createCollection()} style={iStyle} />
          </label>
          <button className="btn btn-primary btn-sm" onClick={createCollection} disabled={!newCol.name.trim()}>Create</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowNewCol(false)}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {collections.map(col => {
          const count = allVideos.filter(v => v.collectionId === col.id).length
          const firstWithBlob = allVideos.filter(v => v.collectionId === col.id && videoBlobUrls[v.id])[0]
          return (
            <div key={col.id} style={cardStyle} onClick={() => setSelectedColId(col.id)}>
              <div style={{ height: 100, background: col.coverColor || '#1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative', overflow: 'hidden' }}>
                {firstWithBlob
                  ? <video src={videoBlobUrls[firstWithBlob.id]} muted playsInline preload="metadata"
                      onLoadedMetadata={e => { e.target.currentTime = 1 }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  : null}
                <span style={{ position: 'relative', zIndex: 1 }}>{col.emoji}</span>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{col.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{count} video{count !== 1 ? 's' : ''} · {col.date}</div>
              </div>
            </div>
          )
        })}
        {collections.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            No collections yet. Create one to start organising your videos.
          </div>
        )}
      </div>
    </div>
  )

  // ── Video grid (inside collection) ──
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setSelectedColId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, padding: 0 }}>◀ Collections</button>
        <span style={{ color: 'var(--text-3)' }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedCol?.emoji} {selectedCol?.name}</span>
        <button onClick={() => { if (window.confirm(`Delete collection "${selectedCol?.name}" and all its videos?`)) { deleteVideoCollection(selectedColId); setSelectedColId(null) } }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>Delete collection</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {colVideos.map(vid => (
          <div key={vid.id} style={{ ...cardStyle, cursor: 'default' }}>
            {/* Thumbnail + play overlay */}
            <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
              <VideoThumb src={videoBlobUrls[vid.id] || null} style={thumbStyle} />
              {/* Play button overlay */}
              <div onClick={() => { if (videoBlobUrls[vid.id]) mediaBlobUrls[vid.id] = videoBlobUrls[vid.id]; setPlayerVidId(vid.id) }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.25)', cursor: 'pointer', opacity: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff' }}>▶</div>
              </div>
              {/* Upload button */}
              {!videoBlobUrls[vid.id] && (
                <label style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Upload video
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleUpload(e, vid.id)} />
                </label>
              )}
              {/* Replace + duration badge */}
              {videoBlobUrls[vid.id] && (
                <label style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,.55)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#fff', cursor: 'pointer' }}>
                  ↺ <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleUpload(e, vid.id)} />
                </label>
              )}
              {vid.durationSecs && (
                <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,.65)', borderRadius: 3, padding: '1px 5px', fontSize: 10, color: '#fff' }}>
                  {fmtSecs(vid.durationSecs)}
                </span>
              )}
              {/* Delete */}
              <button onClick={() => deleteVideo(vid.id)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* Info */}
            <div style={{ padding: '8px 10px' }}>
              {editNote[vid.id] !== undefined ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input value={editNote[vid.id]} onChange={e => setEditNote(p => ({ ...p, [vid.id]: e.target.value }))}
                    style={{ ...iStyle, flex: 1, fontSize: 12 }} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveNote(vid); if (e.key === 'Escape') setEditNote(p => { const n = { ...p }; delete n[vid.id]; return n }) }} />
                  <button onClick={() => saveNote(vid)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 7px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div onClick={() => setEditNote(p => ({ ...p, [vid.id]: vid.note || '' }))}
                  style={{ fontSize: 12, color: vid.note ? 'var(--text-1)' : 'var(--text-3)', cursor: 'text', minHeight: 18, lineHeight: 1.4 }}>
                  {vid.note || 'Add note…'}
                </div>
              )}
              {vid.location && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>📍 {vid.location}</div>}
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                {(vid.tags || []).map(tag => (
                  <span key={tag} onClick={() => removeTag(vid.id, tag)}
                    style={{ fontSize: 10, background: 'var(--surface-2)', borderRadius: 8, padding: '1px 6px', color: 'var(--text-3)', cursor: 'pointer' }}>
                    #{tag} ×
                  </span>
                ))}
                <input value={tagInput[vid.id] || ''} onChange={e => setTagInput(p => ({ ...p, [vid.id]: e.target.value }))}
                  placeholder="+ tag" style={{ ...iStyle, width: 52, fontSize: 10, padding: '1px 5px' }}
                  onKeyDown={e => { if (e.key === 'Enter') addTag(vid.id) }} />
              </div>
            </div>
          </div>
        ))}

        {/* Add video slot */}
        <div onClick={() => handleAddVideo(selectedColId)}
          style={{ height: 220, border: '2px dashed var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <span style={{ fontSize: 24 }}>+</span>
          <span>Add video</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Media page ───────────────────────────────────────────────────────────
const EMPTY = { type: 'Book', title: '', creator: '', status: 'want', rating: null, note: '', date: '' }

export default function Media() {
  const { data, addMediaEntry, updateMediaEntry, deleteMediaEntry,
    updateMediaFile, addMediaChapter, updateMediaChapter, deleteMediaChapter,
    addMediaAnnotation, updateMediaAnnotation, deleteMediaAnnotation,
    addMediaComment, deleteMediaComment, addSpacePost } = useStore()

  const [mainTab, setMainTab] = useState('library')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [playerMediaId, setPlayerMediaId] = useState(null)

  const playerMedia = playerMediaId ? data.mediaLog.find(m => m.id === playerMediaId) : null

  const filtered = useMemo(() => {
    let list = [...data.mediaLog]
    if (filterType !== 'All') list = list.filter(m => m.type === filterType)
    if (filterStatus !== 'All') list = list.filter(m => m.status === filterStatus)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.creator?.toLowerCase().includes(search.toLowerCase()))
    return list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title))
  }, [data.mediaLog, filterType, filterStatus, search])

  const stats = useMemo(() => ({
    books: data.mediaLog.filter(m => m.type === 'Book' && m.status === 'completed').length,
    movies: data.mediaLog.filter(m => m.type === 'Movie' && m.status === 'completed').length,
    albums: data.mediaLog.filter(m => m.type === 'Album' && m.status === 'completed').length,
    want: data.mediaLog.filter(m => m.status === 'want').length,
  }), [data.mediaLog])

  function openNew() { setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) }); setEditId(null); setShowForm(true) }
  function openEdit(m) { setForm({ ...m }); setEditId(m.id); setShowForm(true) }

  function handleSave(e) {
    e.preventDefault()
    if (editId) updateMediaEntry(editId, form)
    else addMediaEntry(form)
    setShowForm(false); setEditId(null)
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  // If player is open, show it full-pane
  if (playerMedia) {
    return (
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <MediaPlayer
          media={playerMedia}
          onClose={() => setPlayerMediaId(null)}
        />
      </div>
    )
  }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🎬</span>
        <div className="topbar-title">Media</div>
        <div className="topbar-sep" />
        {[
          { id: 'library',    label: '📚 Library' },
          { id: 'photos',     label: '🖼️ Photos' },
          { id: 'videos',     label: '🎬 Videos' },
          { id: 'recordings', label: '🎙️ Recordings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMainTab(tab.id)}
            style={{ background: 'none', border: 'none', borderBottom: mainTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent', color: mainTab === tab.id ? 'var(--accent)' : 'var(--text-3)', padding: '0 10px', height: '100%', fontSize: 13, cursor: 'pointer', fontWeight: mainTab === tab.id ? 700 : 400 }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="scroll"><div className="pad">

      {mainTab === 'photos' && <PhotosTab />}
      {mainTab === 'videos' && <VideosTab />}
      {mainTab === 'recordings' && <RecordingsTab />}
      {mainTab === 'library' && (<>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Books Read', value: stats.books, icon: '📚' },
          { label: 'Movies Watched', value: stats.movies, icon: '🎬' },
          { label: 'Albums Logged', value: stats.albums, icon: '🎵' },
          { label: 'Want to Experience', value: stats.want, icon: '🔖' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', minWidth: 120 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{s.icon} {s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', color: 'var(--text-1)', fontSize: 13, width: 180 }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ background: filterType === t ? 'var(--accent)' : 'var(--bg)', color: filterType === t ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '3px 9px', fontSize: 12, cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12 }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer', marginLeft: 'auto' }}>+ Log</button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 14, alignItems: 'flex-end' }}>
          {[
            { key: 'type', label: 'Type', sel: TYPES.slice(1) },
          ].map(fi => (
            <label key={fi.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
              {fi.label}
              <select value={form[fi.key]} onChange={f(fi.key)} style={iStyle}>
                {fi.sel.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 2, minWidth: 160 }}>
            Title *
            <input required value={form.title} onChange={f('title')} style={iStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 130 }}>
            Author / Director / Artist
            <input value={form.creator ?? ''} onChange={f('creator')} style={iStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
            Status
            <select value={form.status} onChange={f('status')} style={iStyle}>
              {STATUSES.slice(1).map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
            Date
            <input type="date" value={form.date ?? ''} onChange={f('date')} style={iStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 2, minWidth: 140 }}>
            Note
            <input value={form.note ?? ''} onChange={f('note')} style={iStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
            Rating
            <Stars n={form.rating} onChange={n => setForm(p => ({ ...p, rating: n }))} />
          </label>
          <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end' }}>{editId ? 'Save' : 'Add'}</button>
          <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', alignSelf: 'flex-end' }}>Cancel</button>
        </form>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 1fr 130px 80px 80px 52px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
          <span>TYPE</span><span>DATE</span><span>TITLE</span><span>CREATOR</span><span>STATUS</span><span>RATING</span><span></span>
        </div>
        {filtered.map(m => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '70px 80px 1fr 130px 80px 80px 52px', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
            <span style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 6px', color: 'var(--text-3)', textAlign: 'center' }}>{m.type}</span>
            <span style={{ color: 'var(--text-3)' }}>{m.date ?? '—'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              {m.note && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.note}</div>}
              {m.fileType && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{m.fileType === 'video' ? '🎬' : '🎵'} {m.fileType}</div>}
            </div>
            <span style={{ color: 'var(--text-2)', fontSize: 12 }}>{m.creator}</span>
            <span style={{ fontSize: 11, color: STATUS_COLOR[m.status] ?? 'var(--text-3)' }}>{STATUS_LABEL[m.status] ?? m.status}</span>
            <Stars n={m.rating} />
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={() => setPlayerMediaId(m.id)} title="Open in player"
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}>▶</button>
              <button onClick={() => openEdit(m)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: '0 2px' }}>✎</button>
              <button onClick={() => deleteMediaEntry(m.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}>✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>Nothing found. Try adjusting filters or log something new.</div>}
      </div>
      </>)}
      </div></div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 13 }
const fLabel = { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }
