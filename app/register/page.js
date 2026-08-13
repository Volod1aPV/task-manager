'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setError(error.message)
    } else {
      router.push('/tasks')
      router.refresh()
    }
  }

  return (
    <div className="gradient-bg flex items-center justify-center px-4" style={{minHeight:'100vh'}}>
      <div style={{position:'fixed',top:'-20%',right:'-10%',width:'500px',height:'500px',background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',pointerEvents:'none'}} />
      <div style={{position:'fixed',bottom:'-20%',left:'-10%',width:'400px',height:'400px',background:'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div className="fade-in" style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'56px',height:'56px',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',borderRadius:'16px',marginBottom:'16px',boxShadow:'0 8px 32px rgba(124,58,237,0.4)'}}>
            <span style={{fontSize:'24px'}}>✦</span>
          </div>
          <h1 style={{fontSize:'28px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'6px'}}>
            TaskFlow
          </h1>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Vytvořte si nový účet</p>
        </div>

        <div className="glass" style={{borderRadius:'24px',padding:'32px'}}>
          {error && (
            <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',borderRadius:'12px',padding:'12px 16px',marginBottom:'20px',fontSize:'14px'}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="vas@email.cz" className="input-field" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Heslo</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-field" />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Potvrdit heslo</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input-field" />
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{width:'100%',marginTop:'8px',fontSize:'15px',padding:'13px'}}>
              {isSubmitting ? 'Registrace...' : 'Zaregistrovat se →'}
            </button>
          </form>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'24px'}}>
            Již máte účet?{' '}
            <Link href="/login" style={{color:'#a78bfa',fontWeight:'500'}}>
              Přihlaste se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}