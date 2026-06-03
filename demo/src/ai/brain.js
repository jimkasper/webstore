// ─── Provider call functions ──────────────────────────────────────────────────

async function callAnthropic(system, user, maxTokens, key, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.content?.[0]?.text ?? ''
}

async function callOpenAI(system, user, maxTokens, key, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

async function callGemini(system, user, maxTokens, key, model) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callEndpoint(system, user, maxTokens, endpoint, key, model) {
  const base = endpoint.replace(/\/$/, '')
  const headers = { 'Content-Type': 'application/json' }
  if (key) headers['Authorization'] = `Bearer ${key}`
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Endpoint ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

// ─── On-device (WebLLM) singleton ─────────────────────────────────────────────

let _engine = null
let _engineModel = null

async function callOnDevice(system, user, maxTokens, model, onProgress) {
  if (_engine && _engineModel !== model) {
    await _engine.unload()
    _engine = null
    _engineModel = null
  }
  if (!_engine) {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    _engine = await CreateMLCEngine(model, {
      initProgressCallback: (report) => {
        window.dispatchEvent(new CustomEvent('brain:progress', {
          detail: { text: report.text, progress: report.progress },
        }))
        onProgress?.(report)
      },
    })
    _engineModel = model
  }
  const res = await _engine.chat.completions.create({
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    max_tokens: maxTokens,
  })
  return res.choices[0].message.content
}

export function isOnDeviceReady(model) {
  return _engine !== null && _engineModel === model
}

export async function loadOnDeviceModel(model, onProgress) {
  await callOnDevice('', '', 1, model, onProgress)
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

async function callModel(system, user, maxTokens, config) {
  if (!config || config.provider === 'demo') return null
  if (config.provider === 'byok') {
    const key = config.byokKey?.trim()
    const model = config.byokModel || 'claude-haiku-4-5-20251001'
    if (!key) return null
    switch (config.byokProvider) {
      case 'openai': return callOpenAI(system, user, maxTokens, key, model)
      case 'gemini': return callGemini(system, user, maxTokens, key, model)
      default: return callAnthropic(system, user, maxTokens, key, model)
    }
  }
  if (config.provider === 'byoe') {
    const endpoint = config.byoeEndpoint?.trim()
    if (!endpoint) return null
    return callEndpoint(system, user, maxTokens, endpoint, config.byoeKey, config.byoeModel)
  }
  if (config.provider === 'ondevice') {
    return callOnDevice(system, user, maxTokens, config.onDeviceModel, null)
  }
  return null
}

// ─── Context builder ──────────────────────────────────────────────────────────

function buildContext(data) {
  return {
    goals: data.goals?.map(g => ({
      name: g.name, category: g.category, status: g.status,
      progress: g.progress, targetDate: g.targetDate,
    })),
    routines: data.routines?.map(r => ({
      name: r.name, streak: r.streak, status: r.status, frequency: r.frequency,
    })),
    upcomingEvents: data.events?.filter(e => e.status !== 'done').slice(0, 20).map(e => ({
      title: e.title, date: e.date, status: e.status,
    })),
    recentTransactions: data.transactions?.slice(0, 30).map(t => ({
      amount: t.amount, category: t.category, date: t.date, merchant: t.merchant,
    })),
    recentMeals: data.mealLogs?.slice(0, 14),
    moodTrend: data.journalEntries?.slice(0, 14).map(e => ({ date: e.date, rating: e.dayRating })),
    plans: data.plans?.map(p => ({
      name: p.name,
      taskGroups: p.taskGroups?.map(g => ({
        name: g.name,
        tasks: g.tasks?.length ?? 0,
        done: g.tasks?.filter(t => t.status === 'done').length ?? 0,
      })),
    })),
    achievements: data.achievements?.slice(0, 5).map(a => ({ name: a.name, tier: a.tier })),
  }
}

const BRAIN_SYSTEM = `You are Brain, the personal AI for nTogether — a life management platform. You have access to the user's actual data: goals, plans, routines, events, finances, diet, mood, and achievements. Be concise, specific, and reference actual data. Give actionable advice. Use plain text, no markdown headers.`

// ─── Public API ───────────────────────────────────────────────────────────────

export async function askBrain(prompt, data, config) {
  const ctx = JSON.stringify(buildContext(data))
  const result = await callModel(BRAIN_SYSTEM, `User data: ${ctx}\n\nQuestion: ${prompt}`, 800, config)
  return result ?? mockAsk(prompt, data)
}

export async function detectConflicts(data, config) {
  const ctx = JSON.stringify(buildContext(data))
  const result = await callModel(
    BRAIN_SYSTEM,
    `Analyze this data for conflicts, risks, or misalignments between the user's goals, schedule, habits, finances, and health. Return ONLY a JSON array (no other text) where each item has: { "type": "schedule"|"budget"|"health"|"diet"|"routine"|"plan", "severity": "high"|"medium"|"low", "description": "plain English explanation", "affected": ["item1"], "suggestion": "one-line fix" }. Find 3-6 real conflicts. User data: ${ctx}`,
    1200,
    config,
  )
  if (result === null) return mockConflicts(data)
  try {
    const match = result.match(/\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : mockConflicts(data)
  } catch {
    return mockConflicts(data)
  }
}

export async function suggestDatapoints(data, config) {
  const ctx = JSON.stringify(buildContext(data))
  const result = await callModel(
    BRAIN_SYSTEM,
    `Based on the user's goals and current tracked data, suggest 6-8 specific metrics they should start tracking. Return ONLY a JSON array (no other text) where each item has: { "app": "Fitness"|"Health"|"Diet"|"Financial"|"Journal"|"Planner"|"Scheduler", "metric": "metric name", "why": "1-sentence benefit tied to their specific goals", "howToTrack": "1-sentence how-to in the app" }. User data: ${ctx}`,
    1200,
    config,
  )
  if (result === null) return mockDatapoints(data)
  try {
    const match = result.match(/\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : mockDatapoints(data)
  } catch {
    return mockDatapoints(data)
  }
}

export async function testProvider(config) {
  const result = await callModel(
    'You are a test. Reply with exactly: "ok"',
    'Reply with exactly: ok',
    10,
    config,
  )
  if (result === null) throw new Error('No provider configured')
  return true
}

// ─── Data Inventory ───────────────────────────────────────────────────────────

export function getDataInventory(data) {
  const le = data.lensEvents ?? []
  const workouts = le.filter(e => e.type === 'fitness.workout')
  const runs = le.filter(e => e.type === 'fitness.run')
  const journals = data.journalEntries ?? []
  const health = data.healthLogs ?? []
  const txns = data.transactions ?? []
  const meals = data.mealLogs ?? []
  const goals = (data.goals ?? []).filter(g => g.status !== 'archived')
  const routines = data.routines ?? []
  const prs = data.personalBests ?? []

  function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null }
  function dateRange(items, key = 'date') {
    const dates = items.map(i => i[key]).filter(Boolean).sort()
    if (!dates.length) return null
    return { from: dates[0], to: dates[dates.length - 1] }
  }
  function quality(n) { return n === 0 ? 'none' : n < 5 ? 'sparse' : n < 20 ? 'moderate' : 'rich' }

  return [
    {
      app: 'Fitness', icon: '💪', path: '/life/fitness',
      quality: quality(workouts.length + runs.length),
      range: dateRange([...workouts, ...runs]),
      metrics: [
        { label: 'Workouts', value: workouts.length },
        { label: 'Runs', value: runs.length },
        { label: 'Personal bests', value: prs.length },
        ...(workouts.length ? [{ label: 'Avg duration', value: Math.round(avg(workouts.map(e => e.payload?.durationMins ?? 0))) + ' min' }] : []),
        ...(runs.length ? [{ label: 'Total distance', value: runs.reduce((s, e) => s + (e.payload?.distance ?? 0), 0).toFixed(1) + ' km' }] : []),
      ],
    },
    {
      app: 'Health', icon: '❤️', path: '/life/health',
      quality: quality(health.length),
      range: dateRange(health),
      metrics: [
        { label: 'Logs', value: health.length },
        ...(health.length ? [{ label: 'Avg sleep', value: avg(health.map(h => h.sleepHours ?? 0)).toFixed(1) + ' hrs' }] : []),
        ...(health.filter(h => h.restingHR).length ? [{ label: 'Avg resting HR', value: Math.round(avg(health.filter(h => h.restingHR).map(h => h.restingHR))) + ' bpm' }] : []),
      ],
    },
    {
      app: 'Journal', icon: '📓', path: '/life/journal',
      quality: quality(journals.length),
      range: dateRange(journals),
      metrics: [
        { label: 'Entries', value: journals.length },
        ...(journals.filter(j => j.dayRating).length ? [{ label: 'Avg mood', value: avg(journals.filter(j => j.dayRating).map(j => j.dayRating)).toFixed(1) + '/5' }] : []),
        { label: 'With highlights', value: journals.filter(j => j.highlight).length },
      ],
    },
    {
      app: 'Financial', icon: '💰', path: '/life/financial',
      quality: quality(txns.length),
      range: dateRange(txns),
      metrics: [
        { label: 'Transactions', value: txns.length },
        { label: 'Categories', value: new Set(txns.map(t => t.category)).size },
        ...(txns.filter(t => t.amount < 0).length ? [{
          label: 'Avg monthly spend',
          value: '$' + Math.round(Math.abs(txns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)) / Math.max(1, new Set(txns.map(t => t.date?.slice(0, 7))).size)).toLocaleString(),
        }] : []),
      ],
    },
    {
      app: 'Goals', icon: '🎯', path: '/life/planner',
      quality: quality(goals.length + routines.length),
      range: null,
      metrics: [
        { label: 'Active goals', value: goals.filter(g => g.status === 'active').length },
        ...(goals.length ? [{ label: 'Avg progress', value: Math.round(avg(goals.map(g => g.progress ?? 0))) + '%' }] : []),
        { label: 'Active routines', value: routines.length },
        ...(routines.filter(r => r.streak).length ? [{ label: 'Avg streak', value: avg(routines.filter(r => r.streak).map(r => r.streak)).toFixed(1) + ' wks' }] : []),
      ],
    },
    {
      app: 'Diet', icon: '🥗', path: '/life/diet',
      quality: quality(meals.length),
      range: dateRange(meals),
      metrics: [
        { label: 'Meals logged', value: meals.length },
        ...(meals.length ? [{ label: 'Avg cal/day', value: Math.round(meals.reduce((s, m) => s + (m.calories ?? 0), 0) / Math.max(1, new Set(meals.map(m => m.date)).size)).toLocaleString() }] : []),
      ],
    },
  ]
}

// ─── Correlations ─────────────────────────────────────────────────────────────

function computeCorrelations(data) {
  const corrs = []
  const le = data.lensEvents ?? []
  const journals = data.journalEntries ?? []
  const health = data.healthLogs ?? []
  const txns = data.transactions ?? []
  const goals = data.goals ?? []
  const routines = data.routines ?? []

  function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null }

  const workoutDates = new Set(le.filter(e => e.type === 'fitness.workout').map(e => e.date?.slice(0, 10)).filter(Boolean))
  const moodWorkout = journals.filter(j => workoutDates.has(j.date) && j.dayRating).map(j => j.dayRating)
  const moodRest = journals.filter(j => !workoutDates.has(j.date) && j.dayRating).map(j => j.dayRating)
  if (moodWorkout.length >= 2 && moodRest.length >= 2) {
    const w = avg(moodWorkout).toFixed(1), r = avg(moodRest).toFixed(1)
    corrs.push({
      title: 'Workouts → Mood',
      insight: `Mood averages ${w}/5 on workout days vs ${r}/5 on rest days — ${Math.abs(w - r).toFixed(1)} pts ${Number(w) >= Number(r) ? 'higher' : 'lower'} when active.`,
      strength: moodWorkout.length >= 5 ? 'strong' : 'moderate',
      apps: ['Fitness', 'Journal'],
      query: 'How does my workout frequency affect my mood?',
    })
  }

  const sleepMood = health.map(h => {
    const j = journals.find(e => e.date === h.date)
    return j?.dayRating && h.sleepHours ? { sleep: h.sleepHours, mood: j.dayRating } : null
  }).filter(Boolean)
  if (sleepMood.length >= 3) {
    const good = sleepMood.filter(p => p.sleep >= 7).map(p => p.mood)
    const poor = sleepMood.filter(p => p.sleep < 7).map(p => p.mood)
    if (good.length >= 1 && poor.length >= 1) {
      corrs.push({
        title: 'Sleep → Mood',
        insight: `7+ hrs sleep → mood ${avg(good)?.toFixed(1) ?? '?'}/5 vs ${avg(poor)?.toFixed(1) ?? '?'}/5 on shorter nights.`,
        strength: sleepMood.length >= 7 ? 'strong' : 'moderate',
        apps: ['Health', 'Journal'],
        query: 'Does getting more sleep improve how I feel the next day?',
      })
    }
  }

  const bl = data.budgetLimits ?? {}
  const overCats = Object.keys(bl).filter(cat => {
    const spent = Math.abs(txns.filter(t => t.category === cat && t.amount < 0).reduce((s, t) => s + t.amount, 0))
    return spent > (bl[cat] ?? 0) && bl[cat] > 0
  })
  if (txns.length >= 3 && overCats.length > 0) {
    corrs.push({
      title: 'Budget Overruns',
      insight: `${overCats.length} categor${overCats.length === 1 ? 'y is' : 'ies are'} over budget: ${overCats.slice(0, 3).join(', ')}${overCats.length > 3 ? ' +more' : ''}.`,
      strength: overCats.length >= 2 ? 'strong' : 'moderate',
      apps: ['Financial'],
      query: 'Which spending categories are hurting my budget most?',
    })
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  if (activeGoals.length > 0 && routines.length > 0) {
    const avgProg = avg(activeGoals.map(g => g.progress ?? 0))
    corrs.push({
      title: 'Goals & Habit Momentum',
      insight: `${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''} at ${avgProg?.toFixed(0) ?? 0}% avg progress, supported by ${routines.length} active routine${routines.length !== 1 ? 's' : ''}.`,
      strength: routines.length >= 2 && (avgProg ?? 0) > 30 ? 'strong' : 'moderate',
      apps: ['Goals', 'Planner'],
      query: 'Are my routines helping me make progress on my goals?',
    })
  }

  return corrs
}

export async function getCorrelations(data, config) {
  if (config?.provider && config.provider !== 'demo') {
    const ctx = JSON.stringify(buildContext(data))
    const result = await callModel(
      BRAIN_SYSTEM,
      `Identify 3-5 meaningful correlations or patterns in the user's data. Return ONLY a JSON array where each item has: { "title": "3-5 word title", "insight": "1-2 sentences with specific numbers", "strength": "strong"|"moderate"|"weak", "apps": ["App1"], "query": "question to explore this further" }. User data: ${ctx}`,
      900,
      config,
    )
    if (result) {
      try {
        const m = result.match(/\[[\s\S]*\]/)
        if (m) return JSON.parse(m[0])
      } catch {}
    }
  }
  return computeCorrelations(data)
}

// ─── Suggested Queries ────────────────────────────────────────────────────────

export function getSuggestedQueries(data) {
  const le = data.lensEvents ?? []
  const journals = data.journalEntries ?? []
  const health = data.healthLogs ?? []
  const txns = data.transactions ?? []
  const goals = (data.goals ?? []).filter(g => g.status === 'active')
  const routines = data.routines ?? []

  const queries = []
  if (le.filter(e => e.type === 'fitness.workout').length >= 2 && journals.length >= 2)
    queries.push('How does my workout frequency affect my mood?')
  if (health.length >= 3 && journals.length >= 3)
    queries.push('Does more sleep make me feel better the next day?')
  if (txns.length >= 5)
    queries.push('Which spending categories are hurting my budget most?')
  if (goals.length > 0)
    queries.push('Which of my goals are at risk this month?')
  if (routines.length >= 2)
    queries.push('Which routine has my best consistency?')
  if (le.filter(e => e.type === 'fitness.run').length >= 2)
    queries.push('Is my running pace improving over time?')
  queries.push('What should I focus on this week?')
  queries.push('What am I neglecting in my life right now?')
  return queries
}

// ─── Fallback mocks ───────────────────────────────────────────────────────────

function mockAsk(prompt, data) {
  const q = prompt.toLowerCase()
  const goals = data.goals ?? []
  const routines = data.routines ?? []
  const events = data.events ?? []
  const txns = data.transactions ?? []

  if (q.includes('schedule') || q.includes('optim')) {
    const upcoming = events.filter(e => e.status !== 'done').length
    return `You have ${upcoming} upcoming events. To optimize: cluster similar tasks on the same day to reduce context switching, protect morning blocks for deep work, and leave buffer time between commitments.`
  }
  if (q.includes('neglect') || q.includes('missing') || q.includes('behind')) {
    const inactive = routines.filter(r => !r.streak || r.streak === 0)
    const stalled = goals.filter(g => (g.progress ?? 0) < 20)
    return `You may be neglecting: ${inactive.map(r => r.name).join(', ') || 'no routines'} (zero streak) and ${stalled.map(g => g.name).join(', ') || 'no goals'} (under 20% progress). Start small — even one session resets the streak.`
  }
  if (q.includes('goal') || q.includes('track') || q.includes('progress')) {
    const active = goals.filter(g => g.status === 'active')
    return `You have ${active.length} active goal${active.length !== 1 ? 's' : ''}. ${active.map(g => `${g.name}: ${g.progress ?? 0}%`).join(', ')}. Focus on the one closest to completion for a quick win.`
  }
  if (q.includes('spend') || q.includes('money') || q.includes('budget')) {
    const spent = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    return `Recent spending totals $${spent.toFixed(2)}. Review your top categories and compare to your financial goals.`
  }
  return `Based on your data: you have ${goals.length} goals, ${routines.length} routines, and ${events.length} scheduled events. Ask me something specific like "How am I tracking toward my goals?" or "What should I prioritize this week?"`
}

function mockConflicts(data) {
  const conflicts = []
  const goals = data.goals ?? []
  const routines = data.routines ?? []
  const txns = data.transactions ?? []
  const events = data.events ?? []

  const savingsGoal = goals.find(g => g.category === 'financial' || g.name?.toLowerCase().includes('sav'))
  if (savingsGoal) {
    const recentSpend = txns.filter(t => t.amount < 0).slice(0, 10).reduce((s, t) => s + Math.abs(t.amount), 0)
    if (recentSpend > 200) conflicts.push({
      type: 'budget', severity: 'medium',
      description: `Recent spending of $${recentSpend.toFixed(0)} may conflict with your "${savingsGoal.name}" goal.`,
      affected: [savingsGoal.name, 'Recent transactions'],
      suggestion: 'Review discretionary spending and set a weekly cap.',
    })
  }

  const zeroStreak = routines.filter(r => !r.streak || r.streak === 0)
  if (zeroStreak.length > 0) conflicts.push({
    type: 'routine', severity: 'medium',
    description: `${zeroStreak.length} routine${zeroStreak.length > 1 ? 's have' : ' has'} a zero streak: ${zeroStreak.map(r => r.name).join(', ')}.`,
    affected: zeroStreak.map(r => r.name),
    suggestion: 'Schedule one session this week to restart the streak.',
  })

  const overloaded = events.filter(e => e.status !== 'done')
    .reduce((acc, e) => { acc[e.date] = (acc[e.date] || 0) + 1; return acc }, {})
  const busyDays = Object.entries(overloaded).filter(([, n]) => n >= 4)
  if (busyDays.length > 0) conflicts.push({
    type: 'schedule', severity: 'high',
    description: `You have ${busyDays[0][1]} events on ${busyDays[0][0]} — over-scheduled.`,
    affected: [`${busyDays[0][0]} schedule`],
    suggestion: 'Move one or two non-urgent events to less busy days.',
  })

  const stallGoals = goals.filter(g => g.status === 'active' && (g.progress ?? 0) < 10)
  if (stallGoals.length > 0) conflicts.push({
    type: 'plan', severity: 'low',
    description: `Goal "${stallGoals[0].name}" is at ${stallGoals[0].progress ?? 0}% — no meaningful progress yet.`,
    affected: [stallGoals[0].name],
    suggestion: 'Create a plan with at least one task group to start tracking progress.',
  })

  if (conflicts.length === 0) conflicts.push({
    type: 'schedule', severity: 'low',
    description: 'No critical conflicts detected — your goals, schedule, and habits look aligned.',
    affected: [],
    suggestion: 'Keep it up! Configure a real AI provider in Brain Settings for deeper analysis.',
  })

  return conflicts
}

function mockDatapoints(data) {
  const goals = data.goals ?? []
  const base = [
    { app: 'Health', metric: 'Resting heart rate', why: 'Tracks cardiovascular fitness trends and flags overtraining.', howToTrack: 'Log in Health > Body Metrics each morning before getting up.' },
    { app: 'Fitness', metric: 'Weekly volume (sets × reps × weight)', why: 'Progressive overload is the key driver of strength gains.', howToTrack: 'Log each set in Fitness > Workouts; volume is calculated automatically.' },
    { app: 'Journal', metric: 'Energy level (1–5)', why: 'Correlating energy with sleep, diet, and workouts reveals your performance patterns.', howToTrack: 'Add an energy rating when writing your daily journal entry.' },
    { app: 'Diet', metric: 'Protein intake (g/day)', why: 'Protein is the most important macro for body composition and recovery.', howToTrack: 'Log meals in Diet and add protein grams; aim for 0.7–1g per lb of bodyweight.' },
    { app: 'Financial', metric: 'Net worth (monthly snapshot)', why: 'A monthly snapshot is the clearest signal of financial momentum.', howToTrack: 'Log assets and liabilities in Financial on the 1st of each month.' },
    { app: 'Health', metric: 'Sleep duration', why: 'Sleep drives recovery, mood, and cognitive performance across all other goals.', howToTrack: 'Log bedtime and wake time in Health > Sleep Log each morning.' },
  ]
  if (goals.some(g => g.name?.toLowerCase().includes('weight') || g.name?.toLowerCase().includes('fit'))) {
    base.push({ app: 'Fitness', metric: 'Body weight (weekly)', why: 'Weekly weigh-ins (same day, same time) show your true trend without daily noise.', howToTrack: 'Log in Fitness > Body Stats every Monday morning.' })
  }
  return base
}
