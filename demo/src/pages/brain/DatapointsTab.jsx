import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store.jsx'
import {
  suggestDatapoints, getDataInventory, getCorrelations, getSuggestedQueries,
} from '../../ai/brain.js'

const APP_PATH = { Fitness: '/autogenes/body?tab=fitness', Health: '/autogenes/body?tab=health', Diet: '/autogenes/body?tab=diet', Financial: '/autogenes/money?tab=financial', Journal: '/autogenes/mind?tab=journal', Planner: '/autogenes/mind?tab=planner', Scheduler: '/autogenes/mind?tab=scheduler' }
const APP_ICON = { Fitness: '💪', Health: '🏥', Diet: '🥗', Financial: '💰', Journal: '📓', Planner: '🎯', Scheduler: '📅' }

const QUALITY_BADGE = {
  rich:     { label: 'Rich',     bg: 'var(--accent)',  color: '#fff' },
  moderate: { label: 'Moderate', bg: '#f59e0b',        color: '#fff' },
  sparse:   { label: 'Sparse',   bg: 'var(--surface)', color: 'var(--text-3)', border: '1px solid var(--border)' },
  none:     { label: 'No data',  bg: 'transparent',    color: 'var(--text-3)', border: '1px solid var(--border)' },
}

const STRENGTH_BADGE = {
  strong:   { label: 'Strong',   bg: '#22c55e20', color: '#16a34a' },
  moderate: { label: 'Moderate', bg: '#f59e0b20', color: '#b45309' },
  weak:     { label: 'Weak',     bg: 'var(--surface)', color: 'var(--text-3)' },
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

// ─── Shared bottom sections ───────────────────────────────────────────────────

function CorrelationsSection({ correlations }) {
  if (!correlations) return null
  if (correlations.length === 0) {
    return (
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          What your data reveals
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
          Add data across multiple apps to uncover patterns — e.g. how workouts affect mood, or how sleep impacts energy.
        </p>
      </div>
    )
  }
  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        What your data reveals
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {correlations.map((c, i) => {
          const sb = STRENGTH_BADGE[c.strength] ?? STRENGTH_BADGE.weak
          return (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 7px',
                  borderRadius: 99, background: sb.bg, color: sb.color,
                }}>{sb.label}</span>
                {c.apps?.map(a => (
                  <span key={a} style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 99,
                    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-3)',
                  }}>{a}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>{c.insight}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QueriesSection({ queries, onQuery }) {
  if (!queries?.length) return null
  return (
    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        Ask Brain
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {queries.map((q, i) => (
          <button key={i}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12, textAlign: 'left', whiteSpace: 'normal', height: 'auto', lineHeight: 1.4 }}
            onClick={() => onQuery(q)}>
            {q} →
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── My Data sub-page ─────────────────────────────────────────────────────────

function MyDataPage({ correlations, queries, onQuery }) {
  const nav = useNavigate()
  const { data } = useStore()
  const inventory = getDataInventory(data)
  const totalRecords = inventory.reduce((s, app) => s + (typeof app.metrics[0]?.value === 'number' ? app.metrics[0].value : 0), 0)

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 20 }}>
          Your tracked data across nTogether apps — {totalRecords} total records.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {inventory.map(app => {
            const qb = QUALITY_BADGE[app.quality]
            return (
              <div key={app.app} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{app.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{app.app}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, flexShrink: 0,
                    background: qb.bg, color: qb.color, border: qb.border,
                  }}>{qb.label}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {app.metrics.map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-3)' }}>{m.label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{m.value}</span>
                    </div>
                  ))}
                </div>

                {app.range && (
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {fmtDate(app.range.from)} – {fmtDate(app.range.to)}
                  </div>
                )}

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, alignSelf: 'flex-start' }}
                  onClick={() => nav(app.path)}>
                  Open app →
                </button>
              </div>
            )
          })}
        </div>

        <CorrelationsSection correlations={correlations} />
        <QueriesSection queries={queries} onQuery={onQuery} />
      </div>
    </div>
  )
}

// ─── Suggestions sub-page ─────────────────────────────────────────────────────

function SuggestionsPage({ correlations, queries, onQuery }) {
  const nav = useNavigate()
  const { data } = useStore()
  const brainConfig = data.brainConfig
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(new Set())
  const [showDismissed, setShowDismissed] = useState(false)

  useEffect(() => {
    suggestDatapoints(data, brainConfig)
      .then(setSuggestions).catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [brainConfig?.provider])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        Analyzing what you should start tracking…
      </div>
    )
  }

  const visible = suggestions?.filter((_, i) => !dismissed.has(i)) ?? []
  const byApp = visible.reduce((acc, s) => {
    const app = s.app || 'Other'
    if (!acc[app]) acc[app] = []
    acc[app].push({ ...s, _idx: suggestions.indexOf(s) })
    return acc
  }, {})

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 20 }}>
          Metrics you're not yet tracking that would improve your decisions.
        </p>

        {Object.entries(byApp).map(([app, items]) => (
          <div key={app} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{APP_ICON[app] ?? '📊'}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{app}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(s => (
                <div key={s._idx} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.metric}</div>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 4px', lineHeight: 1.5 }}>{s.why}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>📍 {s.howToTrack}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {APP_PATH[app] && (
                      <button className="btn btn-primary btn-sm" style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                        onClick={() => nav(APP_PATH[app])}>
                        Start tracking →
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                      onClick={() => setDismissed(d => new Set([...d, s._idx]))}>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {dismissed.size > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}
            onClick={() => setShowDismissed(v => !v)}>
            {showDismissed ? 'Hide dismissed' : `Show dismissed (${dismissed.size})`}
          </button>
        )}
        {showDismissed && suggestions?.filter((_, i) => dismissed.has(i)).map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '10px 14px', marginTop: 8,
            opacity: 0.5, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 13, flex: 1 }}>{s.metric} ({s.app})</span>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
              onClick={() => setDismissed(d => { const n = new Set(d); n.delete(suggestions.indexOf(s)); return n })}>
              Restore
            </button>
          </div>
        ))}

        <CorrelationsSection correlations={correlations} />
        <QueriesSection queries={queries} onQuery={onQuery} />
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DatapointsTab({ onQuery }) {
  const { data } = useStore()
  const brainConfig = data.brainConfig
  const [subTab, setSubTab] = useState('data')
  const [correlations, setCorrelations] = useState(null)
  const queries = getSuggestedQueries(data)

  useEffect(() => {
    getCorrelations(data, brainConfig).then(setCorrelations).catch(() => setCorrelations([]))
  }, [brainConfig?.provider])

  const subTabStyle = active => ({
    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
    paddingBottom: 10,
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    fontSize: 13,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', gap: 2, padding: '8px 24px 0',
        borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0,
      }}>
        <button
          className={`btn btn-ghost btn-sm ${subTab === 'data' ? 'active' : ''}`}
          style={subTabStyle(subTab === 'data')}
          onClick={() => setSubTab('data')}>
          📊 My Data
        </button>
        <button
          className={`btn btn-ghost btn-sm ${subTab === 'suggestions' ? 'active' : ''}`}
          style={subTabStyle(subTab === 'suggestions')}
          onClick={() => setSubTab('suggestions')}>
          💡 Suggestions
        </button>
      </div>

      {subTab === 'data'
        ? <MyDataPage correlations={correlations} queries={queries} onQuery={q => onQuery?.(q)} />
        : <SuggestionsPage correlations={correlations} queries={queries} onQuery={q => onQuery?.(q)} />
      }
    </div>
  )
}
