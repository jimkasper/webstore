import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIGURE ───────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
// Generate VAPID keys: https://vapidkeys.com — paste your PUBLIC key here
const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch { return null; }
}

async function requestPushPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function showLocalNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}


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

const COLLAB_TYPES = [
  "Project / Idea / Business", "Hire / Employ / Get Help With",
  "Make Offer", "We Should...", "Discussions / Podcast Episodes",
  "We're Both Into", "Look Up", "Financier"
];

const DAYS_OF_WEEK = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest first" },
  { value: "oldest",  label: "Oldest first" },
  { value: "az",      label: "A → Z" },
  { value: "za",      label: "Z → A" },
  { value: "followup",label: "Follow-up due" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fullName(c) { return [c.first_name, c.last_name].filter(Boolean).join(" "); }

function exportCSV(contacts) {
  const cols = [
    "first_name","last_name","email","phone","profession","company",
    "location","birthday","met_at","when_met","mutual_friends","talked",
    "contact_methods","collaborations","note","followup_date","flagged","created_at"
  ];
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [
    cols.join(","),
    ...contacts.map(c => cols.map(col => {
      const v = c[col];
      if (Array.isArray(v)) return escape(JSON.stringify(v));
      return escape(v);
    }).join(","))
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `peeps-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

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
  const name = fullName(contact);
  const isFollowupDue = contact.followup_date && new Date(contact.followup_date) <= new Date();
  return (
    <div onClick={() => onClick(contact)} style={{
      background: "#111", border: `1.5px solid ${contact.flagged ? "#f9742222" : isFollowupDue ? "#f9a82522" : "#1e1e1e"}`,
      borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.2s",
      display: "flex", gap: 14, alignItems: "flex-start"
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8f04a44"; e.currentTarget.style.background = "#141414"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = contact.flagged ? "#f9742222" : isFollowupDue ? "#f9a82522" : "#1e1e1e"; e.currentTarget.style.background = "#111"; }}
    >
      <Avatar name={name} photo={contact.photo} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#f0f0f0", fontWeight: 700 }}>{name || "Unknown"}</span>
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {contact.flagged && <span title="Flagged for review" style={{ fontSize: 13 }}>🚩</span>}
            {isFollowupDue && <span title="Follow-up due" style={{ fontSize: 13 }}>⏰</span>}
            {contact.met_at && <Tag label={contact.met_at} color="#888" />}
          </div>
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

// ─── EDIT FORM ───────────────────────────────────────────────────────────────

function EditForm({ contact, onSave, onCancel }) {
  const [form, setForm] = useState({ ...contact });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = {
    width: "100%", background: "#0d0d0d", border: "1.5px solid #2a2a2a",
    borderRadius: 8, padding: "9px 12px", color: "#f0f0f0",
    fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none", boxSizing: "border-box"
  };
  const labelStyle = { fontSize: 10, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 4 };

  const field = (label, key, type = "text") => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key] || ""} onChange={e => set(key)(e.target.value)}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = "#c8f04a"}
        onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {field("FIRST NAME", "first_name")}
        {field("LAST NAME", "last_name")}
        {field("EMAIL", "email", "email")}
        {field("PHONE", "phone")}
        {field("PROFESSION / HOBBY / SKILL", "profession")}
        {field("COMPANY", "company")}
        {field("LOCATION", "location")}
        {field("BIRTHDAY", "birthday")}
      </div>
      {field("WHERE WE MET", "met_at")}
      {field("WHEN WE MET", "when_met")}
      {field("MUTUAL FRIENDS", "mutual_friends")}
      <div>
        <label style={labelStyle}>WHAT WE TALKED ABOUT</label>
        <textarea value={form.talked || ""} onChange={e => set("talked")(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#c8f04a"}
          onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
      </div>
      <div>
        <label style={labelStyle}>NOTES</label>
        <textarea value={form.note || ""} onChange={e => set("note")(e.target.value)} rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#c8f04a"}
          onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(form)} style={{ flex: 1, background: "#c8f04a", color: "#0d0d0d", border: "none", borderRadius: 8, padding: "11px 0", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Save Changes</button>
        <button onClick={onCancel} style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#888", borderRadius: 8, padding: "11px 16px", fontFamily: "'Space Mono', monospace", fontSize: 12, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── REMINDERS PANEL ─────────────────────────────────────────────────────────

function RemindersPanel({ contact, onSave }) {
  const STORAGE_KEY = `reminders_${contact.id}`;
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [pushGranted, setPushGranted] = useState(Notification?.permission === "granted");
  const [type, setType] = useState("datetime");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("09:00");
  const [dayVal, setDayVal] = useState("Monday");
  const [noteVal, setNoteVal] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("0.5");
  const [geoLoading, setGeoLoading] = useState(false);

  const save = (updated) => {
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addReminder = () => {
    const r = { id: Date.now(), type, note: noteVal, created: new Date().toISOString() };
    if (type === "datetime")  { if (!dateVal) return; r.date = dateVal; r.time = timeVal; }
    if (type === "dayofweek") { r.day = dayVal; r.time = timeVal; }
    if (type === "location")  { if (!lat || !lng) return; r.lat = parseFloat(lat); r.lng = parseFloat(lng); r.radius = parseFloat(radius); }
    save([...reminders, r]);
    setNoteVal(""); setDateVal(""); setTimeVal("09:00");
  };

  const removeReminder = (id) => save(reminders.filter(r => r.id !== id));

  const captureLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(5)); setLng(pos.coords.longitude.toFixed(5)); setGeoLoading(false); },
      () => { alert("Location access denied."); setGeoLoading(false); }
    );
  };

  const enablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) { await subscribeToPush(); setPushGranted(true); }
    else alert("Please allow notifications in your browser settings.");
  };

  const labelStyle = { fontSize: 10, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 4 };
  const inputStyle = { background: "#111", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "8px 10px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 11, outline: "none", width: "100%", boxSizing: "border-box" };
  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#c8f04a", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>🔔 REMINDERS</div>
        {!pushGranted && (
          <button onClick={enablePush} style={{ background: "#c8f04a18", border: "1px solid #c8f04a44", color: "#c8f04a", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
            Enable push
          </button>
        )}
      </div>

      {/* Type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {[["datetime","📅 Date & Time"],["dayofweek","📆 Day of Week"],["location","📍 Location"]].map(([val, label]) => (
          <button key={val} onClick={() => setType(val)} style={{
            background: type === val ? "#c8f04a18" : "transparent",
            border: `1.5px solid ${type === val ? "#c8f04a44" : "#2a2a2a"}`,
            color: type === val ? "#c8f04a" : "#666",
            borderRadius: 7, padding: "6px 4px", fontSize: 10,
            fontFamily: "'Space Mono', monospace", cursor: "pointer", textAlign: "center"
          }}>{label}</button>
        ))}
      </div>

      {/* Date/time inputs */}
      {type === "datetime" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={labelStyle}>DATE</label>
            <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>
          <div>
            <label style={labelStyle}>TIME</label>
            <input type="time" value={timeVal} onChange={e => setTimeVal(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>
        </div>
      )}

      {/* Day of week inputs */}
      {type === "dayofweek" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={labelStyle}>DAY</label>
            <select value={dayVal} onChange={e => setDayVal(e.target.value)} style={selectStyle}>
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>TIME</label>
            <input type="time" value={timeVal} onChange={e => setTimeVal(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>
        </div>
      )}

      {/* Location inputs */}
      {type === "location" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={captureLocation} disabled={geoLoading} style={{
            background: "#1a1a1a", border: "1.5px solid #2a2a2a", color: "#888",
            borderRadius: 8, padding: "9px", fontFamily: "'Space Mono', monospace",
            fontSize: 11, cursor: "pointer"
          }}>{geoLoading ? "Getting location..." : "📍 Use my current location"}</button>
          {lat && lng && <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace" }}>📌 {lat}, {lng}</div>}
          <div>
            <label style={labelStyle}>ALERT RADIUS (miles)</label>
            <select value={radius} onChange={e => setRadius(e.target.value)} style={selectStyle}>
              {["0.1","0.25","0.5","1","2","5"].map(r => <option key={r} value={r}>{r} mile{r !== "1" ? "s" : ""}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Note input */}
      <div>
        <label style={labelStyle}>REMINDER NOTE (optional)</label>
        <input value={noteVal} onChange={e => setNoteVal(e.target.value)} placeholder="e.g. Follow up about the project..."
          style={inputStyle} />
      </div>

      <button onClick={addReminder} style={{
        background: "#c8f04a", color: "#0d0d0d", border: "none", borderRadius: 8,
        padding: "9px", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11, cursor: "pointer"
      }}>+ Add Reminder</button>

      {/* Existing reminders */}
      {reminders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, color: "#444", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>SAVED REMINDERS</div>
          {reminders.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#111", borderRadius: 8, padding: "9px 12px", border: "1px solid #1e1e1e" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Space Mono', monospace" }}>
                  {r.type === "datetime"  && `📅 ${r.date} at ${r.time}`}
                  {r.type === "dayofweek" && `📆 Every ${r.day} at ${r.time}`}
                  {r.type === "location"  && `📍 Within ${r.radius}mi of saved location`}
                </div>
                {r.note && <div style={{ fontSize: 11, color: "#666", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{r.note}</div>}
              </div>
              <button onClick={() => removeReminder(r.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, flexShrink: 0, paddingLeft: 8 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CONTACT DETAIL ───────────────────────────────────────────────────────────

function ContactDetail({ contact, onClose, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [followupDate, setFollowupDate] = useState(contact.followup_date || "");
  const [savingFollowup, setSavingFollowup] = useState(false);
  const name = fullName(contact);

  const saveFollowup = async () => {
    setSavingFollowup(true);
    const { error } = await supabase.from("contacts").update({ followup_date: followupDate || null }).eq("id", contact.id);
    if (!error) onSave({ ...contact, followup_date: followupDate || null });
    setSavingFollowup(false);
  };

  const toggleFlagged = async () => {
    const newVal = !contact.flagged;
    const { error } = await supabase.from("contacts").update({ flagged: newVal }).eq("id", contact.id);
    if (!error) onSave({ ...contact, flagged: newVal });
  };

  if (editing) return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && setEditing(false)}>
      <div style={{ background: "#111", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", border: "1.5px solid #2a2a2a", borderBottom: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#c8f04a", letterSpacing: 2 }}>EDITING — {name}</span>
        </div>
        <EditForm contact={contact} onSave={async updated => {
          const { error } = await supabase.from("contacts").update(updated).eq("id", contact.id);
          if (!error) { onSave(updated); setEditing(false); }
          else alert("Save failed: " + error.message);
        }} onCancel={() => setEditing(false)} />
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#111", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", border: "1.5px solid #2a2a2a", borderBottom: "none" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", letterSpacing: 2 }}>CONTACT DETAIL</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={toggleFlagged} title={contact.flagged ? "Remove flag" : "Flag for review"} style={{ background: contact.flagged ? "#f9742222" : "#1e1e1e", border: `1px solid ${contact.flagged ? "#f9742255" : "#2a2a2a"}`, borderRadius: 6, padding: "5px 10px", fontSize: 13, cursor: "pointer" }}>🚩</button>
            <button onClick={() => setEditing(true)} style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>✏️ Edit</button>
            <button onClick={() => { onDelete(contact.id); onClose(); }} style={{ background: "#ff444418", border: "1px solid #ff444433", color: "#ff4444", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Delete</button>
            <button onClick={onClose} style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>✕</button>
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <Avatar name={name} photo={contact.photo} size={72} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0f0f0", fontWeight: 700 }}>{name || "Unknown"}</div>
            {contact.profession && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#c8f04a", marginTop: 2 }}>{contact.profession}</div>}
            {contact.company && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#7eb8f7", marginTop: 1 }}>{contact.company}</div>}
            {contact.location && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 3 }}>📍 {contact.location}</div>}
            {contact.met_at && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 2 }}>📍 Met at: {contact.met_at}</div>}
            {contact.when_met && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 2 }}>📅 {contact.when_met}</div>}
            {contact.mutual_friends && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginTop: 2 }}>👥 {contact.mutual_friends}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Follow-up */}
          <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#f9a825", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>⏰ FOLLOW UP</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)}
                style={{ flex: 1, background: "#111", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "8px 12px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none", colorScheme: "dark" }}
                onFocus={e => e.target.style.borderColor = "#f9a825"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
              />
              <button onClick={saveFollowup} disabled={savingFollowup} style={{ background: "#f9a82522", border: "1px solid #f9a82544", color: "#f9a825", borderRadius: 8, padding: "8px 14px", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}>
                {savingFollowup ? "..." : "Set"}
              </button>
              {followupDate && <button onClick={() => { setFollowupDate(""); saveFollowup(); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14 }}>✕</button>}
            </div>
            {contact.followup_date && <div style={{ fontSize: 11, color: new Date(contact.followup_date) <= new Date() ? "#f9a825" : "#555", fontFamily: "'Space Mono', monospace", marginTop: 8 }}>
              {new Date(contact.followup_date) <= new Date() ? "⚠️ Due: " : "Due: "}{new Date(contact.followup_date).toLocaleDateString()}
            </div>}
          </div>

          {/* Reminders */}
          <RemindersPanel contact={contact} onSave={onSave} />

          {/* Contact info */}
          {(contact.email || contact.phone || contact.birthday) && (
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
                return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{p?.emoji || "🔗"}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", width: 90, flexShrink: 0 }}>{s.platform}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#a78bfa" }}>{s.handle}</span>
                </div>;
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

          {contact.talked && (
            <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>CONVERSATION</div>
              <div style={{ fontSize: 13, color: "#ccc", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}>"{contact.talked}"</div>
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

          {contact.business_card && (
            <div>
              <div style={{ fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>BUSINESS CARD</div>
              <img src={contact.business_card} alt="Business Card" style={{ width: "100%", borderRadius: 8, border: "1px solid #2a2a2a" }} />
            </div>
          )}

          {contact.flagged && (
            <div style={{ background: "#f9742210", border: "1px solid #f9742233", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#f97422", fontFamily: "'Space Mono', monospace" }}>🚩 Flagged for review — possible spam or duplicate</div>
            </div>
          )}

          <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
            Added: {new Date(contact.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Directory() {
  const [session, setSession]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [loginError, setLoginError]   = useState("");
  const [loggingIn, setLoggingIn]     = useState(false);
  const [contacts, setContacts]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState("");
  const [sort, setSort]               = useState("newest");
  const [filterCollab, setFilterCollab] = useState("");
  const [filterMet, setFilterMet]     = useState("");
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [filterFollowup, setFilterFollowup] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (error) console.error("Load error:", error);
    else setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { if (session) loadContacts(); }, [session]);

  // Check location-based reminders when app loads
  useEffect(() => {
    if (!session || !contacts.length) return;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      const toRad = d => d * Math.PI / 180;
      const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 3958.8; // miles
        const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      };
      contacts.forEach(c => {
        try {
          const key = `reminders_${c.id}`;
          const reminders = JSON.parse(localStorage.getItem(key) || "[]");
          reminders.filter(r => r.type === "location").forEach(r => {
            const dist = haversine(latitude, longitude, r.lat, r.lng);
            if (dist <= r.radius) {
              const name = fullName(c);
              showLocalNotification(`You're near ${name}`, r.note || `You wanted to reach out to ${name}`);
            }
          });
        } catch {}
      });
    }, () => {});
  }, [session, contacts]);

  // Check datetime + day-of-week reminders on load
  useEffect(() => {
    if (!session || !contacts.length) return;
    const now = new Date();
    const todayDay = DAYS_OF_WEEK[now.getDay()];
    const todayDate = now.toISOString().slice(0, 10);
    const currentTime = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    contacts.forEach(c => {
      try {
        const key = `reminders_${c.id}`;
        const reminders = JSON.parse(localStorage.getItem(key) || "[]");
        const name = fullName(c);
        reminders.forEach(r => {
          if (r.type === "datetime" && r.date === todayDate && r.time <= currentTime) {
            showLocalNotification(`Reminder: ${name}`, r.note || `Time to reach out to ${name}`);
          }
          if (r.type === "dayofweek" && r.day === todayDay && r.time <= currentTime) {
            showLocalNotification(`Weekly reminder: ${name}`, r.note || `It's ${todayDay} — reach out to ${name}`);
          }
        });
      } catch {}
    });
  }, [session, contacts]);

  const handleLogin = async () => {
    setLoggingIn(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Incorrect email or password.");
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setContacts([]); setSearch("");
  };

  const deleteContact = async (id) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { alert("Delete failed: " + error.message); return; }
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const updateContact = (updated) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selected?.id === updated.id) setSelected(updated);
  };

  // Unique met_at values for filter dropdown
  const metAtOptions = [...new Set(contacts.map(c => c.met_at).filter(Boolean))].sort();

  // Filter + sort
  const processed = contacts
    .filter(c => {
      const q = search.toLowerCase();
      const name = fullName(c).toLowerCase();
      if (q && ![name, c.email, c.profession, c.company, c.met_at, c.talked].some(f => f?.toLowerCase().includes(q))) return false;
      if (filterCollab && !c.collaborations?.some(x => x.type === filterCollab)) return false;
      if (filterMet && c.met_at !== filterMet) return false;
      if (filterFlagged && !c.flagged) return false;
      if (filterFollowup && !c.followup_date) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest")   return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "oldest")   return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "az")       return fullName(a).localeCompare(fullName(b));
      if (sort === "za")       return fullName(b).localeCompare(fullName(a));
      if (sort === "followup") {
        if (!a.followup_date) return 1;
        if (!b.followup_date) return -1;
        return new Date(a.followup_date) - new Date(b.followup_date);
      }
      return 0;
    });

  const activeFilters = [filterCollab, filterMet, filterFlagged && "Flagged", filterFollowup && "Has follow-up"].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        select option { background: #1a1a1a; color: #f0f0f0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#c8f04a", letterSpacing: 3, marginBottom: 6 }}>I'LL KEEP YOU UPDATED</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, lineHeight: 1 }}>Peeps</div>
            {session && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: "#c8f04a18", border: "1px solid #c8f04a33", borderRadius: 8, padding: "6px 12px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#c8f04a" }}>{contacts.length} people</div>
                <button onClick={() => exportCSV(contacts)} title="Export CSV" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14 }}>⬇️</button>
                <button onClick={handleLogout} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#666", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 14 }} title="Sign out">🔒</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {authLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444" }}>Checking session...</div>
            </div>
          ) : !session ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0f0f0", fontWeight: 700 }}>Private Directory</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555", marginTop: 8 }}>Sign in to access your contacts</div>
              </div>
              <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" value={email} placeholder="Email" onChange={e => { setEmail(e.target.value); setLoginError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus
                  style={{ background: "#111", border: `1.5px solid ${loginError ? "#ff4444" : "#2a2a2a"}`, borderRadius: 10, padding: "13px 16px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none" }} />
                <input type="password" value={password} placeholder="Password" onChange={e => { setPassword(e.target.value); setLoginError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ background: "#111", border: `1.5px solid ${loginError ? "#ff4444" : "#2a2a2a"}`, borderRadius: 10, padding: "13px 16px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none", letterSpacing: 3 }} />
                {loginError && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff4444", textAlign: "center" }}>{loginError}</div>}
                <button onClick={handleLogin} disabled={loggingIn} style={{ background: "#c8f04a", color: "#0d0d0d", border: "none", borderRadius: 10, padding: "13px 0", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: loggingIn ? 0.6 : 1 }}>
                  {loggingIn ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Search + filter toggle */}
              <div style={{ display: "flex", gap: 8 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, place, profession..."
                  style={{ flex: 1, background: "#111", border: "1.5px solid #1e1e1e", borderRadius: 10, padding: "11px 16px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#c8f04a44"} onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
                <button onClick={() => setShowFilters(f => !f)} style={{
                  background: showFilters || activeFilters > 0 ? "#c8f04a18" : "#111",
                  border: `1.5px solid ${showFilters || activeFilters > 0 ? "#c8f04a44" : "#1e1e1e"}`,
                  color: activeFilters > 0 ? "#c8f04a" : "#666", borderRadius: 10, padding: "0 14px",
                  fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap"
                }}>
                  {activeFilters > 0 ? `Filters (${activeFilters})` : "Filters"}
                </button>
              </div>

              {/* Filter + sort panel */}
              {showFilters && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 5 }}>SORT</div>
                      <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "100%", background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "8px", outline: "none" }}>
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 5 }}>WHERE MET</div>
                      <select value={filterMet} onChange={e => setFilterMet(e.target.value)} style={{ width: "100%", background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "8px", outline: "none" }}>
                        <option value="">All</option>
                        {metAtOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#666", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 5 }}>COLLABORATION TYPE</div>
                    <select value={filterCollab} onChange={e => setFilterCollab(e.target.value)} style={{ width: "100%", background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "8px", outline: "none" }}>
                      <option value="">All</option>
                      {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["filterFlagged", filterFlagged, setFilterFlagged, "🚩 Flagged only"], ["filterFollowup", filterFollowup, setFilterFollowup, "⏰ Has follow-up"]].map(([key, val, setter, label]) => (
                      <button key={key} onClick={() => setter(v => !v)} style={{ flex: 1, background: val ? "#c8f04a18" : "#0d0d0d", border: `1.5px solid ${val ? "#c8f04a44" : "#2a2a2a"}`, color: val ? "#c8f04a" : "#666", borderRadius: 8, padding: "8px", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {activeFilters > 0 && (
                    <button onClick={() => { setFilterCollab(""); setFilterMet(""); setFilterFlagged(false); setFilterFollowup(false); setSort("newest"); }} style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 8, padding: "7px", fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: "pointer" }}>
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Results count */}
              {(search || activeFilters > 0) && (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#555" }}>
                  {processed.length} of {contacts.length} contacts
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Loading...</div>
              ) : processed.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                  {contacts.length === 0 ? "No contacts yet." : "No matches found."}
                </div>
              ) : processed.map(c => <ContactCard key={c.id} contact={c} onClick={setSelected} />)}
            </div>
          )}
        </div>

        {selected && <ContactDetail contact={selected} onClose={() => setSelected(null)} onDelete={deleteContact} onSave={updateContact} />}
      </div>
    </>
  );
}
