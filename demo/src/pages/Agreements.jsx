import { useState } from 'react'
import { useStore } from '../store.jsx'

const TYPES = ['Contract', 'Lease', 'Personal Bet', 'Commitment', 'Split Agreement', 'NDA', 'Loan', 'Other']
const STATUSES = ['active', 'completed', 'expired', 'draft']
const STATUS_COLOR = { active: 'var(--accent)', completed: '#888', expired: '#e05c5c', draft: '#e0a040' }

const EMPTY = { title: '', type: 'Contract', status: 'active', parties: '', date: '', expiryDate: '', value: '', terms: '', tags: '', signed: false }

export default function Agreements() {
  const { data, addAgreement, updateAgreement, deleteAgreement } = useStore()
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState(EMPTY)

  const filtered = [...data.agreements]
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  const agreement = selected ? data.agreements.find(a => a.id === selected) : null

  function openNew() {
    setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) })
    setIsNew(true)
    setEditing(true)
    setSelected(null)
  }

  function openEdit(a) {
    setForm({ ...a, parties: Array.isArray(a.parties) ? a.parties.join(', ') : a.parties, tags: Array.isArray(a.tags) ? a.tags.join(', ') : a.tags })
    setIsNew(false)
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const payload = {
      ...form,
      parties: form.parties.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (isNew) {
      const id = addAgreement(payload)
      setSelected(id)
    } else {
      updateAgreement(form.id, payload)
      setSelected(form.id)
    }
    setEditing(false)
    setIsNew(false)
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🤝</span>
        <div className="topbar-title">Agreements</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Contracts & commitments</span>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Agreements</span>
            <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>+ New</button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['all', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ background: filterStatus === s ? 'var(--accent)' : 'var(--bg)', color: filterStatus === s ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No agreements found.</div>}
          {filtered.map(a => (
            <div key={a.id} onClick={() => { setSelected(a.id); setEditing(false) }}
              style={{ padding: '10px 12px', cursor: 'pointer', background: selected === a.id ? 'var(--bg)' : 'transparent', borderLeft: selected === a.id ? '2px solid var(--accent)' : '2px solid transparent', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{a.title}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, border: `1px solid ${STATUS_COLOR[a.status]}`, color: STATUS_COLOR[a.status], textTransform: 'capitalize' }}>{a.status}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.type}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} agreements</div>
      </div>

      {/* Detail / Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{isNew ? 'New Agreement' : 'Edit Agreement'}</div>
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
                Type
                <select value={form.type} onChange={f('type')} style={iStyle}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Status
                <select value={form.status} onChange={f('status')} style={iStyle}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Start Date
                <input type="date" value={form.date} onChange={f('date')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Expiry Date
                <input type="date" value={form.expiryDate ?? ''} onChange={f('expiryDate')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Value / Stakes
                <input value={form.value ?? ''} onChange={f('value')} placeholder="e.g. $500, Dinner, etc." style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Parties (comma-separated)
                <input value={form.parties} onChange={f('parties')} placeholder="Jordan Malik, Ava Torres" style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Terms / Summary
                <textarea value={form.terms ?? ''} onChange={f('terms')} rows={4} style={{ ...iStyle, resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Tags (comma-separated)
                <input value={form.tags} onChange={f('tags')} placeholder="Work, Finance…" style={iStyle} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-1)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.signed} onChange={e => setForm(p => ({ ...p, signed: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                Signed / Acknowledged
              </label>
            </div>
          </form>
        ) : agreement ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{agreement.title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, border: `1px solid ${STATUS_COLOR[agreement.status]}`, color: STATUS_COLOR[agreement.status], textTransform: 'capitalize', fontWeight: 600 }}>{agreement.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{agreement.type}</span>
                  {agreement.signed && <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓ Signed</span>}
                  {agreement.tags?.map(t => <span key={t} style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', color: 'var(--text-3)' }}>{t}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(agreement)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { deleteAgreement(agreement.id); setSelected(null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Start Date', value: agreement.date },
                { label: 'Expiry', value: agreement.expiryDate ?? 'No expiry' },
                { label: 'Value / Stakes', value: agreement.value ?? '—' },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>PARTIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agreement.parties?.map(p => <span key={p} style={{ fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px' }}>{p}</span>)}
              </div>
            </div>

            {agreement.terms && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>TERMS</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>{agreement.terms}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
            <div style={{ fontSize: 32 }}>🤝</div>
            <div style={{ fontSize: 13 }}>Select an agreement or create a new one</div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }
