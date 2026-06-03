import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTestStore } from '../../helpers/store-helpers'

// Seed data has 10 contacts (c1–c10)
const SEED_CONTACT_COUNT = 10

describe('Store — Contacts', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    store = useTestStore()
  })

  // ── addContact ─────────────────────────────────────────────────────────────

  describe('addContact', () => {
    it('appends a new contact and increments the contacts array length', async () => {
      await act(async () => { store.current.addContact({ name: 'Test Person', email: 'test@example.com' }) })
      expect(store.current.data.contacts).toHaveLength(SEED_CONTACT_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "c"', async () => {
      await act(async () => { store.current.addContact({ name: 'Alice' }) })
      const added = store.current.data.contacts.at(-1)
      expect(typeof added.id).toBe('string')
      expect(added.id).toMatch(/^c/)
    })

    it('preserves all provided contact fields', async () => {
      await act(async () => {
        store.current.addContact({ name: 'Bob Smith', email: 'bob@example.com', phone: '555-1234', tags: ['friend'] })
      })
      const added = store.current.data.contacts.at(-1)
      expect(added.name).toBe('Bob Smith')
      expect(added.email).toBe('bob@example.com')
      expect(added.phone).toBe('555-1234')
      expect(added.tags).toEqual(['friend'])
    })

    it('initialises tags as empty array when omitted', async () => {
      await act(async () => { store.current.addContact({ name: 'Carol' }) })
      const added = store.current.data.contacts.at(-1)
      expect(added.tags).toEqual([])
    })

    it('adding multiple contacts assigns distinct ids', async () => {
      await act(async () => {
        store.current.addContact({ name: 'Alice' })
        store.current.addContact({ name: 'Bob' })
      })
      const ids = store.current.data.contacts.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  // ── updateContact ──────────────────────────────────────────────────────────

  describe('updateContact', () => {
    it('updates the specified field on an existing contact', async () => {
      const target = store.current.data.contacts[0]
      await act(async () => { store.current.updateContact(target.id, { email: 'updated@example.com' }) })
      const updated = store.current.data.contacts.find(c => c.id === target.id)
      expect(updated.email).toBe('updated@example.com')
    })

    it('leaves other contacts unchanged', async () => {
      const [target, ...others] = store.current.data.contacts
      const otherNamesBefore = others.map(c => c.name)
      await act(async () => { store.current.updateContact(target.id, { name: 'Changed' }) })
      const otherNamesAfter = store.current.data.contacts
        .filter(c => c.id !== target.id)
        .map(c => c.name)
      expect(otherNamesAfter).toEqual(otherNamesBefore)
    })

    it('merges the patch rather than replacing the whole object', async () => {
      const target = store.current.data.contacts[0]
      await act(async () => { store.current.updateContact(target.id, { phone: '999-9999' }) })
      const updated = store.current.data.contacts.find(c => c.id === target.id)
      // Original name should still be present
      expect(updated.name).toBe(target.name)
      expect(updated.phone).toBe('999-9999')
    })
  })

  // ── deleteContact ──────────────────────────────────────────────────────────

  describe('deleteContact', () => {
    it('removes the contact with the given id', async () => {
      const target = store.current.data.contacts[0]
      await act(async () => { store.current.deleteContact(target.id) })
      expect(store.current.data.contacts.find(c => c.id === target.id)).toBeUndefined()
    })

    it('reduces the contacts array length by one', async () => {
      const target = store.current.data.contacts[0]
      await act(async () => { store.current.deleteContact(target.id) })
      expect(store.current.data.contacts).toHaveLength(SEED_CONTACT_COUNT - 1)
    })

    it('does not affect other contacts', async () => {
      const [target, ...others] = store.current.data.contacts
      await act(async () => { store.current.deleteContact(target.id) })
      const remainingIds = store.current.data.contacts.map(c => c.id)
      others.forEach(c => expect(remainingIds).toContain(c.id))
    })
  })

  // ── Mailing Lists ──────────────────────────────────────────────────────────

  describe('addMailingList', () => {
    it('appends a new mailing list to mailingLists', async () => {
      const before = (store.current.data.mailingLists || []).length
      await act(async () => { store.current.addMailingList({ name: 'Hip-Hop Night', shareSlug: 'hip-hop-night' }) })
      expect(store.current.data.mailingLists).toHaveLength(before + 1)
    })

    it('assigns a uid prefixed with "ml"', async () => {
      await act(async () => { store.current.addMailingList({ name: 'My List', shareSlug: 'my-list' }) })
      const list = store.current.data.mailingLists.at(-1)
      expect(list.id).toMatch(/^ml/)
    })

    it('initialises entries and memberContactIds as empty arrays', async () => {
      await act(async () => { store.current.addMailingList({ name: 'Empty List', shareSlug: 'empty-list' }) })
      const list = store.current.data.mailingLists.at(-1)
      expect(list.entries).toEqual([])
      expect(list.memberContactIds).toEqual([])
    })

    it('stores the shareSlug provided by the caller', async () => {
      await act(async () => { store.current.addMailingList({ name: 'Test', shareSlug: 'custom-slug' }) })
      const list = store.current.data.mailingLists.at(-1)
      expect(list.shareSlug).toBe('custom-slug')
    })

    it('defaults active to true when omitted', async () => {
      await act(async () => { store.current.addMailingList({ name: 'Test', shareSlug: 'test-slug' }) })
      const list = store.current.data.mailingLists.at(-1)
      expect(list.active).toBe(true)
    })
  })

  describe('addMailingEntry', () => {
    let listId

    beforeEach(async () => {
      await act(async () => { listId = store.current.addMailingList({ name: 'Gig Mailer', shareSlug: 'gig-mailer' }) })
    })

    it('appends an entry to the correct mailing list', async () => {
      await act(async () => {
        store.current.addMailingEntry(listId, { name: 'Fan One', email: 'fan1@example.com' })
      })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.entries).toHaveLength(1)
      expect(list.entries[0].name).toBe('Fan One')
    })

    it('does not modify other mailing lists', async () => {
      let otherId
      await act(async () => { otherId = store.current.addMailingList({ name: 'Other List', shareSlug: 'other-list' }) })
      await act(async () => {
        store.current.addMailingEntry(listId, { name: 'Fan Two', email: 'fan2@example.com' })
      })
      const other = store.current.data.mailingLists.find(l => l.id === otherId)
      expect(other.entries).toHaveLength(0)
    })

    it('assigns a uid prefixed with "mle"', async () => {
      await act(async () => {
        store.current.addMailingEntry(listId, { name: 'Fan Three' })
      })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.entries[0].id).toMatch(/^mle/)
    })

    it('stamps submittedAt as an ISO datetime string', async () => {
      await act(async () => { store.current.addMailingEntry(listId, { name: 'Fan Four' }) })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.entries[0].submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('addContactToMailingList', () => {
    let listId
    let contactId

    beforeEach(async () => {
      await act(async () => { listId = store.current.addMailingList({ name: 'VIP List', shareSlug: 'vip' }) })
      contactId = store.current.data.contacts[0].id
    })

    it('adds the contactId to memberContactIds', async () => {
      await act(async () => { store.current.addContactToMailingList(listId, contactId) })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.memberContactIds).toContain(contactId)
    })

    it('is idempotent — adding the same contact twice does not create duplicates', async () => {
      await act(async () => {
        store.current.addContactToMailingList(listId, contactId)
        store.current.addContactToMailingList(listId, contactId)
      })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.memberContactIds.filter(id => id === contactId)).toHaveLength(1)
    })
  })

  describe('removeContactFromMailingList', () => {
    let listId
    let contactId

    beforeEach(async () => {
      await act(async () => { listId = store.current.addMailingList({ name: 'VIP List', shareSlug: 'vip2' }) })
      contactId = store.current.data.contacts[0].id
      await act(async () => { store.current.addContactToMailingList(listId, contactId) })
    })

    it('removes the contactId from memberContactIds', async () => {
      await act(async () => { store.current.removeContactFromMailingList(listId, contactId) })
      const list = store.current.data.mailingLists.find(l => l.id === listId)
      expect(list.memberContactIds).not.toContain(contactId)
    })
  })
})
