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
})

export default function NewTaskPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tasks').insert({
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      user_id: user.id,
      status: 'pending',
    })
    router.push('/tasks')
  }

  return (
    <div className="gradient-bg" style={{minHeight:'100vh',padding:'32px 16px'}}>
      <div style={{position:'fixed',top:'-20%',left:'-10%',width:'500px',height:'500px',background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div style={{maxWidth:'560px',margin:'0 auto'}} className="fade-in">
        {/* Back */}
        <Link href="/tasks" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)',fontSize:'14px',marginBottom:'24px',transition:'color 0.2s'}}>
          ← Zpět na úkoly
        </Link>

        {/* Title */}
        <div style={{marginBottom:'24px'}}>
          <h1 style={{fontSize:'24px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            Nový úkol
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'4px'}}>Vyplňte informace o novém úkolu</p>
        </div>

        {/* Form Card */}
        <div className="glass" style={{borderRadius:'24px',padding:'32px'}}>
          <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <div>
              <label className="label">Název úkolu <span style={{color:'#f87171'}}>*</span></label>
              <input
                {...register('title')}
                type="text"
                placeholder="Např. Dokončit projekt..."
                className="input-field"
              />
              {errors.title && <p className="error-msg">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label">Popis <span style={{color:'rgba(255,255,255,0.2)',fontWeight:'400'}}>(volitelné)</span></label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Podrobnosti úkolu..."
                className="input-field"
                style={{resize:'none'}}
              />
            </div>

            <div>
              <label className="label">Datum splnění <span style={{color:'rgba(255,255,255,0.2)',fontWeight:'400'}}>(volitelné)</span></label>
              <input
                {...register('due_date')}
                type="date"
                className="input-field"
                style={{colorScheme:'dark'}}
              />
            </div>

            <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
              <Link href="/tasks" className="btn-secondary" style={{flex:1,textAlign:'center',padding:'13px',borderRadius:'12px',fontSize:'14px'}}>
                Zrušit
              </Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{flex:1,fontSize:'14px',padding:'13px',borderRadius:'12px'}}>
                {isSubmitting ? 'Ukládání...' : '+ Přidat úkol'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}