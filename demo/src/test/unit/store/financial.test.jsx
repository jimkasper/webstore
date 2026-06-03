import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTestStore } from '../../helpers/store-helpers'

// Seed data: 40 transactions, 3 accounts, 0 import hashes
const SEED_TRANSACTION_COUNT = 40
const SEED_ACCOUNT_COUNT = 3

describe('Store — Financial', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    store = useTestStore()
  })

  // ── addTransaction ─────────────────────────────────────────────────────────

  describe('addTransaction', () => {
    it('prepends a new transaction and increments the transactions array length', async () => {
      await act(async () => {
        store.current.addTransaction({ date: '2026-05-01', merchant: 'Test Store', amount: -25.00, category: 'Shopping' })
      })
      expect(store.current.data.transactions).toHaveLength(SEED_TRANSACTION_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "t"', async () => {
      await act(async () => {
        store.current.addTransaction({ date: '2026-05-01', merchant: 'Test', amount: -10.00, category: 'Other' })
      })
      const added = store.current.data.transactions[0]
      expect(typeof added.id).toBe('string')
      expect(added.id).toMatch(/^t/)
    })

    it('preserves all provided transaction fields', async () => {
      await act(async () => {
        store.current.addTransaction({
          date: '2026-05-01', merchant: 'Whole Foods', amount: -55.20,
          category: 'Groceries', accountId: 'acc1',
        })
      })
      const added = store.current.data.transactions[0]
      expect(added.date).toBe('2026-05-01')
      expect(added.merchant).toBe('Whole Foods')
      expect(added.amount).toBe(-55.20)
      expect(added.category).toBe('Groceries')
    })

    it('is prepended — appears as first transaction (newest first)', async () => {
      await act(async () => {
        store.current.addTransaction({ date: '2026-05-01', merchant: 'First', amount: -1.00, category: 'Other' })
      })
      expect(store.current.data.transactions[0].merchant).toBe('First')
    })
  })

  // ── updateTransaction ──────────────────────────────────────────────────────

  describe('updateTransaction', () => {
    it('updates the specified field on the transaction', async () => {
      const target = store.current.data.transactions[0]
      await act(async () => { store.current.updateTransaction(target.id, { category: 'Updated' }) })
      const updated = store.current.data.transactions.find(t => t.id === target.id)
      expect(updated.category).toBe('Updated')
    })

    it('merges the patch — preserves other fields', async () => {
      const target = store.current.data.transactions[0]
      const originalMerchant = target.merchant
      await act(async () => { store.current.updateTransaction(target.id, { amount: -99.99 }) })
      const updated = store.current.data.transactions.find(t => t.id === target.id)
      expect(updated.merchant).toBe(originalMerchant)
      expect(updated.amount).toBe(-99.99)
    })
  })

  // ── deleteTransaction ──────────────────────────────────────────────────────

  describe('deleteTransaction', () => {
    it('removes the transaction with the given id', async () => {
      const target = store.current.data.transactions[0]
      await act(async () => { store.current.deleteTransaction(target.id) })
      expect(store.current.data.transactions.find(t => t.id === target.id)).toBeUndefined()
    })

    it('reduces the transactions array length by one', async () => {
      const target = store.current.data.transactions[0]
      await act(async () => { store.current.deleteTransaction(target.id) })
      expect(store.current.data.transactions).toHaveLength(SEED_TRANSACTION_COUNT - 1)
    })
  })

  // ── addAccount ─────────────────────────────────────────────────────────────

  describe('addAccount', () => {
    it('appends a new account and increments the accounts array length', async () => {
      await act(async () => {
        store.current.addAccount({ name: 'New Savings', type: 'savings', institution: 'Ally', balance: 5000 })
      })
      expect(store.current.data.accounts).toHaveLength(SEED_ACCOUNT_COUNT + 1)
    })

    it('assigns a unique string id prefixed with "acc"', async () => {
      await act(async () => {
        store.current.addAccount({ name: 'Test Account', type: 'checking', balance: 0 })
      })
      const added = store.current.data.accounts.at(-1)
      expect(added.id).toMatch(/^acc/)
    })

    it('defaults currency to "USD" when omitted', async () => {
      await act(async () => {
        store.current.addAccount({ name: 'No Currency', type: 'checking', balance: 100 })
      })
      expect(store.current.data.accounts.at(-1).currency).toBe('USD')
    })

    it('preserves all provided fields', async () => {
      await act(async () => {
        store.current.addAccount({ name: 'Fancy Account', type: 'investment', institution: 'Fidelity', balance: 20000, color: '#10b981' })
      })
      const added = store.current.data.accounts.at(-1)
      expect(added.name).toBe('Fancy Account')
      expect(added.type).toBe('investment')
      expect(added.balance).toBe(20000)
    })
  })

  // ── updateAccount ──────────────────────────────────────────────────────────

  describe('updateAccount', () => {
    it('updates the balance field on the account', async () => {
      const target = store.current.data.accounts[0]
      await act(async () => { store.current.updateAccount(target.id, { balance: 9999 }) })
      const updated = store.current.data.accounts.find(a => a.id === target.id)
      expect(updated.balance).toBe(9999)
    })

    it('does not affect other accounts', async () => {
      const [target, other] = store.current.data.accounts
      const otherBalanceBefore = other.balance
      await act(async () => { store.current.updateAccount(target.id, { balance: 1 }) })
      const otherAfter = store.current.data.accounts.find(a => a.id === other.id)
      expect(otherAfter.balance).toBe(otherBalanceBefore)
    })
  })

  // ── deleteAccount ──────────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    it('removes the account with the given id', async () => {
      const target = store.current.data.accounts[0]
      await act(async () => { store.current.deleteAccount(target.id) })
      expect(store.current.data.accounts.find(a => a.id === target.id)).toBeUndefined()
    })

    it('reduces the accounts array length by one', async () => {
      const target = store.current.data.accounts[0]
      await act(async () => { store.current.deleteAccount(target.id) })
      expect(store.current.data.accounts).toHaveLength(SEED_ACCOUNT_COUNT - 1)
    })
  })

  // ── importTransactions ─────────────────────────────────────────────────────

  describe('importTransactions', () => {
    const newRows = [
      { date: '2026-05-10', merchant: 'Import Store A', amount: -30.00 },
      { date: '2026-05-11', merchant: 'Import Store B', amount: -15.50 },
    ]

    it('adds new transactions to the store', async () => {
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      expect(store.current.data.transactions).toHaveLength(SEED_TRANSACTION_COUNT + 2)
    })

    it('assigns the provided accountId to all imported transactions', async () => {
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      const imported = store.current.data.transactions.filter(
        t => t.merchant === 'Import Store A' || t.merchant === 'Import Store B'
      )
      imported.forEach(t => expect(t.accountId).toBe('acc1'))
    })

    it('skips duplicate rows — same date+merchant+amount combination', async () => {
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      const beforeCount = store.current.data.transactions.length

      // Import same rows again — should skip all
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      expect(store.current.data.transactions).toHaveLength(beforeCount)
    })

    it('imports non-duplicate rows even when mixed with duplicates', async () => {
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      const beforeCount = store.current.data.transactions.length

      const mixedRows = [
        { date: '2026-05-10', merchant: 'Import Store A', amount: -30.00 }, // duplicate
        { date: '2026-05-12', merchant: 'Brand New Store', amount: -50.00 }, // new
      ]
      await act(async () => {
        store.current.importTransactions(mixedRows, 'acc1')
      })
      expect(store.current.data.transactions).toHaveLength(beforeCount + 1)
    })

    it('stores import hashes to enable future dedup checks', async () => {
      await act(async () => {
        store.current.importTransactions(newRows, 'acc1')
      })
      expect(store.current.data.importHashes).toHaveLength(2)
    })
  })
})
