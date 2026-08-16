'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(1, 'Název je povinný').max(100, 'Název je příliš dlouhý'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

const priorities = [
  { value: 'low',    label: 'Nízká',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢' },
  { value: 'medium', label: 'Střední', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🟡' },
  { value: 'high',   label: 'Vysoká',  color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', icon: '🔴' },
]

export default function NewTaskPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  const selectedPriority = watch('priority')

  async function onSubmit(data) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tasks').insert({
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      priority: data.priority,
      user_id: user.id,
      status: 'pending',
    })
    router.push('/tasks')
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <nav style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',padding:'0 32px',height:'60px',display:'flex',alignItems:'center',gap:'16px',position:'sticky',top:0,zIndex:10}}>
        <Link href="/tasks" style={{color:'var(--text-muted)',fontSize:'13px'}}>← Zpět</Link>
        <div style={{width:'1px',height:'20px',background:'var(--border)'}} />
        <span style={{fontSize:'14px',fontWeight:'600',color:'var(--text-primary)'}}>Nový úkol</span>
      </nav>

      <div style={{maxWidth:'560px',margin:'0 auto',padding:'40px 16px'}} className="fade-in">
        <div style={{marginBottom:'28px'}}>
          <h1 style={{fontSize:'22px',fontWeight:'800',color:'var(--text-primary)',marginBottom:'4px'}}>Vytvořit úkol</h1>
          <p style={{color:'var(--text-faint)',fontSize:'14px'}}>Vyplňte informace o novém úkolu</p>
        </div>

        <div className="card" style={{padding:'28px'}}>
          <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <div>
              <label className="label">Název <span style={{color:'#e11d48'}}>*</span></label>
              <input {...register('title')} type="text" placeholder="Např. Dokončit projekt..." className="input-field" />
              {errors.title && <p className="error-msg">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label">Popis <span style={{color:'var(--border)',fontWeight:'400',fontSize:'12px'}}>volitelné</span></label>
              <textarea {...register('description')} rows={3} placeholder="Podrobnosti..." className="input-field" style={{resize:'none'}} />
            </div>

            <div>
              <label className="label">Datum splnění <span style={{color:'var(--border)',fontWeight:'400',fontSize:'12px'}}>volitelné</span></label>
              <input {...register('due_date')} type="date" className="input-field" style={{colorScheme:'light'}} />
            </div>

            {/* Priority */}
            <div>
              <label className="label">Priorita</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                {priorities.map(p => (
                  <button key={p.value} type="button" onClick={() => setValue('priority', p.value)}
                    style={{padding:'10px 8px',borderRadius:'10px',border:`2px solid ${selectedPriority===p.value ? p.border : 'var(--border)'}`,background:selectedPriority===p.value ? p.bg : 'var(--bg)',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                    <span style={{fontSize:'18px'}}>{p.icon}</span>
                    <span style={{fontSize:'12px',fontWeight:'600',color:selectedPriority===p.value ? p.color : 'var(--text-muted)'}}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:'flex',gap:'10px',paddingTop:'4px'}}>
              <Link href="/tasks" className="btn-secondary" style={{flex:1,padding:'11px',fontSize:'14px',borderRadius:'10px'}}>Zrušit</Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{flex:1,padding:'11px',fontSize:'14px',borderRadius:'10px'}}>
                {isSubmitting ? 'Ukládání...' : '+ Přidat úkol'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}