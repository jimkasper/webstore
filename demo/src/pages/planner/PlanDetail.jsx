import { useState } from 'react'
import { useStore } from '../../store.jsx'
import LinkedListPicker from './LinkedListPicker.jsx'

function fmtMins(m) {
  if (!m) return null
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'min' : ''}`.trim() : `${m}min`
}

function Avatar({ name, size = 24 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const hue = (name || '?').charCodeAt(0) * 137 % 360
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const EMPTY_TASK = { title: '', groupId: '', parentId: '', estMins: '', estCost: '', deps: [], notes: '', contactDeps: [], assistedBy: [], linkedListIds: [] }

export default function PlanDetail({ plan }) {
  const { data, addTaskGroup, deleteTaskGroup, addPlanTask, updatePlanTask, deletePlanTask, schedulePlanTask, updatePlan } = useStore()

  const tasks = data.planTasks.filter(t => t.planId === plan.id)
  const topLevel = tasks.filter(t => !t.parentId)
  const contacts = data.contacts || []
  const lists = data.lists || []

  const [activeGroup, setActiveGroup] = useState('all')
  const [expanded, setExpanded] = useState({})
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [form, setForm] = useState(EMPTY_TASK)
  const [schedulingId, setSchedulingId] = useState(null)
  const [scheduleDateTime, setScheduleDateTime] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const [contactSearch, setContactSearch] = useState('')

  const doneTasks = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0

  const planContacts = (plan.contacts || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)
  const visibleTop = topLevel.filter(t => activeGroup === 'all' || t.groupId === activeGroup)

  function saveGroup() {
    if (!newGroupName.trim()) return
    addTaskGroup(plan.id, { name: newGroupName.trim() })
    setNewGroupName(''); setShowAddGroup(false)
  }

  function openAdd(defaults = {}) {
    setForm({ ...EMPTY_TASK, ...defaults })
    setEditTaskId(null); setShowAddTask(true)
  }

  function openEdit(task) {
    setForm({ ...EMPTY_TASK, ...task, estMins: task.estMins || '', estCost: task.estCost || '', deps: task.deps || [], contactDeps: task.contactDeps || [], assistedBy: task.assistedBy || [], linkedListIds: task.linkedListIds || [] })
    setEditTaskId(task.id); setShowAddTask(true)
  }

  function saveTask() {
    if (!form.title.trim()) return
    const payload = {
      ...form,
      planId: plan.id,
      estMins: Number(form.estMins) || 0,
      estCost: Number(form.estCost) || 0,
      groupId: form.groupId || null,
      parentId: form.parentId || null,
    }
    if (editTaskId) updatePlanTask(editTaskId, payload)
    else addPlanTask(payload)
    setShowAddTask(false); setEditTaskId(null); setForm(EMPTY_TASK)
  }

  function toggleDep(id) {
    setForm(p => ({ ...p, deps: p.deps.includes(id) ? p.deps.filter(d => d !== id) : [...p.deps, id] }))
  }

  function toggleContactDep(id) {
    setForm(p => ({ ...p, contactDeps: (p.contactDeps || []).includes(id) ? (p.contactDeps || []).filter(d => d !== id) : [...(p.contactDeps || []), id] }))
  }

  function toggleAssistedBy(id) {
    setForm(p => ({ ...p, assistedBy: (p.assistedBy || []).includes(id) ? (p.assistedBy || []).filter(d => d !== id) : [...(p.assistedBy || []), id] }))
  }

  function togglePlanContact(id) {
    const current = plan.contacts || []
    updatePlan(plan.id, { contacts: current.includes(id) ? current.filter(c => c !== id) : [...current, id] })
  }

  function TaskRow({ task, indent = 0 }) {
    const children = tasks.filter(t => t.parentId === task.id)
    const isExpanded = expanded[task.id]
    const depTitles = (task.deps || []).map(d => tasks.find(t => t.id === d)?.title).filter(Boolean)
    const group = plan.taskGroups.find(g => g.id === task.groupId)
    const linkedLists = (task.linkedListIds || []).map(id => lists.find(l => l.id === id)).filter(Boolean)
    const taskContactDeps = (task.contactDeps || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)
    const taskAssistedBy = (task.assistedBy || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 12px', paddingLeft: 12 + indent * 20, borderBottom: '1px solid var(--border)', background: editTaskId === task.id ? 'var(--accent-bg)' : 'transparent' }}>
          {children.length > 0 && (
            <button onClick={() => setExpanded(p => ({ ...p, [task.id]: !p[task.id] }))}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 10, padding: '2px 0', flexShrink: 0, marginTop: 1 }}>
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {children.length === 0 && <div style={{ width: 16, flexShrink: 0 }} />}
          <input type="checkbox" checked={task.status === 'done'} style={{ accentColor: 'var(--accent)', flexShrink: 0, marginTop: 2 }}
            onChange={() => updatePlanTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' })} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-3)' : 'var(--text-1)' }}>{task.title}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
              {group && <span style={{ fontSize: 10, background: 'var(--surface-2)', borderRadius: 10, padding: '1px 6px', color: 'var(--text-3)' }}>{group.name}</span>}
              {fmtMins(task.estMins) && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>⏱ {fmtMins(task.estMins)}{task.actualMins ? ` → ${fmtMins(task.actualMins)}` : ''}</span>}
              {task.estCost > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>${task.estCost}{task.actualCost > 0 ? ` → $${task.actualCost}` : ''}</span>}
              {task.scheduledEventId && <span style={{ fontSize: 10, color: 'var(--accent)' }}>📅 Scheduled</span>}
              {depTitles.map(d => <span key={d} style={{ fontSize: 10, background: 'var(--surface-2)', borderRadius: 10, padding: '1px 6px', color: 'var(--accent)' }}>↳ {d.length > 20 ? d.slice(0, 20) + '…' : d}</span>)}
              {taskContactDeps.map(c => (
                <span key={c.id} style={{ fontSize: 10, background: 'rgba(251,191,36,.15)', borderRadius: 10, padding: '1px 6px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  ⏳ {c.name}
                </span>
              ))}
              {taskAssistedBy.map(c => (
                <span key={c.id} style={{ fontSize: 10, background: 'rgba(74,222,128,.12)', borderRadius: 10, padding: '1px 6px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3 }}>
                  🤝 {c.name}
                </span>
              ))}
              {linkedLists.map(l => {
                const undone = (l.items || []).filter(i => !i.done).length
                const total = (l.items || []).length
                return (
                  <span key={l.id} style={{ fontSize: 10, background: 'rgba(167,139,250,.12)', borderRadius: 10, padding: '1px 6px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {l.emoji || '📋'} {l.name}{total > 0 ? ` ${undone}/${total}` : ''}
                  </span>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => openAdd({ groupId: task.groupId || '', parentId: task.id })}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 11 }} title="Add sub-task">+</button>
            <button onClick={() => { setSchedulingId(task.id); setScheduleDateTime('') }}
              style={{ background: 'none', border: 'none', color: task.scheduledEventId ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer', fontSize: 11 }} title="Schedule">📅</button>
            <button onClick={() => openEdit(task)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>✎</button>
            <button onClick={() => deletePlanTask(task.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13 }}>✕</button>
          </div>
        </div>
        {schedulingId === task.id && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 12px', paddingLeft: 12 + indent * 20 + 40, borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Schedule:</span>
            <input type="datetime-local" value={scheduleDateTime} onChange={e => setScheduleDateTime(e.target.value)}
              style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
            <button onClick={() => { if (scheduleDateTime) { schedulePlanTask(task.id, scheduleDateTime); setSchedulingId(null) } }}
              disabled={!scheduleDateTime}
              style={{ fontSize: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', cursor: scheduleDateTime ? 'pointer' : 'not-allowed', opacity: scheduleDateTime ? 1 : 0.5 }}>
              Confirm
            </button>
            <button onClick={() => setSchedulingId(null)}
              style={{ fontSize: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', color: 'var(--text-2)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )}
        {isExpanded && children.map(c => <TaskRow key={c.id} task={c} indent={indent + 1} />)}
      </>
    )
  }

  const groupedTop = plan.taskGroups.map(g => ({
    group: g,
    tasks: visibleTop.filter(t => t.groupId === g.id),
  }))
  const ungrouped = visibleTop.filter(t => !t.groupId)

  const filteredContacts = contacts.filter(c => {
    const q = contactSearch.toLowerCase()
    return !q || c.name?.toLowerCase().includes(q) || c.profession?.toLowerCase().includes(q)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>Created {plan.createdAt} · {doneTasks}/{tasks.length} tasks done</div>
        <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
        </div>
        {/* Plan-level participants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Participants:</span>
          {planContacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', borderRadius: 10, padding: '2px 8px 2px 4px' }}>
              <Avatar name={c.name} size={18} />
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.name}</span>
              <button onClick={() => togglePlanContact(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 11, padding: 0, lineHeight: 1 }}>×</button>
            </div>
          ))}
          <button onClick={() => setShowParticipants(p => !p)}
            style={{ fontSize: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, padding: '2px 8px', color: 'var(--text-3)', cursor: 'pointer' }}>
            {showParticipants ? '✕ Close' : '+ Add participant'}
          </button>
        </div>
        {showParticipants && (
          <div style={{ marginTop: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: 8, maxHeight: 160, overflow: 'auto' }}>
            <input value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts…"
              style={{ width: '100%', fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)', marginBottom: 6, boxSizing: 'border-box' }} />
            {filteredContacts.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', cursor: 'pointer', borderRadius: 4 }}>
                <input type="checkbox" checked={(plan.contacts || []).includes(c.id)} onChange={() => togglePlanContact(c.id)} style={{ accentColor: 'var(--accent)' }} />
                <Avatar name={c.name} size={20} />
                <span style={{ fontSize: 12 }}>{c.name}</span>
                {c.profession && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.profession}</span>}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Group chips */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => setActiveGroup('all')}
          style={{ fontSize: 12, borderRadius: 10, padding: '3px 10px', border: '1px solid var(--border)', background: activeGroup === 'all' ? 'var(--accent)' : 'var(--bg)', color: activeGroup === 'all' ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>
          All
        </button>
        {plan.taskGroups.map(g => (
          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => setActiveGroup(g.id)}
              style={{ fontSize: 12, borderRadius: 10, padding: '3px 10px', border: '1px solid var(--border)', background: activeGroup === g.id ? 'var(--accent)' : 'var(--bg)', color: activeGroup === g.id ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>
              {g.name}
            </button>
            <button onClick={() => deleteTaskGroup(plan.id, g.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 11, padding: '0 2px' }}>×</button>
          </div>
        ))}
        {showAddGroup ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name"
              autoFocus onKeyDown={e => { if (e.key === 'Enter') saveGroup(); if (e.key === 'Escape') setShowAddGroup(false) }}
              style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', width: 120 }} />
            <button onClick={saveGroup} style={{ fontSize: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>Add</button>
            <button onClick={() => setShowAddGroup(false)} style={{ fontSize: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', color: 'var(--text-2)', cursor: 'pointer' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setShowAddGroup(true)}
            style={{ fontSize: 12, borderRadius: 10, padding: '3px 10px', border: '1px dashed var(--border)', background: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
            + Group
          </button>
        )}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groupedTop.map(({ group, tasks: gt }) => gt.length === 0 && activeGroup !== group.id ? null : (
          <div key={group.id}>
            <div style={{ padding: '8px 12px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--surface)' }}>{group.name}</div>
            {gt.map(t => <TaskRow key={t.id} task={t} />)}
            {gt.length === 0 && <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-3)' }}>No tasks yet.</div>}
          </div>
        ))}
        {ungrouped.length > 0 && (
          <div>
            <div style={{ padding: '8px 12px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--surface)' }}>Ungrouped</div>
            {ungrouped.map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
        {tasks.length === 0 && <div style={{ padding: 24, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>No tasks yet — add one below.</div>}
      </div>

      {/* Add task form */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', flexShrink: 0, background: 'var(--surface)' }}>
        {showAddTask ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Task title *" autoFocus
              style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))}
                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}>
                <option value="">No group</option>
                {plan.taskGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}>
                <option value="">No parent (top-level)</option>
                {topLevel.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <input type="number" value={form.estMins} onChange={e => setForm(p => ({ ...p, estMins: e.target.value }))}
                placeholder="Est. mins" min={0}
                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', width: 90 }} />
              <input type="number" value={form.estCost} onChange={e => setForm(p => ({ ...p, estCost: e.target.value }))}
                placeholder="Est. cost $" min={0}
                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', width: 90 }} />
            </div>
            {topLevel.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                Dependencies:&nbsp;
                {topLevel.filter(t => t.id !== editTaskId).map(t => (
                  <label key={t.id} style={{ marginRight: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.deps.includes(t.id)} onChange={() => toggleDep(t.id)}
                      style={{ accentColor: 'var(--accent)', marginRight: 3 }} />
                    {t.title}
                  </label>
                ))}
              </div>
            )}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Waiting on (⏳):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {contacts.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer', background: (form.contactDeps || []).includes(c.id) ? 'rgba(251,191,36,.2)' : 'var(--surface-2)', borderRadius: 10, padding: '2px 8px', border: `1px solid ${(form.contactDeps || []).includes(c.id) ? 'var(--amber)' : 'transparent'}` }}>
                      <input type="checkbox" checked={(form.contactDeps || []).includes(c.id)} onChange={() => toggleContactDep(c.id)} style={{ display: 'none' }} />
                      {c.name}
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Assisted by (🤝):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {contacts.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer', background: (form.assistedBy || []).includes(c.id) ? 'rgba(74,222,128,.15)' : 'var(--surface-2)', borderRadius: 10, padding: '2px 8px', border: `1px solid ${(form.assistedBy || []).includes(c.id) ? '#4ade80' : 'transparent'}` }}>
                      <input type="checkbox" checked={(form.assistedBy || []).includes(c.id)} onChange={() => toggleAssistedBy(c.id)} style={{ display: 'none' }} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <LinkedListPicker
              lists={lists}
              selectedIds={form.linkedListIds || []}
              onChange={ids => setForm(p => ({ ...p, linkedListIds: ids }))}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveTask} disabled={!form.title.trim()}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>
                {editTaskId ? 'Save' : 'Add Task'}
              </button>
              <button onClick={() => { setShowAddTask(false); setEditTaskId(null); setForm(EMPTY_TASK) }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => openAdd()}
            style={{ width: '100%', background: 'none', border: '1px dashed var(--border)', borderRadius: 4, padding: '7px', fontSize: 13, color: 'var(--text-3)', cursor: 'pointer', textAlign: 'center' }}>
            + Add Task
          </button>
        )}
      </div>
    </div>
  )
}
