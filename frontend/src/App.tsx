import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'

const Home = () => {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl rounded-3xl card p-10 shadow-2xl ring-1 ring-white/10">
        <h1 className="text-4xl font-semibold text-slate-100 mb-4 text-center">Capital.</h1>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Let's get started!
        </button>
      </div>
    </main>
  )
}

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LoginForm />} />
  </Routes>
)

export default App
