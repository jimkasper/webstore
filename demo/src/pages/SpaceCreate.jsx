import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const THEMES = {
  default:  { '--accent': '#84cc16', '--space-bg': '#0f172a', '--space-surface': '#1e293b', '--space-border': '#334155' },
  midnight: { '--accent': '#6366f1', '--space-bg': '#0f0f1a', '--space-surface': '#1a1a2e', '--space-border': '#2d2d4a' },
  sage:     { '--accent': '#4ade80', '--space-bg': '#0d1f14', '--space-surface': '#122016', '--space-border': '#1e4026' },
  sunset:   { '--accent': '#fb923c', '--space-bg': '#1a0f0a', '--space-surface': '#2a1a12', '--space-border': '#3a2218' },
  stone:    { '--accent': '#e5e7eb', '--space-bg': '#111111', '--space-surface': '#1c1c1c', '--space-border': '#2a2a2a' },
  neon:     { '--accent': '#f472b6', '--space-bg': '#0a0a1a', '--space-surface': '#111128', '--space-border': '#1e1e3a' },
}

const STEPS = ['Template', 'Design', 'Blocks', 'Install']

const TEMPLATES = [
  { id:'personal',     icon:'🙋', name:'Personal',     category:'personal',     desc:'Life goals, media, and mood',                         blocks:['hero','bio','goals_active','media_favorites','journal_mood'],     pages:['Home','About'] },
  { id:'creator',      icon:'🎨', name:'Creator',      category:'personal',     desc:'Content, work, and learning',                         blocks:['hero','bio','media_player','journal_blog','learning_skills'],     pages:['Home','Work','About'] },
  { id:'fitness',      icon:'💪', name:'Fitness',      category:'personal',     desc:'Progress, PRs, and health',                           blocks:['hero','fitness_stats','fitness_prs','fitness_challenge','health_stats'], pages:['Home','Fitness','About'] },
  { id:'developer',    icon:'💻', name:'Developer',    category:'personal',     desc:'Skills, research, and resources',                     blocks:['bio','learning_skills','learning_currently','research_topic','goals_active'], pages:['Home','Work','About'] },
  { id:'professional', icon:'💼', name:'Professional', category:'personal',     desc:'Plans, goals, and achievements',                      blocks:['hero','bio','stats','planner_plans','goals_active'],             pages:['Home','About','Contact'] },
  { id:'restaurant',   icon:'🍽', name:'Restaurant',   category:'business',     desc:'Menu, hours, reservations, and your story',           blocks:['hero','cta_banner','bio','hours_table','contact_form'],           pages:['Home','Menu','About','Hours','Contact'] },
  { id:'portfolio',    icon:'🎨', name:'Portfolio',    category:'creative',     desc:'Showcase your work and attract clients',               blocks:['hero','gallery_grid','bio','services_list','contact_form'],       pages:['Home','Work','About','Contact'] },
  { id:'ecommerce',    icon:'🛍', name:'E-commerce',   category:'business',     desc:'Products, pricing, and seamless purchasing',          blocks:['hero','product_grid','pricing_table','testimonials','contact_form'], pages:['Home','Shop','About','Contact'] },
  { id:'podcast',      icon:'🎙', name:'Podcast',      category:'creative',     desc:'Episodes, show notes, and listener community',        blocks:['hero','media_player','media_favorites','bio','newsletter_signup'], pages:['Home','Episodes','About','Contact'] },
  { id:'blog',         icon:'📝', name:'Blog',         category:'creative',     desc:'Articles, newsletter, and thought leadership',        blocks:['hero','journal_blog','journal_highlights','bio','newsletter_signup'], pages:['Home','Archive','About','Contact'] },
  { id:'nonprofit',    icon:'🤝', name:'Nonprofit',    category:'organization', desc:'Mission, impact, and donor engagement',               blocks:['hero','cta_banner','testimonials','team_grid','contact_form'],    pages:['Home','Mission','Team','Contact'] },
  { id:'freelancer',   icon:'💼', name:'Freelancer',   category:'business',     desc:'Services, rates, and client testimonials',            blocks:['hero','services_list','pricing_table','testimonials','contact_form'], pages:['Home','Services','Work','Contact'] },
  { id:'artist',       icon:'🎭', name:'Artist',       category:'creative',     desc:'Gallery, events, and collector contact',              blocks:['hero','gallery_grid','events_calendar','bio','contact_form'],     pages:['Home','Gallery','Events','About','Contact'] },
]

