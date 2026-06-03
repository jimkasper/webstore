import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import Modal from '../components/Modal.jsx'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am–10pm

const TYPE_COLOR = {
  work: '#60a5fa', exercise: '#4ade80', social: '#f472b6',
  learning: '#fbbf24', health: '#34d399', errand: '#a78bfa', fun: '#fb923c',
}
const EVENT_TYPES = ['work', 'exercise', 'social', 'learning', 'health', 'errand', 'fun']

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDates(offset = 0) {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function fmtHeader(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeToRow(iso) {
  const t = new Date(iso)
  return (t.getHours() - 6) * 2 + (t.getMinutes() >= 30 ? 1 : 0)
}

function eventHeight(start, end) {
  const s = new Date(start), e = new Date(end)
  return Math.max(1, Math.round((e - s) / 1800000))
}

function addMins(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

function EventForm({ initial, routines, onSave, onClose }) {
  const today = localDateStr(new Date())
  const [f, setF] = useState({ title: '', type: 'work', date: today, startTime: '09:00', durationMins: 60, routineId: '', ...initial })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  function handleSave() {
    if (!f.title.trim() || !f.date) return
    const endTime = addMins(f.startTime, f.durationMins)
    onSave({
      title: f.title, type: f.type, routineId: f.routineId || null,
      start: `${f.date}T${f.startTime}`,
      end: `${f.date}T${endTime}`,
    })
  }

  return (
    <div>
      <Field label="Title">
        <input className="input" placeholder="What are you doing?" value={f.title}
          onChange={e => set('title', e.target.value)} autoFocus />
      </Field>

      <Field label="Type">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(t => (
            <button key={t} className={`btn btn-sm ${f.type === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderLeft: `3px solid ${TYPE_COLOR[t]}` }}
              onClick={() => set('type', t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </Field>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Date">
            <input type="date" className="input" value={f.date} onChange={e => set('date', e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Start time">
            <input type="time" className="input" value={f.startTime} onChange={e => set('startTime', e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Duration (mins)">
            <input type="number" className="input" min={15} max={480} step={15}
              value={f.durationMins} onChange={e => set('durationMins', parseInt(e.target.value) || 30)} />
          </Field>
        </div>
      </div>

      <Field label="Link to routine (optional)">
        <select className="input" value={f.routineId} onChange={e => set('routineId', e.target.value)}>
          <option value="">-- None --</option>
          {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </Field>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!f.title.trim()}>
          {initial?.id ? 'Update event' : 'Add to calendar'}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default function Scheduler({ embedded = false, highlightRoutineId = null }) {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { data, addEvent, updateEvent, deleteEvent, completeEvent, updatePlanTask } = useStore()
  const { events, routines } = data

  const fromPlanner = params.get('from') === 'planner'
  const highlightRoutine = highlightRoutineId || params.get('routine')
  const focusEvent = params.get('event')

  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showReflect, setShowReflect] = useState(false)
  const [reflectForm, setReflectForm] = useState({ mood: 4, notes: '', thumbs: 'up' })
  const [checkedTasks, setCheckedTasks] = useState({})
  const [saved, setSaved] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventFormInit, setEventFormInit] = useState(null)

  const weekDates = getWeekDates(weekOffset)
  const weekDateStrs = weekDates.map(localDateStr)
  const todayStr = localDateStr(new Date())
  const todayIdx = weekDateStrs.indexOf(todayStr)

  useEffect(() => {
    if (focusEvent) {
      const ev = events.find(e => e.id === focusEvent)
      if (ev) setSelected(ev)
    }
  }, [focusEvent])

  function dayIdx(iso) {
    const dateStr = iso.slice(0, 10)
    return weekDateStrs.indexOf(dateStr)
  }

  function handleComplete() {
    if (!selected) return
    const durationMins = eventHeight(selected.start, selected.end) * 30
    completeEvent(selected.id, {
      title: selected.title,
      activityType: selected.type === 'exercise' ? 'fitness.workout' : 'life.event',
      durationMins,
      mood: reflectForm.mood,
      notes: reflectForm.notes,
      actualMins: reflectForm.actualMins,
      actualCost: reflectForm.actualCost,
    })
    setSaved(true)
    setShowReflect(false)
    setTimeout(() => setSaved(false), 4000)
  }

  function handleCellClick(di, h, halfHour) {
    const startTime = `${String(h).padStart(2, '0')}:${halfHour ? '30' : '00'}`
    setEventFormInit({ date: weekDateStrs[di], startTime, durationMins: 60, title: '', type: 'work' })
    setShowEventForm(true)
  }

  function handleAddEvent(form) {
    addEvent(form)
    setShowEventForm(false)
    setEventFormInit(null)
  }

  function handleEditEvent(form) {
    updateEvent(selected.id, form)
    setSelected(ev => ({ ...ev, ...form }))
    setEditMode(false)
  }

  function openEdit() {
    const s = new Date(selected.start)
    const startTime = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`
    const durationMins = Math.round((new Date(selected.end) - s) / 60000)
    setEditMode(true)
    setShowReflect(false)
  }

  const weekLabel = weekOffset === 0 ? 'This week'
    : weekOffset === 1 ? 'Next week'
    : weekOffset === -1 ? 'Last week'
    : `${fmtHeader(weekDates[0])} – ${fmtHeader(weekDates[6])}`

  const calendarBody = (
    <>
      {showEventForm && (
        <Modal title="New event" onClose={() => { setShowEventForm(false); setEventFormInit(null) }} width={540}>
          <EventForm initial={eventFormInit} routines={routines} onSave={handleAddEvent} onClose={() => { setShowEventForm(false); setEventFormInit(null) }} />
        </Modal>
      )}

      {/* Embedded mini-topbar: week nav + add button */}
      {embedded ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{weekLabel}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEventFormInit(null); setShowEventForm(true) }}>+ Event</button>
        </div>
      ) : (
        <>
          <div className="topbar">
            <span style={{ fontSize: 18 }}>📅</span>
            <div className="topbar-title">Scheduler</div>
            <div className="topbar-sep" />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{weekLabel}</span>
            <div className="topbar-right">
              <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o - 1)}>← Prev</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Today</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o + 1)}>Next →</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setEventFormInit(null); setShowEventForm(true) }}>+ Event</button>
            </div>
          </div>
          <div className="workflow-banner">
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>Workflow:</span>
            <span className="wf-step done" onClick={() => nav('/life/planner')} style={{ cursor: 'pointer' }}>🎯 Goal</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step done">🔄 Routine</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step active">📅 Schedule</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step" onClick={() => nav('/life/journal')} style={{ cursor: 'pointer' }}>📓 Journal</span>
            <span className="wf-arrow">→</span>
            <span className="wf-step" onClick={() => nav('/life/lens')} style={{ cursor: 'pointer' }}>🔭 LENS</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>
              {fromPlanner ? 'Came from Planner' : 'Click empty cell to add event · Click event to complete & journal'}
            </span>
          </div>
        </>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Calendar grid */}
        <div className="scroll" style={{ flex: 1 }}>
          <div style={{ minWidth: 560, padding: '0 12px 24px' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
              <div />
              {DAYS.map((d, i) => (
                <div key={d} style={{
                  padding: '10px 4px', textAlign: 'center',
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em',
                  color: i === todayIdx ? 'var(--accent)' : 'var(--text-3)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div>{d}</div>
                  <div style={{ fontSize: 13, fontWeight: i === todayIdx ? 700 : 400, color: i === todayIdx ? 'var(--accent)' : 'var(--text-2)', marginTop: 2 }}>
                    {weekDateStrs[i] ? weekDateStrs[i].slice(8) : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', position: 'relative' }}>
              <div>
                {HOURS.map(h => (
                  <div key={h} style={{ height: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 2, fontSize: 10, color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>
                    {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
                  </div>
                ))}
              </div>

              {DAYS.map((d, di) => (
                <div key={d} style={{ borderLeft: '1px solid var(--border)', position: 'relative' }}>
                  {HOURS.map(h => (
                    <div key={h} style={{ height: 48, borderBottom: '1px solid var(--border)', background: di === todayIdx ? 'rgba(167,139,250,.02)' : 'transparent', position: 'relative' }}>
                      {/* Top half-hour slot */}
                      <div
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24, cursor: 'pointer' }}
                        onClick={() => handleCellClick(di, h, false)}
                        title={`Add event at ${h}:00`}
                      />
                      {/* Bottom half-hour slot */}
                      <div
                        style={{ position: 'absolute', top: 24, left: 0, right: 0, height: 24, cursor: 'pointer' }}
                        onClick={() => handleCellClick(di, h, true)}
                        title={`Add event at ${h}:30`}
                      />
                    </div>
                  ))}

                  {/* Event blocks */}
                  {events.filter(ev => dayIdx(ev.start) === di).map(ev => {
                    const row = timeToRow(ev.start)
                    const span = eventHeight(ev.start, ev.end)
                    const isDone = ev.status === 'finished'
                    const isHighlighted = ev.routineId && ev.routineId === highlightRoutine
                    const color = TYPE_COLOR[ev.type] || '#a78bfa'
                    return (
                      <div
                        key={ev.id}
                        data-event="true"
                        onClick={e => { e.stopPropagation(); setSelected(ev); setShowReflect(false); setEditMode(false) }}
                        style={{
                          position: 'absolute',
                          top: row * 24, height: span * 24 - 2,
                          left: 2, right: 2,
                          background: isDone ? `${color}18` : `${color}30`,
                          borderLeft: `3px solid ${color}`,
                          borderRadius: 4,
                          padding: '2px 5px',
                          fontSize: 11, fontWeight: 500,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          zIndex: 2,
                          outline: selected?.id === ev.id ? `2px solid ${color}` : isHighlighted ? `2px solid var(--accent)` : 'none',
                          opacity: isDone ? .55 : 1,
                          transition: 'opacity .15s',
                        }}
                      >
                        <div style={{ color, lineHeight: 1.3 }}>{ev.title}</div>
                        {ev.routineId && <div style={{ fontSize: 9, color: 'var(--text-3)' }}>↺ routine</div>}
                        {isDone && <div style={{ fontSize: 9, color: 'var(--green)' }}>✓</div>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event detail panel */}
        {selected && (
          <div style={{ width: 280, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: TYPE_COLOR[selected.type] || 'var(--accent)', flexShrink: 0 }} />
                <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{selected.title}</div>
                {!editMode && selected.status !== 'finished' && (
                  <button onClick={openEdit}
                    style={{ color: 'var(--text-2)', fontSize: 11, cursor: 'pointer', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>
                    Edit
                  </button>
                )}
                <button onClick={() => { deleteEvent(selected.id); setSelected(null); setEditMode(false) }}
                  style={{ color: 'var(--text-3)', fontSize: 11, cursor: 'pointer', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>
                  Delete
                </button>
                <button onClick={() => { setSelected(null); setEditMode(false) }}
                  style={{ color: 'var(--text-3)', fontSize: 16, cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  📅 {new Date(selected.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  🕐 {new Date(selected.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – {new Date(selected.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
                {selected.routineId && (
                  <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                    ↺ {routines.find(r => r.id === selected.routineId)?.name || 'Routine'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                <span className={`badge type-${selected.type}`}>{selected.type}</span>
                <span className={`badge ${selected.status === 'finished' ? 'badge-new' : selected.status === 'active' ? 'badge-amber' : 'badge-surface'}`}>
                  {selected.status}
                </span>
              </div>
              <div className="divider" />
            </div>

            <div className="scroll" style={{ flex: 1, padding: '0 16px' }}>
              {editMode && (
                <div style={{ paddingTop: 12 }}>
                  <div className="section-title">Edit event</div>
                  <EventForm
                    initial={{
                      id: selected.id,
                      title: selected.title,
                      type: selected.type,
                      date: selected.start.slice(0, 10),
                      startTime: selected.start.slice(11, 16),
                      durationMins: Math.round((new Date(selected.end) - new Date(selected.start)) / 60000),
                      routineId: selected.routineId || '',
                    }}
                    routines={routines}
                    onSave={handleEditEvent}
                    onClose={() => setEditMode(false)}
                  />
                </div>
              )}

              {!editMode && selected.status !== 'finished' && !showReflect && (
                <div style={{ paddingTop: 12 }}>
                  <div className="section-title">Actions</div>
                  <button className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }} onClick={() => setShowReflect(true)}>
                    📓 Complete &amp; Journal
                  </button>
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => nav('/life/journal')}>
                    View journal →
                  </button>
                </div>
              )}

              {selected.status === 'finished' && (
                <div style={{ paddingTop: 12 }}>
                  <div style={{ padding: '12px', background: 'var(--green-bg)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>✓ Completed</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Reflection saved to Journal. Data sent to LENS.</div>
                  </div>
                  <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 8 }} onClick={() => nav('/life/journal')}>📓 View in Journal →</button>
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => nav('/life/lens')}>🔭 View in LENS →</button>
                </div>
              )}

              {showReflect && (
                <div style={{ paddingTop: 12 }}>
                  <div className="section-title">Quick reflection — {selected.title}</div>

                  <div style={{ marginBottom: 12 }}>
                    <span className="input-label">How did it go?</span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className={`btn ${reflectForm.thumbs === 'up' ? 'btn-success' : 'btn-ghost'} btn-sm`} style={{ flex: 1 }} onClick={() => setReflectForm(f => ({ ...f, thumbs: 'up' }))}>👍 Good</button>
                      <button className={`btn ${reflectForm.thumbs === 'down' ? 'btn-danger' : 'btn-ghost'} btn-sm`} style={{ flex: 1 }} onClick={() => setReflectForm(f => ({ ...f, thumbs: 'down' }))}>👎 Rough</button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <span className="input-label">Mood (1–5)</span>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReflectForm(f => ({ ...f, mood: n }))}
                          style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${reflectForm.mood === n ? 'var(--accent)' : 'var(--border)'}`, background: reflectForm.mood === n ? 'var(--accent-bg)' : 'var(--surface-2)', color: n <= reflectForm.mood ? 'var(--accent)' : 'var(--text-3)', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <span className="input-label">Quick note</span>
                    <textarea className="textarea" style={{ minHeight: 64, marginTop: 4 }}
                      placeholder="How was it? Any highlights?"
                      value={reflectForm.notes} onChange={e => setReflectForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>

                  {selected.taskId && (
                    <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--accent-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(167,139,250,.2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>📋 Task actuals — will update plan</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <label style={{ flex: 1, fontSize: 11, color: 'var(--text-2)' }}>
                          Actual time (min)
                          <input type="number" min={0} value={reflectForm.actualMins || ''} onChange={e => setReflectForm(f => ({ ...f, actualMins: e.target.value }))}
                            placeholder="min" style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', boxSizing: 'border-box' }} />
                        </label>
                        <label style={{ flex: 1, fontSize: 11, color: 'var(--text-2)' }}>
                          Actual cost ($)
                          <input type="number" min={0} step={0.01} value={reflectForm.actualCost || ''} onChange={e => setReflectForm(f => ({ ...f, actualCost: e.target.value }))}
                            placeholder="$0" style={{ display: 'block', width: '100%', marginTop: 4, fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', boxSizing: 'border-box' }} />
                        </label>
                      </div>
                    </div>
                  )}

                  {selected.routineId && (() => {
                    const routine = routines.find(r => r.id === selected.routineId)
                    const linkedPlan = routine?.goalId ? data.plans?.find(p => p.goalId === routine.goalId) : null
                    const pendingTasks = linkedPlan ? (data.planTasks || []).filter(t => t.planId === linkedPlan.id && t.status !== 'done' && !t.parentId) : []
                    if (!pendingTasks.length) return null
                    return (
                      <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>📋 Mark tasks done from "{linkedPlan.name}"</div>
                        {pendingTasks.map(t => (
                          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!checkedTasks[t.id]} onChange={e => setCheckedTasks(p => ({ ...p, [t.id]: e.target.checked }))}
                              style={{ accentColor: 'var(--accent)' }} />
                            <span style={{ fontSize: 12, textDecoration: checkedTasks[t.id] ? 'line-through' : 'none', color: checkedTasks[t.id] ? 'var(--text-3)' : 'var(--text-1)' }}>{t.title}</span>
                            {t.estMins > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.estMins}min</span>}
                          </label>
                        ))}
                      </div>
                    )
                  })()}

                  <button className="btn btn-primary" style={{ width: '100%', marginBottom: 6 }} onClick={() => {
                    Object.entries(checkedTasks).forEach(([id, checked]) => { if (checked) updatePlanTask(id, { status: 'done' }) })
                    setCheckedTasks({})
                    handleComplete()
                  }}>✓ Save reflection</button>
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowReflect(false)}>Cancel</button>
                </div>
              )}

              {selected.routineId && (
                <div style={{ marginTop: 16 }}>
                  <div className="divider" />
                  <div className="section-title" style={{ paddingTop: 12 }}>Source</div>
                  <button className="btn btn-ghost" style={{ width: '100%', fontSize: 12 }}
                    onClick={() => nav(`/life/planner`)}>🎯 View goal in Planner →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {saved && (
        <div className="toast">
          ✓ Reflection saved — data sent to LENS
          <button className="btn btn-ghost btn-xs" onClick={() => nav('/life/lens')}>View in LENS →</button>
        </div>
      )}
    </>
  )

  if (embedded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {calendarBody}
      </div>
    )
  }

  return (
    <div className="content">
      {calendarBody}
    </div>
  )
}
