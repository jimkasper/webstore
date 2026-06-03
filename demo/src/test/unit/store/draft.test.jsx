import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTestStore } from '../../helpers/store-helpers'
import { getDraftOrder } from '../../../store'

// Seed data has 2 drafts (dr1 in-progress, dr2 completed)
const SEED_DRAFT_COUNT = 2

describe('getDraftOrder — snake order helper', () => {
  it('produces partyCount × rounds total slots', () => {
    const order = getDraftOrder(3, 3)
    expect(order).toHaveLength(9)
  })

  it('alternates direction each round (snake pattern)', () => {
    // Round 1: 0→1→2 (ascending), Round 2: 2→1→0 (descending)
    const order = getDraftOrder(3, 2)
    expect(order[0].partyIndex).toBe(0)
    expect(order[1].partyIndex).toBe(1)
    expect(order[2].partyIndex).toBe(2)
    expect(order[3].partyIndex).toBe(2) // descending
    expect(order[4].partyIndex).toBe(1)
    expect(order[5].partyIndex).toBe(0)
  })

  it('assigns correct round numbers to each slot', () => {
    const order = getDraftOrder(2, 3)
    // 2 parties × 3 rounds = 6 slots
    expect(order).toHaveLength(6)
    expect(order[0].round).toBe(1)
    expect(order[1].round).toBe(1)
    expect(order[2].round).toBe(2)
    expect(order[3].round).toBe(2)
    expect(order[4].round).toBe(3)
    expect(order[5].round).toBe(3)
  })

  it('round 3 (even index) is ascending again', () => {
    const order = getDraftOrder(3, 3)
    // Round 3 starts at index 6
    expect(order[6].partyIndex).toBe(0)
    expect(order[7].partyIndex).toBe(1)
    expect(order[8].partyIndex).toBe(2)
  })

  it('single party has no snake reversal', () => {
    const order = getDraftOrder(1, 3)
    expect(order).toHaveLength(3)
    order.forEach(slot => expect(slot.partyIndex).toBe(0))
  })
})