const LIFE_BLOCK_GROUPS = [
  { app:'Fitness',  icon:'💪', blocks:[{type:'fitness_stats',label:'Stats'},{type:'fitness_prs',label:'PRs'},{type:'fitness_challenge',label:'Challenge'},{type:'fitness_activity_log',label:'Activity Log'}] },
  { app:'Health',   icon:'❤️', blocks:[{type:'health_stats',label:'Metrics'},{type:'health_mood',label:'Mood Chart'}] },
  { app:'Goals',    icon:'🎯', blocks:[{type:'goals_active',label:'Active Goals'},{type:'goals_challenge',label:'Challenge'},{type:'planner_upcoming',label:'Upcoming'},{type:'planner_plans',label:'Plans'}] },
  { app:'Journal',  icon:'📓', blocks:[{type:'journal_mood',label:'Mood'},{type:'journal_post',label:'Publish Post'},{type:'journal_blog',label:'Blog'},{type:'journal_highlights',label:'Highlights'}] },
  { app:'Learning', icon:'📚', blocks:[{type:'learning_skills',label:'Skills'},{type:'learning_currently',label:'Currently'},{type:'learning_resources',label:'Resources'}] },
  { app:'Media',    icon:'🎬', blocks:[{type:'media_player',label:'Player'},{type:'media_now',label:'Now'},{type:'media_favorites',label:'Favorites'},{type:'media_watchlist',label:'Watchlist'}] },
  { app:'Finance',  icon:'💰', blocks:[{type:'finance_summary',label:'Summary'},{type:'finance_goals',label:'Saving Goal'}] },
  { app:'Lists',    icon:'📝', blocks:[{type:'lists_checklist',label:'Checklist'},{type:'lists_bucket',label:'Bucket List'},{type:'lists_travel',label:'Travel'}] },
  { app:'Research', icon:'🔬', blocks:[{type:'research_topic',label:'Topic'},{type:'research_findings',label:'Findings'}] },
  { app:'Website',  icon:'🌐', blocks:[
    {type:'cta_banner',label:'CTA Banner'},{type:'testimonials',label:'Testimonials'},
    {type:'team_grid',label:'Team Grid'},{type:'pricing_table',label:'Pricing Table'},
    {type:'services_list',label:'Services'},{type:'faq_accordion',label:'FAQ'},
    {type:'gallery_grid',label:'Gallery'},{type:'product_grid',label:'Products'},
    {type:'contact_form',label:'Contact Form'},{type:'hours_table',label:'Business Hours'},
    {type:'map_embed',label:'Map'},{type:'menu_section',label:'Menu'},
    {type:'booking_form',label:'Booking'},{type:'events_calendar',label:'Events'},
    {type:'newsletter_signup',label:'Newsletter'},
  ]},
]

const PLATFORM_GUIDES = [
  { id:'wordpress',   icon:'🔷', name:'WordPress',    time:'~5 min', diff:'Easy',   steps:['Go to wp-admin → Plugins → Add New → search "Barbelo"','Activate, then go to Settings → Barbelo Space','Enter your handle: jordan','Add [barbelo-space handle="jordan"] to any page/post'] },
  { id:'webflow',     icon:'🌊', name:'Webflow',      time:'~3 min', diff:'Easy',   steps:['Open your Webflow project','Add an Embed element to your page','Paste the HTML embed code','Publish your site'] },
  { id:'squarespace', icon:'⬛', name:'Squarespace',  time:'~3 min', diff:'Easy',   steps:['Go to Pages → edit your page','Add a Code Block widget','Paste the embed snippet','Save and publish'] },
  { id:'wix',         icon:'🔵', name:'Wix',          time:'~3 min', diff:'Easy',   steps:['Open Wix Editor','Add → Embed → Custom Code','Paste your embed snippet','Publish your site'] },
  { id:'ghost',       icon:'👻', name:'Ghost',        time:'~5 min', diff:'Easy',   steps:['Go to your Ghost admin panel','Create or edit a page','Switch to HTML view','Paste the embed snippet and publish'] },
  { id:'framer',      icon:'🖼', name:'Framer',       time:'~2 min', diff:'Easy',   steps:['Open your Framer project','Insert a Code component','Paste the embed snippet','Publish'] },
  { id:'shopify',     icon:'🛍', name:'Shopify',      time:'~5 min', diff:'Medium', steps:['Go to Online Store → Themes → Edit code','Open the template where you want to embed','Paste the HTML snippet','Save'] },
  { id:'react',       icon:'⚛️', name:'React / Next', time:'~10 min', diff:'Dev',   steps:['npm install @barbelo/space-widget','Import SpaceWidget from @barbelo/space-widget','Add <SpaceWidget handle="your-handle" /> to your component','Set NTOGETHER_KEY env var'] },
]

