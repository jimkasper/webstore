import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const HABIT_CATEGORIES = [
  { id: 'Substance', icon: '🧪', presets: [
    { name: 'Alcohol',          icon: '🍺', unit: 'drinks'     },
    { name: 'Tobacco/Nicotine', icon: '🚬', unit: 'cigarettes' },
    { name: 'Cannabis',         icon: '🌿', unit: 'sessions'   },
    { name: 'Caffeine',         icon: '☕', unit: 'cups'       },
    { name: 'Other Substances', icon: '💊', unit: 'uses'       },
  ]},
  { id: 'Dietary', icon: '🍔', presets: [
    { name: 'Junk Food',         icon: '🍟', unit: 'servings'  },
    { name: 'Overeating',        icon: '🍽', unit: 'episodes'  },
    { name: 'Sugar/Sweets',      icon: '🍭', unit: 'servings'  },
    { name: 'Fast Food',         icon: '🍔', unit: 'meals'     },
    { name: 'Late-Night Eating', icon: '🌙', unit: 'episodes'  },
  ]},
  { id: 'Spending', icon: '💸', presets: [
    { name: 'Impulse Shopping',     icon: '🛒', unit: 'purchases'     },
    { name: 'Gambling',             icon: '🎲', unit: 'sessions'      },
    { name: 'Luxury Purchases',     icon: '💎', unit: 'purchases'     },
    { name: 'Unused Subscriptions', icon: '📦', unit: 'subscriptions' },
  ]},
  { id: 'Behavioral', icon: '🧠', presets: [
    { name: 'Doomscrolling',   icon: '📱', unit: 'hours'    },
    { name: 'Procrastination', icon: '⏰', unit: 'hours'    },
    { name: 'Rage/Anger',      icon: '😤', unit: 'episodes' },
    { name: 'Isolation',       icon: '🏠', unit: 'days'     },
    { name: 'Overthinking',    icon: '🌀', unit: 'hours'    },
    { name: 'People-pleasing', icon: '🎭', unit: 'episodes' },
  ]},
  { id: 'Digital', icon: '💻', presets: [
    { name: 'Social Media',    icon: '📲', unit: 'hours'    },
    { name: 'Gaming',          icon: '🎮', unit: 'hours'    },
    { name: 'Streaming Binge', icon: '📺', unit: 'hours'    },
    { name: 'Online Shopping', icon: '🖥',  unit: 'sessions' },
  ]},
  { id: 'Physical', icon: '🏃', presets: [
    { name: 'Skipping Exercise', icon: '🛋', unit: 'days'    },
    { name: 'Nail Biting',       icon: '💅', unit: 'episodes'},
    { name: 'Poor Sleep',        icon: '😴', unit: 'nights'  },
    { name: 'Skipping Meals',    icon: '🍽', unit: 'meals'   },
  ]},
]

const COMMON_TRIGGERS = ['Social pressure', 'Stress/anxiety', 'Boredom', 'Celebration', 'Sadness', 'Fatigue', 'Habit/routine', 'Advertisement', 'Peer influence', 'Loneliness']

