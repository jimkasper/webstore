import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const TABS = ['Overview', 'Mood', 'Sleep', 'Metrics']

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Stars({ n, max = 5 }) {
  return (
    <span style={{ color: 'var(--accent)', fontSize: 13 }}>
      {'★'.repeat(n)}{'☆'.repeat(max - n)}
    </span>
  )
}

function InlineForm({ fields, onSubmit, onCancel, submitLabel = 'Log' }) {
  const init = Object.fromEntries(fields.map(f => [f.key, f.default ?? '']))
  const [vals, setVals] = useState(init)
  function set(k, v) { setVals(p => ({ ...p, [k]: v })) }

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(vals) }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: '12px 0', borderTop: '1px solid var(--border)' }}
    >
      {fields.map(f => (
        <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
          {f.label}
          {f.type === 'select' ? (
            <select value={vals[f.key]} onChange={e => set(f.key, e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--text-1)', fontSize: 13 }}>
              {f.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
          ) : (
            <input
              type={f.type ?? 'text'}
              value={vals[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder ?? ''}
              required={f.required}
              min={f.min}
              max={f.max}
              step={f.step}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 13, width: f.width ?? 110 }}
            />
          )}
        </label>
      ))}
      <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end' }}>{submitLabel}</button>
      <button type="button" onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', alignSelf: 'flex-end' }}>Cancel</button>
    </form>
  )
}

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
}