const ghostBtn  = { background:'transparent', border:'1px solid #334155', color:'#94a3b8', borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer' }
const primaryBtn= { background:'#84cc16', color:'#0f172a', border:'none', borderRadius:6, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }

export default function SpaceCreate() {
  const nav = useNavigate()
  const { data, updateUser, addSpaceBlock, addSpacePage } = useStore()
  const { user, spacePages = [], spaceBlocks = [] } = data

  const [step, setStep]                       = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [tplCategory, setTplCategory]         = useState('all')
  const [selectedBlocks, setSelectedBlocks]   = useState(new Set(['hero','bio']))
  const [installTab, setInstallTab]           = useState('embed')
  const [copied, setCopied]                   = useState(null)
  const [openApps, setOpenApps]               = useState(new Set(['Fitness','Goals','Media']))
  const [selectedPlatform, setSelectedPlatform] = useState('wordpress')
  const [applied, setApplied]                 = useState(false)
  const [embedVariant, setEmbedVariant]       = useState('minimal')
  const [npmFramework, setNpmFramework]       = useState('react')
  const [embedConfig, setEmbedConfig]         = useState({
    apiKey: '', privacy: 'public', width: 'full', height: 'auto',
    showHeader: true, showFooter: true, allowComments: true, env: 'production',
  })

  const theme = THEMES[user.spaceTheme] || THEMES.default
  const handle = user.handle || 'jordan'

  function copyText(text, key) {
    try { navigator.clipboard.writeText(text) } catch {}
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function getEmbedSnippet(variant) {
    const blockList = [...selectedBlocks].join(',')
    if (variant === 'minimal') return `<!-- Barbelo Space Widget -->
<script src="https://cdn.barbelo.app/widget.js" defer></script>
<div class="barbelo-space" data-handle="${handle}"></div>`

    if (variant === 'full') return `<!-- Barbelo Space Widget v2.4 -->
<link rel="stylesheet" href="https://cdn.barbelo.app/widget.css">
<script src="https://cdn.barbelo.app/widget.js" defer></script>
<div class="barbelo-space"
     data-handle="${handle}"
     data-theme="${user.spaceTheme || 'default'}"
     data-blocks="${blockList}"
     data-layout="${user.spaceLayout || 'classic'}"
     data-privacy="${embedConfig.privacy}"${embedConfig.apiKey ? `\n     data-api-key="${embedConfig.apiKey}"` : ''}>
</div>`

    return `<!-- Download widget files from barbelo.app/download/widget -->
<link rel="stylesheet" href="/assets/ntogether-widget.css">
<script src="/assets/ntogether-widget.js" defer></script>
<div class="barbelo-space" data-handle="${handle}" data-offline="true"></div>`
  }

  function downloadHtml() {
    const blockList = [...selectedBlocks].join(',')
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${user.name} — Barbelo Space</title>
  <link rel="stylesheet" href="https://cdn.barbelo.app/widget.css">
</head>
<body>
  <script src="https://cdn.barbelo.app/widget.js" defer></script>
  <div class="barbelo-space"
       data-handle="${handle}"
       data-theme="${user.spaceTheme || 'default'}"
       data-blocks="${blockList}">
  </div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ntogether-embed.html'; a.click()
    URL.revokeObjectURL(url)
  }

  function applyToSpace() {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
    const isWebsite = tpl && ['restaurant','ecommerce','nonprofit','freelancer','portfolio','podcast','blog','artist'].includes(tpl.id)

    if (isWebsite) updateUser({ siteType: 'website' })
    else updateUser({ siteType: 'social' })

    if (tpl && tpl.pages && tpl.pages.length > 0) {
      // Create one page per template page with matching blocks
      tpl.pages.forEach((pageName, idx) => {
        const slug = pageName.toLowerCase().replace(/ /g, '-')
        const pageId = addSpacePage({ label: pageName, slug, icon: idx === 0 ? '🏠' : '📄' })
        if (idx === 0) {
          // First page gets the selected blocks
          selectedBlocks.forEach(type => {
            addSpaceBlock({ pageId, type, label: type.replace(/_/g, ' ') })
          })
        }
      })
    } else {
      // Fallback: add to wall page
      const wallPage = spacePages.find(p => p.slug === 'wall') || spacePages[0]
      if (wallPage) {
        selectedBlocks.forEach(type => {
          addSpaceBlock({ pageId: wallPage.id, type, label: type.replace(/_/g, ' ') })
        })
      }
    }
    setApplied(true)
  }

  const npmCode = {
    react: {
      install: 'npm install @barbelo/space-widget\n# or\nyarn add @barbelo/space-widget',
      usage: `import { SpaceWidget } from '@barbelo/space-widget'

export default function ProfilePage() {
  return (
    <SpaceWidget
      handle="${handle}"
      theme="${user.spaceTheme || 'default'}"
      blocks={${JSON.stringify([...selectedBlocks].slice(0, 4))}}
      layout="${user.spaceLayout || 'classic'}"
      apiKey={process.env.NEXT_PUBLIC_NTOGETHER_KEY}
    />
  )
}`,
    },
    vue: {
      install: 'npm install @barbelo/space-widget',
      usage: `<template>
  <SpaceWidget handle="${handle}" theme="${user.spaceTheme || 'default'}" :blocks="blocks" />
</template>
<script setup>
import { SpaceWidget } from '@barbelo/space-widget/vue'
const blocks = ${JSON.stringify([...selectedBlocks].slice(0, 3))}
</script>`,
    },
    svelte: {
      install: 'npm install @barbelo/space-widget',
      usage: `<script>
  import { SpaceWidget } from '@barbelo/space-widget/svelte'
</script>

<SpaceWidget handle="${handle}" theme="${user.spaceTheme || 'default'}" />`,
    },
    vanilla: {
      install: 'npm install @barbelo/space-widget',
      usage: `import { initSpaceWidget } from '@barbelo/space-widget'

initSpaceWidget('#my-space', {
  handle: '${handle}',
  theme: '${user.spaceTheme || 'default'}',
})`,
    },
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0a0f1a', color:'#f1f5f9', overflow:'hidden', fontFamily:'inherit' }}>
      {/* Topbar */}
      <div style={{ height:48, flexShrink:0, display:'flex', alignItems:'center', gap:8, padding:'0 14px',
        background:'#1e293b', borderBottom:'1px solid #334155', zIndex:10 }}>
        <button style={ghostBtn} onClick={()=>nav('/monogenes')}>← MONOGENES</button>
        <span style={{ color:'#334155' }}>|</span>
        <span style={{ fontSize:13, fontWeight:700, color:'#84cc16', letterSpacing:'.04em' }}>✦ CREATEBARBELO</span>
        <span style={{ color:'#334155', margin:'0 4px' }}>|</span>
        {/* Step indicators */}
        <div style={{ display:'flex', gap:2, flex:1 }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={()=>setStep(i)}
              style={{ padding:'4px 12px', borderRadius:6, fontSize:11, fontWeight:500, cursor:'pointer',
                background: step===i ? 'rgba(132,204,22,.12)' : 'transparent',
                color:       step===i ? '#84cc16' : i < step ? '#64748b' : '#475569',
                border:`1px solid ${step===i ? '#84cc16' : 'transparent'}` }}>
              {i+1}. {s}
            </button>
          ))}
        </div>
        {step > 0 && <button style={ghostBtn} onClick={()=>setStep(s=>s-1)}>Back</button>}
        {step < 3 && <button style={primaryBtn} onClick={()=>{
          if (step === 0 && selectedTemplate) {
            const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
            const isWebsite = tpl && ['restaurant','ecommerce','nonprofit','freelancer','portfolio','podcast','blog','artist'].includes(tpl.id)
            updateUser({ siteType: isWebsite ? 'website' : 'social' })
          }
          setStep(s=>s+1)
        }}>Continue →</button>}
        {step === 3 && <button style={primaryBtn} onClick={()=>nav('/monogenes/editor')}>Open in BUILDMONOGENES →</button>}
      </div>

      {/* Body: left content + right preview */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Left: step content */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {step === 0 && <StepTemplate selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} setSelectedBlocks={setSelectedBlocks} tplCategory={tplCategory} setTplCategory={setTplCategory} />}
          {step === 1 && <StepDesign user={user} updateUser={updateUser} />}
          {step === 2 && <StepBlocks selectedBlocks={selectedBlocks} setSelectedBlocks={setSelectedBlocks} openApps={openApps} setOpenApps={setOpenApps} />}
          {step === 3 && (
            <StepInstall
              user={user} handle={handle} selectedBlocks={selectedBlocks}
              installTab={installTab} setInstallTab={setInstallTab}
              copied={copied} copyText={copyText}
              embedVariant={embedVariant} setEmbedVariant={setEmbedVariant}
              getEmbedSnippet={getEmbedSnippet} downloadHtml={downloadHtml}
              selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform}
              npmFramework={npmFramework} setNpmFramework={setNpmFramework}
              npmCode={npmCode}
              embedConfig={embedConfig} setEmbedConfig={setEmbedConfig}
              applied={applied} applyToSpace={applyToSpace}
              nav={nav}
            />
          )}
        </div>

        {/* Right: live preview */}
        <div style={{ width:320, flexShrink:0, borderLeft:'1px solid #334155', overflowY:'auto', background:'#060c18', padding:12 }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#475569', marginBottom:10 }}>
            {step === 3 ? 'Embed Preview' : 'Live Preview'}
          </div>
          {step === 3 ? <EmbedPreview user={user} selectedBlocks={selectedBlocks} /> : <BlocksPreview user={user} theme={theme} selectedBlocks={selectedBlocks} />}
        </div>
      </div>
    </div>
  )
}

