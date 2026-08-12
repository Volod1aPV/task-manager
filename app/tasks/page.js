'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      setTasks(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(id) {
    if (!confirm('Opravdu smazat tento úkol?')) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  async function handleToggle(task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-gray-400">Načítání...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/tasks/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Nový úkol
            </Link>
            {user?.email === 'admin@taskflow.cz' && (
  <Link href="/admin"
    className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-purple-400 text-sm px-4 py-2 rounded-lg border border-purple-500/30 transition-colors">
    👑 Admin
  </Link>
)}
            <button onClick={handleLogout}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 text-sm px-4 py-2 rounded-lg border border-[#2a2a2a] transition-colors">
              Odhlásit
            </button>
          </div>
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Zatím žádné úkoly</p>
            <Link href="/tasks/new" className="text-blue-400 hover:text-blue-300 text-sm">
              Přidat první úkol →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                {/* Checkbox */}
                <button onClick={() => handleToggle(task)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                    task.status === 'done'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-600 hover:border-green-500'
                  }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link href={`/tasks/${task.id}`}>
                    <p className={`font-medium truncate ${
                      task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
                    }`}>
                      {task.title}
                    </p>
                  </Link>
                  {task.due_date && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      📅 {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/tasks/${task.id}/edit`}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    Upravit
                  </Link>
                  <button onClick={() => handleDelete(task.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                    Smazat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}