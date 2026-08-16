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
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/tasks'); return }

      const { data: tasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (tasks) {
        setStats({ total: tasks.length, done: tasks.filter(t => t.status==='done').length, pending: tasks.filter(t => t.status==='pending').length })
        const uniqueUsers = [...new Set(tasks.map(t => t.user_id))]
        setUsers(uniqueUsers.map(uid => ({
          id: uid,
          taskCount: tasks.filter(t => t.user_id===uid).length,
          doneTasks: tasks.filter(t => t.user_id===uid && t.status==='done').length,
        })))
        setRecentTasks(tasks.slice(0, 6))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f7f7f8'}}>
      <div style={{width:'32px',height:'32px',border:'2.5px solid #e5e7eb',borderTopColor:'#111827',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const donePercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div style={{minHeight:'100vh',background:'#f7f7f8'}}>
      {/* Navbar */}
      <nav style={{background:'white',borderBottom:'1px solid #e5e7eb',padding:'0 32px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'30px',height:'30px',background:'#111827',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'800',fontSize:'14px'}}>T</div>
            <span style={{fontWeight:'700',fontSize:'16px',color:'#111827'}}>TaskFlow</span>
          </div>
          <div style={{width:'1px',height:'20px',background:'#e5e7eb'}} />
          <span style={{fontSize:'13px',color:'#7c3aed',fontWeight:'600',background:'#f5f3ff',padding:'3px 10px',borderRadius:'6px'}}>👑 Admin</span>
        </div>
        <Link href="/tasks" style={{fontSize:'13px',color:'#6b7280'}}>← Zpět na úkoly</Link>
      </nav>

      <div style={{maxWidth:'760px',margin:'0 auto',padding:'32px 16px'}} className="fade-in">
        <div style={{marginBottom:'24px'}}>
          <h1 style={{fontSize:'22px',fontWeight:'800',color:'#111827',marginBottom:'4px'}}>Admin panel</h1>
          <p style={{color:'#9ca3af',fontSize:'14px'}}>Přehled všech úkolů a uživatelů</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
          {[
            {label:'Celkem úkolů', value:stats.total, color:'#111827', bg:'#f9fafb'},
            {label:'Splněno', value:stats.done, color:'#16a34a', bg:'#f0fdf4'},
            {label:'Čeká', value:stats.pending, color:'#d97706', bg:'#fffbeb'},
          ].map(s => (
            <div key={s.label} className="card" style={{padding:'20px',background:s.bg}}>
              <p style={{fontSize:'30px',fontWeight:'800',color:s.color}}>{s.value}</p>
              <p style={{fontSize:'13px',color:'#6b7280',marginTop:'2px'}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card" style={{padding:'20px',marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'#374151'}}>Celkový progres</p>
            <p style={{fontSize:'14px',fontWeight:'700',color:'#111827'}}>{donePercent}%</p>
          </div>
          <div style={{height:'6px',background:'#f3f4f6',borderRadius:'99px',overflow:'hidden'}}>
            <div style={{width:`${donePercent}%`,height:'100%',background:'#111827',borderRadius:'99px',transition:'width 0.8s ease'}} />
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          {/* Users */}
          <div className="card" style={{padding:'20px'}}>
            <h2 style={{fontSize:'14px',fontWeight:'700',color:'#111827',marginBottom:'16px'}}>
              Uživatelé <span style={{color:'#9ca3af',fontWeight:'400'}}>({users.length})</span>
            </h2>
            {users.length === 0 ? (
              <p style={{color:'#9ca3af',fontSize:'13px'}}>Žádní uživatelé</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {users.map((u, i) => (
                  <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#f9fafb',borderRadius:'10px',border:'1px solid #f3f4f6'}}>
                    <div>
                      <p style={{fontSize:'12px',color:'#374151',fontFamily:'monospace'}}>{u.id.slice(0,14)}...</p>
                      <p style={{fontSize:'11px',color:'#9ca3af',marginTop:'1px'}}>Uživatel #{i+1}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontSize:'13px',color:'#111827',fontWeight:'600'}}>{u.taskCount} úkolů</p>
                      <p style={{fontSize:'11px',color:'#16a34a'}}>{u.doneTasks} splněno</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent tasks */}
          <div className="card" style={{padding:'20px'}}>
            <h2 style={{fontSize:'14px',fontWeight:'700',color:'#111827',marginBottom:'16px'}}>Poslední úkoly</h2>
            {recentTasks.length === 0 ? (
              <p style={{color:'#9ca3af',fontSize:'13px'}}>Žádné úkoly</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {recentTasks.map(t => (
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:'#f9fafb',borderRadius:'8px',border:'1px solid #f3f4f6'}}>
                    <span style={{fontSize:'11px',flexShrink:0}}>{t.status==='done'?'✅':'⏳'}</span>
                    <p style={{fontSize:'12px',color:t.status==='done'?'#9ca3af':'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textDecoration:t.status==='done'?'line-through':'none'}}>
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