// ── Step 0: Template ──────────────────────────────────────────────────────────
const TPL_CATEGORIES = [
  { id:'all',          label:'All' },
  { id:'personal',     label:'Personal' },
  { id:'business',     label:'Business' },
  { id:'creative',     label:'Creative' },
  { id:'organization', label:'Organization' },
]

const CATEGORY_BADGE = {
  personal:     { label:'Personal',     color:'#6366f1' },
  business:     { label:'Business',     color:'#f59e0b' },
  creative:     { label:'Creative',     color:'#ec4899' },
  organization: { label:'Organization', color:'#10b981' },
}

function StepTemplate({ selectedTemplate, setSelectedTemplate, setSelectedBlocks, tplCategory, setTplCategory }) {
  const filtered = tplCategory === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === tplCategory)
  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Choose a template</h2>
      <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Start with a pre-built layout for your site type, or build from scratch.</p>

      {/* Category filter pills */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
        {TPL_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={()=>setTplCategory(cat.id)}
            style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer',
              border:'1px solid transparent',
              background: tplCategory===cat.id ? '#84cc16' : '#1e293b',
              color: tplCategory===cat.id ? '#0f172a' : '#94a3b8',
              borderColor: tplCategory===cat.id ? '#84cc16' : '#334155' }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:14, marginBottom:20 }}>
        {filtered.map(tpl => {
          const badge = CATEGORY_BADGE[tpl.category]
          return (
            <div key={tpl.id} onClick={()=>{ setSelectedTemplate(tpl.id); setSelectedBlocks(new Set(tpl.blocks)) }}
              style={{ border:`2px solid ${selectedTemplate===tpl.id?'#84cc16':'#334155'}`,
                borderRadius:10, padding:'16px 14px', cursor:'pointer',
                background:selectedTemplate===tpl.id?'rgba(132,204,22,.06)':'#1e293b',
                transition:'border-color .15s, background .15s' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:28 }}>{tpl.icon}</span>
                {badge && (
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:8,
                    background: badge.color + '22', color: badge.color, border:`1px solid ${badge.color}44` }}>
                    {badge.label}
                  </span>
                )}
              </div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4, color:'#f1f5f9' }}>{tpl.name}</div>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>{tpl.desc}</div>
              {tpl.pages && (
                <div style={{ fontSize:10, color:'#475569', marginBottom:8 }}>
                  Pages: {tpl.pages.join(' · ')}
                </div>
              )}
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {tpl.blocks.slice(0,4).map(b => (
                  <span key={b} style={{ fontSize:9, background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'1px 5px', color:'#475569' }}>
                    {b.replace(/_/g,' ')}
                  </span>
                ))}
                {tpl.blocks.length > 4 && (
                  <span style={{ fontSize:9, color:'#475569' }}>+{tpl.blocks.length - 4}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {selectedTemplate && (
        <button style={{ fontSize:12, color:'#64748b', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}
          onClick={()=>{ setSelectedTemplate(null); setSelectedBlocks(new Set(['hero','bio'])) }}>
          Start from scratch
        </button>
      )}
    </div>
  )
}

// ── Step 1: Design ────────────────────────────────────────────────────────────
function StepDesign({ user, updateUser }) {
  const THEMES_ENTRIES = Object.entries({
    default:  { '--accent': '#84cc16', '--space-bg': '#0f172a', '--space-surface': '#1e293b' },
    midnight: { '--accent': '#6366f1', '--space-bg': '#0f0f1a', '--space-surface': '#1a1a2e' },
    sage:     { '--accent': '#4ade80', '--space-bg': '#0d1f14', '--space-surface': '#122016' },
    sunset:   { '--accent': '#fb923c', '--space-bg': '#1a0f0a', '--space-surface': '#2a1a12' },
    stone:    { '--accent': '#e5e7eb', '--space-bg': '#111111', '--space-surface': '#1c1c1c' },
    neon:     { '--accent': '#f472b6', '--space-bg': '#0a0a1a', '--space-surface': '#111128' },
  })
  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Design your Space</h2>
      <p style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Pick a theme and layout. These apply to your live SPACE profile.</p>

      <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Theme</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {THEMES_ENTRIES.map(([key, vars]) => (
          <div key={key} onClick={()=>updateUser({spaceTheme:key})}
            style={{ border:`2px solid ${user.spaceTheme===key?vars['--accent']:'#334155'}`,
              borderRadius:8, padding:'12px 10px', cursor:'pointer',
              background:vars['--space-surface'], textAlign:'center' }}>
            <div style={{ display:'flex', gap:4, marginBottom:6, justifyContent:'center' }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--accent'] }}/>
              <div style={{ flex:1, height:14, background:vars['--space-bg'], borderRadius:2 }}/>
            </div>
            <div style={{ fontSize:12, color:'#e2e8f0', fontWeight:600 }}>{key.charAt(0).toUpperCase()+key.slice(1)}</div>
            {user.spaceTheme===key && <div style={{ fontSize:10, color:vars['--accent'], marginTop:2 }}>✓ active</div>}
          </div>
        ))}
      </div>

      <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Layout</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {[['Classic','Banner + avatar left, content right'],['Centered','Avatar centered, full banner'],['Minimal','No cover, just avatar + bio']].map(([layout, desc]) => (
          <div key={layout} onClick={()=>updateUser({spaceLayout:layout.toLowerCase()})}
            style={{ border:`2px solid ${user.spaceLayout===layout.toLowerCase()?'#84cc16':'#334155'}`,
              borderRadius:8, padding:'12px 10px', cursor:'pointer',
              background:user.spaceLayout===layout.toLowerCase()?'rgba(132,204,22,.06)':'#1e293b' }}>
            <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9', marginBottom:4 }}>{layout}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Blocks ────────────────────────────────────────────────────────────
function StepBlocks({ selectedBlocks, setSelectedBlocks, openApps, setOpenApps }) {
  function toggleBlock(type) {
    setSelectedBlocks(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }
  function toggleApp(app) {
    setOpenApps(prev => {
      const next = new Set(prev)
      next.has(app) ? next.delete(app) : next.add(app)
      return next
    })
  }
  function selectAllInGroup(group) {
    setSelectedBlocks(prev => {
      const next = new Set(prev)
      group.blocks.forEach(b => next.add(b.type))
      return next
    })
  }
  function selectNoneInGroup(group) {
    setSelectedBlocks(prev => {
      const next = new Set(prev)
      group.blocks.forEach(b => next.delete(b.type))
      return next
    })
  }
  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Select blocks</h2>
      <p style={{ fontSize:13, color:'#64748b', marginBottom:6 }}>Choose which Life Suite modules appear in your Space.</p>
      <div style={{ fontSize:11, fontWeight:600, color:'#84cc16', background:'rgba(132,204,22,.1)', border:'1px solid rgba(132,204,22,.2)', borderRadius:6, padding:'4px 12px', display:'inline-block', marginBottom:20 }}>
        {selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''} selected
      </div>
      {LIFE_BLOCK_GROUPS.map(group => {
        const isOpen = openApps.has(group.app)
        const allSelected = group.blocks.every(b => selectedBlocks.has(b.type))
        return (
          <div key={group.app} style={{ borderBottom:'1px solid #1e293b', marginBottom:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', cursor:'pointer' }}
              onClick={()=>toggleApp(group.app)}>
              <span style={{ fontSize:13 }}>{group.icon}</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8', flex:1 }}>{group.app}</span>
              <span style={{ fontSize:9, background:'#1e293b', color:'#64748b', borderRadius:8, padding:'1px 5px' }}>{group.blocks.length}</span>
              <button style={{ fontSize:10, color:'#475569', background:'none', border:'none', cursor:'pointer', padding:'1px 6px' }}
                onClick={e=>{ e.stopPropagation(); allSelected ? selectNoneInGroup(group) : selectAllInGroup(group) }}>
                {allSelected ? 'None' : 'All'}
              </button>
              <span style={{ fontSize:9, color:'#475569' }}>{isOpen?'▾':'▸'}</span>
            </div>
            {isOpen && (
              <div style={{ paddingBottom:8 }}>
                {group.blocks.map(b => (
                  <div key={b.type} style={{ display:'flex', alignItems:'center', gap:10, padding:'5px 0 5px 24px' }}>
                    <input type="checkbox" checked={selectedBlocks.has(b.type)} onChange={()=>toggleBlock(b.type)}
                      style={{ accentColor:'#84cc16' }}/>
                    <span style={{ fontSize:12, color:'#e2e8f0' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 3: Install ───────────────────────────────────────────────────────────
function StepInstall({ user, handle, selectedBlocks, installTab, setInstallTab, copied, copyText,
  embedVariant, setEmbedVariant, getEmbedSnippet, downloadHtml,
  selectedPlatform, setSelectedPlatform, npmFramework, setNpmFramework, npmCode,
  embedConfig, setEmbedConfig, applied, applyToSpace, nav }) {

  const tabs = ['📋 Embed', '🧩 Platforms', '🔗 Hosted Link', '📦 npm', '⚙ Config']
  const tabKeys = ['embed','platforms','hosted','npm','config']

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Install your Space</h2>
      <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Add your Space to any website, or share the hosted link.</p>

      {/* Apply + BUILDSPACE buttons */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button onClick={applyToSpace}
          style={{ ...primaryBtn, opacity:applied?0.7:1 }}>
          {applied ? '✓ Applied to SPACE' : 'Apply to SPACE'}
        </button>
        <button style={{ background:'transparent', border:'1px solid #84cc16', color:'#84cc16', borderRadius:6, padding:'6px 14px', fontSize:12, cursor:'pointer' }} onClick={()=>nav('/monogenes/editor')}>
          Open in BUILDSPACE →
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid #334155', marginBottom:20 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={()=>setInstallTab(tabKeys[i])}
            style={{ padding:'7px 14px', background:'transparent', border:'none', cursor:'pointer', fontSize:12,
              color:installTab===tabKeys[i]?'#84cc16':'#64748b',
              borderBottom:`2px solid ${installTab===tabKeys[i]?'#84cc16':'transparent'}`,
              fontWeight:installTab===tabKeys[i]?700:400 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Embed Code tab */}
      {installTab === 'embed' && (
        <div>
          <div style={{ display:'flex', gap:4, marginBottom:14 }}>
            {['minimal','full','self-hosted'].map(v => (
              <button key={v} onClick={()=>setEmbedVariant(v)}
                style={{ padding:'4px 12px', borderRadius:6, fontSize:11, cursor:'pointer',
                  background:embedVariant===v?'rgba(132,204,22,.1)':'transparent',
                  color:embedVariant===v?'#84cc16':'#64748b',
                  border:`1px solid ${embedVariant===v?'#84cc16':'#334155'}` }}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
          <CodeBlock code={getEmbedSnippet(embedVariant)} lang="html" copyKey="snippet" copied={copied} onCopy={copyText} />
          <button onClick={downloadHtml}
            style={{ ...primaryBtn, marginTop:8, fontSize:11 }}>
            ⬇ Download .html
          </button>
        </div>
      )}

      {/* Platforms tab */}
      {installTab === 'platforms' && (
        <div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
            {PLATFORM_GUIDES.map(p => (
              <button key={p.id} onClick={()=>setSelectedPlatform(p.id)}
                style={{ padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer',
                  background:selectedPlatform===p.id?'rgba(132,204,22,.1)':'#1e293b',
                  color:selectedPlatform===p.id?'#84cc16':'#94a3b8',
                  border:`1px solid ${selectedPlatform===p.id?'#84cc16':'#334155'}` }}>
                {p.icon} {p.name}
                <span style={{ marginLeft:6, fontSize:10, padding:'1px 6px', borderRadius:4,
                  background: p.diff==='Dev'?'rgba(99,102,241,.2)':p.diff==='Medium'?'rgba(251,191,36,.1)':'rgba(132,204,22,.1)',
                  color: p.diff==='Dev'?'#818cf8':p.diff==='Medium'?'#fbbf24':'#84cc16' }}>
                  {p.diff}
                </span>
              </button>
            ))}
          </div>
          {(() => {
            const p = PLATFORM_GUIDES.find(x => x.id === selectedPlatform)
            if (!p) return null
            return (
              <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:20 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>{p.icon} {p.name}</div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:16 }}>{p.time} · {p.diff}</div>
                {p.steps.map((s, i) => (
                  <div key={i} style={{ display:'flex', gap:12, marginBottom:14, alignItems:'flex-start' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'#84cc16', color:'#0f172a', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      {i+1}
                    </div>
                    <div style={{ fontSize:13, color:'#e2e8f0', lineHeight:1.5 }}>{s}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* Hosted Link tab */}
      {installTab === 'hosted' && (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Your Space URL</div>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
            <span style={{ fontSize:16 }}>🔗</span>
            <span style={{ flex:1, fontFamily:'monospace', fontSize:13, color:'#84cc16' }}>barbelo.app/@{handle}</span>
            <button onClick={()=>copyText(`barbelo.app/@${handle}`,'link')} style={{ ...primaryBtn, fontSize:11, padding:'4px 10px' }}>
              {copied==='link'?'✓ Copied':'Copy'}
            </button>
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:20 }}>
            Your permanent public profile URL — share it anywhere.
          </div>

          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Share to social</div>
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <button style={{ ...primaryBtn, fontSize:11, background:'#1DA1F2' }}
              onClick={()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my Barbelo Space! barbelo.app/@${handle}`)}`,'_blank')}>
              𝕏 Share on X
            </button>
            <button style={{ ...primaryBtn, fontSize:11, background:'#0077B5' }}
              onClick={()=>window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://barbelo.app/@${handle}`)}`,'_blank')}>
              in Share on LinkedIn
            </button>
            <button onClick={()=>copyText(`https://barbelo.app/@${handle}`,'social')} style={{ ...primaryBtn, fontSize:11, background:'#334155', color:'#f1f5f9' }}>
              {copied==='social'?'✓ Copied':'📋 Copy link'}
            </button>
          </div>

          {/* Link card preview (OG mockup) */}
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Link preview</div>
          <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, overflow:'hidden', display:'flex', marginBottom:20, maxWidth:440 }}>
            <div style={{ width:64, background:'linear-gradient(135deg,#2d1b69,#1e3a5f)', flexShrink:0 }}/>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>barbelo.app</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:2 }}>{user.name} — Barbelo Space</div>
              <div style={{ fontSize:11, color:'#64748b' }}>Goals · Media · Fitness · Learning</div>
            </div>
          </div>

          {/* QR placeholder */}
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>QR Code</div>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:100, height:100, background:'#0f172a', borderRadius:6, display:'grid', gridTemplateColumns:'repeat(10,1fr)', gap:1, padding:6 }}>
              {Array.from({length:100}).map((_,i) => (
                <div key={i} style={{ background:Math.sin(i*2.4)*Math.cos(i*1.7) > 0 ? '#334155' : '#0f172a', borderRadius:1 }}/>
              ))}
            </div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>Scan to open your Space</div>
              <button style={{ ...primaryBtn, fontSize:11, opacity:0.5, cursor:'not-allowed' }} disabled title="Coming soon">⬇ Download QR</button>
            </div>
          </div>
        </div>
      )}

      {/* npm tab */}
      {installTab === 'npm' && (
        <div>
          <div style={{ display:'flex', gap:4, marginBottom:14 }}>
            {['react','vue','svelte','vanilla'].map(f => (
              <button key={f} onClick={()=>setNpmFramework(f)}
                style={{ padding:'4px 12px', borderRadius:6, fontSize:11, cursor:'pointer',
                  background:npmFramework===f?'rgba(132,204,22,.1)':'transparent',
                  color:npmFramework===f?'#84cc16':'#64748b',
                  border:`1px solid ${npmFramework===f?'#84cc16':'#334155'}` }}>
                {f.charAt(0).toUpperCase()+f.slice(1)} {f==='react'?'/ Next':''}
              </button>
            ))}
          </div>
          <CodeBlock code={npmCode[npmFramework].install} lang="bash" copyKey="npm-install" copied={copied} onCopy={copyText} />
          <div style={{ marginTop:12 }} />
          <CodeBlock code={npmCode[npmFramework].usage} lang="jsx" copyKey="npm-usage" copied={copied} onCopy={copyText} />
          {npmFramework === 'react' && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Props</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #334155' }}>
                    {['Prop','Type','Default','Description'].map(h => (
                      <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'#64748b', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['handle','string','—','Your Barbelo handle (required)'],
                    ['theme','string','\'default\'','default, midnight, sage, sunset, stone, neon'],
                    ['blocks','string[]','all public','Block types to include'],
                    ['layout','string','\'classic\'','classic, centered, minimal'],
                    ['apiKey','string','—','From barbelo.app/settings/api'],
                  ].map(([prop,type,def,desc]) => (
                    <tr key={prop} style={{ borderBottom:'1px solid #1e293b' }}>
                      <td style={{ padding:'6px 8px', color:'#84cc16', fontFamily:'monospace' }}>{prop}</td>
                      <td style={{ padding:'6px 8px', color:'#6366f1', fontFamily:'monospace' }}>{type}</td>
                      <td style={{ padding:'6px 8px', color:'#f59e0b', fontFamily:'monospace' }}>{def}</td>
                      <td style={{ padding:'6px 8px', color:'#94a3b8' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop:14 }}>
            <a href="#" style={{ fontSize:12, color:'#84cc16', textDecoration:'none' }}>View full docs →</a>
          </div>
        </div>
      )}

      {/* Config tab */}
      {installTab === 'config' && (
        <div>
          <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>These settings are reflected in the Embed Code tab's data-* attributes.</div>
          <ConfigRow label="API Key">
            <input value={embedConfig.apiKey} onChange={e=>setEmbedConfig(c=>({...c,apiKey:e.target.value}))}
              placeholder="nt_live_xxxxxxxxxxxx" type="password"
              style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }} />
            <a href="#" style={{ fontSize:11, color:'#84cc16', textDecoration:'none', flexShrink:0 }}>Get key →</a>
          </ConfigRow>
          <ConfigRow label="Privacy">
            <select value={embedConfig.privacy} onChange={e=>setEmbedConfig(c=>({...c,privacy:e.target.value}))}
              style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }}>
              {['public','connections only','private'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          </ConfigRow>
          <ConfigRow label="Width">
            <select value={embedConfig.width} onChange={e=>setEmbedConfig(c=>({...c,width:e.target.value}))}
              style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }}>
              {['full','800px','640px','480px'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </ConfigRow>
          <ConfigRow label="Height">
            <select value={embedConfig.height} onChange={e=>setEmbedConfig(c=>({...c,height:e.target.value}))}
              style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }}>
              {['auto','600px','800px','1000px'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </ConfigRow>
          {[['showHeader','Show header'],['showFooter','Show footer (powered by)'],['allowComments','Allow comments']].map(([key, label]) => (
            <ConfigRow key={key} label={label}>
              <button onClick={()=>setEmbedConfig(c=>({...c,[key]:!c[key]}))}
                style={{ width:30, height:18, borderRadius:9, border:'none', cursor:'pointer', position:'relative',
                  background:embedConfig[key]?'#84cc16':'#334155', padding:0, display:'flex', alignItems:'center', paddingLeft:2, paddingRight:2 }}>
                <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', transform:embedConfig[key]?'translateX(12px)':'translateX(0)', transition:'transform .15s' }}/>
              </button>
            </ConfigRow>
          ))}
          <ConfigRow label="Environment">
            <select value={embedConfig.env} onChange={e=>setEmbedConfig(c=>({...c,env:e.target.value}))}
              style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:4, padding:'5px 8px', color:'#f1f5f9', fontSize:12 }}>
              {['production','staging','local (localhost:5173)'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </ConfigRow>
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function CodeBlock({ code, lang, copyKey, copied, onCopy }) {
  return (
    <div style={{ position:'relative', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'14px 16px', fontFamily:'monospace', fontSize:11, lineHeight:1.6, color:'#a3e635', whiteSpace:'pre', overflowX:'auto' }}>
      <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:6 }}>
        <span style={{ fontSize:9, color:'#334155', padding:'2px 6px', background:'#1e293b', borderRadius:4 }}>{lang}</span>
        <button onClick={()=>onCopy(code, copyKey)}
          style={{ fontSize:10, background:'#1e293b', border:'1px solid #334155', borderRadius:4, color:copied===copyKey?'#84cc16':'#64748b', cursor:'pointer', padding:'2px 8px' }}>
          {copied===copyKey?'✓ Copied':'Copy'}
        </button>
      </div>
      {code}
    </div>
  )
}

function ConfigRow({ label, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8 }}>
      <span style={{ fontSize:12, color:'#94a3b8', flexShrink:0 }}>{label}</span>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>{children}</div>
    </div>
  )
}

// ── Right panel: live block preview ──────────────────────────────────────────
function BlocksPreview({ user, theme, selectedBlocks }) {
  return (
    <div style={{ ...theme, background:theme['--space-bg']||'#0f172a', borderRadius:8, padding:12, minHeight:300 }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--accent,#84cc16)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#0f172a', flexShrink:0 }}>
          {user.name.split(' ').map(w=>w[0]).join('')}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#f1f5f9' }}>{user.name}</div>
          <div style={{ fontSize:10, color:'#64748b' }}>@{user.handle}</div>
        </div>
      </div>
      {[...selectedBlocks].map(type => {
        const group = LIFE_BLOCK_GROUPS.find(g => g.blocks.some(b => b.type === type))
        const block = group?.blocks.find(b => b.type === type)
        return (
          <div key={type} style={{ background:'var(--space-surface,#1e293b)', border:'1px solid var(--space-border,#334155)', borderRadius:6, padding:'8px 10px', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14 }}>{group?.icon || '📦'}</span>
            <span style={{ fontSize:11, color:'#e2e8f0' }}>{block?.label || type.replace(/_/g,' ')}</span>
            <div style={{ marginLeft:'auto', height:3, width:40, background:'var(--space-border,#334155)', borderRadius:2 }}/>
          </div>
        )
      })}
      {selectedBlocks.size === 0 && <div style={{ fontSize:12, color:'#475569', textAlign:'center', padding:'20px 0' }}>No blocks selected</div>}
    </div>
  )
}

// ── Right panel: embed preview mockup ─────────────────────────────────────────
function EmbedPreview({ user, selectedBlocks }) {
  const blockGroups = [...selectedBlocks].slice(0, 3).map(type => LIFE_BLOCK_GROUPS.find(g => g.blocks.some(b => b.type === type))?.icon || '📦')
  return (
    <div style={{ background:'#111827', border:'1px solid #334155', borderRadius:8, overflow:'hidden', fontSize:11 }}>
      {/* Fake browser chrome */}
      <div style={{ height:24, background:'#0f172a', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', padding:'0 8px', gap:4 }}>
        <div style={{ display:'flex', gap:3 }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width:6, height:6, borderRadius:'50%', background:c }}/>)}
        </div>
        <div style={{ flex:1, height:12, background:'#1e293b', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:8, color:'#334155' }}>yourdomain.com</span>
        </div>
      </div>
      {/* Site chrome */}
      <div style={{ background:'#1a2332', padding:'8px 10px', borderBottom:'1px solid #1e293b' }}>
        <div style={{ height:10, background:'#334155', borderRadius:3, width:'60%', marginBottom:4 }}/>
        <div style={{ display:'flex', gap:6 }}>
          {[40,50,45,35].map((w,i) => <div key={i} style={{ height:7, background:'#1e293b', borderRadius:2, width:w }}/>)}
        </div>
      </div>
      {/* Barbelo widget */}
      <div style={{ background:'#0f172a', margin:8, borderRadius:6, border:'1px solid #334155', padding:10 }}>
        <div style={{ fontSize:9, color:'#475569', marginBottom:6, textAlign:'center', letterSpacing:'.06em', textTransform:'uppercase' }}>Barbelo Space Widget</div>
        <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:'#84cc16', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#0f172a', flexShrink:0 }}>
            {user.name.split(' ').map(w=>w[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#f1f5f9' }}>{user.name}</div>
            <div style={{ fontSize:8, color:'#64748b' }}>@{user.handle}</div>
          </div>
        </div>
        <div style={{ height:1, background:'#1e293b', marginBottom:6 }}/>
        <div style={{ display:'flex', gap:4, marginBottom:6 }}>
          {blockGroups.map((icon,i) => <span key={i} style={{ fontSize:12 }}>{icon}</span>)}
        </div>
        {[80,65,72].map((w,i) => <div key={i} style={{ height:4, background:'#1e293b', borderRadius:2, width:`${w}%`, marginBottom:4 }}/>)}
        <div style={{ fontSize:7, color:'#334155', marginTop:6 }}>powered by Barbelo</div>
      </div>
      {/* Site footer */}
      <div style={{ background:'#1a2332', padding:'6px 10px', borderTop:'1px solid #1e293b' }}>
        <div style={{ height:7, background:'#334155', borderRadius:3, width:'40%' }}/>
      </div>
    </div>
  )
}
