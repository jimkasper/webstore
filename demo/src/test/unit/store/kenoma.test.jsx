import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTestStore } from '../../helpers/store-helpers'

// Seed data has 3 habits and 5 habit logs
const SEED_HABIT_COUNT = 3
const SEED_HABIT_LOG_COUNT = 5

describe('Store — Kenoma (Habits)', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    store = useTestStore()
  })

  // ── addHabit ───────────────────────────────────────────────────────────────

  describe('addHabit', () => {
    it('appends a new habit and increments the habits array length', async () => {
      await act(async () => {
        store.current.addHabit({ name: 'Test Habit', category: 'Behavioral', type: 'vice', unit: 'episodes' })
      })
      expect(store.current.data.habits).toHaveLength(SEED_HABIT_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "hab"', async () => {
      await act(async () => {
        store.current.addHabit({ name: 'New Habit', category: 'Digital', type: 'vice', unit: 'hours' })
      })
      const added = store.current.data.habits.at(-1)
      expect(added.id).toMatch(/^hab/)
    })

    it('initialises cleanStreak to 0 when omitted', async () => {
      await act(async () => {
        store.current.addHabit({ name: 'Fresh Habit', category: 'Substance', type: 'vice', unit: 'drinks' })
      })
      expect(store.current.data.habits.at(-1).cleanStreak).toBe(0)
    })

    it('initialises longestClean to 0 when omitted', async () => {
      await act(async () => {
        store.current.addHabit({ name: 'Fresh Habit 2', category: 'Dietary', type: 'vice', unit: 'servings' })
      })
      expect(store.current.data.habits.at(-1).longestClean).toBe(0)
    })

    it('initialises goalId to null when omitted', async () => {
      await act(async () => {
        store.current.addHabit({ name: 'Unlinked Habit', category: 'Physical', type: 'vice', unit: 'days' })
      })
      expect(store.current.data.habits.at(-1).goalId).toBeNull()
    })

    it('preserves all provided fields', async () => {
      await act(async () => {
        store.current.addHabit({
          name: 'Caffeine', category: 'Substance', type: 'vice',
          icon: '☕', unit: 'cups', color: '#f59e0b', description: 'Tracking coffee intake',
        })
      })
      const added = store.current.data.habits.at(-1)
      expect(added.name).toBe('Caffeine')
      expect(added.icon).toBe('☕')
      expect(added.unit).toBe('cups')
    })
  })

  // ── updateHabit ────────────────────────────────────────────────────────────

  describe('updateHabit', () => {
    it('updates the specified field on an existing habit', async () => {
      const target = store.current.data.habits[0]
      await act(async () => { store.current.updateHabit(target.id, { description: 'Updated description' }) })
      const updated = store.current.data.habits.find(h => h.id === target.id)
      expect(updated.description).toBe('Updated description')
    })

    it('does not affect other habits', async () => {
      const [target, other] = store.current.data.habits
      const otherNameBefore = other.name
      await act(async () => { store.current.updateHabit(target.id, { name: 'Changed' }) })
      const otherAfter = store.current.data.habits.find(h => h.id === other.id)
      expect(otherAfter.name).toBe(otherNameBefore)
    })
  })

  // ── deleteHabit ────────────────────────────────────────────────────────────

  describe('deleteHabit', () => {
    it('removes the habit with the given id', async () => {
      const target = store.current.data.habits[0]
      await act(async () => { store.current.deleteHabit(target.id) })
      expect(store.current.data.habits.find(h => h.id === target.id)).toBeUndefined()
    })

    it('also removes all habitLogs for that habit', async () => {
      // hab1 has 2 logs (hlog1, hlog2)
      await act(async () => { store.current.deleteHabit('hab1') })
      const remaining = store.current.data.habitLogs.filter(l => l.habitId === 'hab1')
      expect(remaining).toHaveLength(0)
    })
  })

  // ── addHabitLog — gave-in: resets cleanStreak ──────────────────────────────

  describe('addHabitLog — gave-in entry type', () => {
    it('appends a new habit log and increments the habitLogs array length', async () => {
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab1', entryType: 'gave-in', quantity: 2, unit: 'drinks', trigger: 'Party' })
      })
      expect(store.current.data.habitLogs).toHaveLength(SEED_HABIT_LOG_COUNT + 1)
    })

    it('assigns a unique id prefixed with "hlog"', async () => {
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab1', entryType: 'gave-in', quantity: 1, unit: 'drinks' })
      })
      const added = store.current.data.habitLogs.at(-1)
      expect(added.id).toMatch(/^hlog/)
    })

    it('resets cleanStreak to 0 on the parent habit', async () => {
      // hab3 (Impulse Spending) has cleanStreak: 5
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'gave-in', quantity: 1, unit: 'purchases', trigger: 'Sale' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab3')
      expect(habit.cleanStreak).toBe(0)
    })

    it('preserves longestClean when cleanStreak was less than previous best', async () => {
      // hab3 has cleanStreak: 5, longestClean: 14
      // After gave-in, longestClean stays 14 (5 < 14, no new record)
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'gave-in', quantity: 1, unit: 'purchases' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab3')
      expect(habit.longestClean).toBe(14)
    })

    it('updates longestClean when cleanStreak was a new record before the gave-in', async () => {
      // First artificially boost cleanStreak via store update
      await act(async () => {
        store.current.updateHabit('hab3', { cleanStreak: 20, longestClean: 14 })
      })
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'gave-in', quantity: 1, unit: 'purchases' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab3')
      expect(habit.longestClean).toBe(20)
      expect(habit.cleanStreak).toBe(0)
    })

    it('stamps recordedAt as an ISO datetime string', async () => {
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab2', entryType: 'gave-in', quantity: 1, unit: 'hours' })
      })
      const added = store.current.data.habitLogs.at(-1)
      expect(added.recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  // ── addHabitLog — resisted: increments cleanStreak ────────────────────────

  describe('addHabitLog — resisted entry type', () => {
    it('increments cleanStreak by 1 on the parent habit', async () => {
      // hab1 (Alcohol) has cleanStreak: 2
      const before = store.current.data.habits.find(h => h.id === 'hab1').cleanStreak
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab1', entryType: 'resisted', quantity: 0, unit: 'drinks', trigger: 'Dinner offer' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab1')
      expect(habit.cleanStreak).toBe(before + 1)
    })

    it('updates longestClean when new streak exceeds previous best', async () => {
      // hab1 has cleanStreak: 2, longestClean: 7
      // First push streak to 7 via direct update
      await act(async () => {
        store.current.updateHabit('hab1', { cleanStreak: 7, longestClean: 7 })
      })
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab1', entryType: 'resisted', quantity: 0, unit: 'drinks' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab1')
      expect(habit.cleanStreak).toBe(8)
      expect(habit.longestClean).toBe(8)
    })

    it('does not reset cleanStreak when resisting', async () => {
      // hab3 has cleanStreak: 5
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'resisted', quantity: 0, unit: 'purchases' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab3')
      expect(habit.cleanStreak).toBeGreaterThan(0)
    })
  })

  // ── addHabitLog — streak interaction: gave-in then resisted ───────────────

  describe('addHabitLog — streak interaction', () => {
    it('gave-in then resisted gives cleanStreak of 1', async () => {
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'gave-in', quantity: 1, unit: 'purchases' })
      })
      await act(async () => {
        store.current.addHabitLog({ habitId: 'hab3', entryType: 'resisted', quantity: 0, unit: 'purchases' })
      })
      const habit = store.current.data.habits.find(h => h.id === 'hab3')
      expect(habit.cleanStreak).toBe(1)
    })
  })

  // ── deleteHabitLog ─────────────────────────────────────────────────────────

  describe('deleteHabitLog', () => {
    it('removes the habit log with the given id', async () => {
      const target = store.current.data.habitLogs[0]
      await act(async () => { store.current.deleteHabitLog(target.id) })
      expect(store.current.data.habitLogs.find(l => l.id === target.id)).toBeUndefined()
    })

    it('reduces the habitLogs array length by one', async () => {
      const target = store.current.data.habitLogs[0]
      await act(async () => { store.current.deleteHabitLog(target.id) })
      expect(store.current.data.habitLogs).toHaveLength(SEED_HABIT_LOG_COUNT - 1)
    })
  })

  // ── linkHabitGoal ──────────────────────────────────────────────────────────

  describe('linkHabitGoal', () => {
    it('sets the goalId on the habit', async () => {
      const habit = store.current.data.habits[0]
      const goalId = store.current.data.goals[0].id
      await act(async () => { store.current.linkHabitGoal(habit.id, goalId) })
      const updated = store.current.data.habits.find(h => h.id === habit.id)
      expect(updated.goalId).toBe(goalId)
    })

    it('does not affect other habits', async () => {
      const [target, other] = store.current.data.habits
      const otherGoalIdBefore = other.goalId
      const goalId = store.current.data.goals[0].id
      await act(async () => { store.current.linkHabitGoal(target.id, goalId) })
      const otherAfter = store.current.data.habits.find(h => h.id === other.id)
      expect(otherAfter.goalId).toBe(otherGoalIdBefore)
    })
  })
})
