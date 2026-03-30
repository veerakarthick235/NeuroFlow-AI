import { useState, useEffect } from 'react'
import { aiAPI } from '../api/client'
import {
  Sparkles, TrendingUp, Flame, Target, Award,
  Lightbulb, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, Tooltip
} from 'recharts'

const CATEGORY_META = {
  focus: { icon: Target, label: 'Focus', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  momentum: { icon: Flame, label: 'Momentum', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  pace: { icon: TrendingUp, label: 'Pace', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  pattern: { icon: Award, label: 'Pattern', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

const SEVERITY_META = {
  info: { icon: Lightbulb, color: 'text-blue-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  success: { icon: CheckCircle, color: 'text-emerald-400' },
}

function InsightCard({ insight }) {
  const cat = CATEGORY_META[insight.category] || CATEGORY_META.focus
  const sev = SEVERITY_META[insight.severity] || SEVERITY_META.info
  const CatIcon = cat.icon
  const SevIcon = sev.icon

  return (
    <div className={`glass-card p-5 border ${cat.border} animate-slide-up`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${cat.bg} rounded-xl flex items-center justify-center shrink-0`}>
          <CatIcon className={`w-5 h-5 ${cat.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
            <SevIcon className={`w-3.5 h-3.5 ${sev.color} ml-auto`} />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
        </div>
      </div>
    </div>
  )
}

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await aiAPI.getInsights()
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchInsights() }, [])

  const score = data?.productivity_score ?? 0
  const scoreData = [{ name: 'Score', value: score, fill: '#6366f1' }]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-slate-400 text-sm mt-0.5">Personalized productivity analysis</p>
        </div>
        <button
          className="btn-ghost"
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Analyzing your productivity patterns...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Score + chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radial score */}
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Productivity Score</h3>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="90%"
                    data={scoreData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1a1a27' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-8">
                <div className="text-4xl font-bold gradient-text">{score}</div>
                <div className="text-xs text-slate-400 mt-1">out of 100</div>
              </div>
              <div className="w-full">
                {score >= 75 && <p className="text-center text-xs text-emerald-400 font-medium">🏆 Excellent Execution</p>}
                {score >= 50 && score < 75 && <p className="text-center text-xs text-amber-400 font-medium">⚡ Good Progress</p>}
                {score < 50 && score > 0 && <p className="text-center text-xs text-rose-400 font-medium">🎯 Room to Grow</p>}
                {score === 0 && <p className="text-center text-xs text-slate-400 font-medium">📋 Start completing tasks</p>}
              </div>
            </div>

            {/* Score interpretation */}
            <div className="lg:col-span-2 glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">What this means</h3>
              <div className="space-y-3">
                {[
                  { range: '80-100', label: 'Peak Performer', desc: 'Top 10% of productivity. Maintain your systems.', color: 'text-emerald-400', threshold: 80 },
                  { range: '60-79', label: 'Strong Executor', desc: 'Consistent results. Minor optimizations can unlock peak.', color: 'text-primary-400', threshold: 60 },
                  { range: '40-59', label: 'Growing Momentum', desc: 'Making progress. Focus on completing high-priority items.', color: 'text-amber-400', threshold: 40 },
                  { range: '0-39', label: 'Building Habits', desc: 'Early stage. Start with 1 task per day to build consistency.', color: 'text-rose-400', threshold: 0 },
                ].map(({ range, label, desc, color, threshold }) => (
                  <div
                    key={range}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      score >= threshold ? 'bg-surface-700/60 border border-white/5' : 'opacity-40'
                    }`}
                  >
                    <div className={`text-xs font-mono font-bold ${color} mt-0.5 w-14 shrink-0`}>{range}</div>
                    <div>
                      <p className={`text-sm font-medium ${score >= threshold ? 'text-slate-200' : 'text-slate-500'}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    {score >= threshold && score < (threshold + 20 || 101) && (
                      <div className="ml-auto shrink-0">
                        <span className="text-xs text-primary-400 bg-primary-500/10 rounded-full px-2 py-0.5">You're here</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-white">
                AI Recommendations
              </h3>
              <span className="text-xs text-slate-500 bg-surface-700 px-2 py-0.5 rounded-full ml-auto">
                {data?.insights?.length ?? 0} insights
              </span>
            </div>
            {data?.insights?.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Complete some tasks to get personalized AI insights</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data?.insights?.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
