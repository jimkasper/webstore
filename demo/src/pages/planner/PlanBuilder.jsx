import { useState } from 'react'
import { useStore } from '../../store.jsx'
import { askBrain } from '../../ai/brain.js'
import LinkedListPicker from './LinkedListPicker.jsx'

const LIFE_APPS = [
  { key: 'fitness',   label: '💪 Fitness' },
  { key: 'health',    label: '🏥 Health' },
  { key: 'financial', label: '💰 Financial' },
  { key: 'diet',      label: '🥗 Diet' },
  { key: 'journal',   label: '📓 Journal' },
  { key: 'media',     label: '🎬 Media' },
  { key: 'learning',  label: '🎓 Learning' },
]

// ─── Template library ─────────────────────────────────────────────────────────

const PLAN_TEMPLATES = [
  // Home & Household
  {
    id: 'home-clean', domain: 'Home & Household', icon: '🧹', name: 'Home Cleaning Plan',
    groups: [
      { name: 'Rooms', tasks: [{ title: 'Clean bathroom', estMins: 30 }, { title: 'Clean bedroom', estMins: 20 }, { title: 'Tidy living room', estMins: 15 }, { title: 'Clean kitchen', estMins: 40 }] },
      { name: 'Floors', tasks: [{ title: 'Sweep all floors', estMins: 15 }, { title: 'Vacuum carpets', estMins: 20 }, { title: 'Mop hard floors', estMins: 20 }] },
      { name: 'Windows & Surfaces', tasks: [{ title: 'Dust window shades', estMins: 10 }, { title: 'Clean window panes', estMins: 20 }, { title: 'Wipe windowsills', estMins: 10 }, { title: 'Wipe counters & surfaces', estMins: 15 }] },
    ],
  },
  {
    id: 'home-repair', domain: 'Home & Household', icon: '🔧', name: 'Home Repair & Maintenance',
    groups: [
      { name: 'Immediate Repairs', tasks: [{ title: 'Assess and list all repairs needed', estMins: 30 }, { title: 'Fix most urgent item', estMins: 60, estCost: 50 }] },
      { name: 'Scheduled Maintenance', tasks: [{ title: 'Change HVAC filter', estMins: 15, estCost: 20 }, { title: 'Test smoke detectors', estMins: 10 }, { title: 'Clean gutters', estMins: 90 }] },
      { name: 'Replacements', tasks: [{ title: 'Identify items needing replacement', estMins: 20 }, { title: 'Research and order replacements', estMins: 30 }] },
      { name: 'DIY Projects', tasks: [{ title: 'Paint touch-ups', estMins: 120, estCost: 30 }, { title: 'Caulk bathroom', estMins: 60, estCost: 15 }] },
    ],
  },
  {
    id: 'moving', domain: 'Home & Household', icon: '📦', name: 'Moving Plan',
    groups: [
      { name: '4 Weeks Out', tasks: [{ title: 'Book moving company or truck', estCost: 400 }, { title: 'Notify utilities of move date' }, { title: 'Start decluttering' }] },
      { name: '2 Weeks Out', tasks: [{ title: 'Pack non-essentials', estMins: 180 }, { title: 'Change address with USPS' }, { title: 'Confirm movers' }] },
      { name: 'Moving Day', tasks: [{ title: 'Final walkthrough old place', estMins: 30 }, { title: 'Oversee loading', estMins: 120 }, { title: 'Clean old place', estMins: 120 }] },
      { name: 'Settling In', tasks: [{ title: 'Unpack essentials first', estMins: 120 }, { title: 'Set up utilities and internet' }, { title: 'Update address everywhere' }] },
    ],
  },
  {
    id: 'declutter', domain: 'Home & Household', icon: '🗂️', name: 'Declutter & Organize',
    groups: [
      { name: 'Room by Room', tasks: [{ title: 'Bedroom: clothes + closet', estMins: 90 }, { title: 'Kitchen: cabinets + pantry', estMins: 60 }, { title: 'Office / desk area', estMins: 60 }] },
      { name: 'Donate / Sell', tasks: [{ title: 'Create donate bag', estMins: 20 }, { title: 'List items on Marketplace', estMins: 30 }, { title: 'Drop off donations', estMins: 30 }] },
      { name: 'Purchase Organizers', tasks: [{ title: 'Measure storage areas', estMins: 15 }, { title: 'Buy shelving / bins', estCost: 80 }] },
      { name: 'Final Setup', tasks: [{ title: 'Label everything', estMins: 30 }, { title: 'Take "after" photos', estMins: 10 }] },
    ],
  },
  // Fitness & Health
  {
    id: '5k', domain: 'Fitness & Health', icon: '🏃', name: '5K Training Plan',
    groups: [
      { name: 'Base Building (Wks 1–3)', tasks: [{ title: 'Run 1km non-stop', estMins: 10 }, { title: 'Run 2km non-stop', estMins: 15 }, { title: 'Run 3km non-stop', estMins: 20 }] },
      { name: 'Speed Work (Wks 4–6)', tasks: [{ title: 'Run 4km — interval training', estMins: 30 }, { title: 'Tempo run 3km', estMins: 25 }, { title: 'Run 5km first attempt', estMins: 40 }] },
      { name: 'Race Prep (Wks 7–8)', tasks: [{ title: 'Register for a race', estCost: 30 }, { title: 'Buy race-day gear', estCost: 60 }, { title: 'Plan race-day morning routine', estMins: 15 }, { title: 'Complete 5K race', estMins: 40 }] },
    ],
  },
  {
    id: 'gym', domain: 'Fitness & Health', icon: '🏋️', name: 'Gym Program',
    groups: [
      { name: 'Strength', tasks: [{ title: 'Set baseline lifts (bench, squat, deadlift)', estMins: 60 }, { title: 'Progressive overload plan', estMins: 20 }, { title: 'Hit first strength milestone', estMins: 60 }] },
      { name: 'Cardio', tasks: [{ title: 'Establish cardio baseline', estMins: 30 }, { title: 'Run 1 mile sub-10 min', estMins: 15 }] },
      { name: 'Mobility & Recovery', tasks: [{ title: 'Add stretching routine post-workout', estMins: 15 }, { title: 'Try one foam rolling session', estMins: 20 }] },
    ],
  },
  // Financial
  {
    id: 'emergency-fund', domain: 'Financial', icon: '🛡️', name: 'Emergency Fund Plan',
    groups: [
      { name: 'Calculate Target', tasks: [{ title: 'Sum 3 months of essential expenses', estMins: 30 }, { title: 'Set savings target', estMins: 10 }] },
      { name: 'Cut Expenses', tasks: [{ title: 'Audit subscriptions', estMins: 20 }, { title: 'Identify top 3 spending cuts', estMins: 30 }] },
      { name: 'Automate Savings', tasks: [{ title: 'Set up auto-transfer to savings', estMins: 15 }, { title: 'Name the savings account "Emergency Fund"', estMins: 5 }] },
      { name: 'Milestones', tasks: [{ title: '25% of target saved', estMins: 0 }, { title: '50% of target saved', estMins: 0 }, { title: 'Full emergency fund reached', estMins: 0 }] },
    ],
  },
  {
    id: 'budget-reset', domain: 'Financial', icon: '💰', name: 'Budget Reset',
    groups: [
      { name: 'Income Audit', tasks: [{ title: 'List all income sources', estMins: 20 }, { title: 'Calculate monthly take-home', estMins: 15 }] },
      { name: 'Fixed Expenses', tasks: [{ title: 'List all fixed bills', estMins: 20 }, { title: 'Look for better rates on insurance/phone', estMins: 30 }] },
      { name: 'Variable Expenses', tasks: [{ title: 'Review last 90 days of spending', estMins: 30 }, { title: 'Set category limits', estMins: 20 }] },
      { name: 'Savings & Investments', tasks: [{ title: 'Set savings rate target', estMins: 15 }, { title: 'Automate savings first', estMins: 15 }] },
      { name: 'Debt', tasks: [{ title: 'List all debts with rates', estMins: 20 }, { title: 'Choose payoff strategy (avalanche/snowball)', estMins: 15 }] },
    ],
  },
  // Learning & Career
  {
    id: 'read-12', domain: 'Learning & Career', icon: '📚', name: 'Read 12 Books',
    groups: [
      { name: 'Q1 (Jan–Mar)', tasks: [{ title: 'Book 1' }, { title: 'Book 2' }, { title: 'Book 3' }] },
      { name: 'Q2 (Apr–Jun)', tasks: [{ title: 'Book 4' }, { title: 'Book 5' }, { title: 'Book 6' }] },
      { name: 'Q3 (Jul–Sep)', tasks: [{ title: 'Book 7' }, { title: 'Book 8' }, { title: 'Book 9' }] },
      { name: 'Q4 (Oct–Dec)', tasks: [{ title: 'Book 10' }, { title: 'Book 11' }, { title: 'Book 12' }] },
    ],
  },
  {
    id: 'learn-lang', domain: 'Learning & Career', icon: '🗣️', name: 'Learn a Language',
    groups: [
      { name: 'Foundations (Wks 1–4)', tasks: [{ title: 'Set up Duolingo / app', estMins: 10 }, { title: 'Learn 100 most common words', estMins: 120 }, { title: 'Finish beginner grammar unit', estMins: 90 }] },
      { name: 'Conversation (Wks 5–12)', tasks: [{ title: 'Find a language exchange partner', estMins: 30 }, { title: 'Complete first 30-min conversation', estMins: 30 }, { title: 'Watch 5 shows/films in target language', estMins: 300 }] },
      { name: 'Advanced (Ongoing)', tasks: [{ title: 'Read first book in target language', estMins: 600 }, { title: 'Take an online course', estCost: 40 }] },
    ],
  },
]

