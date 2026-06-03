import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'

const MOOD_EMOJIS = ['😞', '😕', '😐', '😊', '😄']


function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function MoodChart({ entry }) {
  if (!entry?.moods?.length) return null
  const pts = entry.moods
  const W = 600; const H = 100; const PAD = 20
  const tMin = 360; const tMax = 1380
  const x = t => PAD + ((t - tMin) / (tMax - tMin)) * (W - PAD * 2)
  const y = m => H - PAD - ((m - 1) / 4) * (H - PAD * 2)

  const points = pts.map(p => {
    const [h, m] = (p.time || '12:00').split(':').map(Number)
    return { ...p, px: x(h * 60 + m), py: y(p.mood) }
  })

  const path = points.map((p, i) => (i === 0 ? `M${p.px},${p.py}` : `L${p.px},${p.py}`)).join(' ')
  const area = `${path} L${points[points.length - 1].px},${H - PAD} L${points[0].px},${H - PAD} Z`
  const hourLabels = [6, 9, 12, 15, 18, 21]

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100 }}>
        {[1,2,3,4,5].map(m => (
          <line key={m} x1={PAD} y1={y(m)} x2={W - PAD} y2={y(m)} stroke="var(--border)" strokeWidth=".5" />
        ))}
        {hourLabels.map(h => (
          <line key={h} x1={x(h * 60)} y1={PAD} x2={x(h * 60)} y2={H - PAD} stroke="var(--border)" strokeWidth=".5" />
        ))}
        {points.length > 1 && <path d={area} fill="rgba(167,139,250,.12)" />}
        {points.length > 1 && <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />}
        {points.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
        ))}
        {hourLabels.map(h => (
          <text key={h} x={x(h * 60)} y={H - 2} textAnchor="middle" fontSize="8" fill="var(--text-3)">
            {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
          </text>
        ))}
        {[1,2,3,4,5].map(m => (
          <text key={m} x={PAD - 4} y={y(m) + 3} textAnchor="end" fontSize="8" fill="var(--text-3)">{m}</text>
        ))}
      </svg>
      {(entry.moments || []).map((mo, i) => {
        const [h, m] = (mo.time || '12:00').split(':').map(Number)
        if (isNaN(h)) return null
        const pct = ((h * 60 + m - 360) / 1020) * 100
        return (
          <div key={i} className="mood-pin" style={{ left: `calc(${pct}% + ${PAD}px)`, top: '50%' }} title={mo.label}>
            {mo.emoji} <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mo.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function starRating(n, current, onClick) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onClick(i)} style={{ cursor: 'pointer', fontSize: 20, color: i <= current ? 'var(--amber)' : 'var(--text-3)' }}>
          {i <= current ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}


// ─── Main Journal component ────────────────────────────────────────────────────

const EMPTY_FORM = { date: '', type: 'nightly', highlight: '', longForm: '', dayRating: 4, moodNow: 3 }

export default function Journal() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { data, addJournalEntry, updateJournalEntry, deleteJournalEntry, shareToSpace, publishJournalEntry } = useStore()
  const { journalEntries, habits, habitLogs } = data

  const eventMode = params.get('mode') === 'reflect'

  const [selectedId, setSelectedId] = useState(null)
  const [showWrite, setShowWrite] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const [publishModal, setPublishModal] = useState(null)
  const [publishToast, setPublishToast] = useState(null)

  const selected = selectedId ? journalEntries.find(e => e.id === selectedId) : journalEntries[0]

  useEffect(() => { if (eventMode) setShowWrite(true) }, [eventMode])

  function openNew() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, date: localDateStr(new Date()) })
    setShowWrite(true)
  }

  function openEdit(entry) {
    setEditId(entry.id)
    setForm({
      date: entry.date || '',
      type: entry.type || 'nightly',
      highlight: entry.highlight || '',
      longForm: entry.longForm || '',
      dayRating: entry.dayRating || 4,
      moodNow: (entry.moods?.[0]?.mood) || 3,
    })
    setShowWrite(true)
  }

  function handleSave() {
    if (!form.highlight.trim() && !form.longForm.trim()) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const entryDate = form.date || localDateStr(now)
    const title = `${form.type === 'nightly' ? 'Nightly' : 'Entry'} — ${entryDate}`

    if (editId) {
      updateJournalEntry(editId, {
        date: entryDate, type: form.type, title,
        highlight: form.highlight, longForm: form.longForm, dayRating: form.dayRating,
        moods: [{ time: timeStr, mood: form.moodNow }],
      })
      setSelectedId(editId)
    } else {
      const id = addJournalEntry({
        date: entryDate, type: form.type, title,
        highlight: form.highlight, longForm: form.longForm, dayRating: form.dayRating,
        moods: [{ time: timeStr, mood: form.moodNow }],
        moments: [],
      })
      setSelectedId(id)
    }

    setSaved(true)
    setShowWrite(false)
    setEditId(null)
    setTimeout(() => setSaved(false), 3000)
  }

  const filtered = journalEntries.filter(e =>
    !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.highlight?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>📓</span>
        <div className="topbar-title">Journal</div>
        <div className="topbar-sep" />

        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=jokes')}
            style={{ fontSize: 12 }}>🎤 Joke Journal →</button>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ New entry</button>
        </div>
      </div>

      <div className="workflow-banner">
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>Workflow:</span>
            <span className="wf-step done" onClick={() => nav('/autogenes/mind?tab=planner')} style={{ cursor: 'pointer' }}>🎯 Goal</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step done" onClick={() => nav('/autogenes/mind?tab=scheduler')} style={{ cursor: 'pointer' }}>📅 Schedule</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step active">📓 Journal</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step" onClick={() => nav('/autogenes/brain')} style={{ cursor: 'pointer' }}>🤖 Brain</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>Reflections flow automatically into LENS</span>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar */}
            <div className="sidebar">
              <div style={{ padding: '10px 12px 6px' }}>
                <input className="input" placeholder="🔍 Search entries…" style={{ fontSize: 12 }}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="scroll" style={{ flex: 1 }}>
                {filtered.length === 0 && (
                  <div style={{ padding: '20px 16px', color: 'var(--text-3)', fontSize: 13 }}>
                    {search ? 'No matching entries.' : 'No entries yet. Write your first entry!'}
                  </div>
                )}
                {filtered.map(e => (
                  <div key={e.id}
                    onClick={() => { setSelectedId(e.id); setShowWrite(false) }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      background: selected?.id === e.id ? 'var(--accent-bg)' : 'transparent',
                      borderLeft: `3px solid ${selected?.id === e.id ? 'var(--accent)' : 'transparent'}`,
                    }}>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{e.title || `Entry — ${e.date}`}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 6 }}>
                      <span>{e.date}</span>
                      {e.dayRating && <span style={{ color: 'var(--amber)' }}>{'★'.repeat(e.dayRating)}</span>}
                      {e.type && <span style={{ color: e.type === 'nightly' ? 'var(--accent)' : 'var(--amber)' }}>{e.type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main area */}
            <div className="scroll" style={{ flex: 1 }}>
              {showWrite && (
                <div className="pad" style={{ maxWidth: 680, margin: '0 auto' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
                    {editId ? 'Edit entry' : eventMode ? '📓 Post-event reflection' : 'New journal entry'}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Date</div>
                    <input type="date" className="input" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Entry type</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['nightly', 'reflection', 'note'].map(t => (
                        <button key={t} className={`btn btn-sm ${form.type === t ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setForm(f => ({ ...f, type: t }))}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Highlight</div>
                    <input className="input" placeholder="One sentence — what stood out today?"
                      value={form.highlight} onChange={e => setForm(f => ({ ...f, highlight: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Day rating</div>
                    <div style={{ marginTop: 4 }}>{starRating(5, form.dayRating, r => setForm(f => ({ ...f, dayRating: r })))}</div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Current mood</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {MOOD_EMOJIS.map((em, i) => (
                        <button key={i}
                          onClick={() => setForm(f => ({ ...f, moodNow: i + 1 }))}
                          style={{
                            width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                            border: `2px solid ${form.moodNow === i + 1 ? 'var(--accent)' : 'var(--border)'}`,
                            background: form.moodNow === i + 1 ? 'var(--accent-bg)' : 'var(--surface-2)',
                            fontSize: 20,
                          }}>{em}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Full entry</div>
                    <textarea className="textarea" style={{ marginTop: 4, minHeight: 140 }}
                      placeholder="Write freely — what happened, how you feel, what you noticed…"
                      value={form.longForm} onChange={e => setForm(f => ({ ...f, longForm: e.target.value }))} />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary"
                      onClick={handleSave}
                      disabled={!form.highlight.trim() && !form.longForm.trim()}>
                      {editId ? 'Update entry' : 'Save entry'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setShowWrite(false); setEditId(null) }}>Cancel</button>
                  </div>
                </div>
              )}

              {!showWrite && selected && (
                <div className="pad" style={{ maxWidth: 700, margin: '0 auto' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
                    {selected.title || `Entry — ${selected.date}`}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{selected.date}</span>
                    {selected.dayRating && (
                      <span style={{ color: 'var(--amber)', fontSize: 13 }}>
                        {'★'.repeat(selected.dayRating)}{'☆'.repeat(5 - selected.dayRating)}
                      </span>
                    )}
                    {selected.type && <span className="badge badge-accent">{selected.type}</span>}
                  </div>

                  {selected.highlight && (
                    <div style={{ padding: '12px 16px', background: 'var(--accent-bg)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 14, fontStyle: 'italic', color: 'var(--text-2)', borderLeft: '3px solid var(--accent)' }}>
                      "{selected.highlight}"
                    </div>
                  )}

                  {selected.moods?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Mood timeline</div>
                        <span className="badge badge-accent">Timeline</span>
                      </div>
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Mood (1–5)</span><span>6am → 11pm</span>
                        </div>
                        <MoodChart entry={selected} />
                      </div>
                    </div>
                  )}

                  {selected.longForm && (
                    <div style={{ lineHeight: 1.8, fontSize: 14, color: 'var(--text-2)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                      {selected.longForm}
                    </div>
                  )}

                  {(() => {
                    const todayLogs = (habitLogs || []).filter(l => l.recordedAt.slice(0, 10) === selected.date)
                    if (!todayLogs.length) return null
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🌀</span> Habits this day
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {todayLogs.map(log => {
                            const habit = (habits || []).find(h => h.id === log.habitId)
                            const meta = {
                              'gave-in':  { color: '#ef4444', icon: '⚡' },
                              'resisted': { color: '#22c55e', icon: '🛡' },
                              'tracked':  { color: '#64748b', icon: '📋' },
                            }[log.entryType] || {}
                            return (
                              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                                <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
                                <span style={{ fontSize: 18 }}>{habit?.icon}</span>
                                <span style={{ flex: 1, fontSize: 13 }}>{habit?.name}</span>
                                {log.quantity > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{log.quantity} {log.unit}</span>}
                                <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{log.entryType}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="divider" />
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/brain')}>🤖 Analyze in Brain →</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selected)}>✎ Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPublishModal(selected)}>
                      📤 Share to Monogenes
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-3)', marginLeft: 'auto' }}
                      onClick={() => { deleteJournalEntry(selected.id); setSelectedId(null) }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {!showWrite && !selected && (
                <div className="empty" style={{ marginTop: 80 }}>
                  <div className="empty-icon">📓</div>
                  <div className="empty-title">No entries yet</div>
                  <p style={{ color: 'var(--text-3)' }}>Write your first journal entry.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>Write first entry</button>
                </div>
              )}
            </div>
      </div>

      {saved && (
        <div className="toast">
          ✓ Entry saved — mood data flowing to LENS
        </div>
      )}

      {publishToast && (
        <div className="toast">
          ✓ {publishToast}
          {publishToast.includes('Wall') && (
            <button className="btn btn-ghost btn-xs" onClick={() => nav('/monogenes')}>View Wall →</button>
          )}
          {publishToast.includes('Blog') && (
            <button className="btn btn-ghost btn-xs" onClick={() => nav('/monogenes/editor')}>View in Editor →</button>
          )}
        </div>
      )}

      {publishModal && (
        <>
          <div onClick={() => setPublishModal(null)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100 }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24,
            zIndex:101, width:380, maxWidth:'90vw', boxShadow:'0 8px 40px rgba(0,0,0,.5)' }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Share to Monogenes</div>
            <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:20 }}>
              "{publishModal.title || `Entry — ${publishModal.date}`}"
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              <button
                onClick={() => {
                  publishJournalEntry(publishModal.id, 'post')
                  setPublishModal(null)
                  setPublishToast('Published to Wall')
                  setTimeout(() => setPublishToast(null), 3000)
                }}
                style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px',
                  background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8,
                  cursor:'pointer', textAlign:'left', color:'inherit', width:'100%' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:22, marginTop:2 }}>📝</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>Post (short)</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>
                    Publishes your highlight as a wall post visible to your connections.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  publishJournalEntry(publishModal.id, 'blog')
                  setPublishModal(null)
                  setPublishToast('Published as Blog entry')
                  setTimeout(() => setPublishToast(null), 3000)
                }}
                style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px',
                  background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8,
                  cursor:'pointer', textAlign:'left', color:'inherit', width:'100%' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{ fontSize:22, marginTop:2 }}>📰</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>Blog entry (long)</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>
                    Publishes the full entry as a blog post on your Monogenes. Add a Journal Blog block in the Editor to display it.
                  </div>
                </div>
              </button>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={() => setPublishModal(null)} style={{ width:'100%' }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

