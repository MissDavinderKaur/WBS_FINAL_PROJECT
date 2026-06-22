import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from './LogoutButton'

type PensionItem = {
  id: string
  currentAge: number
  selectedRetirementAge: number
  currentPotSize: number
  monthlyContribution: number
  desiredAnnualIncome: number
  calculatedPotAtRetirement: number
  calculatedYearsPotWillLast: number
}

const PENSION_API = 'http://localhost:3000/api/pensions'

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

function formatAmount(value: string | number): string {
  const raw = String(value).replace(/,/g, '')
  if (raw === '' || isNaN(Number(raw))) return raw
  const [integer, decimal] = raw.split('.')
  const formatted = Number(integer).toLocaleString('en-GB')
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted
}

const emptyNew = {
  currentAge: '',
  selectedRetirementAge: '',
  currentPotSize: '',
  monthlyContribution: '',
  desiredAnnualIncome: ''
}

const Pension: React.FC = () => {
  const navigate = useNavigate()
  const [pensionItems, setPensionItems] = useState<PensionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState(emptyNew)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const payload: any = parseJwt(token)
  const userId = payload?.id

  useEffect(() => {
    if (!token) return navigate('/login')
    if (!userId) return
    fetchPensionItems()
  }, [token, userId])

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchPensionItems = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`${PENSION_API}/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setPensionItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const body = {
        currentAge: Number(newItem.currentAge),
        selectedRetirementAge: Number(newItem.selectedRetirementAge),
        currentPotSize: Number(newItem.currentPotSize),
        monthlyContribution: Number(newItem.monthlyContribution),
        desiredAnnualIncome: Number(newItem.desiredAnnualIncome)
      }
      const res = await fetch(`${PENSION_API}/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('create failed')
      setNewItem(emptyNew)
      await fetchPensionItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, item: PensionItem) => {
    try {
      const body = {
        currentAge: item.currentAge,
        selectedRetirementAge: item.selectedRetirementAge,
        currentPotSize: item.currentPotSize,
        monthlyContribution: item.monthlyContribution,
        desiredAnnualIncome: item.desiredAnnualIncome
      }
      const res = await fetch(`${PENSION_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) })
      if (!res.ok) throw new Error('update failed')
      await fetchPensionItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${PENSION_API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await fetchPensionItems()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back</button>
          <h2 className="text-2xl text-slate-100">Your Pension</h2>
          <LogoutButton />
        </div>

        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <div className="space-y-3">
            {[...pensionItems, null].map((it, idx) => (
              <div key={it?.id ?? `new-${idx}`} className="w-full bg-slate-800 p-4 rounded">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px] items-stretch">

                  {/* Left — Current */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Current</p>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Age</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 35"
                        type="number"
                        value={it ? it.currentAge : newItem.currentAge}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setPensionItems(s => s.map(p => p.id === it.id ? { ...p, currentAge: Number(v) } : p))
                          else setNewItem(n => ({ ...n, currentAge: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Pot Size (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 50,000"
                        value={formatAmount(it ? it.currentPotSize : newItem.currentPotSize)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/,/g, '')
                          if (it) setPensionItems(s => s.map(p => p.id === it.id ? { ...p, currentPotSize: Number(v) } : p))
                          else setNewItem(n => ({ ...n, currentPotSize: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Monthly Contribution (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 500"
                        value={formatAmount(it ? it.monthlyContribution : newItem.monthlyContribution)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/,/g, '')
                          if (it) setPensionItems(s => s.map(p => p.id === it.id ? { ...p, monthlyContribution: Number(v) } : p))
                          else setNewItem(n => ({ ...n, monthlyContribution: v }))
                        }}
                      />
                    </div>
                  </div>

                  {/* Right — Future */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Future</p>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Retirement Age</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 67"
                        type="number"
                        value={it ? it.selectedRetirementAge : newItem.selectedRetirementAge}
                        onChange={(e) => {
                          const v = e.target.value
                          if (it) setPensionItems(s => s.map(p => p.id === it.id ? { ...p, selectedRetirementAge: Number(v) } : p))
                          else setNewItem(n => ({ ...n, selectedRetirementAge: v }))
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Pot at Retirement (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-600 text-slate-300 text-right cursor-not-allowed"
                        readOnly
                        value={it ? formatAmount(Math.round(it.calculatedPotAtRetirement)) : ''}
                        placeholder="Calculated on save"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-slate-300">Desired Annual Income (£)</label>
                      <input
                        className="w-full p-2 rounded bg-slate-700 text-slate-100 text-right"
                        placeholder="e.g. 30,000"
                        value={formatAmount(it ? it.desiredAnnualIncome : newItem.desiredAnnualIncome)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/,/g, '')
                          if (it) setPensionItems(s => s.map(p => p.id === it.id ? { ...p, desiredAnnualIncome: Number(v) } : p))
                          else setNewItem(n => ({ ...n, desiredAnnualIncome: v }))
                        }}
                      />
                    </div>
                  </div>

                  {/* Third column — result + actions */}
                  <div className="flex flex-col justify-between pt-6">
                    {it && (
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Years Pot Will Last</p>
                        <p className="text-2xl font-bold text-slate-100 mb-1">
                          {it.calculatedYearsPotWillLast >= 999 ? '∞' : `${it.calculatedYearsPotWillLast} yrs`}
                        </p>
                        <p className="text-xs text-slate-500">
                          ({Math.round(it.selectedRetirementAge + it.calculatedYearsPotWillLast)} years old)
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 mt-auto pt-4">
                      {it ? (
                        <>
                          <button className="btn-primary w-full" onClick={() => handleUpdate(it.id, it)}>Update</button>
                          <button className="btn-delete w-full" onClick={() => handleDelete(it.id)}>Delete</button>
                        </>
                      ) : (
                        <button className="btn-primary w-full" onClick={handleAdd}>Add</button>
                      )}
                    </div>
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

export default Pension
