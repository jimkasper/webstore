import { useState } from "react";

const PASSWORD = "2N72W2yZyBoPGM";

const SOCIAL_PLATFORMS = [
  { label: "Instagram", emoji: "📸" }, { label: "X / Twitter", emoji: "🐦" },
  { label: "TikTok", emoji: "🎵" },    { label: "YouTube", emoji: "▶️" },
  { label: "Spotify", emoji: "🎧" },   { label: "LinkedIn", emoji: "💼" },
  { label: "Facebook", emoji: "👥" },  { label: "Snapchat", emoji: "👻" },
  { label: "Pinterest", emoji: "📌" }, { label: "Twitch", emoji: "🎮" },
  { label: "SoundCloud", emoji: "🎶" },{ label: "Behance", emoji: "🎨" },
  { label: "GitHub", emoji: "💻" },    { label: "Discord", emoji: "💬" },
  { label: "Threads", emoji: "🧵" },   { label: "Other", emoji: "🔗" },
];

// Sample contacts so the directory has something to show
const SAMPLE_CONTACTS = [
  {
    id: "1", first_name: "Alex", last_name: "Rivera", profession: "Product Designer",
    company: "Studio R", email: "alex@example.com", phone: "+1 555 0101",
    location: "Austin, TX", birthday: "03/14",
    met_at: "Design Week 2024", mutual_friends: "Jordan Kim",
    talked: "Talked about branding for a new wellness app and potential collab.",
    contact_methods: ["Email", "Instagram DM"],
    social_handles: [{ platform: "Instagram", handle: "@alexrivera.design" }],
    personal_links: [{ label: "Portfolio", url: "https://alexrivera.co" }],
    collaborations: [{ type: "Project / Idea / Business", text: "Wellness app branding" }, { type: "Discussions / Podcast Episodes", text: "Design industry trends" }],
    note: "Loves hiking. Follow up in January.", photo: "", business_card: "",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "2", first_name: "Marcus", last_name: "Chen", profession: "Software Engineer",
    company: "Freelance", email: "marcus@example.com", phone: "+1 555 0202",
    location: "San Francisco, CA", birthday: "07/22",
    met_at: "Tech Meetup SF", mutual_friends: "",
    talked: "Discussed building a SaaS product together. He has backend experience.",
    contact_methods: ["Phone", "LinkedIn"],
    social_handles: [{ platform: "GitHub", handle: "@marcuschen" }, { platform: "LinkedIn", handle: "marcus-chen-dev" }],
    personal_links: [{ label: "GitHub", url: "https://github.com/marcuschen" }],
    collaborations: [{ type: "Hire / Employ / Get Help With", text: "Backend development for SaaS" }],
    note: "", photo: "", business_card: "",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: "3", first_name: "Simone", last_name: "Baptiste", profession: "Musician / Producer",
    company: "Independent", email: "simone@example.com", phone: "+1 555 0303",
    location: "New Orleans, LA", birthday: "11/05",
    met_at: "Jazz Fest 2024", mutual_friends: "DeShawn Williams",
    talked: "Songwriting, live performance tips, and potential podcast collab.",
    contact_methods: ["Text", "Instagram DM"],
    social_handles: [{ platform: "Instagram", handle: "@simonebaptiste" }, { platform: "Spotify", handle: "Simone Baptiste" }],
    personal_links: [{ label: "Spotify", url: "https://spotify.com/artist/simonebaptiste" }],
    collaborations: [{ type: "Discussions / Podcast Episodes", text: "Music production process" }, { type: "We're Both Into", text: "Jazz and Neo-Soul" }],
    note: "Send her the podcast link when it goes live.", photo: "", business_card: "",
    created_at: new Date(Date.now() - 86400000 * 21).toISOString()
  },
];

