import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from './LogoutButton'

type ExpenseItem = {
  id: string
  description: string
  amount: number
  type: 'Fixed' | 'Variable'
  category: 'Housing' | 'Shopping' | 'Transport' | 'Entertainment' | 'Utilties' | 'Other'
}

const EXPENSE_API = 'http://localhost:3000/api/expenses'

function parseJwt(token: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch (e) {
    return null
  }
}

const Expense: React.FC = () => {
  const navigate = useNavigate()
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ description: '', amount: '', type: 'Fixed' as const, category: 'Housing' as const })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const payload: any = parseJwt(token)
  const userId = payload?.id

  useEffect(() => {
    if (!token) return navigate('/login')
    if (!userId) return
    fetchExpenseItems()
  }, [token, userId])

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchExpenseItems = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`${EXPENSE_API}/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setExpenseItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setError(null)
    if (!newItem.description.trim() || !newItem.amount.trim()) {
      setError('Description and amount are required')
      return
    }

    const body = { description: newItem.description.trim(), amount: Number(newItem.amount), type: newItem.type, category: newItem.category }
    if (Number.isNaN(body.amount)) {
      setError('Amount must be a number')
      return
    }

    try {
      const res = await fetch(`${EXPENSE_API}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.error || 'Create failed')
      }
      setNewItem({ description: '', amount: '', type: 'Fixed', category: 'Housing' })
      await fetchExpenseItems()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Create failed')
    }
  }

  const handleUpdate = async (id: string, item: ExpenseItem) => {
    try {
      const body = { description: item.description, amount: Number(item.amount), type: item.type, category: item.category }
      const res = await fetch(`${EXPENSE_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('update failed')
      await fetchExpenseItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${EXPENSE_API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await fetchExpenseItems()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back</button>
          <h2 className="text-2xl text-slate-100">Your Expenses</h2>
          <LogoutButton />
        </div>

        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <div className="space-y-3">
            {error && <div className="text-sm text-rose-300 bg-rose-900 p-3 rounded">{error}</div>}
            {[...expenseItems, null].map((it, idx) => (
              <div key={it?.id ?? `new-${idx}`} className="w-full bg-slate-800 p-4 rounded">
                <div className="grid gap-4 md:grid-cols-[1fr_180px] items-end">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Description</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100"
                        value={it ? it.description : newItem.description}
                        onChange={(e) => {
                          if (it) {
                            setExpenseItems((s) => s.map(i => i.id === it.id ? { ...i, description: e.target.value } : i))
                          } else {
                            setNewItem(n => ({ ...n, description: e.target.value }))
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Amount</label>
                      <input
                        type="number"
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        value={it ? String(it.amount) : newItem.amount}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setExpenseItems((s) => s.map(i => i.id === it.id ? { ...i, amount: Number(v) } : i))
                          else setNewItem(n => ({ ...n, amount: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Type</label>
                      <select
                        className="w-full p-2 rounded bg-slate-700 text-slate-100"
                        value={it ? it.type : newItem.type}
                        onChange={(e) => {
                          const v = e.target.value as any
                          if (it) setExpenseItems((s) => s.map(i => i.id === it.id ? { ...i, type: v } : i))
                          else setNewItem(n => ({ ...n, type: v }))
                        }}
                      >
                        <option>Fixed</option>
                        <option>Variable</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Category</label>
                      <select
                        className="w-full p-2 rounded bg-slate-700 text-slate-100"
                        value={it ? it.category : newItem.category}
                        onChange={(e) => {
                          const v = e.target.value as any
                          if (it) setExpenseItems((s) => s.map(i => i.id === it.id ? { ...i, category: v } : i))
                          else setNewItem(n => ({ ...n, category: v }))
                        }}
                      >
                        <option>Housing</option>
                        <option>Shopping</option>
                        <option>Transport</option>
                        <option>Entertainment</option>
                        <option>Utilties</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    {it ? (
                      <>
                        <button type="button" className="btn-primary flex-1" onClick={() => handleUpdate(it.id, it)}>Update</button>
                        <button type="button" className="btn-delete flex-1" onClick={() => handleDelete(it.id)}>Delete</button>
                      </>
                    ) : (
                      <button type="button" className="btn-primary w-full" onClick={handleAdd}>Add</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-slate-900 rounded text-right">
              <span className="text-slate-300 mr-2">Total:</span>
              <span className="text-xl font-semibold text-slate-100">
                {expenseItems.reduce((sum, i) => sum + Number(i.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Expense
