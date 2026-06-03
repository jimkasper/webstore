import { useState, useMemo, useRef } from 'react'
import { useStore } from '../store.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import Papa from 'papaparse'

const TABS = ['Dashboard', 'Accounts', 'Transactions', 'Budget']
const CATEGORIES = ['Groceries', 'Dining Out', 'Coffee', 'Health & Fitness', 'Shopping', 'Transport', 'Subscriptions', 'Books', 'Entertainment', 'Income', 'Other']
const EXPENSE_CATS = CATEGORIES.filter(c => c !== 'Income')
const ACCOUNT_TYPES = ['checking', 'savings', 'credit', 'investment', 'cash']
const PRESET_COLORS = ['#1a56db', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4']
const TYPE_LABEL = { checking: 'Checking', savings: 'Savings', credit: 'Credit', investment: 'Investment', cash: 'Cash' }
const TYPE_ICON  = { checking: '🏦', savings: '💰', credit: '💳', investment: '📈', cash: '💵' }

function fmtAbs(n) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtSigned(n) {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `+$${n.toFixed(2)}`
}
function projectToMonthEnd(spent, vd) {
  const d = vd.getDate()
  const dim = new Date(vd.getFullYear(), vd.getMonth() + 1, 0).getDate()
  return d === 0 ? 0 : (spent / d) * dim
}
function monthLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
function monthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '16px 20px', flex: '1 1 130px', cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function EditableLimit({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(value))
  function save() {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) onSave(n)
    setEditing(false)
  }
  if (editing) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      $<input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
        onBlur={save} onKeyDown={e => e.key === 'Enter' ? save() : e.key === 'Escape' && setEditing(false)}
        style={{ width: 60, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 3, padding: '1px 4px', fontSize: 12, color: 'var(--text-1)' }} />
    </span>
  )
  return (
    <span onClick={() => { setVal(String(value)); setEditing(true) }}
      style={{ cursor: 'text', borderBottom: '1px dashed var(--border)', fontSize: 12, color: 'var(--text-2)' }}
      title="Click to edit">${value}</span>
  )
}

function BudgetTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ color: '#84cc16' }}>Spent: {fmtAbs(d?.spent ?? 0)}</div>
      <div style={{ color: 'rgba(132,204,22,0.8)' }}>Projected: {fmtAbs(d?.projected ?? 0)}</div>
      <div style={{ color: '#64748b' }}>Budget: {fmtAbs(d?.budget ?? 0)}</div>
      {d?.overBudget && <div style={{ color: '#ef4444', marginTop: 4 }}>⚠ Projected over budget</div>}
    </div>
  )
}

