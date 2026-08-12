'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'admin@taskflow.cz'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/tasks')
        return
      }
      setCurrentUser(user)

      const { data: tasks } = await supabase.from('tasks').select('*')
      if (tasks) {
        setStats({
          total: tasks.length,
          done: tasks.filter(t => t.status === 'done').length,
          pending: tasks.filter(t => t.status === 'pending').length,
        })

        const uniqueUsers = [...new Set(tasks.map(t => t.user_id))]
        setUsers(uniqueUsers.map(uid => ({
          id: uid,
          taskCount: tasks.filter(t => t.user_id === uid).length,
        })))
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-gray-400">Načítání...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm">TaskFlow administrace</p>
          </div>
          <Link href="/tasks" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Zpět na úkoly
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Celkem úkolů', value: stats.total, color: 'text-blue-400' },
            { label: 'Splněno', value: stats.done, color: 'text-green-400' },
            { label: 'Čeká', value: stats.pending, color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Uživatelé ({users.length})
          </h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">Zatím žádní uživatelé</p>
          ) : (
            <div className="space-y-3">
              {users.map((user, i) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div>
                    <p className="text-gray-300 text-sm font-mono">
                      {user.id.slice(0, 8)}...
                    </p>
                    <p className="text-gray-500 text-xs">Uživatel #{i + 1}</p>
                  </div>
                  <span className="text-blue-400 text-sm">{user.taskCount} úkolů</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}