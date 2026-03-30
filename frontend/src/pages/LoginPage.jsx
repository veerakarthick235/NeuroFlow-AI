import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900/50 to-surface-800 border-r border-white/5
                      flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-primary-900/50">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Execute with<br />
              <span className="gradient-text">AI precision.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              NeuroFlow AI turns your goals into structured action plans and tracks your progress intelligently.
            </p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[['AI Tasks', '10x'], ['Insights', 'Real-time'], ['Plans', 'Smart']].map(([label, val]) => (
              <div key={label} className="bg-surface-700/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary-400">{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <div>
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">NeuroFlow AI</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to continue your execution journey</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  required
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="Your password"
                  value={form.password}
                  required
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            New to NeuroFlow?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
