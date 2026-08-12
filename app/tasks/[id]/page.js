'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function TaskDetailPage() {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      setTask(data)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!confirm('Opravdu smazat tento úkol?')) return
    await supabase.from('tasks').delete().eq('id', id)
    router.push('/tasks')
  }

  async function handleToggle() {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    setTask({ ...task, status: newStatus })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-gray-400">Načítání...</p>
    </div>
  )

  if (!task) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <p className="text-gray-400">Úkol nenalezen</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/tasks" className="text-gray-400 hover:text-white transition-colors">
            ← Zpět
          </Link>
          <h1 className="text-xl font-bold text-white">Detail úkolu</h1>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              task.status === 'done'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {task.status === 'done' ? '✓ Splněno' : '⏳ Čeká'}
            </span>
          </div>

          <h2 className={`text-xl font-bold mb-3 ${
            task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
          }`}>
            {task.title}
          </h2>

          {task.description && (
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{task.description}</p>
          )}

          {task.due_date && (
            <p className="text-gray-500 text-sm mb-6">
              📅 Datum splnění: {new Date(task.due_date).toLocaleDateString('cs-CZ')}
            </p>
          )}

          <p className="text-gray-600 text-xs mb-6">
            Vytvořeno: {new Date(task.created_at).toLocaleString('cs-CZ')}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={handleToggle}
              className={`w-full font-medium py-2.5 rounded-lg transition-colors ${
                task.status === 'done'
                  ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400'
                  : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
              }`}>
              {task.status === 'done' ? '↩ Označit jako nesplněný' : '✓ Označit jako splněný'}
            </button>

            <Link href={`/tasks/${id}/edit`}
              className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
              Upravit úkol
            </Link>

            <button onClick={handleDelete}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2.5 rounded-lg transition-colors">
              Smazat úkol
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}