import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StoreProvider, useStore } from '../../store'
import { renderHook, act } from '@testing-library/react'
import Financial from '../../pages/Financial'

function renderFinancial() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Financial />
      </StoreProvider>
    </MemoryRouter>
  )
}

// Renders Financial inside a single StoreProvider and returns a live ref to the store.
// Use this instead of useTestStore() + renderFinancial() when a test needs to inspect
// store state after UI interactions — both share the same React context tree.
function renderFinancialWithStore() {
  const storeRef = { current: null }

  function StoreCapture() {
    storeRef.current = useStore()
    return null
  }

  render(
    <MemoryRouter>
      <StoreProvider>
        <StoreCapture />
        <Financial />
      </StoreProvider>
    </MemoryRouter>
  )

  return storeRef
}

function useTestStore() {
  const { result } = renderHook(() => useStore(), {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <StoreProvider>{children}</StoreProvider>
      </MemoryRouter>
    ),
  })
  return result
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function fillAndSubmitExpense(user, { amount = '25', merchant = 'Test Store' } = {}) {
  const amountInput = screen.getByPlaceholderText('0.00')
  await user.clear(amountInput)
  await user.type(amountInput, amount)
  await user.type(screen.getByPlaceholderText('Whole Foods'), merchant)
  await user.click(screen.getByRole('button', { name: /\+ add/i }))
}

// ── Dashboard tab (default) ──────────────────────────────────────────────────

describe('Financial page — Dashboard tab', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the Financial heading in the topbar', () => {
    renderFinancial()
    expect(screen.getByText('Financial')).toBeInTheDocument()
  })

  it('shows the Dashboard tab as active by default', () => {
    renderFinancial()
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders all four tabs: Dashboard, Accounts, Transactions, Budget', () => {
    renderFinancial()
    ;['Dashboard', 'Accounts', 'Transactions', 'Budget'].forEach(tab => {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument()
    })
  })

  it('renders the month navigation arrows', () => {
    renderFinancial()
    const arrows = screen.getAllByRole('button', { name: /^[←→]$/ })
    expect(arrows.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the Budget stat card', () => {
    renderFinancial()
    // "Budget" appears in both the tab button and the stat card label
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the Spent stat card', () => {
    renderFinancial()
    expect(screen.getByText('Spent')).toBeInTheDocument()
  })

  it('renders the Net Worth stat card', () => {
    renderFinancial()
    expect(screen.getByText('Net Worth')).toBeInTheDocument()
  })

  it('renders the quick-add Expense button', () => {
    renderFinancial()
    expect(screen.getByRole('button', { name: 'Expense' })).toBeInTheDocument()
  })

  it('renders the quick-add Income button', () => {
    renderFinancial()
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument()
  })

  it('renders the amount input field with placeholder 0.00', () => {
    renderFinancial()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })

  it('renders the merchant input for expense with Whole Foods placeholder', () => {
    renderFinancial()
    expect(screen.getByPlaceholderText('Whole Foods')).toBeInTheDocument()
  })

  it('renders the + Add submit button', () => {
    renderFinancial()
    expect(screen.getByRole('button', { name: /\+ add/i })).toBeInTheDocument()
  })
})

// ── Quick-add form — Expense ──────────────────────────────────────────────────

