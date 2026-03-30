import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { tasksAPI, aiAPI } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import {
  CheckCircle2, Clock, TrendingUp, Target,
  ArrowRight, Sparkles, Trophy, Flame
} from 'lucide-react'

function ProgressRing({ percentage = 0, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold text-white">{percentage}%</div>
        <div className="text-[10px] text-slate-400">Complete</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, summaryRes] = await Promise.all([
        tasksAPI.list(),
        aiAPI.getDailySummary(),
      ])
      setTasks(tasksRes.data)
      setSummary(summaryRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5)

  const stats = [
    { label: 'Total Tasks', value: total, icon: Target, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: inProgress, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'High Priority', value: highPriority, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/tasks" className="btn-primary">
          <Sparkles className="w-4 h-4" />
          Generate Tasks
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress ring */}
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
          <ProgressRing percentage={percentage} size={140} strokeWidth={12} />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Overall Progress</p>
            <p className="text-xs text-slate-500 mt-0.5">{completed} of {total} tasks done</p>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Pending</span><span className="text-slate-300 font-medium">{pending}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>In Progress</span><span className="text-slate-300 font-medium">{inProgress}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Completed</span><span className="text-emerald-400 font-medium">{completed}</span>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">AI Daily Summary</h3>
            <div className="ml-auto flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full px-2.5 py-1">
              <Trophy className="w-3 h-3 text-primary-400" />
              <span className="text-xs text-primary-400 font-medium">
                Score: {summary?.productivity_score ?? percentage}
              </span>
            </div>
          </div>

          {summary ? (
            <>
              <p className="text-slate-300 text-sm leading-relaxed">{summary.ai_summary}</p>
              {summary.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Suggestions</p>
                  {summary.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-surface-700/50 rounded-xl p-3">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1.5 shrink-0" />
                      <p className="text-sm text-slate-300">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500 text-sm">Add tasks to see your AI summary</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Tasks</h3>
          <Link to="/tasks" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="text-center py-10">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No tasks yet</p>
            <Link to="/tasks" className="text-primary-400 text-sm hover:underline">Create your first task →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-700/50 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.status === 'completed' ? 'bg-emerald-400' :
                  task.status === 'in_progress' ? 'bg-blue-400' : 'bg-slate-500'
                }`} />
                <span className={`flex-1 text-sm truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </span>
                <span className={`badge-${task.priority}`}>{task.priority}</span>
                <span className={`badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
