import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type IncomeItem = {
  id: string
  description: string
  amount: number
  frequency: 'Monthly' | 'Yearly' | 'Weekly'
}

const INCOME_API = 'http://localhost:3000/api/incomes'

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

const Income: React.FC = () => {
  const navigate = useNavigate()
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ description: '', amount: '', frequency: 'Monthly' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const payload: any = parseJwt(token)
  const userId = payload?.id

  useEffect(() => {
    if (!token) return navigate('/login')
    if (!userId) return
    fetchIncomeItems()
  }, [token, userId])

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchIncomeItems = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`${INCOME_API}/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setIncomeItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const body = { description: newItem.description, amount: Number(newItem.amount), frequency: newItem.frequency }
      const res = await fetch(`${INCOME_API}/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('create failed')
      setNewItem({ description: '', amount: '', frequency: 'Monthly' })
      await fetchIncomeItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, item: IncomeItem) => {
    try {
      const body = { description: item.description, amount: Number(item.amount), frequency: item.frequency }
      const res = await fetch(`${INCOME_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('update failed')
      await fetchIncomeItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${INCOME_API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await fetchIncomeItems()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-slate-100">Your Income</h2>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back</button>
        </div>

        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <div className="space-y-3">
            {[...incomeItems, null].map((it, idx) => (
              <div key={it?.id ?? `new-${idx}`} className="w-full bg-slate-800 p-4 rounded">
                <div className="grid gap-4 md:grid-cols-[1fr_180px] items-end">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Description</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100"
                        value={it ? it.description : newItem.description}
                        onChange={(e) => {
                          if (it) {
                            setIncomeItems((s) => s.map(i => i.id === it.id ? { ...i, description: e.target.value } : i))
                          } else {
                            setNewItem(n => ({ ...n, description: e.target.value }))
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Amount</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        value={it ? String(it.amount) : newItem.amount}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setIncomeItems((s) => s.map(i => i.id === it.id ? { ...i, amount: Number(v) } : i))
                          else setNewItem(n => ({ ...n, amount: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Frequency</label>
                      <select
                        className="w-full p-2 rounded bg-slate-700 text-slate-100"
                        value={it ? it.frequency : newItem.frequency}
                        onChange={(e) => {
                          const v = e.target.value as any
                          if (it) setIncomeItems((s) => s.map(i => i.id === it.id ? { ...i, frequency: v } : i))
                          else setNewItem(n => ({ ...n, frequency: v }))
                        }}
                      >
                        <option>Monthly</option>
                        <option>Yearly</option>
                        <option>Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    {it ? (
                      <>
                        <button className="btn-primary flex-1" onClick={() => handleUpdate(it.id, it)}>Update</button>
                        <button className="btn-delete flex-1" onClick={() => handleDelete(it.id)}>Delete</button>
                      </>
                    ) : (
                      <button className="btn-primary w-full" onClick={handleAdd}>Add</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-slate-900 rounded text-right">
              <span className="text-slate-300 mr-2">Total:</span>
              <span className="text-xl font-semibold text-slate-100">
                {incomeItems.reduce((sum, i) => sum + Number(i.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Income
