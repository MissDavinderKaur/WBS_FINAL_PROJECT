import React from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8">
      <h1 className="text-4xl font-semibold text-slate-100 mb-8 text-center">Capital.</h1>

      <div className="w-full max-w-5xl mx-auto">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary py-6" onClick={() => navigate('/dashboard/income')}>Income</button>
          <button className="btn-primary py-6">Expenses</button>
          <button className="btn-primary py-6">Mortgage</button>
          <button className="btn-primary py-6">Pension</button>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
