import { useState } from 'react'
import { useStore } from '../store.jsx'

const UNLOCK_OPTIONS = [
  { value: 'inactivity_90_days', label: '90 days of inactivity' },
  { value: 'inactivity_30_days', label: '30 days of inactivity' },
  { value: 'inactivity_180_days', label: '180 days of inactivity' },
  { value: 'manual', label: 'Manual unlock by trusted contact' },
]
const MSG_TYPES = ['Letter', 'Instructions', 'Video Link', 'Will Note', 'Message', 'Other']
const TABS = ['Messages', 'Settings', 'Assets']

const EMPTY_MSG = { title: '', recipient: '', type: 'Letter', content: '' }

export default function Posthumous() {
  const { data, updatePosthumous, addPosthumousMessage, updatePosthumousMessage, deletePosthumousMessage } = useStore()
  const ph = data.posthumous
  const [tab, setTab] = useState('Messages')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY_MSG)
  const [assetEdit, setAssetEdit] = useState(false)
  const [assetVal, setAssetVal] = useState('')

  const message = selected ? ph.messages.find(m => m.id === selected) : null

  function openNew() {
    setForm(EMPTY_MSG)
    setIsNew(true)
    setEditing(true)
    setSelected(null)
  }

  function openEdit(m) {
    setForm({ ...m })
    setIsNew(false)
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (isNew) {
      const id = addPosthumousMessage(form)
      setSelected(id)
    } else {
      updatePosthumousMessage(form.id, form)
      setSelected(form.id)
    }
    setEditing(false)
    setIsNew(false)
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🕯️</span>
        <div className="topbar-title">Posthumous</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Messages & wishes — delivered if you're ever gone</span>
      </div>
      <div className="scroll"><div className="pad">

      <div style={{ background: 'var(--surface)', border: '1px solid #e0a040', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#e0a040' }}>
        🔒 This content is sealed and private. It will only be delivered to your chosen contacts under the unlock condition you set. Last reviewed: {ph.lastReviewed}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setEditing(false) }}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', padding: '6px 14px', marginBottom: -1, color: tab === t ? 'var(--accent)' : 'var(--text-2)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Messages */}
      {tab === 'Messages' && (
        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 260px)', minHeight: 400 }}>
          {/* List */}
          <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 0', fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>+ New Message</button>
            {ph.messages.map(m => (
              <div key={m.id} onClick={() => { setSelected(m.id); setEditing(false) }}
                style={{ padding: '8px 10px', borderRadius: 4, cursor: 'pointer', background: selected === m.id ? 'var(--bg)' : 'var(--surface)', border: `1px solid ${selected === m.id ? 'var(--accent)' : 'var(--border)'}` }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.recipient} · {m.type}</div>
              </div>
            ))}
            {ph.messages.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '12px 0' }}>No messages yet.</div>}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {editing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{isNew ? 'New Message' : 'Edit Message'}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => { setEditing(false); setIsNew(false) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
                {[
                  { key: 'title', label: 'Title', required: true, placeholder: 'For Sofia…' },
                  { key: 'recipient', label: 'Recipient', placeholder: 'Name or "All"' },
                ].map(fi => (
                  <label key={fi.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                    {fi.label}
                    <input required={fi.required} value={form[fi.key]} onChange={f(fi.key)} placeholder={fi.placeholder} style={iStyle} />
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                  Type
                  <select value={form.type} onChange={f('type')} style={iStyle}>
                    {MSG_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                  Content
                  <textarea required value={form.content} onChange={f('content')} rows={10} placeholder="Write your message…" style={{ ...iStyle, resize: 'vertical' }} />
                </label>
              </form>
            ) : message ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{message.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>To: {message.recipient} · {message.type} · Created {message.createdAt}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(message)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => { deletePosthumousMessage(message.id); setSelected(null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', fontSize: 13, lineHeight: 1.8, color: 'var(--text-1)', whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
                <div style={{ fontSize: 32 }}>✉️</div>
                <div style={{ fontSize: 13 }}>Select a message or create a new one</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {tab === 'Settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Unlock Condition</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {UNLOCK_OPTIONS.map(o => (
                <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="unlock" value={o.value} checked={ph.unlockCondition === o.value}
                    onChange={() => updatePosthumous({ unlockCondition: o.value })}
                    style={{ accentColor: 'var(--accent)' }} />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Trusted Contacts</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>These people will be notified and given access when the unlock condition is met.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.contacts.map(c => {
                const active = ph.unlockContacts?.includes(c.id)
                return (
                  <button key={c.id} onClick={() => {
                    const cur = ph.unlockContacts ?? []
                    updatePosthumous({ unlockContacts: active ? cur.filter(x => x !== c.id) : [...cur, c.id] })
                  }}
                    style={{ background: active ? 'var(--accent)' : 'var(--bg)', color: active ? '#fff' : 'var(--text-1)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={() => updatePosthumous({ lastReviewed: new Date().toISOString().slice(0, 10) })}
            style={{ alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 4, padding: '7px 16px', fontSize: 13, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            ✓ Mark as Reviewed Today
          </button>
        </div>
      )}

      {/* Assets */}
      {tab === 'Assets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Asset & Distribution Notes</div>
            {!assetEdit
              ? <button onClick={() => { setAssetVal(ph.assetNotes ?? ''); setAssetEdit(true) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
              : <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { updatePosthumous({ assetNotes: assetVal }); setAssetEdit(false) }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setAssetEdit(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                </div>
            }
          </div>
          {assetEdit
            ? <textarea value={assetVal} onChange={e => setAssetVal(e.target.value)} rows={12}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '10px 12px', color: 'var(--text-1)', fontSize: 13, lineHeight: 1.7, boxSizing: 'border-box', resize: 'vertical' }} />
            : <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', fontSize: 13, lineHeight: 1.8, color: 'var(--text-2)', whiteSpace: 'pre-wrap', minHeight: 120 }}>
                {ph.assetNotes || <span style={{ color: 'var(--text-3)' }}>No asset notes yet. Click Edit to add distribution wishes.</span>}
              </div>
          }
        </div>
      )}
      </div></div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }
