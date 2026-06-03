import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { askBrain } from '../ai/brain.js'

// ─── ISO week helper ──────────────────────────────────────────────────────────
function isoWeek(dateStr) {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const w1 = new Date(d.getFullYear(), 0, 4)
  const wn = 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7)
  return `${d.getFullYear()}-W${String(wn).padStart(2, '0')}`
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Dynamic query computation ────────────────────────────────────────────────
function computeRows(queryId, data) {
  const { lensEvents, journalEntries, transactions, goals, routines } = data

  if (queryId === 'workouts') {
    const byWeek = {}
    lensEvents.filter(e => e.type?.startsWith('fitness.')).forEach(e => {
      const w = isoWeek(e.recordedAt)
      if (!byWeek[w]) byWeek[w] = { w, n: 0, mins: 0 }
      byWeek[w].n++
      byWeek[w].mins += e.payload?.durationMins || 45
    })
    return Object.values(byWeek)
      .sort((a, b) => a.w.localeCompare(b.w)).slice(-8)
      .map(r => [r.w, r.n, Math.round(r.mins / r.n)])
  }

  if (queryId === 'mood') {
    return journalEntries
      .filter(e => e.dayRating && e.date)
      .sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
      .map(e => [fmtDate(e.date), e.dayRating])
  }

  if (queryId === 'spending') {
    const byCat = {}
    transactions.filter(t => t.amount < 0).forEach(t => {
      const c = t.category || 'Other'
      if (!byCat[c]) byCat[c] = { total: 0, count: 0 }
      byCat[c].total += Math.abs(t.amount)
      byCat[c].count++
    })
    return Object.entries(byCat)
      .map(([c, v]) => [c, Math.round(v.total * 100) / 100, v.count])
      .sort((a, b) => b[1] - a[1])
  }

  if (queryId === 'crosssource') {
    const byWeek = {}
    lensEvents.filter(e => e.type?.startsWith('fitness.')).forEach(e => {
      const w = isoWeek(e.recordedAt)
      if (!byWeek[w]) byWeek[w] = { w, workouts: 0, social_spend: 0 }
      byWeek[w].workouts++
    })
    transactions.filter(t => t.amount < 0 && ['Dining Out', 'Bars', 'Coffee'].includes(t.category)).forEach(t => {
      const w = isoWeek(t.date)
      if (!byWeek[w]) byWeek[w] = { w, workouts: 0, social_spend: 0 }
      byWeek[w].social_spend += Math.abs(t.amount)
    })
    return Object.values(byWeek)
      .sort((a, b) => a.w.localeCompare(b.w)).slice(-6)
      .map(r => [r.w, r.workouts, Math.round(r.social_spend * 100) / 100])
  }

  if (queryId === 'streaks') {
    const rows = []
    goals.filter(g => g.streak > 0).forEach(g => rows.push([g.name, g.streak, g.streak, g.tier || 'bronze', g.credits || 0]))
    routines.filter(r => r.streak > 0).forEach(r => rows.push([r.name, r.streak, r.streak, 'routine', 0]))
    return rows.sort((a, b) => b[1] - a[1])
  }

  return []
}

// ─── Query definitions ────────────────────────────────────────────────────────
const QUERIES = [
  {
    id: 'workouts', label: 'Workouts per week', icon: '💪',
    sql: `SELECT strftime('%Y-W%W', recorded_at) AS week,\n  COUNT(*) AS workouts,\n  ROUND(AVG(json_extract(payload,'$.durationMins'))) AS avg_mins\nFROM lens_events\nWHERE type LIKE 'fitness.%'\nGROUP BY week ORDER BY week DESC LIMIT 8;`,
    columns: ['week', 'workouts', 'avg_mins'], chartType: 'bar', chartKey: 'workouts', chartColor: '#4ade80', chartLabel: 'Workouts',
  },
  {
    id: 'mood', label: 'Mood trend (14 days)', icon: '😊',
    sql: `SELECT entry_date, day_rating\nFROM journal_entries\nWHERE entry_date >= date('now', '-14 days')\nORDER BY entry_date ASC;`,
    columns: ['date', 'day_rating'], chartType: 'line', chartKey: 'day_rating', chartColor: '#a78bfa', chartLabel: 'Day rating',
  },
  {
    id: 'spending', label: 'Spending by category', icon: '💳',
    sql: `SELECT category,\n  ROUND(SUM(ABS(amount)), 2) AS total,\n  COUNT(*) AS transactions\nFROM transactions\nWHERE amount < 0\nGROUP BY category ORDER BY total DESC;`,
    columns: ['category', 'total', 'transactions'], chartType: 'bar', chartKey: 'total', chartColor: '#60a5fa', chartLabel: 'Spend ($)',
  },
  {
    id: 'crosssource', label: 'Workouts vs Social spend', icon: '🔀',
    sql: `SELECT week,\n  SUM(CASE WHEN type LIKE 'fitness.%' THEN 1 ELSE 0 END) AS workouts,\n  ROUND(SUM(CASE WHEN category IN ('Dining Out','Coffee') THEN ABS(amount) ELSE 0 END),2) AS social_spend\nFROM lens_events\nGROUP BY week ORDER BY week DESC LIMIT 6;`,
    columns: ['week', 'workouts', 'social_spend'], chartType: 'dual', chartColor: '#4ade80', chartColor2: '#f472b6',
  },
  {
    id: 'streaks', label: 'Streak history', icon: '🔥',
    sql: `SELECT name, streak, best_streak, tier, credits\nFROM goals WHERE streak > 0\nUNION ALL\nSELECT name, streak, streak, 'routine', 0\nFROM routines WHERE streak > 0\nORDER BY streak DESC;`,
    columns: ['name', 'current_streak', 'best_streak', 'tier', 'credits'], chartType: 'bar', chartKey: 'current_streak', chartColor: '#fbbf24', chartLabel: 'Streak',
  },
]

// ─── SVG charts ───────────────────────────────────────────────────────────────
function BarChart({ rows, xKey, yKey, color }) {
  if (!rows?.length) return null
  const W = 500, H = 120, P = { t: 10, r: 10, b: 30, l: 40 }
  const vals = rows.map(r => r[yKey])
  const max = Math.max(...vals, 1)
  const bW = (W - P.l - P.r) / rows.length - 4
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      {[0, .25, .5, .75, 1].map(f => {
        const yp = P.t + (1 - f) * (H - P.t - P.b)
        return <g key={f}>
          <line x1={P.l} y1={yp} x2={W - P.r} y2={yp} stroke="var(--border)" strokeWidth=".5" />
          <text x={P.l - 4} y={yp + 3} textAnchor="end" fontSize="8" fill="var(--text-3)">{Math.round(max * f)}</text>
        </g>
      })}
      {rows.map((r, i) => {
        const bH = (r[yKey] / max) * (H - P.t - P.b)
        const bX = P.l + i * ((W - P.l - P.r) / rows.length) + 2
        return <g key={i}>
          <rect x={bX} y={H - P.b - bH} width={bW} height={bH} rx="2" fill={color} opacity=".8" />
          <text x={bX + bW / 2} y={H - P.b + 12} textAnchor="middle" fontSize="8" fill="var(--text-3)">
            {String(r[xKey]).length > 7 ? String(r[xKey]).slice(-5) : r[xKey]}
          </text>
        </g>
      })}
    </svg>
  )
}

function LineChart({ rows, xKey, yKey, color }) {
  if (!rows?.length) return null
  const W = 500, H = 120, P = { t: 10, r: 10, b: 30, l: 30 }
  const vals = rows.map(r => r[yKey])
  const max = Math.max(...vals, 1), min = 1
  const pts = rows.map((r, i) => ({
    x: P.l + (i / Math.max(rows.length - 1, 1)) * (W - P.l - P.r),
    y: P.t + (1 - (r[yKey] - min) / (max - min)) * (H - P.t - P.b),
    label: r[xKey],
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length-1].x},${H-P.b} L${pts[0].x},${H-P.b} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      <path d={area} fill={`${color}22`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} stroke="var(--bg)" strokeWidth="1.5" />
          {i % 3 === 0 && <text x={p.x} y={H - P.b + 12} textAnchor="middle" fontSize="8" fill="var(--text-3)">{p.label}</text>}
        </g>
      ))}
    </svg>
  )
}

// ─── Transaction form ─────────────────────────────────────────────────────────
const TX_CATEGORIES = ['Groceries', 'Dining Out', 'Coffee', 'Shopping', 'Health & Fitness', 'Transport', 'Subscriptions', 'Books', 'Entertainment', 'Income', 'Other']

function TxForm({ onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [f, setF] = useState({ date: today, merchant: '', amount: '', category: 'Groceries', isIncome: false })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  function handleSave() {
    if (!f.merchant.trim() || !f.amount) return
    const amt = parseFloat(f.amount)
    onSave({ date: f.date, merchant: f.merchant, amount: f.isIncome ? Math.abs(amt) : -Math.abs(amt), category: f.isIncome ? 'Income' : f.category })
  }
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Log transaction</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 2, minWidth: 120 }} placeholder="Merchant / description"
          value={f.merchant} onChange={e => set('merchant', e.target.value)} />
        <input type="number" className="input" style={{ flex: 1, minWidth: 80 }} placeholder="Amount"
          value={f.amount} onChange={e => set('amount', e.target.value)} />
        <input type="date" className="input" style={{ flex: 1, minWidth: 110 }} value={f.date} onChange={e => set('date', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select className="input" style={{ flex: 1 }} value={f.category} onChange={e => set('category', e.target.value)} disabled={f.isIncome}>
          {TX_CATEGORIES.filter(c => c !== 'Income').map(c => <option key={c}>{c}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={f.isIncome} onChange={e => set('isIncome', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          Income
        </label>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!f.merchant.trim() || !f.amount}>Add</button>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
    </div>
  )
}

// ─── Main LENS ────────────────────────────────────────────────────────────────
export default function Lens() {
  const nav = useNavigate()
  const { data, sessionLensEvents, addTransaction } = useStore()
  const [activeQuery, setActiveQuery] = useState(QUERIES[0])
  const [nlQuery, setNlQuery] = useState('')
  const [nlResult, setNlResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [tab, setTab] = useState('results')
  const [showTxForm, setShowTxForm] = useState(false)

  const rows = useMemo(() => computeRows(activeQuery.id, data), [activeQuery.id, data])
  const cols = activeQuery.columns

  function runQuery() {
    setRunning(true)
    setTimeout(() => { setRunning(false); setTab('results') }, 400)
  }

  async function handleNL() {
    if (!nlQuery.trim()) return
    setRunning(true)
    try {
      const answer = await askBrain(
        `Translate this question into a SQLite query for the nTogether schema (tables: lens_events, journal_entries, transactions, goals, routines). Return ONLY the SQL, no explanation: "${nlQuery}"`,
        data,
      )
      const sql = answer.trim().replace(/^```sql?\n?|```$/gi, '')
      setNlResult({ sql, rows: rows.length })
    } catch {
      setNlResult({ sql: '-- Could not generate query. Check VITE_ANTHROPIC_API_KEY.', rows: 0 })
    }
    setRunning(false)
  }

  function handleExport() {
    const payload = {
      exported: new Date().toISOString(),
      goals: data.goals, routines: data.routines,
      events: data.events, journalEntries: data.journalEntries,
      transactions: data.transactions, lensEvents: data.lensEvents,
      achievements: data.achievements,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ntogether-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  function handleAddTx(tx) {
    addTransaction(tx)
    setShowTxForm(false)
  }

  // build obj rows for charts
  const chartRows = rows.map(r => {
    const obj = {}
    cols.forEach((c, i) => { obj[c] = r[i] })
    return obj
  })

  const lensEventsBySource = data.lensEvents.reduce((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1
    return acc
  }, {})

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🔭</span>
        <div className="topbar-title">LENS</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {data.lensEvents.length} events · {data.journalEntries.length} journal entries · {data.transactions.length} transactions
        </span>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTxForm(t => !t)}>+ Transaction</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>⬇ Export JSON</button>
          <span className="badge badge-surface">SQLite local</span>
        </div>
      </div>

      <div className="workflow-banner">
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>Workflow:</span>
        <span className="wf-step done" onClick={() => nav('/life/planner')} style={{ cursor: 'pointer' }}>🎯 Goal</span>
        <span className="wf-arrow">→</span>
        <span className="wf-step done" onClick={() => nav('/life/scheduler')} style={{ cursor: 'pointer' }}>📅 Schedule</span>
        <span className="wf-arrow">→</span>
        <span className="wf-step done" onClick={() => nav('/life/journal')} style={{ cursor: 'pointer' }}>📓 Journal</span>
        <span className="wf-arrow">→</span>
        <span className="wf-step active">🔭 LENS</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>
          All your data is queryable here ·{' '}
          {sessionLensEvents.length > 0 && <span style={{ color: 'var(--green)' }}>+{sessionLensEvents.length} new from this session</span>}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">Pre-built queries</div>
          <div className="sidebar-nav">
            {QUERIES.map(q => (
              <div key={q.id} className={`sidebar-item ${activeQuery.id === q.id ? 'active' : ''}`}
                onClick={() => { setActiveQuery(q); setTab('results') }}>
                <span>{q.icon}</span><span>{q.label}</span>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: '8px 12px' }} />
          <div className="sidebar-header">Data sources</div>
          <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { src: 'scheduler', icon: '📅', count: lensEventsBySource['scheduler'] || 0 },
              { src: 'journal', icon: '📓', count: lensEventsBySource['journal'] || 0 },
              { src: 'financial', icon: '💳', count: lensEventsBySource['financial'] || 0 },
              { src: 'achievements', icon: '🏆', count: lensEventsBySource['achievements'] || 0 },
            ].map(s => (
              <div key={s.src} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', padding: '3px 0' }}>
                {s.icon} <span style={{ flex: 1 }}>{s.src}</span>
                <span className="badge badge-surface">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="scroll" style={{ flex: 1 }}>
          <div style={{ padding: '20px 24px' }}>
            {/* Transaction form */}
            {showTxForm && <TxForm onSave={handleAddTx} onClose={() => setShowTxForm(false)} />}

            {/* NL bar */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)', marginBottom: 8 }}>
                🤖 Ask in plain English (AI → SQL)
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" style={{ flex: 1 }}
                  placeholder="e.g. How many workouts last month? What was my mood on gym days?"
                  value={nlQuery} onChange={e => setNlQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNL()} />
                <button className="btn btn-primary btn-sm" onClick={handleNL} disabled={running}>
                  {running ? '…' : '→ Generate SQL'}
                </button>
              </div>
              {nlResult && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 6 }}>✓ Generated query ({nlResult.rows} rows from your data)</div>
                  <pre style={{ background: '#0f172a', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#7dd3fc', overflowX: 'auto', margin: 0 }}>{nlResult.sql}</pre>
                </div>
              )}
            </div>

            {/* SQL editor */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 15 }}>{activeQuery.icon}</span>
                <span style={{ fontWeight: 600 }}>{activeQuery.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{rows.length} rows · live</span>
              </div>
              <pre className="sql-editor" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {activeQuery.sql.split('\n').map((line, i) => {
                  const kw = /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|JOIN|AND|OR|AS|IN|LIKE|SUM|COUNT|AVG|ROUND|CASE|WHEN|THEN|ELSE|END|UNION ALL|strftime|json_extract|date)\b/g
                  const colored = line
                    .replace(kw, m => `<span class="sql-keyword">${m}</span>`)
                    .replace(/'([^']*)'/g, `<span class="sql-string">'$1'</span>`)
                    .replace(/^(\s*--.*)/g, `<span class="sql-comment">$1</span>`)
                  return <span key={i} dangerouslySetInnerHTML={{ __html: colored + '\n' }} />
                })}
              </pre>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={runQuery} disabled={running}>
                  {running ? '⏳ Running…' : '▶ Run query'}
                </button>
                <button className={`btn btn-ghost btn-sm ${tab === 'results' ? 'active' : ''}`} onClick={() => setTab('results')}>Table</button>
                <button className={`btn btn-ghost btn-sm ${tab === 'chart' ? 'active' : ''}`} onClick={() => setTab('chart')}>Chart</button>
              </div>
            </div>

            {/* Results table */}
            {tab === 'results' && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24 }}>
                {rows.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    No data yet — add goals, complete events, or log transactions to see results here.
                  </div>
                ) : (
                  <table className="result-table">
                    <thead>
                      <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j}>
                              {cols[j] === 'total' || cols[j] === 'social_spend' ? `$${cell}` : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Chart */}
            {tab === 'chart' && rows.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{activeQuery.label}</div>
                {activeQuery.chartType === 'bar' && (
                  <BarChart rows={chartRows} xKey={cols[0]} yKey={activeQuery.chartKey} color={activeQuery.chartColor} />
                )}
                {activeQuery.chartType === 'line' && (
                  <LineChart rows={chartRows} xKey={cols[0]} yKey={activeQuery.chartKey} color={activeQuery.chartColor} />
                )}
                {activeQuery.chartType === 'dual' && (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 4, fontWeight: 600 }}>Workouts / week</div>
                      <BarChart rows={chartRows} xKey="week" yKey="workouts" color="#4ade80" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#f472b6', marginBottom: 4, fontWeight: 600 }}>Social spend / week ($)</div>
                      <BarChart rows={chartRows} xKey="week" yKey="social_spend" color="#f472b6" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
