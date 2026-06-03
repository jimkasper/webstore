import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const CONTACT_METHODS = ['Email', 'Phone', 'Text', 'WhatsApp', 'Instagram DM', 'LinkedIn', 'Twitter/X', 'Telegram', 'Signal', 'Discord']
const SOCIAL_PLATFORMS = ['Instagram', 'Twitter/X', 'LinkedIn', 'GitHub', 'YouTube', 'TikTok', 'Discord']
const COLLAB_TYPES = ['Project / Idea / Business', 'Hire / Employ / Get Help With', 'Make Offer', 'We Should...', 'Discussions / Podcast Episodes', "We're Both Into", 'Look Up', 'Financier']
const DOW_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const GROUP_TYPES = ['Social', 'Work', 'Family', 'Interest', 'Networking']
const GROUP_EMOJIS = ['🏃', '📚', '💼', '💻', '🏠', '🎨', '🎵', '⚽']

const EMPTY_CONTACT = {
  name: '', email: '', phone: '', handle: '', profession: '', company: '',
  location: '', met_at: '', when_met: '', mutual_friends: '', talked: '', birthday: '',
  followup_date: '', flagged: false,
  contact_methods: [], social_handles: [], personal_links: [], collaborations: [], tags: [], note: '', customFields: {},
}
const EMPTY_GROUP = { name: '', description: '', emoji: '🏃', type: 'Social', members: [] }

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function Avatar({ name, size = 38 }) {
  const initials = (name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')
  const hue = (name || 'X').charCodeAt(0) * 137 % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 55%, 38%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
      ...(size >= 56 ? { border: '2px solid #84cc16', boxSizing: 'border-box' } : {}),
    }}>
      {initials}
    </div>
  )
}

