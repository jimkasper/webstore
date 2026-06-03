import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

export default function Planner() {
  const nav = useNavigate()
  const { data } = useStore()
  const { goals, routines, achievements, plans } = data

  const activeGoals = goals.filter(g => (g.progress || 0) < 100)
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + (g.progress || 0), 0) / activeGoals.length)
    : 0
  const totalStreak = routines.reduce((s, r) => s + (r.streak || 0), 0)
  const earnedAchievements = achievements.filter(a => !a.isCustom || a.earned)
  const totalCredits = achievements.reduce((s, a) => s + (a.credits || 0), 0)

  const steps = [
    { icon: '🎯', label: 'Goals', tab: 'goals', desc: 'Set what you want to achieve' },
    { icon: '📋', label: 'Plans', tab: 'plans', desc: 'Break goals into tasks' },
    { icon: '🔄', label: 'Routines', tab: 'routines', desc: 'Build consistent habits' },
    { icon: '📅', label: 'Schedule', tab: 'schedule', desc: 'Put it on the calendar' },
    { icon: '🏆', label: 'Achievements', tab: 'achievements', desc: 'Track milestones earned' },
  ]

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🎯</span>
        <div className="topbar-title">Planner</div>
      </div>

      <div className="scroll">
        <div className="pad">
          {/* Workflow banner */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Workflow
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
              {steps.map((step, i) => (
                <div key={step.tab} style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => nav(`/autogenes/mind?tab=${step.tab}`)}
                    style={{ background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer', textAlign: 'center', minWidth: 90 }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{step.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{step.desc}</div>
                  </button>
                  {i < steps.length - 1 && (
                    <div style={{ fontSize: 16, color: 'var(--text-3)', padding: '0 6px' }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{activeGoals.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Active goals</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{avgProgress}% avg progress</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--amber)' }}>{routines.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Routines</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>🔥 {totalStreak} total streak days</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{earnedAchievements.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Achievements</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>+{totalCredits} credits</div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <button className="btn btn-primary" onClick={() => nav('/autogenes/mind?tab=goals')}>🎯 New Goal</button>
            <button className="btn btn-ghost" onClick={() => nav('/autogenes/mind?tab=plans')}>📋 Build a Plan</button>
            <button className="btn btn-ghost" onClick={() => nav('/autogenes/mind?tab=routines')}>🔄 New Routine</button>
            <button className="btn btn-ghost" onClick={() => nav('/autogenes/mind?tab=schedule')}>📅 Open Schedule</button>
          </div>

          {/* Recent activity */}
          {goals.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Active Goals</div>
              {activeGoals.slice(0, 4).map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${g.progress || 0}%` }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{g.progress || 0}%</div>
                </div>
              ))}
              {activeGoals.length > 4 && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => nav('/autogenes/mind?tab=goals')}>
                  View all {activeGoals.length} goals →
                </button>
              )}
            </div>
          )}

          {goals.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No goals yet</div>
              <p>Start by setting a goal, then build a plan to achieve it.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => nav('/autogenes/mind?tab=goals')}>
                🎯 Set your first goal →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
