import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const card = { background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }
const cardHeader = { display:'flex', alignItems:'center', gap:8, marginBottom:4 }
const statRow = { display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }
const label = { color:'#64748b', fontSize:12 }
const value = { color:'#f1f5f9', fontWeight:600, fontSize:14 }

function relTime(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const h = Math.floor(diff/3600000)
  if (h < 1) return `${Math.floor(diff/60000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

const WIDGET_NAMES = {
  goals:'🎯 Goals', today:'📅 Today', finance:'💰 Finance',
  fitness:'💪 Fitness', space:'🌐 SPACE', journal:'📓 Journal',
  activity:'🕐 Recent Activity', brain:'🧠 Brain'
}

const typeIcon = { exercise:'💪', work:'💼', social:'🤝', fun:'🎉', errand:'📦', learning:'📚' }
const lensIcon = { fitness:'💪', financial:'💰', diet:'🥗', journal:'📓', achievement:'🏆' }

export default function Dash() {
  const nav = useNavigate()
  const { data, sessionLensEvents } = useStore()
  const [hiddenWidgets, setHiddenWidgets] = useState(new Set())
  const [showAddWidget, setShowAddWidget] = useState(false)

  const { goals, events, transactions, accounts, lensEvents, routines, personalBests,
    journalEntries, notifications, conversations, user, brainConfig } = data

  const hide = (id) => setHiddenWidgets(s => new Set([...s, id]))
  const restore = (id) => { setHiddenWidgets(s => { const n=new Set(s); n.delete(id); return n }); setShowAddWidget(false) }
  const visible = (id) => !hiddenWidgets.has(id)

  const todayEvents = events.filter(e => (e.start||'').startsWith('2026-04-29')).sort((a,b)=>(a.start||'').localeCompare(b.start||''))
  const aprTx = transactions.filter(t => t.date.startsWith('2026-04'))
  const totalSpent = aprTx.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0)
  const budgetTotal = Object.values(data.budgetLimits).reduce((s,v)=>s+v,0)
  const netWorth = accounts.reduce((s,a)=>s+a.balance,0)

  const weekStart = '2026-04-27', weekEnd = '2026-05-03'
  const weekFitness = lensEvents.filter(e=> (e.type==='fitness.workout'||e.type==='fitness.run') && e.recordedAt >= weekStart && e.recordedAt <= weekEnd+'T23:59Z')
  const gymStreak = routines.find(r=>r.id==='r1')?.streak ?? 0
  const pb = personalBests[0]

  const unreadNotif = notifications.filter(n=>!n.read).length
  const unreadMsg = conversations.reduce((s,c)=>s+c.unread,0)

  const last7 = journalEntries.slice(0,7).reverse()
  const lastEntry = journalEntries[0]

  const allLens = sessionLensEvents.length ? sessionLensEvents : lensEvents
  const recentActivity = [...allLens].sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt)).slice(0,6)

  const tierColor = { bronze:'#cd7f32', silver:'#94a3b8', gold:'#f59e0b' }

  function Widget({ id, children, span2 }) {
    if (!visible(id)) return null
    return (
      <div style={{ ...card, ...(span2 ? { gridColumn:'span 2' } : {}) }}>
        {children}
      </div>
    )
  }

  function WHeader({ id, icon, title }) {
    return (
      <div style={cardHeader}>
        <span>{icon}</span>
        <span style={{ fontWeight:600, fontSize:14, color:'#f1f5f9', flex:1 }}>{title}</span>
        <button onClick={()=>hide(id)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px' }}>—</button>
      </div>
    )
  }

  return (
    <div style={{ height:'100vh', background:'#060c18', color:'#f1f5f9', display:'flex', flexDirection:'column', fontFamily:'inherit', overflow:'hidden' }}>
      {/* Nav */}
      <div style={{ height:48, background:'#0f172a', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', padding:'0 20px', gap:20, flexShrink:0 }}>
        <span style={{ fontWeight:700, fontSize:15, color:'#84cc16', letterSpacing:'.04em' }}>⊞ DASH</span>
        <div style={{ flex:1, display:'flex', gap:4 }}>
          {[['🏃 Body','/autogenes/body'],['🧩 Mind','/autogenes/mind'],['💼 Life','/autogenes/money'],['🌍 World','/autogenes/world'],['🤖 Brain','/autogenes/brain'],['⬣ Platform','/platform'],['⬡ Monogenes','/monogenes']].map(([label,path])=>(
            <button key={path} onClick={()=>nav(path)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer', padding:'4px 10px', borderRadius:6 }}
              onMouseEnter={e=>e.currentTarget.style.color='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>{label}</button>
          ))}
        </div>
        <span style={{ fontSize:12, color:'#64748b' }}>{user.handle}</span>
        <span style={{ fontSize:12, background:'#1e293b', border:'1px solid #334155', borderRadius:20, padding:'2px 10px', color:'#84cc16' }}>⬡ {user.credits}</span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 0 32px' }}>
        {/* Title row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 8px' }}>
          <span style={{ fontWeight:700, fontSize:17, color:'#f1f5f9' }}>Your Dashboard · May 2026</span>
          <div style={{ position:'relative' }}>
            <button onClick={()=>setShowAddWidget(s=>!s)}
              style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#84cc16', fontSize:13, padding:'6px 14px', cursor:'pointer' }}>
              Add Widget +
            </button>
            {showAddWidget && hiddenWidgets.size > 0 && (
              <div style={{ position:'absolute', right:0, top:36, background:'#1e293b', border:'1px solid #334155', borderRadius:8, zIndex:100, minWidth:160, overflow:'hidden' }}>
                {[...hiddenWidgets].map(id=>(
                  <button key={id} onClick={()=>restore(id)}
                    style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 14px', background:'none', border:'none', color:'#f1f5f9', fontSize:13, cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#334155'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                    {WIDGET_NAMES[id]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, padding:'4px 24px 20px' }}>

          {/* Goals */}
          <Widget id="goals" span2>
            <WHeader id="goals" icon="🎯" title="Goals" />
            {goals.map(g => {
              const pct = g.progress ?? (g.currentWeek!=null&&g.target ? Math.round(g.currentWeek/g.target*100) : 0)
              return (
                <div key={g.id} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, flex:1, color:'#e2e8f0' }}>{g.name}</span>
                    {g.tier && <span style={{ fontSize:10, fontWeight:700, color:tierColor[g.tier]||'#64748b', border:`1px solid ${tierColor[g.tier]||'#334155'}`, borderRadius:4, padding:'1px 6px', textTransform:'uppercase' }}>{g.tier}</span>}
                    <span style={{ fontSize:12, color:'#84cc16', fontWeight:600 }}>{pct}%</span>
                  </div>
                  <div style={{ background:'#0f172a', borderRadius:4, height:6, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:'#84cc16', borderRadius:4, transition:'width .3s' }} />
                  </div>
                  {g.currentWeek!=null && <span style={{ fontSize:11, color:'#64748b' }}>{g.currentWeek} / {g.target} sessions this week</span>}
                </div>
              )
            })}
          </Widget>

          {/* Today */}
          <Widget id="today">
            <WHeader id="today" icon="📅" title="Today" />
            {todayEvents.length===0 && <span style={{ fontSize:13, color:'#64748b' }}>No events today</span>}
            {todayEvents.map(ev=>(
              <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span>{typeIcon[ev.type]||'📌'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color: ev.status==='finished' ? '#475569' : '#f1f5f9' }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{ev.start ? new Date(ev.start).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}) : ''}</div>
                </div>
                <span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background: ev.status==='finished' ? '#1e293b' : '#1a2e0e', color: ev.status==='finished' ? '#475569' : '#84cc16', border:`1px solid ${ev.status==='finished' ? '#334155' : '#365314'}` }}>{ev.status}</span>
              </div>
            ))}
          </Widget>

          {/* Finance */}
          <Widget id="finance">
            <WHeader id="finance" icon="💰" title="Finance" />
            <div style={statRow}><span style={label}>Spent (Apr)</span><span style={value}>${totalSpent.toFixed(0)}</span></div>
            <div style={statRow}><span style={label}>Budget remaining</span><span style={{ ...value, color:'#84cc16' }}>${(budgetTotal-totalSpent).toFixed(0)}</span></div>
            <div style={statRow}><span style={label}>Net worth</span><span style={value}>${netWorth.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0})}</span></div>
          </Widget>

          {/* Fitness */}
          <Widget id="fitness">
            <WHeader id="fitness" icon="💪" title="Fitness" />
            <div style={statRow}><span style={label}>Workouts this week</span><span style={value}>{weekFitness.filter(e=>e.type==='fitness.workout').length}</span></div>
            <div style={statRow}><span style={label}>Runs this week</span><span style={value}>{weekFitness.filter(e=>e.type==='fitness.run').length}</span></div>
            <div style={statRow}><span style={label}>Gym streak</span><span style={value}>{gymStreak} wks</span></div>
            {pb && <div style={statRow}><span style={label}>Best PR</span><span style={value}>{pb.lift} {pb.value}{pb.unit}</span></div>}
          </Widget>

          {/* SPACE */}
          <Widget id="space">
            <WHeader id="space" icon="🌐" title="SPACE" />
            <div style={statRow}><span style={label}>Followers</span><span style={value}>{user.stats.followers}</span></div>
            <div style={statRow}><span style={label}>Following</span><span style={value}>{user.stats.following}</span></div>
            <div style={statRow}><span style={label}>Unread notifications</span><span style={{ ...value, color: unreadNotif>0 ? '#84cc16' : '#f1f5f9' }}>{unreadNotif}</span></div>
            <div style={statRow}><span style={label}>Unread messages</span><span style={{ ...value, color: unreadMsg>0 ? '#84cc16' : '#f1f5f9' }}>{unreadMsg}</span></div>
          </Widget>

          {/* Journal */}
          <Widget id="journal">
            <WHeader id="journal" icon="📓" title="Journal" />
            <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:36, marginBottom:8 }}>
              {last7.map((e, i) => (
                <div key={i} style={{ flex:1, background:'#84cc16', borderRadius:2, opacity:0.7,
                  height: `${(e.dayRating/5)*100}%`, minHeight:4 }} />
              ))}
            </div>
            {lastEntry && (
              <>
                <div style={statRow}><span style={label}>Last entry</span><span style={value}>{lastEntry.date}</span></div>
                <div style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic', lineHeight:1.4 }}>"{lastEntry.highlight?.slice(0,60)}{lastEntry.highlight?.length>60?'…':''}"</div>
              </>
            )}
          </Widget>

          {/* Recent Activity */}
          <Widget id="activity">
            <WHeader id="activity" icon="🕐" title="Recent Activity" />
            {recentActivity.map(e=>{
              const cat = e.type?.split('.')[0]
              return (
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14 }}>{lensIcon[cat]||'📋'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, color:'#e2e8f0' }}>{e.type}</div>
                  </div>
                  <span style={{ fontSize:11, color:'#64748b' }}>{relTime(e.recordedAt)}</span>
                </div>
              )
            })}
          </Widget>

          {/* Brain */}
          <Widget id="brain">
            <WHeader id="brain" icon="🧠" title="Brain" />
            <div>
              <span style={{ fontSize:11, padding:'3px 8px', borderRadius:4, background:'#1e3a5f', color:'#60a5fa', border:'1px solid #1d4ed8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{brainConfig.provider}</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {['Summarize week','Find conflicts'].map(prompt=>(
                <button key={prompt} onClick={()=>nav('/autogenes/brain')}
                  style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:6, color:'#94a3b8', fontSize:11, padding:'6px 8px', cursor:'pointer', textAlign:'left' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#84cc16'} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                  {prompt} →
                </button>
              ))}
            </div>
            <button onClick={()=>nav('/autogenes/brain')}
              style={{ background:'#1a2e0e', border:'1px solid #365314', borderRadius:6, color:'#84cc16', fontSize:12, padding:'7px 12px', cursor:'pointer', fontWeight:600 }}>
              Run conflict check →
            </button>
          </Widget>

        </div>

        {/* Hidden chips */}
        {hiddenWidgets.size > 0 && (
          <div style={{ padding:'0 24px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'#64748b' }}>Hidden:</span>
            {[...hiddenWidgets].map(id=>(
              <button key={id} onClick={()=>restore(id)}
                style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:20, color:'#94a3b8', fontSize:11, padding:'3px 10px', cursor:'pointer' }}>
                {WIDGET_NAMES[id]} +
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