function Tag({ label, color = "#c8f04a" }) {
  return (
    <span style={{ background: color + "18", border: `1px solid ${color}44`, color, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Avatar({ name, photo, size = 48 }) {
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #c8f04a" }} />;
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "2px solid #c8f04a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace", fontSize: size * 0.33, color: "#c8f04a", fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ContactCard({ contact, onClick }) {
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
  return (
    <div onClick={() => onClick(contact)} style={{ background: "#111", border: "1.5px solid #1e1e1e", borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.2s", display: "flex", gap: 14, alignItems: "flex-start" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8f04a44"; e.currentTarget.style.background = "#141414"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.background = "#111"; }}>
      <Avatar name={fullName} photo={contact.photo} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#f0f0f0", fontWeight: 700 }}>{fullName || "Unknown"}</span>
          {contact.met_at && <Tag label={contact.met_at} color="#888" />}
        </div>
        {contact.profession && <div style={{ fontSize: 12, color: "#c8f04a", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{contact.profession}</div>}
        {contact.company && <div style={{ fontSize: 11, color: "#7eb8f7", fontFamily: "'Space Mono', monospace", marginTop: 1 }}>{contact.company}</div>}
        {contact.talked && <div style={{ fontSize: 12, color: "#666", marginTop: 4, fontFamily: "Georgia, serif", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>"{contact.talked}"</div>}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
          {contact.collaborations?.slice(0, 2).map((c, i) => <Tag key={i} label={c.type} color="#a78bfa" />)}
        </div>
      </div>
    </div>
  );
}

function ContactDetail({ contact, onClose }) {
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#111", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 540, maxHeight: "88vh", overflowY: "auto", border: "1.5px solid #2a2a2a", borderBottom: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", letterSpacing: 2 }}>CONTACT DETAIL</span>
          <button onClick={onClose} style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>✕ Close</button>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <Avatar name={fullName} photo={contact.photo} size={72} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0f0f0", fontWeight: 700 }}>{fullName || "Unknown"}</div>
            {contact.profession && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#c8f04a", marginTop: 2 }}>{contact.profession}</div>}
            {contact.company && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#7eb8f7", marginTop: 1 }}>{contact.company}</div>}
            {contact.location && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 3 }}>📍 {contact.location}</div>}
            {contact.met_at && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 2 }}>Met at: {contact.met_at}</div>}
            {contact.birthday && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 2 }}>🎂 {contact.birthday}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(contact.email || contact.phone) && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {contact.email && <div style={{ fontSize: 13, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>✉ {contact.email}</div>}
              {contact.phone && <div style={{ fontSize: 13, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>📞 {contact.phone}</div>}
              {contact.birthday && <div style={{ fontSize: 13, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>🎂 {contact.birthday}</div>}
            </div>
          )}
          {contact.contact_methods?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>PREFERRED CONTACT</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{contact.contact_methods.map(m => <Tag key={m} label={m} color="#f9a825" />)}</div>
            </div>
          )}
          {contact.social_handles?.filter(s => s.handle).length > 0 && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>SOCIAL MEDIA</div>
              {contact.social_handles.filter(s => s.handle).map((s, i) => {
                const p = SOCIAL_PLATFORMS.find(x => x.label === s.platform);
                return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><span style={{ fontSize: 16 }}>{p?.emoji || "🔗"}</span><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", width: 90, flexShrink: 0 }}>{s.platform}</span><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#a78bfa" }}>{s.handle}</span></div>;
              })}
            </div>
          )}
          {contact.personal_links?.filter(l => l.url).length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>WEBSITE / MEDIA LINK</div>
              {contact.personal_links.filter(l => l.url).map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#0d0d0d", borderRadius: 8, padding: "9px 12px", textDecoration: "none", border: "1px solid #1e1e1e", marginBottom: 6 }}>
                  <span>🌐</span><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#c8f04a" }}>{l.label || l.url}</span>
                </a>
              ))}
            </div>
          )}
          {(contact.met_at || contact.mutual_friends || contact.talked) && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>CONTEXT</div>
              {contact.met_at && <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>📍 Met at: {contact.met_at}</div>}
              {contact.mutual_friends && <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>👥 {contact.mutual_friends}</div>}
              {contact.talked && <div style={{ fontSize: 13, color: "#ccc", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6, marginTop: 4 }}>"{contact.talked}"</div>}
            </div>
          )}
          {contact.collaborations?.filter(c => c.text).length > 0 && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>COLLABORATION</div>
              {contact.collaborations.filter(c => c.text).map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ background: "#c8f04a18", border: "1px solid #c8f04a44", color: "#c8f04a", borderRadius: 4, padding: "2px 7px", fontSize: 10, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap", flexShrink: 0 }}>{c.type}</span>
                  <span style={{ fontSize: 13, color: "#ccc", fontFamily: "Georgia, serif", lineHeight: 1.5 }}>{c.text}</span>
                </div>
              ))}
            </div>
          )}
          {contact.note && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>NOTES</div>
              <div style={{ fontSize: 13, color: "#ccc", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}>{contact.note}</div>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace" }}>Added: {new Date(contact.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed]   = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]   = useState("");

  const tryUnlock = () => {
    if (pwInput === PASSWORD) { setAuthed(true); setPwInput(""); }
    else { setPwError(true); setPwInput(""); }
  };

  const filtered = SAMPLE_CONTACTS.filter(c => {
    const q = search.toLowerCase();
    const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ");
    return !q || [fullName, c.email, c.profession, c.company, c.met_at, c.talked].some(f => f?.toLowerCase().includes(q));
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#c8f04a", letterSpacing: 3, marginBottom: 6 }}>I'LL KEEP YOU UPDATED</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, lineHeight: 1 }}>Peeps</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ background: "#c8f04a18", border: "1px solid #c8f04a33", borderRadius: 8, padding: "5px 10px", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#c8f04a" }}>PREVIEW</div>
              {authed && (
                <>
                  <div style={{ background: "#c8f04a18", border: "1px solid #c8f04a33", borderRadius: 8, padding: "6px 12px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#c8f04a" }}>{SAMPLE_CONTACTS.length} people</div>
                  <button onClick={() => { setAuthed(false); setSearch(""); }} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#666", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 15 }} title="Lock">🔒</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          {!authed ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0f0f0", fontWeight: 700 }}>Private Directory</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginTop: 8 }}>Sign in to access your contacts</div>
              </div>
              <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(false); }} onKeyDown={e => e.key === "Enter" && tryUnlock()} placeholder="Password" autoFocus
                  style={{ background: "#111", border: `1.5px solid ${pwError ? "#ff4444" : "#2a2a2a"}`, borderRadius: 10, padding: "13px 16px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none", textAlign: "center", letterSpacing: 4 }} />
                {pwError && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff4444", textAlign: "center" }}>Incorrect password</div>}
                <button onClick={tryUnlock} style={{ background: "#c8f04a", color: "#0d0d0d", border: "none", borderRadius: 10, padding: "13px 0", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Unlock</button>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#444", textAlign: "center", marginTop: 4 }}>Preview password: 2N72W2yZyBoPGM</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, company, place..."
                style={{ background: "#111", border: "1.5px solid #1e1e1e", borderRadius: 10, padding: "11px 16px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none", width: "100%" }}
                onFocus={e => e.target.style.borderColor = "#c8f04a44"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
              {filtered.length === 0
                ? <div style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>No matches found.</div>
                : filtered.map(c => <ContactCard key={c.id} contact={c} onClick={setSelected} />)
              }
            </div>
          )}
        </div>

        {selected && <ContactDetail contact={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
