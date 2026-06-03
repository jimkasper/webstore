import { useState, useRef } from 'react'
import { useStore } from '../store.jsx'

const JOKE_TAGS = ['concept', 'setup', 'punchline', 'callback', 'bit', 'crowd-work', 'one-liner', 'story']
const JOKE_STATUSES = [
  { id: 'draft',     label: 'Draft',      color: '#64748b' },
  { id: 'workshop',  label: 'Workshop',   color: '#f59e0b' },
  { id: 'road-test', label: 'Road Test',  color: '#3b82f6' },
  { id: 'proven',    label: 'Proven',     color: '#22c55e' },
  { id: 'retired',   label: 'Retired',    color: '#475569' },
]
const CROWD_TYPES = ['club', 'bar', 'college', 'corporate', 'festival', 'open-mic', 'theater', 'other']
const LANDING_TYPES = [
  { id: 'kill',    label: 'Killed',   color: '#22c55e' },
  { id: 'good',    label: 'Good',     color: '#84cc16' },
  { id: 'ok',      label: 'OK',       color: '#f59e0b' },
  { id: 'bombed',  label: 'Bombed',   color: '#ef4444' },
]
const ROLES = ['opener', 'feature', 'callback', 'closer', 'crowd-work', 'flex']

// ─── Helpers ───────────────────────────────────────────────────────────────

function TagChip({ tag, active, onClick }) {
  return (
    <span onClick={onClick} style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 99,
      cursor: onClick ? 'pointer' : 'default',
      background: active ? 'var(--accent)' : 'var(--surface)',
      color: active ? '#0f172a' : 'var(--text-2)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      userSelect: 'none',
    }}>{tag}</span>
  )
}

function StatusBadge({ status }) {
  const s = JOKE_STATUSES.find(x => x.id === status) || JOKE_STATUSES[0]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
      background: s.color + '22', color: s.color, border: `1px solid ${s.color}44`,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{s.label}</span>
  )
}

function PipelineStrip({ status, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      {JOKE_STATUSES.map((s, i) => {
        const active = s.id === status
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span style={{ color: 'var(--border)', fontSize: 10 }}>›</span>}
            <button onClick={() => onChange && onChange(s.id)} style={{
              fontSize: 11, fontWeight: active ? 700 : 400,
              padding: '3px 10px', borderRadius: 99,
              background: active ? s.color : 'transparent',
              color: active ? '#0f172a' : s.color,
              border: `1px solid ${s.color}`,
              cursor: onChange ? 'pointer' : 'default',
            }}>{s.label}</button>
          </div>
        )
      })}
    </div>
  )
}

function LandingDot({ landing }) {
  const l = LANDING_TYPES.find(x => x.id === landing)
  if (!l) return null
  return <span style={{ fontSize: 11, color: l.color, fontWeight: 700 }}>● {l.label}</span>
}

// ─── Variants Section ─────────────────────────────────────────────────────

