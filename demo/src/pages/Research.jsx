import { useState } from 'react'
import { useStore } from '../store.jsx'

const STATUSES = ['active', 'completed', 'paused', 'archived']
const STATUS_COLOR = { active: 'var(--accent)', completed: '#888', paused: '#e0a040', archived: '#555' }
const ALL_TAGS = ['Tech', 'Health', 'Fitness', 'Diet', 'Finance', 'Books', 'Architecture', 'Science', 'nTogether', 'Other']

const EMPTY = { title: '', status: 'active', tags: '', summary: '', notes: '' }

export default function Research() {
  const { data, addResearch, updateResearch, deleteResearch, addResearchSource, deleteResearchSource, updateResearchSource } = useStore()
  const [selected, setSelected] = useState(data.research[0]?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sourceForm, setSourceForm] = useState(null)
  const [newSource, setNewSource] = useState({ label: '', url: '', note: '' })
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesVal, setNotesVal] = useState('')
  const [editSourceId, setEditSourceId] = useState(null)
  const [editSourceVals, setEditSourceVals] = useState({ label: '', url: '', note: '' })

  const filtered = data.research.filter(r => filterStatus === 'all' || r.status === filterStatus)
  const item = selected ? data.research.find(r => r.id === selected) : null

  function openNew() {
    setForm(EMPTY)
    setIsNew(true)
    setEditing(true)
    setSelected(null)
  }

  function openEdit(r) {
    setForm({ ...r, tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags })
    setIsNew(false)
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const payload = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) }
    if (isNew) {
      const id = addResearch(payload)
      setSelected(id)
    } else {
      updateResearch(form.id, payload)
      setSelected(form.id)
    }
    setEditing(false)
    setIsNew(false)
  }

  function handleAddSource(e) {
    e.preventDefault()
    if (!newSource.label.trim()) return
    addResearchSource(item.id, newSource)
    setNewSource({ label: '', url: '', note: '' })
    setSourceForm(false)
  }

  function saveNotes() {
    updateResearch(item.id, { notes: notesVal })
    setEditingNotes(false)
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🔬</span>
        <div className="topbar-title">Research</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Topics, sources & notes</span>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 250, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Research</span>
            <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>+ New</button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['all', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ background: filterStatus === s ? 'var(--accent)' : 'var(--bg)', color: filterStatus === s ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 7px', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => { setSelected(r.id); setEditing(false); setEditingNotes(false) }}
              style={{ padding: '10px 12px', cursor: 'pointer', background: selected === r.id ? 'var(--bg)' : 'transparent', borderLeft: selected === r.id ? '2px solid var(--accent)' : '2px solid transparent', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{r.title}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, border: `1px solid ${STATUS_COLOR[r.status]}`, color: STATUS_COLOR[r.status], textTransform: 'capitalize' }}>{r.status}</span>
                {r.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, color: 'var(--text-3)' }}>{t}</span>)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No research topics found.</div>}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} topics</div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{isNew ? 'New Research Topic' : 'Edit'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setEditing(false); setIsNew(false) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Title *
                <input required value={form.title} onChange={f('title')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Status
                <select value={form.status} onChange={f('status')} style={iStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Tags (comma-separated)
                <input value={form.tags} onChange={f('tags')} placeholder="Tech, Health…" style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Summary
                <textarea value={form.summary ?? ''} onChange={f('summary')} rows={3} style={{ ...iStyle, resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Notes
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={5} style={{ ...iStyle, resize: 'vertical' }} />
              </label>
            </div>
          </form>
        ) : item ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, border: `1px solid ${STATUS_COLOR[item.status]}`, color: STATUS_COLOR[item.status], textTransform: 'capitalize', fontWeight: 600 }}>{item.status}</span>
                  {item.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', color: 'var(--text-3)' }}>{t}</span>)}
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Started {item.createdAt}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(item)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { deleteResearch(item.id); setSelected(data.research.find(r => r.id !== item.id)?.id ?? null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

            {item.summary && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 14, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{item.summary}</div>
            )}

            {/* Sources */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Sources ({item.sources.length})</div>
                {!sourceForm && <button onClick={() => setSourceForm(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>+ Add Source</button>}
              </div>
              {sourceForm && (
                <form onSubmit={handleAddSource} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 8, alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 140 }}>
                    Label *
                    <input required value={newSource.label} onChange={e => setNewSource(s => ({ ...s, label: e.target.value }))} style={iStyle} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 1, minWidth: 140 }}>
                    URL
                    <input value={newSource.url} onChange={e => setNewSource(s => ({ ...s, url: e.target.value }))} placeholder="https://…" style={iStyle} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)', flex: 2, minWidth: 180 }}>
                    Note
                    <input value={newSource.note} onChange={e => setNewSource(s => ({ ...s, note: e.target.value }))} style={iStyle} />
                  </label>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                  <button type="button" onClick={() => setSourceForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                </form>
              )}
              {item.sources.map(s => (
                editSourceId === s.id ? (
                  <form key={s.id} onSubmit={e => { e.preventDefault(); updateResearchSource(item.id, s.id, editSourceVals); setEditSourceId(null) }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: 'var(--text-2)' }}>
                      Label
                      <input required value={editSourceVals.label} onChange={e => setEditSourceVals(p => ({ ...p, label: e.target.value }))}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12, width: 140 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: 'var(--text-2)' }}>
                      URL
                      <input value={editSourceVals.url} onChange={e => setEditSourceVals(p => ({ ...p, url: e.target.value }))} placeholder="https://..."
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12, width: 180 }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: 'var(--text-2)' }}>
                      Note
                      <input value={editSourceVals.note} onChange={e => setEditSourceVals(p => ({ ...p, note: e.target.value }))}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12, width: 160 }} />
                    </label>
                    <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setEditSourceId(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                  </form>
                ) : (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, fontSize: 13 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{s.label}</span>
                      {s.url && <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 8 }}>{s.url}</span>}
                      {s.note && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.note}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setEditSourceId(s.id); setEditSourceVals({ label: s.label, url: s.url || '', note: s.note || '' }) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0 }}>✎</button>
                      <button onClick={() => deleteResearchSource(item.id, s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 0 }}>✕</button>
                    </div>
                  </div>
                )
              ))}
              {item.sources.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No sources added yet.</div>}
            </div>

            {/* Notes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Notes</div>
                {!editingNotes
                  ? <button onClick={() => { setNotesVal(item.notes ?? ''); setEditingNotes(true) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveNotes} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingNotes(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                }
              </div>
              {editingNotes
                ? <textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} rows={8}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px', color: 'var(--text-1)', fontSize: 13, lineHeight: 1.7, boxSizing: 'border-box', resize: 'vertical' }} />
                : <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: 13, lineHeight: 1.8, color: 'var(--text-2)', whiteSpace: 'pre-wrap', minHeight: 80 }}>
                    {item.notes || <span style={{ color: 'var(--text-3)' }}>No notes yet. Click Edit to add.</span>}
                  </div>
              }
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
            <div style={{ fontSize: 32 }}>🔬</div>
            <div style={{ fontSize: 13 }}>Select a topic or create a new one</div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }
