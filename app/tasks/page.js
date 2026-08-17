'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PRIORITIES = {
  low:    { icon: '🟢', label: 'Nízká',   color: '#16a34a' },
  medium: { icon: '🟡', label: 'Střední', color: '#d97706' },
  high:   { icon: '🔴', label: 'Vysoká',  color: '#e11d48' },
}

function CalendarView({ tasks }) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay + 6) % 7
  const monthNames = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
  const dayNames = ['Po','Út','St','Čt','Pá','So','Ne']
  const today = new Date()

  function getTasksForDay(day) {
    return tasks.filter(t => {
      if (!t.due_date) return false
      const d = new Date(t.due_date)
      return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day
    })
  }

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  return (
    <div className="card" style={{padding:'24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <button onClick={() => setCurrent(new Date(year, month-1, 1))} style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',fontSize:'16px',color:'var(--text-muted)'}}>‹</button>
        <h3 style={{fontWeight:'700',fontSize:'16px',color:'var(--text-primary)'}}>{monthNames[month]} {year}</h3>
        <button onClick={() => setCurrent(new Date(year, month+1, 1))} style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',fontSize:'16px',color:'var(--text-muted)'}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'4px'}}>
        {dayNames.map(d => <div key={d} style={{textAlign:'center',fontSize:'12px',fontWeight:'600',color:'var(--text-faint)',padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dayTasks = getTasksForDay(day)
          const isToday = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day
          return (
            <div key={i} style={{minHeight:'64px',borderRadius:'10px',padding:'6px',border:`1px solid ${isToday?'var(--btn-bg)':'var(--border-light)'}`,background:isToday?'var(--btn-bg)':'var(--bg)'}}>
              <p style={{fontSize:'12px',fontWeight:isToday?'800':'500',color:isToday?'var(--btn-text)':'var(--text-muted)',marginBottom:'4px',textAlign:'right'}}>{day}</p>
              <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                {dayTasks.slice(0,2).map(t => (
                  <Link key={t.id} href={`/tasks/${t.id}`}>
                    <div style={{fontSize:'10px',fontWeight:'500',padding:'2px 5px',borderRadius:'4px',background:t.status==='done'?'#dcfce7':'#dbeafe',color:t.status==='done'?'#16a34a':'#1d4ed8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {t.title}
                    </div>
                  </Link>
                ))}
                {dayTasks.length > 2 && <p style={{fontSize:'10px',color:'var(--text-faint)'}}>+{dayTasks.length-2}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [view, setView] = useState('list')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [theme, setTheme] = useState('light')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      setTasks(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
  const saved = localStorage.getItem('theme') || 'light'
  setTheme(saved)
}, [])

function toggleTheme() {
  const next = theme === 'light' ? 'dark' : 'light'
  setTheme(next)
  localStorage.setItem('theme', next)
  document.documentElement.setAttribute('data-theme', next)
}

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false
      return true
    })
  }, [tasks, search, filterStatus, filterPriority])

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
  const donePercent = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{width:'32px',height:'32px',border:'2.5px solid var(--border)',borderTopColor:'var(--text-primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      {/* Navbar */}
      <nav style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',padding:'0 32px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'30px',height:'30px',background:'var(--btn-bg)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--btn-text)',fontWeight:'800',fontSize:'14px'}}>T</div>
          <span style={{fontWeight:'700',fontSize:'16px',color:'var(--text-primary)'}}>TaskFlow</span>
        </div>
        <div className="nav-actions" style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span className="nav-email" style={{color:'var(--text-faint)',fontSize:'13px'}}>{user?.email}</span>
          {user?.email === 'admin@taskflow.cz' && (
            <Link href="/admin" style={{fontSize:'13px',fontWeight:'500',color:'#7c3aed',background:'#f5f3ff',border:'1px solid #ede9fe',padding:'5px 12px',borderRadius:'8px'}}>👑 Admin</Link>
          )}
          <Link href="/tasks/new" className="btn-primary" style={{padding:'7px 14px',fontSize:'13px',borderRadius:'8px'}}>+ Nový úkol</Link>
          <button onClick={toggleTheme} style={{width:'36px',height:'36px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
          <button onClick={handleLogout} className="btn-secondary" style={{padding:'7px 14px',fontSize:'13px',borderRadius:'8px'}}>Odhlásit</button>
        </div>
      </nav>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'32px 16px'}} className="fade-in">

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="card" style={{padding:'20px',marginBottom:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <div>
                <p style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'2px'}}>Celkový progres</p>
                <p style={{fontSize:'20px',fontWeight:'800',color:'var(--text-primary)'}}>{donePercent}% <span style={{fontSize:'13px',fontWeight:'400',color:'var(--text-faint)'}}>splněno</span></p>
              </div>
              <div style={{display:'flex',gap:'20px',textAlign:'center'}}>
                <div><p style={{fontSize:'20px',fontWeight:'800',color:'#16a34a'}}>{done}</p><p style={{fontSize:'11px',color:'var(--text-faint)'}}>Splněno</p></div>
                <div style={{width:'1px',background:'var(--border)'}} />
                <div><p style={{fontSize:'20px',fontWeight:'800',color:'#d97706'}}>{pending}</p><p style={{fontSize:'11px',color:'var(--text-faint)'}}>Čeká</p></div>
              </div>
            </div>
            <div style={{height:'5px',background:'var(--border)',borderRadius:'99px',overflow:'hidden'}}>
              <div style={{width:`${donePercent}%`,height:'100%',background:'var(--btn-bg)',borderRadius:'99px',transition:'width 0.6s ease'}} />
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="card" style={{padding:'16px',marginBottom:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Hledat úkoly..."
            className="input-field"
            style={{fontSize:'14px'}}
          />
          {/* Filters */}
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <span style={{fontSize:'12px',color:'var(--text-faint)',alignSelf:'center',marginRight:'4px'}}>Stav:</span>
            {[{v:'all',l:'Vše'},{v:'pending',l:'Čeká'},{v:'done',l:'Splněno'}].map(f => (
              <button key={f.v} onClick={() => setFilterStatus(f.v)} style={{fontSize:'12px',padding:'4px 12px',borderRadius:'20px',border:'1px solid var(--border)',background:filterStatus===f.v?'var(--btn-bg)':'var(--bg)',color:filterStatus===f.v?'var(--btn-text)':'var(--text-muted)',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}>
                {f.l}
              </button>
            ))}
            <div style={{width:'1px',background:'var(--border)',margin:'0 4px'}} />
            <span style={{fontSize:'12px',color:'var(--text-faint)',alignSelf:'center',marginRight:'4px'}}>Priorita:</span>
            {[{v:'all',l:'Vše'},{v:'high',l:'🔴'},{v:'medium',l:'🟡'},{v:'low',l:'🟢'}].map(f => (
              <button key={f.v} onClick={() => setFilterPriority(f.v)} style={{fontSize:'12px',padding:'4px 12px',borderRadius:'20px',border:'1px solid var(--border)',background:filterPriority===f.v?'var(--btn-bg)':'var(--bg)',color:filterPriority===f.v?'var(--btn-text)':'var(--text-muted)',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <h2 style={{fontSize:'15px',fontWeight:'600',color:'var(--text-secondary)'}}>
            {search || filterStatus!=='all' || filterPriority!=='all' ? `Nalezeno: ${filtered.length}` : `Moje úkoly`}
            <span style={{color:'var(--text-faint)',fontWeight:'400'}}> ({filtered.length})</span>
          </h2>
          <div style={{display:'flex',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'10px',padding:'3px',gap:'2px'}}>
            {[{id:'list',label:'☰ Seznam'},{id:'calendar',label:'📅 Kalendář'}].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{padding:'6px 14px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:'500',fontFamily:'Inter,sans-serif',background:view===v.id?'var(--btn-bg)':'transparent',color:view===v.id?'var(--btn-text)':'var(--text-muted)',transition:'all 0.2s'}}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        {view === 'calendar' && <CalendarView tasks={tasks} />}

        {/* List */}
        {view === 'list' && (
          filtered.length === 0 ? (
            <div className="card" style={{padding:'50px 32px',textAlign:'center'}}>
              <div style={{fontSize:'36px',marginBottom:'12px'}}>{search ? '🔍' : '📋'}</div>
              <p style={{color:'var(--text-muted)',fontWeight:'500',marginBottom:'6px'}}>
                {search ? `Žádné výsledky pro "${search}"` : 'Žádné úkoly'}
              </p>
              {!search && <Link href="/tasks/new" className="btn-primary" style={{display:'inline-block',marginTop:'12px',padding:'10px 20px'}}>+ Přidat úkol</Link>}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {filtered.map((task, i) => {
                const p = PRIORITIES[task.priority || 'medium']
                return (
                  <div key={task.id} className="card" style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',transition:'box-shadow 0.2s'}}
                    onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'}>

                    <button onClick={() => handleToggle(task)} style={{width:'20px',height:'20px',borderRadius:'6px',border:`2px solid ${task.status==='done'?'#16a34a':'var(--border)'}`,background:task.status==='done'?'#16a34a':'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
                      {task.status === 'done' && <span style={{color:'white',fontSize:'11px',fontWeight:'800'}}>✓</span>}
                    </button>

                    <div style={{flex:1,minWidth:0}}>
                      <Link href={`/tasks/${task.id}`}>
                        <p style={{fontWeight:'500',fontSize:'14px',color:task.status==='done'?'var(--text-faint)':'var(--text-primary)',textDecoration:task.status==='done'?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {task.title}
                        </p>
                      </Link>
                      {task.due_date && (
                        <p style={{fontSize:'12px',color:'var(--text-faint)',marginTop:'2px'}}>
                          📅 {new Date(task.due_date).toLocaleDateString('cs-CZ')}
                        </p>
                      )}
                    </div>

                    <span style={{fontSize:'14px'}} title={p.label}>{p.icon}</span>
                    <span className={task.status==='done'?'badge-done':'badge-pending'}>
                      {task.status==='done'?'Splněno':'Čeká'}
                    </span>

                    <div style={{display:'flex',gap:'4px'}}>
                      <Link href={`/tasks/${task.id}/edit`} style={{fontSize:'12px',color:'var(--text-muted)',padding:'5px 10px',borderRadius:'7px',border:'1px solid var(--border)',background:'var(--bg)',transition:'all 0.2s'}}>
                        Upravit
                      </Link>
                      <button onClick={() => handleDelete(task.id)} style={{fontSize:'12px',color:'#e11d48',padding:'5px 10px',borderRadius:'7px',border:'1px solid #fecdd3',background:'#fff1f2',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        Smazat
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}