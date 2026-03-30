import { useState, useEffect, useCallback } from 'react'
import { tasksAPI, aiAPI } from '../api/client'
import {
  Plus, Trash2, Edit2, Check, X, Sparkles,
  ChevronDown, Target, Clock, AlertCircle, Loader2
} from 'lucide-react'

const PRIORITY_OPTIONS = ['high', 'medium', 'low']
const STATUS_OPTIONS = ['pending', 'in_progress', 'completed']

function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...task })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(task.id, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const toggleComplete = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await onUpdate(task.id, { status: newStatus })
  }

  return (
    <div className={`glass-card p-4 transition-all duration-200 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
      {editing ? (
        <div className="space-y-3">
          <input
            className="input-field"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Task title"
          />
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <select
              className="input-field flex-1"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="input-field flex-1"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-ghost py-1.5 px-3" onClick={() => setEditing(false)}>
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button className="btn-primary py-1.5 px-3" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={toggleComplete}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              task.status === 'completed'
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-slate-600 hover:border-primary-500'
            }`}
          >
            {task.status === 'completed' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge-${task.priority}`}>{task.priority}</span>
              <span className={`badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
              {task.estimated_time && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />{task.estimated_time}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-600 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [goal, setGoal] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', estimated_time: '' })
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [error, setError] = useState('')
  const [genError, setGenError] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      const res = await tasksAPI.list(filter)
      setTasks(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { setLoading(true); fetchTasks() }, [fetchTasks])

  const handleUpdate = async (id, data) => {
    await tasksAPI.update(id, data)
    fetchTasks()
  }

  const handleDelete = async (id) => {
    await tasksAPI.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    try {
      await tasksAPI.create(newTask)
      setNewTask({ title: '', description: '', priority: 'medium', estimated_time: '' })
      setShowAddForm(false)
      fetchTasks()
    } catch (e) {
      setError('Failed to create task')
    }
  }

  const handleGenerate = async () => {
    if (!goal.trim()) return
    setGenerating(true)
    setGenError('')
    try {
      const res = await aiAPI.generateTasks(goal)
      const generated = res.data.tasks

      await Promise.all(generated.map(t =>
        tasksAPI.create({
          title: t.title,
          description: t.description,
          priority: t.priority,
          estimated_time: t.estimated_time,
        })
      ))
      setGoal('')
      fetchTasks()
    } catch (e) {
      setGenError(e.response?.data?.detail || 'AI generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {completed}/{total} completed
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* AI Goal Decomposer */}
      <div className="glass-card p-5 glow-primary">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">AI Goal Decomposer</h3>
          <span className="ml-auto text-xs text-slate-500 bg-surface-700 rounded-full px-2 py-0.5">Powered by AI</span>
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder='e.g. "Learn Machine Learning in 30 days" or "Build a portfolio website"'
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="btn-primary shrink-0"
            onClick={handleGenerate}
            disabled={generating || !goal.trim()}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {genError && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-400">{genError}</p>
          </div>
        )}
        {generating && (
          <p className="text-xs text-slate-500 mt-2">
            🤖 AI is breaking down your goal into actionable tasks...
          </p>
        )}
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="glass-card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Add Task</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="input-field"
              placeholder="Task title *"
              value={newTask.title}
              required
              onChange={e => setNewTask(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={e => setNewTask(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <select className="input-field" value={newTask.priority} onChange={e => setNewTask(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                className="input-field"
                placeholder="Est. time (e.g. 2 hours)"
                value={newTask.estimated_time}
                onChange={e => setNewTask(f => ({ ...f, estimated_time: e.target.value }))}
              />
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="input-field w-auto py-2 text-xs"
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select
          className="input-field w-auto py-2 text-xs"
          value={filter.priority}
          onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filter.status || filter.priority) && (
          <button
            className="btn-ghost py-2 text-xs"
            onClick={() => setFilter({ status: '', priority: '' })}
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">Enter a goal above to generate tasks with AI, or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