function ImportModal({ onClose, defaultAccountId, accounts, importTransactions }) {
  const [step, setStep] = useState(1)
  const [rows, setRows] = useState([])
  const [headers, setHeaders] = useState([])
  const [mapping, setMapping] = useState({ date: '', merchant: '', amount: '', debit: '', credit: '' })
  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || '')
  const [parsed, setParsed] = useState([])
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const fields = meta.fields || []
        setHeaders(fields)
        setRows(data)
        setMapping(autoDetect(fields))
        setStep(2)
      },
    })
  }

  function autoDetect(fields) {
    const lf = fields.map(f => f.toLowerCase().trim())
    const find = (keywords) => {
      for (const kw of keywords) {
        const i = lf.findIndex(f => f === kw || f.includes(kw))
        if (i >= 0) return fields[i]
      }
      return ''
    }
    return {
      date: find(['transaction date', 'date']),
      merchant: find(['description', 'merchant', 'payee', 'name']),
      amount: find(['amount']),
      debit: find(['debit']),
      credit: find(['credit']),
    }
  }

  function buildParsed() {
    return rows.map(row => {
      const rawDate = row[mapping.date]?.trim() || ''
      const merchant = row[mapping.merchant]?.trim() || ''
      let amount
      if (mapping.debit && mapping.credit) {
        const d = parseFloat(row[mapping.debit] || '0') || 0
        const c = parseFloat(row[mapping.credit] || '0') || 0
        amount = c > 0 ? c : -d
      } else {
        amount = parseFloat(row[mapping.amount] || '0') || 0
      }
      if (!rawDate || !merchant || isNaN(amount)) return null
      const dt = new Date(rawDate)
      const date = isNaN(dt.getTime()) ? rawDate : dt.toISOString().slice(0, 10)
      return { date, merchant, amount: parseFloat(amount.toFixed(2)) }
    }).filter(Boolean)
  }

  function handlePreview() {
    setParsed(buildParsed())
    setStep(3)
  }

  function handleImport() {
    importTransactions(parsed, accountId)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: 560, maxHeight: '82vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Import CSV — Step {step} of 3</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: 40, textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>Select a CSV export from your bank</div>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
              <button className="btn btn-primary" onClick={() => fileRef.current.click()}>Choose CSV file</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Auto-detects Chase, Bank of America, Capital One, Citi, and Wells Fargo formats.
              Your file is parsed locally — nothing leaves your browser.
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{rows.length} rows found · Map columns below</div>
            {[
              { label: 'Date column', key: 'date' },
              { label: 'Merchant / Description', key: 'merchant' },
              { label: 'Amount (leave blank if using Debit/Credit split)', key: 'amount' },
              { label: 'Debit column (optional)', key: 'debit' },
              { label: 'Credit column (optional)', key: 'credit' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <select className="input" value={mapping[f.key]} onChange={e => setMapping(m => ({ ...m, [f.key]: e.target.value }))} style={{ width: '100%', fontSize: 12 }}>
                  <option value="">— none —</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
            <div style={{ background: 'var(--bg)', borderRadius: 6, padding: 10, marginBottom: 16, overflow: 'auto', maxHeight: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>Preview (first 5 rows)</div>
              {rows.slice(0, 5).map((row, i) => {
                const date = row[mapping.date] || '—'
                const merchant = row[mapping.merchant] || '—'
                const amt = mapping.debit ? `${row[mapping.debit]||''}/${row[mapping.credit]||''}` : (row[mapping.amount] || '—')
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 8, fontSize: 11, padding: '3px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>
                    <span>{date}</span><span>{merchant}</span><span>{amt}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary btn-sm" onClick={handlePreview}>Preview Import →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{parsed.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>transactions to import</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Import into account</label>
              <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)} style={{ width: '100%', fontSize: 13 }}>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {TYPE_LABEL[a.type] || a.type}</option>)}
              </select>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 6, padding: 10, marginBottom: 16, maxHeight: 200, overflow: 'auto' }}>
              {parsed.slice(0, 10).map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>
                  <span>{row.date}</span>
                  <span>{row.merchant}</span>
                  <span style={{ color: row.amount < 0 ? '#ef4444' : '#4ade80' }}>{fmtSigned(row.amount)}</span>
                </div>
              ))}
              {parsed.length > 10 && <div style={{ fontSize: 11, color: 'var(--text-3)', paddingTop: 6 }}>+ {parsed.length - 10} more…</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary btn-sm" onClick={handleImport}>Import {parsed.length} transactions</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Financial() {
  const {
    data, addTransaction, deleteTransaction, updateTransaction, setBudgetLimit,
    addAccount, updateAccount, deleteAccount, importTransactions,
  } = useStore()

  const [tab, setTab] = useState('Dashboard')
  const [viewDate, setViewDate] = useState(() => new Date(2026, 3, 1)) // April 2026 — where seed data lives

  // Quick-add (Dashboard)
  const [qType, setQType] = useState('expense')
  const [qForm, setQForm] = useState({ amount: '', merchant: '', category: 'Groceries', date: new Date().toISOString().slice(0, 10), accountId: '' })

  // Account form
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [editAccountId, setEditAccountId] = useState(null)
  const [accForm, setAccForm] = useState({ name: '', institution: '', type: 'checking', balance: '', color: PRESET_COLORS[0] })

  // Transactions tab
  const [filterCat, setFilterCat] = useState('All')
  const [filterAccount, setFilterAccount] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), merchant: '', amount: '', category: 'Groceries', accountId: '' })
  const [editForm, setEditForm] = useState(null)

  // Import modal
  const [importAccountId, setImportAccountId] = useState(null)

  const accounts = data.accounts || []
  const budgets = data.budgetLimits ?? {}
  const vStr = monthStr(viewDate)
  const today = new Date()
  const isCurrentMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()
  const isPastMonth = viewDate < new Date(today.getFullYear(), today.getMonth(), 1)

  const monthTx = useMemo(
    () => data.transactions.filter(t => t.date.startsWith(vStr)),
    [data.transactions, vStr]
  )

  const totalSpent = useMemo(
    () => Math.abs(monthTx.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)),
    [monthTx]
  )
  const totalBudget = useMemo(() => Object.values(budgets).reduce((s, v) => s + v, 0), [budgets])
  const totalProjected = isPastMonth ? totalSpent : (isCurrentMonth ? projectToMonthEnd(totalSpent, today) : 0)
  const netWorth = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts])
  const assets = useMemo(() => accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0), [accounts])
  const liabilities = useMemo(() => Math.abs(accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0)), [accounts])

  const chartData = useMemo(() => {
    const vd = isCurrentMonth ? today : new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
    return Object.keys(budgets)
      .map(cat => {
        const spent = Math.abs(monthTx.filter(t => t.category === cat && t.amount < 0).reduce((s, t) => s + t.amount, 0))
        const projected = isPastMonth ? spent : (isCurrentMonth ? projectToMonthEnd(spent, vd) : 0)
        const budget = budgets[cat] || 0
        const overBudget = budget > 0 && projected > budget
        return { category: cat, spent, projectionDelta: Math.max(0, projected - spent), projected, budget, overBudget }
      })
      .filter(d => d.budget > 0 || d.spent > 0)
      .sort((a, b) => b.spent - a.spent)
  }, [budgets, monthTx, isPastMonth, isCurrentMonth, viewDate])

  const allTx = useMemo(
    () => [...data.transactions].sort((a, b) => b.date.localeCompare(a.date) || (b.id || '').localeCompare(a.id || '')),
    [data.transactions]
  )
  const filtered = useMemo(() => {
    let txs = allTx
    if (filterCat !== 'All') txs = txs.filter(t => t.category === filterCat)
    if (filterAccount !== 'All') txs = txs.filter(t => t.accountId === filterAccount)
    return txs
  }, [allTx, filterCat, filterAccount])

  const accColorMap = useMemo(() => {
    const m = {}
    accounts.forEach(a => { m[a.id] = a.color })
    return m
  }, [accounts])

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  function handleQuickAdd(e) {
    e.preventDefault()
    const n = parseFloat(qForm.amount)
    if (!qForm.merchant || isNaN(n) || n <= 0) return
    addTransaction({
      date: qForm.date,
      merchant: qForm.merchant,
      amount: qType === 'expense' ? -Math.abs(n) : Math.abs(n),
      category: qType === 'income' ? 'Income' : qForm.category,
      accountId: qForm.accountId || accounts[0]?.id || '',
    })
    setQForm(f => ({ ...f, merchant: '', amount: '' }))
  }

  function startEditAccount(a) {
    setEditAccountId(a.id)
    setAccForm({ name: a.name, institution: a.institution || '', type: a.type, balance: String(a.balance), color: a.color || PRESET_COLORS[0] })
    setShowAddAccount(true)
  }

  function cancelAccountForm() {
    setShowAddAccount(false)
    setEditAccountId(null)
    setAccForm({ name: '', institution: '', type: 'checking', balance: '', color: PRESET_COLORS[0] })
  }

  function handleSaveAccount() {
    const bal = parseFloat(accForm.balance)
    if (!accForm.name || isNaN(bal)) return
    if (editAccountId) {
      updateAccount(editAccountId, { ...accForm, balance: bal })
      setEditAccountId(null)
    } else {
      addAccount({ ...accForm, balance: bal, currency: 'USD' })
    }
    setAccForm({ name: '', institution: '', type: 'checking', balance: '', color: PRESET_COLORS[0] })
    setShowAddAccount(false)
  }

  function handleAdd(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.merchant || isNaN(amount)) return
    addTransaction({
      date: form.date, merchant: form.merchant,
      amount: form.category === 'Income' ? Math.abs(amount) : -Math.abs(amount),
      category: form.category,
      accountId: form.accountId || accounts[0]?.id || '',
    })
    setForm(f => ({ ...f, merchant: '', amount: '' }))
    setShowForm(false)
  }

  function startEdit(t) {
    setEditId(t.id)
    setEditForm({ date: t.date, merchant: t.merchant, amount: String(Math.abs(t.amount)), category: t.category, accountId: t.accountId || '' })
  }

  function saveEdit(id) {
    const amount = parseFloat(editForm.amount)
    if (!editForm.merchant || isNaN(amount)) return
    updateTransaction(id, { ...editForm, amount: editForm.category === 'Income' ? Math.abs(amount) : -Math.abs(amount) })
    setEditId(null); setEditForm(null)
  }

  const hasAccounts = accounts.length > 0
  const txCols = hasAccounts ? '100px 1fr 130px 90px 14px 72px' : '100px 1fr 130px 90px 72px'

  return (
    <div className="content">
      {/* Topbar */}
      <div className="topbar">
        <span style={{ fontSize: 18 }}>💰</span>
        <div className="topbar-title">Financial</div>
        <div className="topbar-sep" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 134, textAlign: 'center' }}>{monthLabel(viewDate)}</span>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
        </div>
        <div className="topbar-right">
          {tab === 'Transactions' && !showForm && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Transaction</button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '8px 24px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); setEditId(null) }}
            className={`btn btn-ghost btn-sm ${tab === t ? 'active' : ''}`}
            style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', paddingBottom: 10, borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="scroll">
        <div style={{ padding: '20px 24px', maxWidth: 960 }}>

          {/* ── DASHBOARD ── */}
          {tab === 'Dashboard' && (
            <div>
              {/* Quick-add form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {[['expense', 'Expense'], ['income', 'Income']].map(([v, l]) => (
                    <button key={v} onClick={() => setQType(v)}
                      className={`btn btn-sm ${qType === v ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>
                  ))}
                </div>
                <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                    Amount
                    <input type="number" min="0" step="0.01" className="input" value={qForm.amount}
                      onChange={e => setQForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00" style={{ width: 90 }} required />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                    Merchant
                    <input className="input" value={qForm.merchant}
                      onChange={e => setQForm(f => ({ ...f, merchant: e.target.value }))}
                      placeholder={qType === 'expense' ? 'Whole Foods' : 'Freelance client'}
                      style={{ width: 160 }} required />
                  </label>
                  {qType === 'expense' && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                      Category
                      <select className="input" value={qForm.category} onChange={e => setQForm(f => ({ ...f, category: e.target.value }))}>
                        {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  )}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                    Date
                    <input type="date" className="input" value={qForm.date}
                      onChange={e => setQForm(f => ({ ...f, date: e.target.value }))} style={{ width: 130 }} />
                  </label>
                  {hasAccounts && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                      Account
                      <select className="input" value={qForm.accountId || accounts[0]?.id}
                        onChange={e => setQForm(f => ({ ...f, accountId: e.target.value }))}>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </label>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>+ Add</button>
                </form>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <StatCard label="Budget" value={fmtAbs(totalBudget)} sub={monthLabel(viewDate)} />
                <StatCard
                  label="Spent" value={fmtAbs(totalSpent)} sub="expenses only"
                  color={totalSpent > totalBudget ? '#ef4444' : 'var(--accent)'} />
                <StatCard
                  label={isPastMonth ? 'Actual' : 'Projected'}
                  value={fmtAbs(totalProjected)}
                  sub={isPastMonth ? 'month complete' : isCurrentMonth ? 'linear projection' : 'no data yet'}
                  color={totalProjected > totalBudget ? '#ef4444' : undefined} />
                <StatCard
                  label="Net Worth" value={netWorth >= 0 ? fmtAbs(netWorth) : `-${fmtAbs(-netWorth)}`}
                  sub={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
                  color={netWorth >= 0 ? 'var(--accent)' : '#ef4444'}
                  onClick={() => setTab('Accounts')} />
              </div>

              {/* Recharts horizontal stacked bar chart */}
              {chartData.length > 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Budget vs. Spend — {monthLabel(viewDate)}</div>
                    {isCurrentMonth && (
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)' }}>
                        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#84cc16', borderRadius: 2, marginRight: 4 }} />actual</span>
                        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(132,204,22,0.28)', borderRadius: 2, marginRight: 4 }} />projected</span>
                      </div>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={chartData.length * 52 + 48}>
                    <BarChart layout="vertical" data={chartData} margin={{ left: 110, right: 100, top: 4, bottom: 4 }}>
                      <XAxis type="number" tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" width={108} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<BudgetTooltip />} />
                      <Bar dataKey="spent" stackId="a" maxBarSize={32}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.overBudget ? '#ef4444' : '#84cc16'} />)}
                      </Bar>
                      <Bar dataKey="projectionDelta" stackId="a" radius={[0, 4, 4, 0]} maxBarSize={32}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.overBudget ? 'rgba(239,68,68,0.28)' : 'rgba(132,204,22,0.25)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Per-category summary below chart */}
                  <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    {chartData.map(d => (
                      <div key={d.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: d.overBudget ? '#ef4444' : 'var(--text-3)', padding: '2px 0' }}>
                        <span>{d.overBudget ? '⚠ ' : ''}{d.category}</span>
                        <span>
                          {fmtAbs(d.spent)} spent
                          {d.budget > 0 ? ` · ${fmtAbs(d.budget)} budget` : ''}
                          {!isPastMonth && d.projected !== d.spent ? ` · ${fmtAbs(d.projected)} proj` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                  No spending data for {monthLabel(viewDate)}. Use ← to navigate to a month with data.
                </div>
              )}
            </div>
          )}

          {/* ── ACCOUNTS ── */}
          {tab === 'Accounts' && (
            <div>
              {/* Net worth strip */}
              <div style={{ display: 'flex', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Total Assets</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{fmtAbs(assets)}</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--text-3)' }}>−</div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Total Liabilities</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{fmtAbs(liabilities)}</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--text-3)' }}>=</div>
                <div style={{ flex: 1, minWidth: 120, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Net Worth</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: netWorth >= 0 ? 'var(--accent)' : '#ef4444' }}>
                    {netWorth >= 0 ? fmtAbs(netWorth) : `-${fmtAbs(-netWorth)}`}
                  </div>
                </div>
              </div>

              {/* Account cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
                {accounts.map(a => (
                  <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: a.color || '#84cc16', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.institution}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => startEditAccount(a)}>✎</button>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px', color: '#e05c5c' }}
                          onClick={() => { if (window.confirm(`Delete "${a.name}"?`)) deleteAccount(a.id) }}>✕</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: a.balance >= 0 ? 'var(--accent)' : '#ef4444', marginBottom: 10 }}>
                      {a.balance < 0 ? `-${fmtAbs(-a.balance)}` : fmtAbs(a.balance)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg)', borderRadius: 4, padding: '2px 8px' }}>
                        {TYPE_ICON[a.type]} {TYPE_LABEL[a.type]}
                      </span>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setImportAccountId(a.id)}>
                        Import CSV →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit account form */}
              {showAddAccount ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>{editAccountId ? 'Edit Account' : 'Add Account'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    {[
                      { label: 'Account Name *', key: 'name', placeholder: 'Chase Checking' },
                      { label: 'Institution', key: 'institution', placeholder: 'Chase' },
                    ].map(f => (
                      <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-2)' }}>
                        {f.label}
                        <input className="input" value={accForm[f.key]} onChange={e => setAccForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                      </label>
                    ))}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-2)' }}>
                      Type
                      <select className="input" value={accForm.type} onChange={e => setAccForm(p => ({ ...p, type: e.target.value }))}>
                        {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--text-2)' }}>
                      Balance * <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(negative for credit cards)</span>
                      <input type="number" step="0.01" className="input" value={accForm.balance}
                        onChange={e => setAccForm(p => ({ ...p, balance: e.target.value }))} placeholder="0.00" />
                    </label>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>Color</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => setAccForm(p => ({ ...p, color: c }))}
                          style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: accForm.color === c ? '3px solid var(--text-1)' : '2px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveAccount}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={cancelAccountForm}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddAccount(true)}>+ Add Account</button>
              )}
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {tab === 'Transactions' && (
            <div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input" style={{ fontSize: 12, padding: '4px 8px' }}>
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {hasAccounts && (
                  <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} className="input" style={{ fontSize: 12, padding: '4px 8px' }}>
                    <option value="All">All accounts</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} records</span>
              </div>

              {showForm && (
                <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                  {[
                    { label: 'Date', key: 'date', type: 'date' },
                    { label: 'Merchant', key: 'merchant', type: 'text', placeholder: 'Whole Foods' },
                    { label: 'Amount', key: 'amount', type: 'number', placeholder: '0.00' },
                  ].map(f => (
                    <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                      {f.label}
                      <input type={f.type} className="input" value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} required style={{ width: f.key === 'merchant' ? 160 : 120 }} />
                    </label>
                  ))}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                    Category
                    <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  {hasAccounts && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-2)' }}>
                      Account
                      <select className="input" value={form.accountId || accounts[0]?.id} onChange={e => setForm(p => ({ ...p, accountId: e.target.value }))}>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </label>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: txCols, gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
                <span>DATE</span><span>MERCHANT</span><span>CATEGORY</span>
                <span style={{ textAlign: 'right' }}>AMOUNT</span>
                {hasAccounts && <span />}
                <span />
              </div>

              {filtered.map(t => editId === t.id ? (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: txCols, gap: 8, padding: '6px 12px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, alignItems: 'center', border: '1px solid var(--accent)' }}>
                  <input type="date" className="input" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={{ fontSize: 11, padding: '2px 4px' }} />
                  <input className="input" value={editForm.merchant} onChange={e => setEditForm(f => ({ ...f, merchant: e.target.value }))} style={{ fontSize: 12, padding: '2px 6px' }} />
                  <select className="input" value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} style={{ fontSize: 11, padding: '2px 4px' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="number" className="input" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} style={{ fontSize: 12, padding: '2px 4px', textAlign: 'right' }} />
                  {hasAccounts && <span style={{ width: 10, height: 10, borderRadius: '50%', background: accColorMap[editForm.accountId] || '#64748b', display: 'inline-block' }} />}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => saveEdit(t.id)}>✓</button>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => setEditId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: txCols, gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, marginBottom: 2, fontSize: 13, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{t.date}</span>
                  <span style={{ fontWeight: 500 }}>{t.merchant}</span>
                  <span style={{ color: 'var(--text-2)', fontSize: 12 }}>{t.category}</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--green)' : '#e05c5c' }}>{fmtSigned(t.amount)}</span>
                  {hasAccounts && (
                    <span title={accounts.find(a => a.id === t.accountId)?.name || ''}
                      style={{ width: 10, height: 10, borderRadius: '50%', background: accColorMap[t.accountId] || '#334155', display: 'inline-block' }} />
                  )}
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px' }} onClick={() => startEdit(t)}>✎</button>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 6px', color: '#e05c5c' }} onClick={() => deleteTransaction(t.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── BUDGET ── */}
          {tab === 'Budget' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
                Monthly budget limits vs. spending in {monthLabel(viewDate)}. <strong>Click any limit to edit it.</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '4fr 2fr 2fr 2fr', gap: 8, padding: '6px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
                <span>CATEGORY</span>
                <span style={{ textAlign: 'right' }}>SPENT</span>
                <span style={{ textAlign: 'right' }}>PROJECTED</span>
                <span style={{ textAlign: 'right' }}>LIMIT</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(budgets).map(([cat, limit]) => {
                  const spent = monthTx.filter(t => t.category === cat && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
                  const projected = isPastMonth ? spent : (isCurrentMonth ? projectToMonthEnd(spent, today) : 0)
                  const pct = Math.min(100, (spent / limit) * 100)
                  const over = projected > limit
                  return (
                    <div key={cat} style={{ background: 'var(--surface)', border: `1px solid ${over ? '#e05c5c44' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '4fr 2fr 2fr 2fr', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{cat}</span>
                        <span style={{ textAlign: 'right', fontSize: 12, color: over ? '#e05c5c' : 'var(--text-2)' }}>{fmtAbs(spent)}</span>
                        <span style={{ textAlign: 'right', fontSize: 12, color: over ? '#e05c5c' : 'var(--accent)' }}>
                          {isPastMonth ? <span style={{ color: 'var(--text-3)' }}>—</span> : fmtAbs(projected)}
                        </span>
                        <span style={{ textAlign: 'right' }}>
                          <EditableLimit value={limit} onSave={v => setBudgetLimit(cat, v)} />
                        </span>
                      </div>
                      <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? '#e05c5c' : pct > 70 ? '#e0a040' : 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {importAccountId !== null && (
        <ImportModal
          onClose={() => setImportAccountId(null)}
          defaultAccountId={importAccountId}
          accounts={accounts}
          importTransactions={importTransactions}
        />
      )}
    </div>
  )
}
