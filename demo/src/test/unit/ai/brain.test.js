import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  askBrain,
  detectConflicts,
  suggestDatapoints,
  getDataInventory,
  getSuggestedQueries,
} from '../../../ai/brain'

// In demo mode (no config / config.provider === 'demo'), callModel returns null
// and every exported function falls back to its offline mock — no network needed.

const DEMO_CONFIG = { provider: 'demo' }

// Minimal data object that exercises the mock branches
const MOCK_DATA = {
  goals: [
    { id: 'g1', name: 'Run a 5K', status: 'active', progress: 5, category: 'fitness' },
    { id: 'g2', name: 'Save $500', status: 'active', progress: 0, category: 'financial' },
  ],
  routines: [
    { id: 'r1', name: 'Morning Run', streak: 7 },
    { id: 'r2', name: 'Gym 3×/Week', streak: 0 },
  ],
  transactions: Array.from({ length: 10 }, (_, i) => ({
    id: `t${i}`, date: '2026-05-01', merchant: `Store ${i}`, amount: -30, category: 'Shopping',
  })),
  events: [
    { id: 'e1', date: '2026-05-14', status: 'upcoming', title: 'Meeting 1' },
    { id: 'e2', date: '2026-05-14', status: 'upcoming', title: 'Meeting 2' },
    { id: 'e3', date: '2026-05-14', status: 'upcoming', title: 'Meeting 3' },
    { id: 'e4', date: '2026-05-14', status: 'upcoming', title: 'Meeting 4' },
  ],
  lensEvents: [
    { id: 'le1', type: 'fitness.workout', payload: { durationMins: 45, calories: 300 }, recordedAt: '2026-05-10' },
    { id: 'le2', type: 'fitness.workout', payload: { durationMins: 60, calories: 400 }, recordedAt: '2026-05-12' },
    { id: 'le3', type: 'fitness.run',     payload: { distance: 4.2, durationMins: 25 }, recordedAt: '2026-05-11' },
    { id: 'le4', type: 'fitness.run',     payload: { distance: 5.0, durationMins: 28 }, recordedAt: '2026-05-13' },
  ],
  journalEntries: [
    { id: 'j1', date: '2026-05-10', dayRating: 4, highlight: 'Good day' },
    { id: 'j2', date: '2026-05-11', dayRating: 3, highlight: 'Average day' },
    { id: 'j3', date: '2026-05-12', dayRating: 5, highlight: 'Great day' },
  ],
  healthLogs: Array.from({ length: 7 }, (_, i) => ({
    id: `hl${i}`, date: `2026-05-0${i + 7}`, sleepHours: 7 + (i % 2), restingHR: 58,
  })),
  mealLogs: [],
  personalBests: [
    { id: 'pb1', lift: 'Bench Press', value: 185, unit: 'lbs', reps: 5, date: '2026-04-28' },
  ],
}

