import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const TIER_CLASS = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', platinum: 'tier-platinum', diamond: 'tier-diamond' }
const TYPE_COLOR = { work: 'var(--c-work)', exercise: 'var(--c-exercise)', social: 'var(--c-social)', learning: 'var(--c-learning)', health: 'var(--c-health)', errand: 'var(--c-errand)', fun: 'var(--c-fun)' }

function typeColor(type) { return TYPE_COLOR[type] || 'var(--text-3)' }
function timeLabel(iso) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayStr() { return new Date().toISOString().slice(0, 10) }

function weekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}

function MiniBar({ value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 3, height: 5, flex: 1, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .4s' }} />
    </div>
  )
}

function WeeklyWorkoutChart({ lensEvents }) {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() - i * 7)
    const start = d.toISOString().slice(0, 10)
    const end = new Date(d.getTime() + 6 * 86400000).toISOString().slice(0, 10)
    const label = `W${d.getMonth() + 1}/${d.getDate()}`
    const count = lensEvents.filter(e =>
      e.type?.startsWith('fitness.') && e.recordedAt >= start && e.recordedAt <= end + 'T23:59'
    ).length
    weeks.push({ label, count })
  }
  const max = Math.max(...weeks.map(w => w.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 52, marginTop: 8 }}>
      {weeks.map((w, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ width: '100%', background: i === weeks.length - 1 ? 'var(--accent)' : 'var(--accent-dim, #4ade8044)', borderRadius: '3px 3px 0 0', height: `${(w.count / max) * 40}px`, minHeight: w.count > 0 ? 4 : 1, transition: 'height .4s' }} />
          <div style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{w.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const { data } = useStore()
  const { goals, routines, events, journalEntries, achievements, lensEvents, transactions } = data

  const today = todayStr()
  const wStart = weekStart()

  const todayEvents = events
    .filter(e => (e.start || e.date || '').startsWith(today))
    .sort((a, b) => (a.start || '').localeCompare(b.start || ''))

  const upcoming = todayEvents.filter(e => e.status === 'upcoming' || e.status === 'active')
  const done = todayEvents.filter(e => e.status === 'finished' || e.status === 'done')

  const activeGoals = goals.slice(0, 4)
  const topStreaks = routines.filter(r => r.streak > 0).sort((a, b) => b.streak - a.streak).slice(0, 3)
  const todayJournal = journalEntries.find(j => j.date === today)
  const recentJournal = journalEntries.slice(0, 5)

  // Weekly stats
  const weekWorkouts = lensEvents.filter(e => e.type?.startsWith('fitness.') && e.recordedAt >= wStart).length
  const monthStr = today.slice(0, 7)
  const monthSpend = transactions.filter(t => t.amount < 0 && t.date.startsWith(monthStr)).reduce((s, t) => s + Math.abs(t.amount), 0)
  const moodAvg = journalEntries.slice(0, 7).filter(e => e.dayRating).reduce((s, e, _, a) => s + e.dayRating / a.length, 0)

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>⊞</span>
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{dateLabel}</span>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => nav('/life/journal')}>+ Journal entry</button>
        </div>
      </div>

      <div className="scroll">
        <div className="pad">

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <div className="page-title">{greeting()}, {data.user.name.split(' ')[0]} 👋</div>
            <div className="page-sub">
              {upcoming.length > 0
                ? `${upcoming.length} event${upcoming.length !== 1 ? 's' : ''} ahead today`
                : done.length > 0
                ? `All ${done.length} events done today — great work`
                : 'No events scheduled today'}
              {topStreaks[0] ? ` · 🔥 ${topStreaks[0].name} streak at ${topStreaks[0].streak} weeks` : ''}
            </div>
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Workouts this week', value: weekWorkouts, icon: '💪' },
              { label: 'Spent this month', value: `$${monthSpend.toFixed(0)}`, icon: '💳' },
              { label: 'Avg mood (7 days)', value: moodAvg > 0 ? `${moodAvg.toFixed(1)}/5` : '—', icon: '😊' },
              { label: 'Credits earned', value: data.user.credits, icon: '⬡' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', flex: '1 1 140px' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            {/* Today's schedule */}
            <div>
              <div className="section-title">Today's schedule</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {todayEvents.length === 0 && (
                  <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '16px 0' }}>
                    Nothing scheduled today.
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => nav('/life/scheduler')}>Add event →</button>
                  </div>
                )}
                {todayEvents.map(ev => {
                  const isDone = ev.status === 'finished' || ev.status === 'done'
                  return (
                    <div key={ev.id} onClick={() => nav('/life/scheduler')} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 'var(--radius)',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      cursor: 'pointer', opacity: isDone ? 0.55 : 1,
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ width: 3, height: 32, borderRadius: 2, background: typeColor(ev.type), flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {ev.title}
                          {isDone && <span className="badge badge-surface" style={{ fontSize: 10 }}>✓ done</span>}
                          {ev.status === 'active' && <span className="badge badge-new" style={{ fontSize: 10 }}>● active</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          {ev.start ? `${timeLabel(ev.start)} — ${timeLabel(ev.end)}` : ev.date}
                          {ev.routineId && <span style={{ marginLeft: 6, color: 'var(--accent)', opacity: 0.8 }}>↺ routine</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => nav('/life/scheduler')}>
                  Open full calendar →
                </button>
              </div>
            </div>

            {/* Active goals */}
            <div>
              <div className="section-title">Active goals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeGoals.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No goals yet.</div>}
                {activeGoals.map(g => {
                  const pct = g.progress ?? (g.currentWeek != null && g.target ? (g.currentWeek / g.target) * 100 : 0)
                  const sub = g.streak ? `🔥 ${g.streak} wk streak` : g.booksRead != null ? `${g.booksRead}/${g.target} books` : g.currentMonth != null ? `$${g.currentMonth}/$${g.limit}` : g.currentWeek != null ? `${g.currentWeek}/${g.target} this week` : ''
                  return (
                    <div key={g.id} onClick={() => nav('/life/planner')} className="card card-sm" style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{g.name}</div>
                        {g.tier && <span className={`badge ${TIER_CLASS[g.tier]}`}>{g.tier}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MiniBar value={pct} max={100} color={pct > 80 ? 'var(--green)' : 'var(--accent)'} />
                        <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{Math.round(pct)}%</span>
                      </div>
                      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
                    </div>
                  )
                })}
                <button className="btn btn-ghost btn-sm" onClick={() => nav('/life/planner')}>All goals →</button>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Left: streaks + workouts chart */}
            <div>
              <div className="section-title">Streak highlights</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {topStreaks.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No streaks yet.</div>}
                {topStreaks.map(r => (
                  <div key={r.id} className="card card-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => nav('/life/planner')}>
                    <div style={{ fontSize: 22, marginBottom: 2 }}>🔥</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{r.streak}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.name}</div>
                  </div>
                ))}
              </div>

              <div className="section-title">Workout activity</div>
              <div className="card card-sm" style={{ cursor: 'pointer' }} onClick={() => nav('/life/fitness')}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Sessions per week · last 8 weeks</div>
                <WeeklyWorkoutChart lensEvents={lensEvents} />
              </div>
            </div>

            {/* Right: journal + achievements */}
            <div>
              <div className="section-title">Journal</div>
              {todayJournal ? (
                <div className="card card-sm" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => nav('/life/journal')}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Today</div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{todayJournal.highlight}</div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} style={{ color: i < todayJournal.dayRating ? 'var(--amber)' : 'var(--text-3)', fontSize: 13 }}>★</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card card-sm" style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📓</div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>No entry yet today</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Take 5 minutes to reflect.</div>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); nav('/life/journal') }}>Write entry</button>
                </div>
              )}

              {recentJournal.filter(j => j.date !== today).slice(0, 3).map(j => (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => nav('/life/journal')}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{j.highlight}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{j.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {Array.from({ length: j.dayRating || 0 }, (_, i) => <span key={i} style={{ color: 'var(--amber)', fontSize: 10 }}>★</span>)}
                  </div>
                </div>
              ))}

              <div className="section-title" style={{ marginTop: 20 }}>Recent achievements</div>
              {achievements.slice(0, 3).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18 }}>{a.badge}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.streak} periods · {a.credits} credits</div>
                  </div>
                  <span className={`badge ${TIER_CLASS[a.tier]}`}>{a.tier}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
