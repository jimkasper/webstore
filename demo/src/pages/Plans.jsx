import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import PlanDetail from './planner/PlanDetail.jsx'
import PlanBuilder from './planner/PlanBuilder.jsx'
import RoutineForm from './planner/RoutineForm.jsx'
import Modal from '../components/Modal.jsx'

export default function Plans() {
  const nav = useNavigate()
  const { data, addRoutine, updateRoutine } = useStore()
  const { goals, routines, plans, planTasks, lists } = data

  const [selected, setSelected] = useState(plans[0]?.id ?? null)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [planBuilderGoalId, setPlanBuilderGoalId] = useState(null)
  const [showRoutineForm, setShowRoutineForm] = useState(false)
  const [editRoutine, setEditRoutine] = useState(null)
  const [routineContext, setRoutineContext] = useState(null)

  const plan = plans.find(p => p.id === selected)

  function pctForPlan(p) {
    const pts = planTasks.filter(t => t.planId === p.id)
    return pts.length ? Math.round(pts.filter(t => t.status === 'done').length / pts.length * 100) : 0
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
    if (planId) setSelected(planId)
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
        <span style={{ fontSize: 18 }}>📋</span>
        <div className="topbar-title">Plans</div>
        <div className="topbar-sep" />
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=planner')}>← Planner</button>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => { setPlanBuilderGoalId(null); setShowPlanBuilder(true) }}>+ New plan</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="sidebar" style={{ width: 260 }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {plans.length === 0 && (
              <div style={{ padding: '16px 8px', color: 'var(--text-3)', fontSize: 13 }}>No plans yet.</div>
            )}
            {plans.map(p => {
              const pct = pctForPlan(p)
              const pts = planTasks.filter(t => t.planId === p.id)
              const linked = goals.find(g => g.id === p.goalId)
              return (
                <div key={p.id} onClick={() => setSelected(p.id)} style={{ padding: 10, borderRadius: 'var(--radius)', cursor: 'pointer', marginBottom: 4, background: selected === p.id ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${selected === p.id ? 'rgba(167,139,250,.3)' : 'var(--border)'}` }}>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
                  {linked && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>🎯 {linked.name}</div>}
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{pts.filter(t => t.status === 'done').length}/{pts.length} tasks</div>
                </div>
              )
            })}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
            {plans.length} plan{plans.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="scroll" style={{ flex: 1 }}>
          {plan && <PlanDetail plan={plan} />}
          {!plan && (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No plan selected</div>
              <p>Pick a plan from the sidebar or create a new one.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setPlanBuilderGoalId(null); setShowPlanBuilder(true) }}>
                📋 Create a plan →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
