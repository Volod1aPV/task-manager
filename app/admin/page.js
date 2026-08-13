'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'admin@taskflow.cz'

export default function AdminPage() {
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0 })
  const [users, setUsers] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/tasks')
        return
      }

      const { data: tasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
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
          doneTasks: tasks.filter(t => t.user_id === uid && t.status === 'done').length,
        })))
        setRecentTasks(tasks.slice(0, 5))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="gradient-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid rgba(124,58,237,0.3)',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const donePercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div className="gradient-bg" style={{minHeight:'100vh',padding:'32px 16px'}}>
      <div style={{position:'fixed',top:'-20%',right:'-10%',width:'600px',height:'600px',background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div style={{maxWidth:'720px',margin:'0 auto'}} className="fade-in">
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'32px'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px'}}>
              <span style={{fontSize:'20px'}}>👑</span>
              <h1 style={{fontSize:'24px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                Admin Panel
              </h1>
            </div>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px'}}>TaskFlow administrace</p>
          </div>
          <Link href="/tasks" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',fontSize:'13px',padding:'8px 16px',borderRadius:'10px'}}>
            ← Zpět na úkoly
          </Link>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
          {[
            {label:'Celkem úkolů',value:stats.total,color:'#a78bfa',icon:'📋'},
            {label:'Splněno',value:stats.done,color:'#34d399',icon:'✅'},
            {label:'Čeká',value:stats.pending,color:'#fbbf24',icon:'⏳'},
          ].map(s => (
            <div key={s.label} className="glass" style={{borderRadius:'20px',padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{s.icon}</div>
              <p style={{fontSize:'32px',fontWeight:'800',color:s.color}}>{s.value}</p>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginTop:'4px'}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="glass" style={{borderRadius:'20px',padding:'24px',marginBottom:'24px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'rgba(255,255,255,0.7)'}}>Celkový progres</p>
            <p style={{fontSize:'14px',fontWeight:'700',color:'#a78bfa'}}>{donePercent}%</p>
          </div>
          <div style={{width:'100%',height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'99px',overflow:'hidden'}}>
            <div style={{width:`${donePercent}%`,height:'100%',background:'linear-gradient(90deg,#7c3aed,#34d399)',borderRadius:'99px',transition:'width 1s ease'}} />
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          {/* Users */}
          <div className="glass" style={{borderRadius:'20px',padding:'24px'}}>
            <h2 style={{fontSize:'15px',fontWeight:'700',color:'rgba(255,255,255,0.8)',marginBottom:'16px'}}>
              👤 Uživatelé ({users.length})
            </h2>
            {users.length === 0 ? (
              <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Žádní uživatelé</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {users.map((u, i) => (
                  <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'10px'}}>
                    <div>
                      <p style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',fontFamily:'monospace'}}>{u.id.slice(0,12)}...</p>
                      <p style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',marginTop:'1px'}}>Uživatel #{i+1}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontSize:'13px',color:'#a78bfa',fontWeight:'600'}}>{u.taskCount} úkolů</p>
                      <p style={{fontSize:'11px',color:'#34d399',marginTop:'1px'}}>{u.doneTasks} splněno</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent tasks */}
          <div className="glass" style={{borderRadius:'20px',padding:'24px'}}>
            <h2 style={{fontSize:'15px',fontWeight:'700',color:'rgba(255,255,255,0.8)',marginBottom:'16px'}}>
              📋 Poslední úkoly
            </h2>
            {recentTasks.length === 0 ? (
              <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Žádné úkoly</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {recentTasks.map(t => (
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:'rgba(255,255,255,0.04)',borderRadius:'10px'}}>
                    <span style={{fontSize:'10px',flexShrink:0}}>{t.status==='done'?'✅':'⏳'}</span>
                    <p style={{fontSize:'12px',color:t.status==='done'?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.7)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textDecoration:t.status==='done'?'line-through':'none'}}>
                      {t.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}