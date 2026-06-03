import { useState } from 'react'
import { useStore } from '../store.jsx'

const STATUSES = ['planned', 'upcoming', 'active', 'completed']
const STATUS_COLOR = { planned: '#888', upcoming: '#e0a040', active: 'var(--accent)', completed: '#555' }
const EMPTY = { name: '', destination: '', emoji: '✈️', status: 'planned', startDate: '', endDate: '', notes: '' }

export default function Travel() {
  const { data, addTrip, updateTrip, deleteTrip, addPackingItem, togglePackingItem, deletePackingItem } = useStore()
  const [selected, setSelected] = useState(data.trips[0]?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [newPack, setNewPack] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editNotes, setEditNotes] = useState(false)
  const [notesVal, setNotesVal] = useState('')

  const filtered = data.trips.filter(t => filterStatus === 'all' || t.status === filterStatus)
    .sort((a, b) => (b.startDate ?? '9999') .localeCompare(a.startDate ?? '9999'))
  const trip = selected ? data.trips.find(t => t.id === selected) : null
  const companions = trip ? trip.companions.map(id => data.contacts.find(c => c.id === id)).filter(Boolean) : []
  const packed = trip ? trip.packing.filter(i => i.packed).length : 0

  function openNew() { setForm(EMPTY); setIsNew(true); setEditing(true); setSelected(null) }
  function openEdit(t) { setForm({ ...t }); setIsNew(false); setEditing(true) }

  function handleSave(e) {
    e.preventDefault()
    if (isNew) { const id = addTrip(form); setSelected(id) }
    else { updateTrip(form.id, form); setSelected(form.id) }
    setEditing(false); setIsNew(false)
  }

  function handleAddPack(e) {
    e.preventDefault()
    if (!newPack.trim() || !trip) return
    addPackingItem(trip.id, newPack.trim())
    setNewPack('')
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 230, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Travel</span>
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
          {filtered.map(t => (
            <div key={t.id} onClick={() => { setSelected(t.id); setEditing(false); setEditNotes(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer', background: selected === t.id ? 'var(--bg)' : 'transparent', borderLeft: selected === t.id ? '2px solid var(--accent)' : '2px solid transparent', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 8, border: `1px solid ${STATUS_COLOR[t.status]}`, color: STATUS_COLOR[t.status], textTransform: 'capitalize' }}>{t.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.destination}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No trips found.</div>}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} trips</div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{isNew ? 'New Trip' : 'Edit Trip'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setEditing(false); setIsNew(false) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 130px', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Emoji
                <input value={form.emoji} onChange={f('emoji')} style={{ ...iStyle, fontSize: 18, textAlign: 'center', padding: '5px 4px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Trip Name *
                <input required value={form.name} onChange={f('name')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Status
                <select value={form.status} onChange={f('status')} style={iStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Destination
                <input value={form.destination} onChange={f('destination')} placeholder="City, Country" style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Start Date
                <input type="date" value={form.startDate ?? ''} onChange={f('startDate')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                End Date
                <input type="date" value={form.endDate ?? ''} onChange={f('endDate')} style={iStyle} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
              Notes
              <textarea value={form.notes ?? ''} onChange={f('notes')} rows={4} style={{ ...iStyle, resize: 'vertical' }} />
            </label>
          </form>
        ) : trip ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 44 }}>{trip.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{trip.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, border: `1px solid ${STATUS_COLOR[trip.status]}`, color: STATUS_COLOR[trip.status], textTransform: 'capitalize', fontWeight: 600 }}>{trip.status}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{trip.destination}</span>
                  {trip.startDate && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{trip.startDate}{trip.endDate && trip.endDate !== trip.startDate ? ` → ${trip.endDate}` : ''}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(trip)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { deleteTrip(trip.id); setSelected(data.trips.find(t => t.id !== trip.id)?.id ?? null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Packing */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Packing List <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 12 }}>{packed}/{trip.packing.length}</span></div>
                {trip.packing.length > 0 && (
                  <div style={{ background: 'var(--bg)', borderRadius: 3, height: 4, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${trip.packing.length > 0 ? (packed / trip.packing.length) * 100 : 0}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                  </div>
                )}
                {trip.packing.map(i => (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <input type="checkbox" checked={i.packed} onChange={() => togglePackingItem(trip.id, i.id)} style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ flex: 1, fontSize: 13, textDecoration: i.packed ? 'line-through' : 'none', color: i.packed ? 'var(--text-3)' : 'var(--text-1)' }}>{i.item}</span>
                    <button onClick={() => deletePackingItem(trip.id, i.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
                  </div>
                ))}
                <form onSubmit={handleAddPack} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input value={newPack} onChange={e => setNewPack(e.target.value)} placeholder="Add item…"
                    style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 12 }} />
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Add</button>
                </form>
              </div>

              {/* Companions + Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {companions.length > 0 && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>With</div>
                    {companions.map(c => (
                      <div key={c.id} style={{ fontSize: 13, color: 'var(--text-2)' }}>👤 {c.name}</div>
                    ))}
                  </div>
                )}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Notes</div>
                    {!editNotes
                      ? <button onClick={() => { setNotesVal(trip.notes ?? ''); setEditNotes(true) }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                      : <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { updateTrip(trip.id, { notes: notesVal }); setEditNotes(false) }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>Save</button>
                          <button onClick={() => setEditNotes(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                        </div>
                    }
                  </div>
                  {editNotes
                    ? <textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} rows={6} style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', color: 'var(--text-1)', fontSize: 12, lineHeight: 1.6, boxSizing: 'border-box', resize: 'vertical' }} />
                    : <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{trip.notes || <span style={{ color: 'var(--text-3)' }}>No notes yet.</span>}</div>
                  }
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
            <div style={{ fontSize: 32 }}>✈️</div>
            <div style={{ fontSize: 13 }}>Select a trip or plan a new one</div>
          </div>
        )}
      </div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }
