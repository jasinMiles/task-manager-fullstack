import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownUp, ArrowRight, CalendarDays, Check, CheckCheck,
  CheckCircle2, ChevronDown, Circle, Clock3, Command, Filter, LayoutDashboard,
  ListTodo, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Sparkles,
  Target, Trash2, X, Zap
} from 'lucide-react'
import api, { messageFrom } from './api'

const statuses = ['pending', 'in-progress', 'completed']
const statusLabel = s => ({ pending: 'To do', 'in-progress': 'In progress', completed: 'Completed' }[s] || s)
const dateLabel = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'
const initials = name => (name || 'U').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()
const extractList = data => Array.isArray(data) ? data : data?.tasks || data?.data?.tasks || data?.data || []

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      if (mode === 'register') {
        await api.post('/api/auth/register', { name, email, password })
        setMode('login')
        setError('Account created. Sign in with your new details.')
      } else {
        const { data } = await api.post('/api/auth/login', { email, password })
        const token = data.token || data.accessToken || data.data?.token
        if (!token) throw new Error('Login succeeded but the API did not return a token.')
        localStorage.setItem('taskflow_token', token)
        onAuth(data.user || data.data?.user || { name: email.split('@')[0], email })
      }
    } catch (err) { setError(messageFrom(err)) } finally { setBusy(false) }
  }
  return <main className="auth-shell">
    <section className="auth-art">
      <div className="brand brand-light"><span className="brand-mark"><Command size={19}/></span> taskflow</div>
      <div className="art-copy"><span className="eyebrow light-eyebrow"><Sparkles size={14}/> MAKE SPACE FOR GREAT WORK</span>
        <h1>Less chaos.<br/><em>More done.</em></h1>
        <p>A thoughtful space to plan your day, keep your focus, and move your best work forward.</p>
      </div>
      <div className="art-bottom"><div className="avatar-stack"><i>AM</i><i>JD</i><i>SK</i><i>+8</i></div><span>Small steps. Real progress.</span></div>
      <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
    </section>
    <section className="auth-panel"><div className="auth-card">
      <div className="mobile-brand brand"><span className="brand-mark"><Command size={19}/></span> taskflow</div>
      <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <p className="muted">{mode === 'login' ? 'Pick up where you left off.' : 'A clearer day starts with one small step.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'register' && <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Morgan" required /></label>}
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></label>
        <label>Password<input type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required /></label>
        {error && <div className={error.startsWith('Account created') ? 'notice success' : 'notice'}>{error}</div>}
        <button className="btn-primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17}/></button>
      </form>
      <p className="switch-auth">{mode === 'login' ? "New to Taskflow?" : 'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Create an account':'Sign in'}</button></p>
      <div className="auth-foot">Designed for focus <span>✳</span> Built for progress</div>
    </div></section>
  </main>
}

function TaskModal({ task, onClose, onSave, busy }) {
  const [form, setForm] = useState({ title: task?.title || '', description: task?.description || '', status: task?.status || 'pending' })
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <form className="task-modal" onSubmit={e=>{e.preventDefault();onSave(form)}}>
      <div className="modal-head"><div><span className="eyebrow">{task ? 'REFINE YOUR TASK' : 'A NEW BEGINNING'}</span><h3>{task?'Edit task':'Create a task'}</h3></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>
      <label>Task title<input autoFocus name="title" value={form.title} onChange={change} placeholder="What needs to get done?" required maxLength="120"/></label>
      <label>Description<textarea name="description" value={form.description} onChange={change} placeholder="Add a little more detail…" rows="4" required /></label>
      <label>Status<select name="status" value={form.status} onChange={change}>{statuses.map(s=><option value={s} key={s}>{statusLabel(s)}</option>)}</select></label>
      <div className="modal-actions"><button type="button" className="btn-quiet" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy?'Saving…':task?'Save changes':'Add task'} <ArrowRight size={16}/></button></div>
    </form>
  </div>
}

function App() {
  const [user,setUser] = useState(null)
  const [tasks,setTasks] = useState([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('all')
  const [modal,setModal] = useState(null)
  const [saving,setSaving] = useState(false)
  const [mobileNav,setMobileNav] = useState(false)
  const [toast,setToast] = useState('')
  const [menuTask,setMenuTask] = useState(null)

  const loadTasks = async () => {
    setLoading(true); setError('')
    try { const {data}=await api.get('/api/tasks'); setTasks(extractList(data)) }
    catch(e){ setError(messageFrom(e)) } finally { setLoading(false) }
  }
  useEffect(()=>{ if(localStorage.getItem('taskflow_token')) { setUser({name:'Your workspace'}); loadTasks() } },[])
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(''),2600);return ()=>clearTimeout(t)} },[toast])
  const counts = useMemo(()=>({
    all:tasks.length, pending:tasks.filter(t=>t.status==='pending').length,
    progress:tasks.filter(t=>t.status==='in-progress').length,
    completed:tasks.filter(t=>t.status==='completed').length
  }),[tasks])
  const visible = useMemo(()=>tasks.filter(t=>{
    const match = `${t.title||''} ${t.description||''}`.toLowerCase().includes(query.toLowerCase())
    return match && (filter==='all'||t.status===filter)
  }),[tasks,query,filter])
  const saveTask = async values => {
    setSaving(true)
    try {
      if(modal?._id) await api.put(`/api/tasks/${modal._id}`,values)
      else await api.post('/api/tasks',values)
      setModal(null); await loadTasks(); setToast(modal? 'Task updated successfully':'Task added to your list')
    } catch(e){setToast(messageFrom(e))} finally{setSaving(false)}
  }
  const deleteTask = async task => {
    if(!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    try{await api.delete(`/api/tasks/${task._id}`);setTasks(prev=>prev.filter(t=>t._id!==task._id));setToast('Task deleted')}
    catch(e){setToast(messageFrom(e))}
  }
  const updateStatus = async task => {
    const next = statuses[(statuses.indexOf(task.status)+1)%statuses.length]
    try{await api.put(`/api/tasks/${task._id}`,{title:task.title,description:task.description,status:next});setTasks(prev=>prev.map(t=>t._id===task._id?{...t,status:next}:t));setToast(`Moved to ${statusLabel(next)}`)}
    catch(e){setToast(messageFrom(e))}
  }
  const logout = ()=>{localStorage.removeItem('taskflow_token');setUser(null);setTasks([])}
  if(!user) return <AuthScreen onAuth={u=>{setUser(u);loadTasks()}}/>

  const today = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><span className="brand-mark"><Command size={19}/></span> taskflow</div>
      <div className="workspace-switch"><div className="workspace-icon">A</div><div><strong>Personal space</strong><small>Free workspace</small></div><ChevronDown size={15}/></div>
      <span className="nav-caption">WORKSPACE</span>
      <nav><button className="nav-link active" onClick={()=>{setFilter('all');setMobileNav(false)}}><LayoutDashboard size={18}/> Overview <span className="nav-count">{counts.all}</span></button>
        <button className="nav-link" onClick={()=>{setFilter('pending');setMobileNav(false)}}><Circle size={18}/> To do <span className="nav-count">{counts.pending}</span></button>
        <button className="nav-link" onClick={()=>{setFilter('in-progress');setMobileNav(false)}}><Activity size={18}/> In progress</button>
        <button className="nav-link" onClick={()=>{setFilter('completed');setMobileNav(false)}}><CheckCircle2 size={18}/> Completed</button>
      </nav>
      <div className="sidebar-bottom"><div className="focus-card"><div className="focus-icon"><Zap size={16}/></div><strong>One thing at a time.</strong><p>Progress is built one task at a time. Keep going.</p><div className="focus-line"><span/></div></div>
        <button className="profile-row" onClick={logout}><div className="profile-avatar">{initials(user.name||user.email)}</div><div className="profile-meta"><strong>{user.name||'My account'}</strong><small>{user.email||'Signed in'}</small></div><LogOut size={16}/></button>
      </div>
    </aside>
    {mobileNav&&<div className="mobile-scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>Overview</b></div><div className="topbar-right"><span className="today-label"><CalendarDays size={15}/>{today}</span><div className="top-avatar">{initials(user.name||user.email)}</div></div></header>
      <div className="content-wrap">
        <section className="welcome-row"><div><span className="eyebrow">YOUR DAILY OVERVIEW</span><h1>Make today <em>count.</em></h1><p className="muted">A little progress each day adds up to big results.</p></div><button className="btn-primary create-btn" onClick={()=>setModal({})}><Plus size={18}/> New task</button></section>
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon violet"><ListTodo size={18}/></span></div><strong>{counts.all}</strong><small>Across your workspace</small></div>
          <div className="stat-card"><div className="stat-top"><span>To do</span><span className="stat-icon amber"><Target size={18}/></span></div><strong>{counts.pending}</strong><small>Ready when you are</small></div>
          <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon blue"><Activity size={18}/></span></div><strong>{counts.progress}</strong><small>Currently underway</small></div>
          <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green"><CheckCheck size={18}/></span></div><strong>{counts.completed}</strong><small>Look how far you've come</small></div>
        </section>
        <section className="tasks-section">
          <div className="section-heading"><div><span className="eyebrow">STAY ON TRACK</span><h2>Your tasks <span className="heading-count">{visible.length}</span></h2></div><button className="btn-outline" onClick={()=>setModal({})}><Plus size={16}/> Add task</button></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your tasks…"/>{query&&<button onClick={()=>setQuery('')}><X size={15}/></button>}</div>
            <div className="filter-wrap"><Filter size={16}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All tasks</option><option value="pending">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select><ChevronDown size={14}/></div>
          </div>
          {error&&<div className="error-banner">{error} <button onClick={loadTasks}>Try again</button></div>}
          <div className="task-list">
            {loading?<div className="loading-state"><span className="spinner"/>Loading your tasks…</div>:
              visible.length===0?<div className="empty-state"><div className="empty-icon"><CheckCheck size={25}/></div><h3>{query||filter!=='all'?'No matching tasks':'A fresh start.'}</h3><p>{query||filter!=='all'?'Try another search or filter.':'You have room for something great. Add your first task.'}</p>{!query&&filter==='all'&&<button className="btn-primary" onClick={()=>setModal({})}><Plus size={16}/> Create your first task</button>}</div>:
              visible.map(task=><article className="task-row" key={task._id}><button className={`task-check ${task.status==='completed'?'checked':''}`} title="Cycle task status" onClick={()=>updateStatus(task)}>{task.status==='completed'?<Check size={15}/>:<span/>}</button><div className="task-info"><h3 className={task.status==='completed'?'done':''}>{task.title}</h3><p>{task.description}</p><div className="task-meta"><span className={`status-pill ${task.status}`}><i/>{statusLabel(task.status)}</span><span className="task-date"><Clock3 size={13}/>{dateLabel(task.createdAt)}</span></div></div><div className="task-actions"><button className="icon-btn" title="Edit task" onClick={()=>setModal(task)}><Pencil size={16}/></button><button className="icon-btn danger-hover" title="Delete task" onClick={()=>deleteTask(task)}><Trash2 size={16}/></button></div></article>)
            }
          </div>
          <div className="list-footer"><span>Showing {visible.length} of {tasks.length} tasks</span><span><span className="live-dot"/> All changes sync with your account</span></div>
        </section>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Taskflow</span><span>Make space for what matters <Sparkles size={13}/></span></footer>
      </div>
    </main>
    {modal&&<TaskModal task={modal._id?modal:null} onClose={()=>setModal(null)} onSave={saveTask} busy={saving}/>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}
  </div>
}
export default App