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
      const { data } = await supabase.from('tasks').select('*').eq('id', id).single()
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
    <div className="gradient-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid rgba(124,58,237,0.3)',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!task) return (
    <div className="gradient-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'rgba(255,255,255,0.4)'}}>Úkol nenalezen</p>
    </div>
  )

  return (
    <div className="gradient-bg" style={{minHeight:'100vh',padding:'32px 16px'}}>
      <div style={{position:'fixed',top:'-20%',right:'-10%',width:'500px',height:'500px',background:'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div style={{maxWidth:'560px',margin:'0 auto'}} className="fade-in">
        <Link href="/tasks" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)',fontSize:'14px',marginBottom:'24px'}}>
          ← Zpět na úkoly
        </Link>

        <div className="glass" style={{borderRadius:'24px',padding:'32px'}}>
          {/* Status */}
          <div style={{marginBottom:'20px'}}>
            <span className={task.status === 'done' ? 'badge-done' : 'badge-pending'}>
              {task.status === 'done' ? '✓ Splněno' : '⏳ Čeká na splnění'}
            </span>
          </div>

          {/* Title */}
          <h1 style={{fontSize:'22px',fontWeight:'800',color:task.status==='done'?'rgba(255,255,255,0.3)':'white',textDecoration:task.status==='done'?'line-through':'none',marginBottom:'12px',lineHeight:'1.3'}}>
            {task.title}
          </h1>

          {/* Description */}
          {task.description && (
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'15px',lineHeight:'1.7',marginBottom:'20px'}}>
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            {task.due_date && (
              <div style={{display:'flex',alignItems:'center',gap:'8px',color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>
                <span>📅</span>
                <span>Datum splnění: {new Date(task.due_date).toLocaleDateString('cs-CZ')}</span>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:'8px',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>
              <span>🕐</span>
              <span>Vytvořeno: {new Date(task.created_at).toLocaleString('cs-CZ')}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <button onClick={handleToggle} style={{width:'100%',padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600',fontSize:'14px',transition:'all 0.2s',background:task.status==='done'?'rgba(251,191,36,0.1)':'rgba(52,211,153,0.1)',color:task.status==='done'?'#fbbf24':'#34d399',border:task.status==='done'?'1px solid rgba(251,191,36,0.2)':'1px solid rgba(52,211,153,0.2)'}}>
              {task.status === 'done' ? '↩ Označit jako nesplněný' : '✓ Označit jako splněný'}
            </button>

            <Link href={`/tasks/${id}/edit`} className="btn-primary" style={{display:'block',textAlign:'center',padding:'12px',borderRadius:'12px',fontSize:'14px'}}>
              ✏️ Upravit úkol
            </Link>

            <button onClick={handleDelete} style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.08)',color:'#f87171',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600',fontSize:'14px',transition:'all 0.2s'}}>
              🗑️ Smazat úkol
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}