function Sect({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

function FSect({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inputSt = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, width: '100%', boxSizing: 'border-box' }

// ── Contact components ────────────────────────────────────────────────────────

function ContactCard({ contact, selected, onClick }) {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = contact.followup_date && contact.followup_date <= today
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
      cursor: 'pointer',
      background: selected ? 'var(--bg)' : 'transparent',
      borderLeft: `3px solid ${selected ? 'var(--accent)' : 'transparent'}`,
    }}>
      <Avatar name={contact.name} size={40} />
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{contact.name}</div>
          {contact.flagged && <span title="Flagged" style={{ fontSize: 11, flexShrink: 0 }}>🚩</span>}
          {overdue && <span title="Follow-up overdue" style={{ fontSize: 11, flexShrink: 0 }}>⏰</span>}
        </div>
        {contact.profession && <div style={{ fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.profession}</div>}
        {contact.company && <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.company}</div>}
        {(contact.tags || []).length > 0 && (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
            {(contact.tags || []).slice(0, 3).map(t => (
              <span key={t} style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--text-3)', borderRadius: 8, padding: '1px 5px' }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ContactDetail({ contact, onEdit, onDelete, customFields, onReminders, onToggleFlag }) {
  const { data } = useStore()
  const nav = useNavigate()
  const inSpace = (data.connections || []).some(cn => cn.handle === contact.handle)
  const today = new Date().toISOString().slice(0, 10)
  const overdueFollowup = contact.followup_date && contact.followup_date <= today
  const reminderCount = (data.contactReminders || []).filter(r => r.contactId === contact.id).length

  function handleDelete() {
    if (window.confirm(`Delete ${contact.name}?`)) onDelete(contact.id)
  }

  const infoItems = [
    contact.email    && { label: 'Email',    value: contact.email },
    contact.phone    && { label: 'Phone',    value: contact.phone },
    contact.location && { label: 'Location', value: contact.location },
    contact.birthday && { label: 'Birthday', value: contact.birthday },
  ].filter(Boolean)

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Avatar name={contact.name} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{contact.name}</div>
            {contact.flagged && <span style={{ fontSize: 14 }}>🚩</span>}
          </div>
          {contact.profession && <div style={{ fontSize: 14, color: 'var(--accent)', marginTop: 2 }}>{contact.profession}</div>}
          {contact.company && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{contact.company}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            {contact.handle && (
              <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: 12, padding: '2px 10px' }}>@{contact.handle}</span>
            )}
            {contact.handle && inSpace && (
              <button onClick={() => nav('/monogenes/connections')}
                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: '1px solid var(--accent)', borderRadius: 10, padding: '2px 8px', cursor: 'pointer' }}>
                View in Monogenes →
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => onToggleFlag(contact)} title={contact.flagged ? 'Unflag contact' : 'Flag contact'}
            style={{ background: contact.flagged ? 'rgba(239,68,68,0.12)' : 'none', border: `1px solid ${contact.flagged ? '#ef4444' : 'var(--border)'}`, borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer', color: contact.flagged ? '#ef4444' : 'var(--text-3)' }}>
            🚩
          </button>
          <button onClick={() => onReminders(contact.id)} title="Reminders"
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer', color: 'var(--text-2)', position: 'relative' }}>
            🔔{reminderCount > 0 && <span style={{ fontSize: 10, background: 'var(--accent)', color: '#0f172a', borderRadius: 8, padding: '0 4px', marginLeft: 3 }}>{reminderCount}</span>}
          </button>
          <button onClick={() => onEdit(contact)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
          <button onClick={handleDelete} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>

      {/* Follow-up */}
      {contact.followup_date && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: overdueFollowup ? 'rgba(239,68,68,0.08)' : 'var(--surface-2)', border: `1px solid ${overdueFollowup ? '#ef4444' : 'var(--border)'}`, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{overdueFollowup ? '⏰' : '📅'}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: overdueFollowup ? '#ef4444' : 'var(--text-2)' }}>
              {overdueFollowup ? 'Follow-up overdue' : 'Follow-up scheduled'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{contact.followup_date}</div>
          </div>
        </div>
      )}

      {infoItems.length > 0 && (
        <Sect label="Contact info">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {infoItems.map(f => (
              <div key={f.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{f.label}</div>
                <div style={{ fontSize: 13, marginTop: 2 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </Sect>
      )}

      {(contact.contact_methods || []).length > 0 && (
        <Sect label="Preferred contact">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(contact.contact_methods || []).map(m => (
              <span key={m} style={{ fontSize: 12, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 12, padding: '3px 10px' }}>{m}</span>
            ))}
          </div>
        </Sect>
      )}

      {(contact.met_at || contact.when_met || contact.mutual_friends || contact.talked) && (
        <Sect label="Context">
          {contact.met_at && <div style={{ fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-3)' }}>Met at: </span>{contact.met_at}</div>}
          {contact.when_met && <div style={{ fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-3)' }}>When: </span>{contact.when_met}</div>}
          {contact.mutual_friends && <div style={{ fontSize: 13, marginBottom: 4 }}><span style={{ color: 'var(--text-3)' }}>Mutual friends: </span>{contact.mutual_friends}</div>}
          {contact.talked && <div style={{ fontSize: 13 }}><span style={{ color: 'var(--text-3)' }}>Talked about: </span>{contact.talked}</div>}
        </Sect>
      )}

      {(contact.collaborations || []).length > 0 && (
        <Sect label="Collaborations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(contact.collaborations || []).map((col, i) => (
              <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{col.type}</div>
                {col.text && <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{col.text}</div>}
              </div>
            ))}
          </div>
        </Sect>
      )}

      {(contact.social_handles || []).length > 0 && (
        <Sect label="Social">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(contact.social_handles || []).map((sh, i) => (
              <span key={i} style={{ fontSize: 12, background: 'var(--surface-2)', color: 'var(--text-2)', borderRadius: 12, padding: '3px 10px' }}>
                {sh.platform}: @{sh.handle}
              </span>
            ))}
          </div>
        </Sect>
      )}

      {(contact.personal_links || []).length > 0 && (
        <Sect label="Links">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(contact.personal_links || []).map((lnk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 80 }}>{lnk.label}:</span>
                <a href={lnk.url} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lnk.url}
                </a>
              </div>
            ))}
          </div>
        </Sect>
      )}

      {(contact.tags || []).length > 0 && (
        <Sect label="Tags">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(contact.tags || []).map(t => (
              <span key={t} style={{ fontSize: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 8px', color: 'var(--text-2)' }}>{t}</span>
            ))}
          </div>
        </Sect>
      )}

      {contact.note && (
        <Sect label="Notes">
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)' }}>{contact.note}</div>
        </Sect>
      )}

      {customFields.length > 0 && (contact.customFields && Object.keys(contact.customFields).length > 0) && (
        <Sect label="Custom fields">
          {customFields.map(f => {
            const val = (contact.customFields || {})[f.id]
            return val ? (
              <div key={f.id} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)', minWidth: 90 }}>{f.label}:</span>
                <span>{val}</span>
              </div>
            ) : null
          })}
        </Sect>
      )}
    </div>
  )
}

function ContactForm({ form, setForm, onSave, onCancel, isNew, allTags, customFields }) {
  const [tagInput, setTagInput] = useState('')
  const [tagDropdown, setTagDropdown] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filteredTags = allTags.filter(t =>
    t.toLowerCase().includes(tagInput.toLowerCase()) && !(form.tags || []).includes(t)
  )

  function addTag(tag) {
    const trimmed = tag.trim()
    if (trimmed && !(form.tags || []).includes(trimmed))
      setForm(p => ({ ...p, tags: [...(p.tags || []), trimmed] }))
    setTagInput('')
    setTagDropdown(false)
  }

  function removeTag(tag) {
    setForm(p => ({ ...p, tags: (p.tags || []).filter(t => t !== tag) }))
  }

  function toggleMethod(m) {
    setForm(p => ({
      ...p,
      contact_methods: (p.contact_methods || []).includes(m)
        ? (p.contact_methods || []).filter(x => x !== m)
        : [...(p.contact_methods || []), m],
    }))
  }

  function addSocialHandle() {
    setForm(p => ({ ...p, social_handles: [...(p.social_handles || []), { platform: 'Instagram', handle: '' }] }))
  }
  function updateSocialHandle(i, key, val) {
    setForm(p => { const sh = [...(p.social_handles || [])]; sh[i] = { ...sh[i], [key]: val }; return { ...p, social_handles: sh } })
  }
  function removeSocialHandle(i) {
    setForm(p => ({ ...p, social_handles: (p.social_handles || []).filter((_, idx) => idx !== i) }))
  }

  function addPersonalLink() {
    setForm(p => ({ ...p, personal_links: [...(p.personal_links || []), { label: '', url: '' }] }))
  }
  function updatePersonalLink(i, key, val) {
    setForm(p => { const pl = [...(p.personal_links || [])]; pl[i] = { ...pl[i], [key]: val }; return { ...p, personal_links: pl } })
  }
  function removePersonalLink(i) {
    setForm(p => ({ ...p, personal_links: (p.personal_links || []).filter((_, idx) => idx !== i) }))
  }

  function addCollab() {
    setForm(p => ({ ...p, collaborations: [...(p.collaborations || []), { type: COLLAB_TYPES[0], text: '' }] }))
  }
  function updateCollab(i, key, val) {
    setForm(p => { const cl = [...(p.collaborations || [])]; cl[i] = { ...cl[i], [key]: val }; return { ...p, collaborations: cl } })
  }
  function removeCollab(i) {
    setForm(p => ({ ...p, collaborations: (p.collaborations || []).filter((_, idx) => idx !== i) }))
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{isNew ? 'New Contact' : 'Edit Contact'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!form.name.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', fontSize: 13, cursor: 'pointer', opacity: form.name.trim() ? 1 : 0.5 }}>Save</button>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>

      <FSect label="Basics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'name',   label: 'Full name *' },
            { key: 'email',  label: 'Email' },
            { key: 'phone',  label: 'Phone' },
            { key: 'handle', label: 'Handle (@username)' },
          ].map(f => (
            <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
              {f.label}
              <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={inputSt} />
            </label>
          ))}
        </div>
      </FSect>

      <FSect label="About">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'profession', label: 'Profession' },
            { key: 'company',    label: 'Company' },
            { key: 'location',   label: 'Location' },
            { key: 'birthday',   label: 'Birthday (MM/DD)' },
          ].map(f => (
            <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
              {f.label}
              <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} style={inputSt} />
            </label>
          ))}
        </div>
      </FSect>

      <FSect label="Context">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
            Where we met
            <input value={form.met_at || ''} onChange={e => set('met_at', e.target.value)} style={inputSt} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
            When we met
            <input value={form.when_met || ''} onChange={e => set('when_met', e.target.value)} placeholder="e.g. March 2024" style={inputSt} />
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
          Mutual friends
          <input value={form.mutual_friends || ''} onChange={e => set('mutual_friends', e.target.value)} placeholder="Names of mutual connections" style={inputSt} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
          Talked about
          <input value={form.talked || ''} onChange={e => set('talked', e.target.value)} style={inputSt} />
        </label>
      </FSect>

      <FSect label="Collaborations">
        {(form.collaborations || []).map((col, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
            <select value={col.type} onChange={e => updateCollab(i, 'type', e.target.value)}
              style={{ ...inputSt, width: 220, flex: 'none' }}>
              {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={col.text} onChange={e => updateCollab(i, 'text', e.target.value)}
              placeholder="Details (optional)" style={{ ...inputSt, flex: 1 }} />
            <button onClick={() => removeCollab(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '6px 4px' }}>×</button>
          </div>
        ))}
        <button onClick={addCollab} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
          + Add collaboration
        </button>
      </FSect>

      <FSect label="Preferred contact methods">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONTACT_METHODS.map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: 'var(--text-2)' }}>
              <input type="checkbox" checked={(form.contact_methods || []).includes(m)} onChange={() => toggleMethod(m)} style={{ accentColor: 'var(--accent)' }} />
              {m}
            </label>
          ))}
        </div>
      </FSect>

      <FSect label="Social handles">
        {(form.social_handles || []).map((sh, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <select value={sh.platform} onChange={e => updateSocialHandle(i, 'platform', e.target.value)}
              style={{ ...inputSt, width: 130, flex: 'none' }}>
              {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={sh.handle} onChange={e => updateSocialHandle(i, 'handle', e.target.value)}
              placeholder="@username" style={{ ...inputSt, flex: 1 }} />
            <button onClick={() => removeSocialHandle(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        ))}
        <button onClick={addSocialHandle} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
          + Add social handle
        </button>
      </FSect>

      <FSect label="Personal links">
        {(form.personal_links || []).map((lnk, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <input value={lnk.label} onChange={e => updatePersonalLink(i, 'label', e.target.value)}
              placeholder="Label (e.g. Portfolio)" style={{ ...inputSt, width: 130, flex: 'none' }} />
            <input value={lnk.url} onChange={e => updatePersonalLink(i, 'url', e.target.value)}
              placeholder="https://…" style={{ ...inputSt, flex: 1 }} />
            <button onClick={() => removePersonalLink(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        ))}
        <button onClick={addPersonalLink} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
          + Add link
        </button>
      </FSect>

      <FSect label="Follow-up & flags">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
            Follow-up date
            <input type="date" value={form.followup_date || ''} onChange={e => set('followup_date', e.target.value)} style={inputSt} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', paddingBottom: 6, color: form.flagged ? '#ef4444' : 'var(--text-2)' }}>
            <input type="checkbox" checked={!!form.flagged} onChange={e => set('flagged', e.target.checked)} style={{ accentColor: '#ef4444' }} />
            🚩 Flag contact
          </label>
        </div>
      </FSect>

      <FSect label="Tags">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {(form.tags || []).map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 8px', color: 'var(--text-2)' }}>
              {t}
              <span onClick={() => removeTag(t)} style={{ cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}>×</span>
            </span>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <input
            value={tagInput}
            onChange={e => { setTagInput(e.target.value); setTagDropdown(true) }}
            onFocus={() => setTagDropdown(true)}
            onBlur={() => setTimeout(() => setTagDropdown(false), 150)}
            onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); addTag(tagInput) } }}
            placeholder="Add tag… (Enter or comma to add)"
            style={inputSt}
          />
          {tagDropdown && filteredTags.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, zIndex: 20, maxHeight: 160, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
              {filteredTags.map(t => (
                <div key={t} onMouseDown={() => addTag(t)}
                  style={{ padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </FSect>

      <FSect label="Notes">
        <textarea value={form.note || ''} onChange={e => set('note', e.target.value)} rows={3}
          style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }} />
      </FSect>

      {customFields.length > 0 && (
        <FSect label="Custom fields">
          {customFields.map(f => (
            <label key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
              {f.label}
              <input
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'}
                value={(form.customFields || {})[f.id] || ''}
                onChange={e => setForm(p => ({ ...p, customFields: { ...(p.customFields || {}), [f.id]: e.target.value } }))}
                style={inputSt}
              />
            </label>
          ))}
        </FSect>
      )}
    </div>
  )
}

// ── Reminders modal ───────────────────────────────────────────────────────────

function RemindersModal({ contactId, contactName, onClose }) {
  const { data, addContactReminder, deleteContactReminder } = useStore()
  const reminders = (data.contactReminders || []).filter(r => r.contactId === contactId)

  const [type, setType] = useState('datetime')
  const [datetime, setDatetime] = useState('')
  const [dow, setDow] = useState(1)
  const [time, setTime] = useState('09:00')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radius, setRadius] = useState(500)
  const [locLabel, setLocLabel] = useState('')

  function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      setLat(pos.coords.latitude.toFixed(6))
      setLng(pos.coords.longitude.toFixed(6))
    })
  }

  function handleAdd() {
    if (type === 'datetime' && !datetime) return
    if (type === 'location' && (!lat || !lng)) return
    const base = { contactId, type }
    if (type === 'datetime') addContactReminder({ ...base, datetime })
    else if (type === 'dayofweek') addContactReminder({ ...base, dow: Number(dow), time })
    else addContactReminder({ ...base, lat: Number(lat), lng: Number(lng), radius: Number(radius), label: locLabel })
    setDatetime(''); setLocLabel(''); setLat(''); setLng('')
  }

  function formatReminder(r) {
    if (r.type === 'datetime') return `📅 ${new Date(r.datetime).toLocaleString()}`
    if (r.type === 'dayofweek') return `📆 Every ${DOW_LABELS[r.dow]} at ${r.time}`
    return `📍 Within ${r.radius}m of ${r.label || `${r.lat?.toFixed(3)}, ${r.lng?.toFixed(3)}`}`
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, width: 400, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>🔔 Reminders — {contactName}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}>×</button>
        </div>

        {reminders.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {reminders.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 10 }}>
                <div style={{ fontSize: 13 }}>{formatReminder(r)}</div>
                <button onClick={() => deleteContactReminder(r.id)} style={{ background: 'none', border: 'none', color: '#e05c5c', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {reminders.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>No reminders set.</div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Add reminder</div>

          {/* Type picker */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[['datetime', '📅 Date/Time'], ['dayofweek', '📆 Weekly'], ['location', '📍 Location']].map(([k, label]) => (
              <button key={k} onClick={() => setType(k)} style={{
                flex: 1, padding: '5px 4px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                background: type === k ? 'var(--accent)' : 'var(--bg)',
                color: type === k ? '#0f172a' : 'var(--text-2)',
                border: `1px solid ${type === k ? 'var(--accent)' : 'var(--border)'}`,
              }}>{label}</button>
            ))}
          </div>

          {type === 'datetime' && (
            <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} style={{ ...inputSt, marginBottom: 10 }} />
          )}

          {type === 'dayofweek' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select value={dow} onChange={e => setDow(e.target.value)} style={{ ...inputSt, flex: 1 }}>
                {DOW_LABELS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inputSt, width: 100, flex: 'none' }} />
            </div>
          )}

          {type === 'location' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" style={{ ...inputSt, flex: 1 }} />
                <input value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" style={{ ...inputSt, flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input value={locLabel} onChange={e => setLocLabel(e.target.value)} placeholder="Location label (e.g. Gym)" style={{ ...inputSt, flex: 1 }} />
                <input type="number" value={radius} onChange={e => setRadius(e.target.value)} placeholder="Radius (m)" style={{ ...inputSt, width: 100, flex: 'none' }} min={50} />
              </div>
              <button onClick={useMyLocation} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                📍 Use my current location
              </button>
            </div>
          )}

          <button onClick={handleAdd}
            disabled={type === 'datetime' ? !datetime : type === 'location' ? !lat || !lng : false}
            style={{ background: 'var(--accent)', color: '#0f172a', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: (type === 'datetime' && !datetime) || (type === 'location' && (!lat || !lng)) ? 0.5 : 1 }}>
            Add Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Group components ──────────────────────────────────────────────────────────

function GroupDetail({ group, contacts, onEdit, onDelete }) {
  const members = (group.members || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)
  function handleDelete() {
    if (window.confirm(`Delete group "${group.name}"?`)) onDelete(group.id)
  }
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>{group.emoji}</span>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{group.name}</div>
            <span style={{ fontSize: 11, background: 'var(--surface-2)', color: 'var(--text-3)', borderRadius: 8, padding: '2px 8px' }}>{group.type}</span>
          </div>
          {group.description && <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 420, lineHeight: 1.5 }}>{group.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(group)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
          <button onClick={handleDelete} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
        </div>
      </div>

      <Sect label={`Members (${members.length})`}>
        {members.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No members yet. Edit group to add contacts.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={c.name} size={34} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  {(c.profession || c.company) && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{[c.profession, c.company].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Sect>
    </div>
  )
}

function GroupForm({ form, setForm, onSave, onCancel, contacts }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  function toggleMember(id) {
    setForm(p => ({
      ...p,
      members: (p.members || []).includes(id)
        ? (p.members || []).filter(m => m !== id)
        : [...(p.members || []), id],
    }))
  }
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{form.id ? 'Edit Group' : 'New Group'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!form.name.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', fontSize: 13, cursor: 'pointer', opacity: form.name.trim() ? 1 : 0.5 }}>Save</button>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>

      <FSect label="Group details">
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
          Name *
          <input value={form.name || ''} onChange={e => set('name', e.target.value)} style={inputSt} autoFocus />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
          Description
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2}
            style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }} />
        </label>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Emoji</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {GROUP_EMOJIS.map(e => (
              <button key={e} onClick={() => set('emoji', e)} style={{ fontSize: 20, background: form.emoji === e ? 'var(--accent-bg)' : 'var(--bg)', border: `1px solid ${form.emoji === e ? 'rgba(167,139,250,.4)' : 'var(--border)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>{e}</button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-3)' }}>
          Type
          <select value={form.type || 'Social'} onChange={e => set('type', e.target.value)} style={{ ...inputSt }}>
            {GROUP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </FSect>

      <FSect label="Members">
        <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {contacts.map(c => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}>
              <input type="checkbox" checked={(form.members || []).includes(c.id)} onChange={() => toggleMember(c.id)} style={{ accentColor: 'var(--accent)' }} />
              <Avatar name={c.name} size={26} />
              <span style={{ fontSize: 13 }}>{c.name}</span>
              {c.profession && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>— {c.profession}</span>}
            </label>
          ))}
        </div>
      </FSect>
    </div>
  )
}

// ── Custom fields modal ───────────────────────────────────────────────────────

function CustomFieldsModal({ onClose }) {
  const { data, addContactCustomField, deleteContactCustomField } = useStore()
  const [label, setLabel] = useState('')
  const [type, setType] = useState('text')
  const fields = data.contactCustomFields || []

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, width: 360, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Custom Fields</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}>×</button>
        </div>

        {fields.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>No custom fields yet.</div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {fields.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{f.type}</div>
                </div>
                <button onClick={() => deleteContactCustomField(f.id)} style={{ background: 'none', border: 'none', color: '#e05c5c', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Add field</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Field name"
              onKeyDown={e => { if (e.key === 'Enter' && label.trim()) { addContactCustomField({ label: label.trim(), type }); setLabel('') } }}
              style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 13 }} />
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 13 }}>
              {['text', 'date', 'number', 'url'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={() => { if (label.trim()) { addContactCustomField({ label: label.trim(), type }); setLabel('') } }}
            disabled={!label.trim()}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer', opacity: label.trim() ? 1 : 0.5 }}>
            Add field
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Mailing List components ───────────────────────────────────────────────────

const Q_TYPES = [
  { value: 'multicheck', label: 'Multi-select (checkboxes)' },
  { value: 'radio',      label: 'Single choice (radio)' },
  { value: 'toggles',    label: 'Toggle switches' },
  { value: 'text',       label: 'Short text' },
  { value: 'textarea',   label: 'Long text' },
  { value: 'url',        label: 'URL / Link' },
]

function ContactPickerModal({ contacts, alreadyIn, onAdd, onClose }) {
  const [q, setQ] = useState('')
  const available = contacts.filter(c =>
    !alreadyIn.includes(c.id) &&
    ((c.name || '').toLowerCase().includes(q.toLowerCase()) ||
     (c.email || '').toLowerCase().includes(q.toLowerCase()))
  )
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, width: 360, maxHeight: 500, display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Add Contacts to List</div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search contacts…" style={{ ...inputSt, marginBottom: 12 }} />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {available.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>No contacts to add.</div>}
          {available.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={c.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.email}</div>
              </div>
              <button onClick={() => onAdd(c.id)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 0', fontSize: 13, cursor: 'pointer', color: 'var(--text-2)' }}>Done</button>
      </div>
    </div>
  )
}

function EntryDetail({ entry, list, contacts, onDelete, onCreateContact }) {
  const [expanded, setExpanded] = useState(false)
  const linked = entry.contactId ? contacts.find(c => c.id === entry.contactId) : null
  const roles = entry.data?.roles || []
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar name={entry.data?.name || '?'} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{entry.data?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.data?.email}{entry.data?.phone ? ' · ' + entry.data.phone : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
          {roles.map(r => {
            const role = (list.roles || []).find(rl => rl.label === r)
            return <span key={r} style={{ fontSize: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px' }}>{role?.emoji || ''} {r}</span>
          })}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(entry.submittedAt).toLocaleDateString()}</span>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', color: 'var(--text-3)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</button>
        <button onClick={() => onDelete(entry.id)} style={{ background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: '#ef4444', flexShrink: 0 }} title="Remove">✕</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12 }}>
          {entry.data?.zip && <div style={{ marginBottom: 4 }}><b>Zip:</b> {entry.data.zip}</div>}
          {roles.map(roleName => {
            const roleConfig = (list.roles || []).find(rl => rl.label === roleName)
            const rData = entry.data?.roleData?.[roleName] || {}
            if (!roleConfig) return null
            return (
              <div key={roleName} style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-1)' }}>{roleConfig.emoji} {roleName}</div>
                {roleConfig.questions.map(q => {
                  const val = rData[q.id]
                  if (!val || (Array.isArray(val) && val.length === 0)) return null
                  return (
                    <div key={q.id} style={{ marginBottom: 3, color: 'var(--text-2)' }}>
                      <span style={{ color: 'var(--text-3)' }}>{q.label}: </span>
                      {Array.isArray(val) ? val.join(', ') : val}
                    </div>
                  )
                })}
              </div>
            )
          })}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            {linked
              ? <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓ Linked to {linked.name}</span>
              : <button onClick={() => onCreateContact(entry)} style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-2)' }}>+ Create Contact from this entry</button>
            }
          </div>
        </div>
      )}
    </div>
  )
}

function FormBuilderPanel({ list, onChange }) {
  const [activeRole, setActiveRole] = useState(null)
  const [newRoleEmoji, setNewRoleEmoji] = useState('✦')
  const [newRoleLabel, setNewRoleLabel] = useState('')
  const [newRoleSub, setNewRoleSub] = useState('')
  const [addingQForRole, setAddingQForRole] = useState(null)
  const [newQ, setNewQ] = useState({ type: 'multicheck', label: '', options: '' })

  function patchFieldKey(key, patch) {
    onChange({ ...list, fields: { ...list.fields, [key]: { ...list.fields?.[key], ...patch } } })
  }
  function addRole() {
    if (!newRoleLabel.trim()) return
    const id = `role-${Date.now()}`
    onChange({ ...list, roles: [...(list.roles || []), { id, emoji: newRoleEmoji, label: newRoleLabel.trim(), subtitle: newRoleSub.trim(), questions: [] }] })
    setNewRoleLabel(''); setNewRoleSub(''); setNewRoleEmoji('✦')
  }
  function deleteRole(roleId) {
    onChange({ ...list, roles: (list.roles || []).filter(r => r.id !== roleId) })
    if (activeRole === roleId) setActiveRole(null)
  }
  function updateRole(roleId, patch) {
    onChange({ ...list, roles: (list.roles || []).map(r => r.id === roleId ? { ...r, ...patch } : r) })
  }
  function addQuestion(roleId) {
    if (!newQ.label.trim()) return
    const q = { id: `rq-${Date.now()}`, type: newQ.type, label: newQ.label.trim() }
    if (['multicheck','radio','toggles'].includes(newQ.type) && newQ.options.trim()) {
      q.options = newQ.options.split(',').map(s => s.trim()).filter(Boolean)
    }
    onChange({ ...list, roles: (list.roles || []).map(r => r.id === roleId ? { ...r, questions: [...r.questions, q] } : r) })
    setNewQ({ type: 'multicheck', label: '', options: '' })
    setAddingQForRole(null)
  }
  function deleteQuestion(roleId, qid) {
    onChange({ ...list, roles: (list.roles || []).map(r => r.id === roleId ? { ...r, questions: r.questions.filter(q => q.id !== qid) } : r) })
  }

  const fields = list.fields || {}
  const tinyBtn = (col = '#ef4444') => ({ background: 'none', border: 'none', cursor: 'pointer', color: col, fontSize: 12, padding: '2px 4px', flexShrink: 0 })

  return (
    <div style={{ padding: 16 }}>
      {/* Basic fields */}
      <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 10 }}>Form Fields</div>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Name is always required.</div>
        {[
          ['email',           '📧 Email',             true],
          ['phone',           '📞 Phone number',       false],
          ['zip',             '📮 Zip code',           false],
          ['preferredContact','💬 Preferred contact',  false],
        ].map(([key, label, locked]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 13, cursor: locked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={locked || (fields[key]?.enabled || false)} disabled={locked} onChange={e => patchFieldKey(key, { enabled: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
              {label}
            </label>
            {(fields[key]?.enabled || locked) && (
              <label style={{ fontSize: 11, color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={fields[key]?.required || locked} disabled={locked} onChange={e => patchFieldKey(key, { required: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
                Required
              </label>
            )}
          </div>
        ))}
        <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
            <input type="checkbox" checked={fields.customQuestion?.enabled || false} onChange={e => patchFieldKey('customQuestion', { enabled: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
            ❓ Custom question
          </label>
          {fields.customQuestion?.enabled && (
            <input value={fields.customQuestion?.label || ''} onChange={e => patchFieldKey('customQuestion', { label: e.target.value })}
              placeholder="e.g. How did you hear about us?" style={{ ...inputSt, fontSize: 12 }} />
          )}
        </div>
      </div>

      {/* Roles */}
      <div style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 6 }}>Role Categories</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Selecting a role reveals role-specific questions.</div>

      {(list.roles || []).map(role => (
        <div key={role.id} style={{ background: 'var(--bg)', border: `1px solid ${activeRole === role.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', cursor: 'pointer' }}
            onClick={() => setActiveRole(a => a === role.id ? null : role.id)}>
            <span style={{ fontSize: 18 }}>{role.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{role.label}</div>
              {role.subtitle && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{role.subtitle}</div>}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{role.questions.length} Q</span>
            <button onClick={e => { e.stopPropagation(); deleteRole(role.id) }} style={tinyBtn()} title="Delete role">✕</button>
            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{activeRole === role.id ? '▲' : '▼'}</span>
          </div>

          {activeRole === role.id && (
            <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 10 }}>
                <input value={role.emoji} onChange={e => updateRole(role.id, { emoji: e.target.value })} style={{ ...inputSt, width: 48, textAlign: 'center' }} maxLength={4} />
                <input value={role.label} onChange={e => updateRole(role.id, { label: e.target.value })} placeholder="Label" style={{ ...inputSt, flex: 1 }} />
                <input value={role.subtitle || ''} onChange={e => updateRole(role.id, { subtitle: e.target.value })} placeholder="Subtitle (optional)" style={{ ...inputSt, flex: 2 }} />
              </div>
              {role.questions.map(q => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{q.type}</span>
                    <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>—</span>
                    <span>{q.label}</span>
                    {q.options && <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 2 }}>{q.options.slice(0,4).join(' · ')}{q.options.length > 4 ? ` +${q.options.length - 4}` : ''}</div>}
                  </div>
                  <button onClick={() => deleteQuestion(role.id, q.id)} style={tinyBtn()} title="Remove">✕</button>
                </div>
              ))}
              {addingQForRole === role.id ? (
                <div style={{ background: 'var(--surface)', borderRadius: 6, padding: 10, marginTop: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <select value={newQ.type} onChange={e => setNewQ(q => ({ ...q, type: e.target.value }))} style={{ ...inputSt, width: 190 }}>
                      {Q_TYPES.map(qt => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
                    </select>
                    <input value={newQ.label} onChange={e => setNewQ(q => ({ ...q, label: e.target.value }))} placeholder="Question label…" style={{ ...inputSt, flex: 1 }} />
                  </div>
                  {['multicheck','radio','toggles'].includes(newQ.type) && (
                    <input value={newQ.options} onChange={e => setNewQ(q => ({ ...q, options: e.target.value }))}
                      placeholder="Options separated by commas…" style={{ ...inputSt, marginBottom: 8 }} />
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => addQuestion(role.id)} disabled={!newQ.label.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 12, cursor: 'pointer', opacity: newQ.label.trim() ? 1 : 0.5 }}>Add</button>
                    <button onClick={() => setAddingQForRole(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-2)' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingQForRole(role.id)} style={{ marginTop: 10, background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--text-3)', width: '100%' }}>+ Add question</button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add role */}
      <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 6, padding: 12, marginTop: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--text-2)' }}>+ New Role</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input value={newRoleEmoji} onChange={e => setNewRoleEmoji(e.target.value)} style={{ ...inputSt, width: 48, textAlign: 'center' }} maxLength={4} placeholder="✦" />
          <input value={newRoleLabel} onChange={e => setNewRoleLabel(e.target.value)} placeholder="Label (e.g. Rapper)" style={{ ...inputSt, flex: 1 }} />
          <input value={newRoleSub} onChange={e => setNewRoleSub(e.target.value)} placeholder="Subtitle (optional)" style={{ ...inputSt, flex: 2 }} />
        </div>
        <button onClick={addRole} disabled={!newRoleLabel.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 16px', fontSize: 12, cursor: 'pointer', opacity: newRoleLabel.trim() ? 1 : 0.5 }}>Add Role</button>
      </div>
    </div>
  )
}

function MailingListDetail({ list, contacts, onEditMeta, onUpdateList, onDelete, onAddContact, onRemoveContact, onDeleteEntry, onCreateContactFromEntry }) {
  const [subTab, setSubTab] = useState('members')
  const [showPicker, setShowPicker] = useState(false)

  const memberContacts = (list.memberContactIds || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)
  const entries = list.entries || []
  const shareUrl = `${window.location.origin}/autogenes/join/${list.shareSlug}`

  const stb = active => ({
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    padding: '6px 12px', fontSize: 12, cursor: 'pointer',
    color: active ? 'var(--accent)' : 'var(--text-3)', fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ padding: 20, maxWidth: 760, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{list.name}</div>
            <span style={{ fontSize: 11, background: list.active !== false ? '#166534' : '#374151', color: list.active !== false ? '#bbf7d0' : '#d1d5db', borderRadius: 10, padding: '1px 8px' }}>{list.active !== false ? 'Active' : 'Paused'}</span>
          </div>
          {list.description && <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{list.description}</div>}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>🔗 Share link:</span>
            <code style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{shareUrl}</code>
            <button onClick={() => navigator.clipboard?.writeText(shareUrl).catch(() => {})} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--text-2)' }}>Copy</button>
            <a href={`/autogenes/join/${list.shareSlug}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Preview ↗</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEditMeta} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--text-2)' }}>Edit</button>
          <button onClick={() => window.confirm('Delete this list?') && onDelete(list.id)} style={{ background: 'none', border: '1px solid #ef4444', borderRadius: 4, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>Delete</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        {[
          ['Total members', (list.memberContactIds || []).length + entries.length],
          ['Form entries', entries.length],
          ['Roles', (list.roles || []).length],
        ].map(([label, value]) => (
          <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <button style={stb(subTab === 'members')} onClick={() => setSubTab('members')}>Members & Entries</button>
        <button style={stb(subTab === 'builder')} onClick={() => setSubTab('builder')}>Form Builder</button>
      </div>

      {subTab === 'members' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Contacts ({memberContacts.length})</div>
            <button onClick={() => setShowPicker(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>+ Add Contact</button>
          </div>
          {memberContacts.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>No contacts added directly yet.</div>}
          {memberContacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={c.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.email || c.phone}</div>
              </div>
              <button onClick={() => onRemoveContact(list.id, c.id)} style={{ background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: '#ef4444' }} title="Remove">✕</button>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Form Submissions ({entries.length})</div>
          </div>
          {entries.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No submissions yet — share the link above to collect responses.</div>}
          {entries.map(e => (
            <EntryDetail key={e.id} entry={e} list={list} contacts={contacts}
              onDelete={id => onDeleteEntry(list.id, id)}
              onCreateContact={onCreateContactFromEntry} />
          ))}
        </div>
      )}

      {subTab === 'builder' && (
        <FormBuilderPanel list={list} onChange={updated => onUpdateList(list.id, updated)} />
      )}

      {showPicker && (
        <ContactPickerModal contacts={contacts} alreadyIn={list.memberContactIds || []}
          onAdd={id => onAddContact(list.id, id)} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}

function MailingListForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={{ padding: 20, maxWidth: 540 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{form.id ? 'Edit List' : 'New Mailing List'}</div>
      <FSect label="List Info">
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Name *</label>
          <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hip-Hop Night" style={inputSt} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Description</label>
          <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short tagline shown on the sign-up form" style={inputSt} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>URL Slug</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>/autogenes/join/</span>
            <input value={form.shareSlug || ''} onChange={e => setForm(f => ({ ...f, shareSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              placeholder="hip-hop-night" style={{ ...inputSt, flex: 1 }} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
          List is active (accepting sign-ups)
        </label>
      </FSect>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onSave} disabled={!form.name?.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontSize: 13, cursor: 'pointer', opacity: form.name?.trim() ? 1 : 0.5 }}>Save</button>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--text-2)' }}>Cancel</button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Contacts() {
  const {
    data, addContact, updateContact, deleteContact,
    addGroup, updateGroup, deleteGroup,
    addContactReminder, deleteContactReminder,
    addMailingList, updateMailingList, deleteMailingList,
    addMailingEntry, deleteMailingEntry,
    addContactToMailingList, removeContactFromMailingList,
  } = useStore()

  const [tab, setTab] = useState('contacts')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [sortBy, setSortBy] = useState('az')
  const [filterCollab, setFilterCollab] = useState('')
  const [filterFlagged, setFilterFlagged] = useState(false)
  const [filterFollowup, setFilterFollowup] = useState(false)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('view')
  const [form, setForm] = useState(EMPTY_CONTACT)
  const [isNew, setIsNew] = useState(false)
  const [showCustomFields, setShowCustomFields] = useState(false)
  const [showRemindersFor, setShowRemindersFor] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupMode, setGroupMode] = useState('view')
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP)
  const [showFilters, setShowFilters] = useState(false)

  // Mailing Lists state
  const [selectedList, setSelectedList] = useState(null)
  const [listMode, setListMode] = useState('view') // 'view' | 'form'
  const [listForm, setListForm] = useState({ name: '', description: '', shareSlug: '', active: true })

  const customFields = data.contactCustomFields || []

  // Request notification permission + fire due reminders on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const now = new Date()
    const todayDow = now.getDay()
    ;(data.contactReminders || []).forEach(r => {
      const contact = data.contacts.find(c => c.id === r.contactId)
      if (!contact) return
      if (r.type === 'datetime') {
        const dt = new Date(r.datetime)
        if (dt <= now) {
          new Notification(`Reminder: ${contact.name}`, {
            body: `Follow up with ${contact.name}`,
            data: { url: '/autogenes/contacts' },
          })
        }
      } else if (r.type === 'dayofweek') {
        if (Number(r.dow) === todayDow) {
          const [h, m] = (r.time || '09:00').split(':').map(Number)
          const fireTime = new Date(now); fireTime.setHours(h, m, 0, 0)
          if (now >= fireTime) {
            new Notification(`Weekly reminder: ${contact.name}`, {
              body: `It's ${DOW_LABELS[r.dow]} — reach out to ${contact.name}`,
              data: { url: '/autogenes/contacts' },
            })
          }
        }
      } else if (r.type === 'location') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const dist = haversine(pos.coords.latitude, pos.coords.longitude, r.lat, r.lng)
            if (dist <= r.radius) {
              new Notification(`You're near ${r.label || 'a saved location'}`, {
                body: `Contact ${contact.name} while you're nearby!`,
                data: { url: '/autogenes/contacts' },
              })
            }
          })
        }
      }
    })
  }, [data.contactReminders, data.contacts])

  const allTags = useMemo(() => {
    const s = new Set()
    data.contacts.forEach(c => (c.tags || []).forEach(t => s.add(t)))
    return [...s].sort()
  }, [data.contacts])

  const today = new Date().toISOString().slice(0, 10)

  const filtered = useMemo(() => {
    let list = [...data.contacts]

    if (filterTag !== 'All') list = list.filter(c => (c.tags || []).includes(filterTag))
    if (filterFlagged) list = list.filter(c => c.flagged)
    if (filterFollowup) list = list.filter(c => c.followup_date && c.followup_date <= today)
    if (filterCollab) list = list.filter(c => (c.collaborations || []).some(col => col.type === filterCollab))

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.handle?.toLowerCase().includes(q) ||
        c.profession?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.met_at?.toLowerCase().includes(q) ||
        c.talked?.toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name)
      if (sortBy === 'za') return b.name.localeCompare(a.name)
      if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '')
      if (sortBy === 'oldest') return (a.id || '').localeCompare(b.id || '')
      if (sortBy === 'followup') {
        if (!a.followup_date && !b.followup_date) return 0
        if (!a.followup_date) return 1
        if (!b.followup_date) return -1
        return a.followup_date.localeCompare(b.followup_date)
      }
      return 0
    })

    return list
  }, [data.contacts, filterTag, filterFlagged, filterFollowup, filterCollab, search, sortBy, today])

  const contact = selected ? data.contacts.find(c => c.id === selected) : null
  const reminderContact = showRemindersFor ? data.contacts.find(c => c.id === showRemindersFor) : null

  function openNew() {
    setForm({ ...EMPTY_CONTACT, customFields: {} })
    setIsNew(true)
    setMode('form')
    setSelected(null)
  }

  function openEdit(c) {
    setForm({ ...EMPTY_CONTACT, ...c, customFields: c.customFields || {} })
    setIsNew(false)
    setMode('form')
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (isNew) {
      const id = addContact({ ...form, lastContact: new Date().toISOString().slice(0, 10) })
      setSelected(id)
    } else {
      updateContact(form.id, form)
      setSelected(form.id)
    }
    setMode('view')
    setIsNew(false)
  }

  function handleDelete(id) {
    deleteContact(id)
    setSelected(null)
    setMode('view')
  }

  function handleToggleFlag(c) {
    updateContact(c.id, { ...c, flagged: !c.flagged })
  }

  function exportCSV() {
    const cols = ['name', 'email', 'phone', 'handle', 'profession', 'company', 'location', 'birthday', 'met_at', 'when_met', 'mutual_friends', 'talked', 'followup_date', 'flagged', 'note', 'tags', 'contact_methods']
    const escape = v => {
      if (v == null) return ''
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = [
      cols.join(','),
      ...data.contacts.map(c =>
        cols.map(k => {
          if (k === 'tags' || k === 'contact_methods') return escape((c[k] || []).join('; '))
          if (k === 'flagged') return c[k] ? 'yes' : 'no'
          return escape(c[k])
        }).join(',')
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'contacts.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // Group helpers
  const group = selectedGroup ? data.groups.find(g => g.id === selectedGroup) : null

  function openNewGroup() {
    setGroupForm({ ...EMPTY_GROUP })
    setGroupMode('form')
    setSelectedGroup(null)
  }

  function openEditGroup(g) {
    setGroupForm({ ...g })
    setGroupMode('form')
  }

  function handleSaveGroup() {
    if (!groupForm.name.trim()) return
    if (groupForm.id) {
      updateGroup(groupForm.id, groupForm)
      setSelectedGroup(groupForm.id)
    } else {
      const id = addGroup(groupForm)
      setSelectedGroup(id)
    }
    setGroupMode('view')
  }

  function handleDeleteGroup(id) {
    deleteGroup(id)
    setSelectedGroup(null)
    setGroupMode('view')
  }

  // Mailing list helpers
  const mailingLists = data.mailingLists || []
  const activeList = selectedList ? mailingLists.find(l => l.id === selectedList) : null

  function openNewList() {
    setListForm({ name: '', description: '', shareSlug: '', active: true })
    setListMode('form')
    setSelectedList(null)
  }

  function openEditList(l) {
    setListForm({ ...l })
    setListMode('form')
  }

  function handleSaveList() {
    if (!listForm.name?.trim()) return
    if (listForm.id) {
      updateMailingList(listForm.id, listForm)
      setSelectedList(listForm.id)
    } else {
      const id = addMailingList(listForm)
      setSelectedList(id)
    }
    setListMode('view')
  }

  function handleCreateContactFromEntry(entry) {
    const id = addContact({
      name: entry.data?.name || '',
      email: entry.data?.email || '',
      phone: entry.data?.phone || '',
      tags: [],
      note: `Added from mailing list entry (${new Date(entry.submittedAt).toLocaleDateString()})`,
    })
    if (activeList) addContactToMailingList(activeList.id, id)
  }

  const tabBtn = active => ({
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    padding: '8px 14px', fontSize: 13, cursor: 'pointer',
    color: active ? 'var(--text-1)' : 'var(--text-3)', fontWeight: active ? 600 : 400,
  })

  const activeFilters = (filterFlagged ? 1 : 0) + (filterFollowup ? 1 : 0) + (filterCollab ? 1 : 0) + (filterTag !== 'All' ? 1 : 0)

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>👤</span>
        <div className="topbar-title">Contacts</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{data.contacts.length} people · {data.groups.length} groups</span>
        <div style={{ flex: 1 }} />
        {tab === 'contacts' && (
          <>
            <button onClick={exportCSV} title="Export CSV"
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-2)' }}>
              ⬇ CSV
            </button>
            <button onClick={() => setShowCustomFields(true)} title="Custom fields"
              style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-3)', padding: '0 4px' }}>⚙</button>
          </>
        )}
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button style={tabBtn(tab === 'contacts')} onClick={() => setTab('contacts')}>
          Contacts <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({data.contacts.length})</span>
        </button>
        <button style={tabBtn(tab === 'groups')} onClick={() => setTab('groups')}>
          Groups <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({data.groups.length})</span>
        </button>
        <button style={tabBtn(tab === 'lists')} onClick={() => setTab('lists')}>
          Lists <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({(data.mailingLists || []).length})</span>
        </button>
      </div>

      {/* ── Contacts tab ── */}
      {tab === 'contacts' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left panel */}
          <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 12 }} />
                <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New</button>
              </div>

              {/* Sort + Filter row */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-2)', fontSize: 11, cursor: 'pointer' }}>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="followup">Follow-up due</option>
                </select>
                <button onClick={() => setShowFilters(f => !f)}
                  style={{ background: activeFilters > 0 ? 'var(--accent)' : 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: activeFilters > 0 ? '#0f172a' : 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  ⚙ Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
                </button>
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', marginBottom: 6, fontSize: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'pointer', color: filterFlagged ? '#ef4444' : 'var(--text-2)' }}>
                    <input type="checkbox" checked={filterFlagged} onChange={e => setFilterFlagged(e.target.checked)} style={{ accentColor: '#ef4444' }} />
                    🚩 Flagged only
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', color: filterFollowup ? 'var(--accent)' : 'var(--text-2)' }}>
                    <input type="checkbox" checked={filterFollowup} onChange={e => setFilterFollowup(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                    ⏰ Overdue follow-up
                  </label>
                  <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>Collaboration type:</div>
                  <select value={filterCollab} onChange={e => setFilterCollab(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--text-1)', fontSize: 12 }}>
                    <option value="">All</option>
                    {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {activeFilters > 0 && (
                    <button onClick={() => { setFilterFlagged(false); setFilterFollowup(false); setFilterCollab(''); setFilterTag('All') }}
                      style={{ marginTop: 8, background: 'none', border: 'none', fontSize: 11, color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>
                      × Clear all filters
                    </button>
                  )}
                </div>
              )}

              {allTags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['All', ...allTags].map(t => (
                    <button key={t} onClick={() => setFilterTag(t)} style={{
                      background: filterTag === t ? 'var(--accent)' : 'var(--bg)',
                      color: filterTag === t ? '#fff' : 'var(--text-2)',
                      border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', fontSize: 11, cursor: 'pointer',
                    }}>{t}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No contacts found.</div>}
              {filtered.map(c => (
                <ContactCard key={c.id} contact={c} selected={selected === c.id}
                  onClick={() => { setSelected(c.id); setMode('view') }} />
              ))}
            </div>
            <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
              {filtered.length} of {data.contacts.length} contacts
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {mode === 'form' ? (
              <ContactForm form={form} setForm={setForm} onSave={handleSave}
                onCancel={() => { setMode('view'); setIsNew(false) }}
                isNew={isNew} allTags={allTags} customFields={customFields} />
            ) : contact ? (
              <ContactDetail
                contact={contact}
                onEdit={openEdit}
                onDelete={handleDelete}
                customFields={customFields}
                onReminders={id => setShowRemindersFor(id)}
                onToggleFlag={handleToggleFlag}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 10 }}>
                <div style={{ fontSize: 36 }}>👤</div>
                <div style={{ fontSize: 13 }}>Select a contact or add a new one</div>
                <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 13, cursor: 'pointer' }}>+ Add Contact</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Groups tab ── */}
      {tab === 'groups' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left panel */}
          <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <button onClick={openNewGroup} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>+ New Group</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {data.groups.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No groups yet.</div>}
              {data.groups.map(g => (
                <div key={g.id} onClick={() => { setSelectedGroup(g.id); setGroupMode('view') }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer',
                  background: selectedGroup === g.id ? 'var(--bg)' : 'transparent',
                  borderLeft: `3px solid ${selectedGroup === g.id ? 'var(--accent)' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 22 }}>{g.emoji}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{g.members.length} member{g.members.length !== 1 ? 's' : ''} · {g.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {groupMode === 'form' ? (
              <GroupForm form={groupForm} setForm={setGroupForm} onSave={handleSaveGroup}
                onCancel={() => { setGroupMode('view'); setGroupForm(EMPTY_GROUP) }}
                contacts={data.contacts} />
            ) : group ? (
              <GroupDetail group={group} contacts={data.contacts} onEdit={openEditGroup} onDelete={handleDeleteGroup} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 10 }}>
                <div style={{ fontSize: 36 }}>👥</div>
                <div style={{ fontSize: 13 }}>Select a group or create a new one</div>
                <button onClick={openNewGroup} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 13, cursor: 'pointer' }}>+ New Group</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Lists tab ── */}
      {tab === 'lists' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar */}
          <div style={{ width: 260, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <button onClick={openNewList} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>+ New List</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {mailingLists.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No mailing lists yet.</div>}
              {mailingLists.map(l => (
                <div key={l.id} onClick={() => { setSelectedList(l.id); setListMode('view') }} style={{
                  padding: '10px 12px', cursor: 'pointer',
                  background: selectedList === l.id ? 'var(--bg)' : 'transparent',
                  borderLeft: `3px solid ${selectedList === l.id ? 'var(--accent)' : 'transparent'}`,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                    <span style={{ fontSize: 10, background: l.active !== false ? '#166534' : '#374151', color: l.active !== false ? '#bbf7d0' : '#d1d5db', borderRadius: 10, padding: '1px 7px', flexShrink: 0 }}>{l.active !== false ? 'Active' : 'Paused'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                    {(l.memberContactIds || []).length + (l.entries || []).length} members · {(l.roles || []).length} roles
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
              {mailingLists.length} list{mailingLists.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {listMode === 'form' ? (
              <MailingListForm
                form={listForm}
                setForm={setListForm}
                onSave={handleSaveList}
                onCancel={() => { setListMode('view'); setListForm({ name: '', description: '', shareSlug: '', active: true }) }}
              />
            ) : activeList ? (
              <MailingListDetail
                list={activeList}
                contacts={data.contacts}
                onEditMeta={() => openEditList(activeList)}
                onUpdateList={(id, updated) => updateMailingList(id, updated)}
                onDelete={id => { deleteMailingList(id); setSelectedList(null); setListMode('view') }}
                onAddContact={(listId, contactId) => addContactToMailingList(listId, contactId)}
                onRemoveContact={(listId, contactId) => removeContactFromMailingList(listId, contactId)}
                onDeleteEntry={(listId, entryId) => deleteMailingEntry(listId, entryId)}
                onCreateContactFromEntry={handleCreateContactFromEntry}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 10 }}>
                <div style={{ fontSize: 36 }}>📋</div>
                <div style={{ fontSize: 13 }}>Select a list or create one</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', maxWidth: 260 }}>
                  Collect sign-ups with a custom form — share the link publicly or add it as a SPACE block.
                </div>
                <button onClick={openNewList} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 13, cursor: 'pointer' }}>+ New List</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCustomFields && <CustomFieldsModal onClose={() => setShowCustomFields(false)} />}
      {showRemindersFor && reminderContact && (
        <RemindersModal
          contactId={showRemindersFor}
          contactName={reminderContact.name}
          onClose={() => setShowRemindersFor(null)}
        />
      )}
    </div>
  )
}
