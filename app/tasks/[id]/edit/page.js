'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(1, 'Název je povinný').max(100, 'Název je příliš dlouhý'),
  description: z.string().optional(),
  due_date: z.string().optional(),
})

export default function EditTaskPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      if (data) {
        reset({
          title: data.title,
          description: data.description || '',
          due_date: data.due_date || '',
        })
      }
    }
    load()
  }, [id])

  async function onSubmit(data) {
    await supabase.from('tasks').update({
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
    }).eq('id', id)

    router.push(`/tasks/${id}`)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/tasks/${id}`} className="text-gray-400 hover:text-white transition-colors">
            ← Zpět
          </Link>
          <h1 className="text-2xl font-bold text-white">Upravit úkol</h1>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Název úkolu <span className="text-red-400">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Popis</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Datum splnění</label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href={`/tasks/${id}`}
                className="flex-1 text-center bg-[#0f0f0f] border border-[#2a2a2a] text-gray-300 font-medium py-2.5 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                Zrušit
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}