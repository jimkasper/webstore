import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getDraftOrder } from '../store.jsx'

// ── Theme definitions (mirrored from SpaceShell) ──────────────────────────────
const THEMES = {
  default:  { '--accent': '#84cc16', '--space-bg': '#0f172a', '--space-surface': '#1e293b', '--space-border': '#334155' },
  midnight: { '--accent': '#6366f1', '--space-bg': '#0f0f1a', '--space-surface': '#1a1a2e', '--space-border': '#2d2d4a' },
  sage:     { '--accent': '#4ade80', '--space-bg': '#0d1f14', '--space-surface': '#122016', '--space-border': '#1e4026' },
  sunset:   { '--accent': '#fb923c', '--space-bg': '#1a0f0a', '--space-surface': '#2a1a12', '--space-border': '#3a2218' },
  stone:    { '--accent': '#e5e7eb', '--space-bg': '#111111', '--space-surface': '#1c1c1c', '--space-border': '#2a2a2a' },
  neon:     { '--accent': '#f472b6', '--space-bg': '#0a0a1a', '--space-surface': '#111128', '--space-border': '#1e1e3a' },
}

// ── Block palette per page slug ───────────────────────────────────────────────
const BLOCK_TYPES = {
  wall:    [{ type:'navbar',icon:'≡',label:'Navbar' }, { type:'hero',icon:'🖼',label:'Hero' },
            { type:'posts',icon:'📝',label:'Posts' }, { type:'status',icon:'💬',label:'Status' },
            { type:'banner',icon:'📢',label:'Banner' }, { type:'text',icon:'T',label:'Text' }],
  media:   [{ type:'photos',icon:'🖼',label:'Photos' }, { type:'videos',icon:'▶',label:'Videos' }, { type:'music',icon:'🎵',label:'Music' }],
  friends: [{ type:'friends',icon:'👥',label:'Friends' }, { type:'groups',icon:'🏘',label:'Groups' }],
  lists:   [{ type:'playlist',icon:'🎵',label:'Playlist' }, { type:'favorites',icon:'⭐',label:'Favorites' }],
  info:    [{ type:'bio',icon:'👤',label:'Bio' }, { type:'links',icon:'🔗',label:'Links' }, { type:'stats',icon:'📊',label:'Stats' }],
  profile: [{ type:'profile_card',icon:'🪪',label:'Profile Card' }, { type:'page_summary',icon:'📄',label:'Page Summary' }],
}

// ── Life Suite blocks — per-app accordion groups ──────────────────────────────
const LIFE_BLOCK_GROUPS = [
  { app:'Fitness',  icon:'💪', blocks:[
    { type:'fitness_stats',        icon:'📊', label:'Stats'          },
    { type:'fitness_prs',          icon:'🏆', label:'Personal Bests' },
    { type:'fitness_challenge',    icon:'🎯', label:'Challenge'       },
    { type:'fitness_activity_log', icon:'📋', label:'Activity Log'   },
  ]},
  { app:'Health', icon:'❤️', blocks:[
    { type:'health_stats', icon:'📈', label:'Metrics'    },
    { type:'health_mood',  icon:'😊', label:'Mood Chart' },
  ]},
  { app:'Finance', icon:'💰', blocks:[
    { type:'finance_summary', icon:'💳', label:'Summary'     },
    { type:'finance_goals',   icon:'🎯', label:'Saving Goal' },
  ]},
  { app:'Goals', icon:'🎯', blocks:[
    { type:'goals_active',    icon:'📊', label:'Active Goals' },
    { type:'goals_challenge', icon:'🤝', label:'Challenge'    },
    { type:'planner_upcoming',icon:'📅', label:'Upcoming'     },
    { type:'planner_plans',   icon:'📋', label:'Plans'        },
  ]},
  { app:'Journal', icon:'📓', blocks:[
    { type:'journal_mood',       icon:'😊', label:'Mood'         },
    { type:'journal_post',       icon:'📤', label:'Publish Post'  },
    { type:'journal_blog',       icon:'📰', label:'Blog'         },
    { type:'journal_highlights', icon:'✨', label:'Highlights'   },
  ]},
  { app:'Learning', icon:'📚', blocks:[
    { type:'learning_skills',    icon:'📈', label:'Skills'    },
    { type:'learning_currently', icon:'🔭', label:'Currently' },
    { type:'learning_resources', icon:'🔗', label:'Resources' },
  ]},
  { app:'Media', icon:'🎬', blocks:[
    { type:'media_player',          icon:'▶️', label:'Player'          },
    { type:'media_now',             icon:'⏺', label:'Now'             },
    { type:'media_favorites',       icon:'⭐', label:'Favorites'       },
    { type:'media_recommendations', icon:'💬', label:'Picks'          },
    { type:'media_watchlist',       icon:'📋', label:'Watchlist'       },
  ]},
  { app:'Lists', icon:'📝', blocks:[
    { type:'lists_checklist', icon:'☑️', label:'Checklist'  },
    { type:'lists_favorites', icon:'⭐', label:'Favorites'  },
    { type:'lists_bucket',    icon:'🪣', label:'Bucket List' },
    { type:'lists_travel',    icon:'✈️', label:'Travel'     },
  ]},
  { app:'Research', icon:'🔬', blocks:[
    { type:'research_topic',    icon:'💡', label:'Topic'    },
    { type:'research_findings', icon:'📌', label:'Findings' },
  ]},
  { app:'Draft', icon:'🎲', blocks:[
    { type:'draft_active',  icon:'📋', label:'Draft Board'   },
    { type:'draft_results', icon:'🏆', label:'Draft Results' },
  ]},
  { app:'Mailer', icon:'📬', blocks:[
    { type:'space_mailer', icon:'📬', label:'Sign-Up Form' },
  ]},
  { app:'Website', icon:'🌐', blocks:[
    { type:'cta_banner',        icon:'📢', label:'CTA Banner'      },
    { type:'testimonials',      icon:'💬', label:'Testimonials'    },
    { type:'team_grid',         icon:'👥', label:'Team Grid'       },
    { type:'pricing_table',     icon:'💰', label:'Pricing Table'   },
    { type:'services_list',     icon:'📋', label:'Services'        },
    { type:'faq_accordion',     icon:'❓', label:'FAQ'             },
    { type:'gallery_grid',      icon:'🖼', label:'Gallery'         },
    { type:'product_grid',      icon:'🛍', label:'Products'        },
    { type:'contact_form',      icon:'📬', label:'Contact Form'    },
    { type:'hours_table',       icon:'⏰', label:'Business Hours'  },
    { type:'map_embed',         icon:'🗺', label:'Map'             },
    { type:'menu_section',      icon:'🍽', label:'Menu'            },
    { type:'booking_form',      icon:'📅', label:'Booking'         },
    { type:'events_calendar',   icon:'📆', label:'Events'          },
    { type:'newsletter_signup', icon:'✉️', label:'Newsletter'      },
  ]},
]

// ── Preset page layouts ───────────────────────────────────────────────────────
const PAGE_PRESETS = [
  { id:'wall',      icon:'🏠', name:'Wall',      slug:'wall',      blocks:['navbar','hero','posts','status'] },
  { id:'about',     icon:'👤', name:'About',     slug:'about',     blocks:['bio','links','stats'] },
  { id:'portfolio', icon:'💼', name:'Portfolio', slug:'portfolio', blocks:['hero','bio','photos','learning_skills'] },
  { id:'blog',      icon:'📝', name:'Blog',      slug:'blog',      blocks:['hero','journal_blog','journal_highlights'] },
  { id:'fitness',   icon:'💪', name:'Fitness',   slug:'fitness',   blocks:['hero','fitness_stats','fitness_prs','fitness_challenge','health_stats'] },
  { id:'media',     icon:'🎬', name:'Media',     slug:'media',     blocks:['hero','media_player','media_favorites','media_watchlist'] },
  { id:'blank',     icon:'📋', name:'Blank',     slug:'page',      blocks:[] },
  { id:'home',      icon:'🏠', name:'Home',      slug:'home',      blocks:['hero','cta_banner','testimonials'] },
  { id:'services',  icon:'📋', name:'Services',  slug:'services',  blocks:['hero','services_list','pricing_table','cta_banner'] },
  { id:'menu',      icon:'🍽', name:'Menu',      slug:'menu',      blocks:['menu_section'] },
  { id:'shop',      icon:'🛍', name:'Shop',      slug:'shop',      blocks:['product_grid','pricing_table'] },
  { id:'contact',   icon:'📬', name:'Contact',   slug:'contact',   blocks:['contact_form','hours_table','map_embed'] },
  { id:'gallery',   icon:'🖼', name:'Gallery',   slug:'gallery',   blocks:['gallery_grid'] },
  { id:'events',    icon:'📆', name:'Events',    slug:'events',    blocks:['events_calendar','cta_banner'] },
]

const LIFE_VISIBILITY = { key:'privacy', type:'select', label:'Visibility', options:['Public','Connections only','Private'] }

// ── Per-block property schema ─────────────────────────────────────────────────
const BLOCK_PROPS_SCHEMA = {
  hero:   [{ key:'layout',   type:'select',  label:'Layout',     options:['banner','centered','minimal'] },
           { key:'showStats',type:'toggle',  label:'Show Stats' },
           { key:'gradient', type:'gradient',label:'Background'  }],
  posts:  [{ key:'sort',     type:'select',  label:'Sort',       options:['newest','oldest'] },
           { key:'count',    type:'number',  label:'Count',      min:1, max:50 }],
  photos: [{ key:'columns',  type:'select',  label:'Columns',    options:['2','3','4'] },
           { key:'captions', type:'toggle',  label:'Show Captions' }],
  bio:    [{ key:'showAvatar',   type:'toggle', label:'Show Avatar'   },
           { key:'showJoinDate', type:'toggle', label:'Show Join Date' }],
  // New per-type Life blocks
  fitness_stats:        [LIFE_VISIBILITY, { key:'showStreak', type:'toggle', label:'Show Streak' }, { key:'showCalories', type:'toggle', label:'Show Calories' }],
  fitness_prs:          [LIFE_VISIBILITY],
  fitness_challenge:    [LIFE_VISIBILITY, { key:'goalName', type:'text', label:'Challenge name' }, { key:'deadline', type:'text', label:'Deadline' }],
  fitness_activity_log: [LIFE_VISIBILITY, { key:'count', type:'number', label:'Entries to show', min:1, max:10 }],
  health_stats:         [{ key:'privacy', type:'select', label:'Visibility', options:['Private','Connections only','Public'] }, { key:'showWeight', type:'toggle', label:'Show Weight' }, { key:'showSleep', type:'toggle', label:'Show Sleep' }],
  health_mood:          [{ key:'privacy', type:'select', label:'Visibility', options:['Connections only','Public','Private'] }],
  finance_summary:      [{ key:'privacy', type:'select', label:'Visibility', options:['Private','Connections only','Public'] }, { key:'showNetWorth', type:'toggle', label:'Show Net Worth' }],
  finance_goals:        [LIFE_VISIBILITY, { key:'goalLabel', type:'text', label:'Goal label' }],
  goals_active:         [LIFE_VISIBILITY, { key:'count', type:'number', label:'Max goals', min:1, max:8 }],
  goals_challenge:      [LIFE_VISIBILITY, { key:'goalId', type:'text', label:'Goal ID to feature' }],
  planner_upcoming:     [LIFE_VISIBILITY, { key:'count', type:'number', label:'Events to show', min:1, max:5 }, { key:'showRSVP', type:'toggle', label:'Show Join button' }],
  planner_plans:        [LIFE_VISIBILITY, { key:'count', type:'number', label:'Max plans', min:1, max:5 }],
  journal_mood:         [{ key:'privacy', type:'select', label:'Visibility', options:['Connections only','Public','Private'] }],
  journal_post:         [LIFE_VISIBILITY],
  journal_blog:         [LIFE_VISIBILITY, { key:'count', type:'number', label:'Max entries', min:1, max:10 }],
  journal_highlights:   [LIFE_VISIBILITY, { key:'count', type:'number', label:'Highlights to show', min:1, max:10 }],
  learning_skills:      [LIFE_VISIBILITY, { key:'count', type:'number', label:'Skills to show', min:1, max:8 }],
  learning_currently:   [LIFE_VISIBILITY],
  learning_resources:   [LIFE_VISIBILITY],
  media_player:         [LIFE_VISIBILITY, { key:'mediaId', type:'text', label:'Media ID (e.g. med12)' }],
  media_now:            [LIFE_VISIBILITY],
  media_favorites:      [LIFE_VISIBILITY, { key:'mediaType', type:'select', label:'Type', options:['All','Books','Movies','Albums'] }],
  media_recommendations:[LIFE_VISIBILITY],
  media_watchlist:      [LIFE_VISIBILITY, { key:'showInteract', type:'toggle', label:'Show interaction buttons' }],
  lists_checklist:      [LIFE_VISIBILITY, { key:'showProgress', type:'toggle', label:'Show Progress' }],
  lists_favorites:      [LIFE_VISIBILITY, { key:'listTitle', type:'text', label:'List title (e.g. "Favorite Bands")' }],
  lists_bucket:         [LIFE_VISIBILITY],
  lists_travel:         [LIFE_VISIBILITY],
  research_topic:       [LIFE_VISIBILITY],
  research_findings:    [LIFE_VISIBILITY],
  draft_active:         [LIFE_VISIBILITY, { key:'draftId', type:'text', label:'Draft ID' }],
  draft_results:        [LIFE_VISIBILITY, { key:'draftId', type:'text', label:'Draft ID' }],
  space_mailer:         [LIFE_VISIBILITY, { key:'listId', type:'text', label:'Mailing List ID' }, { key:'buttonLabel', type:'text', label:'Button label (e.g. "Sign Up")' }],
  // Website blocks
  cta_banner:        [{ key:'headline', type:'text', label:'Headline' }, { key:'subtext', type:'text', label:'Subtext' }, { key:'btnLabel', type:'text', label:'Button Label' }, { key:'btnUrl', type:'text', label:'Button URL' }],
  testimonials:      [{ key:'count', type:'number', label:'Testimonials to show', min:1, max:6 }],
  team_grid:         [{ key:'columns', type:'select', label:'Columns', options:['2','3','4'] }],
  pricing_table:     [{ key:'columns', type:'select', label:'Tiers', options:['2','3','4'] }],
  services_list:     [{ key:'layout', type:'select', label:'Layout', options:['cards','list','grid'] }],
  faq_accordion:     [{ key:'count', type:'number', label:'FAQs to show', min:1, max:20 }],
  gallery_grid:      [{ key:'columns', type:'select', label:'Columns', options:['2','3','4'] }, { key:'showCaptions', type:'toggle', label:'Show Captions' }],
  product_grid:      [{ key:'columns', type:'select', label:'Columns', options:['2','3','4'] }, { key:'showPrice', type:'toggle', label:'Show Prices' }],
  contact_form:      [{ key:'showPhone', type:'toggle', label:'Include Phone Field' }, { key:'showSubject', type:'toggle', label:'Include Subject' }],
  hours_table:       [],
  map_embed:         [{ key:'address', type:'text', label:'Address (display only)' }],
  menu_section:      [{ key:'sections', type:'text', label:'Sections (comma-sep)' }],
  booking_form:      [{ key:'title', type:'text', label:'Form Title' }],
  events_calendar:   [{ key:'count', type:'number', label:'Events to show', min:1, max:10 }],
  newsletter_signup: [{ key:'btnLabel', type:'text', label:'Button Label' }],
  // Legacy single-app blocks (kept for backwards compat)
  life_fitness:   [LIFE_VISIBILITY, { key:'showStreak', type:'toggle', label:'Show Streak' }, { key:'showPRs', type:'toggle', label:'Show PRs' }],
  life_health:    [LIFE_VISIBILITY, { key:'showWeight', type:'toggle', label:'Show Weight' }, { key:'showSleep', type:'toggle', label:'Show Sleep' }],
  life_financial: [LIFE_VISIBILITY, { key:'showNetWorth', type:'toggle', label:'Show Net Worth' }, { key:'showSpend', type:'toggle', label:'Show Budget' }],
  life_goals:     [LIFE_VISIBILITY, { key:'showProgress', type:'toggle', label:'Show Progress' }, { key:'count', type:'number', label:'Max Goals', min:1, max:8 }],
  life_journal:   [LIFE_VISIBILITY, { key:'showMoodOnly', type:'toggle', label:'Mood Chart Only' }],
  life_learning:  [LIFE_VISIBILITY, { key:'showSkills', type:'toggle', label:'Show Skills' }],
  life_media:     [LIFE_VISIBILITY, { key:'showRating', type:'toggle', label:'Show Ratings' }],
  life_planner:   [LIFE_VISIBILITY, { key:'count', type:'number', label:'Max Plans', min:1, max:5 }],
  life_lists:     [LIFE_VISIBILITY, { key:'showProgress', type:'toggle', label:'Show Progress' }],
}

