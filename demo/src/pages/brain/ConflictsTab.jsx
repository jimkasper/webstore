import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store.jsx'
import { detectConflicts } from '../../ai/brain.js'

const SEVERITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }
const TYPE_ICON = { schedule: '📅', budget: '💰', health: '🏥', diet: '🥗', routine: '🔄', plan: '📋' }
const FIX_PATH = { schedule: '/autogenes/mind?tab=scheduler', budget: '/autogenes/money?tab=financial', health: '/autogenes/body?tab=health', diet: '/autogenes/body?tab=diet', routine: '/autogenes/mind?tab=planner', plan: '/autogenes/mind?tab=planner' }

export default function ConflictsTab() {
  const nav = useNavigate()
  const { data } = useStore()
  const brainConfig = data.brainConfig
  const [conflicts, setConflicts] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setConflicts(await detectConflicts(data, brainConfig)) }
    catch { setConflicts([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [brainConfig?.provider])

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Misalignments between your goals, schedule, habits, finances, and health
          </span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={load} disabled={loading}>
            {loading ? '…' : '↻ Refresh'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40, fontSize: 13 }}>
            Analyzing your data…
          </div>
        )}

        {!loading && conflicts?.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40, fontSize: 13 }}>
            No conflicts detected — you're on track!
          </div>
        )}

        {!loading && conflicts?.map((c, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${SEVERITY_COLOR[c.severity] ?? '#6b7280'}`,
            borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{TYPE_ICON[c.type] ?? '⚠️'}</span>
              <span className="badge" style={{
                background: `${SEVERITY_COLOR[c.severity]}22`, color: SEVERITY_COLOR[c.severity],
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 7px', borderRadius: 4,
              }}>{c.severity}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{c.type}</span>
            </div>
            <p style={{ fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>{c.description}</p>
            {c.affected?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {c.affected.map((a, j) => <span key={j} className="badge badge-surface" style={{ fontSize: 11 }}>{a}</span>)}
              </div>
            )}
            {c.suggestion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', flex: 1 }}>💡 {c.suggestion}</span>
                {FIX_PATH[c.type] && (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                    onClick={() => nav(FIX_PATH[c.type])}>Fix it →</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