const ENTRY_TYPE_META = {
  'gave-in':  { label: 'Gave In',  color: '#ef4444', icon: '⚡' },
  'resisted': { label: 'Resisted', color: '#22c55e', icon: '🛡' },
  'tracked':  { label: 'Tracked',  color: '#64748b', icon: '📋' },
}

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// ─── HabitForm ─────────────────────────────────────────────────────────────
function HabitForm({ initial, onSave, onClose }) {
  const [step, setStep] = useState(initial ? 2 : 1)
  const [selectedCat, setSelectedCat] = useState(null)
  const [form, setForm] = useState(initial || {
    name: '', icon: '❓', category: 'Behavioral', type: 'vice',
    unit: 'episodes', color: '#ef4444', description: '',
    limit: { enabled: false, period: 'weekly', quantity: null, cost: null },
  })

  function pickPreset(cat, preset) {
    setForm(f => ({ ...f, name: preset.name, icon: preset.icon, unit: preset.unit, category: cat.id }))
    setStep(2)
  }

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#64748b']

  return (
    <div style={{ padding: '16px 0' }}>
      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Choose a category</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {HABIT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
                style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: selectedCat === cat.id ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${selectedCat === cat.id ? 'rgba(167,139,250,.3)' : 'var(--border)'}`, textAlign: 'left' }}>
                {cat.icon} {cat.id}
              </button>
            ))}
          </div>
          {selectedCat && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Pick a preset or skip to custom</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {HABIT_CATEGORIES.find(c => c.id === selectedCat)?.presets.map(p => (
                  <button key={p.name} onClick={() => pickPreset(HABIT_CATEGORIES.find(c => c.id === selectedCat), p)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setForm(f => ({ ...f, category: selectedCat || 'Behavioral' })); setStep(2) }}>Custom →</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Icon</label>
              <input className="input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ textAlign: 'center', fontSize: 18 }} maxLength={2} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Alcohol" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Type</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {['vice', 'positive', 'both'].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`btn btn-sm ${form.type === t ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, fontSize: 11 }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Unit</label>
              <input className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="drinks, hours…" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Color</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {colors.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Description</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note" />
          </div>

          {/* Limit section */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: form.limit?.enabled ? 10 : 0 }}>
              <input type="checkbox" checked={!!form.limit?.enabled}
                onChange={e => setForm(f => ({ ...f, limit: { ...f.limit, enabled: e.target.checked } }))} id="limitToggle" />
              <label htmlFor="limitToggle" style={{ fontSize: 12, cursor: 'pointer' }}>Set a usage limit</label>
            </div>
            {form.limit?.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Period</label>
                  <select className="input" value={form.limit.period || 'weekly'} onChange={e => setForm(f => ({ ...f, limit: { ...f.limit, period: e.target.value } }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Max {form.unit}</label>
                  <input className="input" type="number" min={0} value={form.limit.quantity ?? ''} onChange={e => setForm(f => ({ ...f, limit: { ...f.limit, quantity: e.target.value ? Number(e.target.value) : null } }))} placeholder="any" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Max $ cost</label>
                  <input className="input" type="number" min={0} value={form.limit.cost ?? ''} onChange={e => setForm(f => ({ ...f, limit: { ...f.limit, cost: e.target.value ? Number(e.target.value) : null } }))} placeholder="any" />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={!form.name.trim()} onClick={() => onSave(form)}>
              {initial ? 'Save Changes' : 'Create Habit'}
            </button>
            {!initial && <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── LogEntryRow ─────────────────────────────────────────────────────────────
function LogEntryRow({ log, onDelete }) {
  const meta = ENTRY_TYPE_META[log.entryType]
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 16, minWidth: 24, textAlign: 'center', color: meta.color }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>{meta.label}</span>
          {log.quantity > 0 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{log.quantity} {log.unit}</span>}
          {log.cost > 0 && <span style={{ fontSize: 11, color: 'var(--amber)' }}>${log.cost}</span>}
          <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{fmtDate(log.recordedAt)} {fmtTime(log.recordedAt)}</span>
        </div>
        {log.trigger && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Trigger: {log.trigger}</div>}
        {log.purpose && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{log.purpose}</div>}
        {(log.moodBefore || log.moodAfter) && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            Mood: {log.moodBefore}/5 → {log.moodAfter}/5
          </div>
        )}
        {log.notes && <div style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', marginTop: 2 }}>{log.notes}</div>}
      </div>
      <button onClick={() => onDelete(log.id)} style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>✕</button>
    </div>
  )
}

// ─── HabitDetail ─────────────────────────────────────────────────────────────
function HabitDetail({ habit, logs, goals, onEdit, onDelete, linkHabitGoal, nav }) {
  const habitLogs = logs.filter(l => l.habitId === habit.id).sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
  const gaveIn = habitLogs.filter(l => l.entryType === 'gave-in')
  const resisted = habitLogs.filter(l => l.entryType === 'resisted')
  const totalCost = gaveIn.reduce((s, l) => s + (l.cost || 0), 0)
  const linkedGoal = habit.goalId ? goals.find(g => g.id === habit.goalId) : null

  // Limit usage calc (weekly as default for display)
  const limit = habit.limit
  let limitUsed = 0, limitMax = null, limitCostUsed = 0, limitCostMax = null
  if (limit?.enabled) {
    const now = new Date()
    let cutoff = new Date(now)
    if (limit.period === 'daily') cutoff.setHours(0,0,0,0)
    else if (limit.period === 'weekly') { cutoff.setDate(cutoff.getDate() - cutoff.getDay()); cutoff.setHours(0,0,0,0) }
    else { cutoff = new Date(now.getFullYear(), now.getMonth(), 1) }
    const periodLogs = gaveIn.filter(l => new Date(l.recordedAt) >= cutoff)
    limitUsed = periodLogs.reduce((s, l) => s + (l.quantity || 0), 0)
    limitCostUsed = periodLogs.reduce((s, l) => s + (l.cost || 0), 0)
    limitMax = limit.quantity
    limitCostMax = limit.cost
  }

  return (
    <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 40 }}>{habit.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{habit.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{habit.category} · <span style={{ color: habit.color }}>{habit.type}</span></div>
          {habit.description && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{habit.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>✎</button>
          <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={onDelete}>🗑</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: habit.cleanStreak > 0 ? '#22c55e' : 'var(--text-3)' }}>
            {habit.cleanStreak > 0 ? `🌿 ${habit.cleanStreak}` : '❌ 0'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Clean streak (days)</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{habit.longestClean || 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Best streak (days)</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{gaveIn.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Times gave in</div>
        </div>
        <div className="card card-sm" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)' }}>${totalCost.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Total cost logged</div>
        </div>
      </div>

      {/* Limit progress */}
      {limit?.enabled && (limitMax !== null || limitCostMax !== null) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Usage Limit — this {limit.period}</div>
          {limitMax !== null && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                <span>{limitUsed} / {limitMax} {habit.unit}</span>
                {limitUsed >= limitMax && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Over limit</span>}
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, (limitUsed/limitMax)*100)}%`, background: limitUsed >= limitMax ? '#ef4444' : limitUsed/limitMax >= 0.7 ? '#f59e0b' : undefined }} />
              </div>
            </div>
          )}
          {limitCostMax !== null && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                <span>${limitCostUsed.toFixed(0)} / ${limitCostMax} spent</span>
                {limitCostUsed >= limitCostMax && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠ Over budget</span>}
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, (limitCostUsed/limitCostMax)*100)}%`, background: limitCostUsed >= limitCostMax ? '#ef4444' : limitCostUsed/limitCostMax >= 0.7 ? '#f59e0b' : undefined }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Linked goal */}
      {linkedGoal ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 6 }}>
          <span style={{ fontSize: 14 }}>🎯</span>
          <span style={{ fontSize: 12, flex: 1 }}>{linkedGoal.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=goals')} style={{ fontSize: 10 }}>View goal →</button>
          <button onClick={() => linkHabitGoal(habit.id, null)} style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <select className="input" onChange={e => { if (e.target.value) linkHabitGoal(habit.id, e.target.value) }} defaultValue="">
            <option value="">Link to a goal…</option>
            {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}

      {/* Log history */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Log History ({habitLogs.length})
      </div>
      {habitLogs.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', padding: '12px 0' }}>No entries yet.</div>
      )}
      {habitLogs.map(log => (
        <LogEntryRow key={log.id} log={log} onDelete={id => { /* handled by parent */ }} />
      ))}
    </div>
  )
}

// ─── HabitsView ───────────────────────────────────────────────────────────────
function HabitsView({ data, addHabit, updateHabit, deleteHabit, deleteHabitLog, linkHabitGoal, nav }) {
  const { habits = [], habitLogs = [], goals = [] } = data
  const [selectedId, setSelectedId] = useState(habits[0]?.id ?? null)
  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState(null)

  const selected = habits.find(h => h.id === selectedId)

  function handleSave(form) {
    if (editHabit) {
      updateHabit(editHabit.id, form)
      setEditHabit(null)
    } else {
      const id = addHabit(form)
      setSelectedId(id)
    }
    setShowForm(false)
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this habit and all its logs?')) return
    deleteHabit(id)
    setSelectedId(habits.find(h => h.id !== id)?.id ?? null)
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: 260 }}>
        <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
          {habits.length === 0 && (
            <div style={{ padding: '16px 8px', color: 'var(--text-3)', fontSize: 13 }}>No habits tracked yet.</div>
          )}
          {habits.map(h => {
            const gaveInCount = habitLogs.filter(l => l.habitId === h.id && l.entryType === 'gave-in').length
            const isSelected = selectedId === h.id
            return (
              <div key={h.id} onClick={() => { setSelectedId(h.id); setShowForm(false); setEditHabit(null) }}
                style={{ padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 4,
                  background: isSelected ? 'var(--accent-bg)' : 'var(--surface)',
                  border: `1px solid ${isSelected ? 'rgba(167,139,250,.3)' : 'var(--border)'}`,
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {h.cleanStreak > 0 ? `🌿 ${h.cleanStreak}d clean` : '❌ streak broken'}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: h.color + '22', color: h.color, border: `1px solid ${h.color}44` }}>{h.type}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
          {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      {/* Detail panel */}
      <div className="scroll" style={{ flex: 1 }}>
        {(showForm || !selected) && !editHabit ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              {showForm ? 'New Habit' : 'Select a habit or create one'}
            </div>
            {showForm ? (
              <HabitForm onSave={handleSave} onClose={() => setShowForm(false)} />
            ) : (
              <div className="empty">
                <div className="empty-icon">🌀</div>
                <div className="empty-title">No habit selected</div>
                <p>Select a habit from the sidebar or create a new one.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>+ New habit</button>
              </div>
            )}
          </div>
        ) : editHabit ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Edit Habit</div>
            <HabitForm initial={editHabit} onSave={handleSave} onClose={() => setEditHabit(null)} />
          </div>
        ) : selected && (
          <HabitDetail
            habit={selected}
            logs={habitLogs}
            goals={goals}
            onEdit={() => { setEditHabit(selected); setShowForm(false) }}
            onDelete={() => handleDelete(selected.id)}
            linkHabitGoal={linkHabitGoal}
            nav={nav}
          />
        )}
      </div>
    </div>
  )
}

// ─── LogView ──────────────────────────────────────────────────────────────────
function LogView({ data, addHabitLog }) {
  const { habits = [], goals = [], plans = [] } = data
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id ?? '')
  const [entryType, setEntryType] = useState('gave-in')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [trigger, setTrigger] = useState('')
  const [purpose, setPurpose] = useState('')
  const [moodBefore, setMoodBefore] = useState(3)
  const [moodAfter, setMoodAfter] = useState(3)
  const [notes, setNotes] = useState('')
  const [goalId, setGoalId] = useState('')
  const [planId, setPlanId] = useState('')
  const [effectiveness, setEffectiveness] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const habit = habits.find(h => h.id === selectedHabitId)
  const meta = ENTRY_TYPE_META[entryType]

  function handleSubmit() {
    if (!selectedHabitId) return
    addHabitLog({
      habitId: selectedHabitId,
      entryType,
      quantity: quantity ? Number(quantity) : 0,
      unit: habit?.unit || '',
      cost: cost ? Number(cost) : 0,
      trigger,
      purpose,
      moodBefore,
      moodAfter,
      notes,
      assistedGoalId: goalId || null,
      assistedPlanId: planId || null,
      effectiveness: effectiveness,
    })
    setQuantity(''); setCost(''); setTrigger(''); setPurpose(''); setNotes('')
    setMoodBefore(3); setMoodAfter(3); setGoalId(''); setPlanId(''); setEffectiveness(null)
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 2500)
  }

  const MoodPicker = ({ label, value, onChange }) => (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            style={{ width: 30, height: 30, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: value === n ? meta.color : 'var(--surface)',
              border: `1px solid ${value === n ? meta.color : 'var(--border)'}`,
              color: value === n ? '#fff' : 'var(--text-2)' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="scroll">
      <div className="pad" style={{ maxWidth: 600 }}>
        {confirmed && (
          <div style={{ padding: '10px 16px', background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: 6, marginBottom: 16, fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
            ✓ Logged successfully
          </div>
        )}

        {/* Habit selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {habits.map(h => (
            <button key={h.id} onClick={() => setSelectedHabitId(h.id)}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: selectedHabitId === h.id ? 'var(--accent-bg)' : 'var(--surface)',
                border: `1px solid ${selectedHabitId === h.id ? 'rgba(167,139,250,.3)' : 'var(--border)'}`,
                color: selectedHabitId === h.id ? 'var(--accent)' : 'var(--text-2)' }}>
              {h.icon} {h.name}
            </button>
          ))}
          {habits.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>No habits yet — create one in the Habits tab.</span>}
        </div>

        {/* Entry type */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {Object.entries(ENTRY_TYPE_META).map(([k, m]) => (
            <button key={k} onClick={() => setEntryType(k)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: entryType === k ? m.color + '22' : 'var(--surface)',
                border: `1px solid ${entryType === k ? m.color : 'var(--border)'}`,
                color: entryType === k ? m.color : 'var(--text-2)' }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {habit && (
          <div style={{ borderTop: `2px solid ${meta.color}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Quantity & cost */}
            {(entryType === 'gave-in' || entryType === 'tracked') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Quantity ({habit.unit})</label>
                  <input className="input" type="number" min={0} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
                </div>
                {entryType === 'gave-in' && (
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Cost ($) — optional</label>
                    <input className="input" type="number" min={0} value={cost} onChange={e => setCost(e.target.value)} placeholder="0" />
                  </div>
                )}
              </div>
            )}

            {/* Trigger */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>
                {entryType === 'resisted' ? 'What was the trigger?' : 'Trigger'}
              </label>
              <input className="input" value={trigger} onChange={e => setTrigger(e.target.value)} list="triggers-list" placeholder="What caused this?" />
              <datalist id="triggers-list">
                {COMMON_TRIGGERS.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            {/* Purpose */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>
                {entryType === 'resisted' ? 'What helped you resist?' : 'Purpose / Why'}
              </label>
              <input className="input" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Your reason…" />
            </div>

            {/* Mood */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <MoodPicker label="Mood before (1–5)" value={moodBefore} onChange={setMoodBefore} />
              <MoodPicker label="Mood after (1–5)" value={moodAfter} onChange={setMoodAfter} />
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Notes</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
            </div>

            {/* Goal / Plan assist */}
            {(goals.length > 0 || plans.length > 0) && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>Goal / Plan assist (optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  {goals.length > 0 && (
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Goal</label>
                      <select className="input" value={goalId} onChange={e => setGoalId(e.target.value)}>
                        <option value="">None</option>
                        {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  )}
                  {plans.length > 0 && (
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Plan</label>
                      <select className="input" value={planId} onChange={e => setPlanId(e.target.value)}>
                        <option value="">None</option>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {(goalId || planId) && (
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>How effective was it?</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[[1, '✗ No', '#ef4444'], [2, '— Neutral', '#64748b'], [3, '✓ Yes', '#22c55e']].map(([v, l, c]) => (
                        <button key={v} onClick={() => setEffectiveness(effectiveness === v ? null : v)}
                          style={{ flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            background: effectiveness === v ? c + '22' : 'var(--surface)',
                            border: `1px solid ${effectiveness === v ? c : 'var(--border)'}`,
                            color: effectiveness === v ? c : 'var(--text-3)' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-sm" style={{ background: meta.color, color: '#fff', border: 'none', padding: '10px 0', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
              onClick={handleSubmit} disabled={!selectedHabitId}>
              {meta.icon} Log Entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── InsightsView ─────────────────────────────────────────────────────────────
function InsightsView({ data, nav }) {
  const { habits = [], habitLogs = [], goals = [] } = data

  const gaveInLogs = habitLogs.filter(l => l.entryType === 'gave-in')
  const resistedLogs = habitLogs.filter(l => l.entryType === 'resisted')
  const total = gaveInLogs.length + resistedLogs.length
  const resistRate = total > 0 ? Math.round((resistedLogs.length / total) * 100) : 0
  const totalCost = gaveInLogs.reduce((s, l) => s + (l.cost || 0), 0)
  const moodDeltas = habitLogs.filter(l => l.moodBefore && l.moodAfter).map(l => l.moodAfter - l.moodBefore)
  const avgMoodDelta = moodDeltas.length ? (moodDeltas.reduce((s, n) => s + n, 0) / moodDeltas.length).toFixed(1) : 'N/A'
  const totalClean = habits.reduce((s, h) => s + (h.cleanStreak || 0), 0)

  // Top triggers
  const triggerCount = {}
  habitLogs.forEach(l => { if (l.trigger) triggerCount[l.trigger] = (triggerCount[l.trigger] || 0) + 1 })
  const topTriggers = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Goal effectiveness
  const goalLogs = habitLogs.filter(l => l.assistedGoalId)
  const byGoal = {}
  goalLogs.forEach(l => {
    if (!byGoal[l.assistedGoalId]) byGoal[l.assistedGoalId] = { yes: 0, neutral: 0, no: 0, total: 0 }
    byGoal[l.assistedGoalId].total++
    if (l.effectiveness === 3) byGoal[l.assistedGoalId].yes++
    else if (l.effectiveness === 2) byGoal[l.assistedGoalId].neutral++
    else if (l.effectiveness === 1) byGoal[l.assistedGoalId].no++
  })

  // 7-day history per habit
  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6-i)); return d.toDateString()
  })

  return (
    <div className="scroll">
      <div className="pad">
        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{totalClean}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Total clean days</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{resistRate}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Resistance rate</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>${totalCost.toFixed(0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Total cost logged</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: avgMoodDelta > 0 ? '#22c55e' : avgMoodDelta < 0 ? '#ef4444' : 'var(--text-3)' }}>
              {avgMoodDelta !== 'N/A' && avgMoodDelta > 0 ? '+' : ''}{avgMoodDelta}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Avg mood delta</div>
          </div>
        </div>

        {/* Per-habit 7-day strips */}
        {habits.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>7-Day Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {habits.map(h => {
                const hLogs = habitLogs.filter(l => l.habitId === h.id)
                return (
                  <div key={h.id} className="card card-sm">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{h.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{h.name}</span>
                      <span style={{ fontSize: 10, color: h.cleanStreak > 0 ? '#22c55e' : 'var(--text-3)' }}>
                        {h.cleanStreak > 0 ? `🌿${h.cleanStreak}d` : '❌'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {last7.map((day, i) => {
                        const dayLogs = hLogs.filter(l => new Date(l.recordedAt).toDateString() === day)
                        const hasGaveIn = dayLogs.some(l => l.entryType === 'gave-in')
                        const hasResisted = dayLogs.some(l => l.entryType === 'resisted')
                        const hasTracked = dayLogs.some(l => l.entryType === 'tracked')
                        const color = hasGaveIn ? '#ef4444' : hasResisted ? '#22c55e' : hasTracked ? '#f59e0b' : 'var(--surface-2)'
                        const label = ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(day).getDay()]
                        return (
                          <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: '100%', height: 20, borderRadius: 3, background: color, marginBottom: 2 }} />
                            <div style={{ fontSize: 8, color: 'var(--text-3)' }}>{label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Usage limits */}
        {habits.some(h => h.limit?.enabled) && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Usage Limits</div>
            {habits.filter(h => h.limit?.enabled).map(h => {
              const limit = h.limit
              const gaveInH = gaveInLogs.filter(l => l.habitId === h.id)
              const used = gaveInH.reduce((s, l) => s + (l.quantity || 0), 0)
              const max = limit.quantity
              const pct = max ? Math.min(100, (used / max) * 100) : 0
              const over = max && used >= max
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{h.icon}</span>
                  <span style={{ fontSize: 12, minWidth: 120 }}>{h.name}</span>
                  {max !== null ? (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{used} / {max} {h.unit} this {limit.period}</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: over ? '#ef4444' : pct >= 70 ? '#f59e0b' : undefined }} />
                      </div>
                    </div>
                  ) : <span style={{ fontSize: 11, color: 'var(--text-3)' }}>No quantity limit set</span>}
                  {over && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>⚠ Over</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* Top triggers */}
        {topTriggers.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top Triggers</div>
            <div style={{ display: 'flex', flex: 'wrap', gap: 6 }}>
              {topTriggers.map(([trigger, count]) => (
                <div key={trigger} style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {trigger}
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>×{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goal effectiveness */}
        {Object.keys(byGoal).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Goal Effectiveness</div>
            {Object.entries(byGoal).map(([gid, counts]) => {
              const goal = goals.find(g => g.id === gid)
              if (!goal) return null
              return (
                <div key={gid} className="card card-sm" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🎯 {goal.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{counts.total} entries linked</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#22c55e' }}>✓ Yes: {counts.yes}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>— Neutral: {counts.neutral}</span>
                    <span style={{ fontSize: 11, color: '#ef4444' }}>✗ No: {counts.no}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/brain')}>
          🤖 Ask Brain about my patterns →
        </button>
      </div>
    </div>
  )
}

// ─── Main Kenoma ──────────────────────────────────────────────────────────────
export default function Kenoma() {
  const nav = useNavigate()
  const { data, addHabit, updateHabit, deleteHabit, addHabitLog, updateHabitLog, deleteHabitLog, linkHabitGoal } = useStore()
  const { habits = [], habitLogs = [] } = data

  const [view, setView] = useState('habits')

  const views = [
    { id: 'habits',   label: `Habits (${habits.length})` },
    { id: 'log',      label: 'Log' },
    { id: 'insights', label: 'Insights' },
  ]

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🌀</span>
        <div className="topbar-title">Habit (Kenoma)</div>
        <div className="topbar-sep" />
        <div style={{ display: 'flex', gap: 2 }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{ padding: '5px 12px', fontSize: 12, background: view === v.id ? 'var(--accent-bg)' : 'none',
                border: `1px solid ${view === v.id ? 'rgba(167,139,250,.3)' : 'transparent'}`,
                borderRadius: 6, cursor: 'pointer',
                color: view === v.id ? 'var(--accent)' : 'var(--text-2)', fontWeight: view === v.id ? 600 : 400 }}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="topbar-right">
          {view === 'habits' && (
            <button className="btn btn-primary btn-sm" onClick={() => { setView('habits') }}>+ New habit</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {view === 'habits' && (
          <HabitsView
            data={data}
            addHabit={addHabit}
            updateHabit={updateHabit}
            deleteHabit={deleteHabit}
            deleteHabitLog={deleteHabitLog}
            linkHabitGoal={linkHabitGoal}
            nav={nav}
          />
        )}
        {view === 'log' && (
          <LogView data={data} addHabitLog={addHabitLog} />
        )}
        {view === 'insights' && (
          <InsightsView data={data} nav={nav} />
        )}
      </div>
    </div>
  )
}
