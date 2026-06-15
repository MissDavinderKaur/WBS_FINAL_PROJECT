import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from './LogoutButton'

type MortgageItem = {
  id: string
  originalLoanAmount: number
  annualInterestRate: number
  mortgageStartDate: string
  standardMonthlyRepayment: number
}

const MORTGAGE_API = 'http://localhost:3000/api/mortgages'

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

function toDisplayDate(isoDate: string) {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const emptyNew = { originalLoanAmount: '', annualInterestRate: '', mortgageStartDate: '', standardMonthlyRepayment: '' }

function validateDate(value: string): string | null {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return 'Use DD-MM-YYYY format'
  const [day, month, year] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'Invalid date'
  }
  if (date > new Date()) return 'Date cannot be in the future'
  return null
}

const Mortgage: React.FC = () => {
  const navigate = useNavigate()
  const [mortgageItems, setMortgageItems] = useState<MortgageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState(emptyNew)
  const [dateErrors, setDateErrors] = useState<Record<string, string | null>>({})

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const payload: any = parseJwt(token)
  const userId = payload?.id

  useEffect(() => {
    if (!token) return navigate('/login')
    if (!userId) return
    fetchMortgageItems()
  }, [token, userId])

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchMortgageItems = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`${MORTGAGE_API}/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setMortgageItems(data.map((m: any) => ({ ...m, mortgageStartDate: toDisplayDate(m.mortgageStartDate) })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const err = validateDate(newItem.mortgageStartDate)
    if (err) { setDateErrors(e => ({ ...e, new: err })); return }
    try {
      const body = {
        originalLoanAmount: Number(newItem.originalLoanAmount),
        annualInterestRate: Number(newItem.annualInterestRate),
        mortgageStartDate: newItem.mortgageStartDate,
        standardMonthlyRepayment: Number(newItem.standardMonthlyRepayment)
      }
      const res = await fetch(`${MORTGAGE_API}/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('create failed')
      setNewItem(emptyNew)
      setDateErrors(e => ({ ...e, new: null }))
      await fetchMortgageItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, item: MortgageItem) => {
    const err = validateDate(item.mortgageStartDate)
    if (err) { setDateErrors(e => ({ ...e, [id]: err })); return }
    try {
      const body = {
        originalLoanAmount: Number(item.originalLoanAmount),
        annualInterestRate: Number(item.annualInterestRate),
        mortgageStartDate: item.mortgageStartDate,
        standardMonthlyRepayment: Number(item.standardMonthlyRepayment)
      }
      const res = await fetch(`${MORTGAGE_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('update failed')
      await fetchMortgageItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${MORTGAGE_API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await fetchMortgageItems()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back</button>
          <h2 className="text-2xl text-slate-100">Your Mortgage</h2>
          <LogoutButton />
        </div>

        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <div className="space-y-3">
            {[...mortgageItems, null].map((it, idx) => (
              <div key={it?.id ?? `new-${idx}`} className="w-full bg-slate-800 p-4 rounded">
                <div className="grid gap-4 md:grid-cols-[1fr_180px] items-end">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Original Loan Amount (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 250000"
                        value={it ? String(it.originalLoanAmount) : newItem.originalLoanAmount}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setMortgageItems(s => s.map(m => m.id === it.id ? { ...m, originalLoanAmount: Number(v) } : m))
                          else setNewItem(n => ({ ...n, originalLoanAmount: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Annual Interest Rate (e.g. 0.042)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 0.042"
                        value={it ? String(it.annualInterestRate) : newItem.annualInterestRate}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setMortgageItems(s => s.map(m => m.id === it.id ? { ...m, annualInterestRate: Number(v) } : m))
                          else setNewItem(n => ({ ...n, annualInterestRate: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Mortgage Start Date (DD-MM-YYYY)</label>
                      <input
                        className={`w-full p-2 rounded bg-slate-700 text-slate-100 ${dateErrors[it?.id ?? 'new'] ? 'ring-2 ring-red-500' : ''}`}
                        placeholder="e.g. 01-03-2020"
                        value={it ? it.mortgageStartDate : newItem.mortgageStartDate}
                        onChange={(e) => {
                          const v = e.target.value
                          const key = it?.id ?? 'new'
                          setDateErrors(errs => ({ ...errs, [key]: validateDate(v) }))
                          if (it) setMortgageItems(s => s.map(m => m.id === it.id ? { ...m, mortgageStartDate: v } : m))
                          else setNewItem(n => ({ ...n, mortgageStartDate: v }))
                        }}
                      />
                      {dateErrors[it?.id ?? 'new'] && (
                        <span className="text-xs text-red-400">{dateErrors[it?.id ?? 'new']}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Monthly Repayment (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 1234.56"
                        value={it ? String(it.standardMonthlyRepayment) : newItem.standardMonthlyRepayment}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setMortgageItems(s => s.map(m => m.id === it.id ? { ...m, standardMonthlyRepayment: Number(v) } : m))
                          else setNewItem(n => ({ ...n, standardMonthlyRepayment: v }))
                        }}
                      />
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
          </div>
        )}
      </div>
    </main>
  )
}

export default Mortgage
