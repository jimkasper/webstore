import { useState } from 'react'
import LinkedListPicker from './LinkedListPicker.jsx'

const CATEGORIES = ['Exercise', 'Learning', 'Health', 'Creative', 'Social', 'Work', 'Other']
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const APP_TO_CATEGORY = {
  fitness: 'Exercise', health: 'Health', financial: 'Work',
  diet: 'Health', journal: 'Other', learning: 'Learning', media: 'Creative',
}

function inferCategory(apps = []) {
  for (const a of apps) {
    if (APP_TO_CATEGORY[a]) return APP_TO_CATEGORY[a]
  }
  return 'Exercise'
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

function SegBtn({ active, onClick, children }) {
  return (
    <button className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`} onClick={onClick} style={{ flex: 1 }}>
      {children}
    </button>
  )
}

export default function RoutineForm({ initial, goals, lists = [], initialGoal, initialPlan, onSave, onClose, onHandoff }) {
  function buildInitialState() {
    const base = {
      name: '', category: 'Exercise', mode: 'fixed_slots',
      days: ['Mon', 'Wed', 'Fri'], time: '07:00', durationMins: 60,
      sessionsPerWeek: 3, minsPerSession: 45, weeklyTargetMins: 180,
      goalId: '', linkedListIds: [],
    }
    if (initialPlan) {
      base.name = initialPlan.name
      base.goalId = initialPlan.goalId || ''
      if (initialPlan._goalApps) base.category = inferCategory(initialPlan._goalApps)
    } else if (initialGoal) {
      base.name = initialGoal.name
      base.goalId = initialGoal.id
      base.category = inferCategory(initialGoal.apps)
    }
    return { ...base, ...initial }
  }

  const [f, setF] = useState(buildInitialState)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  function toggleDay(day) {
    setF(p => ({ ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day] }))
  }

  function handleSave() {
    if (!f.name.trim()) return
    const targetPerWeek = f.mode === 'fixed_slots' ? (f.days || []).length
      : f.mode === 'session_based' ? f.sessionsPerWeek
      : Math.max(1, Math.round(f.weeklyTargetMins / (f.durationMins || 30)))
    const routineId = onSave({ ...f, targetPerWeek })
    if (onHandoff && routineId) onHandoff(routineId, f.mode)
  }

  return (
    <div>
      <Field label="Routine name">
        <input className="input" placeholder="e.g. Morning gym, Evening run, Reading"
          value={f.name} onChange={e => set('name', e.target.value)} autoFocus />
      </Field>

      <Field label="Category">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`btn btn-sm ${f.category === c ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => set('category', c)}>{c}</button>
          ))}
        </div>
      </Field>

      <Field label="Scheduling mode">
        <div style={{ display: 'flex', gap: 4 }}>
          <SegBtn active={f.mode === 'fixed_slots'}    onClick={() => set('mode', 'fixed_slots')}>Fixed days</SegBtn>
          <SegBtn active={f.mode === 'session_based'}  onClick={() => set('mode', 'session_based')}>N x/week</SegBtn>
          <SegBtn active={f.mode === 'weekly_total'}   onClick={() => set('mode', 'weekly_total')}>Weekly mins</SegBtn>
        </div>
      </Field>

      {f.mode === 'fixed_slots' && (
        <>
          <Field label="Days">
            <div style={{ display: 'flex', gap: 4 }}>
              {DAYS_OF_WEEK.map(d => (
                <button key={d}
                  className={`btn btn-sm ${(f.days || []).includes(d) ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '4px 0' }}
                  onClick={() => toggleDay(d)}>{d}</button>
              ))}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Field label="Start time">
                <input type="time" className="input" value={f.time} onChange={e => set('time', e.target.value)} />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Duration (mins)">
                <input type="number" className="input" min={5} max={300} value={f.durationMins}
                  onChange={e => set('durationMins', parseInt(e.target.value) || 30)} />
              </Field>
            </div>
          </div>
        </>
      )}

      {f.mode === 'session_based' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="Sessions / week">
              <input type="number" className="input" min={1} max={14} value={f.sessionsPerWeek}
                onChange={e => set('sessionsPerWeek', parseInt(e.target.value) || 1)} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Mins / session">
              <input type="number" className="input" min={5} max={300} value={f.minsPerSession}
                onChange={e => set('minsPerSession', parseInt(e.target.value) || 30)} />
            </Field>
          </div>
        </div>
      )}

      {f.mode === 'weekly_total' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="Weekly target (total mins)">
              <input type="number" className="input" min={10} value={f.weeklyTargetMins}
                onChange={e => set('weeklyTargetMins', parseInt(e.target.value) || 60)} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Typical session (mins)">
              <input type="number" className="input" min={5} max={300} value={f.durationMins}
                onChange={e => set('durationMins', parseInt(e.target.value) || 30)} />
            </Field>
          </div>
        </div>
      )}

      <Field label="Link to goal (optional)">
        <select className="input" value={f.goalId} onChange={e => set('goalId', e.target.value)}>
          <option value="">-- No goal --</option>
          {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </Field>

      {f.mode === 'fixed_slots' && f.days?.length > 0 && f.time && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(132,204,22,.07)', border: '1px solid rgba(132,204,22,.25)', borderRadius: 6, fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span>
            <strong style={{ color: 'var(--accent)' }}>{f.days.length * 4} events</strong> will be added to your Schedule — {f.days.join(', ')} at {f.time} for the next 4 weeks.
          </span>
        </div>
      )}

      {lists.filter(l => l.type !== 'Tier' && l.mode !== 'tier').length > 0 && (
        <Field label="Required lists">
          <LinkedListPicker
            lists={lists}
            selectedIds={f.linkedListIds || []}
            onChange={ids => set('linkedListIds', ids)}
            label=""
          />
        </Field>
      )}

      {(initialGoal || initialPlan) && !initial?.id && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 6, fontSize: 12, color: 'var(--text-2)' }}>
          {initialPlan ? `📋 Linked to plan: ${initialPlan.name}` : `🎯 Linked to goal: ${initialGoal.name}`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!f.name.trim()}>
          {initial?.id ? 'Update routine' : 'Create routine'}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
