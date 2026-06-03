import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import Modal from '../components/Modal.jsx'
import AchievementBuilder from './planner/AchievementBuilder.jsx'

const tierColor = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', platinum: 'tier-platinum', diamond: 'tier-diamond' }
const tierBadge = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠' }

export default function Achievements() {
  const nav = useNavigate()
  const { data, addAchievement, deleteAchievement, shareToSpace } = useStore()
  const { goals, plans, routines, achievements } = data

  const [showBuilder, setShowBuilder] = useState(false)

  const totalCredits = achievements.reduce((s, a) => s + (a.credits || 0), 0)
  const earnedCustom = achievements.filter(a => a.isCustom && a.earned).length

  return (
    <div className="content">
      {showBuilder && (
        <Modal title="Create Achievement" onClose={() => setShowBuilder(false)} width={520}>
          <AchievementBuilder
            goals={goals}
            plans={plans}
            routines={routines}
            onSave={ach => { addAchievement(ach); setShowBuilder(false) }}
            onClose={() => setShowBuilder(false)}
          />
        </Modal>
      )}

      <div className="topbar">
        <span style={{ fontSize: 18 }}>🏆</span>
        <div className="topbar-title">Achievements</div>
        <div className="topbar-sep" />
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=planner')}>← Planner</button>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setShowBuilder(true)}>+ Create achievement</button>
        </div>
      </div>

      <div className="scroll">
        <div className="pad">
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{achievements.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Total achievements</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>{totalCredits}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Credits earned</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{earnedCustom}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Custom earned</div>
            </div>
          </div>

          {achievements.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🏆</div>
              <div className="empty-title">No achievements yet</div>
              <p>Keep building streaks and completing goals — achievements unlock automatically.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowBuilder(true)}>
                + Create custom achievement
              </button>
            </div>
          )}

          {achievements.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {achievements.map(a => (
                <div key={a.id} className="card card-sm" style={{ textAlign: 'center', borderColor: a.tier === 'gold' ? 'rgba(251,191,36,.3)' : undefined, position: 'relative' }}>
                  {a.isCustom && (
                    <button onClick={() => deleteAchievement(a.id)} title="Delete"
                      style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer', padding: 2, lineHeight: 1 }}>✕</button>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{a.badge}</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                  <span className={`badge ${tierColor[a.tier]}`}>{a.tier}</span>
                  {a.isCustom ? (
                    <div style={{ fontSize: 12, color: a.earned ? 'var(--accent)' : 'var(--text-3)', marginTop: 6 }}>
                      {a.earned ? '✅ Earned' : '⏳ Not yet earned'}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>🔥 {a.streak} streak</div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 2 }}>+{a.credits} credits</div>
                  {(!a.isCustom || a.earned) && (
                    <button onClick={() => shareToSpace(`Just earned the ${a.name} achievement${a.streak > 0 ? ` — ${a.streak}-week streak` : ''} ${a.badge}`, { source: 'planner', sourceType: 'achievement' })}
                      style={{ marginTop: 8, fontSize: 11, background: 'none', border: '1px solid var(--accent)', borderRadius: 4, padding: '2px 8px', color: 'var(--accent)', cursor: 'pointer' }}>
                      Share to SPACE
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