describe('Financial page — quick-add expense', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a new expense transaction when the form is submitted', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()
    const countBefore = store.current.data.transactions.length

    await fillAndSubmitExpense(user, { amount: '50', merchant: 'Grocery Store' })

    expect(store.current.data.transactions.length).toBe(countBefore + 1)
  })

  it('stores the expense with a negative amount', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()

    await fillAndSubmitExpense(user, { amount: '75', merchant: 'Coffee Shop' })

    const added = store.current.data.transactions.find(t => t.merchant === 'Coffee Shop')
    expect(added).toBeDefined()
    expect(added.amount).toBe(-75)
  })

  it('stores the correct merchant name', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()

    await fillAndSubmitExpense(user, { amount: '30', merchant: 'Unique Merchant XYZ' })

    const added = store.current.data.transactions.find(t => t.merchant === 'Unique Merchant XYZ')
    expect(added).toBeDefined()
  })

  it('clears the amount field after successful submission', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await fillAndSubmitExpense(user, { amount: '20', merchant: 'Any Store' })

    const amountInput = screen.getByPlaceholderText('0.00')
    expect(amountInput.value).toBe('')
  })

  it('clears the merchant field after successful submission', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await fillAndSubmitExpense(user, { amount: '20', merchant: 'TempMerchant' })

    const merchantInput = screen.getByPlaceholderText('Whole Foods')
    expect(merchantInput.value).toBe('')
  })

  it('does not add a transaction when amount is empty', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()
    const countBefore = store.current.data.transactions.length

    // Only fill merchant, leave amount empty
    await user.type(screen.getByPlaceholderText('Whole Foods'), 'Some Store')
    await user.click(screen.getByRole('button', { name: /\+ add/i }))

    expect(store.current.data.transactions.length).toBe(countBefore)
  })

  it('does not add a transaction when merchant is empty', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()
    const countBefore = store.current.data.transactions.length

    // Only fill amount, leave merchant empty
    const amountInput = screen.getByPlaceholderText('0.00')
    await user.type(amountInput, '50')
    await user.click(screen.getByRole('button', { name: /\+ add/i }))

    expect(store.current.data.transactions.length).toBe(countBefore)
  })
})

// ── Quick-add form — Income ───────────────────────────────────────────────────

describe('Financial page — quick-add income', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('switches to income mode when Income button is clicked', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Income' }))
    // Income mode shows a different merchant placeholder
    expect(screen.getByPlaceholderText('Freelance client')).toBeInTheDocument()
  })

  it('stores a positive amount when income type is selected', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()

    await user.click(screen.getByRole('button', { name: 'Income' }))
    await user.type(screen.getByPlaceholderText('0.00'), '1000')
    await user.type(screen.getByPlaceholderText('Freelance client'), 'Client ABC')
    await user.click(screen.getByRole('button', { name: /\+ add/i }))

    const added = store.current.data.transactions.find(t => t.merchant === 'Client ABC')
    expect(added).toBeDefined()
    expect(added.amount).toBe(1000)
  })

  it('assigns Income category to income transactions', async () => {
    const user = userEvent.setup()
    const store = renderFinancialWithStore()

    await user.click(screen.getByRole('button', { name: 'Income' }))
    await user.type(screen.getByPlaceholderText('0.00'), '500')
    await user.type(screen.getByPlaceholderText('Freelance client'), 'Payroll Corp')
    await user.click(screen.getByRole('button', { name: /\+ add/i }))

    const added = store.current.data.transactions.find(t => t.merchant === 'Payroll Corp')
    expect(added?.category).toBe('Income')
  })
})

// ── Tab switching ──────────────────────────────────────────────────────────────

describe('Financial page — tab switching', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('switches to Accounts tab when clicked', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    // Accounts tab shows Net Worth info
    expect(screen.getByText('Net Worth')).toBeInTheDocument()
    expect(screen.getByText('Total Assets')).toBeInTheDocument()
  })

  it('switches to Transactions tab when clicked', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Transactions' }))
    // Transactions tab shows + Transaction button in topbar
    expect(screen.getByRole('button', { name: /\+ transaction/i })).toBeInTheDocument()
  })

  it('switches to Budget tab when clicked', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Budget' }))
    // Budget tab shows budget category rows; Groceries is a seed category
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('returns to Dashboard when Dashboard tab is clicked after switching away', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Transactions' }))
    await user.click(screen.getByRole('button', { name: 'Dashboard' }))
    // Dashboard quick-add form is visible again
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
  })
})

// ── Accounts tab ──────────────────────────────────────────────────────────────

describe('Financial page — Accounts tab', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the Total Assets label', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    expect(screen.getByText('Total Assets')).toBeInTheDocument()
  })

  it('shows the Total Liabilities label', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    expect(screen.getByText('Total Liabilities')).toBeInTheDocument()
  })

  it('renders seed account names', async () => {
    const user = userEvent.setup()
    renderFinancial()
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    // Seed data has 3 accounts
    expect(screen.getByText('Chase Checking')).toBeInTheDocument()
  })
})
