import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "restaurants", label: "Restaurants",    icon: "🍽️", color: "#E8603C" },
  { id: "bars",        label: "Bars",            icon: "🍺", color: "#D4A017" },
  { id: "events",      label: "Weekly Events",   icon: "📅", color: "#4A90D9" },
  { id: "media",       label: "Media",           icon: "🎵", color: "#9B59B6" },
  { id: "shows",       label: "Shows & Concerts",icon: "🎭", color: "#27AE60" },
];

const CONTACTS = [
  { id: "c1", name: "Alex",   avatar: "A", color: "#E8603C" },
  { id: "c2", name: "Jordan", avatar: "J", color: "#4A90D9" },
  { id: "c3", name: "Sam",    avatar: "S", color: "#27AE60" },
  { id: "c4", name: "Taylor", avatar: "T", color: "#9B59B6" },
  { id: "c5", name: "Morgan", avatar: "M", color: "#D4A017" },
  { id: "c6", name: "Riley",  avatar: "R", color: "#E91E63" },
];

const DAYS     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_S   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const ORDINALS = ["1st","2nd","3rd","4th","Last"];
const ORDINAL_VALS = [1,2,3,4,-1];

const HOLIDAYS = [
  { id: "easter",       label: "Easter" },
  { id: "thanksgiving", label: "Thanksgiving" },
  { id: "memorial",     label: "Memorial Day" },
  { id: "labor",        label: "Labor Day" },
  { id: "nye",          label: "New Year's Eve" },
  { id: "july4",        label: "4th of July" },
  { id: "christmas",    label: "Christmas" },
];

const OFFSETS = [
  { val: -7, label: "1 week before" },
  { val: -3, label: "3 days before" },
  { val: -2, label: "2 days before" },
  { val: -1, label: "The day before" },
  { val:  0, label: "That day" },
  { val:  1, label: "The day after" },
  { val:  2, label: "2 days after" },
  { val:  3, label: "3 days after" },
  { val:  7, label: "1 week after" },
];

// ─── Describe a schedule as a human-readable string ──────────────────────────

