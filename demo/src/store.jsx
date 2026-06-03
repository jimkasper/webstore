import { createContext, useContext, useState, useEffect } from 'react'

const DEMO_META_KEY = 'barbelo-active-demo'
export function getActiveDemo() { return localStorage.getItem(DEMO_META_KEY) || 'jordan' }

export const seed = {
  user: {
    id: 'u1', handle: 'jordan', name: 'Jordan Malik',
    title: 'Software Developer', location: 'Seattle, WA',
    bio: 'Building things. Running farther. Reading more.',
    credits: 340, tier: 'T3',
    stats: { followers: 124, following: 89, posts: 47 },
    purposes: ['Personal', 'Fitness'],
    spaceTheme: 'default',
    spaceLayout: 'classic',
    siteType: 'social',
  },

  budgetLimits: {
    Groceries: 400,
    'Dining Out': 200,
    Coffee: 40,
    'Health & Fitness': 60,
    Shopping: 200,
    Transport: 80,
    Subscriptions: 30,
    Books: 40,
    Entertainment: 60,
  },

  feedAlgorithm: 'chronological',

  lifeSuiteGroups: [
    { id: 'body',   label: 'Body',   appIds: ['fitness', 'health', 'diet'] },
    { id: 'mind',   label: 'Mind',   appIds: ['planner', 'scheduler', 'journal', 'learning', 'kenoma'] },
    { id: 'money',  label: 'Life',   appIds: ['financial', 'lists', 'agreements', 'research'] },
    { id: 'world',  label: 'World',  appIds: ['contacts', 'media', 'aroundtown', 'posthumous', 'draft'] },
    { id: 'other',  label: 'Brain',  appIds: ['brain'] },
  ],

  brainConfig: {
    provider: 'demo',
    byokProvider: 'anthropic',
    byokKey: '',
    byokModel: 'claude-haiku-4-5-20251001',
    byoeEndpoint: 'http://localhost:11434',
    byoeKey: '',
    byoeModel: 'llama3.3',
    onDeviceModel: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  },

  goals: [
    { id: 'g1', name: 'Run a 5K', type: 'milestone', proof: 'route_completion', targetDate: '2026-06-15', progress: 72, streak: 0, tier: 'bronze', credits: 20, routineId: 'r2', planId: 'plan1', apps: ['fitness'] },
    { id: 'g2', name: 'Gym 3× per week', type: 'frequency', proof: 'location', period: 'weekly', target: 3, currentWeek: 2, streak: 6, tier: 'gold', credits: 180, routineId: 'r1', planId: 'plan2', apps: ['fitness'] },
    { id: 'g3', name: 'Read 12 books this year', type: 'milestone', proof: 'habit_logged', progress: 33, booksRead: 4, target: 12, streak: 0, tier: null, credits: 0, routineId: 'r3', planId: null, apps: ['media'] },
    { id: 'g4', name: 'Food budget under $800/month', type: 'threshold', proof: 'financial', period: 'monthly', limit: 800, currentMonth: 647, streak: 3, tier: 'silver', credits: 90, routineId: null, planId: null, apps: ['financial'] },
  ],

  routines: [
    { id: 'r1', name: 'Gym', category: 'Exercise', goalId: 'g2', mode: 'fixed_slots', days: ['Mon', 'Wed', 'Fri'], time: '07:00', durationMins: 60, streak: 6, completedThisWeek: 2, targetPerWeek: 3 },
    { id: 'r2', name: 'Running', category: 'Exercise', goalId: 'g1', mode: 'fixed_slots', days: ['Tue', 'Thu'], time: '06:30', durationMins: 45, streak: 4, completedThisWeek: 1, targetPerWeek: 2 },
    { id: 'r3', name: 'Reading', category: 'Learning', goalId: 'g3', mode: 'weekly_total', weeklyTargetMins: 210, completedThisMins: 140, streak: 18, completedThisWeek: 4, targetPerWeek: 7 },
    { id: 'r4', name: 'Journaling', category: 'Health', goalId: null, mode: 'session_based', sessionsPerWeek: 7, minsPerSession: 15, streak: 23, completedThisWeek: 5, targetPerWeek: 7 },
  ],

  events: [
    { id: 'e1', title: 'Gym', type: 'exercise', routineId: 'r1', start: '2026-04-28T07:00', end: '2026-04-28T08:00', status: 'finished' },
    { id: 'e2', title: 'Running', type: 'exercise', routineId: 'r2', start: '2026-04-29T06:30', end: '2026-04-29T07:15', status: 'finished' },
    { id: 'e3', title: 'Team standup', type: 'work', start: '2026-04-29T10:00', end: '2026-04-29T10:30', status: 'finished' },
    { id: 'e4', title: 'Deep work block', type: 'work', start: '2026-04-29T11:00', end: '2026-04-29T13:00', status: 'upcoming' },
    { id: 'e5', title: 'Lunch w/ Marcus', type: 'social', start: '2026-04-29T13:00', end: '2026-04-29T14:00', status: 'upcoming' },
    { id: 'e6', title: 'Reading', type: 'learning', routineId: 'r3', start: '2026-04-29T21:00', end: '2026-04-29T21:30', status: 'upcoming' },
    { id: 'e7', title: 'Gym', type: 'exercise', routineId: 'r1', start: '2026-04-30T07:00', end: '2026-04-30T08:00', status: 'upcoming' },
    { id: 'e8', title: 'Running', type: 'exercise', routineId: 'r2', start: '2026-05-01T06:30', end: '2026-05-01T07:15', status: 'upcoming' },
    { id: 'e9', title: 'Gym', type: 'exercise', routineId: 'r1', start: '2026-05-02T07:00', end: '2026-05-02T08:00', status: 'upcoming' },
    { id: 'e10', title: 'Coffee w/ Priya', type: 'social', start: '2026-05-03T10:00', end: '2026-05-03T11:00', status: 'upcoming' },
    { id: 'e11', title: 'Green Lake 5K Race', type: 'exercise', start: '2026-05-10T08:00', end: '2026-05-10T10:00', status: 'upcoming' },
    { id: 'e12', title: 'Portland trip — drive up', type: 'errand', start: '2026-05-16T09:00', end: '2026-05-16T13:00', status: 'upcoming' },
    { id: 'e13', title: 'Portland — Powell\'s Books', type: 'fun', start: '2026-05-16T14:00', end: '2026-05-16T16:00', status: 'upcoming' },
    { id: 'e14', title: 'Portland — drive back', type: 'errand', start: '2026-05-18T14:00', end: '2026-05-18T18:00', status: 'upcoming' },
    { id: 'e15', title: 'Maya EP listening party', type: 'social', start: '2026-05-12T19:00', end: '2026-05-12T22:00', status: 'upcoming' },
    { id: 'e16', title: 'Doctor checkup', type: 'errand', start: '2026-05-20T10:00', end: '2026-05-20T11:00', status: 'upcoming' },
    // Past events
    { id: 'e17', title: 'Gym', type: 'exercise', routineId: 'r1', start: '2026-04-27T07:00', end: '2026-04-27T08:00', status: 'finished' },
    { id: 'e18', title: 'Rattlesnake Ledge hike', type: 'fun', start: '2026-04-13T06:30', end: '2026-04-13T15:00', status: 'finished' },
    { id: 'e19', title: 'Freelance project review', type: 'work', start: '2026-04-10T10:00', end: '2026-04-10T11:30', status: 'finished' },
    { id: 'e20', title: 'Running', type: 'exercise', routineId: 'r2', start: '2026-04-08T06:30', end: '2026-04-08T07:15', status: 'finished' },
    { id: 'e21', title: 'Gym', type: 'exercise', routineId: 'r1', start: '2026-04-06T07:00', end: '2026-04-06T08:00', status: 'finished' },
    { id: 'e22', title: 'Dinner w/ Marcus & Priya', type: 'social', start: '2026-04-04T18:30', end: '2026-04-04T21:00', status: 'finished' },
  ],

  journalEntries: [
    {
      id: 'j1', date: '2026-04-28', type: 'nightly', title: 'Nightly — Apr 28',
      dayRating: 4, highlight: 'Crushed the gym session, PR on bench press.',
      longForm: "Started the day strong with a 7am gym session. Hit a new personal best on bench press — 185lbs for 5 reps. Felt energised all morning. Work was focused but a bit slow in the afternoon. Maya texted about the weekend hike which I'm really looking forward to. Evening reading session with the new Cormac McCarthy book.",
      moods: [{ time: '08:00', mood: 4, note: 'Post-gym energy' }, { time: '14:00', mood: 3, note: 'Afternoon lull' }, { time: '22:00', mood: 4, note: 'Content' }],
      moments: [{ time: '07:45', emoji: '💪', label: 'PR on bench — 185lbs' }, { time: '21:00', emoji: '📚', label: 'Reading: McCarthy' }],
    },
    {
      id: 'j2', date: '2026-04-27', type: 'nightly', title: 'Nightly — Apr 27',
      dayRating: 3, highlight: 'Productive but drained by back-to-back meetings.',
      longForm: "Long day of meetings. Three back-to-back video calls in the afternoon drained me. Did manage to get the feature shipped before EOD which felt good. Skipped reading — just couldn't focus. Will catch up tomorrow.",
      moods: [{ time: '09:00', mood: 4 }, { time: '17:00', mood: 2, note: 'Meeting fatigue' }, { time: '20:00', mood: 3 }],
      moments: [{ time: '17:30', emoji: '🚀', label: 'Shipped the feature' }],
    },
    {
      id: 'j3', date: '2026-04-26', type: 'nightly', title: 'Nightly — Apr 26',
      dayRating: 5, highlight: 'Best run yet. Felt like I could go forever.',
      longForm: "Sunday. Went for my long run in the morning — did 4.8km in 28 minutes which is the closest I've been to 5K pace. Felt incredible. Spent the afternoon meal prepping and calling my parents. Evening was slow and restorative.",
      moods: [{ time: '09:00', mood: 5 }, { time: '17:00', mood: 4 }, { time: '21:00', mood: 5 }],
      moments: [{ time: '09:15', emoji: '🏃', label: '4.8km in 28 min — PB!' }, { time: '14:00', emoji: '🥗', label: 'Meal prep done' }],
    },
    {
      id: 'j4', date: '2026-04-25', type: 'nightly', title: 'Nightly — Apr 25',
      dayRating: 4, highlight: 'Finished The Road. Fourth book of the year.',
      longForm: "Quiet Saturday. Gym in the morning — solid session. Finished The Road by Cormac McCarthy in the evening. Quietly devastating. Starting Stoner next.",
      moods: [{ time: '09:00', mood: 4 }, { time: '21:00', mood: 4 }],
      moments: [{ time: '21:30', emoji: '📖', label: 'Finished The Road' }],
    },
    {
      id: 'j5', date: '2026-04-24', type: 'nightly', title: 'Nightly — Apr 24',
      dayRating: 4, highlight: 'Good focus day. Running streak holding strong.',
      longForm: "Early run before work. Good pace, legs felt fresh. Deep work morning, shipped two PRs. Went to Third Place Books after work — picked up Stoner.",
      moods: [{ time: '07:00', mood: 4 }, { time: '11:00', mood: 5 }, { time: '22:00', mood: 3 }],
      moments: [{ time: '06:45', emoji: '🏃', label: '5.1km run — new distance PB' }, { time: '16:30', emoji: '📚', label: 'Picked up Stoner' }],
    },
    {
      id: 'j6', date: '2026-04-22', type: 'nightly', title: 'Nightly — Apr 22',
      dayRating: 3, highlight: 'Gym skipped — felt off. Grace period used.',
      longForm: "Woke up with a headache, decided to skip gym. Used my monthly grace period on the streak. Worked from home all day. Going to make up for it Thursday.",
      moods: [{ time: '09:00', mood: 2 }, { time: '20:00', mood: 3 }],
      moments: [{ time: '20:00', emoji: '🛋', label: 'Rest day — grace period' }],
    },
    {
      id: 'j7', date: '2026-04-20', type: 'nightly', title: 'Nightly — Apr 20',
      dayRating: 5, highlight: 'Salary hit, gym streak hit Silver. Great day.',
      longForm: "Payday. Hit Silver tier on my gym streak after 3 consecutive weeks. Treated myself to Pike Place Chowder for lunch. Priya and I did our Sunday run together.",
      moods: [{ time: '09:00', mood: 4 }, { time: '12:00', mood: 5 }, { time: '22:00', mood: 5 }],
      moments: [{ time: '10:00', emoji: '💰', label: 'Payday 💸' }, { time: '12:30', emoji: '🍲', label: 'Pike Place Chowder' }],
    },
    {
      id: 'j8', date: '2026-04-19', type: 'nightly', title: 'Nightly — Apr 19',
      dayRating: 4, highlight: 'Long run Sunday. Started planning Portland trip.',
      longForm: "Lazy morning then a proper long run — 4.2km. Legs were stiff but loosened up by km 2. Spent the afternoon looking at Portland hotels. Marcus and I are going May 16 weekend. Excited — haven't left Seattle since January.",
      moods: [{ time: '10:00', mood: 3 }, { time: '12:00', mood: 4 }, { time: '21:00', mood: 4 }],
      moments: [{ time: '10:30', emoji: '🏃', label: '4.2km Sunday run' }, { time: '15:00', emoji: '🗺️', label: 'Portland trip planned' }],
    },
    {
      id: 'j9', date: '2026-04-17', type: 'nightly', title: 'Nightly — Apr 17',
      dayRating: 4, highlight: 'Deep work block — cleanest code I\'ve written in months.',
      longForm: "Blocked the whole morning for deep work. No Slack, no meetings. Shipped a refactor I've been putting off for weeks. Gym in the evening — legs day. Picked up Stoner at Third Place Books on the way home. Looking forward to starting it.",
      moods: [{ time: '09:00', mood: 4 }, { time: '13:00', mood: 5, note: 'Flow state all morning' }, { time: '21:00', mood: 4 }],
      moments: [{ time: '12:00', emoji: '💻', label: 'Major refactor shipped' }, { time: '18:30', emoji: '🏋️', label: 'Legs day — new squat PR attempt' }],
    },
    {
      id: 'j10', date: '2026-04-15', type: 'nightly', title: 'Nightly — Apr 15',
      dayRating: 3, highlight: 'Decent run, rainy day, good reading session.',
      longForm: "Rainy Tuesday in Seattle. Morning run in the rain — actually kind of enjoyable. Work was slow. Had a long reading session in the evening — got halfway through my current book. Meal prepped for the rest of the week.",
      moods: [{ time: '07:00', mood: 4 }, { time: '15:00', mood: 3 }, { time: '21:00', mood: 3 }],
      moments: [{ time: '06:45', emoji: '🌧️', label: 'Rainy run — 3.8km' }, { time: '20:00', emoji: '📖', label: 'Halfway through book 4' }],
    },
    {
      id: 'j11', date: '2026-04-13', type: 'nightly', title: 'Nightly — Apr 13',
      dayRating: 5, highlight: 'Amazing Sunday. Hiked Rattlesnake Ledge with Maya and Priya.',
      longForm: "Woke up at 6am for the hike. Maya and Priya drove up — 3 hours on trail, incredible views. Best day in weeks. We stopped at Salish Lodge on the way back. Already planning the next one. Fitness goal progress feels real now — hiking used to wind me.",
      moods: [{ time: '06:00', mood: 4 }, { time: '12:00', mood: 5 }, { time: '19:00', mood: 5 }],
      moments: [{ time: '11:00', emoji: '⛰️', label: 'Rattlesnake Ledge summit' }, { time: '15:00', emoji: '🍽️', label: 'Lunch at Salish Lodge' }],
    },
    {
      id: 'j12', date: '2026-04-10', type: 'nightly', title: 'Nightly — Apr 10',
      dayRating: 4, highlight: 'Freelance project signed off. Good payday incoming.',
      longForm: "Ava signed off on the freelance project. Clean close — she was happy with the final deliverable. Gym in the morning. Treated myself to Canon for dinner — their octopus appetizer is something else.",
      moods: [{ time: '09:00', mood: 4 }, { time: '11:00', mood: 5, note: 'Project signed off' }, { time: '19:00', mood: 4 }],
      moments: [{ time: '11:00', emoji: '✍️', label: 'Freelance project complete' }, { time: '19:00', emoji: '🍽️', label: 'Canon dinner — octopus app' }],
    },
    {
      id: 'j13', date: '2026-04-08', type: 'nightly', title: 'Nightly — Apr 8',
      dayRating: 3, highlight: 'Rest day, admin tasks, contacted Daniel about the bet.',
      longForm: "Scheduled rest day. Got through a pile of admin — taxes, insurance renewal. Messaged Daniel about the running bet — he's confident he'll win but I've been putting in the work. Evening was quiet. Journaled, watched something, early bed.",
      moods: [{ time: '09:00', mood: 3 }, { time: '18:00', mood: 3 }, { time: '21:00', mood: 3 }],
      moments: [{ time: '16:00', emoji: '📋', label: 'Taxes filed 🎉' }],
    },
  ],

  transactions: [
    { id: 't1',  date: '2026-04-28', merchant: 'Whole Foods',       amount: -67.40,  category: 'Groceries',       accountId: 'acc1' },
    { id: 't2',  date: '2026-04-28', merchant: 'Planet Fitness',    amount: -24.99,  category: 'Health & Fitness', accountId: 'acc2' },
    { id: 't3',  date: '2026-04-27', merchant: 'Chipotle',          amount: -13.50,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't4',  date: '2026-04-26', merchant: 'Amazon',            amount: -34.99,  category: 'Shopping',         accountId: 'acc2' },
    { id: 't5',  date: '2026-04-25', merchant: 'Spotify',           amount: -9.99,   category: 'Subscriptions',    accountId: 'acc2' },
    { id: 't6',  date: '2026-04-24', merchant: "Trader Joe's",      amount: -52.80,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't7',  date: '2026-04-24', merchant: 'Third Place Books', amount: -18.00,  category: 'Books',            accountId: 'acc1' },
    { id: 't8',  date: '2026-04-23', merchant: 'Starbucks',         amount: -6.50,   category: 'Coffee',           accountId: 'acc1' },
    { id: 't9',  date: '2026-04-22', merchant: 'GitHub Pro',        amount: -4.00,   category: 'Subscriptions',    accountId: 'acc2' },
    { id: 't10', date: '2026-04-21', merchant: 'QFC',               amount: -43.20,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't11', date: '2026-04-20', merchant: 'Stripe Inc',        amount: 4200.00, category: 'Income',           accountId: 'acc1' },
    { id: 't12', date: '2026-04-19', merchant: 'Pike Place Chowder',amount: -24.00,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't13', date: '2026-04-18', merchant: 'Lyft',              amount: -12.40,  category: 'Transport',        accountId: 'acc1' },
    { id: 't14', date: '2026-04-15', merchant: 'Target',            amount: -78.30,  category: 'Shopping',         accountId: 'acc2' },
    { id: 't15', date: '2026-04-14', merchant: 'Whole Foods',       amount: -61.20,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't16', date: '2026-04-12', merchant: 'REI',               amount: -89.00,  category: 'Shopping',         accountId: 'acc2' },
    { id: 't17', date: '2026-04-10', merchant: "Trader Joe's",      amount: -47.60,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't18', date: '2026-04-08', merchant: 'Postmates',         amount: -22.80,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't19', date: '2026-04-05', merchant: 'Whole Foods',       amount: -54.10,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't20', date: '2026-04-01', merchant: 'Stripe Inc',        amount: 4200.00, category: 'Income',           accountId: 'acc1' },
    // March 2026
    { id: 't21', date: '2026-03-28', merchant: 'Whole Foods',       amount: -71.20,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't22', date: '2026-03-27', merchant: 'Netflix',           amount: -15.49,  category: 'Subscriptions',    accountId: 'acc2' },
    { id: 't23', date: '2026-03-26', merchant: 'Paseo',             amount: -28.50,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't24', date: '2026-03-25', merchant: 'REI',               amount: -124.00, category: 'Shopping',         accountId: 'acc2' },
    { id: 't25', date: '2026-03-23', merchant: 'Victrola Coffee',   amount: -7.50,   category: 'Coffee',           accountId: 'acc1' },
    { id: 't26', date: '2026-03-22', merchant: "Trader Joe's",      amount: -58.40,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't27', date: '2026-03-21', merchant: 'Ava Torres Design', amount: 1500.00, category: 'Income',           accountId: 'acc1' },
    { id: 't28', date: '2026-03-20', merchant: 'Stripe Inc',        amount: 4200.00, category: 'Income',           accountId: 'acc1' },
    { id: 't29', date: '2026-03-18', merchant: 'Target',            amount: -44.80,  category: 'Shopping',         accountId: 'acc2' },
    { id: 't30', date: '2026-03-17', merchant: 'Chipotle',          amount: -14.20,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't31', date: '2026-03-16', merchant: 'Planet Fitness',    amount: -24.99,  category: 'Health & Fitness', accountId: 'acc2' },
    { id: 't32', date: '2026-03-14', merchant: 'Third Place Books', amount: -22.00,  category: 'Books',            accountId: 'acc1' },
    { id: 't33', date: '2026-03-13', merchant: 'QFC',               amount: -49.10,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't34', date: '2026-03-11', merchant: 'Starbucks',         amount: -6.00,   category: 'Coffee',           accountId: 'acc1' },
    { id: 't35', date: '2026-03-10', merchant: 'Spotify',           amount: -9.99,   category: 'Subscriptions',    accountId: 'acc2' },
    { id: 't36', date: '2026-03-08', merchant: 'Whole Foods',       amount: -63.70,  category: 'Groceries',        accountId: 'acc1' },
    { id: 't37', date: '2026-03-06', merchant: 'Uber',              amount: -9.80,   category: 'Transport',        accountId: 'acc1' },
    { id: 't38', date: '2026-03-04', merchant: 'Postmates',         amount: -31.50,  category: 'Dining Out',       accountId: 'acc1' },
    { id: 't39', date: '2026-03-03', merchant: 'GitHub Pro',        amount: -4.00,   category: 'Subscriptions',    accountId: 'acc2' },
    { id: 't40', date: '2026-03-01', merchant: 'Stripe Inc',        amount: 4200.00, category: 'Income',           accountId: 'acc1' },
  ],

  importHashes: [],

  accounts: [
    { id: 'acc1', name: 'Chase Checking', type: 'checking',   institution: 'Chase',            balance: 3842.10,  currency: 'USD', color: '#1a56db' },
    { id: 'acc2', name: 'Amex Blue Cash', type: 'credit',     institution: 'American Express', balance: -412.80,  currency: 'USD', color: '#ef4444' },
    { id: 'acc3', name: 'Marcus Savings', type: 'savings',    institution: 'Goldman Sachs',    balance: 12500.00, currency: 'USD', color: '#10b981' },
  ],

  lensEvents: [
    { id: 'le1', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 62, calories: 410 }, recordedAt: '2026-04-28T08:02Z' },
    { id: 'le2', source: 'scheduler', type: 'fitness.run', payload: { activity: 'Running', distance: 4.2, durationMins: 24, pace: '5:42/km' }, recordedAt: '2026-04-26T09:28Z' },
    { id: 'le3', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 58, calories: 390 }, recordedAt: '2026-04-25T08:10Z' },
    { id: 'le4', source: 'scheduler', type: 'fitness.run', payload: { activity: 'Running', distance: 5.1, durationMins: 29, pace: '5:41/km' }, recordedAt: '2026-04-24T07:15Z' },
    { id: 'le5', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 65, calories: 430 }, recordedAt: '2026-04-23T07:05Z' },
    { id: 'le6', source: 'scheduler', type: 'fitness.run', payload: { activity: 'Running', distance: 3.8, durationMins: 22, pace: '5:47/km' }, recordedAt: '2026-04-22T06:40Z' },
    { id: 'le7', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 60, calories: 400 }, recordedAt: '2026-04-21T07:00Z' },
    { id: 'le8', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 55, calories: 370 }, recordedAt: '2026-04-18T07:00Z' },
    { id: 'le9', source: 'scheduler', type: 'fitness.run', payload: { activity: 'Running', distance: 4.5, durationMins: 26, pace: '5:46/km' }, recordedAt: '2026-04-17T06:35Z' },
    { id: 'le10', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 61, calories: 405 }, recordedAt: '2026-04-16T07:00Z' },
    { id: 'le11', source: 'scheduler', type: 'fitness.run', payload: { activity: 'Running', distance: 3.5, durationMins: 21, pace: '6:00/km' }, recordedAt: '2026-04-15T06:45Z' },
    { id: 'le12', source: 'scheduler', type: 'fitness.workout', payload: { activity: 'Gym', durationMins: 57, calories: 385 }, recordedAt: '2026-04-14T07:00Z' },
    { id: 'le20', source: 'journal', type: 'journal.mood', payload: { dayRating: 4, entryId: 'j1' }, recordedAt: '2026-04-28T22:30Z' },
    { id: 'le21', source: 'journal', type: 'journal.mood', payload: { dayRating: 3, entryId: 'j2' }, recordedAt: '2026-04-27T22:15Z' },
    { id: 'le22', source: 'journal', type: 'journal.mood', payload: { dayRating: 5, entryId: 'j3' }, recordedAt: '2026-04-26T21:45Z' },
    { id: 'le23', source: 'journal', type: 'journal.mood', payload: { dayRating: 4, entryId: 'j4' }, recordedAt: '2026-04-25T22:00Z' },
    { id: 'le24', source: 'journal', type: 'journal.mood', payload: { dayRating: 4, entryId: 'j5' }, recordedAt: '2026-04-24T22:10Z' },
    { id: 'le25', source: 'journal', type: 'journal.mood', payload: { dayRating: 3, entryId: 'j6' }, recordedAt: '2026-04-22T21:30Z' },
    { id: 'le26', source: 'journal', type: 'journal.mood', payload: { dayRating: 5, entryId: 'j7' }, recordedAt: '2026-04-20T22:00Z' },
    { id: 'le30', source: 'financial', type: 'financial.transaction', payload: { merchant: 'Whole Foods', amount: -67.40, category: 'Groceries' }, recordedAt: '2026-04-28T18:30Z' },
    { id: 'le31', source: 'financial', type: 'financial.transaction', payload: { merchant: 'Chipotle', amount: -13.50, category: 'Dining Out' }, recordedAt: '2026-04-27T13:00Z' },
    { id: 'le32', source: 'financial', type: 'financial.transaction', payload: { merchant: "Trader Joe's", amount: -52.80, category: 'Groceries' }, recordedAt: '2026-04-24T17:00Z' },
    { id: 'le33', source: 'financial', type: 'financial.transaction', payload: { merchant: 'Pike Place Chowder', amount: -24.00, category: 'Dining Out' }, recordedAt: '2026-04-19T12:30Z' },
    { id: 'le34', source: 'financial', type: 'financial.transaction', payload: { merchant: 'Stripe Inc', amount: 4200.00, category: 'Income' }, recordedAt: '2026-04-20T09:00Z' },
    { id: 'le40', source: 'achievements', type: 'achievement.tier_up', payload: { name: 'Gym 3×/week', tier: 'gold', streak: 6 }, recordedAt: '2026-04-28T20:00Z' },
    { id: 'le41', source: 'achievements', type: 'achievement.tier_up', payload: { name: 'Daily Journaler', tier: 'silver', streak: 14 }, recordedAt: '2026-04-15T22:00Z' },
  ],

  personalBests: [
    { id: 'pb1', lift: 'Bench Press', value: 185, unit: 'lbs', reps: 5, date: '2026-04-28' },
    { id: 'pb2', lift: 'Squat', value: 225, unit: 'lbs', reps: 3, date: '2026-04-25' },
    { id: 'pb3', lift: 'Deadlift', value: 275, unit: 'lbs', reps: 1, date: '2026-04-14' },
    { id: 'pb4', lift: '5K Run', value: 28.0, unit: 'min', reps: null, date: '2026-04-26' },
  ],

  healthLogs: [
    { id: 'hl1',  date: '2026-04-28', weightLbs: 172.4, sleepHours: 7.5, sleepQuality: 4, restingHR: 58 },
    { id: 'hl2',  date: '2026-04-27', weightLbs: 172.8, sleepHours: 6.0, sleepQuality: 3, restingHR: 60 },
    { id: 'hl3',  date: '2026-04-26', weightLbs: 172.2, sleepHours: 8.5, sleepQuality: 5, restingHR: 56 },
    { id: 'hl4',  date: '2026-04-25', weightLbs: 172.6, sleepHours: 7.0, sleepQuality: 4, restingHR: 59 },
    { id: 'hl5',  date: '2026-04-24', weightLbs: 173.0, sleepHours: 7.5, sleepQuality: 4, restingHR: 57 },
    { id: 'hl6',  date: '2026-04-23', weightLbs: 172.8, sleepHours: 6.5, sleepQuality: 3, restingHR: 61 },
    { id: 'hl7',  date: '2026-04-22', weightLbs: 173.4, sleepHours: 5.5, sleepQuality: 2, restingHR: 63 },
    { id: 'hl8',  date: '2026-04-21', weightLbs: 173.2, sleepHours: 7.0, sleepQuality: 4, restingHR: 58 },
    { id: 'hl9',  date: '2026-04-20', weightLbs: 173.6, sleepHours: 8.0, sleepQuality: 5, restingHR: 56 },
    { id: 'hl10', date: '2026-04-19', weightLbs: 174.0, sleepHours: 6.5, sleepQuality: 3, restingHR: 62 },
    { id: 'hl11', date: '2026-04-18', weightLbs: 174.2, sleepHours: 7.5, sleepQuality: 4, restingHR: 59 },
    { id: 'hl12', date: '2026-04-17', weightLbs: 174.0, sleepHours: 7.0, sleepQuality: 3, restingHR: 60 },
    { id: 'hl13', date: '2026-04-16', weightLbs: 174.4, sleepHours: 6.0, sleepQuality: 3, restingHR: 61 },
    { id: 'hl14', date: '2026-04-15', weightLbs: 174.8, sleepHours: 7.5, sleepQuality: 4, restingHR: 58 },
  ],

  mediaLog: [
    { id: 'med1',  type: 'Book',   title: 'The Road',               creator: 'Cormac McCarthy',   status: 'completed', rating: 5, date: '2026-04-25', note: 'Quietly devastating. One of the best.' },
    { id: 'med2',  type: 'Book',   title: 'Piranesi',               creator: 'Susanna Clarke',    status: 'completed', rating: 5, date: '2026-02-12', note: 'Surprisingly beautiful.' },
    { id: 'med3',  type: 'Book',   title: 'Stoner',                 creator: 'John Williams',     status: 'reading',   rating: null, date: '2026-04-25', note: 'Just started. Loving it.' },
    { id: 'med4',  type: 'Book',   title: 'Thinking, Fast and Slow', creator: 'Daniel Kahneman', status: 'want',      rating: null, date: null, note: "Marcus's rec." },
    { id: 'med5',  type: 'Movie',  title: 'Past Lives',             creator: 'Celine Song',       status: 'completed', rating: 5, date: '2026-03-10', note: 'Quietly devastating. 9/10.' },
    { id: 'med6',  type: 'Movie',  title: 'Dune: Part Two',         creator: 'Denis Villeneuve',  status: 'completed', rating: 4, date: '2026-01-22', note: 'IMAX. Worth every penny.' },
    { id: 'med7',  type: 'Movie',  title: 'The Zone of Interest',   creator: 'Jonathan Glazer',   status: 'want',      rating: null, date: null, note: '' },
    { id: 'med8',  type: 'Movie',  title: 'A Real Pain',            creator: 'Jesse Eisenberg',   status: 'want',      rating: null, date: null, note: '' },
    { id: 'med9',  type: 'Album',  title: 'Short n\' Sweet',        creator: 'Sabrina Carpenter', status: 'completed', rating: 4, date: '2026-04-01', note: 'Can\'t stop listening.' },
    { id: 'med10', type: 'Album',  title: 'Radical Optimism',       creator: 'Dua Lipa',          status: 'completed', rating: 3, date: '2026-03-15', note: 'Good but not her best.' },
    { id: 'med11', type: 'Podcast', title: 'Lex Fridman Podcast',   creator: 'Lex Fridman',       status: 'following', rating: 4, date: null, note: 'Hit or miss but high ceiling.' },
    {
      id: 'med12', type: 'Podcast', title: 'How I Built This — Duolingo', creator: 'NPR / Guy Raz',
      status: 'completed', rating: 4, date: '2026-04-20', note: 'Great origin story.',
      fileName: 'how-i-built-this-duolingo.mp3', fileType: 'audio',
      chapters: [
        { id: 'ch1', startTime: 0,    endTime: 180,  label: 'Intro',          tags: ['intro'],                   layer: 0 },
        { id: 'ch2', startTime: 180,  endTime: 540,  label: 'The Idea',       tags: ['storytelling', 'origin'],  layer: 0 },
        { id: 'ch3', startTime: 200,  endTime: 400,  label: 'Dark Retelling', tags: ['dark', 'retelling'],       layer: 1 },
        { id: 'ch4', startTime: 540,  endTime: 900,  label: 'First Users',    tags: ['growth', 'storytelling'],  layer: 0 },
        { id: 'ch5', startTime: 900,  endTime: 1200, label: 'Scaling',        tags: ['growth', 'founder'],       layer: 0 },
      ],
      branches: [
        {
          id: 'br1', time: 185, label: 'Choose your version',
          countdownSecs: 10, defaultOptionId: 'opt1', ratingSort: null,
          options: [
            { id: 'opt1', label: 'Original telling', jumpTo: 185, tags: ['original'], ratings: { up: 8,  down: 2 }, userVote: null },
            { id: 'opt2', label: 'Dark version',     jumpTo: 200, tags: ['dark'],     ratings: { up: 12, down: 5 }, userVote: null },
          ],
        },
      ],
      presets: [
        { id: 'pr1', label: 'Dark & Strange', icon: '🌑', tagFilter: ['dark'],        branchDefaults: { br1: 'highest' } },
        { id: 'pr2', label: 'Original Order', icon: '📖', tagFilter: [],              branchDefaults: { br1: 'opt1'    } },
      ],
      annotations: [
        { id: 'an1', time: 195, title: 'Duolingo origin', note: 'ReCAPTCHA → language learning pivot', link: 'https://duolingo.com', linkType: 'external' },
        { id: 'an2', time: 910, title: 'Growth tactics', note: 'Streak mechanic changed everything', link: '/life/planner', linkType: 'internal' },
      ],
      comments: [
        { id: 'mc1', authorHandle: 'jordan', authorName: 'Jordan Malik', text: 'The streak mechanic insight is directly applicable to our goal system.', time: 912, timestamp: '2026-04-20T14:30:00Z', postedToFeed: false },
        { id: 'mc2', authorHandle: 'marcus', authorName: 'Marcus Webb', text: 'Shared this with my team. Great listen.', time: null, timestamp: '2026-04-21T09:00:00Z', postedToFeed: false },
      ],
      tagComments: [
        { id: 'tc1', tagRef: 'dark', authorHandle: 'jordan', authorName: 'Jordan Malik', text: 'The dark version hits different late night.', timestamp: '2026-04-22T23:00:00Z', postedToFeed: false },
      ],
    },
    {
      id: 'med13', type: 'Album', title: 'Ctrl', creator: 'SZA',
      status: 'completed', rating: 5, date: '2026-03-01', note: 'Perfect album.',
      fileName: 'ctrl-sza.mp3', fileType: 'audio',
      chapters: [
        { id: 'ch6', startTime: 0,   endTime: 214, label: 'Supermodel',       tags: ['intro', 'raw'],      layer: 0 },
        { id: 'ch7', startTime: 214, endTime: 438, label: 'Love Galore',       tags: ['storytelling', 'raw'], layer: 0 },
        { id: 'ch8', startTime: 438, endTime: 660, label: 'Doves in the Wind', tags: ['raw', 'dark'],       layer: 0 },
      ],
      branches: [], presets: [], tagComments: [],
      annotations: [
        { id: 'an3', time: 216, title: 'SZA discography', note: 'Her best lyrical run starts here', link: 'https://open.spotify.com', linkType: 'external' },
      ],
      comments: [],
    },
  ],

  photoAlbums: [
    { id: 'pal1', name: 'Rattlesnake Ledge', emoji: '🏔️', date: '2026-04-13', coverColor: '#1a3a2a' },
    { id: 'pal2', name: 'Green Lake 5K Race', emoji: '🏃', date: '2026-05-10', coverColor: '#1a2a3a' },
    { id: 'pal3', name: 'Portland Trip', emoji: '🌲', date: '2026-05-16', coverColor: '#2a1a3a' },
    { id: 'pal4', name: 'SF Road Trip', emoji: '🌉', date: '2025-11-20', coverColor: '#3a2a1a' },
  ],

  photos: [
    { id: 'pho1', albumId: 'pal1', fileName: null, date: '2026-04-13', note: 'Summit view — Snoqualmie Valley below', tags: ['hiking', 'nature', 'views'], location: 'Rattlesnake Ledge, WA' },
    { id: 'pho2', albumId: 'pal1', fileName: null, date: '2026-04-13', note: 'Old growth trail up to the ledge', tags: ['forest', 'trail'], location: 'North Bend, WA' },
    { id: 'pho3', albumId: 'pal1', fileName: null, date: '2026-04-13', note: 'Rattlesnake Lake from the top', tags: ['lake', 'aerial'], location: 'Rattlesnake Ledge, WA' },
    { id: 'pho4', albumId: 'pal1', fileName: null, date: '2026-04-13', note: 'Group shot at the summit', tags: ['people', 'hiking'], location: 'Rattlesnake Ledge, WA' },
    { id: 'pho5', albumId: 'pal2', fileName: null, date: '2026-05-10', note: 'Race day — starting line', tags: ['running', '5k', 'race'], location: 'Green Lake, Seattle WA' },
    { id: 'pho6', albumId: 'pal2', fileName: null, date: '2026-05-10', note: 'Finish line — sub-30!', tags: ['running', '5k', 'milestone'], location: 'Green Lake, Seattle WA' },
    { id: 'pho7', albumId: 'pal4', fileName: null, date: '2025-11-21', note: 'Golden Gate morning fog', tags: ['travel', 'iconic'], location: 'San Francisco, CA' },
    { id: 'pho8', albumId: 'pal4', fileName: null, date: '2025-11-22', note: 'Mission District tacos 🌮', tags: ['food', 'travel'], location: 'Mission District, SF' },
  ],

  personalMedia: [
    { id: 'prec1', name: 'Idea Dump — Running Podcast', type: 'voice', date: '2026-04-20', durationMins: 3, fileName: null, fileType: 'audio', note: 'Stream of consciousness on a running podcast concept', tags: ['ideas', 'podcast'] },
    { id: 'prec2', name: 'Apartment move-in walk-through', type: 'video', date: '2025-08-01', durationMins: 8, fileName: null, fileType: 'video', note: 'Move-in condition doc for reference / deposit return', tags: ['housing', 'reference'] },
    { id: 'prec3', name: 'Book notes — The Road', type: 'voice', date: '2026-04-25', durationMins: 5, fileName: null, fileType: 'audio', note: 'Verbal notes right after finishing the book', tags: ['books', 'notes', 'mccarthy'] },
    { id: 'prec4', name: 'Rattlesnake trail timelapse', type: 'video', date: '2026-04-13', durationMins: 1, fileName: null, fileType: 'video', note: 'Sped-up version of the trail walk', tags: ['hiking', 'timelapse'] },
  ],

  videoCollections: [
    { id: 'vc1', name: 'Hiking & Outdoors', emoji: '🏔️', date: '2026-04-13', coverColor: '#1a3a2a' },
    { id: 'vc2', name: 'Race Day Clips',    emoji: '🏃', date: '2026-05-10', coverColor: '#1a2a3a' },
    { id: 'vc3', name: 'Random / Misc',    emoji: '📹', date: '2026-03-01', coverColor: '#2a2a1a' },
  ],

  videos: [
    { id: 'vid1', collectionId: 'vc1', fileName: null, fileType: 'video', date: '2026-04-13', note: 'Rattlesnake trail timelapse — 2h in 60s', tags: ['hiking', 'timelapse'], location: 'North Bend, WA', durationSecs: 60 },
    { id: 'vid2', collectionId: 'vc1', fileName: null, fileType: 'video', date: '2026-04-13', note: 'Summit panorama pan', tags: ['hiking', 'nature'], location: 'Rattlesnake Ledge, WA', durationSecs: 45 },
    { id: 'vid3', collectionId: 'vc2', fileName: null, fileType: 'video', date: '2026-05-10', note: 'Starting line energy — crowd shots', tags: ['running', '5k'], location: 'Green Lake, Seattle WA', durationSecs: 30 },
    { id: 'vid4', collectionId: 'vc2', fileName: null, fileType: 'video', date: '2026-05-10', note: 'Finish line — Priya filmed it', tags: ['running', '5k', 'milestone'], location: 'Green Lake, Seattle WA', durationSecs: 20 },
    { id: 'vid5', collectionId: 'vc3', fileName: null, fileType: 'video', date: '2026-03-01', note: 'Desk setup tour — v2', tags: ['setup', 'workspace'], location: null, durationSecs: 90 },
  ],

  skills: [
    { id: 'sk1', name: 'Go (Golang)',         category: 'Programming', level: 3, targetLevel: 5, resources: ['Go by Example', 'The Go Programming Language book'], startedAt: '2026-01-15', note: 'Building ENGINE service. Getting comfortable with goroutines.' },
    { id: 'sk2', name: 'Running — 5K',        category: 'Fitness',     level: 3, targetLevel: 5, resources: ['80/20 Running', 'Garmin HRM'], startedAt: '2026-02-01', note: '4.8km best. Need 0.2km more.' },
    { id: 'sk3', name: 'ActivityPub',         category: 'Tech',        level: 2, targetLevel: 4, resources: ['W3C spec', 'Mastodon docs'], startedAt: '2026-03-10', note: 'HTTP Signatures still fuzzy.' },
    { id: 'sk4', name: 'Photography',         category: 'Creative',    level: 2, targetLevel: 3, resources: ['YouTube: Peter McKinnon'], startedAt: '2025-10-01', note: 'Mostly phone. Want to learn manual settings.' },
    { id: 'sk5', name: 'Spanish',             category: 'Language',    level: 1, targetLevel: 4, resources: ['Duolingo', 'Language Transfer'], startedAt: '2025-06-01', note: 'On and off. Need consistency.' },
  ],

  trips: [
    {
      id: 'tr1', name: 'Portland Weekend', status: 'upcoming', startDate: '2026-05-16', endDate: '2026-05-18',
      destination: 'Portland, OR', emoji: '🌲',
      notes: "Powell's Books is non-negotiable. Check out Tasty n Daughters for brunch. Voodoo Doughnut is touristy but whatever.",
      packing: [
        { id: 'tr1-p1', item: 'Running shoes', packed: false },
        { id: 'tr1-p2', item: 'Camera', packed: false },
        { id: 'tr1-p3', item: 'Rain jacket', packed: false },
        { id: 'tr1-p4', item: 'Portable charger', packed: true },
      ],
      companions: ['c2'],
    },
    {
      id: 'tr2', name: 'SF Road Trip', status: 'completed', startDate: '2025-11-20', endDate: '2025-11-25',
      destination: 'San Francisco, CA', emoji: '🌉',
      notes: "Road trip with Maya. Golden Gate, Mission District tacos, Dolores Park. Drove the whole PCH stretch on the way back.",
      packing: [],
      companions: ['c1'],
    },
    {
      id: 'tr3', name: 'Mount Rainier Day Hike', status: 'completed', startDate: '2025-09-06', endDate: '2025-09-06',
      destination: 'Mount Rainier NP, WA', emoji: '🏔️',
      notes: "Paradise Visitor Center trailhead. About 9 miles round trip. Snow in September — not expected. Wildflowers were peak.",
      packing: [],
      companions: [],
    },
    {
      id: 'tr4', name: 'Olympic National Park', status: 'planned', startDate: null, endDate: null,
      destination: 'Olympic Peninsula, WA', emoji: '🌿',
      notes: "Hoh Rainforest + Rialto Beach. 2-night backpack if possible. Book permits early.",
      packing: [
        { id: 'tr4-p1', item: 'Backpacking tent', packed: false },
        { id: 'tr4-p2', item: 'Bear canister', packed: false },
        { id: 'tr4-p3', item: 'Water filter', packed: false },
      ],
      companions: [],
    },
  ],

  research: [
    {
      id: 're1', title: 'ActivityPub Federation Protocol', status: 'active', tags: ['Tech', 'nTogether'],
      createdAt: '2026-04-10',
      summary: 'Decentralized social protocol used by Mastodon, Pixelfed, etc. Key concepts: Actors, Inboxes, Outboxes, Follow/Accept activities, HTTP Signatures for verification.',
      sources: [
        { id: 're1-s1', label: 'ActivityPub W3C Spec', url: 'https://www.w3.org/TR/activitypub/', note: 'Official spec — dense but authoritative' },
        { id: 're1-s2', label: 'Mastodon ActivityPub docs', url: 'https://docs.joinmastodon.org/spec/activitypub/', note: 'Practical implementation notes' },
      ],
      notes: "HTTP Signatures are the tricky part. Every POST to an inbox must be signed with the sender's private key. The receiver verifies using the public key from the sender's Actor JSON. WebFinger is how you map acct:user@domain to the Actor URL.",
    },
    {
      id: 're2', title: 'Running Form & Injury Prevention', status: 'active', tags: ['Fitness', 'Health'],
      createdAt: '2026-04-20',
      summary: 'Research on improving 5K time and avoiding common running injuries. Focus: cadence, foot strike, hip extension, and build rate.',
      sources: [
        { id: 're2-s1', label: '80/20 Running — Matt Fitzgerald', url: '', note: 'Most training should be easy. Only 20% hard.' },
        { id: 're2-s2', label: 'Garmin Running Dynamics', url: '', note: 'Cadence target: 170-180 spm. Ground contact time under 250ms.' },
      ],
      notes: "Key finding: I've been running too hard on easy days. Slowing down actually improves aerobic base faster. The 10% rule: never increase weekly mileage by more than 10% per week.",
    },
    {
      id: 're3', title: 'SQLite vs PostgreSQL for Local-First Apps', status: 'completed', tags: ['Tech', 'Architecture'],
      createdAt: '2026-03-01',
      summary: 'Comparing database options for the nTogether native apps. Local-first architecture requires offline support.',
      sources: [
        { id: 're3-s1', label: 'cr-sqlite — Losfair', url: 'https://github.com/losfair/cr-sqlite', note: 'SQLite with CRDTs for sync — very promising' },
        { id: 're3-s2', label: 'Electric SQL', url: 'https://electric-sql.com/', note: 'Postgres → SQLite sync layer. Production-ready.' },
      ],
      notes: "Decision: SQLite for native (desktop + mobile) because it's embedded, fast, zero-config, and battle-tested. PostgreSQL for server-side. Sync via Electric SQL or custom CRDT layer in phase 2.",
    },
    {
      id: 're4', title: 'Intermittent Fasting & Muscle Preservation', status: 'paused', tags: ['Health', 'Diet'],
      createdAt: '2026-04-05',
      summary: 'Investigating whether IF protocols are compatible with muscle building goals given current training load.',
      sources: [
        { id: 're4-s1', label: 'Examine.com — IF overview', url: '', note: 'Balanced review of evidence. TRE shows modest benefits.' },
      ],
      notes: "Paused because current calorie and protein targets are hard enough to hit in a full eating window. Revisit when cutting phase starts.",
    },
  ],

  posthumous: {
    unlockCondition: 'inactivity_90_days',
    unlockContacts: ['c6', 'c2'],
    messages: [
      {
        id: 'pm1', title: 'For Sofia', recipient: 'Sofia Reyes', type: 'Letter', status: 'sealed',
        createdAt: '2026-03-15',
        content: "Hey Sofie. If you're reading this, something happened. I wanted you to know that our calls meant more to me than I ever said. You're the funniest person in the family and I'm proud of who you've become. The books on my shelf — take whatever you want. The Cormac McCarthy ones especially. Love you.",
      },
      {
        id: 'pm2', title: 'Account Access Instructions', recipient: 'All', type: 'Instructions', status: 'sealed',
        createdAt: '2026-02-01',
        content: "Passwords are in 1Password. The master password is in the envelope in the bottom desk drawer. Bank: Chase checking + savings. Brokerage: Fidelity, login is my email. Crypto: hardware wallet is in the desk, seed phrase is split — half in the desk, half with mom. GitHub: deactivate, don't delete. nTogether: export data first.",
      },
      {
        id: 'pm3', title: 'For Priya', recipient: 'Priya Sharma', type: 'Letter', status: 'sealed',
        createdAt: '2026-04-01',
        content: "Priya — you pushed me to run farther than I thought I could. I hope you beat my 5K time. The running shoes are yours if they fit. Keep dragging people outside.",
      },
    ],
    assetNotes: "Laptop + monitors: sell or give to Marcus. Books: Sofia and James get first pick. Remaining savings: split between Sofia and a local literacy nonprofit. Car: sell, proceeds to Sofia.",
    lastReviewed: '2026-04-01',
  },

  agreements: [
    {
      id: 'ag1', title: 'Freelance Web Dev — Ava Torres', type: 'Contract', status: 'active',
      parties: ['Jordan Malik', 'Ava Torres (Agency)'],
      date: '2026-03-01', expiryDate: '2026-06-30',
      value: '$4,200/month', terms: 'Monthly retainer for dashboard development. 40 hrs/month. Invoiced on the 1st. 30-day termination notice required.',
      tags: ['Work', 'Retainer'], signed: true,
    },
    {
      id: 'ag2', title: 'Green Lake 5K Bet — Priya', type: 'Personal Bet', status: 'active',
      parties: ['Jordan Malik', 'Priya Sharma'],
      date: '2026-04-01', expiryDate: '2026-06-15',
      value: 'Loser buys dinner at Paseo', terms: 'First to run a sub-30 min 5K by June 15th wins. Tracked via running app. Must be an official run, no treadmill.',
      tags: ['Fitness', 'Fun'], signed: false,
    },
    {
      id: 'ag3', title: 'Book Club — Monthly Commitment', type: 'Commitment', status: 'active',
      parties: ['Jordan Malik', 'James Okafor', 'Marcus Webb', 'Rachel Ortega'],
      date: '2026-01-01', expiryDate: null,
      value: null, terms: 'Read one book per month. Attend monthly meetup (last Sunday). Host rotates alphabetically. Missing 2 months = you pick the next 2 books.',
      tags: ['Social', 'Books'], signed: false,
    },
    {
      id: 'ag4', title: 'Apartment Lease', type: 'Lease', status: 'active',
      parties: ['Jordan Malik', 'Greenwood Property Mgmt'],
      date: '2025-08-01', expiryDate: '2026-07-31',
      value: '$2,150/month', terms: 'Month-to-month after initial term. 60-day notice to vacate. No subletting without written consent. Renters insurance required.',
      tags: ['Housing'], signed: true,
    },
    {
      id: 'ag5', title: 'Shared Expenses — Maya Road Trip', type: 'Split Agreement', status: 'completed',
      parties: ['Jordan Malik', 'Maya Chen'],
      date: '2025-11-20', expiryDate: '2025-11-25',
      value: 'Even split on gas/hotels', terms: 'Portland to SF road trip. Gas, hotels, and tolls split 50/50. Food is individual. Settle up via Venmo at the end.',
      tags: ['Travel', 'Friend'], signed: false,
    },
  ],

  lists: [
    {
      id: 'li1', name: 'Books to Read', emoji: '📚', type: 'Checklist',
      items: [
        { id: 'li1-1', text: 'Stoner — John Williams', done: false, note: '' },
        { id: 'li1-2', text: 'Blood Meridian — Cormac McCarthy', done: false, note: '' },
        { id: 'li1-3', text: 'Thinking, Fast and Slow — Kahneman', done: false, note: "Marcus's rec" },
        { id: 'li1-4', text: 'The Road — Cormac McCarthy', done: true, note: 'Finished Apr 25' },
        { id: 'li1-5', text: 'Piranesi — Susanna Clarke', done: true, note: 'Finished Feb 12' },
      ],
    },
    {
      id: 'li2', name: 'Places to Visit', emoji: '🗺️', type: 'Checklist',
      items: [
        { id: 'li2-1', text: 'Olympic National Park', done: false, note: 'Rain forest + coast' },
        { id: 'li2-2', text: 'Portland weekend trip', done: false, note: "Powell's Books is a must" },
        { id: 'li2-3', text: 'San Juan Islands', done: false, note: 'Ferry trip with Maya' },
        { id: 'li2-4', text: 'Mount Rainier day hike', done: true, note: 'Completed Sept 2025' },
      ],
    },
    {
      id: 'li3', name: 'Grocery List', emoji: '🛒', type: 'Shopping',
      items: [
        { id: 'li3-1', text: 'Greek yogurt (×4)', done: false, note: '' },
        { id: 'li3-2', text: 'Chicken breast (2 lbs)', done: false, note: '' },
        { id: 'li3-3', text: 'Oats', done: true, note: '' },
        { id: 'li3-4', text: 'Spinach', done: false, note: '' },
        { id: 'li3-5', text: 'Salmon (×2 fillets)', done: false, note: '' },
        { id: 'li3-6', text: 'Almonds', done: true, note: '' },
      ],
    },
    {
      id: 'li4', name: 'Movies to Watch', emoji: '🎬', type: 'Checklist',
      items: [
        { id: 'li4-1', text: 'The Zone of Interest', done: false, note: '' },
        { id: 'li4-2', text: 'Past Lives', done: true, note: 'Quietly devastating. 9/10.' },
        { id: 'li4-3', text: 'A Real Pain', done: false, note: '' },
        { id: 'li4-4', text: 'Dune: Part Two', done: true, note: 'IMAX. Worth it.' },
      ],
    },
    {
      id: 'li5', name: 'Home Projects', emoji: '🏠', type: 'Todo',
      items: [
        { id: 'li5-1', text: 'Deep clean kitchen', done: false, note: 'This weekend' },
        { id: 'li5-2', text: 'Organise bookshelf', done: true, note: '' },
        { id: 'li5-3', text: 'Fix desk cable management', done: false, note: '' },
        { id: 'li5-4', text: 'New running shoes', done: false, note: 'Current ones at 450 miles' },
      ],
    },
    {
      id: 'li6', name: 'All-Time Albums', emoji: '🎵', type: 'Tier', mode: 'tier',
      template: 'blank', description: 'My definitive album rankings',
      tiers: [
        { label: 'S', color: '#ef4444' }, { label: 'A', color: '#f97316' },
        { label: 'B', color: '#eab308' }, { label: 'C', color: '#22c55e' }, { label: 'D', color: '#3b82f6' },
      ],
      items: [
        { id: 'tli1', text: 'OK Computer',                     done: false, note: '', tier: 'S' },
        { id: 'tli2', text: 'Nevermind',                       done: false, note: '', tier: 'S' },
        { id: 'tli3', text: 'The Miseducation of Lauryn Hill', done: false, note: '', tier: 'A' },
        { id: 'tli4', text: 'Illmatic',                        done: false, note: '', tier: 'A' },
        { id: 'tli5', text: 'Purple Rain',                     done: false, note: '', tier: 'B' },
        { id: 'tli6', text: 'The Chronic',                     done: false, note: '', tier: 'B' },
        { id: 'tli7', text: 'Weezer (Blue Album)',             done: false, note: '', tier: 'C' },
        { id: 'tli8', text: 'Dummy — Portishead',              done: false, note: '', tier: null },
      ],
    },
    {
      id: 'li7', name: 'Household Needs', emoji: '🏠', type: 'Household', mode: 'household', template: 'household',
      description: 'Track home essentials by category',
      items: [
        { id: 'lih1', text: 'Greek yogurt (×4)',        done: false, note: '', category: 'Groceries',  urgency: 'Need Soon',   estCost: null,  recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih2', text: 'Eggs (×12)',               done: false, note: '', category: 'Groceries',  urgency: 'Need Soon',   estCost: null,  recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih3', text: 'Whole grain bread',        done: true,  note: '', category: 'Groceries',  urgency: 'Need Soon',   estCost: null,  recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih4', text: 'Chicken breast (2 lbs)',   done: false, note: '', category: 'Groceries',  urgency: 'Need Soon',   estCost: null,  recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih5', text: 'Spinach',                  done: false, note: '', category: 'Groceries',  urgency: 'Need Soon',   estCost: null,  recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih6', text: 'Paper towels',             done: false, note: '', category: 'Supplies',   urgency: 'Need Soon',   estCost: 8,     recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih7', text: 'Dish soap',                done: true,  note: '', category: 'Supplies',   urgency: 'Need Soon',   estCost: 4,     recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih8', text: 'Laundry detergent',        done: false, note: '', category: 'Supplies',   urgency: 'Eventually',  estCost: 14,    recurring: true,  recurringPeriod: 'monthly', assignedTo: null },
        { id: 'lih9', text: 'Trash bags',               done: false, note: '', category: 'Supplies',   urgency: 'Eventually',  estCost: 10,    recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih10', text: 'Fix leaky faucet',        done: false, note: 'Guest bathroom sink', category: 'Repair', urgency: 'Need Soon', estCost: 150, recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih11', text: 'Replace shower head',     done: false, note: '',  category: 'Replace',   urgency: 'Eventually',  estCost: 40,    recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih12', text: 'Change HVAC filter',      done: false, note: '',  category: 'Maintain',  urgency: 'Ongoing',     estCost: 18,    recurring: true,  recurringPeriod: 'monthly', assignedTo: null },
        { id: 'lih13', text: 'Clean gutters',           done: false, note: 'Spring + Fall', category: 'Maintain', urgency: 'Ongoing', estCost: 0, recurring: true, recurringPeriod: 'quarterly', assignedTo: null },
        { id: 'lih14', text: 'New desk lamp',           done: false, note: '',  category: 'Wants',     urgency: 'Eventually',  estCost: 35,    recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih15', text: 'Couch throw blanket',     done: false, note: '',  category: 'Wants',     urgency: 'Eventually',  estCost: 25,    recurring: false, recurringPeriod: null, assignedTo: null },
        { id: 'lih16', text: 'New mattress',            done: false, note: 'Current one is 8 years old', category: 'Needs', urgency: 'Eventually', estCost: 800, recurring: false, recurringPeriod: null, assignedTo: null },
      ],
    },
  ],

  places: [
    { id: 'pl1',  name: 'Third Place Books',      category: 'Books',     address: '6504 20th Ave NE, Seattle', rating: 5, tags: ['Local', 'Cozy'], note: 'Best indie bookstore in the city. Great events.', friendsOnStaff: [], friendsFrequent: ['c7', 'c10'] },
    { id: 'pl2',  name: 'Pike Place Chowder',     category: 'Food',      address: '1530 Post Alley, Seattle',  rating: 5, tags: ['Landmark', 'Seafood'], note: 'Sourdough bread bowl is mandatory.', friendsOnStaff: [], friendsFrequent: ['c2'] },
    { id: 'pl3',  name: 'Victrola Coffee',        category: 'Coffee',    address: '310 E Pike St, Seattle',    rating: 4, tags: ['Work-friendly', 'Local'], note: 'Great pour-overs. Good for deep work.', friendsOnStaff: [], friendsFrequent: ['c3', 'c1'] },
    { id: 'pl4',  name: 'Green Lake Park',        category: 'Parks',     address: 'Green Lake, Seattle',       rating: 5, tags: ['Running', 'Outdoors'], note: '5K loop around the lake. Perfect for runs.', friendsOnStaff: [], friendsFrequent: ['c2', 'c1'] },
    { id: 'pl5',  name: 'Planet Fitness',         category: 'Fitness',   address: '4535 University Way NE',    rating: 3, tags: ['Gym', 'Budget'], note: 'Reliable. Gets the job done.', friendsOnStaff: [], friendsFrequent: [] },
    { id: 'pl6',  name: 'Canon',                  category: 'Bars',      address: '928 12th Ave, Seattle',     rating: 5, tags: ['Whiskey', 'Upscale'], note: 'Ridiculous whiskey selection. Special occasions.', friendsOnStaff: [], friendsFrequent: ['c3'] },
    { id: 'pl7',  name: 'Lighthouse Roasters',    category: 'Coffee',    address: '400 N 43rd St, Seattle',    rating: 4, tags: ['Local', 'Roastery'], note: 'Roasts on site. The light roast is incredible.', friendsOnStaff: [], friendsFrequent: [] },
    { id: 'pl8',  name: 'Paseo Caribbean Food',   category: 'Food',      address: '4225 Fremont Ave N',        rating: 5, tags: ['Caribbean', 'Sandwich'], note: 'The Cuban roast sandwich. Always a line. Worth it.', friendsOnStaff: [], friendsFrequent: ['c2', 'c7'] },
    { id: 'pl9',  name: 'REI Co-op Flagship',     category: 'Shopping',  address: '222 Yale Ave N, Seattle',   rating: 4, tags: ['Outdoors', 'Gear'], note: 'The flagship is massive. Good for gear research.', friendsOnStaff: [], friendsFrequent: [] },
    { id: 'pl10', name: 'Volunteer Park',         category: 'Parks',     address: '1247 15th Ave E, Seattle',  rating: 4, tags: ['Outdoors', 'Views'], note: 'Water tower has a great city view.', friendsOnStaff: [], friendsFrequent: ['c1'] },
    { id: 'pl11', name: 'Fremont Brewing',        category: 'Bars',      address: '1050 N 34th St, Seattle',   rating: 4, tags: ['Craft Beer', 'Dog-friendly'], note: 'Good vibes, dog-friendly urban beer garden.', friendsOnStaff: [], friendsFrequent: ['c3', 'c8'] },
    { id: 'pl12', name: 'Uwajimaya',              category: 'Food',      address: '600 5th Ave S, Seattle',    rating: 5, tags: ['Asian Market', 'Grocery'], note: 'Best Asian grocery in the PNW. Food court too.', friendsOnStaff: [], friendsFrequent: [] },
  ],

  savedPlaces: ['pl1', 'pl2', 'pl4', 'pl8'],

  checkins: [
    { id: 'ci1', placeId: 'pl2', date: '2026-04-20', note: 'Lunch with Priya after the Sunday run. Clam chowder ×2.' },
    { id: 'ci2', placeId: 'pl1', date: '2026-04-24', note: 'Picked up Stoner by John Williams.' },
    { id: 'ci3', placeId: 'pl4', date: '2026-04-26', note: 'Long run — 4.8km. New distance PB.' },
    { id: 'ci4', placeId: 'pl3', date: '2026-04-27', note: 'Deep work session. Two pour-overs deep.' },
    { id: 'ci5', placeId: 'pl5', date: '2026-04-28', note: 'Gym. PR on bench — 185lbs × 5.' },
  ],

  contacts: [
    { id: 'c1',  name: 'Maya Chen',    handle: 'maya',   email: 'maya@ntogether.app',   phone: '206-555-0101', tags: ['Friend', 'Music'],   note: 'Released her EP in April. Loves jazz and hiking.', lastContact: '2026-04-29', profession: 'Musician & Photographer', company: 'Independent', location: 'Seattle, WA', met_at: 'SF Road Trip, Nov 2025', when_met: '11/14/2025', mutual_friends: 'Priya Sharma', talked: 'Music production, travel photography, hiking trails', social_handles: [{ platform: 'Instagram', handle: 'maya.creates' }, { platform: 'Twitter/X', handle: 'mayachen' }], personal_links: [{ label: 'EP on Bandcamp', url: 'https://bandcamp.com' }], contact_methods: ['Instagram DM', 'Text'], birthday: '09/15', collaborations: [{ type: "We're Both Into", text: 'Jazz and experimental music' }, { type: 'Project / Idea / Business', text: 'Podcast episode on creative process' }], followup_date: '', flagged: false },
    { id: 'c2',  name: 'Priya Sharma', handle: 'priya',  email: 'priya@ntogether.app',  phone: '206-555-0102', tags: ['Friend', 'Running'], note: 'Running buddy. Green Lake 5K next weekend.', lastContact: '2026-04-29', profession: 'Architect', company: 'Studio Norte', location: 'Seattle, WA', met_at: 'Green Lake Running Group, 2025', when_met: '01/05/2025', mutual_friends: 'Marcus Webb, Maya Chen', talked: 'Running form, architecture projects, travel plans', social_handles: [{ platform: 'Instagram', handle: 'priyaruns' }], personal_links: [], contact_methods: ['Text', 'WhatsApp'], birthday: '03/22', collaborations: [{ type: 'We Should...', text: 'Co-register for the half marathon in October' }], followup_date: '2026-05-17', flagged: false },
    { id: 'c3',  name: 'Marcus Webb',  handle: 'marcus', email: 'marcus@ntogether.app', phone: '206-555-0103', tags: ['Friend', 'Tech'],    note: 'Engineer at Stripe. Great book recs.', lastContact: '2026-04-28', profession: 'Software Engineer', company: 'Stripe', location: 'Seattle, WA', met_at: 'Tech meetup, Capitol Hill 2024', when_met: '09/18/2024', mutual_friends: 'Lily Nguyen', talked: 'Distributed systems, books, side project ideas', social_handles: [{ platform: 'GitHub', handle: 'marcuswebb' }, { platform: 'LinkedIn', handle: 'marcuswebb' }], personal_links: [{ label: 'Personal site', url: 'https://marcuswebb.dev' }], contact_methods: ['Email', 'LinkedIn'], birthday: '07/04', collaborations: [{ type: 'Discussions / Podcast Episodes', text: 'Distributed systems and privacy tech' }, { type: 'Project / Idea / Business', text: 'Open source privacy tool idea' }], followup_date: '', flagged: false },
    { id: 'c4',  name: 'Ava Torres',   handle: null,     email: 'ava.torres@gmail.com', phone: '206-555-0104', tags: ['Work'],              note: 'PM at the agency. Follow up on Q3 proposal.', lastContact: '2026-04-22', profession: 'Product Manager', company: 'Creative Collective', location: 'San Francisco, CA', met_at: 'Product conference, 2025', when_met: '03/12/2025', mutual_friends: '', talked: 'Q3 dashboard scope, product strategy, hiring', social_handles: [{ platform: 'LinkedIn', handle: 'avatorres-pm' }], personal_links: [], contact_methods: ['Email', 'LinkedIn'], birthday: '', collaborations: [{ type: 'Hire / Employ / Get Help With', text: 'Q3 dashboard UX contract' }], followup_date: '2026-05-01', flagged: false },
    { id: 'c5',  name: 'Daniel Kim',     handle: null,     email: 'dkim@agency.io',       phone: '206-555-0105', tags: ['Work', 'Design'],        note: 'Designer on the dashboard project.', lastContact: '2026-04-20' },
    { id: 'c6',  name: 'Sofia Reyes',    handle: null,     email: 'sofia.r@outlook.com',  phone: '206-555-0106', tags: ['Family'],                note: 'Cousin. Call more often.', lastContact: '2026-04-10' },
    { id: 'c7',  name: 'James Okafor',   handle: null,     email: 'james.o@gmail.com',    phone: '206-555-0107', tags: ['Friend', 'Books'],       note: 'Book club organizer. Stoner is up next.', lastContact: '2026-04-18' },
    { id: 'c8',  name: 'Lily Nguyen',    handle: null,     email: 'lily.n@startup.co',    phone: '206-555-0108', tags: ['Work', 'Networking'],   note: 'Met at the React conf. Potential collab.', lastContact: '2026-04-05' },
    { id: 'c9',  name: 'Tom Braddock',   handle: null,     email: 'tom@braddock.me',      phone: '206-555-0109', tags: ['Networking'],           note: 'Angel investor. Interesting perspective on privacy tech.', lastContact: '2026-03-28' },
    { id: 'c10', name: 'Rachel Ortega',  handle: null,     email: 'rachel.o@gmail.com',   phone: '206-555-0110', tags: ['Friend'],               note: 'Old college friend. Coffee overdue.', lastContact: '2026-03-15' },
  ],

  groups: [
    { id: 'gr1', name: 'Running Crew',      emoji: '🏃', members: ['c2', 'c1', 'c7'], description: 'Saturday morning runs at Green Lake. All paces welcome.', type: 'Social' },
    { id: 'gr2', name: 'Book Club',         emoji: '📚', members: ['c7', 'c3', 'c10'], description: 'Monthly meetup. Currently reading Stoner by John Williams.', type: 'Interest' },
    { id: 'gr3', name: 'Work Team',         emoji: '💼', members: ['c4', 'c5', 'c8'], description: 'Agency project crew. Q3 dashboard deliverable.', type: 'Work' },
    { id: 'gr4', name: 'Tech Friends',      emoji: '💻', members: ['c3', 'c8', 'c9'], description: 'Engineers, founders, and builders in Seattle.', type: 'Networking' },
    { id: 'gr5', name: 'Family',            emoji: '🏠', members: ['c6'], description: 'Keep in touch with family.', type: 'Family' },
  ],

  contactCustomFields: [],
  contactReminders: [],

  mailingLists: [
    {
      id: 'mlist1',
      name: 'Hip-Hop Night',
      description: "Tell us who you are and we'll get you linked up.",
      shareSlug: 'hip-hop-night',
      createdAt: '2026-05-01',
      active: true,
      fields: {
        email: { enabled: true, required: true },
        phone: { enabled: true, required: true },
        zip:   { enabled: true, required: true },
        preferredContact: { enabled: false, required: false },
        customQuestion:   { enabled: false, required: false, label: '' },
      },
      roles: [
        {
          id: 'role-1', emoji: '🎤', label: 'Rapper', subtitle: 'Artist / MC',
          questions: [
            { id: 'rq-1',  type: 'multicheck', label: 'Genre / Style',   options: ['Trap','Boom Bap / Classic','Drill','Conscious / Lyrical','Melodic Rap','Cloud Rap','Freestyle / Battle Rap'], allowOther: true },
            { id: 'rq-2',  type: 'radio',      label: 'Years Active',    options: ['Just starting out','1–2 years','3–5 years','5–10 years','10+ years'] },
            { id: 'rq-3',  type: 'toggles',    label: 'Availability',    options: ['Looking for beats / producers','Open to features / collabs','Currently signed to a label'] },
            { id: 'rq-4',  type: 'url',        label: 'Social / Streaming Link' },
            { id: 'rq-5',  type: 'textarea',   label: "Anything else you'd like us to know?" },
          ],
        },
        {
          id: 'role-2', emoji: '🎛️', label: 'Producer', subtitle: 'Beatmaker / Composer',
          questions: [
            { id: 'rq-6',  type: 'radio',      label: 'Primary DAW',        options: ['FL Studio','Ableton Live','Logic Pro','Pro Tools','GarageBand','Studio One','Reason','Other / Hardware Only'] },
            { id: 'rq-7',  type: 'multicheck', label: 'Genres You Produce', options: ['Trap','Drill','Boom Bap','R&B / Soul','Pop','Afrobeats','Lo-Fi','Other'] },
            { id: 'rq-8',  type: 'toggles',    label: 'Availability',       options: ['Selling beats online','Open to artist collabs','Available for studio sessions'] },
            { id: 'rq-9',  type: 'url',        label: 'Beat Store / Portfolio Link' },
            { id: 'rq-10', type: 'textarea',   label: 'Notable work or projects' },
          ],
        },
        {
          id: 'role-3', emoji: '🎧', label: 'DJ', subtitle: 'Selector / Mixer',
          questions: [
            { id: 'rq-11', type: 'multicheck', label: 'Genres You Spin',          options: ['Hip-Hop','House','EDM / Dance','R&B / Soul','Reggae / Dancehall','Afrobeats','Latin','Multi-genre'] },
            { id: 'rq-12', type: 'radio',      label: 'Typical Venue / Setting',  options: ['Clubs & Nightlife','Private Events / Weddings','Radio / Podcast','Festivals & Large Venues','Online Streams Only','All of the above'] },
            { id: 'rq-13', type: 'toggles',    label: 'Availability',             options: ['Available for bookings','Open to label / agency representation'] },
            { id: 'rq-14', type: 'url',        label: 'Mix / Set Link' },
            { id: 'rq-15', type: 'textarea',   label: 'Booking inquiries or notes' },
          ],
        },
        {
          id: 'role-4', emoji: '🙌', label: 'Fan', subtitle: 'Supporter / Listener',
          questions: [
            { id: 'rq-16', type: 'multicheck', label: 'Favorite Genres',                  options: ['Trap','Drill','Boom Bap','R&B','Pop Rap','Alt / Indie','Afrobeats','Everything'] },
            { id: 'rq-17', type: 'text',       label: 'Favorite Artists' },
            { id: 'rq-18', type: 'multicheck', label: "What are you most interested in?", options: ['Concerts','Merch','Industry News','New Releases','Exclusives','Meet & Greets'] },
            { id: 'rq-19', type: 'toggles',    label: '',                                 options: ['Sign me up for the newsletter','Notify me about local events'], defaults: ['Sign me up for the newsletter'] },
            { id: 'rq-20', type: 'textarea',   label: "Anything you'd like to say?" },
          ],
        },
      ],
      entries: [
        { id: 'mle1', contactId: null, submittedAt: '2026-05-10T14:30Z',
          data: { name: 'DJ Quake', email: 'quake@example.com', phone: '206-555-0142', zip: '98101',
            roles: ['DJ'], roleData: { DJ: { 'rq-11': ['Hip-Hop','R&B / Soul'], 'rq-12': 'Clubs & Nightlife', 'rq-13': ['Available for bookings'], 'rq-14': 'https://soundcloud.com/djquake', 'rq-15': '' } } } },
        { id: 'mle2', contactId: 'c2', submittedAt: '2026-05-08T10:15Z',
          data: { name: 'Priya Sharma', email: 'priya@example.com', phone: '206-555-0198', zip: '98103',
            roles: ['Fan'], roleData: { Fan: { 'rq-16': ['Hip-Hop','R&B'], 'rq-17': 'Kendrick, SZA, J. Cole', 'rq-18': ['Concerts','New Releases'], 'rq-19': ['Sign me up for the newsletter'], 'rq-20': '' } } } },
      ],
      memberContactIds: ['c1', 'c2'],
    },
  ],

  mealLogs: [
    { id: 'ml1',  date: '2026-04-28', meal: 'Breakfast', name: 'Oatmeal + banana', calories: 380, protein: 12, carbs: 68, fat: 6 },
    { id: 'ml2',  date: '2026-04-28', meal: 'Lunch',     name: 'Grilled chicken salad', calories: 520, protein: 42, carbs: 22, fat: 18 },
    { id: 'ml3',  date: '2026-04-28', meal: 'Dinner',    name: 'Salmon + roasted veg', calories: 680, protein: 48, carbs: 34, fat: 28 },
    { id: 'ml4',  date: '2026-04-28', meal: 'Snack',     name: 'Greek yogurt', calories: 120, protein: 15, carbs: 10, fat: 2 },
    { id: 'ml5',  date: '2026-04-27', meal: 'Breakfast', name: 'Eggs & toast', calories: 420, protein: 22, carbs: 38, fat: 16 },
    { id: 'ml6',  date: '2026-04-27', meal: 'Lunch',     name: 'Chipotle bowl', calories: 740, protein: 38, carbs: 82, fat: 22 },
    { id: 'ml7',  date: '2026-04-27', meal: 'Dinner',    name: 'Pasta with meat sauce', calories: 780, protein: 36, carbs: 94, fat: 24 },
    { id: 'ml8',  date: '2026-04-26', meal: 'Breakfast', name: 'Protein shake + apple', calories: 290, protein: 28, carbs: 32, fat: 4 },
    { id: 'ml9',  date: '2026-04-26', meal: 'Lunch',     name: 'Turkey sandwich', calories: 480, protein: 32, carbs: 52, fat: 12 },
    { id: 'ml10', date: '2026-04-26', meal: 'Dinner',    name: 'Stir fry with rice', calories: 620, protein: 34, carbs: 72, fat: 16 },
    { id: 'ml11', date: '2026-04-25', meal: 'Breakfast', name: 'Oatmeal + blueberries', calories: 340, protein: 10, carbs: 62, fat: 5 },
    { id: 'ml12', date: '2026-04-25', meal: 'Lunch',     name: 'Leftover stir fry', calories: 580, protein: 30, carbs: 66, fat: 15 },
    { id: 'ml13', date: '2026-04-25', meal: 'Dinner',    name: 'Burger + sweet potato fries', calories: 860, protein: 42, carbs: 88, fat: 34 },
    { id: 'ml14', date: '2026-04-24', meal: 'Breakfast', name: 'Eggs & avocado toast', calories: 480, protein: 20, carbs: 36, fat: 26 },
    { id: 'ml15', date: '2026-04-24', meal: 'Lunch',     name: 'Caesar salad + chicken', calories: 560, protein: 44, carbs: 28, fat: 24 },
    { id: 'ml16', date: '2026-04-24', meal: 'Dinner',    name: 'Tacos (×3)', calories: 720, protein: 38, carbs: 74, fat: 26 },
    { id: 'ml17', date: '2026-04-24', meal: 'Snack',     name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14 },
  ],

  achievements: [
    { id: 'a1', name: 'Gym 3×/week', tier: 'gold', streak: 6, goalId: 'g2', credits: 180, badge: '🥇' },
    { id: 'a2', name: 'Daily Journaler', tier: 'silver', streak: 23, credits: 69, badge: '🥈' },
    { id: 'a3', name: 'Budget week', tier: 'silver', streak: 3, goalId: 'g4', credits: 45, badge: '🥈' },
    { id: 'a4', name: '5K Training', tier: 'bronze', streak: 4, goalId: 'g1', credits: 20, badge: '🥉' },
    { id: 'a5', name: 'Running Streak', tier: 'bronze', streak: 4, goalId: 'g1', credits: 20, badge: '🥉' },
    { id: 'a6', name: 'Bookworm', tier: 'bronze', streak: 0, goalId: 'g3', credits: 15, badge: '📚' },
    { id: 'a7', name: 'Early Riser', tier: 'bronze', streak: 8, credits: 24, badge: '🌅', description: '8 workouts before 8am' },
  ],

  plans: [
    {
      id: 'plan1', goalId: 'g1', name: 'Run a 5K — Training Plan', createdAt: '2026-04-01',
      taskGroups: [
        { id: 'tg1-1', name: 'Base Building' },
        { id: 'tg1-2', name: 'Race Prep' },
      ],
    },
    {
      id: 'plan2', goalId: 'g2', name: 'Gym 3×/Week — Programme', createdAt: '2026-04-01',
      taskGroups: [
        { id: 'tg2-1', name: 'Strength' },
        { id: 'tg2-2', name: 'Cardio' },
      ],
    },
    {
      id: 'plan3', goalId: 'g3', name: 'Read 12 Books — 2026', createdAt: '2026-01-01',
      taskGroups: [
        { id: 'tg3-1', name: 'Q1 (Jan–Mar)' },
        { id: 'tg3-2', name: 'Q2 (Apr–Jun)' },
        { id: 'tg3-3', name: 'Q3–Q4' },
      ],
    },
  ],

  planTasks: [
    { id: 'pt1', planId: 'plan1', groupId: 'tg1-1', parentId: null, title: 'Run 3km non-stop',           status: 'done',    estMins: 25, estCost: 0,  deps: [],        notes: 'Foundation run.' },
    { id: 'pt2', planId: 'plan1', groupId: 'tg1-1', parentId: null, title: 'Run 4km non-stop',           status: 'done',    estMins: 30, estCost: 0,  deps: ['pt1'],   notes: '' },
    { id: 'pt3', planId: 'plan1', groupId: 'tg1-1', parentId: null, title: 'Run 5km non-stop',           status: 'pending', estMins: 35, estCost: 0,  deps: ['pt2'],   notes: 'The goal.' },
    { id: 'pt4', planId: 'plan1', groupId: 'tg1-2', parentId: null, title: 'Register for Green Lake 5K', status: 'done',    estMins: 10, estCost: 30, deps: [],        notes: 'Registered Apr 29.' },
    { id: 'pt5', planId: 'plan1', groupId: 'tg1-2', parentId: 'pt4', title: 'Check registration deadline', status: 'done', estMins: 5,  estCost: 0,  deps: [],        notes: '' },
    { id: 'pt8', planId: 'plan1', groupId: 'tg1-2', parentId: null, title: 'Buy race-day gear',           status: 'done',    estMins: 30, estCost: 45, deps: [],        notes: 'Got shorts + belt at REI.' },
    { id: 'pt9', planId: 'plan1', groupId: 'tg1-2', parentId: null, title: 'Plan race morning routine',   status: 'pending', estMins: 20, estCost: 0,  deps: ['pt3'],   notes: 'Warm-up, hydration, timing.' },
    { id: 'pt6', planId: 'plan2', groupId: 'tg2-1', parentId: null, title: 'Bench press 185lbs × 5',     status: 'done',    estMins: 60, estCost: 0,  deps: [],        notes: 'Hit Apr 28.' },
    { id: 'pt7', planId: 'plan2', groupId: 'tg2-1', parentId: null, title: 'Squat 225lbs × 5',           status: 'pending', estMins: 60, estCost: 0,  deps: ['pt6'],   notes: '' },
    { id: 'pt10', planId: 'plan2', groupId: 'tg2-1', parentId: null, title: 'Deadlift 315lbs × 1',       status: 'pending', estMins: 60, estCost: 0,  deps: ['pt7'],   notes: 'Stretch goal.' },
    { id: 'pt11', planId: 'plan2', groupId: 'tg2-2', parentId: null, title: 'Run 1 mile in under 8 min', status: 'done',    estMins: 15, estCost: 0,  deps: [],        notes: '' },
    { id: 'pt12', planId: 'plan3', groupId: 'tg3-1', parentId: null, title: 'Read Stoner — John Williams',       status: 'done',    estMins: 300, estCost: 18, deps: [], notes: '' },
    { id: 'pt13', planId: 'plan3', groupId: 'tg3-1', parentId: null, title: 'Read The Road — Cormac McCarthy',   status: 'done',    estMins: 240, estCost: 0,  deps: [], notes: 'Owned already.' },
    { id: 'pt14', planId: 'plan3', groupId: 'tg3-1', parentId: null, title: 'Read 2 more in Jan–Feb',            status: 'done',    estMins: 600, estCost: 30, deps: [], notes: 'Completed Q1 target.' },
    { id: 'pt15', planId: 'plan3', groupId: 'tg3-2', parentId: null, title: 'Read The Midnight Library',         status: 'pending', estMins: 270, estCost: 16, deps: [], notes: 'Book Club pick for May.' },
    { id: 'pt16', planId: 'plan3', groupId: 'tg3-2', parentId: null, title: 'Read Thinking, Fast and Slow',      status: 'pending', estMins: 420, estCost: 0,  deps: [], notes: "Marcus's recommendation." },
    { id: 'pt17', planId: 'plan3', groupId: 'tg3-3', parentId: null, title: 'Complete 6 more books Q3–Q4',       status: 'pending', estMins: 1800, estCost: 80, deps: [], notes: 'On pace if keep up the streak.' },
  ],

  savedPlanTemplates: [],

  spacePosts: [
    { id: 'sp1', author: { handle: 'jordan', name: 'Jordan Malik' }, content: '6 weeks straight at the gym. Starting to feel like a different person. Gold tier unlocked 🥇', achievement: { tier: 'gold', name: 'Gym 3×/week', streak: 6 }, likes: 14, comments: 3, timestamp: '2026-04-28T20:00Z' },
    { id: 'sp2', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'Personal best on my morning run — 4.8km in 28 minutes. The 5K goal is getting very close.', likes: 21, comments: 5, timestamp: '2026-04-26T10:00Z' },
    { id: 'sp3', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'Finished "The Road" last night. Fourth book of the year. Quietly devastating. 10/10.', likes: 8, comments: 2, timestamp: '2026-04-25T21:30Z' },
    { id: 'sp4', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'March recap: 12 workouts, 3 runs, 48km total distance, 2 books. LENS told me I work out more on weeks I spend less on dining out. Interesting.', likes: 33, comments: 7, timestamp: '2026-04-01T09:00Z' },
    { id: 'sp5', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'Registered for the Green Lake 5K on May 10. 12 days out. Let\'s go 🏃', likes: 17, comments: 4, timestamp: '2026-04-29T18:00Z' },
    { id: 'sp6', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'Best Sunday in months. Hiked Rattlesnake Ledge with Maya and Priya. 3 hours on trail. Fitness goals are starting to compound.', likes: 29, comments: 8, timestamp: '2026-04-13T17:00Z' },
    { id: 'sp7', author: { handle: 'jordan', name: 'Jordan Malik' }, content: 'Food budget goal: 3 months in a row under $800. Not as hard as I thought once you track it. LENS makes the categories visual.', likes: 12, comments: 3, timestamp: '2026-04-02T09:00Z' },
  ],

  feedPosts: [
    { id: 'fp1', author: { handle: 'maya', name: 'Maya Chen' }, content: 'Just dropped my new EP. Six months of work in 24 minutes. Link in bio 🎵', likes: 47, comments: 12, timestamp: '2026-04-29T09:00Z' },
    { id: 'fp2', author: { handle: 'priya', name: 'Priya Sharma' }, content: "Morning 5K ✅ Who's racing at Green Lake next weekend?", likes: 19, comments: 4, timestamp: '2026-04-29T07:30Z' },
    { id: 'fp3', author: { handle: 'marcus', name: 'Marcus Webb' }, content: "Reading \"Thinking, Fast and Slow\" and it's making me question every decision I've ever made.", likes: 11, comments: 3, timestamp: '2026-04-28T22:00Z' },
    { id: 'fp4', author: { handle: 'priya', name: 'Priya Sharma' }, content: 'New gym PR — 225lb squat. The routine builder in nTogether has been a game changer for staying consistent.', likes: 28, comments: 6, timestamp: '2026-04-27T08:15Z' },
    { id: 'fp5', author: { handle: 'marcus', name: 'Marcus Webb' }, content: "Shipped the new dashboard today. First time I used LENS to check my own commit patterns — apparently I'm most productive on Tuesdays at 10am.", likes: 15, comments: 2, timestamp: '2026-04-26T17:30Z' },
  ],

  connections: [
    { id: 'cn1', handle: 'maya',   name: 'Maya Chen',    title: 'Musician & Photographer', avatar: 'linear-gradient(135deg,#f472b6,#a78bfa)', status: 'following', mutuals: 3 },
    { id: 'cn2', handle: 'priya',  name: 'Priya Sharma', title: 'Architect & Runner',       avatar: 'linear-gradient(135deg,#4ade80,#60a5fa)', status: 'mutual',    mutuals: 5 },
    { id: 'cn3', handle: 'marcus', name: 'Marcus Webb',  title: 'Engineer at Stripe',       avatar: 'linear-gradient(135deg,#fbbf24,#f87171)', status: 'mutual',    mutuals: 2 },
    { id: 'cn4', handle: 'kai',    name: 'Kai Patel',    title: 'Fitness Coach',            avatar: 'linear-gradient(135deg,#4ade80,#22d3ee)', status: 'follower',  mutuals: 1 },
    { id: 'cn5', handle: 'lisa',   name: 'Lisa Monroe',  title: 'UX Designer',              avatar: 'linear-gradient(135deg,#f472b6,#fbbf24)', status: 'follower',  mutuals: 0 },
    { id: 'cn6', handle: 'alex',   name: 'Alex Chen',    title: 'Product Manager',          avatar: 'linear-gradient(135deg,#818cf8,#4ade80)', status: 'suggested', mutuals: 4 },
    { id: 'cn7', handle: 'sam',    name: 'Sam Rivera',   title: 'Data Scientist',           avatar: 'linear-gradient(135deg,#60a5fa,#f472b6)', status: 'suggested', mutuals: 2 },
    { id: 'cn8', handle: 'james',  name: 'James Kim',    title: 'Startup Founder',          avatar: 'linear-gradient(135deg,#fbbf24,#4ade80)', status: 'suggested', mutuals: 3 },
  ],

  conversations: [
    {
      id: 'cv1', handle: 'priya', name: 'Priya Sharma', avatar: 'linear-gradient(135deg,#4ade80,#60a5fa)',
      lastMessage: 'See you at Green Lake Saturday!', timestamp: '2026-04-29T08:45Z', unread: 2,
      messages: [
        { id: 'm1', from: 'priya',  text: 'Hey! Are you doing the Green Lake 5K next weekend?',              timestamp: '2026-04-29T07:15Z' },
        { id: 'm2', from: 'jordan', text: "Yes! I've been training for weeks. You going?",                   timestamp: '2026-04-29T07:42Z' },
        { id: 'm3', from: 'priya',  text: 'Definitely. Want to do a warm-up run together Saturday morning?', timestamp: '2026-04-29T08:30Z' },
        { id: 'm4', from: 'priya',  text: 'See you at Green Lake Saturday!',                                  timestamp: '2026-04-29T08:45Z' },
      ],
    },
    {
      id: 'cv2', handle: 'marcus', name: 'Marcus Webb', avatar: 'linear-gradient(135deg,#fbbf24,#f87171)',
      lastMessage: 'Try "Thinking, Fast and Slow" next', timestamp: '2026-04-28T23:10Z', unread: 0,
      messages: [
        { id: 'm5', from: 'marcus', text: 'Which book are you on in your reading challenge?', timestamp: '2026-04-28T22:30Z' },
        { id: 'm6', from: 'jordan', text: 'Just finished The Road. Starting something new.',  timestamp: '2026-04-28T22:50Z' },
        { id: 'm7', from: 'marcus', text: 'Try "Thinking, Fast and Slow" next',               timestamp: '2026-04-28T23:10Z' },
      ],
    },
    {
      id: 'cv3', handle: 'maya', name: 'Maya Chen', avatar: 'linear-gradient(135deg,#f472b6,#a78bfa)',
      lastMessage: 'Check out my new EP when you get a chance 🎵', timestamp: '2026-04-27T16:20Z', unread: 1,
      messages: [
        { id: 'm8', from: 'maya', text: 'Check out my new EP when you get a chance 🎵', timestamp: '2026-04-27T16:20Z' },
      ],
    },
  ],

  notifications: [
    { id: 'n1', type: 'like',        actor: { handle: 'priya',  name: 'Priya Sharma', avatar: 'linear-gradient(135deg,#4ade80,#60a5fa)' }, content: 'liked your post about the gym streak',                    timestamp: '2026-04-29T10:00Z', read: false, link: '/space' },
    { id: 'n2', type: 'follow',      actor: { handle: 'kai',    name: 'Kai Patel',    avatar: 'linear-gradient(135deg,#4ade80,#22d3ee)' }, content: 'started following you',                                   timestamp: '2026-04-29T09:30Z', read: false, link: '/space/connections' },
    { id: 'n3', type: 'comment',     actor: { handle: 'marcus', name: 'Marcus Webb',  avatar: 'linear-gradient(135deg,#fbbf24,#f87171)' }, content: 'commented: "That\'s amazing progress!"',                  timestamp: '2026-04-28T20:30Z', read: false, link: '/space' },
    { id: 'n4', type: 'achievement', actor: { handle: 'jordan', name: 'You',          avatar: 'linear-gradient(135deg,#a78bfa,#60a5fa)' }, content: 'You earned Gold tier on Gym 3×/week — 6 week streak! 🥇', timestamp: '2026-04-28T18:00Z', read: true,  link: '/life/planner' },
    { id: 'n5', type: 'like',        actor: { handle: 'maya',   name: 'Maya Chen',    avatar: 'linear-gradient(135deg,#f472b6,#a78bfa)' }, content: 'liked your post about the 5K run',                        timestamp: '2026-04-26T14:00Z', read: true,  link: '/space' },
    { id: 'n6', type: 'mention',     actor: { handle: 'priya',  name: 'Priya Sharma', avatar: 'linear-gradient(135deg,#4ade80,#60a5fa)' }, content: 'mentioned you in a post about Green Lake 5K',              timestamp: '2026-04-25T08:00Z', read: true,  link: '/space/feed' },
    { id: 'n7', type: 'like',        actor: { handle: 'marcus', name: 'Marcus Webb',  avatar: 'linear-gradient(135deg,#fbbf24,#f87171)' }, content: 'liked your March recap post',                              timestamp: '2026-04-13T09:00Z', read: true,  link: '/space' },
    { id: 'n8', type: 'comment',     actor: { handle: 'lisa',   name: 'Lisa Monroe',  avatar: 'linear-gradient(135deg,#f472b6,#fbbf24)' }, content: 'commented: "The hike looks incredible!"',                  timestamp: '2026-04-13T19:00Z', read: true,  link: '/space' },
    { id: 'n9', type: 'follow',      actor: { handle: 'alex',   name: 'Alex Chen',    avatar: 'linear-gradient(135deg,#818cf8,#4ade80)' }, content: 'started following you',                                   timestamp: '2026-04-10T11:00Z', read: true,  link: '/space/connections' },
  ],

  spaceGroups: [
    { id: 'sg1', name: 'Seattle Runners',     category: 'Fitness',  description: 'Weekly group runs, race announcements, and training tips for Seattle-area runners.', members: 847,  joined: true,  privacy: 'public',
      posts: [
        { id: 'sgp1', author: { handle: 'priya', name: 'Priya Sharma' }, content: "Green Lake 5K next Saturday! Who's in? 🏃", likes: 24, comments: 8, timestamp: '2026-04-29T07:30Z' },
        { id: 'sgp2', author: { handle: 'alex',  name: 'Alex Chen'    }, content: 'Morning run was perfect today. 12°C, empty trail. Peak Seattle spring.', likes: 15, comments: 3, timestamp: '2026-04-28T07:00Z' },
      ] },
    { id: 'sg2', name: 'nTogether Book Club', category: 'Reading',  description: 'Monthly reads with discussion threads. All genres welcome.', members: 312, joined: true,  privacy: 'public',
      posts: [
        { id: 'sgp3', author: { handle: 'marcus', name: 'Marcus Webb' }, content: 'This month\'s pick: "The Midnight Library". Discussion thread Friday.', likes: 31, comments: 12, timestamp: '2026-04-27T12:00Z' },
      ] },
    { id: 'sg3', name: 'Tech in Seattle',     category: 'Tech',     description: 'Software engineers, PMs, and founders in the PNW.', members: 1204, joined: false, privacy: 'public',
      posts: [
        { id: 'sgp4', author: { handle: 'james', name: 'James Kim' }, content: 'Anyone going to the AI summit next week? Happy to connect beforehand.', likes: 19, comments: 5, timestamp: '2026-04-28T14:30Z' },
      ] },
    { id: 'sg4', name: 'Mindful Living',      category: 'Wellness', description: 'Journaling, meditation, sleep, and sustainable habits.', members: 523, joined: false, privacy: 'public',
      posts: [
        { id: 'sgp5', author: { handle: 'lisa', name: 'Lisa Monroe' }, content: '30 days of morning journaling — sharing my template that\'s been working really well.', likes: 42, comments: 17, timestamp: '2026-04-26T08:00Z' },
      ] },
    { id: 'sg5', name: 'Gym Grind',           category: 'Fitness',  description: 'Strength training, powerlifting, PRs, and accountability. Post your wins.', members: 634, joined: false, privacy: 'public', posts: [] },
  ],

  spacePages: [
    { id: 'spage-wall',    label: 'Wall',    slug: 'wall',    icon: '🏠', blocks: ['sb1','sb2','sb3'] },
    { id: 'spage-media',   label: 'Media',   slug: 'media',   icon: '🎬', blocks: [] },
    { id: 'spage-friends', label: 'Friends', slug: 'friends', icon: '👥', blocks: [] },
    { id: 'spage-lists',   label: 'Lists',   slug: 'lists',   icon: '📋', blocks: [] },
    { id: 'spage-info',    label: 'Info',    slug: 'info',    icon: 'ℹ️',  blocks: [] },
    { id: 'spage-profile', label: 'Profile', slug: 'profile', icon: '👤', blocks: ['sb4'] },
  ],

  spaceBlocks: [
    { id: 'sb1', pageId: 'spage-wall',    type: 'navbar',       order: 0, visible: true, label: 'Navbar',       props: {} },
    { id: 'sb2', pageId: 'spage-wall',    type: 'hero',         order: 1, visible: true, label: 'Hero',         props: { layout: 'banner', showStats: true } },
    { id: 'sb3', pageId: 'spage-wall',    type: 'posts',        order: 2, visible: true, label: 'Posts',        props: { sort: 'newest', count: 10 } },
    { id: 'sb4', pageId: 'spage-profile', type: 'profile_card', order: 0, visible: true, label: 'Profile Card', props: {} },
  ],

  drafts: [
    {
      id: 'dr1',
      title: 'Best Albums of All Time',
      topic: 'Music',
      status: 'in-progress',
      parties: [
        { name: 'Jordan', handle: 'jordan', isUser: true  },
        { name: 'Priya',  handle: 'priya',  isUser: false },
        { name: 'Marcus', handle: 'marcus', isUser: false },
      ],
      availableItems: [
        'The Score', 'Odelay', 'Homogenic', 'Doggystyle',
        'Enter the Wu-Tang', 'Reasonable Doubt', 'Tragic Kingdom',
      ],
      picks: [
        { round: 1, partyIndex: 0, item: 'OK Computer'  },
        { round: 1, partyIndex: 1, item: 'Nevermind'    },
        { round: 1, partyIndex: 2, item: 'Illmatic'     },
        { round: 2, partyIndex: 2, item: 'Purple Rain'  },
        { round: 2, partyIndex: 1, item: 'The Chronic'  },
      ],
      rounds: 3,
      createdAt: '2026-05-07',
    },
    {
      id: 'dr2',
      title: 'All-Time Movies',
      topic: 'Film',
      status: 'completed',
      parties: [
        { name: 'Jordan', handle: 'jordan', isUser: true  },
        { name: 'Maya',   handle: 'maya',   isUser: false },
        { name: 'Marcus', handle: 'marcus', isUser: false },
      ],
      availableItems: [],
      picks: [
        { round: 1, partyIndex: 0, item: 'No Country for Old Men' },
        { round: 1, partyIndex: 1, item: 'Mulholland Drive'       },
        { round: 1, partyIndex: 2, item: 'The Godfather'          },
        { round: 2, partyIndex: 2, item: 'Blade Runner 2049'      },
        { round: 2, partyIndex: 1, item: 'Portrait of a Lady on Fire' },
        { round: 2, partyIndex: 0, item: 'There Will Be Blood'    },
        { round: 3, partyIndex: 0, item: 'Parasite'               },
        { round: 3, partyIndex: 1, item: 'Lost in Translation'    },
        { round: 3, partyIndex: 2, item: 'Spirited Away'          },
      ],
      rounds: 3,
      createdAt: '2026-04-20',
    },
  ],

  spaceBlogPosts: [],

  spaceRSVPs: [],

  habits: [
    { id: 'hab1', name: 'Alcohol',          category: 'Substance', type: 'vice',    icon: '🍺', unit: 'drinks',    color: '#ef4444', description: 'Tracking drinking habits',      goalId: null, createdAt: '2026-03-01', cleanStreak: 2,  longestClean: 7  },
    { id: 'hab2', name: 'Doomscrolling',    category: 'Digital',   type: 'vice',    icon: '📱', unit: 'hours',     color: '#f59e0b', description: 'Late-night phone compulsion',  goalId: null, createdAt: '2026-03-15', cleanStreak: 0,  longestClean: 3  },
    { id: 'hab3', name: 'Impulse Spending', category: 'Spending',  type: 'vice',    icon: '💸', unit: 'purchases', color: '#8b5cf6', description: 'Unplanned online purchases',   goalId: null, createdAt: '2026-04-01', cleanStreak: 5,  longestClean: 14 },
  ],

  habitLogs: [
    { id: 'hlog1', habitId: 'hab1', entryType: 'gave-in',  quantity: 3,   unit: 'drinks',    cost: 22, trigger: 'Social gathering',        moodBefore: 3, moodAfter: 2, purpose: 'Networking event after work',         notes: '',                          recordedAt: '2026-05-09T22:00Z' },
    { id: 'hlog2', habitId: 'hab1', entryType: 'resisted', quantity: 0,   unit: 'drinks',    cost: 0,  trigger: 'Offered drink at dinner',  moodBefore: 4, moodAfter: 5, purpose: 'Wanted to keep streak going',        notes: 'Ordered sparkling water instead', recordedAt: '2026-05-10T20:00Z' },
    { id: 'hlog3', habitId: 'hab2', entryType: 'gave-in',  quantity: 1.5, unit: 'hours',     cost: 0,  trigger: 'Could not sleep',          moodBefore: 2, moodAfter: 2, purpose: 'Anxiety about work meeting',         notes: '',                          recordedAt: '2026-05-08T01:00Z' },
    { id: 'hlog4', habitId: 'hab3', entryType: 'resisted', quantity: 0,   unit: 'purchases', cost: 0,  trigger: 'Instagram ad for shoes',   moodBefore: 3, moodAfter: 4, purpose: 'Added to wishlist instead',         notes: '24-hour rule worked',       recordedAt: '2026-05-11T10:00Z' },
    { id: 'hlog5', habitId: 'hab3', entryType: 'gave-in',  quantity: 1,   unit: 'purchases', cost: 68, trigger: 'Boredom',                 moodBefore: 2, moodAfter: 2, purpose: 'Treated myself after a bad day',    notes: 'New kitchen gadget',        recordedAt: '2026-04-28T14:00Z' },
  ],

  agoraCommunities: [
    { id: 'agc1', name: 'Seattle Tech', slug: 'seattle-tech', icon: '💻', category: 'Technology', description: 'Software engineers, founders, and tech workers in the PNW. Jobs, projects, and shop talk.', members: 4821, postCount: 342, joined: true },
    { id: 'agc2', name: 'PNW Runners', slug: 'pnw-runners', icon: '🏃', category: 'Fitness', description: 'Trail and road running across Washington and Oregon. Race recaps, route recommendations, gear.', members: 2103, postCount: 891, joined: true },
    { id: 'agc3', name: 'Book Nerds', slug: 'book-nerds', icon: '📚', category: 'Books', description: 'Monthly reads, deep-dive discussions, and recommendations across all genres.', members: 3456, postCount: 512, joined: false },
    { id: 'agc4', name: 'Indie Music Hub', slug: 'indie-music', icon: '🎵', category: 'Music', description: 'Independent artists, new releases, deep cuts, and discovery playlists.', members: 2890, postCount: 1204, joined: false },
    { id: 'agc5', name: 'Personal Finance', slug: 'personal-finance', icon: '💰', category: 'Finance', description: 'Budgets, investing, FIRE movement, and building financial independence.', members: 8932, postCount: 2341, joined: false },
    { id: 'agc6', name: 'Mindful Eating', slug: 'mindful-eating', icon: '🥗', category: 'Health', description: 'Nutrition science, meal planning, and sustainable eating habits — without diet culture.', members: 1234, postCount: 456, joined: false },
    { id: 'agc7', name: 'Open Source Everything', slug: 'open-source', icon: '🔓', category: 'Technology', description: 'FOSS projects, contributions, licensing, and the open web. All skill levels.', members: 6721, postCount: 3210, joined: true },
    { id: 'agc8', name: 'Urban Photography', slug: 'urban-photo', icon: '📸', category: 'Creative', description: 'Street, architecture, and people photography. Share your shots, get feedback.', members: 4102, postCount: 8901, joined: false },
    { id: 'agc9', name: 'Stoic Minds', slug: 'stoic-minds', icon: '🧘', category: 'Philosophy', description: 'Marcus Aurelius to modern practice. Journaling prompts, quotes, and lived experience.', members: 2217, postCount: 678, joined: false },
    { id: 'agca', name: 'Home Lab', slug: 'home-lab', icon: '🖥️', category: 'Technology', description: 'Self-hosting, homelab builds, networking, and privacy-first infrastructure.', members: 5431, postCount: 1876, joined: false },
  ],

  agoraPosts: [
    { id: 'agp1', communityId: 'agc1', communityName: 'Seattle Tech', communityIcon: '💻', title: 'What dev tools are you all switching to in 2026?', content: 'Been exploring Zed editor lately and it\'s been a breath of fresh air. Curious what the PNW tech scene is gravitating toward — new editors, terminals, AI integrations?', author: { handle: 'james', name: 'James Kim' }, votes: 234, userVote: null, commentCount: 42, timestamp: '2026-05-07T14:30Z', flair: 'Discussion' },
    { id: 'agp2', communityId: 'agc2', communityName: 'PNW Runners', communityIcon: '🏃', title: 'Green Lake 5K next Saturday — who else is running?', content: 'Registration is still open. Weather looks perfect — mid-50s, partly cloudy. I\'ll be at the 8am start line. Would love to meet some of you IRL.', author: { handle: 'priya', name: 'Priya Sharma' }, votes: 89, userVote: 1, commentCount: 28, timestamp: '2026-05-07T09:00Z', flair: 'Race' },
    { id: 'agp3', communityId: 'agc7', communityName: 'Open Source Everything', communityIcon: '🔓', title: 'ActivityPub is having a moment — resources for getting started?', content: 'Building a federated social app and trying to get a handle on the full stack. WebFinger, AP actors, HTTP signatures — it\'s a lot. What resources actually helped you?', author: { handle: 'jordan', name: 'Jordan Malik' }, votes: 156, userVote: 1, commentCount: 34, timestamp: '2026-05-06T18:00Z', flair: 'Question' },
    { id: 'agp4', communityId: 'agc5', communityName: 'Personal Finance', communityIcon: '💰', title: 'Tracking net worth manually vs. aggregators — the privacy case for DIY', content: 'I stopped using Mint/YNAB 2 years ago and moved to a local spreadsheet. My net worth tracking got more accurate (I actually update it) and nothing leaks to third parties. Anyone else gone this route?', author: { handle: 'marcus', name: 'Marcus Webb' }, votes: 412, userVote: null, commentCount: 87, timestamp: '2026-05-06T11:20Z', flair: 'Discussion' },
    { id: 'agp5', communityId: 'agc4', communityName: 'Indie Music Hub', communityIcon: '🎵', title: 'Maya Chen\'s new EP is something special — "Depth Charge" review', content: 'Three tracks in and already my most-played of the year. The production on "Undertow" alone is worth the listen. Bandcamp link in comments.', author: { handle: 'lisa', name: 'Lisa Monroe' }, votes: 203, userVote: 1, commentCount: 19, timestamp: '2026-05-05T20:00Z', flair: 'Review' },
    { id: 'agp6', communityId: 'agc2', communityName: 'PNW Runners', communityIcon: '🏃', title: 'Burke-Gilman trail conditions after the rain — worth it?', content: 'Thinking of doing a long run tomorrow. Is it muddy past Kenmore? Didn\'t want to find out the hard way.', author: { handle: 'kai', name: 'Kai Patel' }, votes: 67, userVote: null, commentCount: 12, timestamp: '2026-05-05T16:30Z', flair: 'Trail Report' },
    { id: 'agp7', communityId: 'agc1', communityName: 'Seattle Tech', communityIcon: '💻', title: 'We\'re hiring — Go + React, fully remote, competitive equity', content: 'Small team (8 people), Series A, solving a real problem in the data privacy space. DMs open or comment for JD link.', author: { handle: 'sam', name: 'Sam Rivera' }, votes: 44, userVote: null, commentCount: 8, timestamp: '2026-05-05T10:00Z', flair: 'Jobs' },
    { id: 'agp8', communityId: 'agca', communityName: 'Home Lab', communityIcon: '🖥️', title: 'Finally got Coolify running on a $35 board — here\'s how', content: 'Took two evenings but it\'s running perfectly. Self-hosting a dozen services now with automatic SSL and zero cloud dependency. Full write-up in comments.', author: { handle: 'alex', name: 'Alex Chen' }, votes: 891, userVote: null, commentCount: 123, timestamp: '2026-05-04T19:00Z', flair: 'Guide' },
    { id: 'agp9', communityId: 'agc3', communityName: 'Book Nerds', communityIcon: '📚', title: 'May pick: "The Left Hand of Darkness" — discussion thread', content: 'This one rewards slow reading. Sharing my chapter notes as I go. What\'s landing for you so far?', author: { handle: 'marcus', name: 'Marcus Webb' }, votes: 134, userVote: 1, commentCount: 56, timestamp: '2026-05-04T12:00Z', flair: 'Monthly Read' },
    { id: 'agpa', communityId: 'agc9', communityName: 'Stoic Minds', communityIcon: '🧘', title: 'Weekly journaling prompt: "What would I do differently if today were my last ordinary day?"', content: 'Meditations 2.11 adjacent. Share your reflections — anonymous or not, both welcome here.', author: { handle: 'lisa', name: 'Lisa Monroe' }, votes: 278, userVote: null, commentCount: 44, timestamp: '2026-05-03T08:00Z', flair: 'Prompt' },
    { id: 'agpb', communityId: 'agc7', communityName: 'Open Source Everything', communityIcon: '🔓', title: 'nTogether went open source — looks interesting for privacy-first social', content: 'First glance at the repo — federating via ActivityPub, no server-side logs, E2E encrypted transfers. This is the approach the ecosystem needs more of.', author: { handle: 'alex', name: 'Alex Chen' }, votes: 445, userVote: 1, commentCount: 78, timestamp: '2026-05-02T15:00Z', flair: 'Project' },
    { id: 'agpc', communityId: 'agc6', communityName: 'Mindful Eating', communityIcon: '🥗', title: 'Meal prep Sundays changed my whole week — here\'s my actual workflow', content: 'Grain bowls Mon-Wed, flex days Thu-Fri, one splurge. It\'s not glamorous but it cut my food spend by 40% and I eat way better than I did ordering out.', author: { handle: 'priya', name: 'Priya Sharma' }, votes: 312, userVote: null, commentCount: 61, timestamp: '2026-05-01T11:00Z', flair: 'Tips' },
  ],

  tradingListings: [
    { id: 'tl1',  type: 'algorithm',  name: 'Interest Graph Feed',      author: { handle: 'alex',   name: 'Alex Chen'    }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.8, ratingCount: 234, installs: 2841, installed: true,  description: 'Surfaces content from people with overlapping interests, not just who you follow. Uses tag co-occurrence and interaction patterns.', tags: ['feed', 'discovery'], badge: 'Popular' },
    { id: 'tl2',  type: 'theme',      name: 'Cyberpunk Dark',           author: { handle: 'maya',   name: 'Maya Chen'    }, priceLabel: '200 credits',  priceCredits: 200, rating: 4.6, ratingCount:  89, installs:  541, installed: false, description: 'Hot pink accents, electric blue glow, neon-lit typography. Pairs well with the Neon base theme.', tags: ['theme', 'dark', 'neon'], badge: 'New' },
    { id: 'tl3',  type: 'block',      name: 'Now Playing Widget',       author: { handle: 'sam',    name: 'Sam Rivera'   }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.4, ratingCount: 156, installs: 1203, installed: true,  description: 'Shows your currently playing track with album art placeholder, song title, and a live progress bar. Syncs with your Media app.', tags: ['block', 'music'], badge: '' },
    { id: 'tl4',  type: 'theme',      name: 'Minimal Stone',            author: { handle: 'lisa',   name: 'Lisa Monroe'  }, priceLabel: '150 credits',  priceCredits: 150, rating: 4.9, ratingCount: 341, installs: 2102, installed: false, description: 'Monochrome elegance. Off-white accent on near-black. Every element stripped to its purpose. For people who\'ve already found their aesthetic.', tags: ['theme', 'minimal'], badge: 'Top Rated' },
    { id: 'tl5',  type: 'algorithm',  name: 'Close Friends First',      author: { handle: 'priya',  name: 'Priya Sharma' }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.3, ratingCount:  78, installs:  934, installed: false, description: 'Prioritizes content from mutual connections and frequent interactions. Great for keeping up with people you actually know.', tags: ['feed', 'social'], badge: '' },
    { id: 'tl6',  type: 'block',      name: 'Fitness PR Leaderboard',   author: { handle: 'kai',    name: 'Kai Patel'    }, priceLabel: '80 credits',   priceCredits:  80, rating: 4.5, ratingCount:  42, installs:  287, installed: false, description: 'Displays your top personal records from the Fitness app as a stylized leaderboard. Bench, squat, deadlift, 5K time. Auto-updates.', tags: ['block', 'fitness'], badge: '' },
    { id: 'tl7',  type: 'trigger',    name: 'Gym Day Prep Pack',        author: { handle: 'kai',    name: 'Kai Patel'    }, priceLabel: '60 credits',   priceCredits:  60, rating: 4.7, ratingCount: 123, installs:  789, installed: false, description: 'Fires 2 hours before a gym routine block: sends a gear checklist notification, mutes non-urgent alerts, and logs a pre-workout mood stamp.', tags: ['trigger', 'fitness'], badge: 'Popular' },
    { id: 'tl8',  type: 'digital',    name: 'Habit Tracking Templates', author: { handle: 'marcus', name: 'Marcus Webb'  }, priceLabel: '120 credits',  priceCredits: 120, rating: 4.2, ratingCount:  67, installs:  412, installed: false, description: '14 pre-built habit tracking configs for Planner + Journal. Includes: sleep, hydration, reading, exercise, screen time, and gratitude.', tags: ['template', 'habits'], badge: '' },
    { id: 'tl9',  type: 'block',      name: 'Reading Progress Card',    author: { handle: 'lisa',   name: 'Lisa Monroe'  }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.6, ratingCount:  98, installs: 1567, installed: false, description: 'Shows your current book from the Media app with a progress bar, days into it, and a reading streak badge.', tags: ['block', 'books', 'media'], badge: '' },
    { id: 'tla',  type: 'algorithm',  name: 'Chronological Pure',       author: { handle: 'jordan', name: 'Jordan Malik' }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.1, ratingCount: 445, installs: 5230, installed: false, description: 'No ranking, no weighting. Pure reverse-chronological feed. What people posted, in order. Radical transparency for your timeline.', tags: ['feed', 'minimal'], badge: '' },
    { id: 'tlb',  type: 'trigger',    name: 'Budget Alert Pack',        author: { handle: 'marcus', name: 'Marcus Webb'  }, priceLabel: '90 credits',   priceCredits:  90, rating: 4.5, ratingCount:  56, installs:  334, installed: false, description: 'Three triggers: notify at 75% of any budget category, lock the spending tab visually when a category is maxed, and post a private SPACE note at month-end.', tags: ['trigger', 'finance'], badge: '' },
    { id: 'tlc',  type: 'theme',      name: 'Forest Sage',              author: { handle: 'priya',  name: 'Priya Sharma' }, priceLabel: '100 credits',  priceCredits: 100, rating: 4.7, ratingCount: 189, installs: 1102, installed: false, description: 'Deep greens with warm amber highlights. Grounded and calm. Built on the Sage theme base with richer contrast and warmer midtones.', tags: ['theme', 'green'], badge: '' },
    { id: 'tld',  type: 'digital',    name: 'Podcast Notes Framework',  author: { handle: 'sam',    name: 'Sam Rivera'   }, priceLabel: '50 credits',   priceCredits:  50, rating: 4.0, ratingCount:  29, installs:  203, installed: false, description: 'A structured Research template for podcast episode notes: guest background, key insights, action items, linked timestamps. Works with the Media player.', tags: ['template', 'media', 'research'], badge: '' },
    { id: 'tle',  type: 'block',      name: 'Goal Countdown Timer',     author: { handle: 'kai',    name: 'Kai Patel'    }, priceLabel: '70 credits',   priceCredits:  70, rating: 4.4, ratingCount:  61, installs:  445, installed: false, description: 'Displays days remaining to your goal deadline with a progress ring and a motivational milestone label. Pulls from your active goals.', tags: ['block', 'goals'], badge: '' },
    { id: 'tlf',  type: 'trigger',    name: 'Evening Wind-Down',        author: { handle: 'lisa',   name: 'Lisa Monroe'  }, priceLabel: 'Free',         priceCredits: 0,   rating: 4.8, ratingCount: 312, installs: 3401, installed: false, description: 'At 9:30pm: prompts journal reflection, logs a mood stamp, enables Do Not Disturb on connected devices, and sets a sleep reminder. Fully configurable.', tags: ['trigger', 'wellness', 'journal'], badge: 'Popular' },
    { id: 'tlg',  type: 'digital',    name: 'Annual Review Kit',        author: { handle: 'marcus', name: 'Marcus Webb'  }, priceLabel: '175 credits',  priceCredits: 175, rating: 4.9, ratingCount: 134, installs:  678, installed: false, description: 'End-of-year guided reflection across all Life Suite apps. Auto-pulls your top stats, generates a summary, and exports to a shareable SPACE post or PDF.', tags: ['template', 'review', 'annual'], badge: 'Top Rated' },
  ],
}

// Jim's demo — blank slate, user populates manually
export const jimSeed = {
  user: {
    id: 'u2', handle: 'jim', name: 'Jim Kasper',
    title: '', location: '',
    bio: '',
    credits: 0, tier: 'T1',
    stats: { followers: 0, following: 0, posts: 0 },
    purposes: [],
    spaceTheme: 'default',
    spaceLayout: 'classic',
  },
  budgetLimits: {
    Groceries: 0, 'Dining Out': 0, Coffee: 0,
    'Health & Fitness': 0, Shopping: 0, Transport: 0,
    Subscriptions: 0, Books: 0, Entertainment: 0,
  },
  feedAlgorithm: 'chronological',
  lifeSuiteGroups: [
    { id: 'body',   label: 'Body',   appIds: ['fitness', 'health', 'diet'] },
    { id: 'mind',   label: 'Mind',   appIds: ['planner', 'scheduler', 'journal', 'learning', 'kenoma'] },
    { id: 'money',  label: 'Life',   appIds: ['financial', 'lists', 'agreements', 'research'] },
    { id: 'world',  label: 'World',  appIds: ['contacts', 'media', 'aroundtown', 'posthumous', 'draft'] },
    { id: 'other',  label: 'Brain',  appIds: ['brain'] },
  ],
  brainConfig: {
    provider: 'demo',
    byokProvider: 'anthropic', byokKey: '', byokModel: 'claude-haiku-4-5-20251001',
    byoeEndpoint: 'http://localhost:11434', byoeKey: '', byoeModel: 'llama3.3',
    onDeviceModel: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  },
  goals: [], routines: [], events: [], journalEntries: [],
  transactions: [], importHashes: [],
  accounts: [],
  lensEvents: [], personalBests: [], healthLogs: [],
  mediaLog: [], skills: [], trips: [],
  research: [],
  posthumous: { unlockCondition: 'inactivity_90_days', unlockContacts: [], messages: [] },
  agreements: [],
  lists: [],
  places: [], savedPlaces: [], checkins: [],
  contacts: [], groups: [], contactCustomFields: [], contactReminders: [], mailingLists: [],
  mealLogs: [],
  achievements: [],
  plans: [], planTasks: [],
  spacePosts: [], feedPosts: [],
  connections: [], conversations: [], notifications: [],
  spaceGroups: [],
  photoAlbums: [], photos: [], personalMedia: [],
  videoCollections: [], videos: [],
  viewerPresets: [],
  spacePages: [
    { id: 'spage-wall',    label: 'Wall',    slug: 'wall',    icon: '🏠', blocks: ['sb-jim1', 'sb-jim2'] },
    { id: 'spage-media',   label: 'Media',   slug: 'media',   icon: '🎬', blocks: [] },
    { id: 'spage-friends', label: 'Friends', slug: 'friends', icon: '👥', blocks: [] },
    { id: 'spage-lists',   label: 'Lists',   slug: 'lists',   icon: '📋', blocks: [] },
    { id: 'spage-info',    label: 'Info',    slug: 'info',    icon: 'ℹ️',  blocks: [] },
    { id: 'spage-profile', label: 'Profile', slug: 'profile', icon: '👤', blocks: ['sb-jim3'] },
  ],
  spaceBlocks: [
    { id: 'sb-jim1', pageId: 'spage-wall', type: 'navbar',    order: 0, visible: true, label: 'Navbar', props: {} },
    { id: 'sb-jim2', pageId: 'spage-wall', type: 'hero',      order: 1, visible: true, label: 'Hero',   props: { layout: 'banner', showStats: true } },
    { id: 'sb-jim3', pageId: 'spage-profile', type: 'profile_card', order: 0, visible: true, label: 'Profile Card', props: {} },
  ],
  drafts: [],
  spaceBlogPosts: [],
  spaceRSVPs: [],
  habits: [],
  habitLogs: [],
  agoraCommunities: [],
  agoraPosts: [],
  tradingListings: [],
  jokes: [
    { id: 'jk001', text: "I told my therapist I was afraid of commitment. She said that's very common. I said, 'Great — so you won't mind if I try a different therapist next week.'", tag: 'setup', createdAt: '2026-04-10T21:00Z', links: [], status: 'proven', estMins: 2,
      performances: [{ id: 'perf001', date: '2026-04-15', venue: 'The Laughing Stock', crowdType: 'club', landing: 'kill', notes: 'Crushed it with the opener crowd — perfect timing' }],
      variants: [{ id: 'var001', text: "I told my therapist I had commitment issues. She nodded knowingly. I said 'Cool — so you'll understand when I book with your competitor next week.'", preferred: false, createdAt: '2026-04-10T22:00Z' }] },
    { id: 'jk002', text: "She's going to dump me. I can see it coming from a mile away.", tag: 'tagline', createdAt: '2026-04-10T21:02Z', links: [{ jokeId: 'jk001', note: 'Works as the punchline to the therapist setup' }], status: 'workshop', estMins: 0, performances: [], variants: [] },
    { id: 'jk003', text: "There's a whole thing with my dad about commitment phobia — he missed half my childhood. Not because he didn't love us. Because he couldn't commit to being home before 9pm.", tag: 'story', createdAt: '2026-04-11T20:30Z', links: [{ jokeId: 'jk001', note: 'Origin story for the commitment bit' }], status: 'road_test', estMins: 3,
      performances: [{ id: 'perf002', date: '2026-04-18', venue: 'Open Mic at Bumbershoot', crowdType: 'alt', landing: 'ok', notes: 'Got knowing laughs, needs tightening in the middle' }],
      variants: [] },
    { id: 'jk004', text: "What if being bad at goodbyes is actually a superpower? Nobody knows when you're leaving. You're basically a ghost, but alive.", tag: 'concept', createdAt: '2026-04-12T22:15Z', links: [], status: 'draft', estMins: 2, performances: [],
      variants: [{ id: 'var002', text: "What if being terrible at goodbyes is a secret superpower? Nobody clocks your exit. You're basically a ninja, but for social situations.", preferred: true, createdAt: '2026-04-13T10:00Z' }] },
    { id: 'jk005', text: "My phone died at 1% and I felt a level of panic that my body has clearly been saving for something important.", tag: 'setup', createdAt: '2026-04-15T19:45Z', links: [], status: 'proven', estMins: 1,
      performances: [
        { id: 'perf003', date: '2026-04-20', venue: 'Comedy Underground', crowdType: 'club', landing: 'kill', notes: 'Perfect setup — crowd immediately recognizes the feeling' },
        { id: 'perf004', date: '2026-04-25', venue: 'Bar None Open Mic', crowdType: 'bar', landing: 'ok', notes: 'Bar crowd was distracted, still got solid laughs' },
      ], variants: [] },
    { id: 'jk006', text: "We're all just protecting a battery that outlived every relationship we've had.", tag: 'tagline', createdAt: '2026-04-15T19:50Z', links: [{ jokeId: 'jk005', note: 'Tag this after the phone panic setup' }], status: 'proven', estMins: 0, performances: [], variants: [] },
    { id: 'jk007', text: "The entire bit is about how we treat our phones better than ourselves — charge overnight, keep them cool, put a case on them. Nobody does that for their back.", tag: 'concept', createdAt: '2026-04-16T21:00Z', links: [{ jokeId: 'jk005', note: 'Umbrella concept for the phone anxiety arc' }, { jokeId: 'jk006', note: 'Tagline lives under this concept' }], status: 'road_test', estMins: 4, performances: [], variants: [] },
  ],
  jokeInbox: [
    { id: 'inb001', text: "Something about how we apologize to furniture when we bump into it but never the other way around", createdAt: '2026-04-29T11:00Z' },
    { id: 'inb002', text: "The whole performance around pretending to understand wine at a restaurant — sommelier confidence is just organized lying", createdAt: '2026-04-28T22:30Z' },
    { id: 'inb003', text: "Spotify's algorithm knows me better than anyone I've dated — and it still recommends sad songs at 2am", createdAt: '2026-04-27T00:15Z' },
  ],
  setLists: [
    { id: 'sl001', name: 'Open Mic — 5 Minutes', createdAt: '2026-04-20', items: [
      { jokeId: 'jk001', role: 'opener', note: 'Warm them up with commitment' },
      { jokeId: 'jk003', role: 'feature', note: null },
      { jokeId: 'jk005', role: 'feature', note: null },
      { jokeId: 'jk006', role: 'closer', note: 'Button on the phone battery tagline' },
    ]},
    { id: 'sl002', name: 'Club Set — 10 Minutes', createdAt: '2026-04-25', items: [
      { jokeId: 'jk001', role: 'opener', note: null },
      { jokeId: 'jk002', role: 'callback', note: 'Callback right after opener' },
      { jokeId: 'jk003', role: 'feature', note: null },
      { jokeId: 'jk005', role: 'feature', note: null },
      { jokeId: 'jk006', role: 'feature', note: null },
      { jokeId: 'jk007', role: 'closer', note: 'Big concept closer' },
    ]},
  ],
}

function loadData(storageKey, seedData) {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return { ...seedData, ...JSON.parse(saved) }
  } catch {}
  return { ...seedData }
}

function uid(prefix = 'x') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

export function getDraftOrder(partyCount, rounds) {
  const order = []
  for (let r = 0; r < rounds; r++) {
    const indices = Array.from({ length: partyCount }, (_, i) => i)
    const row = r % 2 === 0 ? indices : [...indices].reverse()
    row.forEach(pi => order.push({ round: r + 1, partyIndex: pi }))
  }
  return order
}

const StoreCtx = createContext(null)

export function StoreProvider({ children, demoName = 'jordan' }) {
  const storageKey = `barbelo-${demoName}`
  const seedData = demoName === 'jim' ? jimSeed : seed
  const [data, setDataRaw] = useState(() => loadData(storageKey, seedData))
  const [sessionLensEvents, setSessionLensEvents] = useState([])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch {}
  }, [data, storageKey])

  function setData(updater) {
    setDataRaw(prev => {
      const patch = typeof updater === 'function' ? updater(prev) : updater
      return { ...prev, ...patch }
    })
  }

  // --- Brain config ---
  function setBrainConfig(patch) {
    setData(p => ({ brainConfig: { ...p.brainConfig, ...patch } }))
  }

  // --- Goals ---
  function addGoal(goal) {
    const id = uid('g')
    const defaults = { id, progress: 0, streak: 0, credits: 0, tier: null, currentWeek: 0, currentMonth: 0, booksRead: 0, apps: [], metric: null, conditions: [], aggregation: 'sum', timeWindow: null, tolerance: 0 }
    setData(p => ({ goals: [...p.goals, { ...defaults, ...goal }] }))
    return id
  }
  function updateGoal(id, patch) {
    setData(p => ({ goals: p.goals.map(g => g.id === id ? { ...g, ...patch } : g) }))
  }
  function deleteGoal(id) {
    setData(p => ({ goals: p.goals.filter(g => g.id !== id) }))
  }

  // --- Routines ---
  const CAT_TO_TYPE = { Exercise: 'exercise', Learning: 'learning', Health: 'health', Creative: 'fun', Social: 'social', Work: 'work', Other: 'work' }
  const DAY_OFFSET = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

  function buildRoutineEvents(routineId, routine) {
    if (routine.mode !== 'fixed_slots' || !routine.days?.length || !routine.time) return []
    const [h, m] = routine.time.split(':').map(Number)
    const durMins = routine.durationMins || 60
    const endH = Math.floor((h * 60 + m + durMins) / 60) % 24
    const endMin = (h * 60 + m + durMins) % 60
    const endTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
    const eventType = CAT_TO_TYPE[routine.category] || 'exercise'

    // Monday of current week
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dow = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

    const events = []
    for (let w = 0; w < 4; w++) {
      for (const day of routine.days) {
        const offset = DAY_OFFSET[day] ?? 0
        const date = new Date(monday)
        date.setDate(monday.getDate() + w * 7 + offset)
        if (date < today) continue
        const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        events.push({ id: uid('e'), status: 'upcoming', title: routine.name, type: eventType, routineId, start: `${ds}T${routine.time}`, end: `${ds}T${endTime}` })
      }
    }
    return events
  }

  function addRoutine(routine) {
    const id = uid('r')
    const defaults = { id, streak: 0, completedThisWeek: 0, completedThisMins: 0, linkedListIds: [] }
    const newRoutine = { ...defaults, ...routine }
    const newEvents = buildRoutineEvents(id, newRoutine)
    setData(p => ({ routines: [...p.routines, newRoutine], events: [...p.events, ...newEvents] }))
    return id
  }
  function updateRoutine(id, patch) {
    setData(p => {
      const updated = { ...p.routines.find(r => r.id === id), ...patch }
      // Remove future unfinished events for this routine, then re-schedule
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const kept = p.events.filter(e => e.routineId !== id || new Date(e.start) < today || e.status === 'finished')
      const newEvents = buildRoutineEvents(id, updated)
      return { routines: p.routines.map(r => r.id === id ? updated : r), events: [...kept, ...newEvents] }
    })
  }
  function deleteRoutine(id) {
    setData(p => ({ routines: p.routines.filter(r => r.id !== id) }))
  }

  // --- Events ---
  function addEvent(event) {
    const id = uid('e')
    setData(p => ({ events: [...p.events, { id, status: 'upcoming', ...event }] }))
    return id
  }
  function updateEvent(id, patch) {
    setData(p => ({ events: p.events.map(e => e.id === id ? { ...e, ...patch } : e) }))
  }
  function deleteEvent(id) {
    setData(p => ({ events: p.events.filter(e => e.id !== id) }))
  }

  // --- Journal ---
  function addJournalEntry(entry) {
    const id = uid('j')
    setData(p => ({ journalEntries: [{ id, moods: [], moments: [], ...entry }, ...p.journalEntries] }))
    // also push LENS event
    const le = { id: uid('le'), source: 'journal', type: 'journal.mood', payload: { dayRating: entry.dayRating, date: entry.date }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    processGoalProgress(le)
    return id
  }
  function updateJournalEntry(id, patch) {
    setData(p => ({ journalEntries: p.journalEntries.map(e => e.id === id ? { ...e, ...patch } : e) }))
  }
  function deleteJournalEntry(id) {
    setData(p => ({ journalEntries: p.journalEntries.filter(e => e.id !== id) }))
  }

  // --- Jokes ---
  function addJoke(joke) {
    const id = uid('jk')
    setData(p => ({ jokes: [{ id, links: [], createdAt: new Date().toISOString(), ...joke }, ...(p.jokes || [])] }))
    return id
  }
  function updateJoke(id, patch) {
    setData(p => ({ jokes: (p.jokes || []).map(j => j.id === id ? { ...j, ...patch } : j) }))
  }
  function deleteJoke(id) {
    setData(p => ({
      jokes: (p.jokes || [])
        .filter(j => j.id !== id)
        .map(j => ({ ...j, links: (j.links || []).filter(l => l.jokeId !== id) }))
    }))
  }
  function addJokeLink(jokeId, targetId, note) {
    setData(p => ({
      jokes: (p.jokes || []).map(j =>
        j.id === jokeId
          ? { ...j, links: [...(j.links || []).filter(l => l.jokeId !== targetId), { jokeId: targetId, note }] }
          : j
      )
    }))
  }
  function deleteJokeLink(jokeId, targetId) {
    setData(p => ({
      jokes: (p.jokes || []).map(j =>
        j.id === jokeId ? { ...j, links: (j.links || []).filter(l => l.jokeId !== targetId) } : j
      )
    }))
  }

  // --- Performances ---
  function addPerformance(jokeId, perf) {
    const id = uid('perf')
    setData(p => ({ jokes: (p.jokes||[]).map(j => j.id===jokeId ? {...j, performances:[...(j.performances||[]),{id,...perf}]} : j) }))
  }
  function deletePerformance(jokeId, perfId) {
    setData(p => ({ jokes: (p.jokes||[]).map(j => j.id===jokeId ? {...j, performances:(j.performances||[]).filter(pf=>pf.id!==perfId)} : j) }))
  }

  // --- Variants ---
  function addVariant(jokeId, variant) {
    const id = uid('var')
    setData(p => ({ jokes: (p.jokes||[]).map(j => j.id===jokeId ? {...j, variants:[...(j.variants||[]),{id,preferred:false,createdAt:new Date().toISOString(),...variant}]} : j) }))
  }
  function updateVariant(jokeId, variantId, patch) {
    setData(p => ({ jokes: (p.jokes||[]).map(j => {
      if (j.id!==jokeId) return j
      const variants = (j.variants||[]).map(v => v.id===variantId ? {...v,...patch} : patch.preferred ? {...v,preferred:false} : v)
      return {...j,variants}
    })}))
  }
  function deleteVariant(jokeId, variantId) {
    setData(p => ({ jokes: (p.jokes||[]).map(j => j.id===jokeId ? {...j, variants:(j.variants||[]).filter(v=>v.id!==variantId)} : j) }))
  }

  // --- Inbox ---
  function addInboxItem(text) {
    const id = uid('inb')
    setData(p => ({ jokeInbox: [...(p.jokeInbox||[]), {id,text,createdAt:new Date().toISOString()}] }))
    return id
  }
  function deleteInboxItem(id) {
    setData(p => ({ jokeInbox: (p.jokeInbox||[]).filter(i=>i.id!==id) }))
  }
  function promoteInboxItem(id, { tag, status }) {
    setData(p => {
      const item = (p.jokeInbox||[]).find(i=>i.id===id)
      if (!item) return p
      const newJoke = { id:uid('jk'), text:item.text, tag:tag||'concept', status:status||'draft', createdAt:new Date().toISOString(), links:[], performances:[], variants:[], estMins:2 }
      return { jokes:[newJoke,...(p.jokes||[])], jokeInbox:(p.jokeInbox||[]).filter(i=>i.id!==id) }
    })
  }

  // --- Set Lists ---
  function addSetList(setList) {
    const id = uid('sl')
    setData(p => ({ setLists: [...(p.setLists||[]), {id,createdAt:new Date().toISOString().slice(0,10),items:[],...setList}] }))
    return id
  }
  function updateSetList(id, patch) {
    setData(p => ({ setLists: (p.setLists||[]).map(s=>s.id===id?{...s,...patch}:s) }))
  }
  function deleteSetList(id) {
    setData(p => ({ setLists: (p.setLists||[]).filter(s=>s.id!==id) }))
  }

  // --- Transactions ---
  function deleteTransaction(id) {
    setData(p => ({ transactions: p.transactions.filter(t => t.id !== id) }))
  }
  function updateTransaction(id, patch) {
    setData(p => ({ transactions: p.transactions.map(t => t.id === id ? { ...t, ...patch } : t) }))
  }
  function setBudgetLimit(category, amount) {
    setData(p => ({ budgetLimits: { ...p.budgetLimits, [category]: amount } }))
  }
  function deleteLensEvent(id) {
    setData(p => ({ lensEvents: p.lensEvents.filter(e => e.id !== id) }))
  }
  function addTransaction(tx) {
    const id = uid('t')
    const entry = { id, ...tx }
    setData(p => ({ transactions: [entry, ...p.transactions] }))
    const le = { id: uid('le'), source: 'financial', type: 'financial.transaction', payload: { merchant: tx.merchant, amount: tx.amount, category: tx.category }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    processGoalProgress(le)
    return id
  }

  // --- Lens Events ---
  function addLensEvent(le) {
    const entry = { id: uid('le'), ...le, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, entry] }))
    setSessionLensEvents(p => [...p, entry])
    processGoalProgress(entry)
    return entry.id
  }

  // --- Health Logs ---
  function addHealthLog(log) {
    const id = uid('hl')
    setData(p => ({
      healthLogs: [{ id, ...log }, ...p.healthLogs].sort((a, b) => b.date.localeCompare(a.date)),
    }))
    const le = { id: uid('le'), source: 'health', type: 'health.log', payload: { date: log.date, sleepHours: log.sleepHours, sleepQuality: log.sleepQuality, weightLbs: log.weightLbs, restingHR: log.restingHR }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    processGoalProgress(le)
    return id
  }
  function updateHealthLog(id, patch) {
    setData(p => ({ healthLogs: p.healthLogs.map(h => h.id === id ? { ...h, ...patch } : h) }))
  }
  function deleteHealthLog(id) {
    setData(p => ({ healthLogs: p.healthLogs.filter(h => h.id !== id) }))
  }

  // --- Media ---
  // --- Photo Albums ---
  function addPhotoAlbum(album) {
    const id = uid('pal')
    setData(p => ({ photoAlbums: [...p.photoAlbums, { id, coverColor: '#1a2a3a', ...album }] }))
    return id
  }
  function updatePhotoAlbum(id, patch) {
    setData(p => ({ photoAlbums: p.photoAlbums.map(a => a.id === id ? { ...a, ...patch } : a) }))
  }
  function deletePhotoAlbum(id) {
    setData(p => ({ photoAlbums: p.photoAlbums.filter(a => a.id !== id), photos: p.photos.filter(ph => ph.albumId !== id) }))
  }

  // --- Photos ---
  function addPhoto(photo) {
    const id = uid('pho')
    setData(p => ({ photos: [...p.photos, { id, tags: [], ...photo }] }))
    return id
  }
  function updatePhoto(id, patch) {
    setData(p => ({ photos: p.photos.map(ph => ph.id === id ? { ...ph, ...patch } : ph) }))
  }
  function deletePhoto(id) {
    setData(p => ({ photos: p.photos.filter(ph => ph.id !== id) }))
  }

  // --- Personal Media (recordings, home videos) ---
  function addPersonalMedia(entry) {
    const id = uid('prec')
    setData(p => ({ personalMedia: [...p.personalMedia, { id, date: new Date().toISOString().slice(0, 10), tags: [], ...entry }] }))
    return id
  }
  function updatePersonalMedia(id, patch) {
    setData(p => ({ personalMedia: p.personalMedia.map(m => m.id === id ? { ...m, ...patch } : m) }))
  }
  function deletePersonalMedia(id) {
    setData(p => ({ personalMedia: p.personalMedia.filter(m => m.id !== id) }))
  }

  // --- Video Collections ---
  function addVideoCollection(col) {
    const id = uid('vc')
    setData(p => ({ videoCollections: [...p.videoCollections, { id, coverColor: '#1a2a3a', ...col }] }))
    return id
  }
  function updateVideoCollection(id, patch) {
    setData(p => ({ videoCollections: p.videoCollections.map(c => c.id === id ? { ...c, ...patch } : c) }))
  }
  function deleteVideoCollection(id) {
    setData(p => ({ videoCollections: p.videoCollections.filter(c => c.id !== id), videos: p.videos.filter(v => v.collectionId !== id) }))
  }

  // --- Videos ---
  function addVideo(video) {
    const id = uid('vid')
    setData(p => ({ videos: [...p.videos, { id, tags: [], durationSecs: null, ...video }] }))
    return id
  }
  function updateVideo(id, patch) {
    setData(p => ({ videos: p.videos.map(v => v.id === id ? { ...v, ...patch } : v) }))
  }
  function deleteVideo(id) {
    setData(p => ({ videos: p.videos.filter(v => v.id !== id) }))
  }

  function addMediaEntry(entry) {
    const id = uid('med')
    setData(p => ({ mediaLog: [{ id, date: new Date().toISOString().slice(0, 10), ...entry }, ...p.mediaLog] }))
    return id
  }
  function updateMediaEntry(id, patch) {
    const prev = data.mediaLog.find(m => m.id === id)
    setData(p => ({ mediaLog: p.mediaLog.map(m => m.id === id ? { ...m, ...patch } : m) }))
    if (prev && prev.status !== 'completed' && patch.status === 'completed') {
      const le = { id: uid('le'), source: 'media', type: 'media.completed', payload: { title: prev.title, mediaType: prev.type }, recordedAt: new Date().toISOString() }
      setData(p => ({ lensEvents: [...p.lensEvents, le] }))
      processGoalProgress(le)
    }
  }
  function deleteMediaEntry(id) {
    setData(p => ({ mediaLog: p.mediaLog.filter(m => m.id !== id) }))
  }

  function updateMediaFile(id, patch) {
    setData(p => ({ mediaLog: p.mediaLog.map(m => m.id === id ? { ...m, ...patch } : m) }))
  }
  // Helper: apply an updater to whichever media array contains mediaId
  function applyToMedia(mediaId, updater) {
    setData(p => {
      if (p.mediaLog.some(m => m.id === mediaId))
        return { mediaLog: p.mediaLog.map(m => m.id !== mediaId ? m : updater(m)) }
      if ((p.personalMedia || []).some(m => m.id === mediaId))
        return { personalMedia: (p.personalMedia || []).map(m => m.id !== mediaId ? m : updater(m)) }
      if ((p.videos || []).some(m => m.id === mediaId))
        return { videos: (p.videos || []).map(m => m.id !== mediaId ? m : updater(m)) }
      return {}
    })
  }

  function addMediaChapter(mediaId, chapter) {
    const id = uid('ch')
    applyToMedia(mediaId, m => ({ ...m, chapters: [...(m.chapters || []), { id, ...chapter }] }))
  }
  function updateMediaChapter(mediaId, chapterId, patch) {
    applyToMedia(mediaId, m => ({ ...m, chapters: (m.chapters || []).map(c => c.id === chapterId ? { ...c, ...patch } : c) }))
  }
  function deleteMediaChapter(mediaId, chapterId) {
    applyToMedia(mediaId, m => ({ ...m, chapters: (m.chapters || []).filter(c => c.id !== chapterId) }))
  }
  function addMediaAnnotation(mediaId, annotation) {
    const id = uid('an')
    applyToMedia(mediaId, m => ({ ...m, annotations: [...(m.annotations || []), { id, ...annotation }] }))
  }
  function updateMediaAnnotation(mediaId, annotationId, patch) {
    applyToMedia(mediaId, m => ({ ...m, annotations: (m.annotations || []).map(a => a.id === annotationId ? { ...a, ...patch } : a) }))
  }
  function deleteMediaAnnotation(mediaId, annotationId) {
    applyToMedia(mediaId, m => ({ ...m, annotations: (m.annotations || []).filter(a => a.id !== annotationId) }))
  }
  function addMediaComment(mediaId, comment) {
    const id = uid('mc')
    const full = { id, authorHandle: data.user.handle, authorName: data.user.name, timestamp: new Date().toISOString(), postedToFeed: false, ...comment }
    applyToMedia(mediaId, m => ({ ...m, comments: [...(m.comments || []), full] }))
    return id
  }
  function deleteMediaComment(mediaId, commentId) {
    applyToMedia(mediaId, m => ({ ...m, comments: (m.comments || []).filter(c => c.id !== commentId) }))
  }

  // --- Media Branches ---
  function addMediaBranch(mediaId, branch) {
    const id = uid('br')
    applyToMedia(mediaId, m => ({ ...m, branches: [...(m.branches || []), { id, ...branch }] }))
  }
  function updateMediaBranch(mediaId, branchId, patch) {
    applyToMedia(mediaId, m => ({ ...m, branches: (m.branches || []).map(b => b.id === branchId ? { ...b, ...patch } : b) }))
  }
  function deleteMediaBranch(mediaId, branchId) {
    applyToMedia(mediaId, m => ({ ...m, branches: (m.branches || []).filter(b => b.id !== branchId) }))
  }
  function rateBranchOption(mediaId, branchId, optionId, vote) {
    applyToMedia(mediaId, m => ({
      ...m, branches: (m.branches || []).map(b => {
        if (b.id !== branchId) return b
        return { ...b, options: b.options.map(o => {
          if (o.id !== optionId) return o
          const prev = o.userVote
          const up   = o.ratings.up   + (vote === 'up'   ? 1 : 0) - (prev === 'up'   ? 1 : 0)
          const down = o.ratings.down + (vote === 'down'  ? 1 : 0) - (prev === 'down'  ? 1 : 0)
          return { ...o, userVote: prev === vote ? null : vote, ratings: { up, down } }
        })}
      })
    }))
  }

  // --- Media Presets (creator) ---
  function addMediaPreset(mediaId, preset) {
    const id = uid('pr')
    applyToMedia(mediaId, m => ({ ...m, presets: [...(m.presets || []), { id, ...preset }] }))
  }
  function updateMediaPreset(mediaId, presetId, patch) {
    applyToMedia(mediaId, m => ({ ...m, presets: (m.presets || []).map(pr => pr.id === presetId ? { ...pr, ...patch } : pr) }))
  }
  function deleteMediaPreset(mediaId, presetId) {
    applyToMedia(mediaId, m => ({ ...m, presets: (m.presets || []).filter(pr => pr.id !== presetId) }))
  }

  // --- Viewer Presets (personal, cross-media) ---
  function addViewerPreset(preset) {
    const id = uid('vp')
    setData(p => ({ viewerPresets: [...(p.viewerPresets || []), { id, ...preset }] }))
    return id
  }
  function updateViewerPreset(id, patch) {
    setData(p => ({ viewerPresets: (p.viewerPresets || []).map(vp => vp.id === id ? { ...vp, ...patch } : vp) }))
  }
  function deleteViewerPreset(id) {
    setData(p => ({ viewerPresets: (p.viewerPresets || []).filter(vp => vp.id !== id) }))
  }

  // --- Tag Comments ---
  function addTagComment(mediaId, comment) {
    const id = uid('tc')
    const full = { id, authorHandle: data.user.handle, authorName: data.user.name, timestamp: new Date().toISOString(), postedToFeed: false, ...comment }
    applyToMedia(mediaId, m => ({ ...m, tagComments: [...(m.tagComments || []), full] }))
  }
  function deleteTagComment(mediaId, commentId) {
    applyToMedia(mediaId, m => ({ ...m, tagComments: (m.tagComments || []).filter(tc => tc.id !== commentId) }))
  }
  function addMediaCommentary(mediaId, entry) {
    const id = uid('cmnt')
    applyToMedia(mediaId, m => ({ ...m, commentary: [...(m.commentary || []), { id, ...entry }] }))
  }
  function deleteMediaCommentary(mediaId, cmntId) {
    applyToMedia(mediaId, m => ({ ...m, commentary: (m.commentary || []).filter(c => c.id !== cmntId) }))
  }
  function addLinkComment(mediaId, annotationId, comment) {
    const id = uid('lc')
    const full = { id, authorHandle: data.user.handle, authorName: data.user.name, ts: new Date().toISOString(), ...comment }
    applyToMedia(mediaId, m => ({
      ...m, annotations: (m.annotations || []).map(a =>
        a.id !== annotationId ? a : { ...a, linkComments: [...(a.linkComments || []), full] }
      )
    }))
  }
  function deleteLinkComment(mediaId, annotationId, commentId) {
    applyToMedia(mediaId, m => ({
      ...m, annotations: (m.annotations || []).map(a =>
        a.id !== annotationId ? a : { ...a, linkComments: (a.linkComments || []).filter(c => c.id !== commentId) }
      )
    }))
  }

  // --- Learning ---
  function addSkill(skill) {
    const id = uid('sk')
    setData(p => ({ skills: [...p.skills, { id, level: 1, targetLevel: 5, resources: [], ...skill }] }))
    return id
  }
  function updateSkill(id, patch) {
    setData(p => ({ skills: p.skills.map(s => s.id === id ? { ...s, ...patch } : s) }))
    if (patch.level != null) {
      const le = { id: uid('le'), source: 'learning', type: 'learning.skill_updated', payload: { skillId: id, level: patch.level }, recordedAt: new Date().toISOString() }
      setData(p => ({ lensEvents: [...p.lensEvents, le] }))
      processGoalProgress(le)
    }
  }
  function deleteSkill(id) {
    setData(p => ({ skills: p.skills.filter(s => s.id !== id) }))
  }

  // --- Travel ---
  function addTrip(trip) {
    const id = uid('tr')
    setData(p => ({ trips: [{ id, status: 'planned', packing: [], companions: [], ...trip }, ...p.trips] }))
    return id
  }
  function updateTrip(id, patch) {
    setData(p => ({ trips: p.trips.map(t => t.id === id ? { ...t, ...patch } : t) }))
  }
  function deleteTrip(id) {
    setData(p => ({ trips: p.trips.filter(t => t.id !== id) }))
  }
  function addPackingItem(tripId, item) {
    const iid = uid('pk')
    setData(p => ({ trips: p.trips.map(t => t.id === tripId ? { ...t, packing: [...t.packing, { id: iid, packed: false, item }] } : t) }))
  }
  function togglePackingItem(tripId, itemId) {
    setData(p => ({ trips: p.trips.map(t => t.id === tripId ? { ...t, packing: t.packing.map(i => i.id === itemId ? { ...i, packed: !i.packed } : i) } : t) }))
  }
  function deletePackingItem(tripId, itemId) {
    setData(p => ({ trips: p.trips.map(t => t.id === tripId ? { ...t, packing: t.packing.filter(i => i.id !== itemId) } : t) }))
  }

  // --- Research ---
  function addResearch(item) {
    const id = uid('re')
    setData(p => ({ research: [{ id, status: 'active', tags: [], sources: [], notes: '', createdAt: new Date().toISOString().slice(0, 10), ...item }, ...p.research] }))
    return id
  }
  function updateResearch(id, patch) {
    setData(p => ({ research: p.research.map(r => r.id === id ? { ...r, ...patch } : r) }))
  }
  function deleteResearch(id) {
    setData(p => ({ research: p.research.filter(r => r.id !== id) }))
  }
  function addResearchSource(researchId, source) {
    const sid = uid('rs')
    setData(p => ({ research: p.research.map(r => r.id === researchId ? { ...r, sources: [...(r.sources || []), { id: sid, ...source }] } : r) }))
  }
  function deleteResearchSource(researchId, sourceId) {
    setData(p => ({ research: p.research.map(r => r.id === researchId ? { ...r, sources: (r.sources || []).filter(s => s.id !== sourceId) } : r) }))
  }
  function updateResearchSource(researchId, sourceId, patch) {
    setData(p => ({
      research: p.research.map(r =>
        r.id !== researchId ? r : { ...r, sources: (r.sources || []).map(s => s.id === sourceId ? { ...s, ...patch } : s) }
      ),
    }))
  }

  // --- Posthumous ---
  function updatePosthumous(patch) {
    setData(p => ({ posthumous: { ...p.posthumous, ...patch } }))
  }
  function addPosthumousMessage(msg) {
    const id = uid('pm')
    const entry = { id, status: 'sealed', createdAt: new Date().toISOString().slice(0, 10), ...msg }
    setData(p => ({ posthumous: { ...p.posthumous, messages: [...p.posthumous.messages, entry] } }))
    return id
  }
  function updatePosthumousMessage(id, patch) {
    setData(p => ({ posthumous: { ...p.posthumous, messages: p.posthumous.messages.map(m => m.id === id ? { ...m, ...patch } : m) } }))
  }
  function deletePosthumousMessage(id) {
    setData(p => ({ posthumous: { ...p.posthumous, messages: p.posthumous.messages.filter(m => m.id !== id) } }))
  }

  // --- Agreements ---
  function addAgreement(ag) {
    const id = uid('ag')
    setData(p => ({ agreements: [{ id, status: 'active', signed: false, tags: [], parties: [], ...ag }, ...p.agreements] }))
    return id
  }
  function updateAgreement(id, patch) {
    setData(p => ({ agreements: p.agreements.map(a => a.id === id ? { ...a, ...patch } : a) }))
  }
  function deleteAgreement(id) {
    setData(p => ({ agreements: p.agreements.filter(a => a.id !== id) }))
  }

  // --- Lists ---
  function addList(list) {
    const id = uid('li')
    setData(p => ({ lists: [...p.lists, { id, items: [], type: 'Checklist', ...list }] }))
    return id
  }
  function updateList(id, patch) {
    setData(p => ({ lists: p.lists.map(l => l.id === id ? { ...l, ...patch } : l) }))
  }
  function deleteList(id) {
    setData(p => ({ lists: p.lists.filter(l => l.id !== id) }))
  }
  function addListItem(listId, item) {
    const iid = uid('li' + listId.slice(-2))
    setData(p => ({ lists: p.lists.map(l => l.id === listId ? { ...l, items: [...l.items, { id: iid, done: false, note: '', ...item }] } : l) }))
  }
  function toggleListItem(listId, itemId) {
    setData(p => ({ lists: p.lists.map(l => l.id === listId ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : l) }))
  }
  function deleteListItem(listId, itemId) {
    setData(p => ({ lists: p.lists.map(l => l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l) }))
  }

  // --- Places ---
  function addPlace(place) {
    const id = uid('pl')
    setData(p => ({ places: [...p.places, { id, friendsOnStaff: [], friendsFrequent: [], tags: [], rating: 3, ...place }] }))
    return id
  }
  function updatePlace(id, patch) {
    setData(p => ({ places: p.places.map(pl => pl.id === id ? { ...pl, ...patch } : pl) }))
  }
  function deletePlace(id) {
    setData(p => ({
      places: p.places.filter(pl => pl.id !== id),
      savedPlaces: p.savedPlaces.filter(x => x !== id),
      checkins: p.checkins.filter(ci => ci.placeId !== id),
    }))
  }

  // --- Around Town ---
  function toggleSavedPlace(id) {
    setData(p => ({
      savedPlaces: p.savedPlaces.includes(id) ? p.savedPlaces.filter(x => x !== id) : [...p.savedPlaces, id],
    }))
  }
  function addCheckin(checkin) {
    const id = uid('ci')
    setData(p => ({ checkins: [{ id, date: new Date().toISOString().slice(0, 10), ...checkin }, ...p.checkins] }))
    return id
  }
  function deleteCheckin(id) {
    setData(p => ({ checkins: p.checkins.filter(c => c.id !== id) }))
  }

  // --- Contacts ---
  function addContact(c) {
    const id = uid('c')
    setData(p => ({ contacts: [...p.contacts, { id, tags: [], ...c }] }))
    return id
  }
  function updateContact(id, patch) {
    setData(p => ({ contacts: p.contacts.map(c => c.id === id ? { ...c, ...patch } : c) }))
  }
  function deleteContact(id) {
    setData(p => ({ contacts: p.contacts.filter(c => c.id !== id) }))
  }
  function addContactCustomField(field) {
    const id = uid('cf')
    setData(p => ({ contactCustomFields: [...(p.contactCustomFields || []), { id, ...field }] }))
  }
  function deleteContactCustomField(id) {
    setData(p => ({ contactCustomFields: (p.contactCustomFields || []).filter(f => f.id !== id) }))
  }
  function addContactReminder(reminder) {
    const id = uid('cr')
    setData(p => ({ contactReminders: [...(p.contactReminders || []), { id, ...reminder }] }))
    return id
  }
  function updateContactReminder(id, patch) {
    setData(p => ({ contactReminders: (p.contactReminders || []).map(r => r.id === id ? { ...r, ...patch } : r) }))
  }
  function deleteContactReminder(id) {
    setData(p => ({ contactReminders: (p.contactReminders || []).filter(r => r.id !== id) }))
  }

  // --- Groups ---
  function addGroup(g) {
    const id = uid('gr')
    setData(p => ({ groups: [...p.groups, { id, members: [], ...g }] }))
    return id
  }
  function updateGroup(id, patch) {
    setData(p => ({ groups: p.groups.map(g => g.id === id ? { ...g, ...patch } : g) }))
  }
  function deleteGroup(id) {
    setData(p => ({ groups: p.groups.filter(g => g.id !== id) }))
  }

  // --- Meal Logs ---
  function addMealLog(log) {
    const id = uid('ml')
    setData(p => ({ mealLogs: [{ id, ...log }, ...p.mealLogs].sort((a, b) => b.date.localeCompare(a.date) || a.meal.localeCompare(b.meal)) }))
    const le = { id: uid('le'), source: 'diet', type: 'diet.meal', payload: { meal: log.meal, date: log.date, calories: log.calories }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    processGoalProgress(le)
    return id
  }
  function deleteMealLog(id) {
    setData(p => ({ mealLogs: p.mealLogs.filter(m => m.id !== id) }))
  }
  function updateMealLog(id, patch) {
    setData(p => ({ mealLogs: p.mealLogs.map(m => m.id === id ? { ...m, ...patch } : m) }))
  }

  // --- Personal Bests ---
  function addPersonalBest(pb) {
    const id = uid('pb')
    setData(p => ({ personalBests: [{ id, ...pb }, ...p.personalBests] }))
    return id
  }
  function deletePersonalBest(id) {
    setData(p => ({ personalBests: p.personalBests.filter(pb => pb.id !== id) }))
  }

  // --- Plans ---
  function addPlan(plan) {
    const id = uid('plan')
    const entry = { id, taskGroups: [], createdAt: new Date().toISOString().slice(0, 10), ...plan }
    setData(p => ({ plans: [...p.plans, entry] }))
    if (plan.goalId) setData(p => ({ goals: p.goals.map(g => g.id === plan.goalId ? { ...g, planId: id } : g) }))
    const le = { id: uid('le'), source: 'planner', type: 'planner.plan_created', payload: { planId: id, name: plan.name }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    return id
  }
  function updatePlan(id, patch) {
    setData(p => ({ plans: p.plans.map(pl => pl.id === id ? { ...pl, ...patch } : pl) }))
  }
  function deletePlan(id) {
    setData(p => ({
      plans: p.plans.filter(pl => pl.id !== id),
      planTasks: p.planTasks.filter(t => t.planId !== id),
      goals: p.goals.map(g => g.planId === id ? { ...g, planId: null } : g),
    }))
  }

  // --- Task Groups ---
  function addTaskGroup(planId, group) {
    const id = uid('tg')
    const entry = { id, ...group }
    setData(p => ({ plans: p.plans.map(pl => pl.id === planId ? { ...pl, taskGroups: [...pl.taskGroups, entry] } : pl) }))
    return id
  }
  function deleteTaskGroup(planId, groupId) {
    setData(p => ({
      plans: p.plans.map(pl => pl.id === planId ? { ...pl, taskGroups: pl.taskGroups.filter(tg => tg.id !== groupId) } : pl),
      planTasks: p.planTasks.map(t => t.groupId === groupId ? { ...t, groupId: null } : t),
    }))
  }

  // --- Plan Tasks ---
  function addPlanTask(task) {
    const id = uid('pt')
    const entry = { id, status: 'pending', estMins: 0, estCost: 0, deps: [], notes: '', parentId: null, actualMins: null, actualCost: null, scheduledEventId: null, linkedListIds: [], countsTowardGoal: false, ...task }
    setData(p => ({ planTasks: [...p.planTasks, entry] }))
    const le = { id: uid('le'), source: 'planner', type: 'planner.task_added', payload: { taskId: id, planId: task.planId, title: task.title }, recordedAt: new Date().toISOString() }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    return id
  }
  function updatePlanTask(id, patch) {
    setData(p => {
      const planTasks = p.planTasks.map(t => t.id === id ? { ...t, ...patch } : t)
      if (patch.status !== 'done') return { planTasks }
      const task = planTasks.find(t => t.id === id)
      const plan = p.plans.find(pl => pl.id === task?.planId)
      if (!plan?.goalId || !plan.taskGroups?.length) return { planTasks }
      const topLevel = planTasks.filter(t => t.planId === plan.id && !t.parentId)
      const completedGroups = plan.taskGroups.filter(g => {
        const gt = topLevel.filter(t => t.groupId === g.id)
        return gt.length > 0 && gt.every(t => t.status === 'done')
      }).length
      const progress = Math.round((completedGroups / plan.taskGroups.length) * 100)
      return { planTasks, goals: p.goals.map(g => g.id === plan.goalId ? { ...g, progress } : g) }
    })
    if (patch.status === 'done') {
      const le = { id: uid('le'), source: 'planner', type: 'planner.task_done', payload: { taskId: id }, recordedAt: new Date().toISOString() }
      setData(p => ({ lensEvents: [...p.lensEvents, le] }))
      setSessionLensEvents(p => [...p, le])
      // If task counts toward goal, also emit a goal-progress LENS event
      setData(p => {
        const task = p.planTasks.find(t => t.id === id)
        if (!task?.countsTowardGoal) return {}
        const plan = p.plans.find(pl => pl.id === task.planId)
        if (!plan?.goalId) return {}
        const goalLe = { id: uid('le'), source: 'planner', type: 'planner.goal_task_done', payload: { taskId: id, goalId: plan.goalId, title: task.title }, recordedAt: new Date().toISOString() }
        return { lensEvents: [...p.lensEvents, goalLe] }
      })
      computeAchievements()
    }
  }
  function deletePlanTask(id) {
    setData(p => ({ planTasks: p.planTasks.filter(t => t.id !== id && t.parentId !== id) }))
  }

  function savePlanTemplate(tmpl) {
    const id = uid('spt')
    setData(p => ({ savedPlanTemplates: [...(p.savedPlanTemplates || []), { id, createdAt: new Date().toISOString(), ...tmpl }] }))
    return id
  }
  function deletePlanTemplate(id) {
    setData(p => ({ savedPlanTemplates: (p.savedPlanTemplates || []).filter(t => t.id !== id) }))
  }

  function schedulePlanTask(taskId, dateTime) {
    const task = data.planTasks.find(t => t.id === taskId)
    if (!task) return null
    const eventId = uid('e')
    const startDt = new Date(dateTime)
    const endDt = new Date(startDt.getTime() + (task.estMins || 60) * 60000)
    const fmt = d => d.toISOString().slice(0, 16)
    setData(p => ({
      events: [...p.events, { id: eventId, title: task.title, type: 'task', taskId, routineId: null, start: fmt(startDt), end: fmt(endDt), status: 'upcoming' }],
      planTasks: p.planTasks.map(t => t.id === taskId ? { ...t, scheduledEventId: eventId } : t),
    }))
    return eventId
  }

  function computeAchievements() {
    const TIERS = [
      { key: 'bronze',   weeks: 1,  credits: 10,  badge: '🥉' },
      { key: 'silver',   weeks: 3,  credits: 30,  badge: '🥈' },
      { key: 'gold',     weeks: 7,  credits: 70,  badge: '🥇' },
      { key: 'platinum', weeks: 12, credits: 120, badge: '💎' },
      { key: 'diamond',  weeks: 24, credits: 240, badge: '💠' },
    ]
    const rank = { bronze: 0, silver: 1, gold: 2, platinum: 3, diamond: 4 }
    setData(p => {
      let achs = [...p.achievements]
      function upsert(name, ach) {
        const i = achs.findIndex(a => a.name === name && !a.isCustom)
        if (i === -1) achs.push(ach)
        else if (rank[achs[i].tier] < rank[ach.tier]) achs[i] = { ...achs[i], ...ach }
      }
      p.routines.forEach(r => {
        const top = TIERS.slice().reverse().find(t => r.streak >= t.weeks)
        if (top) upsert(`${r.name} streak`, { id: uid('a'), name: `${r.name} streak`, tier: top.key, streak: r.streak, credits: top.credits, badge: top.badge, routineId: r.id })
      })
      p.goals.forEach(g => {
        if (g.progress >= 100) upsert(`${g.name} complete`, { id: uid('a'), name: `${g.name} complete`, tier: 'gold', streak: 0, credits: 100, badge: '🥇', goalId: g.id })
      })
      p.plans.forEach(plan => {
        const tasks = p.planTasks.filter(t => t.planId === plan.id && !t.parentId)
        if (tasks.length > 0 && tasks.every(t => t.status === 'done'))
          upsert(`${plan.name} complete`, { id: uid('a'), name: `${plan.name} complete`, tier: 'gold', streak: 0, credits: 50, badge: '🏆', planId: plan.id })
      })
      // Evaluate custom achievement triggers
      achs = achs.map(a => {
        if (!a.isCustom || a.earned || a.triggerType === 'manual') return a
        let earned = false
        if (a.triggerType === 'tasks' && a.triggerEntityId) {
          const done = p.planTasks.filter(t => t.planId === a.triggerEntityId && t.status === 'done').length
          earned = done >= (a.triggerValue ?? 1)
        } else if (a.triggerType === 'progress' && a.triggerEntityId) {
          const g = p.goals.find(g => g.id === a.triggerEntityId)
          earned = g ? (g.progress ?? 0) >= (a.triggerValue ?? 100) : false
        } else if (a.triggerType === 'streak' && a.triggerEntityId) {
          const r = p.routines.find(r => r.id === a.triggerEntityId)
          earned = r ? (r.streak ?? 0) >= (a.triggerValue ?? 1) : false
        }
        return earned ? { ...a, earned: true } : a
      })
      return { achievements: achs }
    })
  }

  function addAchievement(ach) {
    const id = uid('a')
    setData(p => ({ achievements: [...p.achievements, { id, earned: false, isCustom: true, ...ach }] }))
    return id
  }

  function updateAchievement(id, patch) {
    setData(p => ({ achievements: p.achievements.map(a => a.id === id ? { ...a, ...patch } : a) }))
  }

  function deleteAchievement(id) {
    setData(p => ({ achievements: p.achievements.filter(a => a.id !== id) }))
  }

  function processGoalProgress(le) {
    setData(p => ({
      goals: p.goals.map(g => {
        const apps = g.apps || []
        if (le.type === 'fitness.workout' && g.type === 'frequency' && apps.includes('fitness'))
          return { ...g, currentWeek: (g.currentWeek || 0) + 1 }
        if (le.type === 'fitness.run' && g.type === 'milestone' && apps.includes('fitness')) {
          const dist = le.payload?.distance || 0
          return { ...g, progress: Math.max(g.progress || 0, Math.min(100, Math.round((dist / 5) * 100))) }
        }
        if (le.type === 'financial.transaction' && g.type === 'threshold' && apps.includes('financial') && (le.payload?.amount || 0) < 0)
          return { ...g, currentMonth: (g.currentMonth || 0) + Math.abs(le.payload?.amount || 0) }
        if (le.type === 'diet.meal' && g.type === 'frequency' && apps.includes('diet'))
          return { ...g, currentWeek: (g.currentWeek || 0) + 1 }
        if (le.type === 'journal.mood' && g.type === 'habit' && apps.includes('journal'))
          return { ...g, currentWeek: (g.currentWeek || 0) + 1 }
        if (le.type === 'media.completed' && g.type === 'milestone' && apps.includes('media') && le.payload?.mediaType === 'Book') {
          const booksRead = (g.booksRead || 0) + 1
          return { ...g, booksRead, progress: Math.min(100, Math.round((booksRead / (g.target || 12)) * 100)) }
        }
        // Health: each log entry advances health frequency/habit goals
        if (le.type === 'health.log' && apps.includes('health')) {
          const next = (g.currentWeek || 0) + 1
          const prog = g.target ? Math.min(100, Math.round((next / g.target) * 100)) : g.progress || 0
          return { ...g, currentWeek: next, progress: prog }
        }
        // Kenoma: resisted a habit linked to this goal → advance frequency/habit goals
        if (le.type === 'kenoma.resisted' && apps.includes('kenoma')) {
          const habit = p.habits?.find(h => h.id === le.payload?.habitId)
          if (habit && habit.goalId === g.id) {
            const next = (g.currentWeek || 0) + 1
            const prog = g.target ? Math.min(100, Math.round((next / g.target) * 100)) : g.progress || 0
            return { ...g, currentWeek: next, progress: prog }
          }
        }
        return g
      }),
    }))
  }

  // --- Complete event (cross-app workflow) ---
  function completeEvent(eventId, reflection) {
    const event = data.events.find(e => e.id === eventId)
    if (!event) return
    updateEvent(eventId, { status: 'finished' })

    // If linked to a plan task, mark it done with actuals
    if (event.taskId) {
      const patch = { status: 'done' }
      if (reflection?.actualMins != null && reflection.actualMins !== '') patch.actualMins = Number(reflection.actualMins)
      if (reflection?.actualCost != null && reflection.actualCost !== '') patch.actualCost = Number(reflection.actualCost)
      updatePlanTask(event.taskId, patch)
    }

    const isWorkout = event.type === 'exercise'
    const le = {
      id: uid('le'),
      source: 'scheduler',
      type: isWorkout ? 'fitness.workout' : 'life.event',
      payload: {
        title: event.title,
        durationMins: reflection?.durationMins,
        mood: reflection?.mood,
        notes: reflection?.notes,
      },
      recordedAt: new Date().toISOString(),
    }
    setData(p => ({ lensEvents: [...p.lensEvents, le] }))
    setSessionLensEvents(p => [...p, le])
    processGoalProgress(le)

    if (reflection?.mood) {
      const eventDate = event.start.slice(0, 10)
      const moodPoint = { time: event.start.slice(11, 16) || '12:00', mood: reflection.mood, note: reflection.notes }
      setData(prev => {
        const existing = prev.journalEntries.find(e => e.date === eventDate)
        if (existing) {
          return { journalEntries: prev.journalEntries.map(e => e.id === existing.id ? { ...e, moods: [...(e.moods || []), moodPoint] } : e) }
        }
        return {
          journalEntries: [{
            id: uid('j'), date: eventDate,
            title: `Reflection — ${eventDate}`, type: 'reflection',
            dayRating: reflection.mood,
            highlight: reflection.notes || `Completed ${event.title}`,
            longForm: '', moods: [moodPoint], moments: [],
          }, ...prev.journalEntries],
        }
      })
    }
  }

  // --- Posts ---
  function addSpacePost(post) {
    const id = uid('sp')
    setData(p => ({
      spacePosts: [{ id, author: { handle: p.user.handle, name: p.user.name }, likes: 0, comments: 0, timestamp: new Date().toISOString(), ...post }, ...p.spacePosts],
    }))
  }

  // --- Social ---
  function followUser(handle) {
    setData(p => {
      const existing = p.connections.find(c => c.handle === handle)
      if (!existing) return p
      if (existing.status === 'following' || existing.status === 'mutual') {
        const newStatus = existing.status === 'mutual' ? 'follower' : 'suggested'
        return {
          connections: p.connections.map(c => c.handle === handle ? { ...c, status: newStatus } : c),
          user: { ...p.user, stats: { ...p.user.stats, following: Math.max(0, p.user.stats.following - 1) } },
        }
      }
      const newStatus = existing.status === 'follower' ? 'mutual' : 'following'
      return {
        connections: p.connections.map(c => c.handle === handle ? { ...c, status: newStatus } : c),
        user: { ...p.user, stats: { ...p.user.stats, following: p.user.stats.following + 1 } },
      }
    })
  }
  function sendMessage(conversationId, text) {
    const msg = { id: uid('m'), from: data.user.handle, text, timestamp: new Date().toISOString() }
    setData(p => ({
      conversations: p.conversations.map(cv =>
        cv.id !== conversationId ? cv : {
          ...cv, messages: [...cv.messages, msg],
          lastMessage: text, timestamp: msg.timestamp, unread: 0,
        }
      ),
    }))
  }
  function markConversationRead(id) {
    setData(p => ({ conversations: p.conversations.map(cv => cv.id === id ? { ...cv, unread: 0 } : cv) }))
  }
  function markNotificationRead(id) {
    setData(p => ({
      notifications: id === 'all'
        ? p.notifications.map(n => ({ ...n, read: true }))
        : p.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }))
  }
  function joinGroup(id) {
    setData(p => ({ spaceGroups: p.spaceGroups.map(g => g.id === id ? { ...g, joined: true, members: g.members + 1 } : g) }))
  }
  function leaveGroup(id) {
    setData(p => ({ spaceGroups: p.spaceGroups.map(g => g.id === id ? { ...g, joined: false, members: g.members - 1 } : g) }))
  }
  function deletePost(id) {
    setData(p => ({
      spacePosts: (p.spacePosts || []).filter(x => x.id !== id),
      feedPosts:  (p.feedPosts  || []).filter(x => x.id !== id),
    }))
  }
  function updateUser(patch) {
    setData(p => ({ user: { ...p.user, ...patch } }))
  }

  // --- Feed ---
  function setFeedAlgorithm(algo) {
    setData(p => ({ feedAlgorithm: algo }))
  }

  // --- Share to SPACE ---
  function shareToSpace(content, metadata) {
    const id = uid('sp')
    const fpId = uid('fp')
    const now = new Date().toISOString()
    setData(p => ({
      spacePosts: [{ id, author: { handle: p.user.handle, name: p.user.name }, content, likes: 0, comments: 0, timestamp: now, ...(metadata || {}) }, ...p.spacePosts],
      feedPosts:  [{ id: fpId, author: { handle: p.user.handle, name: p.user.name }, content, likes: 0, comments: 0, timestamp: now, ...(metadata || {}) }, ...(p.feedPosts || [])],
    }))
  }

  // --- Conversations ---
  function addConversation(contact) {
    const existing = data.conversations.find(cv => cv.handle === contact.handle)
    if (existing) return existing.id
    const id = uid('cv')
    setData(p => ({
      conversations: [{ id, handle: contact.handle, name: contact.name, avatar: contact.avatar || 'linear-gradient(135deg,#a78bfa,#60a5fa)', lastMessage: '', timestamp: new Date().toISOString(), unread: 0, messages: [] }, ...p.conversations],
    }))
    return id
  }

  // --- Space groups ---
  function addSpaceGroup(group) {
    const id = uid('sg')
    setData(p => ({
      spaceGroups: [{ id, name: group.name, category: group.category, description: group.description || '', members: 1, joined: true, privacy: group.privacy || 'public', emoji: group.emoji || '🌐', posts: [] }, ...p.spaceGroups],
    }))
    return id
  }

  // --- Contacts ↔ Connections bridge ---
  function addConnectionFromContact(contactId) {
    setData(p => {
      const contact = p.contacts.find(c => c.id === contactId)
      if (!contact?.handle) return p
      if (p.connections.some(cn => cn.handle === contact.handle)) return p
      return {
        connections: [...p.connections, { id: uid('cn'), handle: contact.handle, name: contact.name, title: contact.profession || contact.company || '', avatar: 'linear-gradient(135deg,#a78bfa,#60a5fa)', status: 'following', mutuals: 0 }],
      }
    })
  }
  function addContactFromConnection(connectionHandle) {
    setData(p => {
      const conn = p.connections.find(cn => cn.handle === connectionHandle)
      if (!conn) return p
      if (p.contacts.some(c => c.handle === connectionHandle)) return p
      return {
        contacts: [...p.contacts, { id: uid('c'), name: conn.name, handle: conn.handle, email: '', phone: '', tags: [], note: '', profession: conn.title || '', company: '', location: '', contact_methods: [], social_handles: [], customFields: {} }],
      }
    })
  }
  function updateLensEvent(id, patch) {
    setData(p => ({ lensEvents: p.lensEvents.map(e => e.id === id ? { ...e, ...patch } : e) }))
  }
  function addGroupPost(groupId, post) {
    const id = uid('sgp')
    setData(p => ({
      spaceGroups: p.spaceGroups.map(g =>
        g.id !== groupId ? g : {
          ...g,
          posts: [{ id, author: { handle: p.user.handle, name: p.user.name }, content: post.content, likes: 0, comments: 0, timestamp: new Date().toISOString() }, ...(g.posts || [])],
        }
      ),
    }))
  }
  function deleteGroupPost(groupId, postId) {
    setData(p => ({
      spaceGroups: p.spaceGroups.map(g =>
        g.id !== groupId ? g : { ...g, posts: (g.posts || []).filter(x => x.id !== postId) }
      ),
    }))
  }

  // --- Space Pages & Blocks ---
  function addSpacePage(page) {
    const id = uid('spage')
    setData(p => ({ spacePages: [...(p.spacePages||[]), { id, blocks: [], ...page }] }))
    return id
  }
  function updateSpacePage(id, patch) {
    setData(p => ({ spacePages: (p.spacePages||[]).map(pg => pg.id===id ? {...pg,...patch} : pg) }))
  }
  function deleteSpacePage(id) {
    setData(p => ({
      spacePages: (p.spacePages||[]).filter(pg => pg.id !== id),
      spaceBlocks: (p.spaceBlocks||[]).filter(b => b.pageId !== id),
    }))
  }
  function addSpaceBlock(block) {
    const id = uid('sb')
    setData(p => {
      const order = (p.spaceBlocks||[]).filter(b => b.pageId === block.pageId).length
      const entry = { id, order, visible: true, label: block.label || block.type, props: {}, ...block }
      return {
        spaceBlocks: [...(p.spaceBlocks||[]), entry],
        spacePages: (p.spacePages||[]).map(pg =>
          pg.id === block.pageId ? { ...pg, blocks: [...(pg.blocks||[]), id] } : pg
        ),
      }
    })
    return id
  }
  function updateSpaceBlock(id, patch) {
    setData(p => ({ spaceBlocks: (p.spaceBlocks||[]).map(b => b.id===id ? {...b,...patch} : b) }))
  }
  function deleteSpaceBlock(id) {
    setData(p => {
      const block = (p.spaceBlocks||[]).find(b => b.id === id)
      return {
        spaceBlocks: (p.spaceBlocks||[]).filter(b => b.id !== id),
        spacePages: (p.spacePages||[]).map(pg =>
          pg.id === block?.pageId
            ? { ...pg, blocks: (pg.blocks||[]).filter(bid => bid !== id) }
            : pg
        ),
      }
    })
  }
  function reorderSpaceBlocks(pageId, orderedIds) {
    setData(p => ({
      spacePages: (p.spacePages||[]).map(pg =>
        pg.id === pageId ? { ...pg, blocks: orderedIds } : pg
      ),
      spaceBlocks: (p.spaceBlocks||[]).map(b =>
        b.pageId === pageId ? { ...b, order: orderedIds.indexOf(b.id) } : b
      ),
    }))
  }

  function restorePageBlocks(pageId, snapBlockIds, snapBlockData) {
    setData(p => ({
      spacePages: (p.spacePages||[]).map(pg =>
        pg.id === pageId ? { ...pg, blocks: snapBlockIds } : pg
      ),
      spaceBlocks: [
        ...(p.spaceBlocks||[]).filter(b => b.pageId !== pageId),
        ...snapBlockData.map(b => ({ ...b, pageId })),
      ],
    }))
  }

  function moveSpaceBlock(blockId, fromPageId, toPageId) {
    setData(p => ({
      spacePages: (p.spacePages||[]).map(pg => {
        if (pg.id === fromPageId) return { ...pg, blocks: pg.blocks.filter(id => id !== blockId) }
        if (pg.id === toPageId)   return { ...pg, blocks: [...pg.blocks, blockId] }
        return pg
      }),
      spaceBlocks: (p.spaceBlocks||[]).map(b =>
        b.id === blockId ? { ...b, pageId: toPageId } : b
      ),
    }))
  }

  // --- Accounts ---
  function addAccount(account) {
    const id = uid('acc')
    setData(p => ({ accounts: [...(p.accounts||[]), { id, currency: 'USD', ...account }] }))
    return id
  }
  function updateAccount(id, patch) {
    setData(p => ({ accounts: (p.accounts||[]).map(a => a.id===id ? {...a,...patch} : a) }))
  }
  function deleteAccount(id) {
    setData(p => ({ accounts: (p.accounts||[]).filter(a => a.id!==id) }))
  }
  function importTransactions(rows, accountId) {
    setData(p => {
      const existing = new Set(p.importHashes||[])
      const newTxs = [], newHashes = []
      rows.forEach(row => {
        const hash = `${row.date}|${row.merchant}|${row.amount}`
        if (!existing.has(hash)) {
          newTxs.push({ id: uid('t'), accountId, category: 'Other', ...row })
          newHashes.push(hash)
        }
      })
      return {
        transactions: [...newTxs, ...p.transactions],
        importHashes: [...(p.importHashes||[]), ...newHashes],
      }
    })
  }

  // --- List item update ---
  function updateListItem(listId, itemId, patch) {
    setData(p => ({
      lists: p.lists.map(l =>
        l.id !== listId ? l :
        { ...l, items: l.items.map(i => i.id === itemId ? { ...i, ...patch } : i) }
      )
    }))
  }

  // --- Drafts ---
  function addDraft(draft) {
    const id = uid('dr')
    setData(p => ({ drafts: [...(p.drafts||[]), {
      id, status: 'in-progress', picks: [], availableItems: [], parties: [], rounds: 3,
      createdAt: new Date().toISOString().slice(0,10), ...draft,
    }]}))
    return id
  }
  function updateDraft(id, patch) {
    setData(p => ({ drafts: (p.drafts||[]).map(d => d.id===id ? {...d,...patch} : d) }))
  }
  function deleteDraft(id) {
    setData(p => ({ drafts: (p.drafts||[]).filter(d => d.id!==id) }))
  }
  function makeDraftPick(draftId, item) {
    setData(p => ({
      drafts: (p.drafts||[]).map(d => {
        if (d.id !== draftId) return d
        const order = getDraftOrder(d.parties.length, d.rounds)
        const nextSlot = order[d.picks.length]
        if (!nextSlot) return d
        const newPick = { round: nextSlot.round, partyIndex: nextSlot.partyIndex, item }
        const allDone = d.picks.length + 1 >= order.length
        return { ...d, picks: [...d.picks, newPick],
          availableItems: d.availableItems.filter(i => i !== item),
          status: allDone ? 'completed' : d.status }
      })
    }))
  }
  function undoDraftPick(draftId) {
    setData(p => ({
      drafts: (p.drafts||[]).map(d => {
        if (d.id !== draftId || d.picks.length === 0) return d
        const last = d.picks[d.picks.length - 1]
        return { ...d, picks: d.picks.slice(0,-1),
          availableItems: [...d.availableItems, last.item], status: 'in-progress' }
      })
    }))
  }

  // --- Blog + RSVP ---
  function publishJournalEntry(entryId, mode) {
    const entry = data.journalEntries.find(e => e.id === entryId)
    if (!entry) return
    if (mode === 'post') {
      addSpacePost({ content: entry.highlight || entry.longForm?.slice(0, 200) || '' })
    } else if (mode === 'blog') {
      const id = uid('blog')
      const slug = id
      setData(p => ({
        spaceBlogPosts: [
          { id, title: entry.title || `Entry — ${entry.date}`, slug, content: entry.longForm || entry.highlight || '', excerpt: (entry.highlight || '').slice(0, 120), publishedAt: new Date().toISOString(), journalEntryId: entryId },
          ...(p.spaceBlogPosts || []),
        ],
      }))
    }
  }
  function rsvpBlock(blockId, type) {
    setData(p => ({
      spaceRSVPs: p.spaceRSVPs.some(r => r.blockId === blockId && r.type === type)
        ? p.spaceRSVPs.map(r => r.blockId === blockId && r.type === type ? { ...r, count: r.count + 1 } : r)
        : [...(p.spaceRSVPs || []), { blockId, type, count: 1 }],
    }))
  }

  // --- Agora ---
  function voteAgoraPost(id, dir) {
    setData(p => ({
      agoraPosts: (p.agoraPosts || []).map(post => {
        if (post.id !== id) return post
        const prev = post.userVote
        const delta = dir === prev ? -dir : (dir - (prev || 0))
        return { ...post, userVote: dir === prev ? null : dir, votes: post.votes + delta }
      }),
    }))
  }
  function joinAgoraCommunity(id) {
    setData(p => ({ agoraCommunities: (p.agoraCommunities || []).map(c => c.id === id ? { ...c, joined: true, members: c.members + 1 } : c) }))
  }
  function leaveAgoraCommunity(id) {
    setData(p => ({ agoraCommunities: (p.agoraCommunities || []).map(c => c.id === id ? { ...c, joined: false, members: c.members - 1 } : c) }))
  }
  function addAgoraPost(post) {
    const id = uid('agp')
    setData(p => ({
      agoraPosts: [{ id, votes: 1, userVote: 1, commentCount: 0, timestamp: new Date().toISOString(),
        author: { handle: p.user.handle, name: p.user.name }, ...post }, ...(p.agoraPosts || [])],
    }))
  }

  // --- Trading Post ---
  function installTradingListing(id) {
    setData(p => ({ tradingListings: (p.tradingListings || []).map(l => l.id === id ? { ...l, installed: true, installs: l.installs + 1 } : l) }))
  }
  function purchaseTradingListing(id) {
    setData(p => {
      const listing = (p.tradingListings || []).find(l => l.id === id)
      if (!listing || listing.priceCredits > (p.user.credits || 0)) return p
      return {
        user: { ...p.user, credits: p.user.credits - listing.priceCredits },
        tradingListings: (p.tradingListings || []).map(l => l.id === id ? { ...l, installed: true, installs: l.installs + 1 } : l),
      }
    })
  }

  // --- Kenoma ---
  function addHabit(habit) {
    const id = uid('hab')
    setData(p => ({ habits: [...(p.habits||[]), { id, createdAt: new Date().toISOString(), cleanStreak: 0, longestClean: 0, goalId: null, ...habit }] }))
    return id
  }
  function updateHabit(id, patch) {
    setData(p => ({ habits: (p.habits||[]).map(h => h.id===id ? {...h,...patch} : h) }))
  }
  function deleteHabit(id) {
    setData(p => ({ habits: (p.habits||[]).filter(h => h.id!==id), habitLogs: (p.habitLogs||[]).filter(l => l.habitId!==id) }))
  }
  function addHabitLog(log) {
    const id = uid('hlog')
    const entry = { id, recordedAt: new Date().toISOString(), cost: 0, quantity: 0, notes: '', ...log }
    // Build LENS event outside setData so we can call processGoalProgress after
    const leType = log.entryType === 'gave-in' ? 'kenoma.gave_in' : log.entryType === 'resisted' ? 'kenoma.resisted' : 'kenoma.tracked'
    const habit = data.habits?.find(h => h.id === log.habitId)
    const le = { id: uid('le'), source: 'kenoma', type: leType, payload: { habitId: log.habitId, habitName: habit?.name, category: habit?.category, quantity: log.quantity, cost: log.cost||0, trigger: log.trigger }, recordedAt: new Date().toISOString() }
    setData(p => {
      const habits = (p.habits||[]).map(h => {
        if (h.id !== log.habitId) return h
        if (log.entryType === 'gave-in') {
          return { ...h, cleanStreak: 0, longestClean: Math.max(h.longestClean||0, h.cleanStreak||0) }
        }
        if (log.entryType === 'resisted') {
          const next = (h.cleanStreak||0) + 1
          return { ...h, cleanStreak: next, longestClean: Math.max(h.longestClean||0, next) }
        }
        return h
      })
      return { habits, habitLogs: [...(p.habitLogs||[]), entry], lensEvents: [...(p.lensEvents||[]), le] }
    })
    // Propagate to Planner goals linked via habit.goalId
    processGoalProgress(le)
  }
  function updateHabitLog(id, patch) {
    setData(p => ({ habitLogs: (p.habitLogs||[]).map(l => l.id===id ? {...l,...patch} : l) }))
  }
  function deleteHabitLog(id) {
    setData(p => ({ habitLogs: (p.habitLogs||[]).filter(l => l.id!==id) }))
  }
  function linkHabitGoal(habitId, goalId) {
    setData(p => ({ habits: (p.habits||[]).map(h => h.id===habitId ? {...h, goalId} : h) }))
  }

  // --- Mailing Lists ---
  function addMailingList(list) {
    const id = uid('mlist')
    const slug = list.shareSlug || list.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setData(p => ({ mailingLists: [...(p.mailingLists || []), { shareSlug: slug, createdAt: new Date().toISOString().slice(0,10), active: true, fields: { email:{enabled:true,required:true}, phone:{enabled:false,required:false}, zip:{enabled:false,required:false}, preferredContact:{enabled:false,required:false}, customQuestion:{enabled:false,required:false,label:''} }, roles: [], entries: [], memberContactIds: [], ...list, id }] }))
    return id
  }
  function updateMailingList(id, patch) {
    setData(p => ({ mailingLists: (p.mailingLists||[]).map(l => l.id===id ? {...l,...patch} : l) }))
  }
  function deleteMailingList(id) {
    setData(p => ({ mailingLists: (p.mailingLists||[]).filter(l => l.id!==id) }))
  }
  function addMailingEntry(listId, entry) {
    const id = uid('mle')
    const full = { id, contactId: null, submittedAt: new Date().toISOString(), ...entry }
    setData(p => ({ mailingLists: (p.mailingLists||[]).map(l => l.id!==listId ? l : { ...l, entries: [...(l.entries||[]), full] }) }))
    return id
  }
  function deleteMailingEntry(listId, entryId) {
    setData(p => ({ mailingLists: (p.mailingLists||[]).map(l => l.id!==listId ? l : { ...l, entries: (l.entries||[]).filter(e => e.id!==entryId) }) }))
  }
  function addContactToMailingList(listId, contactId) {
    setData(p => ({ mailingLists: (p.mailingLists||[]).map(l => l.id!==listId ? l : { ...l, memberContactIds: [...new Set([...(l.memberContactIds||[]), contactId])] }) }))
  }
  function removeContactFromMailingList(listId, contactId) {
    setData(p => ({ mailingLists: (p.mailingLists||[]).map(l => l.id!==listId ? l : { ...l, memberContactIds: (l.memberContactIds||[]).filter(id => id!==contactId) }) }))
  }

  // --- Reset ---
  function resetData() {
    try { localStorage.removeItem(storageKey) } catch {}
    setDataRaw({ ...seedData })
    setSessionLensEvents([])
  }

  return (
    <StoreCtx.Provider value={{
      data, sessionLensEvents,
      setBrainConfig,
      addGoal, updateGoal, deleteGoal,
      addPlan, updatePlan, deletePlan,
      addTaskGroup, deleteTaskGroup,
      addPlanTask, updatePlanTask, deletePlanTask, schedulePlanTask,
      savePlanTemplate, deletePlanTemplate,
      addRoutine, updateRoutine, deleteRoutine,
      addEvent, updateEvent, deleteEvent,
      addJournalEntry, updateJournalEntry, deleteJournalEntry,
      addJoke, updateJoke, deleteJoke, addJokeLink, deleteJokeLink,
      addPerformance, deletePerformance,
      addVariant, updateVariant, deleteVariant,
      addInboxItem, deleteInboxItem, promoteInboxItem,
      addSetList, updateSetList, deleteSetList,
      addTransaction, deleteTransaction, updateTransaction, setBudgetLimit, deleteLensEvent,
      addAccount, updateAccount, deleteAccount, importTransactions,
      addLensEvent,
      addPhotoAlbum, updatePhotoAlbum, deletePhotoAlbum,
      addPhoto, updatePhoto, deletePhoto,
      addPersonalMedia, updatePersonalMedia, deletePersonalMedia,
      addVideoCollection, updateVideoCollection, deleteVideoCollection,
      addVideo, updateVideo, deleteVideo,
      addMediaEntry, updateMediaEntry, deleteMediaEntry,
      updateMediaFile, addMediaChapter, updateMediaChapter, deleteMediaChapter,
      addMediaAnnotation, updateMediaAnnotation, deleteMediaAnnotation,
      addMediaComment, deleteMediaComment,
      addMediaBranch, updateMediaBranch, deleteMediaBranch, rateBranchOption,
      addMediaPreset, updateMediaPreset, deleteMediaPreset,
      addViewerPreset, updateViewerPreset, deleteViewerPreset,
      addTagComment, deleteTagComment,
      addMediaCommentary, deleteMediaCommentary, addLinkComment, deleteLinkComment,
      addSkill, updateSkill, deleteSkill,
      addTrip, updateTrip, deleteTrip, addPackingItem, togglePackingItem, deletePackingItem,
      addResearch, updateResearch, deleteResearch,
      updatePosthumous, addPosthumousMessage, updatePosthumousMessage, deletePosthumousMessage,
      addAgreement, updateAgreement, deleteAgreement,
      addAchievement, updateAchievement, deleteAchievement,
      addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem,
      addPlace, updatePlace, deletePlace,
      toggleSavedPlace, addCheckin, deleteCheckin,
      addContact, updateContact, deleteContact, addContactCustomField, deleteContactCustomField,
      addContactReminder, updateContactReminder, deleteContactReminder,
      addMailingList, updateMailingList, deleteMailingList,
      addMailingEntry, deleteMailingEntry,
      addContactToMailingList, removeContactFromMailingList,
      addGroup, updateGroup, deleteGroup,
      addHealthLog, updateHealthLog, deleteHealthLog,
      addMealLog, deleteMealLog, updateMealLog,
      addPersonalBest, deletePersonalBest,
      completeEvent,
      addSpacePost, deletePost, updateUser,
      updateLensEvent,
      addGroupPost, deleteGroupPost,
      followUser, sendMessage, markConversationRead, markNotificationRead, joinGroup, leaveGroup,
      addHabit, updateHabit, deleteHabit, addHabitLog, updateHabitLog, deleteHabitLog, linkHabitGoal,
      setFeedAlgorithm, shareToSpace,
      addConversation, addSpaceGroup,
      addConnectionFromContact, addContactFromConnection,
      addResearchSource, deleteResearchSource, updateResearchSource,
      addSpacePage, updateSpacePage, deleteSpacePage,
      addSpaceBlock, updateSpaceBlock, deleteSpaceBlock, reorderSpaceBlocks, moveSpaceBlock, restorePageBlocks,
      publishJournalEntry, rsvpBlock,
      updateListItem,
      addDraft, updateDraft, deleteDraft, makeDraftPick, undoDraftPick,
      voteAgoraPost, joinAgoraCommunity, leaveAgoraCommunity, addAgoraPost,
      installTradingListing, purchaseTradingListing,
      resetData,
    }}>
      {children}
    </StoreCtx.Provider>
  )
}

export function useStore() { return useContext(StoreCtx) }
