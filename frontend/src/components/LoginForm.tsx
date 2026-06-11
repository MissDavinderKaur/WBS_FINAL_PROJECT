import React, { useState } from 'react'


const LoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const disabled = !email || !password
    const loading = false

    const handleSubmit = ((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log('login', { email, password })
    })

    return (
        <main className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
          <h1 className="text-4xl font-semibold text-slate-100 mb-8 text-center">Capital.</h1>
          <div className="w-full md:w-1/2 lg:w-1/3 mx-auto">
            <div className="card rounded-3xl p-10 shadow-2xl ring-1 ring-white/10">
              <h2 className="text-2xl font-semibold text-slate-100 mb-6 text-center">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-1">Email</label>
                  <input
                    className="w-full p-2 rounded bg-slate-700 text-slate-100"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-1">Password</label>
                  <input
                    className="w-full p-2 rounded bg-slate-700 text-slate-100"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className={`${disabled ? 'btn-disabled' : 'btn-primary'} w-full text-center`}
                    disabled={disabled}
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
    )
}

export default LoginForm
