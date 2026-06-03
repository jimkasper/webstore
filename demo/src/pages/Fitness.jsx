import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'

const TABS = ['Overview', 'Workouts', 'Running', 'PRs']

function WeeklyTrendChart({ lensEvents }) {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() - i * 7)
    const start = d.toISOString().slice(0, 10)
    const end = new Date(d.getTime() + 6 * 86400000).toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const workouts = lensEvents.filter(e =>
      e.type === 'fitness.workout' && e.recordedAt >= start && e.recordedAt <= end + 'T23:59'
    ).length
    const runs = lensEvents.filter(e =>
      e.type === 'fitness.run' && e.recordedAt >= start && e.recordedAt <= end + 'T23:59'
    ).length
    weeks.push({ label, workouts, runs, total: workouts + runs })
  }
  const max = Math.max(...weeks.map(w => w.total), 1)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 60 }}>
              {w.runs > 0 && (
                <div title={`${w.runs} run${w.runs !== 1 ? 's' : ''}`} style={{
                  width: '100%', height: `${(w.runs / max) * 56}px`, minHeight: 3,
                  background: i === weeks.length - 1 ? '#34d399' : '#34d39940',
                  borderRadius: w.workouts > 0 ? '0' : '3px 3px 0 0',
                  transition: 'height .4s',
                }} />
              )}
              {w.workouts > 0 && (
                <div title={`${w.workouts} workout${w.workouts !== 1 ? 's' : ''}`} style={{
                  width: '100%', height: `${(w.workouts / max) * 56}px`, minHeight: 3,
                  background: i === weeks.length - 1 ? 'var(--accent)' : 'var(--accent-dim, #a78bfa40)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height .4s',
                }} />
              )}
              {w.total === 0 && (
                <div style={{ width: '100%', height: 3, background: 'var(--border)', borderRadius: 3 }} />
              )}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{w.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} /> Workouts</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#34d399', borderRadius: 2, display: 'inline-block' }} /> Runs</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', minWidth: 130 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function InlineForm({ fields, onSubmit, onCancel, submitLabel = 'Log' }) {
  const init = Object.fromEntries(fields.map(f => [f.key, f.default ?? '']))
  const [vals, setVals] = useState(init)
  function set(k, v) { setVals(p => ({ ...p, [k]: v })) }

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSubmit(vals); }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: '12px 0', borderTop: '1px solid var(--border)' }}
    >
      {fields.map(f => (
        <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
          {f.label}
          {f.type === 'select' ? (
            <select value={vals[f.key]} onChange={e => set(f.key, e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 6px', color: 'var(--text-1)', fontSize: 13 }}>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={f.type ?? 'text'}
              value={vals[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder ?? ''}
              required={f.required}
              min={f.min}
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

export default function Fitness() {
  const { data, addLensEvent, deleteLensEvent, updateLensEvent, addPersonalBest, deletePersonalBest, shareToSpace } = useStore()
  const [tab, setTab] = useState('Overview')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editVals, setEditVals] = useState({})
  const [lastLoggedId, setLastLoggedId] = useState(null)

  const workouts = useMemo(() =>
    [...data.lensEvents].filter(e => e.type === 'fitness.workout').sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [data.lensEvents])

  const runs = useMemo(() =>
    [...data.lensEvents].filter(e => e.type === 'fitness.run').sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [data.lensEvents])

  const totalDistance = useMemo(() => runs.reduce((s, r) => s + (r.payload.distance ?? 0), 0), [runs])
  const avgDuration = useMemo(() => workouts.length ? Math.round(workouts.reduce((s, w) => s + (w.payload.durationMins ?? 0), 0) / workouts.length) : 0, [workouts])
  const totalCalories = useMemo(() => workouts.reduce((s, w) => s + (w.payload.calories ?? 0), 0), [workouts])
  const gymStreak = data.routines.find(r => r.id === 'r1')?.streak ?? 0
  const bestRunDist = useMemo(() => runs.reduce((m, r) => Math.max(m, r.payload.distance ?? 0), 0), [runs])

  function handleLogWorkout(vals) {
    const id = addLensEvent({
      source: 'fitness',
      type: 'fitness.workout',
      payload: { activity: vals.activity || 'Gym', durationMins: Number(vals.durationMins), calories: Number(vals.calories) },
    })
    setLastLoggedId(id)
    setShowForm(false)
  }

  function handleLogRun(vals) {
    const dist = parseFloat(vals.distance)
    const mins = parseInt(vals.durationMins)
    const pace = dist > 0 && mins > 0 ? `${Math.floor(mins / dist)}:${String(Math.round((mins / dist % 1) * 60)).padStart(2, '0')}/km` : '—'
    const id = addLensEvent({
      source: 'fitness',
      type: 'fitness.run',
      payload: { activity: 'Running', distance: dist, durationMins: mins, pace },
    })
    setLastLoggedId(id)
    setShowForm(false)
  }

  function handleAddPR(vals) {
    addPersonalBest({ lift: vals.lift, value: parseFloat(vals.value), unit: vals.unit, reps: vals.reps ? parseInt(vals.reps) : null, date: vals.date })
    setShowForm(false)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>💪</span>
        <div className="topbar-title">Fitness</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Workouts, runs &amp; personal records</span>
        <div className="topbar-right">
          {(tab === 'Workouts' || tab === 'Running' || tab === 'PRs') && !showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              {tab === 'PRs' ? '+ Add PR' : tab === 'Running' ? '+ Log Run' : '+ Log Workout'}
            </button>
          )}
        </div>
      </div>

      <div className="scroll">
        <div className="pad">

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
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
            <StatCard label="Total Workouts" value={workouts.length} />
            <StatCard label="Total Runs" value={runs.length} />
            <StatCard label="Total Distance" value={`${totalDistance.toFixed(1)} km`} sub="all runs" />
            <StatCard label="Avg Workout" value={`${avgDuration} min`} sub="per session" />
            <StatCard label="Calories Burned" value={totalCalories.toLocaleString()} sub="from workouts" />
            <StatCard label="Gym Streak" value={`${gymStreak} wks`} sub="consecutive weeks" />
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Activity — last 8 weeks</div>
            <WeeklyTrendChart lensEvents={data.lensEvents} />
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>5K Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Best run: {bestRunDist.toFixed(1)} km / 5.0 km goal</div>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (bestRunDist / 5) * 100).toFixed(1)}%`, height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{Math.min(100, (bestRunDist / 5) * 100).toFixed(0)}% of goal</div>
          </div>
        </div>
      )}

      {/* Workouts */}
      {tab === 'Workouts' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{workouts.length} sessions logged</div>
          {showForm && (
            <InlineForm
              fields={[
                { key: 'activity', label: 'Activity', placeholder: 'Gym', required: true, width: 130 },
                { key: 'durationMins', label: 'Duration (min)', type: 'number', min: 1, required: true, width: 90 },
                { key: 'calories', label: 'Calories', type: 'number', min: 0, width: 90 },
              ]}
              onSubmit={handleLogWorkout}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 90px 64px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>ACTIVITY</span><span>DURATION</span><span>CALORIES</span><span />
            </div>
            {workouts.map(w => editId === w.id ? (
              <div key={w.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, alignItems: 'center' }}>
                <input placeholder="Activity" value={editVals.activity ?? ''} onChange={e => setEditVals(p => ({ ...p, activity: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 12, width: 120, color: 'var(--text-1)' }} />
                <input type="number" placeholder="min" value={editVals.durationMins ?? ''} onChange={e => setEditVals(p => ({ ...p, durationMins: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 12, width: 70, color: 'var(--text-1)' }} />
                <input type="number" placeholder="kcal" value={editVals.calories ?? ''} onChange={e => setEditVals(p => ({ ...p, calories: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 12, width: 70, color: 'var(--text-1)' }} />
                <button onClick={() => { updateLensEvent(w.id, { payload: { ...w.payload, activity: editVals.activity, durationMins: Number(editVals.durationMins), calories: Number(editVals.calories) } }); setEditId(null) }}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditId(null)}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 90px 1fr', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-3)' }}>{w.recordedAt.slice(0, 10)}</span>
                <span style={{ fontWeight: 500 }}>{w.payload.activity ?? 'Gym'}</span>
                <span>{w.payload.durationMins ?? '—'} min</span>
                <span style={{ color: 'var(--text-2)' }}>{w.payload.calories ? `${w.payload.calories} kcal` : '—'}</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {w.id === lastLoggedId && (
                    <button onClick={() => { shareToSpace(`Just logged a ${w.payload.activity ?? 'Gym'} workout for ${w.payload.durationMins ?? 0} min 💪`, { source: 'fitness', sourceType: 'workout' }); setLastLoggedId(null) }}
                      style={{ fontSize: 11, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Share to SPACE
                    </button>
                  )}
                  <button onClick={() => { setEditId(w.id); setEditVals({ activity: w.payload.activity ?? 'Gym', durationMins: w.payload.durationMins ?? '', calories: w.payload.calories ?? '' }) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0 }} title="Edit">✎</button>
                  <button onClick={() => deleteLensEvent(w.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }} title="Delete">✕</button>
                </div>
              </div>
            ))}
            {workouts.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '16px 12px' }}>No workouts logged yet.</div>}
          </div>
        </div>
      )}

      {/* Running */}
      {tab === 'Running' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>5K Progress — best: {bestRunDist.toFixed(1)} km</div>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (bestRunDist / 5) * 100).toFixed(1)}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{runs.length} runs logged · {totalDistance.toFixed(1)} km total</div>
          {showForm && (
            <InlineForm
              fields={[
                { key: 'distance', label: 'Distance (km)', type: 'number', min: 0.1, step: 0.01, required: true, width: 100 },
                { key: 'durationMins', label: 'Duration (min)', type: 'number', min: 1, required: true, width: 90 },
              ]}
              onSubmit={handleLogRun}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 90px 90px 100px 64px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>DISTANCE</span><span>DURATION</span><span>PACE</span><span />
            </div>
            {runs.map(r => editId === r.id ? (
              <div key={r.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, alignItems: 'center' }}>
                <input type="number" placeholder="km" value={editVals.distance ?? ''} onChange={e => setEditVals(p => ({ ...p, distance: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 12, width: 70, color: 'var(--text-1)' }} />
                <input type="number" placeholder="min" value={editVals.durationMins ?? ''} onChange={e => setEditVals(p => ({ ...p, durationMins: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 12, width: 70, color: 'var(--text-1)' }} />
                <button onClick={() => {
                  const dist = parseFloat(editVals.distance)
                  const mins = parseInt(editVals.durationMins)
                  const pace = dist > 0 && mins > 0 ? `${Math.floor(mins / dist)}:${String(Math.round((mins / dist % 1) * 60)).padStart(2, '0')}/km` : r.payload.pace
                  updateLensEvent(r.id, { payload: { ...r.payload, distance: dist, durationMins: mins, pace } })
                  setEditId(null)
                }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditId(null)}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '110px 90px 90px 100px 1fr', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-3)' }}>{r.recordedAt.slice(0, 10)}</span>
                <span style={{ fontWeight: 500 }}>{r.payload.distance?.toFixed(1) ?? '—'} km</span>
                <span>{r.payload.durationMins ?? '—'} min</span>
                <span style={{ color: 'var(--text-2)' }}>{r.payload.pace ?? '—'}</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {r.id === lastLoggedId && (
                    <button onClick={() => { shareToSpace(`Just ran ${r.payload.distance?.toFixed(1) ?? '?'} km in ${r.payload.durationMins ?? '?'} min 🏃`, { source: 'fitness', sourceType: 'run' }); setLastLoggedId(null) }}
                      style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '2px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Share to SPACE</button>
                  )}
                  <button onClick={() => { setEditId(r.id); setEditVals({ distance: r.payload.distance ?? '', durationMins: r.payload.durationMins ?? '' }) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0 }} title="Edit">✎</button>
                  <button onClick={() => deleteLensEvent(r.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }} title="Delete">✕</button>
                </div>
              </div>
            ))}
            {runs.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '16px 12px' }}>No runs logged yet.</div>}
          </div>
        </div>
      )}

      {/* PRs */}
      {tab === 'PRs' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{data.personalBests.length} personal records</div>
          {showForm && (
            <InlineForm
              fields={[
                { key: 'lift', label: 'Lift / Activity', placeholder: 'Bench Press', required: true, width: 140 },
                { key: 'value', label: 'Value', type: 'number', min: 0, step: 0.1, required: true, width: 80 },
                { key: 'unit', label: 'Unit', type: 'select', options: ['lbs', 'kg', 'min', 'km'], default: 'lbs' },
                { key: 'reps', label: 'Reps', type: 'number', min: 1, width: 60, placeholder: '—' },
                { key: 'date', label: 'Date', type: 'date', default: today, required: true },
              ]}
              onSubmit={handleAddPR}
              onCancel={() => setShowForm(false)}
              submitLabel="Add"
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px 110px 32px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>LIFT</span><span>RESULT</span><span>REPS</span><span>DATE</span><span />
            </div>
            {[...data.personalBests].sort((a, b) => b.date.localeCompare(a.date)).map(pb => (
              <div key={pb.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px 110px 32px', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{pb.lift}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pb.value} {pb.unit}</span>
                <span style={{ color: 'var(--text-2)' }}>{pb.reps ? `×${pb.reps}` : '—'}</span>
                <span style={{ color: 'var(--text-3)' }}>{pb.date}</span>
                <button onClick={() => deletePersonalBest(pb.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}
            {data.personalBests.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '16px 12px' }}>No personal records yet.</div>}
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  )
}