// ── Shared button/control styles ──────────────────────────────────────────────
const ghostBtn  = { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer', lineHeight:1.4 }
const primaryBtn= { background:'#84cc16', color:'#0f172a', border:'none', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', lineHeight:1.4 }
const iconBtn   = { background:'transparent', border:'none', cursor:'pointer', fontSize:16, padding:'4px 6px', borderRadius:4, color:'#64748b' }
const tinyBtn   = { background:'transparent', border:'none', cursor:'pointer', fontSize:12, padding:'2px 4px', color:'#64748b', lineHeight:1 }
const propRow   = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8 }
const propLabel = { fontSize:12, color:'#94a3b8', flexShrink:0 }
const propInput = { background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12, flex:1, minWidth:0 }
const propSelect= { background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }
const smallInput= { width:'100%', boxSizing:'border-box', background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'6px 10px', color:'#f1f5f9', fontSize:12 }
const panelTitle= { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#64748b', marginBottom:12 }
const accHeader = { padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#64748b', borderBottom:'1px solid #334155', userSelect:'none' }
const toggleStyle = (on) => ({ width:30, height:18, borderRadius:9, border:'none', cursor:'pointer', position:'relative', background: on ? '#84cc16' : '#334155', transition:'background 0.15s', flexShrink:0, padding:0, display:'flex', alignItems:'center', paddingLeft:2, paddingRight:2 })
const toggleKnob  = (on) => ({ width:14, height:14, borderRadius:'50%', background:'#fff', transform: on ? 'translateX(12px)' : 'translateX(0)', transition:'transform 0.15s', pointerEvents:'none' })

// ── AccordionSection ──────────────────────────────────────────────────────────
function AccordionSection({ id, title, isOpen, onToggle, children }) {
  return (
    <div style={{ borderBottom:'1px solid #334155' }}>
      <div style={accHeader} onClick={onToggle}>
        <span>{title}</span>
        <span style={{ fontSize:10 }}>{isOpen ? '▾' : '▸'}</span>
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  )
}

// ── SubTabs ───────────────────────────────────────────────────────────────────
function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', borderBottom:'1px solid #334155' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          style={{ flex:1, background:'transparent', border:'none', padding:'7px 4px', fontSize:11, cursor:'pointer',
            color: active===t ? '#84cc16' : '#64748b',
            borderBottom: active===t ? '2px solid #84cc16' : '2px solid transparent',
            fontWeight: active===t ? 700 : 400 }}>
          {t}
        </button>
      ))}
    </div>
  )
}

