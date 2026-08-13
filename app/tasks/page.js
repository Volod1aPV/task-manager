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

  const done = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status === 'pending').length

  if (loading) return (
    <div className="gradient-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'40px',height:'40px',border:'3px solid rgba(124,58,237,0.3)',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}} />
        <p style={{color:'rgba(255,255,255,0.4)'}}>Načítání...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div className="gradient-bg" style={{minHeight:'100vh',padding:'32px 16px'}}>
      <div style={{position:'fixed',top:'-20%',left:'-10%',width:'600px',height:'600px',background:'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',pointerEvents:'none'}} />
      <div style={{position:'fixed',bottom:'-20%',right:'-10%',width:'400px',height:'400px',background:'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div style={{maxWidth:'680px',margin:'0 auto'}} className="fade-in">
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'26px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              TaskFlow
            </h1>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'2px'}}>{user?.email}</p>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {user?.email === 'admin@taskflow.cz' && (
              <Link href="/admin" style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa',fontSize:'13px',padding:'8px 14px',borderRadius:'10px',fontWeight:'500',transition:'all 0.2s'}}>
                👑 Admin
              </Link>
            )}
            <Link href="/tasks/new" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',fontSize:'13px',fontWeight:'600',padding:'8px 16px',borderRadius:'10px',boxShadow:'0 4px 16px rgba(124,58,237,0.3)'}}>
              + Nový úkol
            </Link>
            <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',fontSize:'13px',padding:'8px 14px',borderRadius:'10px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              Odhlásit
            </button>
          </div>
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
            {[
              {label:'Celkem',value:tasks.length,color:'#a78bfa'},
              {label:'Splněno',value:done,color:'#34d399'},
              {label:'Čeká',value:pending,color:'#fbbf24'},
            ].map(s => (
              <div key={s.label} className="glass" style={{borderRadius:'16px',padding:'16px',textAlign:'center'}}>
                <p style={{fontSize:'28px',fontWeight:'800',color:s.color}}>{s.value}</p>
                <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="glass" style={{borderRadius:'24px',padding:'60px 32px',textAlign:'center'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>📝</div>
            <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'20px'}}>Zatím žádné úkoly</p>
            <Link href="/tasks/new" className="btn-primary" style={{display:'inline-block',padding:'10px 24px',borderRadius:'12px'}}>
              Přidat první úkol
            </Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {tasks.map((task, i) => (
              <div key={task.id} className="glass glass-hover" style={{borderRadius:'16px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'14px',animationDelay:`${i*0.05}s`}}>
                {/* Toggle */}
                <button onClick={() => handleToggle(task)} style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${task.status==='done'?'#34d399':'rgba(255,255,255,0.2)'}`,background:task.status==='done'?'#34d399':'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
                  {task.status === 'done' && <span style={{color:'#060612',fontSize:'12px',fontWeight:'800'}}>✓</span>}
                </button>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <Link href={`/tasks/${task.id}`}>
                    <p style={{fontWeight:'600',fontSize:'15px',color:task.status==='done'?'rgba(255,255,255,0.3)':'white',textDecoration:task.status==='done'?'line-through':'none',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'all 0.2s'}}>
                      {task.title}
                    </p>
                  </Link>
                  {task.due_date && (
                    <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',marginTop:'3px'}}>
                      📅 {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span className={task.status === 'done' ? 'badge-done' : 'badge-pending'}>
                  {task.status === 'done' ? 'Splněno' : 'Čeká'}
                </span>

                {/* Actions */}
                <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                  <Link href={`/tasks/${task.id}/edit`} style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',padding:'5px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',transition:'all 0.2s'}}>
                    Upravit
                  </Link>
                  <button onClick={() => handleDelete(task.id)} style={{fontSize:'12px',color:'#f87171',padding:'5px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}>
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