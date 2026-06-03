import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import Modal from '../components/Modal.jsx'
import GoalForm from './planner/GoalForm.jsx'
import PlanBuilder from './planner/PlanBuilder.jsx'
import RoutineForm from './planner/RoutineForm.jsx'

const tierColor = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', platinum: 'tier-platinum', diamond: 'tier-diamond' }
const tierBadge = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠' }
const proofLabel = { location: '📍 Location check-in', route_completion: '🗺 Route completion (GPS)', financial: '💳 Financial transaction', habit_logged: '✅ Habit logged', journal_written: '📓 Journal entry' }
const APP_LABELS = { fitness: '💪 Fitness', health: '🏥 Health', financial: '💰 Financial', diet: '🥗 Diet', journal: '📓 Journal', media: '🎬 Media', learning: '🎓 Learning', kenoma: '🌀 Habit (Kenoma)' }
const APP_PATHS = { fitness: '/autogenes/body?tab=fitness', health: '/autogenes/body?tab=health', financial: '/autogenes/money?tab=financial', diet: '/autogenes/body?tab=diet', journal: '/autogenes/mind?tab=journal', media: '/autogenes/world?tab=media', learning: '/autogenes/mind?tab=learning', kenoma: '/autogenes/mind?tab=habits' }

export default function Goals() {
  const nav = useNavigate()
  const { data, addGoal, updateGoal, deleteGoal, addRoutine, updateRoutine } = useStore()
  const { goals, routines, achievements, plans, planTasks, lists, habits, habitLogs } = data

  const [selected, setSelected] = useState(goals[0]?.id ?? null)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [planBuilderGoalId, setPlanBuilderGoalId] = useState(null)
  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [editRoutine, setEditRoutine] = useState(null)
  const [routineContext, setRoutineContext] = useState(null)
  const [pendingGoalId, setPendingGoalId] = useState(null)

  const goal = goals.find(g => g.id === selected) ?? goals[0]
  const goalRoutine = goal?.routineId ? routines.find(r => r.id === goal.routineId) : null

  function handleSaveGoal(form) {
    if (editGoal?.id) {
      updateGoal(editGoal.id, form)
      setShowGoalForm(false); setEditGoal(null)
    } else {
      const id = addGoal(form)
      setSelected(id)
      setShowGoalForm(false); setEditGoal(null)
      setPendingGoalId(id)
    }
  }

  function handleSaveRoutine(form) {
    if (editRoutine?.id) {
      updateRoutine(editRoutine.id, form)
    } else {
      addRoutine(form)
    }
    setShowRoutineForm(false); setEditRoutine(null); setRoutineContext(null)
  }

  function handlePlanBuilderComplete({ type, planId }) {
    setShowPlanBuilder(false)
    if (type === 'routine') {
      const linkedPlan = plans.find(p => p.id === planId)
      const linkedGoal = linkedPlan?.goalId ? goals.find(g => g.id === linkedPlan.goalId) : null
      setRoutineContext({ plan: linkedPlan, goal: linkedGoal })
      setEditRoutine(null)
      setShowRoutineForm(true)
    } else if (type === 'schedule') {
      nav('/autogenes/mind?tab=schedule')
    }
  }

  function pct(g) {
    return Math.min(100, g.progress || (g.currentWeek != null && g.target ? g.currentWeek / g.target * 100 : 0) || (g.booksRead != null && g.target ? g.booksRead / g.target * 100 : 0) || (g.currentMonth != null && g.limit ? g.currentMonth / g.limit * 100 : 0))
  }

  return (
    <div className="content">
      {showGoalForm && (
        <Modal title={editGoal?.id ? 'Edit goal' : 'New goal'} onClose={() => { setShowGoalForm(false); setEditGoal(null) }} width={520}>
          <GoalForm initial={editGoal} onSave={handleSaveGoal} onClose={() => { setShowGoalForm(false); setEditGoal(null) }} />
        </Modal>
      )}

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
            onHandoff={(id) => { setShowRoutineForm(false); nav(`/autogenes/mind?tab=schedule&routine=${id}`) }}
          />
        </Modal>
      )}

      {showPlanBuilder && (
        <PlanBuilder
          goalId={planBuilderGoalId}
          onClose={() => setShowPlanBuilder(false)}
          onComplete={handlePlanBuilderComplete}
        />
      )}

      <div className="topbar">
        <span style={{ fontSize: 18 }}>🎯</span>
        <div className="topbar-title">Goals</div>
        <div className="topbar-sep" />
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=planner')}>← Planner</button>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => { setEditGoal(null); setShowGoalForm(true) }}>+ New goal</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="sidebar" style={{ width: 260 }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {goals.length === 0 && (
              <div style={{ padding: '16px 8px', color: 'var(--text-3)', fontSize: 13 }}>No goals yet. Create your first goal!</div>
            )}
            {goals.map(g => {
              const p = pct(g)
              const isActive = selected === g.id || (!selected && goals[0]?.id === g.id)
              return (
                <div key={g.id} onClick={() => setSelected(g.id)} style={{ padding: 10, borderRadius: 'var(--radius)', cursor: 'pointer', marginBottom: 4, background: isActive ? 'var(--accent-bg)' : 'transparent', border: `1px solid ${isActive ? 'rgba(167,139,250,.3)' : 'transparent'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{g.name}</span>
                    {g.tier && <span className={`badge ${tierColor[g.tier]}`}>{tierBadge[g.tier]}</span>}
                    <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); setEditGoal(g); setShowGoalForm(true) }} style={{ padding: '1px 6px', fontSize: 11 }}>✎</button>
                    <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); deleteGoal(g.id); if (selected === g.id) setSelected(null) }} style={{ padding: '1px 6px', fontSize: 11, color: 'var(--text-3)' }}>✕</button>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${p}%` }} /></div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                    {g.streak > 0 && `🔥 ${g.streak}  `}
                    {g.planId && <span style={{ color: 'var(--accent)' }}>📋 plan</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="scroll" style={{ flex: 1 }}>
          {pendingGoalId && (
            <div style={{ margin: 20, padding: 16, background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.35)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>🎯 Goal created!</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Break it into a plan, or set up a routine to build the habit.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setPlanBuilderGoalId(pendingGoalId); setPendingGoalId(null); setShowPlanBuilder(true) }}>
                  📋 Build a plan →
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const g = goals.find(x => x.id === pendingGoalId)
                  setRoutineContext({ goal: g })
                  setPendingGoalId(null)
                  setEditRoutine(null)
                  setShowRoutineForm(true)
                }}>
                  🔄 Create a routine →
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPendingGoalId(null)}>Done for now</button>
              </div>
            </div>
          )}

          {goal && !pendingGoalId && (
            <div className="pad">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <div className="page-title">{goal.name}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <span className={`badge ${tierColor[goal.tier] || 'badge-surface'}`}>{tierBadge[goal.tier] || ''} {goal.tier || 'no tier yet'}</span>
                    <span className="badge badge-surface">{goal.type}</span>
                    {goal.period && <span className="badge badge-surface">{goal.period}</span>}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditGoal(goal); setShowGoalForm(true) }}>✎ Edit</button>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600 }}>Progress</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                    {goal.type === 'frequency' && goal.target ? `${goal.currentWeek || 0}/${goal.target} this ${goal.period}`
                      : goal.type === 'threshold' && goal.limit ? `$${goal.currentMonth || 0}/$${goal.limit}`
                      : goal.booksRead != null && goal.target ? `${goal.booksRead}/${goal.target}`
                      : `${goal.progress || 0}%`}
                  </span>
                </div>
                <div className="progress-track" style={{ height: 10 }}>
                  <div className="progress-fill" style={{ width: `${pct(goal)}%` }} />
                </div>
                {goal.streak > 0 && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--amber)' }}>🔥 {goal.streak}-{goal.period === 'weekly' ? 'week' : 'day'} streak · {goal.credits || 0} credits</div>}
              </div>

              {(goal.apps || []).length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Connected apps</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(goal.apps || []).map(a => (
                      <button key={a} onClick={() => nav(APP_PATHS[a] || '/autogenes')}
                        style={{ fontSize: 12, background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 10, padding: '3px 10px', cursor: 'pointer' }}>
                        {APP_LABELS[a] || a}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Activities logged in these apps automatically count toward this goal.</div>
                </div>
              )}

              {achievements.filter(a => a.goalId === goal.id).length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Achievements</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {achievements.filter(a => a.goalId === goal.id).map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{a.badge}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.streak}-week streak · {a.credits} credits</div>
                        </div>
                        <span className={`badge ${tierColor[a.tier] || 'badge-surface'}`}>{tierBadge[a.tier]} {a.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Proof mechanism</div>
                <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: 13 }}>{proofLabel[goal.proof] || goal.proof}</div>
              </div>

              {goal.planId ? (() => {
                const linkedPlan = plans.find(p => p.id === goal.planId)
                const pts = linkedPlan ? planTasks.filter(t => t.planId === linkedPlan.id) : []
                const done = pts.filter(t => t.status === 'done').length
                return linkedPlan ? (
                  <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(167,139,250,.3)', cursor: 'pointer' }} onClick={() => nav('/autogenes/mind?tab=plans')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📋</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{linkedPlan.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{done}/{pts.length} tasks done</div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--accent)' }}>View →</span>
                    </div>
                  </div>
                ) : null
              })() : (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>📋</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>No plan yet</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Break this goal into tasks</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => { setPlanBuilderGoalId(goal.id); setShowPlanBuilder(true) }}>
                      📋 Build a plan →
                    </button>
                  </div>
                </div>
              )}

              {goalRoutine ? (
                <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(167,139,250,.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>🔄</span>
                    <span style={{ fontWeight: 600 }}>Linked routine</span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>{goalRoutine.name}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => nav(`/autogenes/mind?tab=schedule&routine=${goalRoutine.id}`)}>
                    📅 View in Schedule →
                  </button>
                </div>
              ) : (
                <div className="card" style={{ marginBottom: 16, borderStyle: 'dashed' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🔄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>No routine yet</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Build a recurring habit around this goal</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setRoutineContext({ goal }); setEditRoutine(null); setShowRoutineForm(true) }}>
                      🔄 Create routine →
                    </button>
                  </div>
                </div>
              )}

              {/* Linked habits */}
              {(() => {
                const linkedHabits = (habits || []).filter(h => h.goalId === goal.id)
                if (!linkedHabits.length) return null
                return (
                  <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(132,204,22,.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>🌀</span>
                      <span style={{ fontWeight: 600 }}>Linked habits</span>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}
                        onClick={() => nav('/autogenes/mind?tab=habits')}>
                        Open Habits →
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {linkedHabits.map(h => (
                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16 }}>{h.icon}</span>
                          <span style={{ flex: 1, fontSize: 13 }}>{h.name}</span>
                          {h.cleanStreak > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--accent)' }}>🔥 {h.cleanStreak}d streak</span>
                          )}
                          <span className="badge" style={{ fontSize: 10 }}>{h.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {!goal && (
            <div className="empty">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No goals yet</div>
              <p>Set a goal to start tracking your progress.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setEditGoal(null); setShowGoalForm(true) }}>
                + New goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