function describe(sched) {
  if (!sched || sched.type === "none") return "";
  if (sched.type === "single") return sched.value || "";
  if (sched.type === "weekly") {
    const d = sched.days || [];
    if (d.length === 0) return "Weekly";
    if (d.length === 7) return "Every day";
    if (d.length === 1) return "Every " + DAYS[d[0]];
    return "Every " + d.map(i => DAYS[i]).join(", ");
  }
  if (sched.type === "monthly_date") {
    const n = sched.day;
    if (!n) return "Monthly";
    const suffix = n == 1 ? "st" : n == 2 ? "nd" : n == 3 ? "rd" : "th";
    return `Monthly on the ${n}${suffix}`;
  }
  if (sched.type === "monthly_weekday") {
    const oi = ORDINAL_VALS.indexOf(Number(sched.ordinal ?? 1));
    const ordLabel = ORDINALS[oi >= 0 ? oi : 0];
    const dayLabel = DAYS[sched.day ?? 0];
    return `${ordLabel} ${dayLabel} of each month`;
  }
  if (sched.type === "holiday") {
    const h = HOLIDAYS.find(h => h.id === sched.holiday) || HOLIDAYS[0];
    const o = OFFSETS.find(o => o.val === Number(sched.offset ?? 0)) || OFFSETS[4];
    if (o.val === 0) return `${h.label} (yearly)`;
    return `${o.label} ${h.label}`;
  }
  return "";
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE = [
  { id:1, category:"restaurants", title:"The Rusty Fork",   note:"Wood-fired pizza, happy hour 4–6pm",  contacts:["c1","c3"], schedule:{type:"none"},                                    priority:false },
  { id:2, category:"bars",        title:"Neon Owl",          note:"Craft cocktails, rooftop opens spring",contacts:["c2"],      schedule:{type:"none"},                                    priority:true  },
  { id:3, category:"events",      title:"Jazz Thursdays",    note:"@ Birdland, 8pm · $10 cover",          contacts:["c1","c2","c4"], schedule:{type:"weekly",days:[4]},                   priority:false },
  { id:4, category:"shows",       title:"The National",      note:"Outdoor amphitheater",                  contacts:["c3","c5"], schedule:{type:"single",value:"Jun 14"},                  priority:true  },
  { id:5, category:"events",      title:"Trivia Night",      note:"Brewhouse on Main · teams of 4",       contacts:["c2","c6"], schedule:{type:"monthly_weekday",ordinal:-1,day:5},       priority:false },
  { id:6, category:"events",      title:"Easter Brunch",     note:"The Grand Hotel annual buffet",         contacts:["c1","c3","c5"],schedule:{type:"holiday",holiday:"easter",offset:0}, priority:false },
];

const blank = () => ({ title:"", category:"restaurants", note:"", schedule:{type:"none"}, contacts:[], priority:false });

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#0F0E0C;color:#F0EBE1;font-family:'DM Sans',sans-serif;min-height:100vh}
.app{max-width:900px;margin:0 auto;padding:0 20px 60px}

/* header */
.hdr{padding:40px 0 24px;border-bottom:1px solid #2A2825;margin-bottom:32px}
.hdr-top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
.brand{display:flex;flex-direction:column}
.eyebrow{font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#7A7268;margin-bottom:4px}
.logo{font-family:'Fraunces',serif;font-size:42px;font-weight:300;line-height:1;color:#F0EBE1}
.logo em{font-style:italic;color:#E8603C}
.add-btn{display:flex;align-items:center;gap:8px;background:#E8603C;color:#fff;border:none;border-radius:40px;padding:12px 22px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
.add-btn:hover{background:#CF4E2B;transform:translateY(-1px)}
.hdr-row2{display:flex;align-items:center;gap:12px;margin-top:20px}
.srch{flex:1;max-width:240px;position:relative}
.srch-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#4A4540;font-size:14px}
.srch input{width:100%;background:#161410;border:1px solid #242220;border-radius:40px;padding:9px 14px 9px 34px;font-family:'DM Sans',sans-serif;font-size:13px;color:#F0EBE1;outline:none;transition:border-color .15s}
.srch input:focus{border-color:#3A3530}
.srch input::placeholder{color:#3A3530}
.cnt{font-size:12px;color:#4A4540;margin-left:auto;white-space:nowrap}

/* filters */
.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.pill{display:flex;align-items:center;gap:6px;border:1px solid #2A2825;border-radius:40px;padding:7px 14px;font-size:13px;background:transparent;color:#7A7268;cursor:pointer;transition:all .18s}
.pill:hover{border-color:#4A4540;color:#BDB5A8}
.pill.on{background:#1E1C19;border-color:#4A4540;color:#F0EBE1}
.pill .ic{font-size:15px}
.badge{background:#2A2825;border-radius:20px;padding:1px 7px;font-size:11px;color:#7A7268}
.pill.on .badge{background:#333028;color:#BDB5A8}

/* grid */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.empty{grid-column:1/-1;text-align:center;padding:80px 20px}
.empty-ic{font-size:48px;margin-bottom:16px}
.empty p{font-family:'Fraunces',serif;font-size:20px;color:#4A4540}

/* card */
.card{background:#161410;border:1px solid #242220;border-radius:14px;padding:18px 20px;position:relative;overflow:hidden;transition:all .2s;cursor:default}
.card:hover{border-color:#3A3530;transform:translateY(-2px)}
.stripe{position:absolute;top:0;left:0;width:3px;height:100%;border-radius:3px 0 0 3px}
.cmeta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px}
.ccat-ic{font-size:13px}
.ccat-lb{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#5A5450}
.cdate{display:flex;align-items:center;gap:4px;font-size:11px;color:#7A7268;background:#1E1C19;border-radius:20px;padding:2px 8px}
.rdot{width:5px;height:5px;border-radius:50%;background:#4A90D9;flex-shrink:0}
.chdr{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px}
.ctitle{font-family:'Fraunces',serif;font-size:19px;font-weight:600;line-height:1.2;color:#F0EBE1;flex:1}
.cstar{font-size:14px;flex-shrink:0}
.cnote{font-size:13px;color:#7A7268;line-height:1.55;margin-bottom:14px}
.cfoot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cavs{display:flex}
.av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid #161410;margin-right:-6px;color:#fff;flex-shrink:0}
.av-more{background:#2A2825;font-size:10px;color:#7A7268}
.cacts{display:flex;gap:4px;opacity:0;transition:opacity .15s}
.card:hover .cacts{opacity:1}
.cact{background:#1E1C19;border:1px solid #2A2825;border-radius:8px;color:#7A7268;font-size:13px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.cact:hover{border-color:#4A4540;color:#BDB5A8}
.cact.del:hover{border-color:#C0392B;color:#C0392B}

/* modal */
.overlay{position:fixed;inset:0;background:rgba(10,9,8,.88);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.modal{background:#161410;border:1px solid #2A2825;border-radius:18px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;padding:28px;position:relative;animation:mIn .2s ease}
@keyframes mIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
.mtitle{font-family:'Fraunces',serif;font-size:26px;font-weight:300;color:#F0EBE1;margin-bottom:24px}
.mclose{position:absolute;top:22px;right:22px;background:#1E1C19;border:1px solid #2A2825;border-radius:8px;color:#7A7268;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all .15s}
.mclose:hover{border-color:#4A4540;color:#BDB5A8}

/* form */
.ff{margin-bottom:18px}
.fl{display:block;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#5A5450;margin-bottom:8px}
.fi,.fta,.fsel{width:100%;background:#0F0E0C;border:1px solid #2A2825;border-radius:10px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#F0EBE1;outline:none;transition:border-color .15s}
.fi:focus,.fta:focus,.fsel:focus{border-color:#4A4540}
.fta{resize:vertical;min-height:80px}
.fsel{appearance:none;cursor:pointer}
.fsel option{background:#161410}

/* cat picker */
.cats{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.catopt{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 4px;border:1px solid #2A2825;border-radius:10px;cursor:pointer;background:transparent;color:#7A7268;font-size:11px;font-family:'DM Sans',sans-serif;transition:all .15s}
.catopt .ic{font-size:20px}
.catopt:hover{border-color:#4A4540;color:#BDB5A8}
.catopt.on{background:#1E1C19;color:#F0EBE1}

/* date picker */
.dtabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.dtab{padding:6px 14px;border:1px solid #2A2825;border-radius:40px;background:transparent;font-family:'DM Sans',sans-serif;font-size:12px;color:#7A7268;cursor:pointer;transition:all .15s;white-space:nowrap}
.dtab:hover{border-color:#4A4540;color:#BDB5A8}
.dtab.on{background:#1E1C19;border-color:#4A4540;color:#F0EBE1}
.dcfg{background:#0F0E0C;border:1px solid #2A2825;border-radius:12px;padding:14px}
.dcfg-lbl{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5A5450;margin-bottom:10px}
.dtoggles{display:flex;gap:6px;flex-wrap:wrap}
.dtog{width:38px;height:38px;border-radius:50%;border:1px solid #2A2825;background:transparent;font-family:'DM Sans',sans-serif;font-size:12px;color:#7A7268;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.dtog:hover{border-color:#4A4540;color:#BDB5A8}
.dtog.on{background:#4A90D9;border-color:#4A90D9;color:#fff}
.drow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.dsel{background:#161410;border:1px solid #2A2825;border-radius:8px;padding:8px 10px;font-family:'DM Sans',sans-serif;font-size:13px;color:#F0EBE1;outline:none;cursor:pointer;appearance:none;transition:border-color .15s}
.dsel:focus{border-color:#4A4540}
.dsel option{background:#161410}
.dlbl{font-size:13px;color:#5A5450}
.dnum{width:70px;background:#161410;border:1px solid #2A2825;border-radius:8px;padding:8px 10px;font-family:'DM Sans',sans-serif;font-size:13px;color:#F0EBE1;outline:none}
.dnum:focus{border-color:#4A4540}
.dprev{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 12px;background:#161410;border:1px solid #2A2825;border-radius:8px}
.dprev-ic{font-size:14px}
.dprev-txt{font-size:13px;color:#BDB5A8;flex:1}

/* contacts */
.contacts{display:flex;flex-wrap:wrap;gap:8px}
.copt{display:flex;align-items:center;gap:7px;padding:6px 12px 6px 6px;border:1px solid #2A2825;border-radius:40px;cursor:pointer;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:#7A7268;transition:all .15s}
.copt:hover{border-color:#4A4540;color:#BDB5A8}
.copt.on{border-color:#3A3530;background:#1E1C19;color:#F0EBE1}
.csm{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff}

/* priority */
.prio{display:flex;align-items:center;gap:10px;cursor:pointer;padding:11px 14px;background:#0F0E0C;border:1px solid #2A2825;border-radius:10px;transition:all .15s}
.prio:hover{border-color:#4A4540}
.prio.on{border-color:#D4A017;background:#1A1608}
.prio .star{font-size:16px}
.prio .lbl{font-size:13px;color:#7A7268}
.prio.on .lbl{color:#D4A017}

/* footer */
.mfoot{display:flex;gap:10px;margin-top:24px;justify-content:flex-end}
.bsec{padding:10px 20px;background:transparent;border:1px solid #2A2825;border-radius:40px;color:#7A7268;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;transition:all .15s}
.bsec:hover{border-color:#4A4540;color:#BDB5A8}
.bpri{padding:10px 24px;background:#E8603C;border:none;border-radius:40px;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s}
.bpri:hover{background:#CF4E2B}
`;

// ─── DateSchedulePicker ───────────────────────────────────────────────────────

function DateSchedulePicker({ value, onChange }) {
  const type = value.type || "none";
  const set  = patch => onChange({ ...value, ...patch });

  const toggleDay = d => {
    const days = value.days || [];
    set({ days: days.includes(d) ? days.filter(x=>x!==d) : [...days,d].sort((a,b)=>a-b) });
  };

  const tabs = [
    { id:"none",            label:"No date"     },
    { id:"single",          label:"Single date" },
    { id:"weekly",          label:"Weekly"      },
    { id:"monthly_date",    label:"Day of month"},
    { id:"monthly_weekday", label:"Nth weekday" },
    { id:"holiday",         label:"Holiday"     },
  ];

  const preview = describe(value);

  return (
    <div>
      <div className="dtabs">
        {tabs.map(t => (
          <button key={t.id} className={`dtab ${type===t.id?"on":""}`}
            onClick={() => onChange({ type: t.id })}>
            {t.label}
          </button>
        ))}
      </div>

      {type === "single" && (
        <div className="dcfg">
          <div className="dcfg-lbl">Enter a date</div>
          <input className="fi" placeholder="e.g. Jun 14, July 4th, Dec 25…"
            value={value.value||""} onChange={e=>set({value:e.target.value})}/>
        </div>
      )}

      {type === "weekly" && (
        <div className="dcfg">
          <div className="dcfg-lbl">Pick day(s)</div>
          <div className="dtoggles">
            {DAYS_S.map((d,i)=>(
              <button key={i} className={`dtog ${(value.days||[]).includes(i)?"on":""}`}
                onClick={()=>toggleDay(i)}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {type === "monthly_date" && (
        <div className="dcfg">
          <div className="dcfg-lbl">Day of the month</div>
          <div className="drow">
            <span className="dlbl">The</span>
            <input className="dnum" type="number" min="1" max="31" placeholder="1–31"
              value={value.day||""} onChange={e=>set({day:e.target.value})}/>
            <span className="dlbl">of each month</span>
          </div>
        </div>
      )}

      {type === "monthly_weekday" && (
        <div className="dcfg">
          <div className="dcfg-lbl">Nth weekday of the month</div>
          <div className="drow">
            <span className="dlbl">The</span>
            <select className="dsel" value={value.ordinal??1}
              onChange={e=>set({ordinal:Number(e.target.value)})}>
              {ORDINALS.map((o,i)=><option key={o} value={ORDINAL_VALS[i]}>{o}</option>)}
            </select>
            <select className="dsel" value={value.day??0}
              onChange={e=>set({day:Number(e.target.value)})}>
              {DAYS.map((d,i)=><option key={d} value={i}>{d}</option>)}
            </select>
            <span className="dlbl">of each month</span>
          </div>
        </div>
      )}

      {type === "holiday" && (
        <div className="dcfg">
          <div className="dcfg-lbl">Relative to a holiday</div>
          <div className="drow">
            <select className="dsel" value={value.offset??0}
              onChange={e=>set({offset:Number(e.target.value)})}>
              {OFFSETS.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            <select className="dsel" value={value.holiday||"easter"}
              onChange={e=>set({holiday:e.target.value})}>
              {HOLIDAYS.map(h=><option key={h.id} value={h.id}>{h.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {preview && (
        <div className="dprev">
          <span className="dprev-ic">
            {type==="single"?"📅":type==="holiday"?"🎉":"🔁"}
          </span>
          <span className="dprev-txt">{preview}</span>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const getCat  = id => CATEGORIES.find(c=>c.id===id);
const getCon  = id => CONTACTS.find(c=>c.id===id);

export default function App() {
  const [items,  setItems]  = useState(SAMPLE);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState(blank());

  const openAdd  = ()     => { setForm(blank()); setEditId(null); setOpen(true); };
  const openEdit = item   => { setForm({...item}); setEditId(item.id); setOpen(true); };
  const close    = ()     => { setOpen(false); setEditId(null); };

  const save = () => {
    if (!form.title.trim()) return;
    if (editId) setItems(p=>p.map(i=>i.id===editId?{...form,id:editId}:i));
    else        setItems(p=>[...p,{...form,id:Date.now()}]);
    close();
  };

  const del = id => setItems(p=>p.filter(i=>i.id!==id));

  const togCon = id => setForm(f=>({
    ...f,
    contacts: f.contacts.includes(id)?f.contacts.filter(c=>c!==id):[...f.contacts,id]
  }));

  const shown = items.filter(item=>{
    const mc = filter==="all"||item.category===filter;
    const ms = !search||item.title.toLowerCase().includes(search.toLowerCase())||(item.note||"").toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });

  const cnt = catId => items.filter(i=>i.category===catId).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        <div className="hdr">
          <div className="hdr-top">
            <div className="brand">
              <span className="eyebrow">Your City Guide</span>
              <h1 className="logo">Around <em>Town</em></h1>
            </div>
            <button className="add-btn" onClick={openAdd}>＋ Add Entry</button>
          </div>
          <div className="hdr-row2">
            <div className="srch">
              <span className="srch-ic">⌕</span>
              <input placeholder="Search entries…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <span className="cnt">{shown.length} {shown.length===1?"entry":"entries"}</span>
          </div>
        </div>

        <div className="filters">
          <button className={`pill ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>
            <span className="ic">✦</span> All <span className="badge">{items.length}</span>
          </button>
          {CATEGORIES.map(c=>(
            <button key={c.id} className={`pill ${filter===c.id?"on":""}`} onClick={()=>setFilter(c.id)}>
              <span className="ic">{c.icon}</span>{c.label}<span className="badge">{cnt(c.id)}</span>
            </button>
          ))}
        </div>

        <div className="grid">
          {shown.length===0
            ? <div className="empty"><div className="empty-ic">🗺️</div><p>Nothing here yet — add your first entry!</p></div>
            : shown.map(item=><Card key={item.id} item={item} onEdit={openEdit} onDel={del}/>)
          }
        </div>
      </div>

      {open && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&close()}>
          <div className="modal">
            <h2 className="mtitle">{editId?"Edit Entry":"New Entry"}</h2>
            <button className="mclose" onClick={close}>✕</button>

            <div className="ff">
              <label className="fl">Category</label>
              <div className="cats">
                {CATEGORIES.map(c=>(
                  <button key={c.id} className={`catopt ${form.category===c.id?"on":""}`}
                    style={form.category===c.id?{borderColor:c.color}:{}}
                    onClick={()=>setForm(f=>({...f,category:c.id}))}>
                    <span className="ic">{c.icon}</span>{c.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="ff">
              <label className="fl">Title</label>
              <input className="fi" placeholder="Name or title…"
                value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            </div>

            <div className="ff">
              <label className="fl">When</label>
              <DateSchedulePicker
                value={form.schedule||{type:"none"}}
                onChange={s=>setForm(f=>({...f,schedule:s}))}
              />
            </div>

            <div className="ff">
              <label className="fl">Notes</label>
              <textarea className="fta" placeholder="Details, tips, links…"
                value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
            </div>

            <div className="ff">
              <label className="fl">Tag Friends</label>
              <div className="contacts">
                {CONTACTS.map(c=>(
                  <button key={c.id} className={`copt ${form.contacts.includes(c.id)?"on":""}`}
                    style={form.contacts.includes(c.id)?{borderColor:c.color}:{}}
                    onClick={()=>togCon(c.id)}>
                    <div className="csm" style={{background:c.color}}>{c.avatar}</div>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="ff">
              <div className={`prio ${form.priority?"on":""}`}
                onClick={()=>setForm(f=>({...f,priority:!f.priority}))}>
                <span className="star">{form.priority?"★":"☆"}</span>
                <span className="lbl">{form.priority?"Priority — do this soon":"Mark as priority"}</span>
              </div>
            </div>

            <div className="mfoot">
              <button className="bsec" onClick={close}>Cancel</button>
              <button className="bpri" onClick={save}>{editId?"Save Changes":"Add Entry"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ item, onEdit, onDel }) {
  const cat      = getCat(item.category);
  const contacts = (item.contacts||[]).map(getCon).filter(Boolean);
  const shown    = contacts.slice(0,4);
  const extra    = contacts.length - shown.length;
  const dateStr  = describe(item.schedule);
  const recurring = item.schedule?.type && !["none","single"].includes(item.schedule.type);

  return (
    <div className="card">
      <div className="stripe" style={{background:cat?.color}}/>
      <div className="cmeta">
        <span className="ccat-ic">{cat?.icon}</span>
        <span className="ccat-lb">{cat?.label}</span>
        {dateStr && (
          <span className="cdate">
            {recurring && <span className="rdot"/>}
            {dateStr}
          </span>
        )}
      </div>
      <div className="chdr">
        <div className="ctitle">{item.title}</div>
        {item.priority && <span className="cstar">★</span>}
      </div>
      {item.note && <p className="cnote">{item.note}</p>}
      <div className="cfoot">
        <div className="cavs">
          {shown.map(c=><div key={c.id} className="av" style={{background:c.color}} title={c.name}>{c.avatar}</div>)}
          {extra>0 && <div className="av av-more">+{extra}</div>}
        </div>
        <div className="cacts">
          <button className="cact" onClick={()=>onEdit(item)} title="Edit">✎</button>
          <button className="cact del" onClick={()=>onDel(item.id)} title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
}