const DOMAINS = ['Home & Household', 'Fitness & Health', 'Financial', 'Learning & Career']

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlanBuilder({ goalId, initialTemplate, onClose, onComplete }) {
  const { data, addPlan, addTaskGroup, addPlanTask, savePlanTemplate, deletePlanTemplate } = useStore()
  const goal = data.goals?.find(g => g.id === goalId)

  const [step, setStep] = useState(1)
  const [domainFilter, setDomainFilter] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [planName, setPlanName] = useState(goal ? `${goal.name} — Plan` : '')
  const [description, setDescription] = useState('')
  const [apps, setApps] = useState(goal?.apps ?? [])
  const [budget, setBudget] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [groups, setGroups] = useState([{ id: 'g0', name: '', tasks: [] }])
  const [brainLoading, setBrainLoading] = useState(false)
  const [openListPickerTaskId, setOpenListPickerTaskId] = useState(null)

  const brainConfig = data.brainConfig
  const lists = data.lists || []

  function toggleApp(key) { setApps(a => a.includes(key) ? a.filter(x => x !== key) : [...a, key]) }

  function applyTemplate(tmpl) {
    setSelectedTemplate(tmpl)
    if (!planName || planName === (goal ? `${goal.name} — Plan` : '')) setPlanName(tmpl.name)
    setGroups(tmpl.groups.map((g, i) => ({
      id: `tg-new-${i}`,
      name: g.name,
      tasks: (g.tasks ?? []).map((t, j) => ({
        id: `tt-new-${i}-${j}`, title: t.title ?? '', estMins: t.estMins ?? 0, estCost: t.estCost ?? 0, subtasks: [], linkedListIds: [],
      })),
    })))
    setStep(2)
  }

  function addGroup() { setGroups(g => [...g, { id: `tg-new-${Date.now()}`, name: '', tasks: [] }]) }
  function removeGroup(id) { setGroups(g => g.filter(x => x.id !== id)) }
  function updateGroupName(id, name) { setGroups(g => g.map(x => x.id === id ? { ...x, name } : x)) }

  function addTask(groupId) {
    setGroups(g => g.map(x => x.id === groupId ? { ...x, tasks: [...x.tasks, { id: `tt-new-${Date.now()}`, title: '', estMins: 0, estCost: 0, subtasks: [], linkedListIds: [], countsTowardGoal: false }] } : x))
  }
  function removeTask(groupId, taskId) {
    setGroups(g => g.map(x => x.id === groupId ? { ...x, tasks: x.tasks.filter(t => t.id !== taskId) } : x))
  }
  function updateTask(groupId, taskId, patch) {
    setGroups(g => g.map(x => x.id === groupId ? { ...x, tasks: x.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t) } : x))
  }
  function addSubtask(groupId, taskId) {
    setGroups(g => g.map(x => x.id === groupId ? {
      ...x,
      tasks: x.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks ?? []), { id: `st-new-${Date.now()}`, title: '' }] } : t),
    } : x))
  }
  function updateSubtask(groupId, taskId, stId, title) {
    setGroups(g => g.map(x => x.id === groupId ? {
      ...x,
      tasks: x.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks ?? []).map(s => s.id === stId ? { ...s, title } : s) } : t),
    } : x))
  }
  function removeSubtask(groupId, taskId, stId) {
    setGroups(g => g.map(x => x.id === groupId ? {
      ...x,
      tasks: x.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks ?? []).filter(s => s.id !== stId) } : t),
    } : x))
  }

  async function askBrainForGroups() {
    setBrainLoading(true)
    try {
      const prompt = `Suggest 3-5 task group names for a plan called "${planName}"${goal ? ` linked to the goal "${goal.name}"` : ''}. Reply with ONLY a JSON array of strings, e.g. ["Group 1","Group 2"]. No other text.`
      const result = await askBrain(prompt, data, brainConfig)
      const m = result?.match(/\[[\s\S]*?\]/)
      if (m) {
        const names = JSON.parse(m[0])
        setGroups(names.map((name, i) => ({ id: `tg-brain-${i}`, name, tasks: [] })))
      }
    } catch {}
    setBrainLoading(false)
  }

  async function askBrainForTasks(groupId, groupName) {
    setBrainLoading(true)
    try {
      const prompt = `Suggest 3-5 specific tasks for the group "${groupName}" in the plan "${planName}". Reply with ONLY a JSON array of strings, e.g. ["Task 1","Task 2"]. No other text.`
      const result = await askBrain(prompt, data, brainConfig)
      const m = result?.match(/\[[\s\S]*?\]/)
      if (m) {
        const titles = JSON.parse(m[0])
        setGroups(g => g.map(x => x.id === groupId ? {
          ...x,
          tasks: [...x.tasks, ...titles.map((title, i) => ({ id: `tt-brain-${Date.now()}-${i}`, title, estMins: 0, estCost: 0, subtasks: [], linkedListIds: [] }))],
        } : x))
      }
    } catch {}
    setBrainLoading(false)
  }

  function savePlan() {
    const planId = addPlan({ name: planName.trim(), goalId: goalId ?? null, createdAt: new Date().toISOString().slice(0, 10), taskGroups: [] })
    groups.filter(g => g.name.trim()).forEach(g => {
      const tgId = addTaskGroup(planId, { name: g.name.trim() })
      g.tasks.filter(t => t.title.trim()).forEach(t => {
        const taskId = addPlanTask({ planId, groupId: tgId, parentId: null, title: t.title.trim(), status: 'pending', estMins: t.estMins || 0, estCost: t.estCost || 0, deps: [], contactDeps: [], assistedBy: [], notes: '', scheduledEventId: null, linkedListIds: t.linkedListIds || [], countsTowardGoal: t.countsTowardGoal || false })
        ;(t.subtasks ?? []).filter(s => s.title.trim()).forEach(s => {
          addPlanTask({ planId, groupId: tgId, parentId: taskId, title: s.title.trim(), status: 'pending', estMins: 0, estCost: 0, deps: [], contactDeps: [], assistedBy: [], notes: '', scheduledEventId: null })
        })
      })
    })
    return planId
  }

  const totalMins = groups.flatMap(g => g.tasks).reduce((s, t) => s + (t.estMins || 0), 0)
  const totalCost = groups.flatMap(g => g.tasks).reduce((s, t) => s + (t.estCost || 0), 0)
  const totalTasks = groups.flatMap(g => g.tasks).length

  const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {step === 1 ? '📋 New Plan — Choose template' : step === 2 ? '📋 Basics' : step === 3 ? '📋 Task Groups' : step === 4 ? '📋 Tasks' : '📋 Summary'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Step {step} of 5</div>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(s => (
              <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Step 1: Template */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 14 }}>
                Pick a template to get started quickly, or build from scratch.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {['All', ...DOMAINS].map(d => (
                  <button key={d} className={`btn btn-sm ${domainFilter === d ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setDomainFilter(d)} style={{ fontSize: 11 }}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div onClick={() => setStep(2)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ fontSize: 20 }}>📝</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Blank plan</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Start with empty groups and add your own tasks</div>
                  </div>
                </div>
                {(domainFilter === 'All' ? PLAN_TEMPLATES : PLAN_TEMPLATES.filter(t => t.domain === domainFilter)).map(t => (
                  <div key={t.id} onClick={() => applyTemplate(t)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.domain} · {t.groups.length} groups · {t.groups.reduce((s, g) => s + g.tasks.length, 0)} tasks</div>
                    </div>
                  </div>
                ))}
                {(data.savedPlanTemplates || []).length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginTop: 10, marginBottom: 4, paddingLeft: 2 }}>My saved templates</div>
                    {(data.savedPlanTemplates || []).map(t => (
                      <div key={t.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        onClick={() => applyTemplate(t)}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>📌</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{(t.groups || []).length} groups</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deletePlanTemplate(t.id) }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: '0 4px', flexShrink: 0 }}>✕</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Basics */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {goal && (
                <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13 }}>
                  🎯 Linked to goal: <strong>{goal.name}</strong>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Plan name *</div>
                <input className="input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. Run a 5K — Training Plan" autoFocus />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Description (optional)</div>
                <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this plan accomplish?" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Connected apps</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {LIFE_APPS.map(a => (
                    <button key={a.key} className={`btn btn-sm ${apps.includes(a.key) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => toggleApp(a.key)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Estimated budget ($)</div>
                  <input type="number" className="input" min={0} placeholder="0" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>Target completion</div>
                  <input type="date" className="input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Task Groups */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 14 }}>
                What are the major phases or areas of this plan?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {groups.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                    <input className="input" style={{ flex: 1 }} value={g.name} onChange={e => updateGroupName(g.id, e.target.value)} placeholder={`Group ${i + 1} name…`} />
                    <button onClick={() => removeGroup(g.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={addGroup}>+ Add group</button>
                <button className="btn btn-ghost btn-sm" onClick={askBrainForGroups} disabled={brainLoading}>
                  {brainLoading ? 'Thinking…' : '🧠 Ask Brain to suggest'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Tasks */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 14 }}>
                Add tasks to each group. You can include subtasks and estimated time/cost.
              </p>
              {groups.filter(g => g.name.trim()).map(g => (
                <div key={g.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</div>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => askBrainForTasks(g.id, g.name)} disabled={brainLoading}>
                      {brainLoading ? '…' : '🧠 Suggest tasks'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
                    {g.tasks.map(t => (
                      <div key={t.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: (t.subtasks?.length ?? 0) > 0 ? 6 : 0 }}>
                          <input className="input" style={{ flex: 1 }} value={t.title} onChange={e => updateTask(g.id, t.id, { title: e.target.value })} placeholder="Task title…" />
                          <input type="number" min={0} placeholder="min" title="Est. minutes" value={t.estMins || ''} onChange={e => updateTask(g.id, t.id, { estMins: parseInt(e.target.value) || 0 })}
                            style={{ ...iStyle, width: 54, textAlign: 'center' }} />
                          <input type="number" min={0} placeholder="$" title="Est. cost" value={t.estCost || ''} onChange={e => updateTask(g.id, t.id, { estCost: parseInt(e.target.value) || 0 })}
                            style={{ ...iStyle, width: 54, textAlign: 'center' }} />
                          <button onClick={() => addSubtask(g.id, t.id)} title="Add subtask" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>⊕</button>
                          <button onClick={() => setOpenListPickerTaskId(p => p === t.id ? null : t.id)} title="Require a list"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0, color: (t.linkedListIds || []).length > 0 ? 'var(--accent)' : 'var(--text-3)' }}>📋</button>
                          <button onClick={() => removeTask(g.id, t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>✕</button>
                        </div>
                        {goalId && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)', marginTop: 6, cursor: 'pointer' }}>
                            <input type="checkbox" checked={t.countsTowardGoal || false}
                              onChange={e => updateTask(g.id, t.id, { countsTowardGoal: e.target.checked })}
                              style={{ accentColor: 'var(--accent)' }} />
                            Counts toward goal progress
                          </label>
                        )}
                        {openListPickerTaskId === t.id && lists.filter(l => l.type !== 'Tier' && l.mode !== 'tier').length > 0 && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                            <LinkedListPicker
                              lists={lists}
                              selectedIds={t.linkedListIds || []}
                              onChange={ids => updateTask(g.id, t.id, { linkedListIds: ids })}
                            />
                          </div>
                        )}
                        {(t.subtasks ?? []).map(s => (
                          <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'center', paddingLeft: 20, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>↳</span>
                            <input className="input" style={{ flex: 1, fontSize: 12 }} value={s.title} onChange={e => updateSubtask(g.id, t.id, s.id, e.target.value)} placeholder="Subtask…" />
                            <button onClick={() => removeSubtask(g.id, t.id, s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0, flexShrink: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => addTask(g.id)}>+ Add task</button>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{planName}</div>
                {description && <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 0, marginBottom: 10 }}>{description}</p>}
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                  <span>{groups.filter(g => g.name.trim()).length} groups</span>
                  <span>{totalTasks} tasks</span>
                  {totalMins > 0 && <span>~{Math.round(totalMins / 60 * 10) / 10} hrs est.</span>}
                  {totalCost > 0 && <span>${totalCost} est. cost</span>}
                  {targetDate && <span>Due {targetDate}</span>}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}
                  onClick={() => savePlanTemplate({
                    name: planName,
                    groups: groups.map(g => ({ name: g.name, tasks: g.tasks.map(t => ({ title: t.title, estMins: t.estMins, estCost: t.estCost })) })),
                  })}>
                  💾 Save as template
                </button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>What would you like to do next?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => { const pid = savePlan(); onComplete?.({ type: 'routine', planId: pid }) }}>
                  🔄 Build a Routine around this plan →
                </button>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => { savePlan(); onComplete?.({ type: 'schedule' }) }}>
                  📅 Schedule tasks in Planner →
                </button>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => { savePlan(); onComplete?.({ type: 'done' }) }}>
                  Done for now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 5 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={step === 1 ? onClose : () => setStep(s => s - 1)}>
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <button className="btn btn-primary"
              disabled={step === 2 && !planName.trim()}
              onClick={() => setStep(s => s + 1)}>
              {step === 4 ? 'Review plan →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
