import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'

const TABS = ['Today', 'Log', 'Trends']
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const CALORIE_GOAL = 2200
const PROTEIN_GOAL = 160
const CARBS_GOAL = 240
const FAT_GOAL = 70

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min(100, (value / goal) * 100)
  return (
    <div style={{ flex: 1, minWidth: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--text-3)' }}>{value}g / {goal}g</span>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: color ?? 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function Diet() {
  const { data, addMealLog, deleteMealLog, updateMealLog } = useStore()
  const [tab, setTab] = useState('Today')
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [form, setForm] = useState({ meal: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [editId, setEditId] = useState(null)
  const [editVals, setEditVals] = useState({})

  const todayLogs = useMemo(() =>
    data.mealLogs.filter(m => m.date === selectedDate).sort((a, b) => MEALS.indexOf(a.meal) - MEALS.indexOf(b.meal)),
    [data.mealLogs, selectedDate])

  const todayTotals = useMemo(() => todayLogs.reduce((acc, m) => ({
    calories: acc.calories + (m.calories ?? 0),
    protein: acc.protein + (m.protein ?? 0),
    carbs: acc.carbs + (m.carbs ?? 0),
    fat: acc.fat + (m.fat ?? 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [todayLogs])

  const allLogs = useMemo(() =>
    [...data.mealLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [data.mealLogs])

  const dailySummaries = useMemo(() => {
    const map = {}
    data.mealLogs.forEach(m => {
      if (!map[m.date]) map[m.date] = { date: m.date, calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
      map[m.date].calories += m.calories ?? 0
      map[m.date].protein += m.protein ?? 0
      map[m.date].carbs += m.carbs ?? 0
      map[m.date].fat += m.fat ?? 0
      map[m.date].meals += 1
    })
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
  }, [data.mealLogs])

  const avgCalories = useMemo(() => dailySummaries.length
    ? Math.round(dailySummaries.reduce((s, d) => s + d.calories, 0) / dailySummaries.length)
    : 0, [dailySummaries])

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name) return
    addMealLog({
      date: selectedDate,
      meal: form.meal,
      name: form.name,
      calories: form.calories ? parseInt(form.calories) : null,
      protein: form.protein ? parseInt(form.protein) : null,
      carbs: form.carbs ? parseInt(form.carbs) : null,
      fat: form.fat ? parseInt(form.fat) : null,
    })
    setForm(f => ({ ...f, name: '', calories: '', protein: '', carbs: '', fat: '' }))
    setShowForm(false)
  }

  const calPct = Math.min(100, (todayTotals.calories / CALORIE_GOAL) * 100)

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🥗</span>
        <div className="topbar-title">Diet</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Meals, macros & calorie tracking</span>
      </div>
      <div className="scroll"><div className="pad">

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false) }}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', padding: '6px 14px', marginBottom: -1, color: tab === t ? 'var(--accent)' : 'var(--text-2)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Today */}
      {tab === 'Today' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', color: 'var(--text-1)', fontSize: 13 }} />
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>+ Log Meal</button>
            )}
          </div>

          {/* Calorie ring summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: calPct > 105 ? '#e05c5c' : 'var(--accent)' }}>{todayTotals.calories} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-2)' }}>/ {CALORIE_GOAL} kcal</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{Math.max(0, CALORIE_GOAL - todayTotals.calories)} remaining</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{todayLogs.length} entries</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 10, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${calPct}%`, height: '100%', background: calPct > 105 ? '#e05c5c' : 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <MacroBar label="Protein" value={todayTotals.protein} goal={PROTEIN_GOAL} color="#7c6af7" />
              <MacroBar label="Carbs" value={todayTotals.carbs} goal={CARBS_GOAL} color="#e0a040" />
              <MacroBar label="Fat" value={todayTotals.fat} goal={FAT_GOAL} color="#e05c5c" />
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                Meal
                <select value={form.meal} onChange={e => setForm(p => ({ ...p, meal: e.target.value }))}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 13 }}>
                  {MEALS.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                Food / Description
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Oatmeal + banana"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 13, width: 200 }} />
              </label>
              {[
                { key: 'calories', label: 'Calories', placeholder: 'kcal' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                  {f.label}
                  <input type="number" min={0} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder ?? '0'}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 13, width: 72 }} />
                </label>
              ))}
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end' }}>Add</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', alignSelf: 'flex-end' }}>Cancel</button>
            </form>
          )}

          {MEALS.map(meal => {
            const entries = todayLogs.filter(m => m.meal === meal)
            if (entries.length === 0 && !showForm) return null
            return (
              <div key={meal} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{meal}</div>
                {entries.length === 0
                  ? <div style={{ fontSize: 12, color: 'var(--text-3)', paddingLeft: 8 }}>Nothing logged</div>
                  : entries.map(m => (
                    editId === m.id ? (
                      <form key={m.id} onSubmit={e => { e.preventDefault(); updateMealLog(m.id, { name: editVals.name, calories: editVals.calories ? parseInt(editVals.calories) : null, protein: editVals.protein ? parseFloat(editVals.protein) : null, carbs: editVals.carbs ? parseFloat(editVals.carbs) : null, fat: editVals.fat ? parseFloat(editVals.fat) : null }); setEditId(null) }}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 10px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, alignItems: 'center' }}>
                        <input value={editVals.name} onChange={e => setEditVals(p => ({ ...p, name: e.target.value }))} required placeholder="Food" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-1)', fontSize: 12, width: 160 }} />
                        {['calories','protein','carbs','fat'].map(k => (
                          <input key={k} type="number" min={0} value={editVals[k] ?? ''} onChange={e => setEditVals(p => ({ ...p, [k]: e.target.value }))}
                            placeholder={k.slice(0, 3)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-1)', fontSize: 12, width: 60 }} />
                        ))}
                        <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>✕</button>
                      </form>
                    ) : (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{m.name}</span>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{m.calories ?? '—'} kcal</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>P{m.protein ?? '—'} C{m.carbs ?? '—'} F{m.fat ?? '—'}</span>
                          <button onClick={() => { setEditId(m.id); setEditVals({ name: m.name, calories: m.calories ?? '', protein: m.protein ?? '', carbs: m.carbs ?? '', fat: m.fat ?? '' }) }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✎</button>
                          <button onClick={() => deleteMealLog(m.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>✕</button>
                        </div>
                      </div>
                    )
                  ))
                }
              </div>
            )
          })}
          {todayLogs.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>No meals logged for {selectedDate}. Click "+ Log Meal" to start.</div>
          )}
        </div>
      )}

      {/* Log */}
      {tab === 'Log' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{allLogs.length} total entries across {dailySummaries.length} days</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 1fr 80px 60px 60px 60px 64px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>MEAL</span><span>FOOD</span><span>CAL</span><span>PRO</span><span>CARB</span><span>FAT</span><span></span>
            </div>
            {allLogs.map(m => (
              editId === m.id ? (
                <form key={m.id} onSubmit={e => { e.preventDefault(); updateMealLog(m.id, { name: editVals.name, calories: editVals.calories ? parseInt(editVals.calories) : null, protein: editVals.protein ? parseFloat(editVals.protein) : null, carbs: editVals.carbs ? parseFloat(editVals.carbs) : null, fat: editVals.fat ? parseFloat(editVals.fat) : null }); setEditId(null) }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 12px', background: 'var(--surface)', borderRadius: 4, alignItems: 'center' }}>
                  <input value={editVals.name} onChange={e => setEditVals(p => ({ ...p, name: e.target.value }))} required placeholder="Food" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-1)', fontSize: 12, width: 160 }} />
                  {['calories','protein','carbs','fat'].map(k => (
                    <input key={k} type="number" min={0} value={editVals[k] ?? ''} onChange={e => setEditVals(p => ({ ...p, [k]: e.target.value }))}
                      placeholder={k.slice(0, 3)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-1)', fontSize: 12, width: 60 }} />
                  ))}
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>✕</button>
                </form>
              ) : (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '100px 90px 1fr 80px 60px 60px 60px 64px', gap: 8, padding: '7px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-3)' }}>{m.date}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.meal}</span>
                  <span style={{ fontWeight: 500 }}>{m.name}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{m.calories ?? '—'}</span>
                  <span style={{ color: 'var(--text-2)' }}>{m.protein ?? '—'}g</span>
                  <span style={{ color: 'var(--text-2)' }}>{m.carbs ?? '—'}g</span>
                  <span style={{ color: 'var(--text-2)' }}>{m.fat ?? '—'}g</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditId(m.id); setEditVals({ name: m.name, calories: m.calories ?? '', protein: m.protein ?? '', carbs: m.carbs ?? '', fat: m.fat ?? '' }) }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✎</button>
                    <button onClick={() => deleteMealLog(m.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {tab === 'Trends' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <StatCard label="Avg Daily Calories" value={`${avgCalories} kcal`} sub={`goal: ${CALORIE_GOAL}`} />
            <StatCard label="Days Logged" value={dailySummaries.length} sub="with at least 1 meal" />
            <StatCard label="Total Meals" value={allLogs.length} sub="all time" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 70px 70px 70px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>CALORIES</span><span>PROTEIN</span><span>CARBS</span><span>FAT</span>
            </div>
            {dailySummaries.map(d => {
              const pct = Math.min(100, (d.calories / CALORIE_GOAL) * 100)
              return (
                <div key={d.date} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 70px 70px 70px', gap: 8, fontSize: 13, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{d.date}</span>
                    <span style={{ fontWeight: 700, color: pct > 105 ? '#e05c5c' : 'var(--accent)' }}>{d.calories}</span>
                    <span>{d.protein}g</span>
                    <span>{d.carbs}g</span>
                    <span>{d.fat}g</span>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 3, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct > 105 ? '#e05c5c' : pct > 90 ? '#e0a040' : 'var(--accent)', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div></div>
    </div>
  )
}