export default function Health() {
  const { data, addHealthLog, deleteHealthLog, updateHealthLog } = useStore()
  const nav = useNavigate()
  const [tab, setTab] = useState('Overview')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editVals, setEditVals] = useState({})

  const today = new Date().toISOString().slice(0, 10)

  const logs = useMemo(() =>
    [...data.healthLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [data.healthLogs])

  const last7Logs = useMemo(() => logs.filter(h => h.date >= sevenDaysAgo()), [logs])
  const last7Entries = useMemo(() => {
    const cutoff = sevenDaysAgo()
    return data.journalEntries.filter(e => e.date >= cutoff)
  }, [data.journalEntries])

  const avgMood = useMemo(() => avg(last7Entries.map(e => e.dayRating).filter(Boolean)), [last7Entries])
  const avgSleep = useMemo(() => avg(last7Logs.map(h => h.sleepHours).filter(Boolean)), [last7Logs])
  const latestLog = logs[0]

  const healthSpend = useMemo(() => {
    const month = today.slice(0, 7)
    return data.transactions
      .filter(t => t.date.startsWith(month) && t.category === 'Health & Fitness' && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
  }, [data.transactions, today])

  function sevenDaysAgo() {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().slice(0, 10)
  }

  function handleLogSleep(vals) {
    addHealthLog({
      date: vals.date,
      sleepHours: parseFloat(vals.sleepHours),
      sleepQuality: parseInt(vals.sleepQuality),
      restingHR: vals.restingHR ? parseInt(vals.restingHR) : null,
      weightLbs: null,
    })
    setShowForm(false)
  }

  function handleLogMetrics(vals) {
    addHealthLog({
      date: vals.date,
      weightLbs: vals.weightLbs ? parseFloat(vals.weightLbs) : null,
      restingHR: vals.restingHR ? parseInt(vals.restingHR) : null,
      sleepHours: null,
      sleepQuality: null,
    })
    setShowForm(false)
  }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🏥</span>
        <div className="topbar-title">Health</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Mood, sleep & body metrics</span>
      </div>
      <div className="scroll"><div className="pad">

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false) }}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', padding: '6px 14px', marginBottom: -1, color: tab === t ? 'var(--accent)' : 'var(--text-2)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <StatCard label="Avg Mood (7d)" value={avgMood ? `${avgMood.toFixed(1)} / 5` : '—'} sub="from journal ratings" />
            <StatCard label="Avg Sleep (7d)" value={avgSleep ? `${avgSleep.toFixed(1)} hrs` : '—'} sub="per night" />
            <StatCard label="Current Weight" value={latestLog?.weightLbs ? `${latestLog.weightLbs} lbs` : '—'} sub={latestLog?.date ?? ''} />
            <StatCard label="Resting HR" value={latestLog?.restingHR ? `${latestLog.restingHR} bpm` : '—'} sub={latestLog?.date ?? ''} />
            <StatCard label="Health Spend" value={`$${healthSpend.toFixed(2)}`} sub="this month" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent Mood (7 days)</div>
              {last7Entries.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No journal entries this week</div>
              ) : (
                [...last7Entries].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>{e.date}</span>
                    <Stars n={e.dayRating ?? 0} />
                  </div>
                ))
              )}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent Sleep (7 days)</div>
              {last7Logs.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No sleep logs this week</div>
              ) : (
                last7Logs.map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>{h.date}</span>
                    <span>{h.sleepHours ? `${h.sleepHours}h` : '—'} <Stars n={h.sleepQuality ?? 0} /></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mood */}
      {tab === 'Mood' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{data.journalEntries.length} journal entries</div>
            <button onClick={() => nav('/life/journal')}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
              Log mood in Journal →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 80px 1fr', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>RATING</span><span>HIGHLIGHT</span>
            </div>
            {[...data.journalEntries].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '110px 80px 1fr', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-3)' }}>{e.date}</span>
                <Stars n={e.dayRating ?? 0} />
                <span style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.highlight ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sleep */}
      {tab === 'Sleep' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{logs.filter(h => h.sleepHours).length} sleep logs</div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>+ Log Sleep</button>
            )}
          </div>
          {showForm && (
            <InlineForm
              fields={[
                { key: 'date', label: 'Date', type: 'date', default: today, required: true },
                { key: 'sleepHours', label: 'Hours', type: 'number', min: 0, max: 24, step: 0.5, required: true, width: 70 },
                { key: 'sleepQuality', label: 'Quality', type: 'select', options: [1,2,3,4,5].map(n => ({ value: n, label: `${n} ★` })), default: 3 },
                { key: 'restingHR', label: 'Resting HR', type: 'number', min: 30, max: 120, width: 80, placeholder: 'bpm' },
              ]}
              onSubmit={handleLogSleep}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 80px 90px 90px 64px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>HOURS</span><span>QUALITY</span><span>RESTING HR</span><span></span>
            </div>
            {logs.filter(h => h.sleepHours).map(h => (
              editId === h.id ? (
                <form key={h.id} onSubmit={e => { e.preventDefault(); updateHealthLog(h.id, { date: editVals.date, sleepHours: parseFloat(editVals.sleepHours), sleepQuality: parseInt(editVals.sleepQuality), restingHR: editVals.restingHR ? parseInt(editVals.restingHR) : null }); setEditId(null) }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, alignItems: 'center' }}>
                  {[
                    { k: 'date', type: 'date', w: 110 },
                    { k: 'sleepHours', type: 'number', min: 0, max: 24, step: 0.5, w: 70, placeholder: 'hrs' },
                    { k: 'sleepQuality', type: 'number', min: 1, max: 5, w: 50, placeholder: '1-5' },
                    { k: 'restingHR', type: 'number', min: 30, max: 120, w: 70, placeholder: 'bpm' },
                  ].map(f => (
                    <input key={f.k} type={f.type} min={f.min} max={f.max} step={f.step} value={editVals[f.k] ?? ''} onChange={e => setEditVals(p => ({ ...p, [f.k]: e.target.value }))}
                      placeholder={f.placeholder} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--text-1)', fontSize: 12, width: f.w }} />
                  ))}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                </form>
              ) : (
                <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '110px 80px 90px 90px 64px', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-3)' }}>{h.date}</span>
                  <span style={{ fontWeight: 600 }}>{h.sleepHours}h</span>
                  <Stars n={h.sleepQuality ?? 0} />
                  <span style={{ color: 'var(--text-2)' }}>{h.restingHR ? `${h.restingHR} bpm` : '—'}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditId(h.id); setEditVals({ date: h.date, sleepHours: h.sleepHours, sleepQuality: h.sleepQuality ?? 3, restingHR: h.restingHR ?? '' }) }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✎</button>
                    <button onClick={() => deleteHealthLog(h.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {tab === 'Metrics' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{logs.filter(h => h.weightLbs || h.restingHR).length} metric logs</div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>+ Log Metrics</button>
            )}
          </div>
          {showForm && (
            <InlineForm
              fields={[
                { key: 'date', label: 'Date', type: 'date', default: today, required: true },
                { key: 'weightLbs', label: 'Weight (lbs)', type: 'number', min: 0, step: 0.1, width: 100, placeholder: '—' },
                { key: 'restingHR', label: 'Resting HR', type: 'number', min: 30, max: 120, width: 90, placeholder: 'bpm' },
              ]}
              onSubmit={handleLogMetrics}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 110px 64px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>WEIGHT</span><span>RESTING HR</span><span></span>
            </div>
            {logs.filter(h => h.weightLbs || h.restingHR).map(h => (
              editId === h.id ? (
                <form key={h.id} onSubmit={e => { e.preventDefault(); updateHealthLog(h.id, { date: editVals.date, weightLbs: editVals.weightLbs ? parseFloat(editVals.weightLbs) : null, restingHR: editVals.restingHR ? parseInt(editVals.restingHR) : null }); setEditId(null) }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, alignItems: 'center' }}>
                  {[
                    { k: 'date', type: 'date', w: 110 },
                    { k: 'weightLbs', type: 'number', min: 0, step: 0.1, w: 90, placeholder: 'lbs' },
                    { k: 'restingHR', type: 'number', min: 30, max: 120, w: 70, placeholder: 'bpm' },
                  ].map(f => (
                    <input key={f.k} type={f.type} min={f.min} max={f.max} step={f.step} value={editVals[f.k] ?? ''} onChange={e => setEditVals(p => ({ ...p, [f.k]: e.target.value }))}
                      placeholder={f.placeholder} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--text-1)', fontSize: 12, width: f.w }} />
                  ))}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                </form>
              ) : (
                <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '110px 110px 110px 64px', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-3)' }}>{h.date}</span>
                  <span style={{ fontWeight: 600 }}>{h.weightLbs ? `${h.weightLbs} lbs` : '—'}</span>
                  <span style={{ color: 'var(--text-2)' }}>{h.restingHR ? `${h.restingHR} bpm` : '—'}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditId(h.id); setEditVals({ date: h.date, weightLbs: h.weightLbs ?? '', restingHR: h.restingHR ?? '' }) }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✎</button>
                    <button onClick={() => deleteHealthLog(h.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      </div></div>
    </div>
  )
}