function VariantsSection({ joke, addVariant, updateVariant, deleteVariant }) {
  const [open, setOpen] = useState(false)
  const [newText, setNewText] = useState('')
  const variants = joke.variants || []

  function handleAdd() {
    if (!newText.trim()) return
    addVariant(joke.id, { text: newText.trim() })
    setNewText('')
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-2)', fontSize: 12, fontWeight: 600, padding: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        Variants ({variants.length})
      </button>
      {open && (
        <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
          {variants.map(v => (
            <div key={v.id} style={{
              marginBottom: 8, padding: '8px 10px',
              background: 'var(--surface)', borderRadius: 6,
              border: v.preferred ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-1)', marginBottom: 6 }}>{v.text}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {v.preferred && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>★ Preferred</span>}
                <button onClick={() => updateVariant(joke.id, v.id, { preferred: true })}
                  style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', color: 'var(--text-3)' }}>
                  ★ Set preferred
                </button>
                <button onClick={() => deleteVariant(joke.id, v.id)}
                  style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', marginLeft: 'auto' }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <textarea value={newText} onChange={e => setNewText(e.target.value)}
              placeholder="Enter alternate wording…"
              style={{ flex: 1, fontSize: 12, padding: '6px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', resize: 'vertical', minHeight: 54 }} />
            <button onClick={handleAdd}
              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Performance Log Section ──────────────────────────────────────────────

function PerformanceLog({ joke, addPerformance, deletePerformance }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: '', venue: '', crowdType: 'club', landing: 'ok', notes: '' })
  const perfs = joke.performances || []

  function handleAdd() {
    if (!form.date || !form.venue) return
    addPerformance(joke.id, form)
    setForm({ date: '', venue: '', crowdType: 'club', landing: 'ok', notes: '' })
  }

  const inp = { fontSize: 12, padding: '5px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-2)', fontSize: 12, fontWeight: 600, padding: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        Performance Log ({perfs.length})
      </button>
      {open && (
        <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
          {perfs.map(p => (
            <div key={p.id} style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.venue} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>· {p.date}</span></div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                    <LandingDot landing={p.landing} />
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.crowdType}</span>
                  </div>
                  {p.notes && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>{p.notes}</div>}
                </div>
                <button onClick={() => deletePerformance(joke.id, p.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            <input placeholder="Venue" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} style={inp} />
            <select value={form.crowdType} onChange={e => setForm(f => ({ ...f, crowdType: e.target.value }))} style={inp}>
              {CROWD_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.landing} onChange={e => setForm(f => ({ ...f, landing: e.target.value }))} style={inp}>
              {LANDING_TYPES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, gridColumn: '1 / -1' }} />
            <button onClick={handleAdd} style={{ gridColumn: '1 / -1', fontSize: 12, padding: '6px 0', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Log Performance
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Joke Link Modal ──────────────────────────────────────────────────────

function JokeLinkModal({ currentId, jokes, onLink, onClose }) {
  const [q, setQ] = useState('')
  const filtered = jokes.filter(j => j.id !== currentId && j.text.toLowerCase().includes(q.toLowerCase()))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, width: 380, maxHeight: '60vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Link to a bit</div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search bits…"
          style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '6px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', marginBottom: 8 }} />
        {filtered.map(j => (
          <div key={j.id} onClick={() => onLink(j.id)} style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 4, background: 'var(--surface)' }}>
            {j.text.slice(0, 80)}{j.text.length > 80 ? '…' : ''}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No results</div>}
      </div>
    </div>
  )
}

// ─── Joke Detail ──────────────────────────────────────────────────────────

function JokeDetail({ joke, jokes, updateJoke, deleteJoke, addJokeLink, deleteJokeLink, addPerformance, deletePerformance, addVariant, updateVariant, deleteVariant, onClose }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(joke.text)
  const [editEstMins, setEditEstMins] = useState(joke.estMins || 2)
  const [showLinkModal, setShowLinkModal] = useState(false)

  function saveEdit() {
    updateJoke(joke.id, { text: editText, estMins: editEstMins })
    setEditing(false)
  }

  const linked = (joke.links || []).map(l => ({ link: l, bit: jokes.find(j => j.id === l.jokeId) })).filter(x => x.bit)

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <TagChip tag={joke.tag} active />
          <StatusBadge status={joke.status || 'draft'} />
          {joke.estMins && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>~{joke.estMins} min</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setEditing(true); setEditText(joke.text); setEditEstMins(joke.estMins || 2) }}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)' }}>Edit</button>
          <button onClick={() => { if (confirm('Delete this bit?')) { deleteJoke(joke.id); onClose() } }}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid #7f1d1d', cursor: 'pointer', color: '#ef4444' }}>Delete</button>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ marginBottom: 14 }}>
        <PipelineStrip status={joke.status || 'draft'} onChange={s => updateJoke(joke.id, { status: s })} />
      </div>

      {/* Text */}
      {editing ? (
        <div>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
            style={{ width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--text-1)', resize: 'vertical', minHeight: 100 }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)' }}>Est. mins:</label>
            <input type="number" value={editEstMins} onChange={e => setEditEstMins(Number(e.target.value))} min={0} max={60}
              style={{ width: 60, fontSize: 12, padding: '4px 6px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
            <button onClick={saveEdit} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-1)', whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>{joke.text}</p>
      )}

      {/* Created date */}
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
        Added {new Date(joke.createdAt).toLocaleDateString()}
      </div>

      {/* Variants */}
      <VariantsSection joke={joke} addVariant={addVariant} updateVariant={updateVariant} deleteVariant={deleteVariant} />

      {/* Performance Log */}
      <PerformanceLog joke={joke} addPerformance={addPerformance} deletePerformance={deletePerformance} />

      {/* Linked bits */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Linked Bits ({linked.length})</div>
        {linked.map(({ link, bit }) => (
          <div key={link.jokeId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--surface)', borderRadius: 6, marginBottom: 4, border: '1px solid var(--border)' }}>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--text-1)' }}>{bit.text.slice(0, 70)}{bit.text.length > 70 ? '…' : ''}</span>
            <button onClick={() => deleteJokeLink(joke.id, link.jokeId)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}>✕</button>
          </div>
        ))}
        <button onClick={() => setShowLinkModal(true)}
          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--accent)', marginTop: 4 }}>+ Link a bit</button>
      </div>

      {showLinkModal && (
        <JokeLinkModal currentId={joke.id} jokes={jokes}
          onLink={tid => { addJokeLink(joke.id, tid, ''); setShowLinkModal(false) }}
          onClose={() => setShowLinkModal(false)} />
      )}
    </div>
  )
}

// ─── Joke Form ────────────────────────────────────────────────────────────

function JokeForm({ onSave, onCancel, initial }) {
  const [text, setText] = useState(initial?.text || '')
  const [tag, setTag] = useState(initial?.tag || 'concept')
  const [status, setStatus] = useState(initial?.status || 'draft')
  const [estMins, setEstMins] = useState(initial?.estMins || 2)

  const inp = { fontSize: 12, padding: '5px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{initial ? 'Edit Bit' : 'New Bit'}</div>
      <textarea value={text} onChange={e => setText(e.target.value)} autoFocus
        placeholder="Write the bit…"
        style={{ width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '10px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', resize: 'vertical', minHeight: 100, marginBottom: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Tag</div>
          <select value={tag} onChange={e => setTag(e.target.value)} style={{ ...inp, width: '100%' }}>
            {JOKE_TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Status</div>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inp, width: '100%' }}>
            {JOKE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Est. min</div>
          <input type="number" value={estMins} onChange={e => setEstMins(Number(e.target.value))} min={0} max={60}
            style={{ ...inp, width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => text.trim() && onSave({ text: text.trim(), tag, status, estMins, performances: [], variants: [] })}
          style={{ fontSize: 13, padding: '7px 18px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Save Bit
        </button>
        <button onClick={onCancel}
          style={{ fontSize: 13, padding: '7px 14px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Jokes View ───────────────────────────────────────────────────────────

function JokesView({ jokes, actions }) {
  const { addJoke, updateJoke, deleteJoke, addJokeLink, deleteJokeLink, addPerformance, deletePerformance, addVariant, updateVariant, deleteVariant } = actions
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterTag, setFilterTag] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const selected = jokes.find(j => j.id === selectedId)

  const filtered = jokes.filter(j => {
    if (filterTag !== 'all' && j.tag !== filterTag) return false
    if (filterStatus !== 'all' && (j.status || 'draft') !== filterStatus) return false
    if (search && !j.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleSave(data) {
    addJoke(data)
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => { setShowForm(true); setSelectedId(null) }}
            style={{ width: '100%', fontSize: 13, padding: '7px 0', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 8 }}>
            + New Bit
          </button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bits…"
            style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
        </div>
        {/* Filter chips */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <TagChip tag="all" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
          {JOKE_STATUSES.map(s => (
            <TagChip key={s.id} tag={s.label} active={filterStatus === s.id} onClick={() => setFilterStatus(s.id)} />
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No bits found</div>
          )}
          {filtered.map(j => (
            <div key={j.id} onClick={() => { setSelectedId(j.id); setShowForm(false) }}
              style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                background: selectedId === j.id ? 'var(--bg)' : 'transparent',
                borderLeft: selectedId === j.id ? '3px solid var(--accent)' : '3px solid transparent',
              }}>
              <div style={{ fontSize: 13, color: 'var(--text-1)', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {j.text}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <TagChip tag={j.tag} active={false} />
                <StatusBadge status={j.status || 'draft'} />
                {(j.performances || []).length > 0 && (
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>🎤 {j.performances.length}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
          {filtered.length} bits
        </div>
      </div>

      {/* Detail / Form */}
      {showForm ? (
        <JokeForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      ) : selected ? (
        <JokeDetail
          joke={selected} jokes={jokes}
          updateJoke={updateJoke} deleteJoke={deleteJoke}
          addJokeLink={addJokeLink} deleteJokeLink={deleteJokeLink}
          addPerformance={addPerformance} deletePerformance={deletePerformance}
          addVariant={addVariant} updateVariant={updateVariant} deleteVariant={deleteVariant}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 32 }}>🎤</span>
          <span style={{ fontSize: 13 }}>Select a bit or create a new one</span>
        </div>
      )}
    </div>
  )
}

// ─── Inbox View ───────────────────────────────────────────────────────────

function InboxView({ inbox, actions }) {
  const { addInboxItem, deleteInboxItem, promoteInboxItem } = actions
  const [raw, setRaw] = useState('')
  const [promotingId, setPromotingId] = useState(null)
  const [promoteTag, setPromoteTag] = useState('concept')
  const [promoteStatus, setPromoteStatus] = useState('draft')
  const textRef = useRef(null)

  function handleCapture() {
    if (!raw.trim()) return
    addInboxItem(raw.trim())
    setRaw('')
    textRef.current?.focus()
  }

  function handlePromote(id) {
    promoteInboxItem(id, { tag: promoteTag, status: promoteStatus })
    setPromotingId(null)
  }

  const inp = { fontSize: 12, padding: '5px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Capture box */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-1)' }}>Quick Capture</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={textRef}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCapture() }}
            placeholder="Type a raw idea, observation, or half-formed bit…  ⌘↵ to save"
            style={{ flex: 1, fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)', resize: 'vertical', minHeight: 60 }}
          />
          <button onClick={handleCapture}
            style={{ fontSize: 13, padding: '0 16px', borderRadius: 8, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'stretch' }}>
            Save
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>No tagging required. Just dump the thought.</div>
      </div>

      {/* Inbox list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
        {inbox.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 40 }}>Inbox is empty — start capturing ideas above</div>
        )}
        {inbox.map(item => (
          <div key={item.id} style={{ marginBottom: 10, padding: '12px 14px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 8, lineHeight: 1.5 }}>{item.text}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
              {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {promotingId === item.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={promoteTag} onChange={e => setPromoteTag(e.target.value)} style={inp}>
                  {JOKE_TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={promoteStatus} onChange={e => setPromoteStatus(e.target.value)} style={inp}>
                  {JOKE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button onClick={() => handlePromote(item.id)}
                  style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Promote →
                </button>
                <button onClick={() => setPromotingId(null)}
                  style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setPromotingId(item.id); setPromoteTag('concept'); setPromoteStatus('draft') }}
                  style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}>
                  → Promote to Bit
                </button>
                <button onClick={() => deleteInboxItem(item.id)}
                  style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-3)' }}>
                  ✕ Discard
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Set List Builder ─────────────────────────────────────────────────────

function SetListDetail({ setList, jokes, updateSetList, deleteSetList, onDelete }) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(setList.name)
  const [addJokeId, setAddJokeId] = useState('')
  const [addRole, setAddRole] = useState('feature')

  const items = setList.items || []
  const resolvedItems = items.map(item => ({ ...item, joke: jokes.find(j => j.id === item.jokeId) })).filter(x => x.joke)
  const totalMins = resolvedItems.reduce((s, x) => s + (x.joke.estMins || 0), 0)

  const availableJokes = jokes.filter(j => !items.some(i => i.jokeId === j.id))

  function handleAddItem() {
    if (!addJokeId) return
    updateSetList(setList.id, { items: [...items, { jokeId: addJokeId, role: addRole, note: null }] })
    setAddJokeId('')
  }

  function handleRemoveItem(jokeId) {
    updateSetList(setList.id, { items: items.filter(i => i.jokeId !== jokeId) })
  }

  function handleMoveItem(idx, dir) {
    const next = [...items]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    updateSetList(setList.id, { items: next })
  }

  function handleRoleChange(jokeId, role) {
    updateSetList(setList.id, { items: items.map(i => i.jokeId === jokeId ? { ...i, role } : i) })
  }

  const inp = { fontSize: 12, padding: '5px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)' }

  const roleColor = { opener: '#3b82f6', feature: 'var(--text-3)', callback: '#f59e0b', closer: '#22c55e', 'crowd-work': '#a78bfa', flex: '#64748b' }

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {editingName ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus
              style={{ ...inp, fontSize: 16, fontWeight: 700, flex: 1 }} />
            <button onClick={() => { updateSetList(setList.id, { name: nameInput }); setEditingName(false) }}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save</button>
          </div>
        ) : (
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, cursor: 'pointer' }} onClick={() => setEditingName(true)}>
            {setList.name} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>✎</span>
          </h2>
        )}
        <button onClick={() => { if (confirm('Delete this set list?')) { deleteSetList(setList.id); onDelete() } }}
          style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid #7f1d1d', color: '#ef4444', cursor: 'pointer' }}>
          Delete
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-2)' }}>
        <span>🎤 {resolvedItems.length} bits</span>
        <span>⏱ ~{totalMins} min total</span>
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{setList.createdAt}</span>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 16 }}>
        {resolvedItems.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No bits yet — add one below</div>
        )}
        {resolvedItems.map((x, idx) => (
          <div key={x.jokeId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--surface)', borderRadius: 8, marginBottom: 6, border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)', fontSize: 12, minWidth: 20 }}>{idx + 1}.</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {x.joke.text.slice(0, 80)}{x.joke.text.length > 80 ? '…' : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>~{x.joke.estMins || 0} min</div>
            </div>
            <select value={x.role} onChange={e => handleRoleChange(x.jokeId, e.target.value)}
              style={{ ...inp, fontSize: 11, color: roleColor[x.role] || 'var(--text-3)' }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => handleMoveItem(idx, -1)} disabled={idx === 0}
                style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-3)', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
              <button onClick={() => handleMoveItem(idx, 1)} disabled={idx === resolvedItems.length - 1}
                style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-3)', opacity: idx === resolvedItems.length - 1 ? 0.3 : 1 }}>▼</button>
            </div>
            <button onClick={() => handleRemoveItem(x.jokeId)}
              style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
          </div>
        ))}
      </div>

      {/* Add bit */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <select value={addJokeId} onChange={e => setAddJokeId(e.target.value)} style={{ ...inp, flex: 1 }}>
          <option value="">— Add a bit —</option>
          {availableJokes.map(j => (
            <option key={j.id} value={j.id}>{j.text.slice(0, 60)}{j.text.length > 60 ? '…' : ''}</option>
          ))}
        </select>
        <select value={addRole} onChange={e => setAddRole(e.target.value)} style={inp}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={handleAddItem}
          style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Add
        </button>
      </div>
    </div>
  )
}

function SetListsView({ setLists, jokes, actions }) {
  const { addSetList, updateSetList, deleteSetList } = actions
  const [selectedId, setSelectedId] = useState(setLists[0]?.id || null)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  const selected = setLists.find(s => s.id === selectedId)

  function handleCreate() {
    if (!newName.trim()) return
    const id = addSetList({ name: newName.trim() })
    setSelectedId(id)
    setShowNew(false)
    setNewName('')
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setShowNew(true)}
            style={{ width: '100%', fontSize: 13, padding: '7px 0', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            + New Set List
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {setLists.map(s => {
            const mins = (s.items || []).reduce((sum, item) => {
              const j = jokes.find(j => j.id === item.jokeId)
              return sum + (j?.estMins || 0)
            }, 0)
            return (
              <div key={s.id} onClick={() => { setSelectedId(s.id); setShowNew(false) }}
                style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: selectedId === s.id ? 'var(--bg)' : 'transparent',
                  borderLeft: selectedId === s.id ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{(s.items || []).length} bits · ~{mins} min</div>
              </div>
            )
          })}
          {setLists.length === 0 && !showNew && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No set lists yet</div>
          )}
        </div>
      </div>

      {/* Detail */}
      {showNew ? (
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>New Set List</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} autoFocus placeholder="Set list name…"
            style={{ fontSize: 14, padding: '8px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', maxWidth: 320 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate}
              style={{ fontSize: 13, padding: '7px 18px', borderRadius: 6, background: 'var(--accent)', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Create
            </button>
            <button onClick={() => setShowNew(false)}
              style={{ fontSize: 13, padding: '7px 14px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : selected ? (
        <SetListDetail
          setList={selected} jokes={jokes}
          updateSetList={updateSetList} deleteSetList={deleteSetList}
          onDelete={() => setSelectedId(setLists.find(s => s.id !== selected.id)?.id || null)}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 32 }}>📋</span>
          <span style={{ fontSize: 13 }}>Select a set list or create a new one</span>
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────

export default function JokeJournal() {
  const store = useStore()
  const { data } = store
  const jokes = data.jokes || []
  const inbox = data.jokeInbox || []
  const setLists = data.setLists || []

  const [view, setView] = useState('jokes') // 'jokes' | 'inbox' | 'setlists'

  const actions = {
    addJoke: store.addJoke,
    updateJoke: store.updateJoke,
    deleteJoke: store.deleteJoke,
    addJokeLink: store.addJokeLink,
    deleteJokeLink: store.deleteJokeLink,
    addPerformance: store.addPerformance,
    deletePerformance: store.deletePerformance,
    addVariant: store.addVariant,
    updateVariant: store.updateVariant,
    deleteVariant: store.deleteVariant,
    addInboxItem: store.addInboxItem,
    deleteInboxItem: store.deleteInboxItem,
    promoteInboxItem: store.promoteInboxItem,
    addSetList: store.addSetList,
    updateSetList: store.updateSetList,
    deleteSetList: store.deleteSetList,
  }

  const tabs = [
    { id: 'jokes',    label: 'All Bits',  count: jokes.length },
    { id: 'inbox',    label: 'Inbox',     count: inbox.length },
    { id: 'setlists', label: 'Set Lists', count: setLists.length },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sub-nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, padding: '0 16px', alignItems: 'center' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              padding: '9px 18px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: view === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: view === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: view === t.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ fontSize: 10, background: view === t.id ? 'var(--accent)' : 'var(--surface-2)', color: view === t.id ? '#0f172a' : 'var(--text-3)', borderRadius: 99, padding: '1px 6px', fontWeight: 700 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {view === 'jokes' && <JokesView jokes={jokes} actions={actions} />}
        {view === 'inbox' && <InboxView inbox={inbox} actions={actions} />}
        {view === 'setlists' && <SetListsView setLists={setLists} jokes={jokes} actions={actions} />}
      </div>
    </div>
  )
}
