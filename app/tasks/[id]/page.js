'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const priorities = {
  low:    { label: 'Nízká',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢' },
  medium: { label: 'Střední', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🟡' },
  high:   { label: 'Vysoká',  color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', icon: '🔴' },
}

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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:'32px',height:'32px',border:'2.5px solid var(--border)',borderTopColor:'var(--text-primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!task) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <p style={{color:'var(--text-faint)'}}>Úkol nenalezen</p>
    </div>
  )

  const priority = priorities[task.priority] || priorities.medium

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <nav style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',padding:'0 32px',height:'60px',display:'flex',alignItems:'center',gap:'16px',position:'sticky',top:0,zIndex:10}}>
        <Link href="/tasks" style={{color:'var(--text-muted)',fontSize:'13px'}}>← Zpět</Link>
        <div style={{width:'1px',height:'20px',background:'var(--border)'}} />
        <span style={{fontSize:'14px',fontWeight:'600',color:'var(--text-primary)'}}>Detail úkolu</span>
      </nav>

      <div style={{maxWidth:'560px',margin:'0 auto',padding:'40px 16px'}} className="fade-in">
        <div className="card" style={{padding:'32px'}}>

          {/* Badges row */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
            <span className={task.status==='done'?'badge-done':'badge-pending'}>
              {task.status==='done'?'✓ Splněno':'⏳ Čeká'}
            </span>
            <span style={{background:priority.bg,color:priority.color,border:`1px solid ${priority.border}`,padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'500'}}>
              {priority.icon} {priority.label} priorita
            </span>
          </div>

          {/* Title */}
          <h1 style={{fontSize:'22px',fontWeight:'800',color:task.status==='done'?'var(--text-faint)':'var(--text-primary)',textDecoration:task.status==='done'?'line-through':'none',marginBottom:'12px',lineHeight:'1.4'}}>
            {task.title}
          </h1>

          {/* Description */}
          {task.description && (
            <p style={{color:'var(--text-muted)',fontSize:'14px',lineHeight:'1.8',marginBottom:'20px'}}>
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div style={{borderTop:'1px solid var(--border-light)',borderBottom:'1px solid var(--border-light)',padding:'14px 0',margin:'16px 0',display:'flex',flexDirection:'column',gap:'8px'}}>
            {task.due_date && (
              <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'var(--text-muted)'}}>
                <span>📅</span>
                <span>Datum splnění: <strong style={{color:'var(--text-secondary)'}}>{new Date(task.due_date).toLocaleDateString('cs-CZ')}</strong></span>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'var(--text-faint)'}}>
              <span>🕐</span>
              <span>Vytvořeno: {new Date(task.created_at).toLocaleString('cs-CZ')}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'20px'}}>
            <button onClick={handleToggle} style={{width:'100%',padding:'11px',borderRadius:'10px',border:`1px solid ${task.status==='done'?'#fde68a':'#bbf7d0'}`,background:task.status==='done'?'#fffbeb':'#f0fdf4',color:task.status==='done'?'#d97706':'#16a34a',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600',fontSize:'14px',transition:'all 0.2s'}}>
              {task.status==='done'?'↩ Označit jako nesplněný':'✓ Označit jako splněný'}
            </button>
            <Link href={`/tasks/${id}/edit`} className="btn-primary" style={{display:'block',textAlign:'center',padding:'11px',borderRadius:'10px',fontSize:'14px'}}>
              ✏️ Upravit úkol
            </Link>
            <button onClick={handleDelete} className="btn-danger" style={{width:'100%',padding:'11px',borderRadius:'10px',fontSize:'14px'}}>
              🗑️ Smazat úkol
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}