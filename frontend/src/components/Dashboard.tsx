import React from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from './LogoutButton'

const Dashboard = () => {
  const navigate = useNavigate()
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-5xl flex justify-end mb-4">
        <LogoutButton />
      </div>
      <h1 className="text-4xl font-semibold text-slate-100 mb-8 text-center">Capital.</h1>

      <div className="w-full max-w-5xl mx-auto">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary py-6" onClick={() => navigate('/dashboard/income')}>Income</button>
          <button className="btn-primary py-6" onClick={() => navigate('/dashboard/expenses')}>Expenses</button>
          <button className="btn-primary py-6" onClick={() => navigate('/dashboard/mortgage')}>Mortgage</button>
          <button className="btn-primary py-6" onClick={() => navigate('/dashboard/pension')}>Pension</button>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
