import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTestStore } from '../../helpers/store-helpers'

// Seed data: 4 goals, 3 plans, 17 planTasks
const SEED_GOAL_COUNT = 4
const SEED_PLAN_COUNT = 3

describe('Store — Planner', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    store = useTestStore()
  })

  // ── addGoal ────────────────────────────────────────────────────────────────

  describe('addGoal', () => {
    it('appends a new goal and increments the goals array length', async () => {
      await act(async () => { store.current.addGoal({ name: 'New goal', type: 'milestone' }) })
      expect(store.current.data.goals).toHaveLength(SEED_GOAL_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "g"', async () => {
      await act(async () => { store.current.addGoal({ name: 'Test', type: 'frequency' }) })
      const added = store.current.data.goals.at(-1)
      expect(typeof added.id).toBe('string')
      expect(added.id).toMatch(/^g/)
    })

    it('initialises progress to 0 when omitted', async () => {
      await act(async () => { store.current.addGoal({ name: 'Fresh goal', type: 'milestone' }) })
      expect(store.current.data.goals.at(-1).progress).toBe(0)
    })

    it('initialises streak to 0 when omitted', async () => {
      await act(async () => { store.current.addGoal({ name: 'Fresh goal', type: 'milestone' }) })
      expect(store.current.data.goals.at(-1).streak).toBe(0)
    })

    it('initialises apps as empty array when omitted', async () => {
      await act(async () => { store.current.addGoal({ name: 'No apps goal', type: 'habit' }) })
      expect(store.current.data.goals.at(-1).apps).toEqual([])
    })

    it('preserves provided fields like name, type, and targetDate', async () => {
      await act(async () => {
        store.current.addGoal({ name: 'Specific goal', type: 'threshold', targetDate: '2026-12-31', apps: ['financial'] })
      })
      const added = store.current.data.goals.at(-1)
      expect(added.name).toBe('Specific goal')
      expect(added.type).toBe('threshold')
      expect(added.targetDate).toBe('2026-12-31')
      expect(added.apps).toEqual(['financial'])
    })
  })

  // ── updateGoal ─────────────────────────────────────────────────────────────

  describe('updateGoal', () => {
    it('updates the specified field on the goal', async () => {
      const target = store.current.data.goals[0]
      await act(async () => { store.current.updateGoal(target.id, { progress: 50 }) })
      const updated = store.current.data.goals.find(g => g.id === target.id)
      expect(updated.progress).toBe(50)
    })

    it('merges the patch rather than replacing the whole object', async () => {
      const target = store.current.data.goals[0]
      const originalName = target.name
      await act(async () => { store.current.updateGoal(target.id, { progress: 99 }) })
      const updated = store.current.data.goals.find(g => g.id === target.id)
      expect(updated.name).toBe(originalName)
      expect(updated.progress).toBe(99)
    })

    it('does not affect other goals', async () => {
      const [target, ...others] = store.current.data.goals
      const otherNamesBefore = others.map(g => g.name)
      await act(async () => { store.current.updateGoal(target.id, { name: 'Changed' }) })
      const otherNamesAfter = store.current.data.goals
        .filter(g => g.id !== target.id)
        .map(g => g.name)
      expect(otherNamesAfter).toEqual(otherNamesBefore)
    })
  })

  // ── deleteGoal ─────────────────────────────────────────────────────────────

  describe('deleteGoal', () => {
    it('removes the goal with the given id', async () => {
      const target = store.current.data.goals[0]
      await act(async () => { store.current.deleteGoal(target.id) })
      expect(store.current.data.goals.find(g => g.id === target.id)).toBeUndefined()
    })

    it('reduces the goals array length by one', async () => {
      const target = store.current.data.goals[0]
      await act(async () => { store.current.deleteGoal(target.id) })
      expect(store.current.data.goals).toHaveLength(SEED_GOAL_COUNT - 1)
    })
  })

  // ── addPlan ────────────────────────────────────────────────────────────────

  describe('addPlan', () => {
    it('appends a new plan and increments the plans array length', async () => {
      await act(async () => { store.current.addPlan({ name: 'Test Plan' }) })
      expect(store.current.data.plans).toHaveLength(SEED_PLAN_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "plan"', async () => {
      await act(async () => { store.current.addPlan({ name: 'New Plan' }) })
      const added = store.current.data.plans.at(-1)
      expect(added.id).toMatch(/^plan/)
    })

    it('initialises taskGroups as empty array when omitted', async () => {
      await act(async () => { store.current.addPlan({ name: 'No Groups Plan' }) })
      expect(store.current.data.plans.at(-1).taskGroups).toEqual([])
    })

    it('links the goal when goalId is provided', async () => {
      const goalId = store.current.data.goals[2].id // goal without a plan
      await act(async () => { store.current.addPlan({ name: 'Linked Plan', goalId }) })
      const goal = store.current.data.goals.find(g => g.id === goalId)
      const plan = store.current.data.plans.at(-1)
      expect(goal.planId).toBe(plan.id)
    })
  })

  // ── updatePlan ─────────────────────────────────────────────────────────────

  describe('updatePlan', () => {
    it('updates the name field on the plan', async () => {
      const target = store.current.data.plans[0]
      await act(async () => { store.current.updatePlan(target.id, { name: 'Renamed Plan' }) })
      const updated = store.current.data.plans.find(p => p.id === target.id)
      expect(updated.name).toBe('Renamed Plan')
    })
  })

  // ── deletePlan ─────────────────────────────────────────────────────────────

  describe('deletePlan', () => {
    it('removes the plan from the plans array', async () => {
      const target = store.current.data.plans[0]
      await act(async () => { store.current.deletePlan(target.id) })
      expect(store.current.data.plans.find(p => p.id === target.id)).toBeUndefined()
    })

    it('removes all planTasks belonging to the deleted plan', async () => {
      const target = store.current.data.plans[0] // plan1 — has tasks pt1–pt5,pt8,pt9
      await act(async () => { store.current.deletePlan(target.id) })
      const remaining = store.current.data.planTasks.filter(t => t.planId === target.id)
      expect(remaining).toHaveLength(0)
    })

    it('clears the planId on the linked goal', async () => {
      const plan = store.current.data.plans[0] // plan1 → g1
      await act(async () => { store.current.deletePlan(plan.id) })
      const goal = store.current.data.goals.find(g => g.id === 'g1')
      expect(goal.planId).toBeNull()
    })
  })

  // ── addTaskGroup ───────────────────────────────────────────────────────────

  describe('addTaskGroup', () => {
    it('adds a task group to the specified plan', async () => {
      const plan = store.current.data.plans[0]
      const before = plan.taskGroups.length
      await act(async () => { store.current.addTaskGroup(plan.id, { name: 'New Group' }) })
      const updated = store.current.data.plans.find(p => p.id === plan.id)
      expect(updated.taskGroups).toHaveLength(before + 1)
    })

    it('assigns an id prefixed with "tg"', async () => {
      const plan = store.current.data.plans[0]
      await act(async () => { store.current.addTaskGroup(plan.id, { name: 'Group With ID' }) })
      const updated = store.current.data.plans.find(p => p.id === plan.id)
      const added = updated.taskGroups.at(-1)
      expect(added.id).toMatch(/^tg/)
    })
  })

  // ── deleteTaskGroup ────────────────────────────────────────────────────────

  describe('deleteTaskGroup', () => {
    it('removes the task group from the plan', async () => {
      const plan = store.current.data.plans[0]
      const group = plan.taskGroups[0]
      const before = plan.taskGroups.length
      await act(async () => { store.current.deleteTaskGroup(plan.id, group.id) })
      const updated = store.current.data.plans.find(p => p.id === plan.id)
      expect(updated.taskGroups).toHaveLength(before - 1)
    })

    it('sets groupId to null on tasks that belonged to the deleted group', async () => {
      const plan = store.current.data.plans[0]
      const group = plan.taskGroups[0] // tg1-1 — has tasks pt1, pt2, pt3
      await act(async () => { store.current.deleteTaskGroup(plan.id, group.id) })
      const orphaned = store.current.data.planTasks.filter(t => t.planId === plan.id && t.groupId === null && !t.parentId)
      expect(orphaned.length).toBeGreaterThan(0)
    })
  })

  // ── addPlanTask ────────────────────────────────────────────────────────────

  describe('addPlanTask', () => {
    it('appends a new task to planTasks', async () => {
      const before = store.current.data.planTasks.length
      await act(async () => {
        store.current.addPlanTask({ planId: 'plan1', groupId: 'tg1-1', title: 'New Task' })
      })
      expect(store.current.data.planTasks).toHaveLength(before + 1)
    })

    it('assigns an id prefixed with "pt"', async () => {
      await act(async () => {
        store.current.addPlanTask({ planId: 'plan1', groupId: 'tg1-1', title: 'Task With ID' })
      })
      const added = store.current.data.planTasks.at(-1)
      expect(added.id).toMatch(/^pt/)
    })

    it('initialises status as "pending"', async () => {
      await act(async () => {
        store.current.addPlanTask({ planId: 'plan1', groupId: 'tg1-1', title: 'Pending Task' })
      })
      expect(store.current.data.planTasks.at(-1).status).toBe('pending')
    })

    it('preserves provided estMins and estCost', async () => {
      await act(async () => {
        store.current.addPlanTask({ planId: 'plan1', groupId: 'tg1-1', title: 'Timed Task', estMins: 45, estCost: 20 })
      })
      const added = store.current.data.planTasks.at(-1)
      expect(added.estMins).toBe(45)
      expect(added.estCost).toBe(20)
    })
  })

  // ── updatePlanTask ─────────────────────────────────────────────────────────

  describe('updatePlanTask', () => {
    it('updates the title on the task', async () => {
      const task = store.current.data.planTasks[0]
      await act(async () => { store.current.updatePlanTask(task.id, { title: 'Renamed Task' }) })
      const updated = store.current.data.planTasks.find(t => t.id === task.id)
      expect(updated.title).toBe('Renamed Task')
    })

    it('updates the status to "done"', async () => {
      const task = store.current.data.planTasks.find(t => t.status === 'pending')
      await act(async () => { store.current.updatePlanTask(task.id, { status: 'done' }) })
      const updated = store.current.data.planTasks.find(t => t.id === task.id)
      expect(updated.status).toBe('done')
    })

    it('recomputes goal progress when a task group becomes fully complete', async () => {
      // plan2 has tg2-1 (pt6 done, pt7 pending, pt10 pending) and tg2-2 (pt11 done)
      // If we mark pt7 and pt10 done, tg2-1 is complete → 1/2 groups = 50%
      await act(async () => {
        store.current.updatePlanTask('pt7', { status: 'done' })
        store.current.updatePlanTask('pt10', { status: 'done' })
      })
      const goal = store.current.data.goals.find(g => g.id === 'g2')
      // tg2-1 complete + tg2-2 complete = 2/2 = 100%
      expect(goal.progress).toBe(100)
    })
  })

  // ── deletePlanTask ─────────────────────────────────────────────────────────

  describe('deletePlanTask', () => {
    it('removes the task from planTasks', async () => {
      const task = store.current.data.planTasks[0]
      const before = store.current.data.planTasks.length
      await act(async () => { store.current.deletePlanTask(task.id) })
      expect(store.current.data.planTasks).toHaveLength(before - 1)
      expect(store.current.data.planTasks.find(t => t.id === task.id)).toBeUndefined()
    })

    it('also removes child tasks (parentId === deleted id)', async () => {
      // pt4 is parent of pt5
      const before = store.current.data.planTasks.length
      await act(async () => { store.current.deletePlanTask('pt4') })
      // Both pt4 and pt5 should be gone
      expect(store.current.data.planTasks.find(t => t.id === 'pt4')).toBeUndefined()
      expect(store.current.data.planTasks.find(t => t.id === 'pt5')).toBeUndefined()
      expect(store.current.data.planTasks).toHaveLength(before - 2)
    })
  })
})
