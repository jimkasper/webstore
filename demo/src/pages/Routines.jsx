import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import Modal from '../components/Modal.jsx'
import RoutineForm from './planner/RoutineForm.jsx'
import AvailabilityGrid from './planner/AvailabilityGrid.jsx'

export default function Routines() {
  const nav = useNavigate()
  const { data, addRoutine, updateRoutine, deleteRoutine } = useStore()
  const { goals, routines, lists } = data

  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [editRoutine, setEditRoutine] = useState(null)
  const [routineContext, setRoutineContext] = useState(null)
  const [handoffRoutineId, setHandoffRoutineId] = useState(null)
  const [handoffMode, setHandoffMode] = useState(null)

  const handoffRoutine = handoffRoutineId ? routines.find(r => r.id === handoffRoutineId) : null
  const sessionMins = handoffRoutine?.minsPerSession || handoffRoutine?.durationMins || 60
  const sessionsPerWeek = handoffRoutine?.sessionsPerWeek || handoffRoutine?.targetPerWeek || 3

  function handleSaveRoutine(form) {
    if (editRoutine?.id) {
      updateRoutine(editRoutine.id, form)
      setShowRoutineForm(false); setEditRoutine(null); setRoutineContext(null)
      return null
    } else {
      const id = addRoutine(form)
      setShowRoutineForm(false); setEditRoutine(null); setRoutineContext(null)
      return id
    }
  }

  function handleRoutineHandoff(routineId, mode) {
    setHandoffRoutineId(routineId)
    setHandoffMode(mode)
  }

  function handleAvailabilityConfirm(slots) {
    if (handoffRoutineId) {
      const days = slots.map(s => s.day)
      const time = slots[0]?.time || '07:00'
      updateRoutine(handoffRoutineId, { mode: 'fixed_slots', days, time })
    }
    const rid = handoffRoutineId
    setHandoffRoutineId(null)
    setHandoffMode(null)
    nav(`/autogenes/mind?tab=schedule&routine=${rid}`)
  }

  return (
    <div className="content">
      {showRoutineForm && (
        <Modal title={editRoutine?.id ? 'Edit routine' : 'New routine'} onClose={() => { setShowRoutineForm(false); setEditRoutine(null); setRoutineContext(null) }} width={520}>
          <RoutineForm
            initial={editRoutine}
            goals={goals}
            lists={lists || []}
            initialGoal={routineContext?.goal ?? null}
            initialPlan={routineContext?.plan ?? null}
            onSave={handleSaveRoutine}
            onClose={() => { setShowRoutineForm(false); setEditRoutine(null); setRoutineContext(null) }}
            onHandoff={handleRoutineHandoff}
          />
        </Modal>
      )}

      {handoffRoutineId && (
        <div onClick={() => { setHandoffRoutineId(null); setHandoffMode(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>📅 Schedule your routine</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
              {handoffMode === 'fixed_slots'
                ? `${handoffRoutine?.name} is set to ${(handoffRoutine?.days || []).join(', ')} at ${handoffRoutine?.time}.`
                : 'When are you usually free? Shade available time blocks and we\'ll suggest the best slots.'}
            </div>
            {handoffMode === 'fixed_slots' ? (
              <div>
                <div style={{ padding: '14px 16px', background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
                  ✅ <strong>{(handoffRoutine?.days || []).join(' · ')}</strong> at <strong>{handoffRoutine?.time}</strong> — {handoffRoutine?.durationMins} min sessions
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { const rid = handoffRoutineId; setHandoffRoutineId(null); setHandoffMode(null); nav(`/autogenes/mind?tab=schedule&routine=${rid}`) }}>
                    📅 View in Schedule →
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setHandoffRoutineId(null); setHandoffMode(null) }}>Done</button>
                </div>
              </div>
            ) : (
              <AvailabilityGrid
                sessionMins={sessionMins}
                sessionsPerWeek={sessionsPerWeek}
                onConfirm={handleAvailabilityConfirm}
              />
            )}
          </div>
        </div>
      )}

      <div className="topbar">
        <span style={{ fontSize: 18 }}>🔄</span>
        <div className="topbar-title">Routines</div>
        <div className="topbar-sep" />
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=planner')}>← Planner</button>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => { setEditRoutine(null); setRoutineContext(null); setShowRoutineForm(true) }}>+ New routine</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="sidebar" style={{ width: 260 }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {routines.length === 0 && (
              <div style={{ padding: '16px 8px', color: 'var(--text-3)', fontSize: 13 }}>No routines yet.</div>
            )}
            {routines.map(r => (
              <div key={r.id} style={{ padding: 10, borderRadius: 'var(--radius)', marginBottom: 4, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{r.name}</div>
                  <button className="btn btn-ghost btn-xs" onClick={() => { setEditRoutine(r); setRoutineContext(null); setShowRoutineForm(true) }} style={{ padding: '1px 6px', fontSize: 11 }}>✎</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => deleteRoutine(r.id)} style={{ padding: '1px 6px', fontSize: 11, color: 'var(--text-3)' }}>✕</button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{r.days ? r.days.join(' · ') : `${r.sessionsPerWeek || r.targetPerWeek || 0}x/week`} · 🔥{r.streak}</div>
                <div className="progress-track"><div className="progress-fill green" style={{ width: `${Math.min(100, ((r.completedThisWeek || 0) / (r.targetPerWeek || 1)) * 100)}%` }} /></div>
                <button onClick={() => nav(`/autogenes/mind?tab=schedule&routine=${r.id}`)} style={{ marginTop: 6, fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>📅 View in schedule →</button>
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
            {routines.length} routine{routines.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="scroll" style={{ flex: 1 }}>
          {routines.length === 0 ? (
            <div className="empty" style={{ marginTop: 80 }}>
              <div className="empty-icon">🔄</div>
              <div className="empty-title">No routines yet</div>
              <p>Create a routine to auto-populate your schedule.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setEditRoutine(null); setRoutineContext(null); setShowRoutineForm(true) }}>
                + New routine
              </button>
            </div>
          ) : (
            <div className="pad">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Your routines</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {routines.map(r => {
                  const linked = goals.find(g => g.id === r.goalId)
                  const pct = Math.min(100, ((r.completedThisWeek || 0) / (r.targetPerWeek || 1)) * 100)
                  return (
                    <div key={r.id} className="card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 22 }}>{r.category === 'Exercise' ? '🏋️' : r.category === 'Learning' ? '📚' : r.category === 'Health' ? '❤️' : '🔄'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                          {linked && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>🎯 {linked.name}</div>}
                        </div>
                        <span style={{ fontSize: 18, color: 'var(--amber)' }}>🔥 {r.streak}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
                        {r.days ? r.days.join(' · ') : `${r.sessionsPerWeek || r.targetPerWeek || 0}× per week`} · {r.durationMins || r.minsPerSession || 60} min
                      </div>
                      <div className="progress-track" style={{ marginBottom: 8 }}>
                        <div className="progress-fill green" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => nav(`/autogenes/mind?tab=schedule&routine=${r.id}`)}>
                          📅 Schedule →
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditRoutine(r); setRoutineContext(null); setShowRoutineForm(true) }}>✎</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-3)' }} onClick={() => deleteRoutine(r.id)}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
