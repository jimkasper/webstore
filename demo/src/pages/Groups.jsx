import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'

const GROUP_TYPES = ['Social', 'Work', 'Family', 'Interest', 'Networking', 'Other']

function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const hue = name.charCodeAt(0) * 37 % 360
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const EMPTY_GROUP = { name: '', emoji: '👥', type: 'Social', description: '', members: [] }

export default function Groups() {
  const { data, addGroup, updateGroup, deleteGroup } = useStore()
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY_GROUP)

  const group = selected ? data.groups.find(g => g.id === selected) : null

  const memberContacts = useMemo(() => {
    if (!group) return []
    return group.members.map(mid => data.contacts.find(c => c.id === mid)).filter(Boolean)
  }, [group, data.contacts])

  const nonMembers = useMemo(() => {
    if (!group) return data.contacts
    return data.contacts.filter(c => !group.members.includes(c.id))
  }, [group, data.contacts])

  function openNew() {
    setForm(EMPTY_GROUP)
    setIsNew(true)
    setEditing(true)
    setSelected(null)
  }

  function openEdit(g) {
    setForm({ ...g })
    setIsNew(false)
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (isNew) {
      const id = addGroup(form)
      setSelected(id)
    } else {
      updateGroup(form.id, form)
      setSelected(form.id)
    }
    setEditing(false)
    setIsNew(false)
  }

  function toggleMember(contactId) {
    if (group) {
      const members = group.members.includes(contactId)
        ? group.members.filter(m => m !== contactId)
        : [...group.members, contactId]
      updateGroup(group.id, { members })
    } else {
      setForm(f => ({
        ...f,
        members: f.members.includes(contactId) ? f.members.filter(m => m !== contactId) : [...f.members, contactId],
      }))
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Groups</span>
          <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {data.groups.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No groups yet.</div>}
          {data.groups.map(g => (
            <div key={g.id} onClick={() => { setSelected(g.id); setEditing(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', background: selected === g.id ? 'var(--bg)' : 'transparent', borderLeft: selected === g.id ? '2px solid var(--accent)' : '2px solid transparent' }}>
              <span style={{ fontSize: 22 }}>{g.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{g.members.length} member{g.members.length !== 1 ? 's' : ''} · {g.type}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{data.groups.length} groups</div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{isNew ? 'New Group' : 'Edit Group'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setEditing(false); setIsNew(false) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Emoji
                <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', color: 'var(--text-1)', fontSize: 18, textAlign: 'center' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Group Name *
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Type
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', color: 'var(--text-1)', fontSize: 13 }}>
                  {GROUP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
              Description
              <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical' }} />
            </label>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Members (click to add)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.contacts.map(c => {
                const active = form.members.includes(c.id)
                return (
                  <button key={c.id} type="button" onClick={() => setForm(f => ({ ...f, members: active ? f.members.filter(m => m !== c.id) : [...f.members, c.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, padding: '4px 10px 4px 6px', cursor: 'pointer' }}>
                    <Avatar name={c.name} size={22} />
                    <span style={{ fontSize: 12, color: active ? '#fff' : 'var(--text-1)', fontWeight: active ? 600 : 400 }}>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </form>
        ) : group ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 44 }}>{group.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{group.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{group.type} · {group.members.length} members</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(group)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { deleteGroup(group.id); setSelected(null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
            {group.description && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{group.description}</div>
            )}

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Members</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
              {memberContacts.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4 }}>
                  <Avatar name={c.name} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.tags.join(', ')}</div>
                  </div>
                  <button onClick={() => toggleMember(c.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: 'var(--text-3)', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              {memberContacts.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 0' }}>No members yet.</div>}
            </div>

            {nonMembers.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Add Members</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {nonMembers.map(c => (
                    <button key={c.id} onClick={() => toggleMember(c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px 4px 6px', cursor: 'pointer' }}>
                      <Avatar name={c.name} size={22} />
                      <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
            <div style={{ fontSize: 32 }}>👥</div>
            <div style={{ fontSize: 13 }}>Select a group or create a new one</div>
          </div>
        )}
      </div>
    </div>
  )
}