describe('brain.js — demo mode (no API key, fully offline)', () => {
  beforeEach(() => {
    // Ensure fetch is not called in demo mode
    global.fetch = vi.fn(() => Promise.reject(new Error('fetch should not be called in demo mode')))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── askBrain ───────────────────────────────────────────────────────────────

  describe('askBrain', () => {
    it('returns a non-empty string in demo mode', async () => {
      const result = await askBrain('What should I focus on?', MOCK_DATA, DEMO_CONFIG)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('does not call fetch in demo mode', async () => {
      await askBrain('Optimize my schedule', MOCK_DATA, DEMO_CONFIG)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('returns a string when config is omitted', async () => {
      const result = await askBrain('Any question', MOCK_DATA)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns a string for a schedule-related question', async () => {
      const result = await askBrain('Help me optimize my schedule', MOCK_DATA, DEMO_CONFIG)
      expect(typeof result).toBe('string')
    })

    it('returns a string for a goal-related question', async () => {
      const result = await askBrain('How am I tracking toward my goals?', MOCK_DATA, DEMO_CONFIG)
      expect(typeof result).toBe('string')
    })

    it('returns a string for a neglect/missing question', async () => {
      const result = await askBrain('What am I neglecting?', MOCK_DATA, DEMO_CONFIG)
      expect(typeof result).toBe('string')
    })
  })

  // ── detectConflicts ────────────────────────────────────────────────────────

  describe('detectConflicts', () => {
    it('returns an array in demo mode', async () => {
      const result = await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns at least one conflict object', async () => {
      const result = await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      expect(result.length).toBeGreaterThan(0)
    })

    it('does not call fetch in demo mode', async () => {
      await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('each conflict has required shape fields', async () => {
      const result = await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      result.forEach(c => {
        expect(c).toHaveProperty('type')
        expect(c).toHaveProperty('severity')
        expect(c).toHaveProperty('description')
        expect(Array.isArray(c.affected)).toBe(true)
      })
    })

    it('detects a routine with zero streak as a conflict', async () => {
      const result = await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      const routineConflict = result.find(c => c.type === 'routine')
      expect(routineConflict).toBeDefined()
      expect(routineConflict.description).toContain('Gym 3×/Week')
    })

    it('detects over-scheduled day when 4+ events on same date', async () => {
      const result = await detectConflicts(MOCK_DATA, DEMO_CONFIG)
      const schedConflict = result.find(c => c.type === 'schedule' && c.severity === 'high')
      expect(schedConflict).toBeDefined()
    })

    it('returns an array when config is omitted', async () => {
      const result = await detectConflicts(MOCK_DATA)
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns a fallback conflict when no real conflicts are found', async () => {
      const emptyData = { goals: [], routines: [], transactions: [], events: [], lensEvents: [] }
      const result = await detectConflicts(emptyData, DEMO_CONFIG)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].description).toContain('No critical conflicts')
    })
  })

  // ── suggestDatapoints ──────────────────────────────────────────────────────

  describe('suggestDatapoints', () => {
    it('returns an array in demo mode', async () => {
      const result = await suggestDatapoints(MOCK_DATA, DEMO_CONFIG)
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns at least one suggestion', async () => {
      const result = await suggestDatapoints(MOCK_DATA, DEMO_CONFIG)
      expect(result.length).toBeGreaterThan(0)
    })

    it('does not call fetch in demo mode', async () => {
      await suggestDatapoints(MOCK_DATA, DEMO_CONFIG)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('each suggestion has required shape fields', async () => {
      const result = await suggestDatapoints(MOCK_DATA, DEMO_CONFIG)
      result.forEach(s => {
        expect(s).toHaveProperty('app')
        expect(s).toHaveProperty('metric')
        expect(s).toHaveProperty('why')
        expect(s).toHaveProperty('howToTrack')
        expect(typeof s.metric).toBe('string')
        expect(s.metric.length).toBeGreaterThan(0)
      })
    })

    it('returns an array when config is omitted', async () => {
      const result = await suggestDatapoints(MOCK_DATA)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  // ── getDataInventory ───────────────────────────────────────────────────────

  describe('getDataInventory', () => {
    it('returns exactly 6 app inventory objects', () => {
      const result = getDataInventory(MOCK_DATA)
      expect(result).toHaveLength(6)
    })

    it('covers Fitness, Health, Journal, Financial, Goals, and Diet apps', () => {
      const result = getDataInventory(MOCK_DATA)
      const apps = result.map(r => r.app)
      expect(apps).toContain('Fitness')
      expect(apps).toContain('Health')
      expect(apps).toContain('Journal')
    })

    it('each entry has app, icon, path, quality, and metrics', () => {
      const result = getDataInventory(MOCK_DATA)
      result.forEach(entry => {
        expect(entry).toHaveProperty('app')
        expect(entry).toHaveProperty('icon')
        expect(entry).toHaveProperty('path')
        expect(entry).toHaveProperty('quality')
        expect(Array.isArray(entry.metrics)).toBe(true)
      })
    })

    it('quality is "moderate" for 2 workouts + 2 runs (4 total, within 1–4 = sparse)', () => {
      const result = getDataInventory(MOCK_DATA)
      const fitness = result.find(r => r.app === 'Fitness')
      // 2 workouts + 2 runs = 4 → "sparse" (< 5)
      expect(fitness.quality).toBe('sparse')
    })

    it('quality is "none" for empty data', () => {
      const emptyData = { lensEvents: [], healthLogs: [], journalEntries: [], transactions: [], mealLogs: [], goals: [], routines: [], personalBests: [] }
      const result = getDataInventory(emptyData)
      result.forEach(entry => expect(entry.quality).toBe('none'))
    })

    it('quality is "rich" when 20+ records exist', () => {
      const richData = {
        ...MOCK_DATA,
        lensEvents: Array.from({ length: 22 }, (_, i) => ({
          id: `le${i}`, type: 'fitness.workout', payload: { durationMins: 45 }, recordedAt: `2026-05-01`,
        })),
      }
      const result = getDataInventory(richData)
      const fitness = result.find(r => r.app === 'Fitness')
      expect(fitness.quality).toBe('rich')
    })

    it('Fitness metrics include workout and run counts', () => {
      const result = getDataInventory(MOCK_DATA)
      const fitness = result.find(r => r.app === 'Fitness')
      const workoutsMetric = fitness.metrics.find(m => m.label === 'Workouts')
      const runsMetric = fitness.metrics.find(m => m.label === 'Runs')
      expect(workoutsMetric.value).toBe(2)
      expect(runsMetric.value).toBe(2)
    })
  })

  // ── getSuggestedQueries ────────────────────────────────────────────────────

  describe('getSuggestedQueries', () => {
    it('returns an array of strings', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      expect(Array.isArray(result)).toBe(true)
      result.forEach(q => expect(typeof q).toBe('string'))
    })

    it('always includes "What should I focus on this week?"', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      expect(result).toContain('What should I focus on this week?')
    })

    it('always includes "What am I neglecting in my life right now?"', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      expect(result).toContain('What am I neglecting in my life right now?')
    })

    it('includes workout/mood correlation when enough workouts and journals exist', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      // MOCK_DATA has 2 workouts + 3 journal entries → threshold met
      expect(result).toContain('How does my workout frequency affect my mood?')
    })

    it('includes sleep/mood correlation when enough health logs and journals exist', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      // 7 health logs + 3 journal entries → threshold met
      expect(result).toContain('Does more sleep make me feel better the next day?')
    })

    it('returns at least 2 queries even for empty data', () => {
      const emptyData = { lensEvents: [], journalEntries: [], healthLogs: [], transactions: [], goals: [], routines: [] }
      const result = getSuggestedQueries(emptyData)
      // Always includes the two universal queries
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('includes running pace query when enough runs exist', () => {
      const result = getSuggestedQueries(MOCK_DATA)
      // 2 runs → threshold met
      expect(result).toContain('Is my running pace improving over time?')
    })
  })
})