// ── BlockPreview ──────────────────────────────────────────────────────────────
function BlockPreview({ block, data }) {
  const user = data.user || {}
  const connections = data.connections || []
  const spaceGroups = data.spaceGroups || []
  const surface = { background:'var(--space-surface,#1e293b)', padding:'14px 16px', borderRadius:'0 0 6px 6px', minHeight:60 }
  const bar = (w, h=6, bg='var(--space-border,#334155)') => ({ height:h, width:w, background:bg, borderRadius:3 })
  const circle = (sz, bg='var(--accent,#84cc16)') => ({ width:sz, height:sz, borderRadius:'50%', background:bg, flexShrink:0 })
  const lifeHeader = (icon, label) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>{label}</span>
      <span style={{ marginLeft:'auto', fontSize:10, color:'#475569', background:'var(--space-bg,#0f172a)', borderRadius:4, padding:'1px 7px', flexShrink:0 }}>
        {block.props.privacy || 'Public'}
      </span>
    </div>
  )
  const statGrid = (items) => (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${items.length},1fr)`, gap:6 }}>
      {items.map(([label, value, color]) => (
        <div key={label} style={{ background:'var(--space-bg,#0f172a)', borderRadius:6, padding:'7px 4px', textAlign:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color: color || 'var(--accent,#84cc16)' }}>{value}</div>
          <div style={{ fontSize:10, color:'#64748b', marginTop:1 }}>{label}</div>
        </div>
      ))}
    </div>
  )
  const progressBar = (pct, color='var(--accent,#84cc16)') => (
    <div style={{ height:4, background:'var(--space-bg,#0f172a)', borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2 }}/>
    </div>
  )

  switch (block.type) {
    case 'navbar': return (
      <div style={{ ...surface, display:'flex', alignItems:'center', gap:16, padding:'10px 16px' }}>
        <div style={{ width:24, height:24, borderRadius:4, background:'var(--accent,#84cc16)', flexShrink:0 }} />
        {['Home','Feed','Connections','Groups'].map(l => (
          <span key={l} style={{ fontSize:11, color:'#64748b' }}>{l}</span>
        ))}
        <span style={{ marginLeft:'auto', fontSize:16 }}>🔔</span>
      </div>
    )
    case 'hero': {
      const layout = block.props.layout || 'banner'
      const gradient = block.props.gradient || 'linear-gradient(135deg,#2d1b69,#1e3a5f)'
      return (
        <div style={{ ...surface, padding:0 }}>
          {layout !== 'minimal' && (
            <div style={{ height:72, background:gradient, borderRadius:'0 0 0 0' }} />
          )}
          <div style={{ padding:'10px 14px' }}>
            <div style={{ display:'flex', alignItems: layout==='centered' ? 'center' : 'flex-end', flexDirection: layout==='centered' ? 'column' : 'row', gap:10, marginBottom:8 }}>
              <div style={{ ...circle(40), border:'2px solid var(--space-surface,#1e293b)', flexShrink:0, marginTop: layout!=='minimal'?-20:0 }} />
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{user.name}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>@{user.handle}</div>
              </div>
              {block.props.showStats !== false && (
                <div style={{ marginLeft:'auto', display:'flex', gap:14, fontSize:11, color:'#94a3b8' }}>
                  {[['Followers',user.stats.followers],['Following',user.stats.following],['Posts',user.stats.posts]].map(([l,v]) => (
                    <span key={l}><b style={{ color:'#f1f5f9' }}>{v}</b> {l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    case 'posts': return (
      <div style={surface}>
        {[0,1].map(i => (
          <div key={i} style={{ background:'rgba(255,255,255,.04)', borderRadius:6, padding:'10px 12px', marginBottom:i===0?8:0 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
              <div style={circle(24, `hsl(${200+i*30} 60% 45%)`)} />
              <div style={bar(80,7)}/>
              <div style={{ ...bar(40,7,'var(--space-surface,#1e293b)'), marginLeft:'auto' }}/>
            </div>
            <div style={{ ...bar('88%',6), marginBottom:4 }}/>
            <div style={bar('65%',6)}/>
          </div>
        ))}
      </div>
    )
    case 'status': return (
      <div style={surface}>
        <div style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 10px', background:'rgba(255,255,255,.04)', borderRadius:6 }}>
          <div style={circle(28)} />
          <div style={{ ...bar('70%',7,'#2d3748'), borderRadius:6 }}/>
          <button style={{ ...ghostBtn, fontSize:11, padding:'3px 10px', flexShrink:0 }}>Post</button>
        </div>
      </div>
    )
    case 'banner': return (
      <div style={{ ...surface, padding:0 }}>
        <div style={{ background:'var(--accent,#84cc16)', borderRadius:'0 0 6px 6px', padding:'14px 16px', textAlign:'center', color:'var(--space-bg,#0f172a)', fontWeight:700, fontSize:14 }}>
          📢 Banner — click to edit
        </div>
      </div>
    )
    case 'text': return (
      <div style={surface}>
        {[88,74,92,50].map((w,i) => <div key={i} style={{ ...bar(`${w}%`,6), marginBottom:i<3?8:0 }}/>)}
      </div>
    )
    case 'photos': {
      const cols = parseInt(block.props.columns)||3
      return (
        <div style={{ ...surface, padding:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:4 }}>
            {Array.from({length:6}).map((_,i) => (
              <div key={i} style={{ aspectRatio:'1', background:`hsl(${220+i*18} 28% 22%)`, borderRadius:3 }}/>
            ))}
          </div>
        </div>
      )
    }
    case 'videos': return (
      <div style={surface}>
        <div style={{ aspectRatio:'16/9', background:'var(--space-bg,#0f172a)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'var(--space-border,#334155)' }}>
          ▶
        </div>
      </div>
    )
    case 'music': return (
      <div style={surface}>
        {[0,1,2].map(i => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:i<2?8:0 }}>
            <div style={{ width:32, height:32, borderRadius:4, background:`hsl(${260+i*20} 50% 35%)`, flexShrink:0 }}/>
            <div><div style={{ ...bar(90,6), marginBottom:4 }}/><div style={bar(60,5,'#1e293b')}/></div>
            <span style={{ marginLeft:'auto', fontSize:11, color:'#475569' }}>3:4{i+1}</span>
          </div>
        ))}
      </div>
    )
    case 'friends': return (
      <div style={surface}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {(connections||[]).slice(0,5).map(c => (
            <div key={c.id} style={{ textAlign:'center' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:c.avatar||'#334155', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', marginBottom:3 }}>
                {c.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{ fontSize:9, color:'#64748b', maxWidth:44, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
    )
    case 'groups': return (
      <div style={surface}>
        {(spaceGroups||[]).slice(0,3).map(g => (
          <div key={g.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid #334155' }}>
            <span style={{ fontSize:18 }}>{g.category==='Fitness'?'🏃':g.category==='Reading'?'📚':g.category==='Tech'?'💻':'🌱'}</span>
            <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{g.name}</div><div style={{ fontSize:10, color:'#475569' }}>{g.members} members</div></div>
            {g.joined && <span style={{ fontSize:10, color:'var(--accent,#84cc16)' }}>✓</span>}
          </div>
        ))}
      </div>
    )
    case 'bio': return (
      <div style={surface}>
        {block.props.showAvatar !== false && <div style={{ ...circle(36), marginBottom:8 }}/>}
        <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9', marginBottom:4 }}>{user.name}</div>
        <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6, lineHeight:1.5 }}>{user.bio}</div>
        <div style={{ fontSize:11, color:'#64748b' }}>📍 {user.location} · 💼 {user.title}</div>
      </div>
    )
    case 'links': return (
      <div style={surface}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[['Twitter/X','#1DA1F2'],['GitHub','#6e40c9'],['LinkedIn','#0077B5']].map(([l,c]) => (
            <button key={l} style={{ ...ghostBtn, borderColor:c, color:c, fontSize:11 }}>{l}</button>
          ))}
        </div>
      </div>
    )
    case 'stats': return (
      <div style={{ ...surface, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, padding:0 }}>
        {[['Followers',user.stats.followers],['Following',user.stats.following],['Posts',user.stats.posts]].map(([l,v]) => (
          <div key={l} style={{ textAlign:'center', padding:'12px 8px', background:'rgba(255,255,255,.03)' }}>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--accent,#84cc16)' }}>{v}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
    )
    case 'profile_card': return (
      <div style={surface}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={circle(44)}/>
          <div><div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{user.name}</div><div style={{ fontSize:11, color:'#64748b' }}>@{user.handle}</div><div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{user.title}</div></div>
        </div>
        <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8, lineHeight:1.4 }}>{user.bio}</div>
        <div style={{ display:'flex', gap:14, fontSize:11, color:'#475569' }}>
          <span><b style={{ color:'#f1f5f9' }}>{user.stats.followers}</b> Followers</span>
          <span><b style={{ color:'#f1f5f9' }}>{user.stats.following}</b> Following</span>
        </div>
      </div>
    )
    case 'page_summary': return (
      <div style={{ ...surface, textAlign:'center', color:'#475569', fontSize:12, fontStyle:'italic' }}>
        📄 Page Summary — configure in Preview Layout
      </div>
    )
    case 'playlist': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9', marginBottom:8 }}>🎵 Playlist</div>
        {[0,1,2].map(i => <div key={i} style={{ ...bar(`${[80,65,72][i]}%`,6), marginBottom:6 }}/>)}
      </div>
    )
    case 'favorites': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9', marginBottom:8 }}>⭐ Favorites</div>
        {[0,1].map(i => <div key={i} style={{ ...bar(`${[70,85][i]}%`,6), marginBottom:6 }}/>)}
      </div>
    )

    // ── Life Suite Blocks ─────────────────────────────────────────────────────
    case 'life_fitness': {
      const workouts = (data.lensEvents||[]).filter(e => e.type === 'fitness.workout')
      const runs = (data.lensEvents||[]).filter(e => e.type === 'fitness.run')
      const streak = (data.goals||[]).find(g => g.routineId === 'r1')?.streak || 0
      const topPR = (data.personalBests||[])[0]
      return (
        <div style={surface}>
          {lifeHeader('💪', 'Fitness')}
          {statGrid([['Workouts', workouts.length], ['Runs', runs.length], ['Streak', `${streak}wk`]])}
          {topPR && block.props.showPRs !== false && (
            <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:'#64748b' }}>Top PR: {topPR.lift}</span>
              <span style={{ color:'#84cc16', fontWeight:700 }}>{topPR.value} {topPR.unit}</span>
            </div>
          )}
        </div>
      )
    }
    case 'life_health': {
      const logs = (data.healthLogs||[]).slice(0, 7)
      const avgSleep = logs.length ? (logs.reduce((s,l) => s + l.sleepHours, 0) / logs.length).toFixed(1) : '—'
      const latest = logs[0]
      const showW = block.props.showWeight !== false
      const showS = block.props.showSleep !== false
      return (
        <div style={surface}>
          {lifeHeader('❤️', 'Health')}
          {statGrid([
            ['Weight', showW && latest ? `${latest.weightLbs}lb` : '—'],
            ['Sleep',  showS ? `${avgSleep}h` : '—'],
            ['HR',     latest ? `${latest.restingHR}bpm` : '—'],
          ])}
        </div>
      )
    }
    case 'life_financial': {
      const netWorth = (data.accounts||[]).reduce((s,a) => s + a.balance, 0)
      const totalBudget = Object.values(data.budgetLimits||{}).reduce((s,v) => s+v, 0)
      const spent = Math.abs((data.transactions||[])
        .filter(t => { const d = new Date(t.date); return d.getFullYear()===2026 && d.getMonth()===3 && t.amount < 0 })
        .reduce((s,t) => s + t.amount, 0))
      const pct = totalBudget ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0
      return (
        <div style={surface}>
          {lifeHeader('💰', 'Finance')}
          {block.props.showNetWorth !== false && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Net Worth</div>
              <div style={{ fontSize:20, fontWeight:700, color: netWorth >= 0 ? 'var(--accent,#84cc16)' : '#ef4444' }}>
                ${Math.abs(netWorth).toLocaleString()}
              </div>
            </div>
          )}
          {block.props.showSpend !== false && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:4 }}>
                <span>Monthly Budget</span><span style={{ color: pct > 90 ? '#ef4444' : '#84cc16' }}>{pct}% used</span>
              </div>
              {progressBar(pct, pct > 90 ? '#ef4444' : '#84cc16')}
            </div>
          )}
        </div>
      )
    }
    case 'life_goals': {
      const maxCount = block.props.count || 3
      const active = (data.goals||[]).filter(g => (g.progress||0) < 100).slice(0, maxCount)
      return (
        <div style={surface}>
          {lifeHeader('🎯', 'Goals')}
          {active.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No active goals</div>
            : active.map(g => (
              <div key={g.id} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{g.name}</span>
                  <span style={{ color:'#84cc16', flexShrink:0 }}>{g.progress||0}%</span>
                </div>
                {progressBar(g.progress||0)}
              </div>
            ))
          }
        </div>
      )
    }
    case 'life_journal': {
      const entries = (data.journalEntries||[]).slice(0, 7).reverse()
      const avgRating = entries.length
        ? (entries.reduce((s,e) => s + (e.dayRating||0), 0) / entries.length).toFixed(1)
        : '—'
      return (
        <div style={surface}>
          {lifeHeader('📓', 'Journal')}
          <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:40, marginBottom:8 }}>
            {entries.map((e, i) => {
              const r = e.dayRating || 0
              const h = Math.max(5, (r / 5) * 36)
              const col = r >= 4 ? '#84cc16' : r >= 3 ? '#f59e0b' : '#ef4444'
              return (
                <div key={e.id} title={`${e.date}: ${r}/5`}
                  style={{ flex:1, height:h, background:col, borderRadius:'2px 2px 0 0' }}/>
              )
            })}
          </div>
          <div style={{ fontSize:11, color:'#64748b' }}>
            Avg mood: <span style={{ color:'#84cc16', fontWeight:700 }}>{avgRating}/5</span>
            {block.props.showMoodOnly === false && entries[entries.length-1]?.highlight && (
              <span style={{ color:'#475569', marginLeft:6, fontStyle:'italic' }}>"{entries[entries.length-1].highlight?.slice(0,30)}…"</span>
            )}
          </div>
        </div>
      )
    }
    case 'life_learning': {
      const skills = (data.skills||[]).slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('📚', 'Learning')}
          {skills.map(s => (
            <div key={s.id} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{s.name}</span>
                <span style={{ color:'#64748b', flexShrink:0 }}>Lv {s.level}/{s.targetLevel}</span>
              </div>
              {progressBar(Math.round((s.level / s.targetLevel) * 100))}
            </div>
          ))}
        </div>
      )
    }
    case 'life_media': {
      const typeIcon = { Book:'📖', Movie:'🎬', Album:'🎵', Podcast:'🎙️', TV:'📺' }
      const recent = (data.mediaLog||[])
        .filter(m => ['completed','reading','following'].includes(m.status))
        .slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('🎬', 'Media')}
          {recent.map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
              <span style={{ fontSize:13, flexShrink:0 }}>{typeIcon[m.type] || '🎬'}</span>
              <div style={{ flex:1, overflow:'hidden', minWidth:0 }}>
                <div style={{ fontSize:11, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                <div style={{ fontSize:10, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.creator}</div>
              </div>
              {block.props.showRating !== false && m.rating && (
                <span style={{ fontSize:10, color:'#f59e0b', flexShrink:0 }}>{'★'.repeat(m.rating)}</span>
              )}
            </div>
          ))}
        </div>
      )
    }
    case 'life_planner': {
      const maxCount = block.props.count || 2
      const plans = (data.plans||[]).slice(0, maxCount)
      const allTasks = data.planTasks || []
      return (
        <div style={surface}>
          {lifeHeader('📋', 'Planner')}
          {plans.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No plans yet</div>
            : plans.map(plan => {
              const tasks = allTasks.filter(t => t.planId === plan.id)
              const done = tasks.filter(t => t.status === 'done').length
              const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
              return (
                <div key={plan.id} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{plan.name}</span>
                    <span style={{ color:'#64748b', flexShrink:0 }}>{done}/{tasks.length} done</span>
                  </div>
                  {progressBar(pct)}
                </div>
              )
            })
          }
        </div>
      )
    }
    case 'life_lists': {
      const lists = (data.lists||[]).slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('📝', 'Lists')}
          {lists.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No lists yet</div>
            : lists.map(l => {
              const total = (l.items||[]).length
              const done = (l.items||[]).filter(i => i.done).length
              const pct = total ? Math.round((done / total) * 100) : 0
              return (
                <div key={l.id} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{l.title}</span>
                    <span style={{ color:'#64748b', flexShrink:0 }}>{done}/{total}</span>
                  </div>
                  {block.props.showProgress !== false && progressBar(pct)}
                </div>
              )
            })
          }
        </div>
      )
    }

    // ── New per-type Life Suite blocks ────────────────────────────────────────
    case 'fitness_stats': {
      const workouts = (data.lensEvents||[]).filter(e => e.type === 'fitness.workout')
      const runs     = (data.lensEvents||[]).filter(e => e.type === 'fitness.run')
      const streak   = (data.goals||[]).find(g => g.apps?.includes('fitness'))?.streak || 0
      const cals     = workouts.reduce((s,e) => s + (e.payload?.calories||0), 0)
      return (
        <div style={surface}>
          {lifeHeader('💪', 'Fitness Stats')}
          {statGrid([['Workouts', workouts.length], ['Runs', runs.length], ['Streak', `${streak}wk`], ['Calories', cals||'—']])}
        </div>
      )
    }
    case 'fitness_prs': {
      const prs = (data.personalBests||[]).slice(0, 4)
      return (
        <div style={surface}>
          {lifeHeader('🏆', 'Personal Bests')}
          {prs.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No PRs logged yet</div>
            : prs.map(pr => (
              <div key={pr.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:6 }}>
                <span style={{ color:'#e2e8f0' }}>{pr.lift}</span>
                <span style={{ color:'#84cc16', fontWeight:700 }}>{pr.value} {pr.unit}</span>
              </div>
            ))
          }
        </div>
      )
    }
    case 'fitness_challenge': {
      const goalName = block.props.goalName || 'Run 5K by June 15'
      const deadline = block.props.deadline || 'June 15'
      return (
        <div style={surface}>
          {lifeHeader('🎯', 'Challenge')}
          <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>{goalName}</div>
            <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>📅 Deadline: {deadline}</div>
            <button disabled style={{ background:'rgba(132,204,22,.15)', color:'#84cc16', border:'1px solid rgba(132,204,22,.3)', borderRadius:6, padding:'5px 14px', fontSize:11, fontWeight:600, cursor:'default', opacity:0.7 }}>
              I'm in 🙋
            </button>
          </div>
        </div>
      )
    }
    case 'fitness_activity_log': {
      const count = block.props.count || 5
      const activities = (data.lensEvents||[])
        .filter(e => e.type === 'fitness.workout' || e.type === 'fitness.run')
        .slice(0, count)
      return (
        <div style={surface}>
          {lifeHeader('📋', 'Activity Log')}
          {activities.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No activities yet</div>
            : activities.map(a => (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:5, borderBottom:'1px solid #1e293b', paddingBottom:5 }}>
                <span style={{ color:'#e2e8f0' }}>{a.payload?.activity || (a.type === 'fitness.run' ? 'Run' : 'Workout')}</span>
                <span style={{ color:'#64748b' }}>{a.payload?.durationMins || a.payload?.distance || '—'}{a.type === 'fitness.run' ? ' km' : ' min'}</span>
              </div>
            ))
          }
        </div>
      )
    }
    case 'health_stats': {
      const logs = (data.healthLogs||[]).slice(0, 7)
      const avgSleep = logs.length ? (logs.reduce((s,l) => s + l.sleepHours, 0) / logs.length).toFixed(1) : '—'
      const latest = logs[0]
      return (
        <div style={surface}>
          {lifeHeader('❤️', 'Health Metrics')}
          <div style={{ fontSize:10, color:'#475569', marginBottom:8, background:'rgba(239,68,68,.08)', borderRadius:4, padding:'3px 8px', display:'inline-block' }}>🔒 Private</div>
          {statGrid([
            ['Weight', block.props.showWeight !== false && latest ? `${latest.weightLbs}lb` : '—'],
            ['Sleep',  block.props.showSleep  !== false ? `${avgSleep}h` : '—'],
            ['HR',     latest ? `${latest.restingHR}bpm` : '—'],
          ])}
        </div>
      )
    }
    case 'health_mood': {
      const entries = (data.journalEntries||[]).slice(0, 7).reverse()
      const avgRating = entries.length
        ? (entries.reduce((s,e) => s + (e.dayRating||0), 0) / entries.length).toFixed(1)
        : '—'
      return (
        <div style={surface}>
          {lifeHeader('😊', 'Mood Chart')}
          <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:40, marginBottom:8 }}>
            {entries.map((e, i) => {
              const r = e.dayRating || 0
              const h = Math.max(5, (r / 5) * 36)
              const col = r >= 4 ? '#84cc16' : r >= 3 ? '#f59e0b' : '#ef4444'
              return <div key={e.id} style={{ flex:1, height:h, background:col, borderRadius:'2px 2px 0 0' }}/>
            })}
          </div>
          <div style={{ fontSize:11, color:'#64748b' }}>
            Avg mood: <span style={{ color:'#84cc16', fontWeight:700 }}>{avgRating}/5</span>
          </div>
        </div>
      )
    }
    case 'finance_summary': {
      const netWorth = (data.accounts||[]).reduce((s,a) => s + a.balance, 0)
      const totalBudget = Object.values(data.budgetLimits||{}).reduce((s,v) => s+v, 0)
      const spent = Math.abs((data.transactions||[])
        .filter(t => { const d = new Date(t.date); return d.getFullYear()===2026 && d.getMonth()===3 && t.amount < 0 })
        .reduce((s,t) => s + t.amount, 0))
      const pct = totalBudget ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0
      return (
        <div style={surface}>
          {lifeHeader('💰', 'Finance')}
          <div style={{ fontSize:10, color:'#475569', marginBottom:8, background:'rgba(239,68,68,.08)', borderRadius:4, padding:'3px 8px', display:'inline-block' }}>🔒 Private</div>
          {block.props.showNetWorth !== false && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Net Worth</div>
              <div style={{ fontSize:18, fontWeight:700, color: netWorth >= 0 ? '#84cc16' : '#ef4444' }}>${Math.abs(netWorth).toLocaleString()}</div>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:4 }}>
            <span>Monthly Budget</span><span style={{ color: pct > 90 ? '#ef4444' : '#84cc16' }}>{pct}% used</span>
          </div>
          {progressBar(pct, pct > 90 ? '#ef4444' : '#84cc16')}
        </div>
      )
    }
    case 'finance_goals': {
      const savingsGoal = (data.goals||[]).find(g => g.apps?.includes('financial')) || (data.goals||[])[3]
      const label = block.props.goalLabel || savingsGoal?.name || 'Savings Goal'
      const prog = savingsGoal?.progress || 58
      return (
        <div style={surface}>
          {lifeHeader('🎯', 'Saving Goal')}
          <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:6 }}>{label}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:4 }}>
              <span>Progress</span><span style={{ color:'#84cc16' }}>{prog}%</span>
            </div>
            {progressBar(prog)}
          </div>
        </div>
      )
    }
    case 'goals_active': {
      const maxCount = block.props.count || 3
      const active = (data.goals||[]).filter(g => (g.progress||0) < 100).slice(0, maxCount)
      return (
        <div style={surface}>
          {lifeHeader('🎯', 'Active Goals')}
          {active.map(g => (
            <div key={g.id} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{g.name}</span>
                <span style={{ color:'#84cc16', flexShrink:0 }}>{g.progress||0}%</span>
              </div>
              {progressBar(g.progress||0)}
            </div>
          ))}
        </div>
      )
    }
    case 'goals_challenge': {
      const goal = (data.goals||[])[0]
      return (
        <div style={surface}>
          {lifeHeader('🤝', 'Accountability')}
          <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>{goal?.name || 'Run a 5K'}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:8 }}>
              <span>Progress: {goal?.progress||72}%</span>
              <span style={{ color:'#84cc16' }}>0 watching</span>
            </div>
            {progressBar(goal?.progress||72)}
            <button disabled style={{ marginTop:10, background:'rgba(132,204,22,.15)', color:'#84cc16', border:'1px solid rgba(132,204,22,.3)', borderRadius:6, padding:'5px 14px', fontSize:11, fontWeight:600, cursor:'default', opacity:0.7 }}>
              Hold me accountable 👀
            </button>
          </div>
        </div>
      )
    }
    case 'planner_upcoming': {
      const count = block.props.count || 3
      const upcoming = (data.events||[])
        .filter(e => e.status === 'upcoming')
        .slice(0, count)
      const showRSVP = block.props.showRSVP !== false
      return (
        <div style={surface}>
          {lifeHeader('📅', 'Upcoming Events')}
          {upcoming.map(e => (
            <div key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, marginBottom:7 }}>
              <div>
                <div style={{ color:'#e2e8f0', fontWeight:500 }}>{e.title}</div>
                <div style={{ color:'#64748b', fontSize:10 }}>{new Date(e.start).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {e.type}</div>
              </div>
              {showRSVP && e.type === 'social' && (
                <button disabled style={{ background:'rgba(132,204,22,.1)', color:'#84cc16', border:'1px solid rgba(132,204,22,.25)', borderRadius:5, padding:'3px 10px', fontSize:10, cursor:'default', opacity:0.7 }}>
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      )
    }
    case 'planner_plans': {
      const count = block.props.count || 2
      const plans = (data.plans||[]).slice(0, count)
      const allTasks = data.planTasks || []
      return (
        <div style={surface}>
          {lifeHeader('📋', 'Plans')}
          {plans.map(plan => {
            const tasks = allTasks.filter(t => t.planId === plan.id)
            const done  = tasks.filter(t => t.status === 'done').length
            const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0
            return (
              <div key={plan.id} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{plan.name}</span>
                  <span style={{ color:'#64748b', flexShrink:0 }}>{done}/{tasks.length}</span>
                </div>
                {progressBar(pct)}
              </div>
            )
          })}
        </div>
      )
    }
    case 'journal_mood': {
      const entries = (data.journalEntries||[]).slice(0, 7).reverse()
      const avgRating = entries.length
        ? (entries.reduce((s,e) => s + (e.dayRating||0), 0) / entries.length).toFixed(1)
        : '—'
      return (
        <div style={surface}>
          {lifeHeader('😊', 'Mood')}
          <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:36, marginBottom:8 }}>
            {entries.map(e => {
              const r = e.dayRating || 0
              const h = Math.max(4, (r / 5) * 32)
              const col = r >= 4 ? '#84cc16' : r >= 3 ? '#f59e0b' : '#ef4444'
              return <div key={e.id} style={{ flex:1, height:h, background:col, borderRadius:'2px 2px 0 0' }}/>
            })}
          </div>
          <div style={{ fontSize:11, color:'#64748b' }}>7-day avg: <span style={{ color:'#84cc16', fontWeight:700 }}>{avgRating}/5</span></div>
        </div>
      )
    }
    case 'journal_post': {
      const latest = (data.journalEntries||[])[0]
      return (
        <div style={surface}>
          {lifeHeader('📤', 'Publish to Wall')}
          <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
            <div style={{ fontSize:11, color:'#94a3b8', marginBottom:6, lineHeight:1.4, fontStyle:'italic' }}>
              "{latest?.highlight?.slice(0, 80) || 'No entries yet'}…"
            </div>
            <div style={{ fontSize:10, color:'#475569' }}>From: {latest?.date || '—'}</div>
          </div>
          <button disabled style={{ background:'rgba(132,204,22,.15)', color:'#84cc16', border:'1px solid rgba(132,204,22,.3)', borderRadius:6, padding:'5px 14px', fontSize:11, fontWeight:600, cursor:'default', opacity:0.7 }}>
            📤 Publish to Wall
          </button>
        </div>
      )
    }
    case 'journal_blog': {
      const count = block.props.count || 5
      const posts = (data.spaceBlogPosts||[]).slice(0, count)
      return (
        <div style={surface}>
          {lifeHeader('📰', 'Blog')}
          {posts.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No blog entries yet — publish from Journal app</div>
            : posts.map(p => (
              <div key={p.id} style={{ marginBottom:8, borderBottom:'1px solid #1e293b', paddingBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{p.title}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{new Date(p.publishedAt).toLocaleDateString()}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:4, lineHeight:1.4 }}>{p.excerpt}</div>
              </div>
            ))
          }
        </div>
      )
    }
    case 'journal_highlights': {
      const count = block.props.count || 5
      const entries = (data.journalEntries||[]).slice(0, count)
      return (
        <div style={surface}>
          {lifeHeader('✨', 'Highlights')}
          {entries.map(e => (
            <div key={e.id} style={{ display:'flex', gap:8, fontSize:11, marginBottom:6 }}>
              <span style={{ fontSize:13, flexShrink:0 }}>{'⭐🌟✨💡🎯'[Math.floor(Math.random()*5)]}</span>
              <span style={{ color:'#94a3b8', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'85%' }}>{e.highlight}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'learning_skills': {
      const count = block.props.count || 3
      const skills = (data.skills||[]).slice(0, count)
      return (
        <div style={surface}>
          {lifeHeader('📈', 'Skills')}
          {skills.map(s => (
            <div key={s.id} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{s.name}</span>
                <span style={{ color:'#64748b', flexShrink:0 }}>Lv {s.level}/{s.targetLevel}</span>
              </div>
              {progressBar(Math.round((s.level / s.targetLevel) * 100))}
            </div>
          ))}
        </div>
      )
    }
    case 'learning_currently': {
      const current = (data.skills||[]).find(s => s.level < s.targetLevel) || (data.skills||[])[0]
      return (
        <div style={surface}>
          {lifeHeader('🔭', 'Currently Learning')}
          {current ? (
            <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:2 }}>{current.name}</div>
              <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>Level {current.level} → {current.targetLevel}</div>
              {progressBar(Math.round((current.level / current.targetLevel) * 100))}
              <button disabled style={{ marginTop:10, background:'rgba(132,204,22,.1)', color:'#84cc16', border:'1px solid rgba(132,204,22,.25)', borderRadius:6, padding:'4px 12px', fontSize:10, cursor:'default', opacity:0.7 }}>
                Learning this too 🤝
              </button>
            </div>
          ) : <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No skills tracked yet</div>}
        </div>
      )
    }
    case 'learning_resources': {
      const current = (data.skills||[])[0]
      const resources = current?.resources || []
      return (
        <div style={surface}>
          {lifeHeader('🔗', 'Resources')}
          {resources.length === 0
            ? (
              <div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>Curated picks for {current?.name || 'your skills'}</div>
                {[['📖', 'Book: Recommended Reading'], ['🎥', 'Course: Online Tutorial'], ['🔧', 'Tool: Practice Project']].map(([ic, label]) => (
                  <div key={label} style={{ display:'flex', gap:8, fontSize:11, marginBottom:6 }}>
                    <span>{ic}</span>
                    <span style={{ color:'#94a3b8' }}>{label}</span>
                  </div>
                ))}
              </div>
            )
            : resources.slice(0,3).map((r,i) => (
              <div key={i} style={{ display:'flex', gap:8, fontSize:11, marginBottom:6 }}>
                <span>🔗</span>
                <span style={{ color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r}</span>
              </div>
            ))
          }
        </div>
      )
    }
    case 'media_player': {
      const mid = block.props?.mediaId
      const m = (data.mediaLog || []).find(x => x.id === mid) || (data.mediaLog || []).find(x => x.fileType)
      if (!m) return (
        <div style={surface}>
          {lifeHeader('▶️', 'Player')}
          <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Set a Media ID in block settings</div>
        </div>
      )
      const chapters = m.chapters || []
      const annotations = m.annotations || []
      const comments = m.comments || []
      return (
        <div style={surface}>
          {lifeHeader('▶️', 'Player')}
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:22 }}>{m.fileType === 'video' ? '🎬' : '🎵'}</span>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontWeight:700, fontSize:13, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
              <div style={{ fontSize:11, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.creator}</div>
            </div>
          </div>
          {/* Fake scrubber */}
          <div style={{ height:4, background:'#1e293b', borderRadius:2, marginBottom:8, position:'relative' }}>
            <div style={{ width:'35%', height:'100%', background:'#84cc16', borderRadius:2 }} />
            {chapters.map((ch, i) => (
              <div key={ch.id} style={{ position:'absolute', top:-2, left:`${(i + 1) * (100 / (chapters.length + 1))}%`, width:2, height:8, background:'#e0a040', borderRadius:1, transform:'translateX(-50%)' }} />
            ))}
          </div>
          {chapters.length > 0 && (
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
              {chapters.slice(0, 4).map(ch => (
                <span key={ch.id} style={{ fontSize:9, background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'1px 6px', color:'#94a3b8' }}>{ch.label}</span>
              ))}
              {chapters.length > 4 && <span style={{ fontSize:9, color:'#64748b' }}>+{chapters.length - 4} more</span>}
            </div>
          )}
          <div style={{ fontSize:10, color:'#475569' }}>
            {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} · {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </div>
        </div>
      )
    }
    case 'media_now': {
      const typeIcon = { Book:'📖', Movie:'🎬', Album:'🎵', Podcast:'🎙️', TV:'📺' }
      const current = (data.mediaLog||[]).find(m => ['reading','following','in-progress'].includes(m.status))
      return (
        <div style={surface}>
          {lifeHeader('▶️', 'Now')}
          {current ? (
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:44, height:44, borderRadius:6, background:`hsl(${240} 40% 30%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                {typeIcon[current.type] || '🎬'}
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{current.title}</div>
                <div style={{ fontSize:11, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{current.creator}</div>
                <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{current.status}</div>
              </div>
            </div>
          ) : <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Nothing in progress</div>}
        </div>
      )
    }
    case 'media_favorites': {
      const filterType = block.props.mediaType || 'All'
      const typeIcon = { Book:'📖', Movie:'🎬', Album:'🎵', Podcast:'🎙️', TV:'📺' }
      const items = (data.mediaLog||[])
        .filter(m => m.status === 'completed' && m.rating >= 4 && (filterType === 'All' || m.type === filterType))
        .slice(0, 6)
      return (
        <div style={surface}>
          {lifeHeader('⭐', 'Favorites')}
          {items.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No rated items yet</div>
            : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {items.map(m => (
                  <div key={m.id} style={{ background:'#0f172a', borderRadius:6, padding:'7px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{typeIcon[m.type] || '🎬'}</div>
                    <div style={{ fontSize:9, color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                    <div style={{ fontSize:9, color:'#f59e0b', marginTop:2 }}>{'★'.repeat(m.rating||0)}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )
    }
    case 'media_recommendations': {
      const typeIcon = { Book:'📖', Movie:'🎬', Album:'🎵', Podcast:'🎙️', TV:'📺' }
      const picks = (data.mediaLog||[])
        .filter(m => m.status === 'completed' && m.rating >= 4)
        .slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('💬', 'You should check out…')}
          {picks.map(m => (
            <div key={m.id} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{typeIcon[m.type] || '🎬'}</span>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                <div style={{ fontSize:10, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>by {m.creator}</div>
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:2, fontStyle:'italic' }}>A personal favorite</div>
              </div>
            </div>
          ))}
          {picks.length === 0 && <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Rate items in Media app to add picks</div>}
        </div>
      )
    }
    case 'media_watchlist': {
      const typeIcon = { Book:'📖', Movie:'🎬', Album:'🎵', Podcast:'🎙️', TV:'📺' }
      const watchlist = (data.mediaLog||[]).filter(m => m.status === 'want-to-read' || m.status === 'on-list').slice(0, 4)
      const showInteract = block.props.showInteract !== false
      return (
        <div style={surface}>
          {lifeHeader('📋', 'Watchlist')}
          {watchlist.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Watchlist is empty</div>
            : watchlist.map(m => (
              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:13, flexShrink:0 }}>{typeIcon[m.type] || '🎬'}</span>
                <span style={{ fontSize:11, color:'#e2e8f0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</span>
                {showInteract && (
                  <button disabled style={{ background:'rgba(99,102,241,.15)', color:'#818cf8', border:'1px solid rgba(99,102,241,.3)', borderRadius:5, padding:'2px 8px', fontSize:9, cursor:'default', opacity:0.7 }}>
                    On my list
                  </button>
                )}
              </div>
            ))
          }
        </div>
      )
    }
    case 'lists_checklist': {
      const lists = (data.lists||[]).slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('☑️', 'Checklists')}
          {lists.map(l => {
            const total = (l.items||[]).length
            const done  = (l.items||[]).filter(i => i.done).length
            const pct   = total ? Math.round((done / total) * 100) : 0
            return (
              <div key={l.id} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'72%' }}>{l.title}</span>
                  <span style={{ color:'#64748b', flexShrink:0 }}>{done}/{total}</span>
                </div>
                {block.props.showProgress !== false && progressBar(pct)}
              </div>
            )
          })}
        </div>
      )
    }
    case 'lists_favorites': {
      const listTitle = block.props.listTitle || 'My Favorites'
      const items = (data.lists||[]).flatMap(l => l.items||[]).filter(i => !i.done).slice(0, 5)
      return (
        <div style={surface}>
          {lifeHeader('⭐', listTitle)}
          <div style={{ fontSize:10, color:'#64748b', marginBottom:8, fontStyle:'italic' }}>Set your list title in the properties panel →</div>
          {items.map((item, idx) => (
            <div key={item.id||idx} style={{ display:'flex', gap:8, fontSize:11, marginBottom:5 }}>
              <span style={{ color:'#84cc16', flexShrink:0 }}>{idx+1}.</span>
              <span style={{ color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.text}</span>
            </div>
          ))}
          {items.length === 0 && <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Add items in Lists app</div>}
        </div>
      )
    }
    case 'lists_bucket': {
      const items = (data.lists||[]).flatMap(l => l.items||[]).filter(i => !i.done).slice(0, 5)
      return (
        <div style={surface}>
          {lifeHeader('🪣', 'Bucket List')}
          {items.map((item, idx) => (
            <div key={item.id||idx} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, marginBottom:5 }}>
              <span style={{ color:'#475569', flexShrink:0, fontSize:10 }}>○</span>
              <span style={{ color:'#e2e8f0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.text}</span>
              <button disabled style={{ background:'rgba(132,204,22,.1)', color:'#84cc16', border:'1px solid rgba(132,204,22,.25)', borderRadius:4, padding:'2px 8px', fontSize:9, cursor:'default', opacity:0.7 }}>
                Me too
              </button>
            </div>
          ))}
          {items.length === 0 && <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>Add bucket list items in Lists app</div>}
        </div>
      )
    }
    case 'lists_travel': {
      const trips = (data.trips||[]).slice(0, 3)
      return (
        <div style={surface}>
          {lifeHeader('✈️', 'Travel')}
          {trips.length === 0
            ? <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No trips planned yet</div>
            : trips.map(trip => (
              <div key={trip.id} style={{ marginBottom:8, borderBottom:'1px solid #1e293b', paddingBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                  <span style={{ color:'#e2e8f0', fontWeight:500 }}>✈️ {trip.destination}</span>
                  <button disabled style={{ background:'rgba(132,204,22,.1)', color:'#84cc16', border:'1px solid rgba(132,204,22,.25)', borderRadius:4, padding:'2px 8px', fontSize:9, cursor:'default', opacity:0.7 }}>
                    I'll be there!
                  </button>
                </div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{trip.startDate} → {trip.endDate}</div>
              </div>
            ))
          }
        </div>
      )
    }
    case 'research_topic': {
      const topic = (data.research||[])[0]
      return (
        <div style={surface}>
          {lifeHeader('💡', 'Research Topic')}
          {topic ? (
            <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', marginBottom:4 }}>{topic.title}</div>
              <div style={{ fontSize:11, color:'#94a3b8', lineHeight:1.4, marginBottom:8 }}>{topic.question?.slice(0, 100) || 'Ongoing research'}</div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {(topic.tags||[]).slice(0,4).map(tag => (
                  <span key={tag} style={{ fontSize:9, background:'#1e293b', color:'#64748b', borderRadius:4, padding:'2px 7px' }}>{tag}</span>
                ))}
              </div>
            </div>
          ) : <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No research topics yet</div>}
        </div>
      )
    }
    case 'research_findings': {
      const topic = (data.research||[])[0]
      const finding = topic?.findings?.[0] || topic?.summary
      return (
        <div style={surface}>
          {lifeHeader('📌', 'Key Finding')}
          {finding ? (
            <div style={{ background:'rgba(132,204,22,.06)', border:'1px solid rgba(132,204,22,.15)', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:11, color:'#e2e8f0', lineHeight:1.5 }}>"{typeof finding === 'string' ? finding.slice(0, 120) : finding.text?.slice(0, 120) || 'Research insight'}"</div>
              {topic && <div style={{ fontSize:10, color:'#475569', marginTop:6 }}>From: {topic.title}</div>}
            </div>
          ) : <div style={{ color:'#475569', fontSize:12, fontStyle:'italic' }}>No research findings yet</div>}
        </div>
      )
    }

    case 'draft_active': {
      const draft = (data.drafts||[]).find(d => d.id === block.props?.draftId) || (data.drafts||[])[0]
      if (!draft) return <div style={{ ...surface, color:'#475569', fontSize:12, fontStyle:'italic' }}>No drafts yet</div>
      const order = getDraftOrder(draft.parties.length, draft.rounds)
      const currentSlot = order[draft.picks.length]
      const currentParty = currentSlot ? draft.parties[currentSlot.partyIndex] : null
      return (
        <div style={surface}>
          {lifeHeader('🎲', draft.title)}
          <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>
            Round {currentSlot?.round ?? '—'} of {draft.rounds} · Pick {draft.picks.length + 1} of {order.length}
          </div>
          {currentParty && (
            <div style={{ background:'rgba(132,204,22,.08)', border:'1px solid rgba(132,204,22,.2)', borderRadius:6, padding:'6px 10px', marginBottom:10, fontSize:11 }}>
              {currentParty.isUser
                ? <span style={{ color:'#84cc16', fontWeight:700 }}>🎯 Your turn to pick!</span>
                : <span style={{ color:'#94a3b8' }}>⏳ Waiting for {currentParty.name}…</span>}
            </div>
          )}
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', width:'100%', fontSize:11 }}>
              <thead>
                <tr>{draft.parties.map((p,i) => <th key={i} style={{ padding:'3px 8px', color: p.isUser ? '#84cc16' : '#94a3b8', fontWeight:600, borderBottom:'1px solid #334155', textAlign:'left' }}>{p.name}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from({ length: draft.rounds }, (_, ri) => (
                  <tr key={ri}>
                    {draft.parties.map((_, pi) => {
                      const pick = draft.picks.find(p => p.round === ri+1 && p.partyIndex === pi)
                      return <td key={pi} style={{ padding:'3px 8px', color: pick ? '#e2e8f0' : '#334155', fontSize:11 }}>{pick ? pick.item : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    case 'draft_results': {
      const draft = (data.drafts||[]).find(d => d.id === block.props?.draftId && d.status === 'completed') || (data.drafts||[]).find(d => d.status === 'completed')
      if (!draft) return <div style={{ ...surface, color:'#475569', fontSize:12, fontStyle:'italic' }}>No completed drafts</div>
      return (
        <div style={surface}>
          {lifeHeader('🏆', `${draft.title} — Results`)}
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse', width:'100%', fontSize:11 }}>
              <thead>
                <tr>{draft.parties.map((p,i) => <th key={i} style={{ padding:'3px 8px', color: p.isUser ? '#84cc16' : '#94a3b8', fontWeight:600, borderBottom:'1px solid #334155', textAlign:'left' }}>{p.name}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from({ length: draft.rounds }, (_, ri) => (
                  <tr key={ri}>
                    {draft.parties.map((_, pi) => {
                      const pick = draft.picks.find(p => p.round === ri+1 && p.partyIndex === pi)
                      return <td key={pi} style={{ padding:'3px 8px', color: pick ? '#e2e8f0' : '#334155', fontSize:11 }}>{pick ? pick.item : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    case 'space_mailer': {
      const ml = (data.mailingLists||[]).find(l => l.id === block.props?.listId) || (data.mailingLists||[])[0]
      const btnLabel = block.props?.buttonLabel || 'Sign Up'
      const fields = ml?.fields || {}
      return (
        <div style={surface}>
          {lifeHeader('📬', ml?.name || 'Sign-Up Form')}
          {ml?.description && <div style={{ fontSize:11, color:'#94a3b8', marginBottom:8 }}>{ml.description}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
            <div style={{ ...bar(140), borderRadius:4, height:28 }} />
            {fields.email?.enabled !== false && <div style={{ ...bar(180), borderRadius:4, height:28 }} />}
            {fields.phone?.enabled && <div style={{ ...bar(140), borderRadius:4, height:28 }} />}
          </div>
          {ml && (ml.roles||[]).length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
              {(ml.roles||[]).slice(0,4).map(r => (
                <span key={r.id} style={{ fontSize:10, background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'2px 8px', color:'#94a3b8' }}>{r.emoji} {r.label}</span>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ background:'var(--accent,#84cc16)', color:'#0f172a', borderRadius:6, padding:'6px 16px', fontSize:12, fontWeight:700, opacity:.85 }}>{btnLabel}</div>
            {ml && <span style={{ fontSize:10, color:'#475569' }}>{(ml.memberContactIds||[]).length + (ml.entries||[]).length} sign-ups</span>}
          </div>
        </div>
      )
    }

    case 'cta_banner': return (
      <div style={{ ...surface, padding:0 }}>
        <div style={{ background:'var(--accent,#84cc16)', padding:'20px 16px', textAlign:'center', borderRadius:'0 0 6px 6px' }}>
          <div style={{ color:'var(--space-bg,#0f172a)', fontWeight:800, fontSize:15, marginBottom:4 }}>
            {block.props?.headline || 'Ready to get started?'}
          </div>
          <div style={{ color:'rgba(0,0,0,.6)', fontSize:11, marginBottom:10 }}>
            {block.props?.subtext || 'Join thousands of happy customers today.'}
          </div>
          <button style={{ background:'var(--space-bg,#0f172a)', color:'var(--accent,#84cc16)', border:'none', borderRadius:6, padding:'7px 18px', fontWeight:700, fontSize:12, cursor:'default' }}>
            {block.props?.btnLabel || 'Get Started →'}
          </button>
        </div>
      </div>
    )
    case 'testimonials': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>💬 Testimonials</div>
        {[0,1].map(i => (
          <div key={i} style={{ background:'rgba(255,255,255,.04)', borderRadius:6, padding:'10px 12px', marginBottom:i===0?8:0 }}>
            <div style={{ fontSize:11, color:'#94a3b8', lineHeight:1.5, marginBottom:6 }}>
              "{['Great service, highly recommend!','Changed the way we work completely.'][i]}"
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={circle(20, `hsl(${180+i*40} 50% 40%)`)}/>
              <span style={{ fontSize:10, color:'#64748b' }}>{['Alex C.','Priya S.'][i]}</span>
              <span style={{ marginLeft:'auto', color:'var(--accent,#84cc16)', fontSize:11 }}>★★★★★</span>
            </div>
          </div>
        ))}
      </div>
    )
    case 'team_grid': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>👥 Team</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[['Jordan M.','Founder'],['Alex C.','Design'],['Priya S.','Engineering']].map(([n,r]) => (
            <div key={n} style={{ textAlign:'center' }}>
              <div style={{ ...circle(32, `hsl(${n.charCodeAt(0)*60%360} 45% 35%)`), margin:'0 auto 4px' }}/>
              <div style={{ fontSize:10, fontWeight:600, color:'#e2e8f0' }}>{n}</div>
              <div style={{ fontSize:9, color:'#64748b' }}>{r}</div>
            </div>
          ))}
        </div>
      </div>
    )
    case 'pricing_table': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>💰 Pricing</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[['Starter','Free'],['Pro','$29/mo'],['Enterprise','Custom']].map(([tier,price],i) => (
            <div key={tier} style={{ background: i===1 ? 'var(--accent,#84cc16)' : 'rgba(255,255,255,.04)', borderRadius:6, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, color: i===1 ? 'var(--space-bg,#0f172a)' : '#94a3b8', marginBottom:4 }}>{tier}</div>
              <div style={{ fontSize:14, fontWeight:800, color: i===1 ? 'var(--space-bg,#0f172a)' : 'var(--accent,#84cc16)' }}>{price}</div>
            </div>
          ))}
        </div>
      </div>
    )
    case 'services_list': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>📋 Services</div>
        {[['Web Design','$500+'],['Brand Identity','$800+'],['Consulting','$150/hr']].map(([s,p]) => (
          <div key={s} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #334155' }}>
            <span style={{ fontSize:12, color:'#e2e8f0' }}>{s}</span>
            <span style={{ fontSize:11, color:'var(--accent,#84cc16)', fontWeight:600 }}>{p}</span>
          </div>
        ))}
      </div>
    )
    case 'faq_accordion': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>❓ FAQ</div>
        {['How do I get started?','What is your refund policy?','Do you offer support?'].map((q,i) => (
          <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#e2e8f0' }}>{q}</span>
            <span style={{ color:'#475569', fontSize:12 }}>{i===0?'▾':'▸'}</span>
          </div>
        ))}
      </div>
    )
    case 'gallery_grid': {
      const gcols = parseInt(block.props?.columns)||3
      return (
        <div style={{ ...surface, padding:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${gcols},1fr)`, gap:4 }}>
            {Array.from({length:6}).map((_,i) => (
              <div key={i} style={{ aspectRatio:'1', background:`hsl(${200+i*25} 30% 22%)`, borderRadius:3 }}/>
            ))}
          </div>
        </div>
      )
    }
    case 'product_grid': {
      const pcols = parseInt(block.props?.columns)||3
      return (
        <div style={surface}>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${pcols},1fr)`, gap:8 }}>
            {Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,.04)', borderRadius:6, overflow:'hidden' }}>
                <div style={{ height:48, background:`hsl(${220+i*20} 30% 20%)` }}/>
                <div style={{ padding:'6px 8px' }}>
                  <div style={bar('80%',5,'#334155')}/>
                  {block.props?.showPrice !== false && <div style={{ fontSize:10, color:'var(--accent,#84cc16)', marginTop:4, fontWeight:700 }}>${(i+1)*29}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'contact_form': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>📬 Contact</div>
        {['Name','Email','Message'].map(f => (
          <div key={f} style={{ background:'rgba(255,255,255,.04)', borderRadius:4, padding:'7px 10px', marginBottom:6, fontSize:11, color:'#475569' }}>{f}</div>
        ))}
        <button style={{ ...primaryBtn, width:'100%', marginTop:4 }}>Send Message</button>
      </div>
    )
    case 'hours_table': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>⏰ Hours</div>
        {[['Mon–Fri','9:00 AM – 6:00 PM'],['Saturday','10:00 AM – 4:00 PM'],['Sunday','Closed']].map(([d,h]) => (
          <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #334155' }}>
            <span style={{ fontSize:11, color:'#94a3b8' }}>{d}</span>
            <span style={{ fontSize:11, color: h==='Closed'?'#ef4444':'var(--accent,#84cc16)', fontWeight:600 }}>{h}</span>
          </div>
        ))}
      </div>
    )
    case 'map_embed': return (
      <div style={{ ...surface, padding:0 }}>
        <div style={{ height:100, background:'#1e293b', borderRadius:'0 0 6px 6px', position:'relative', overflow:'hidden' }}>
          {Array.from({length:5}).map((_,i) => (
            <div key={`h${i}`} style={{ position:'absolute', left:0, right:0, top:`${i*25}%`, height:1, background:'#334155' }}/>
          ))}
          {Array.from({length:5}).map((_,i) => (
            <div key={`v${i}`} style={{ position:'absolute', top:0, bottom:0, left:`${i*25}%`, width:1, background:'#334155' }}/>
          ))}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:20 }}>📍</div>
          <div style={{ position:'absolute', bottom:6, left:0, right:0, textAlign:'center', fontSize:10, color:'#64748b' }}>
            {block.props?.address || 'Seattle, WA'}
          </div>
        </div>
      </div>
    )
    case 'menu_section': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>🍽 Menu</div>
        {['Starters','Mains','Desserts'].map((cat,si) => (
          <div key={cat} style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--accent,#84cc16)', marginBottom:5 }}>{cat}</div>
            {[0,1].map(i => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid #334155' }}>
                <div style={bar(`${[70,55][i]}%`,5)}/>
                <span style={{ fontSize:10, color:'var(--accent,#84cc16)', fontWeight:600 }}>${si*10+i*5+8}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
    case 'booking_form': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>📅 {block.props?.title || 'Book Appointment'}</div>
        {['Select Date','Select Time','Your Name','Email'].map(f => (
          <div key={f} style={{ background:'rgba(255,255,255,.04)', borderRadius:4, padding:'7px 10px', marginBottom:6, fontSize:11, color:'#475569' }}>{f}</div>
        ))}
        <button style={{ ...primaryBtn, width:'100%', marginTop:4 }}>Book Now</button>
      </div>
    )
    case 'events_calendar': return (
      <div style={surface}>
        <div style={{ fontWeight:600, fontSize:12, color:'#94a3b8', marginBottom:10 }}>📆 Upcoming Events</div>
        {[['May 20','Opening Night','8:00 PM'],['Jun 5','Live Q&A','7:00 PM'],['Jun 15','Workshop','10:00 AM']].map(([d,n,t]) => (
          <div key={d} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 0', borderBottom:'1px solid #334155' }}>
            <div style={{ textAlign:'center', minWidth:34 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--accent,#84cc16)' }}>{d.split(' ')[1]}</div>
              <div style={{ fontSize:9, color:'#64748b', textTransform:'uppercase' }}>{d.split(' ')[0]}</div>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{n}</div>
              <div style={{ fontSize:10, color:'#64748b' }}>{t}</div>
            </div>
          </div>
        ))}
      </div>
    )
    case 'newsletter_signup': return (
      <div style={{ ...surface, textAlign:'center', padding:'16px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>✉️ Stay in the loop</div>
        <div style={{ fontSize:11, color:'#64748b', marginBottom:12 }}>Get updates delivered to your inbox.</div>
        <div style={{ display:'flex', gap:6 }}>
          <input disabled style={{ flex:1, background:'rgba(255,255,255,.06)', border:'1px solid #334155', borderRadius:4, padding:'7px 10px', color:'#94a3b8', fontSize:11 }} placeholder="your@email.com" />
          <button style={{ ...primaryBtn, flexShrink:0 }}>{block.props?.btnLabel || 'Subscribe'}</button>
        </div>
      </div>
    )

    default: return (
      <div style={{ ...surface, color:'#475569', fontSize:12, fontStyle:'italic', textAlign:'center' }}>
        {block.type} block
      </div>
    )
  }
}

// ── CanvasBlock ───────────────────────────────────────────────────────────────
function CanvasBlock({ block, isSelected, onClick, data, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, previewMode }) {
  if (previewMode) {
    return (
      <div style={{ marginBottom:8, borderRadius:8, overflow:'hidden', opacity:block.visible?1:0 }}>
        <BlockPreview block={block} data={data} />
      </div>
    )
  }
  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(block.id) }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(block.id) }}
      onDrop={e => { e.preventDefault(); onDrop(block.id) }}
      onDragEnd={onDragEnd}
      style={{ position:'relative', marginBottom:8,
        border:`2px solid ${isDragOver?'var(--accent,#84cc16)':isSelected?'var(--accent,#84cc16)':'transparent'}`,
        borderRadius:8, cursor:'pointer',
        opacity: isDragging ? 0.35 : block.visible ? 1 : 0.38,
        transition:'border-color .12s, opacity .2s',
        boxShadow: isDragOver ? '0 0 0 1px var(--accent,#84cc16)' : 'none' }}>
      <div style={{ height:22, background:isSelected?'rgba(132,204,22,.08)':'#1e293b', borderBottom:'1px solid #334155',
        display:'flex', alignItems:'center', padding:'0 10px', gap:6, borderRadius:'6px 6px 0 0' }}>
        <span style={{ fontSize:12, color:'#475569', cursor: isDragging ? 'grabbing' : 'grab' }}>⠿</span>
        <span style={{ fontSize:11, color:'#64748b', flex:1 }}>{block.label||block.type}</span>
        {!block.visible && <span style={{ fontSize:9, color:'#ef4444' }}>hidden</span>}
      </div>
      <BlockPreview block={block} data={data} />
    </div>
  )
}

// ── PropControl ───────────────────────────────────────────────────────────────
function PropControl({ field, value, onChange }) {
  if (field.type === 'select') return (
    <div style={propRow}>
      <label style={propLabel}>{field.label}</label>
      <select value={value||field.options[0]} onChange={e=>onChange(e.target.value)} style={propSelect}>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
  if (field.type === 'toggle') return (
    <div style={propRow}>
      <label style={propLabel}>{field.label}</label>
      <button onClick={()=>onChange(!value)} style={toggleStyle(!!value)}><div style={toggleKnob(!!value)}/></button>
    </div>
  )
  if (field.type === 'number') return (
    <div style={propRow}>
      <label style={propLabel}>{field.label}</label>
      <input type="number" value={value||''} min={field.min} max={field.max}
        onChange={e=>onChange(Number(e.target.value))} style={{ ...propInput, width:60, flex:'none' }}/>
    </div>
  )
  if (field.type === 'text') return (
    <div style={propRow}>
      <label style={propLabel}>{field.label}</label>
      <input type="text" value={value||''} placeholder={field.label}
        onChange={e=>onChange(e.target.value)} style={propInput}/>
    </div>
  )
  if (field.type === 'gradient') {
    const grads = [
      'linear-gradient(135deg,#2d1b69,#1e3a5f)',
      'linear-gradient(135deg,#0a4a2a,#0d3320)',
      'linear-gradient(135deg,#4a1a0a,#2a1012)',
      'linear-gradient(135deg,#0a0a2a,#1a0a2a)',
    ]
    return (
      <div style={propRow}>
        <label style={propLabel}>{field.label}</label>
        <div style={{ display:'flex', gap:6 }}>
          {grads.map((g,i) => (
            <div key={i} onClick={()=>onChange(g)}
              style={{ width:22, height:22, borderRadius:4, background:g, cursor:'pointer', border:`2px solid ${value===g?'#84cc16':'transparent'}` }}/>
          ))}
        </div>
      </div>
    )
  }
  return null
}

// ── RightPanel ────────────────────────────────────────────────────────────────
function RightPanel({ selectedBlock, user, onUpdateBlock, onUpdateUser, onDuplicate, onDelete, onMoveToPage, spacePages, activePage }) {
  if (selectedBlock) {
    const schema = BLOCK_PROPS_SCHEMA[selectedBlock.type] || []
    const otherPages = (spacePages||[]).filter(p => p.id !== activePage)
    return (
      <div style={{ width:260, flexShrink:0, borderLeft:'1px solid #334155', overflowY:'auto', padding:16 }}>
        <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9', marginBottom:10 }}>{selectedBlock.label||selectedBlock.type}</div>
        {/* Block actions */}
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          <button onClick={onDuplicate} style={{ ...ghostBtn, flex:1, fontSize:11 }}>⧉ Duplicate</button>
          <button onClick={onDelete} style={{ ...ghostBtn, flex:1, fontSize:11, color:'#ef4444', borderColor:'#7f1d1d' }}>✕ Delete</button>
        </div>
        <div style={propRow}>
          <label style={propLabel}>Label</label>
          <input value={selectedBlock.label||''} onChange={e=>onUpdateBlock(selectedBlock.id,{label:e.target.value})} style={propInput}/>
        </div>
        <div style={propRow}>
          <label style={propLabel}>Visible</label>
          <button onClick={()=>onUpdateBlock(selectedBlock.id,{visible:!selectedBlock.visible})} style={toggleStyle(selectedBlock.visible)}>
            <div style={toggleKnob(selectedBlock.visible)}/>
          </button>
        </div>
        {otherPages.length > 0 && (
          <div style={propRow}>
            <label style={propLabel}>Move to page</label>
            <select defaultValue="" onChange={e=>{ if(e.target.value) onMoveToPage(selectedBlock.id, e.target.value) }} style={propSelect}>
              <option value="">— select —</option>
              {otherPages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        )}
        {schema.map(field => (
          <PropControl key={field.key} field={field}
            value={selectedBlock.props?.[field.key]}
            onChange={val=>onUpdateBlock(selectedBlock.id,{props:{...selectedBlock.props,[field.key]:val}})}/>
        ))}
        {schema.length===0 && <div style={{ fontSize:12, color:'#475569', marginTop:8 }}>No additional properties.</div>}
      </div>
    )
  }
  return (
    <div style={{ width:260, flexShrink:0, borderLeft:'1px solid #334155', overflowY:'auto', padding:16 }}>
      <div style={panelTitle}>Page Theme</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
        {Object.entries(THEMES).map(([key,vars]) => (
          <button key={key} onClick={()=>onUpdateUser({spaceTheme:key})}
            style={{ border:`2px solid ${user.spaceTheme===key?vars['--accent']:'#334155'}`,
              borderRadius:8, padding:'8px 6px', cursor:'pointer', background:vars['--space-surface'], textAlign:'center' }}>
            <div style={{ display:'flex', gap:4, marginBottom:5, justifyContent:'center' }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:vars['--accent'] }}/>
              <div style={{ flex:1, height:12, background:vars['--space-bg'], borderRadius:2 }}/>
            </div>
            <div style={{ fontSize:11, color:'#e2e8f0', fontWeight:600 }}>{key.charAt(0).toUpperCase()+key.slice(1)}</div>
            {user.spaceTheme===key && <div style={{ fontSize:10, color:vars['--accent'], marginTop:2 }}>✓ active</div>}
          </button>
        ))}
      </div>
      <div style={panelTitle}>Page Spacing</div>
      {['Compact','Comfortable','Spacious'].map(s => (
        <div key={s} style={{ padding:'7px 10px', fontSize:12, color:'#64748b', borderRadius:4, cursor:'pointer', marginBottom:4, border:'1px solid #1e293b' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#1e293b'}>
          {s}
        </div>
      ))}
    </div>
  )
}

// ── ContactsOverlay ───────────────────────────────────────────────────────────
function ContactsOverlay({ connections, search, setSearch, onClose }) {
  const filtered = (connections||[]).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.includes(search.toLowerCase())
  )
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,.55)' }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:300, background:'#1e293b',
        border:'1px solid #334155', zIndex:50, display:'flex', flexDirection:'column',
        boxShadow:'-4px 0 24px rgba(0,0,0,.5)' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>Contacts</div>
          <button onClick={onClose} style={{ ...iconBtn, fontSize:18 }}>✕</button>
        </div>
        <input placeholder="Search connections…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ margin:12, padding:'7px 12px', background:'#0f172a', border:'1px solid #334155', borderRadius:6, color:'#f1f5f9', fontSize:12 }}/>
        <div style={{ flex:1, overflowY:'auto', padding:'0 12px 12px' }}>
          {filtered.length===0 && <div style={{ color:'#475569', fontSize:12, padding:'12px 4px' }}>No results</div>}
          {filtered.map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 4px', borderBottom:'1px solid #1e293b' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:c.avatar||'linear-gradient(135deg,#a78bfa,#60a5fa)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {c.name.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#e2e8f0' }}>{c.name}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>@{c.handle}</div>
              </div>
              <span style={{ fontSize:10, color:'#475569', background:'#0f172a', borderRadius:4, padding:'2px 7px' }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function SpaceEditor() {
  const nav = useNavigate()
  const {
    data, updateUser,
    addSpacePage,
    addSpaceBlock, updateSpaceBlock, deleteSpaceBlock, reorderSpaceBlocks, moveSpaceBlock, restorePageBlocks,
  } = useStore()

  const { user, spacePages=[], spaceBlocks=[], connections=[], spaceGroups=[] } = data

  const [activePage, setActivePage]     = useState(spacePages[0]?.id || 'spage-wall')
  const [selectedId, setSelectedId]     = useState(null)
  const [openAcc, setOpenAcc]           = useState(['layout'])
  const [leftTab, setLeftTab]           = useState({ layout:'blocks', content:'upload' })
  const [openLifeApps, setOpenLifeApps] = useState(new Set(['Fitness']))
  const [viewport, setViewport]         = useState('desktop')
  const [showContacts, setShowContacts] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [toast, setToast]               = useState(null)
  const [dragId, setDragId]             = useState(null)
  const [dragOver, setDragOver]         = useState(null)
  const [blockSearch, setBlockSearch]   = useState('')
  // Phase 2 — Add Page modal
  const [showAddPage, setShowAddPage]   = useState(false)
  const [newPagePreset, setNewPagePreset] = useState(null)
  const [newPageName, setNewPageName]   = useState('')
  // Phase 2 — Preview mode
  const [previewMode, setPreviewMode]   = useState(false)
  // Phase 2 — History
  const [undoStack, setUndoStack]       = useState([])
  const [redoStack, setRedoStack]       = useState([])
  const [showHistory, setShowHistory]   = useState(false)
  // Phase 2 — Save template popover
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  // Phase 2 — Import ref
  const importRef = useRef(null)

  const activePg    = spacePages.find(p => p.id === activePage) || spacePages[0]
  const activeSlug  = activePg?.slug || 'wall'
  const pageBlocks  = (activePg?.blocks || []).map(bid => spaceBlocks.find(b => b.id === bid)).filter(Boolean)
  const selectedBlock = spaceBlocks.find(b => b.id === selectedId) || null
  const paletteBlocks = BLOCK_TYPES[activeSlug] || []

  const canvasTheme = THEMES[user.spaceTheme] || THEMES.default

  // Block search filtering
  const blockQ = blockSearch.toLowerCase()
  const filteredPalette = blockQ
    ? paletteBlocks.filter(bt => bt.label.toLowerCase().includes(blockQ) || bt.type.includes(blockQ))
    : paletteBlocks
  const filteredLifeGroups = blockQ
    ? LIFE_BLOCK_GROUPS.map(g => ({ ...g, blocks: g.blocks.filter(b => b.label.toLowerCase().includes(blockQ) || b.type.includes(blockQ)) })).filter(g => g.blocks.length > 0)
    : LIFE_BLOCK_GROUPS

  function toggleAcc(key) {
    setOpenAcc(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key])
  }

  function handleAddBlock(type, label) {
    pushHistory('Add block')
    const id = addSpaceBlock({ pageId: activePage, type, label: label || type })
    setSelectedId(id)
  }

  function handleDeleteBlock(id) {
    pushHistory('Delete block')
    if (selectedId === id) setSelectedId(null)
    deleteSpaceBlock(id)
  }

  function handleToggleVisible(id) {
    const b = spaceBlocks.find(b => b.id === id)
    if (b) updateSpaceBlock(id, { visible: !b.visible })
  }

  function handleMove(blockId, dir) {
    pushHistory('Move block')
    const ids = [...(activePg?.blocks || [])]
    const idx = ids.indexOf(blockId)
    if (dir==='up' && idx>0)             { [ids[idx-1],ids[idx]] = [ids[idx],ids[idx-1]]; reorderSpaceBlocks(activePage,ids) }
    if (dir==='down' && idx<ids.length-1){ [ids[idx],ids[idx+1]] = [ids[idx+1],ids[idx]]; reorderSpaceBlocks(activePage,ids) }
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return }
    pushHistory('Reorder blocks')
    const ids = [...(activePg?.blocks || [])]
    const from = ids.indexOf(dragId)
    const to   = ids.indexOf(targetId)
    if (from === -1 || to === -1) { setDragId(null); setDragOver(null); return }
    ids.splice(from, 1)
    ids.splice(to, 0, dragId)
    reorderSpaceBlocks(activePage, ids)
    setDragId(null); setDragOver(null)
  }

  function handleDuplicateBlock() {
    if (!selectedBlock) return
    pushHistory('Duplicate block')
    const id = addSpaceBlock({
      pageId: activePage,
      type: selectedBlock.type,
      label: (selectedBlock.label || selectedBlock.type) + ' (copy)',
      props: { ...(selectedBlock.props || {}) },
      visible: selectedBlock.visible,
    })
    setSelectedId(id)
    showToast('Block duplicated')
  }

  function handleMoveToPage(blockId, toPageId) {
    pushHistory('Move to page')
    moveSpaceBlock(blockId, activePage, toPageId)
    if (selectedId === blockId) setSelectedId(null)
    showToast('Block moved')
  }

  function handleAddPage() {
    setNewPagePreset(null)
    setNewPageName('')
    setShowAddPage(true)
  }

  function handleConfirmAddPage() {
    const label = newPageName.trim() || 'Page'
    let icon = '📄'
    let blocks = []
    if (newPagePreset?.startsWith('_template_')) {
      const tplId = newPagePreset.slice('_template_'.length)
      try {
        const templates = JSON.parse(localStorage.getItem('ntogether-templates') || '[]')
        const tpl = templates.find(t => t.id === tplId)
        if (tpl) blocks = tpl.blocks.map(b => b.type)
      } catch {}
    } else {
      const preset = PAGE_PRESETS.find(p => p.id === newPagePreset) || PAGE_PRESETS.find(p => p.id === 'blank')
      icon = preset.icon
      blocks = preset.blocks
    }
    const id = addSpacePage({ label, slug: label.toLowerCase().replace(/ /g, '-'), icon })
    blocks.forEach(type => addSpaceBlock({ pageId: id, type, label: type.replace(/_/g, ' ') }))
    setActivePage(id)
    setSelectedId(null)
    setShowAddPage(false)
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null), 2500) }

  // ── Phase 2 helpers ────────────────────────────────────────────────────────
  function snapshot(label = 'Change') {
    return {
      ts: new Date().toISOString(),
      label,
      pageId: activePage,
      blockIds: [...(activePg?.blocks || [])],
      blockData: pageBlocks.map(b => ({ ...b, props: { ...(b.props || {}) } })),
    }
  }

  function pushHistory(label = 'Change') {
    setUndoStack(prev => [...prev.slice(-19), snapshot(label)])
    setRedoStack([])
  }

  function undo() {
    if (!undoStack.length) return
    const snap = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, snapshot('Redo point')])
    restorePageBlocks(snap.pageId, snap.blockIds, snap.blockData)
    setUndoStack(prev => prev.slice(0, -1))
    setSelectedId(null)
  }

  function redo() {
    if (!redoStack.length) return
    const snap = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev.slice(-19), snapshot('Undo point')])
    restorePageBlocks(snap.pageId, snap.blockIds, snap.blockData)
    setRedoStack(prev => prev.slice(0, -1))
    setSelectedId(null)
  }

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      page: { label: activePg?.label, slug: activePg?.slug, icon: activePg?.icon },
      blocks: pageBlocks.map(({ id: _id, pageId: _p, order: _o, ...b }) => b),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${activePg?.slug || 'page'}-layout.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const payload = JSON.parse(ev.target.result)
        if (!Array.isArray(payload.blocks)) throw new Error('invalid')
        pushHistory('Import layout')
        pageBlocks.forEach(b => deleteSpaceBlock(b.id))
        payload.blocks.forEach(b => addSpaceBlock({ pageId: activePage, type: b.type, label: b.label, props: b.props, visible: b.visible }))
        showToast('Layout imported')
      } catch { showToast('Invalid layout file') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleSaveTemplate() {
    const name = templateName.trim()
    if (!name) return
    try {
      const saved = JSON.parse(localStorage.getItem('ntogether-templates') || '[]')
      saved.push({ id: Date.now().toString(36), name, createdAt: new Date().toISOString(), blocks: pageBlocks.map(({ id: _id, pageId: _p, order: _o, ...b }) => b) })
      localStorage.setItem('ntogether-templates', JSON.stringify(saved))
    } catch {}
    setShowSaveTemplate(false)
    setTemplateName('')
    showToast(`Template "${name}" saved`)
  }

  useEffect(() => {
    function onKey(e) {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const canvasWidth = viewport==='desktop' ? '100%' : viewport==='tablet' ? 768 : 375

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0a0f1a', color:'#f1f5f9', overflow:'hidden', fontFamily:'inherit' }}>

      {/* ── Topbar ── */}
      <div style={{ height:48, flexShrink:0, display:'flex', alignItems:'center', gap:6, padding:'0 14px',
        background:'#1e293b', borderBottom:'1px solid #334155', zIndex:10 }}>
        <button style={ghostBtn} onClick={()=>nav('/monogenes')}>← MONOGENES</button>
        <span style={{ color:'#334155', margin:'0 4px' }}>|</span>
        <span style={{ fontSize:13, fontWeight:700, color:'#84cc16', letterSpacing:'.04em' }}>✦ BUILDMONOGENES</span>
        <span style={{ color:'#334155', margin:'0 6px' }}>|</span>

        {/* Page tabs */}
        <div style={{ display:'flex', gap:4, flex:1, overflow:'hidden' }}>
          {spacePages.map(p => (
            <button key={p.id} onClick={()=>{ setActivePage(p.id); setSelectedId(null) }}
              style={{ padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', flexShrink:0,
                background: activePage===p.id ? 'rgba(132,204,22,.12)' : 'transparent',
                color:       activePage===p.id ? '#84cc16' : '#64748b',
                border:`1px solid ${activePage===p.id ? '#84cc16' : 'transparent'}` }}>
              {p.icon} {p.label}
            </button>
          ))}
          <button style={{ ...ghostBtn, fontSize:18, padding:'2px 10px', lineHeight:1 }} onClick={handleAddPage} title="Add page">+</button>
        </div>

        {/* Viewport */}
        <div style={{ display:'flex', gap:2, borderLeft:'1px solid #334155', paddingLeft:10, marginLeft:6 }}>
          {[['desktop','🖥'],['tablet','📱'],['mobile','📲']].map(([vp,ic]) => (
            <button key={vp} onClick={()=>setViewport(vp)} title={vp}
              style={{ ...iconBtn, color:viewport===vp?'#84cc16':'#64748b', fontSize:14 }}>{ic}</button>
          ))}
        </div>
        <div style={{ width:1, height:18, background:'#334155', margin:'0 4px' }}/>
        {/* Undo / Redo */}
        <button onClick={undo} disabled={!undoStack.length} title="Undo (Ctrl+Z)"
          style={{ ...ghostBtn, opacity:undoStack.length?1:0.4, padding:'5px 8px' }}>↩</button>
        <button onClick={redo} disabled={!redoStack.length} title="Redo (Ctrl+Y)"
          style={{ ...ghostBtn, opacity:redoStack.length?1:0.4, padding:'5px 8px' }}>↪</button>
        <button onClick={()=>setShowHistory(h=>!h)} title="History"
          style={showHistory?primaryBtn:ghostBtn}>🕐</button>
        <div style={{ width:1, height:18, background:'#334155', margin:'0 2px' }}/>
        {/* Export / Import / Template */}
        <button style={ghostBtn} onClick={handleExport} title="Export page as JSON">⬇ Export</button>
        <button style={ghostBtn} onClick={()=>importRef.current?.click()} title="Import JSON layout">⬆ Import</button>
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display:'none' }} onChange={handleImportFile}/>
        <div style={{ position:'relative' }}>
          <button style={ghostBtn} onClick={()=>setShowSaveTemplate(s=>!s)} title="Save page as template">⭐ Template</button>
          {showSaveTemplate && (
            <div style={{ position:'absolute', top:36, right:0, background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:12, zIndex:50, width:220, boxShadow:'0 4px 20px rgba(0,0,0,.5)' }}>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:6 }}>Template name:</div>
              <input value={templateName} onChange={e=>setTemplateName(e.target.value)}
                placeholder="e.g. My Fitness Page"
                style={{ ...propInput, width:'100%', boxSizing:'border-box', marginBottom:8 }}
                onKeyDown={e=>e.key==='Enter'&&handleSaveTemplate()}
                autoFocus />
              <div style={{ display:'flex', gap:6 }}>
                <button style={{ ...primaryBtn, flex:1 }} onClick={handleSaveTemplate}>Save</button>
                <button style={{ ...ghostBtn, flex:1 }} onClick={()=>setShowSaveTemplate(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ width:1, height:18, background:'#334155', margin:'0 2px' }}/>
        {/* Site Type toggle */}
        <div style={{ display:'flex', gap:1, background:'#0f172a', borderRadius:6, border:'1px solid #334155', padding:2 }}>
          {[['Social','social'],['Website','website']].map(([label,val]) => (
            <button key={val}
              onClick={() => updateUser({ siteType: val })}
              style={{ padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600, cursor:'pointer', border:'none',
                background: (data.user.siteType||'social')===val ? '#334155' : 'transparent',
                color:       (data.user.siteType||'social')===val ? '#f1f5f9' : '#475569' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ width:1, height:18, background:'#334155', margin:'0 2px' }}/>
        <button style={ghostBtn} onClick={()=>setShowContacts(c=>!c)}>Contacts</button>
        <button onClick={()=>setPreviewMode(p=>!p)} style={previewMode?primaryBtn:ghostBtn}>
          {previewMode ? '← Edit' : '👁 Preview'}
        </button>
        <button style={ghostBtn} onClick={()=>showToast('Changes saved')}>Save</button>
        <button style={primaryBtn} onClick={()=>showToast('✓ Your SPACE is live')}>Publish</button>
      </div>

      {/* ── 3 columns ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Left panel */}
        <div style={{ width:280, flexShrink:0, borderRight:'1px solid #334155', overflowY:'auto', display:'flex', flexDirection:'column', background:'#111827' }}>

          {/* Accordion: Page Layout */}
          <AccordionSection id="layout" title="Page Layout" isOpen={openAcc.includes('layout')} onToggle={()=>toggleAcc('layout')}>
            <SubTabs tabs={['Blocks','Layers']} active={leftTab.layout} onChange={t=>setLeftTab(p=>({...p,layout:t}))}/>
            {leftTab.layout==='Blocks' ? (
              <div>
                <div style={{ padding:'8px 10px', borderBottom:'1px solid #1a2332' }}>
                  <input value={blockSearch} onChange={e=>setBlockSearch(e.target.value)}
                    placeholder="Search blocks…"
                    style={{ width:'100%', boxSizing:'border-box', background:'#0f172a', border:'1px solid #334155',
                      borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }} />
                </div>
              <div style={{ padding:'8px 4px' }}>
                {filteredPalette.map(bt => (
                  <div key={bt.type} onClick={()=>handleAddBlock(bt.type, bt.label)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', cursor:'pointer', borderRadius:6, margin:'2px 4px' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#1e293b'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{ fontSize:15, width:22, textAlign:'center', color:'#84cc16' }}>{bt.icon}</span>
                    <span style={{ fontSize:13, color:'#e2e8f0' }}>{bt.label}</span>
                    <span style={{ marginLeft:'auto', fontSize:16, color:'#334155' }}>+</span>
                  </div>
                ))}
                {/* Life Suite section */}
                <div style={{ margin:'8px 12px 0px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ flex:1, height:1, background:'#1e293b' }}/>
                  <span style={{ fontSize:10, color:'#475569', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Life Suite</span>
                  <div style={{ flex:1, height:1, background:'#1e293b' }}/>
                </div>
                {filteredPalette.length === 0 && blockQ && <div style={{ fontSize:12, color:'#475569', padding:'8px 14px' }}>No page blocks match.</div>}
                {filteredLifeGroups.length === 0 && blockQ && <div style={{ fontSize:12, color:'#475569', padding:'8px 14px' }}>No Life Suite blocks match.</div>}
                {filteredLifeGroups.map(group => {
                  const isOpen = blockQ ? true : openLifeApps.has(group.app)
                  return (
                    <div key={group.app} style={{ borderBottom:'1px solid #1a2332' }}>
                      <div
                        onClick={() => !blockQ && setOpenLifeApps(prev => {
                          const next = new Set(prev)
                          next.has(group.app) ? next.delete(group.app) : next.add(group.app)
                          return next
                        })}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', cursor:'pointer', userSelect:'none' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:13 }}>{group.icon}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8', flex:1 }}>{group.app}</span>
                        <span style={{ fontSize:9, background:'#1e293b', color:'#64748b', borderRadius:8, padding:'1px 5px', marginRight:4 }}>{group.blocks.length}</span>
                        <span style={{ fontSize:9, color:'#475569' }}>{isOpen ? '▾' : '▸'}</span>
                      </div>
                      {isOpen && (
                        <div style={{ paddingBottom:4 }}>
                          {group.blocks.map(bt => (
                            <div key={bt.type} onClick={()=>handleAddBlock(bt.type, bt.label)}
                              style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px 5px 32px', cursor:'pointer', borderRadius:4, margin:'1px 4px' }}
                              onMouseEnter={e=>e.currentTarget.style.background='#1e293b'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <span style={{ fontSize:13, width:18, textAlign:'center', flexShrink:0 }}>{bt.icon}</span>
                              <span style={{ fontSize:12, color:'#e2e8f0', flex:1 }}>{bt.label}</span>
                              <span style={{ fontSize:14, color:'#334155' }}>+</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              </div>
            ) : (
              <div style={{ padding:'6px 0' }}>
                {pageBlocks.length===0 && <div style={{ fontSize:12, color:'#475569', padding:'12px 14px' }}>No blocks yet — add from Blocks tab.</div>}
                {pageBlocks.map((block,idx) => (
                  <div key={block.id} onClick={()=>setSelectedId(block.id===selectedId?null:block.id)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px', cursor:'pointer',
                      background:selectedId===block.id?'rgba(132,204,22,.08)':'transparent',
                      borderLeft:`3px solid ${selectedId===block.id?'#84cc16':'transparent'}` }}>
                    <span style={{ color:'#334155', fontSize:13, cursor:'grab' }}>⠿</span>
                    <span style={{ fontSize:12, flex:1, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{block.label||block.type}</span>
                    <button style={tinyBtn} disabled={idx===0} onClick={e=>{e.stopPropagation();handleMove(block.id,'up')}}
                      title="Move up">↑</button>
                    <button style={tinyBtn} disabled={idx===pageBlocks.length-1} onClick={e=>{e.stopPropagation();handleMove(block.id,'down')}}
                      title="Move down">↓</button>
                    <button style={{ ...tinyBtn, color:block.visible?'#64748b':'#475569' }} onClick={e=>{e.stopPropagation();handleToggleVisible(block.id)}}
                      title={block.visible?'Hide':'Show'}>{block.visible?'👁':'○'}</button>
                    <button style={{ ...tinyBtn, color:'#ef4444' }} onClick={e=>{e.stopPropagation();handleDeleteBlock(block.id)}}
                      title="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}
          </AccordionSection>

          {/* Accordion: Preview Layout */}
          <AccordionSection id="preview" title="Preview Layout" isOpen={openAcc.includes('preview')} onToggle={()=>toggleAcc('preview')}>
            {activeSlug!=='profile'
              ? <div style={{ fontSize:12, color:'#475569', padding:'12px 14px' }}>Only available on the Profile page.</div>
              : <>
                  <SubTabs tabs={['Wall','Feed','Info']} active={leftTab.preview||'Wall'} onChange={t=>setLeftTab(p=>({...p,preview:t}))}/>
                  <div style={{ padding:'10px 12px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {['Classic','Centered','Minimal'].map(l => (
                      <div key={l} onClick={()=>updateUser({spaceLayout:l.toLowerCase()})}
                        style={{ border:`2px solid ${data.user.spaceLayout===l.toLowerCase()?'#84cc16':'#334155'}`,
                          borderRadius:6, padding:6, cursor:'pointer', textAlign:'center' }}>
                        <div style={{ height:36, background:'#0f172a', borderRadius:4, marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                          {l==='Classic'?'⬛':'  '}{l==='Centered'?'⬛':'  '}{l==='Minimal'?'⬛':'  '}
                        </div>
                        <div style={{ fontSize:10, color:'#94a3b8' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </>
            }
          </AccordionSection>

          {/* Accordion: Content */}
          <AccordionSection id="content" title="Content" isOpen={openAcc.includes('content')} onToggle={()=>toggleAcc('content')}>
            <SubTabs tabs={['Upload','Manage','Collections']} active={leftTab.content} onChange={t=>setLeftTab(p=>({...p,content:t}))}/>
            {leftTab.content==='Upload' && (
              <div style={{ padding:12 }}>
                <div style={{ border:'2px dashed #334155', borderRadius:8, padding:'20px 12px', textAlign:'center', color:'#475569', fontSize:12, cursor:'pointer', marginBottom:10 }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>⬆</div>Drop files or click to upload
                </div>
                <input placeholder="Title" style={{ ...smallInput, marginBottom:6 }}/>
                <input placeholder="Tags (comma separated)" style={smallInput}/>
              </div>
            )}
            {leftTab.content==='Manage' && (
              <div style={{ padding:10 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
                  {Array.from({length:6}).map((_,i) => (
                    <div key={i} style={{ aspectRatio:'1', background:`hsl(${220+i*15} 25% 20%)`, borderRadius:4 }}/>
                  ))}
                </div>
              </div>
            )}
            {leftTab.content==='Collections' && (
              <div style={{ padding:'6px 0' }}>
                {(spaceGroups||[]).slice(0,4).map(g => (
                  <div key={g.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderBottom:'1px solid #1e293b' }}>
                    <span style={{ fontSize:13 }}>{g.category==='Fitness'?'🏃':g.category==='Reading'?'📚':'📁'}</span>
                    <span style={{ fontSize:12, flex:1, color:'#e2e8f0' }}>{g.name}</span>
                    <span style={{ fontSize:10, color:'#475569' }}>{g.members}</span>
                  </div>
                ))}
              </div>
            )}
          </AccordionSection>
        </div>

        {/* Canvas */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', background:'#060c18', padding:20, display:'flex', justifyContent:'center', alignItems:'flex-start' }}>
          <div style={{ width:canvasWidth, maxWidth:viewport==='desktop'?900:undefined, transition:'width .2s' }}>
            {/* Browser chrome frame */}
            <div style={{ background:'#1a2332', borderRadius:10, border:'1px solid #334155', boxShadow:'0 8px 32px rgba(0,0,0,.6)', overflow:'hidden' }}>
              {/* URL bar strip */}
              <div style={{ height:28, background:'#111827', borderBottom:'1px solid #1a2332', display:'flex', alignItems:'center', padding:'0 10px', gap:8, flexShrink:0 }}>
                <div style={{ display:'flex', gap:4 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444' }}/>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#f59e0b' }}/>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
                </div>
                <div style={{ flex:1, height:16, background:'#1e293b', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:9, color:'#475569' }}>ntogether.app/@{user.handle}</span>
                </div>
              </div>
              {/* Themed canvas body */}
              <div style={{ ...canvasTheme, background:canvasTheme['--space-bg'] || '#0f172a', minHeight:240 }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (dragId && pageBlocks.length > 0) handleDrop(pageBlocks[pageBlocks.length-1].id) }}>
                {pageBlocks.length===0 ? (
                  <div style={{ textAlign:'center', padding:'80px 24px' }}>
                    <div style={{ fontSize:44, marginBottom:12, opacity:0.2 }}>✦</div>
                    <div style={{ fontSize:16, fontWeight:600, color:'#475569', marginBottom:6 }}>No blocks yet</div>
                    <div style={{ fontSize:12, color:'#334155' }}>Click a block type in the Blocks panel to add it</div>
                  </div>
                ) : pageBlocks.map(block => (
                  <CanvasBlock key={block.id} block={block}
                    isSelected={selectedId===block.id}
                    isDragging={dragId===block.id}
                    isDragOver={dragOver===block.id && dragId!==block.id}
                    onClick={previewMode?undefined:()=>setSelectedId(block.id===selectedId?null:block.id)}
                    onDragStart={previewMode?()=>{}:id=>{ setDragId(id); setSelectedId(id) }}
                    onDragOver={previewMode?()=>{}:id=>setDragOver(id)}
                    onDrop={previewMode?()=>{}:handleDrop}
                    onDragEnd={previewMode?()=>{}:()=>{ setDragId(null); setDragOver(null) }}
                    previewMode={previewMode}
                    data={data}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        {previewMode ? (
          <div style={{ width:260, flexShrink:0, borderLeft:'1px solid #334155', padding:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#475569', fontSize:12, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:10 }}>👁</div>
            <div style={{ fontWeight:600, color:'#94a3b8', marginBottom:6 }}>Preview mode</div>
            <div>Showing visitor view.</div>
            <div style={{ marginTop:12 }}>Click <b style={{ color:'#84cc16' }}>← Edit</b> to return.</div>
          </div>
        ) : showHistory ? (
          <div style={{ width:260, flexShrink:0, borderLeft:'1px solid #334155', display:'flex', flexDirection:'column', background:'#111827' }}>
            <div style={{ padding:'12px 14px', borderBottom:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>History</span>
              <button onClick={()=>setShowHistory(false)} style={iconBtn}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
              <div style={{ padding:'8px 14px', fontSize:11, color:'var(--accent,#84cc16)', fontWeight:600, borderBottom:'1px solid #1e293b' }}>● Current</div>
              {[...undoStack].reverse().map((snap, i) => {
                const ago = Math.round((Date.now() - new Date(snap.ts).getTime()) / 60000)
                return (
                  <div key={i} onClick={()=>{ restorePageBlocks(snap.pageId, snap.blockIds, snap.blockData); setSelectedId(null); setShowHistory(false) }}
                    style={{ padding:'8px 14px', fontSize:11, color:'#94a3b8', cursor:'pointer', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1e293b' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span>↺ {snap.label}</span>
                    <span style={{ color:'#475569' }}>{ago < 1 ? 'just now' : `${ago}m`}</span>
                  </div>
                )
              })}
              {undoStack.length === 0 && <div style={{ padding:'12px 14px', fontSize:11, color:'#475569' }}>No history yet</div>}
            </div>
            <div style={{ padding:'10px 14px', borderTop:'1px solid #334155' }}>
              <button onClick={()=>{ setUndoStack([]); setRedoStack([]) }} style={{ ...ghostBtn, width:'100%', fontSize:11 }}>Clear History</button>
            </div>
          </div>
        ) : (
          <RightPanel
            selectedBlock={selectedBlock}
            user={user}
            spacePages={spacePages}
            activePage={activePage}
            onUpdateBlock={(id,patch)=>updateSpaceBlock(id,patch)}
            onUpdateUser={updateUser}
            onDuplicate={handleDuplicateBlock}
            onDelete={()=>handleDeleteBlock(selectedId)}
            onMoveToPage={handleMoveToPage}/>
        )}
      </div>

      {showContacts && (
        <ContactsOverlay connections={connections} search={contactSearch}
          setSearch={setContactSearch} onClose={()=>setShowContacts(false)}/>
      )}

      {/* Add Page modal */}
      {showAddPage && (
        <>
          <div onClick={()=>setShowAddPage(false)} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,.6)' }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:70,
            background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:24, width:460, maxWidth:'90vw',
            boxShadow:'0 12px 48px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <span style={{ fontWeight:700, fontSize:16, color:'#f1f5f9' }}>Add Page</span>
              <button onClick={()=>setShowAddPage(false)} style={iconBtn}>✕</button>
            </div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>Choose a layout preset:</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:18 }}>
              {PAGE_PRESETS.map(p => (
                <div key={p.id} onClick={()=>{ setNewPagePreset(p.id); setNewPageName(p.name) }}
                  style={{ border:`2px solid ${newPagePreset===p.id?'#84cc16':'#334155'}`, borderRadius:8, padding:'10px 6px',
                    cursor:'pointer', textAlign:'center', background:newPagePreset===p.id?'rgba(132,204,22,.06)':'#0f172a' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#e2e8f0' }}>{p.name}</div>
                  <div style={{ fontSize:9, color:'#475569', marginTop:2 }}>{p.blocks.length} blocks</div>
                </div>
              ))}
            </div>
            {/* Saved templates */}
            {(() => {
              try {
                const templates = JSON.parse(localStorage.getItem('ntogether-templates') || '[]')
                if (!templates.length) return null
                return (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>My Templates</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {templates.map(t => (
                        <div key={t.id} onClick={()=>{ setNewPagePreset('_template_'+t.id); setNewPageName(t.name) }}
                          style={{ border:`2px solid ${newPagePreset==='_template_'+t.id?'#84cc16':'#334155'}`, borderRadius:6, padding:'6px 12px',
                            cursor:'pointer', fontSize:11, color:'#e2e8f0', background:newPagePreset==='_template_'+t.id?'rgba(132,204,22,.06)':'#0f172a' }}>
                          ⭐ {t.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              } catch { return null }
            })()}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, color:'#94a3b8', display:'block', marginBottom:6 }}>Page name:</label>
              <input value={newPageName} onChange={e=>setNewPageName(e.target.value)}
                placeholder="Page name"
                style={{ ...propInput, width:'100%', boxSizing:'border-box' }}
                onKeyDown={e=>e.key==='Enter'&&handleConfirmAddPage()}/>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button style={ghostBtn} onClick={()=>setShowAddPage(false)}>Cancel</button>
              <button style={primaryBtn} onClick={handleConfirmAddPage} disabled={!newPagePreset}>Add Page →</button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:20, right:20, background:'#1e293b', border:'1px solid #84cc16',
          color:'#84cc16', borderRadius:8, padding:'10px 18px', fontSize:13, fontWeight:600,
          boxShadow:'0 4px 20px rgba(0,0,0,.4)', zIndex:200 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