describe('Store — Draft', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    store = useTestStore()
  })

  // ── addDraft ───────────────────────────────────────────────────────────────

  describe('addDraft', () => {
    it('appends a new draft and increments the drafts array length', async () => {
      await act(async () => {
        store.current.addDraft({
          title: 'Best Video Games',
          topic: 'Gaming',
          parties: [{ name: 'Jordan', handle: 'jordan', isUser: true }],
          availableItems: ['Zelda', 'Halo', 'Portal'],
          rounds: 2,
        })
      })
      expect(store.current.data.drafts).toHaveLength(SEED_DRAFT_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "dr"', async () => {
      await act(async () => {
        store.current.addDraft({ title: 'New Draft', topic: 'Test' })
      })
      const added = store.current.data.drafts.at(-1)
      expect(added.id).toMatch(/^dr/)
    })

    it('initialises status as "in-progress"', async () => {
      await act(async () => {
        store.current.addDraft({ title: 'Test Draft', topic: 'Test' })
      })
      expect(store.current.data.drafts.at(-1).status).toBe('in-progress')
    })

    it('initialises picks as empty array when omitted', async () => {
      await act(async () => {
        store.current.addDraft({ title: 'Empty Picks Draft', topic: 'Test' })
      })
      expect(store.current.data.drafts.at(-1).picks).toEqual([])
    })

    it('defaults rounds to 3 when omitted', async () => {
      await act(async () => {
        store.current.addDraft({ title: 'Default Rounds Draft', topic: 'Test' })
      })
      expect(store.current.data.drafts.at(-1).rounds).toBe(3)
    })

    it('preserves provided parties, availableItems, and rounds', async () => {
      const parties = [{ name: 'Alice', handle: null, isUser: true }]
      await act(async () => {
        store.current.addDraft({
          title: 'Custom Draft', topic: 'Books',
          parties, availableItems: ['Dune', '1984'], rounds: 2,
        })
      })
      const added = store.current.data.drafts.at(-1)
      expect(added.parties).toEqual(parties)
      expect(added.availableItems).toEqual(['Dune', '1984'])
      expect(added.rounds).toBe(2)
    })
  })

  // ── updateDraft ────────────────────────────────────────────────────────────

  describe('updateDraft', () => {
    it('updates a field on the specified draft', async () => {
      await act(async () => {
        store.current.updateDraft('dr1', { title: 'Updated Title' })
      })
      const updated = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(updated.title).toBe('Updated Title')
    })

    it('does not affect other drafts', async () => {
      const dr2Before = store.current.data.drafts.find(d => d.id === 'dr2').title
      await act(async () => {
        store.current.updateDraft('dr1', { title: 'Changed' })
      })
      const dr2After = store.current.data.drafts.find(d => d.id === 'dr2').title
      expect(dr2After).toBe(dr2Before)
    })
  })

  // ── deleteDraft ────────────────────────────────────────────────────────────

  describe('deleteDraft', () => {
    it('removes the draft with the given id', async () => {
      await act(async () => { store.current.deleteDraft('dr1') })
      expect(store.current.data.drafts.find(d => d.id === 'dr1')).toBeUndefined()
    })

    it('reduces the drafts array length by one', async () => {
      await act(async () => { store.current.deleteDraft('dr1') })
      expect(store.current.data.drafts).toHaveLength(SEED_DRAFT_COUNT - 1)
    })
  })

  // ── makeDraftPick ──────────────────────────────────────────────────────────

  describe('makeDraftPick', () => {
    it('appends a pick to the picks array', async () => {
      // dr1 has 5 picks; next slot is index 5
      const before = store.current.data.drafts.find(d => d.id === 'dr1').picks.length
      await act(async () => {
        store.current.makeDraftPick('dr1', 'The Score')
      })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(draft.picks).toHaveLength(before + 1)
    })

    it('records the correct round and partyIndex from getDraftOrder', async () => {
      // dr1 has 5 picks. getDraftOrder(3,3)[5] = {round:2, partyIndex:0}
      await act(async () => {
        store.current.makeDraftPick('dr1', 'The Score')
      })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      const lastPick = draft.picks.at(-1)
      expect(lastPick.round).toBe(2)
      expect(lastPick.partyIndex).toBe(0)
      expect(lastPick.item).toBe('The Score')
    })

    it('removes the picked item from availableItems', async () => {
      const before = store.current.data.drafts.find(d => d.id === 'dr1').availableItems
      expect(before).toContain('The Score')
      await act(async () => {
        store.current.makeDraftPick('dr1', 'The Score')
      })
      const after = store.current.data.drafts.find(d => d.id === 'dr1').availableItems
      expect(after).not.toContain('The Score')
      expect(after).toHaveLength(before.length - 1)
    })

    it('sets status to "completed" when the last pick is made', async () => {
      // dr1 has 5 picks, needs 9 total (3 parties × 3 rounds). Make 4 more picks.
      const items = store.current.data.drafts.find(d => d.id === 'dr1').availableItems.slice()
      await act(async () => {
        store.current.makeDraftPick('dr1', items[0])
        store.current.makeDraftPick('dr1', items[1])
        store.current.makeDraftPick('dr1', items[2])
        store.current.makeDraftPick('dr1', items[3])
      })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(draft.status).toBe('completed')
    })

    it('keeps status "in-progress" when picks remain', async () => {
      await act(async () => {
        store.current.makeDraftPick('dr1', 'The Score')
      })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(draft.status).toBe('in-progress')
    })

    it('does not modify a draft that has no remaining slots', async () => {
      // dr2 is already completed with all 9 picks and empty availableItems
      const before = store.current.data.drafts.find(d => d.id === 'dr2').picks.length
      await act(async () => {
        store.current.makeDraftPick('dr2', 'Some Item')
      })
      const after = store.current.data.drafts.find(d => d.id === 'dr2').picks.length
      expect(after).toBe(before)
    })
  })

  // ── undoDraftPick ──────────────────────────────────────────────────────────

  describe('undoDraftPick', () => {
    it('removes the last pick from the picks array', async () => {
      const before = store.current.data.drafts.find(d => d.id === 'dr1').picks.length
      await act(async () => { store.current.undoDraftPick('dr1') })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(draft.picks).toHaveLength(before - 1)
    })

    it('returns the undone item to availableItems', async () => {
      // dr1 last pick is {item: 'The Chronic'}
      await act(async () => { store.current.undoDraftPick('dr1') })
      const draft = store.current.data.drafts.find(d => d.id === 'dr1')
      expect(draft.availableItems).toContain('The Chronic')
    })

    it('sets status back to "in-progress"', async () => {
      // dr2 is completed — undo should reset it to in-progress
      await act(async () => { store.current.undoDraftPick('dr2') })
      const draft = store.current.data.drafts.find(d => d.id === 'dr2')
      expect(draft.status).toBe('in-progress')
    })

    it('does nothing when picks array is empty', async () => {
      await act(async () => {
        store.current.addDraft({ title: 'Fresh Draft', topic: 'Test', picks: [] })
      })
      const fresh = store.current.data.drafts.at(-1)
      await act(async () => { store.current.undoDraftPick(fresh.id) })
      expect(store.current.data.drafts.find(d => d.id === fresh.id).picks).toHaveLength(0)
    })

    it('undo then re-pick restores the same slot assignment', async () => {
      // Record slot before undo
      const lastPickBefore = store.current.data.drafts.find(d => d.id === 'dr1').picks.at(-1)
      await act(async () => { store.current.undoDraftPick('dr1') })
      // Re-pick the same item
      await act(async () => { store.current.makeDraftPick('dr1', lastPickBefore.item) })
      const lastPickAfter = store.current.data.drafts.find(d => d.id === 'dr1').picks.at(-1)
      expect(lastPickAfter.round).toBe(lastPickBefore.round)
      expect(lastPickAfter.partyIndex).toBe(lastPickBefore.partyIndex)
      expect(lastPickAfter.item).toBe(lastPickBefore.item)
    })
  })
})
