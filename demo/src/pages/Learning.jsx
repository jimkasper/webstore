import { useState } from 'react'
import { useStore } from '../store.jsx'

const CATEGORIES = ['All', 'Programming', 'Tech', 'Fitness', 'Language', 'Creative', 'Finance', 'Other']
const EMPTY = { name: '', category: 'Programming', level: 1, targetLevel: 5, resources: '', startedAt: '', note: '' }

function LevelDots({ level, target, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: target }, (_, i) => (
        <div key={i} onClick={onChange ? () => onChange(i + 1) : undefined}
          style={{ width: 14, height: 14, borderRadius: '50%', background: i < level ? 'var(--accent)' : 'var(--bg)', border: '2px solid var(--accent)', cursor: onChange ? 'pointer' : 'default', transition: 'background .15s' }} />
      ))}
    </div>
  )
}

export default function Learning() {
  const { data, addSkill, updateSkill, deleteSkill } = useStore()
  const [filterCat, setFilterCat] = useState('All')
  const [selected, setSelected] = useState(data.skills[0]?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const filtered = data.skills.filter(s => filterCat === 'All' || s.category === filterCat)
  const skill = selected ? data.skills.find(s => s.id === selected) : null

  function openNew() { setForm(EMPTY); setIsNew(true); setEditing(true); setSelected(null) }
  function openEdit(s) { setForm({ ...s, resources: Array.isArray(s.resources) ? s.resources.join(', ') : s.resources }); setIsNew(false); setEditing(true) }

  function handleSave(e) {
    e.preventDefault()
    const payload = { ...form, resources: form.resources.split(',').map(s => s.trim()).filter(Boolean), level: Number(form.level), targetLevel: Number(form.targetLevel) }
    if (isNew) { const id = addSkill(payload); setSelected(id) }
    else { updateSkill(form.id, payload); setSelected(form.id) }
    setEditing(false); setIsNew(false)
  }

  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🎓</span>
        <div className="topbar-title">Learning</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Skills & resources</span>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 230, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Learning</span>
            <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>+ New</button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0, 6).map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                style={{ background: filterCat === c ? 'var(--accent)' : 'var(--bg)', color: filterCat === c ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 7px', fontSize: 11, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(s => (
            <div key={s.id} onClick={() => { setSelected(s.id); setEditing(false) }}
              style={{ padding: '10px 12px', cursor: 'pointer', background: selected === s.id ? 'var(--bg)' : 'transparent', borderLeft: selected === s.id ? '2px solid var(--accent)' : '2px solid transparent', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
              <LevelDots level={s.level} target={s.targetLevel} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{s.category} · Level {s.level}/{s.targetLevel}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No skills found.</div>}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} skills tracked</div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{isNew ? 'New Skill' : 'Edit Skill'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setEditing(false); setIsNew(false) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Skill Name *
                <input required value={form.name} onChange={f('name')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Category
                <select value={form.category} onChange={f('category')} style={iStyle}>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Started
                <input type="date" value={form.startedAt ?? ''} onChange={f('startedAt')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Current Level (1–10)
                <input type="number" min={1} max={10} value={form.level} onChange={f('level')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Target Level (1–10)
                <input type="number" min={1} max={10} value={form.targetLevel} onChange={f('targetLevel')} style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Resources (comma-separated)
                <input value={form.resources} onChange={f('resources')} placeholder="Book, course, YouTube channel…" style={iStyle} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
                Notes
                <textarea value={form.note ?? ''} onChange={f('note')} rows={4} style={{ ...iStyle, resize: 'vertical' }} />
              </label>
            </div>
          </form>
        ) : skill ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{skill.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>{skill.category}{skill.startedAt ? ` · Started ${skill.startedAt}` : ''}</div>
                <div style={{ marginBottom: 6 }}>
                  <LevelDots level={skill.level} target={skill.targetLevel} onChange={n => updateSkill(skill.id, { level: n })} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Level {skill.level} / {skill.targetLevel} — click dots to update</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(skill)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { deleteSkill(skill.id); setSelected(data.skills.find(s => s.id !== skill.id)?.id ?? null) }} style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#e05c5c', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: `${(skill.level / skill.targetLevel) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
            </div>

            {skill.resources?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Resources</div>
                {skill.resources.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '3px 0', color: 'var(--text-1)', borderBottom: i < skill.resources.length - 1 ? '1px solid var(--border)' : 'none' }}>📌 {r}</div>
                ))}
              </div>
            )}

            {skill.note && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Notes</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{skill.note}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 8 }}>
            <div style={{ fontSize: 32 }}>🎓</div>
            <div style={{ fontSize: 13 }}>Select a skill or add a new one</div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }
