import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const PILLAR_APPS = {
  body:   { icon: '🏃', label: 'Body',     path: '/autogenes/body',   desc: 'Fitness · Health · Diet',                                    color: '#22c55e' },
  mind:   { icon: '🧩', label: 'Mind',     path: '/autogenes/mind',   desc: 'Planner · Scheduler · Journal · Learning',                   color: '#a78bfa' },
  money:  { icon: '💼', label: 'Life',     path: '/autogenes/money',  desc: 'Financial · Lists · Agreements · Research',                  color: '#f59e0b' },
  world:  { icon: '🌍', label: 'World',    path: '/autogenes/world',  desc: 'Contacts · Media · Around Town · Posthumous · Draft',        color: '#60a5fa' },
  brain:  { icon: '🤖', label: 'Brain',    path: '/autogenes/brain',  desc: 'AI queries · Conflicts · Datapoints · Insights',             color: '#84cc16' },
}

const DEFAULT_GROUPS = [
  { id: 'body',   label: 'Body',     appIds: ['body'] },
  { id: 'mind',   label: 'Mind',     appIds: ['mind'] },
  { id: 'money',  label: 'Life',     appIds: ['money'] },
  { id: 'world',  label: 'World',    appIds: ['world'] },
  { id: 'other',  label: 'Brain',    appIds: ['brain'] },
]

function PillarTile({ app, nav }) {
  return (
    <div onClick={() => nav(app.path)}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px', cursor: 'pointer', transition: 'border-color .15s, transform .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = app.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 26, color: app.color }}>{app.icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{app.label}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 10 }}>{app.desc}</div>
      <div style={{ fontSize: 12, color: app.color, fontWeight: 600 }}>Open →</div>
    </div>
  )
}

export default function LifeSuite() {
  const nav = useNavigate()
  const { data } = useStore()
  const groups = DEFAULT_GROUPS

  const { goals, achievements, lensEvents, routines } = data
  const totalCredits = achievements.reduce((s, a) => s + (a.credits || 0), 0)
  const activeGoals = goals.filter(g => (g.progress || 0) < 100).length
  const thisWeekEvents = lensEvents.filter(le => {
    const d = new Date(le.recordedAt)
    const now = new Date()
    const weekAgo = new Date(now - 7 * 86400000)
    return d >= weekAgo
  }).length
  const activeStreaks = routines.filter(r => r.streak > 0).length

  return (
    <div className="content">
      <div className="topbar">
        <div className="topbar-title">Autogenes</div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/monogenes')}>My Monogenes →</button>
        </div>
      </div>
      <div className="scroll">
        <div className="pad">
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Active goals', value: activeGoals, icon: '🎯', path: '/life/planner' },
              { label: 'Credits earned', value: totalCredits, icon: '⬡', path: '/life/planner' },
              { label: 'Active streaks', value: activeStreaks, icon: '🔥', path: '/life/planner' },
              { label: 'Events this week', value: thisWeekEvents, icon: '📊', path: '/life/brain' },
            ].map(s => (
              <div key={s.label} onClick={() => nav(s.path)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{s.icon} {s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pillar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 28 }}>
            {Object.values(PILLAR_APPS).map(app => <PillarTile key={app.path} app={app} nav={nav} />)}
          </div>

          {/* Recent activity */}
          {lensEvents.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
                Recent activity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...lensEvents].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 8).map(le => (
                  <div key={le.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}>
                    <span style={{ fontSize: 16 }}>
                      {le.type?.startsWith('fitness') ? '💪' : le.type?.startsWith('diet') ? '🥗' : le.type?.startsWith('media') ? '🎬' : le.type?.startsWith('learning') ? '🎓' : le.type?.startsWith('journal') ? '📓' : le.type?.startsWith('planner') ? '🎯' : '📊'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{le.payload?.title || le.payload?.activity || le.type?.replace('.', ' — ') || 'Event'}</span>
                      <span style={{ color: 'var(--text-3)', marginLeft: 8, fontSize: 11 }}>{le.source}</span>
                    </div>
                    <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{le.recordedAt.slice(0, 10)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
