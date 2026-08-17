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
    if (error) setError(error.message)
    else { router.push('/tasks'); router.refresh() }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#f7f7f8'}}>
      {/* LEFT */}
      <div className="login-left" style={{flex:1,background:'#111827',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'48px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundImage:'radial-gradient(circle at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%)',pointerEvents:'none'}} />

        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',background:'white',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'800',color:'#111827'}}>T</div>
            <span style={{color:'white',fontWeight:'700',fontSize:'18px'}}>TaskFlow</span>
          </div>
        </div>

        <div style={{position:'relative',zIndex:1}}>
          <h1 style={{fontSize:'40px',fontWeight:'800',color:'white',lineHeight:'1.2',marginBottom:'16px'}}>
            Začněte ještě<br />
            <span style={{color:'#a78bfa'}}>dnes zdarma.</span>
          </h1>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'15px',lineHeight:'1.7',maxWidth:'300px'}}>
            Registrace zabere méně než minutu. Žádná kreditní karta není potřeba.
          </p>
        </div>

        <p style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',position:'relative',zIndex:1}}>© 2026 TaskFlow</p>
      </div>

      {/* RIGHT */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px'}}>
        <div className="fade-in" style={{width:'100%',maxWidth:'380px'}}>
          <div style={{marginBottom:'32px'}}>
            <h2 style={{fontSize:'26px',fontWeight:'800',color:'#111827',marginBottom:'6px'}}>Vytvořit účet</h2>
            <p style={{color:'#6b7280',fontSize:'14px'}}>Připojte se k TaskFlow ještě dnes.</p>
          </div>

          {error && (
            <div style={{background:'#fff1f2',border:'1px solid #fecdd3',color:'#e11d48',borderRadius:'10px',padding:'12px 14px',marginBottom:'20px',fontSize:'13px'}}>
              {error}
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

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{width:'100%',padding:'12px',fontSize:'15px',marginTop:'4px'}}>
              {isSubmitting ? 'Registrace...' : 'Vytvořit účet →'}
            </button>
          </form>

          <p style={{textAlign:'center',color:'#9ca3af',fontSize:'13px',marginTop:'24px'}}>
            Již máte účet?{' '}
            <Link href="/login" style={{color:'#111827',fontWeight:'600'}}>Přihlaste se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}