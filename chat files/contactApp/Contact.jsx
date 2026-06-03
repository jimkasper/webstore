import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIGURE ───────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const TURNSTILE_SITE_KEY = "YOUR_TURNSTILE_SITE_KEY";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CONTACT_METHODS = [
  "Email", "Phone", "WhatsApp", "Text", "Instagram DM",
  "X / Twitter DM", "LinkedIn", "Telegram", "Signal", "Discord"
];
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
const METHOD_TO_PLATFORM = {
  "Instagram DM": "Instagram", "X / Twitter DM": "X / Twitter",
  "LinkedIn": "LinkedIn",      "WhatsApp": null,
  "Telegram": "Telegram",      "Signal": "Signal",
  "Discord": "Discord",
};

// ─── CLIENT-SIDE SANITIZATION ────────────────────────────────────────────────
// First line of defence before data reaches the Edge Function.

const MAX_TEXT   = 2000;
const MAX_IMAGE  = 2 * 1024 * 1024; // 2 MB

function sanitizeText(val, max = MAX_TEXT) {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, max);
}

function sanitizeImage(val) {
  if (!val || typeof val !== "string") return "";
  if (!val.startsWith("data:image/")) return "";
  const allowed = ["data:image/jpeg", "data:image/png", "data:image/webp", "data:image/gif"];
  if (!allowed.some(t => val.startsWith(t))) return "";
  const base64 = val.split(",")[1] ?? "";
  if (base64.length * 0.75 > MAX_IMAGE) {
    alert("Image is too large. Please use an image under 2 MB.");
    return "";
  }
  return val;
}

function sanitizeForm(form) {
  return {
    ...form,
    first_name: sanitizeText(form.first_name, 100),
    last_name:  sanitizeText(form.last_name, 100),
    company:    sanitizeText(form.company, 200),
    location:   sanitizeText(form.location, 200),
    birthday:   [form.birthday?.month, form.birthday?.day, form.birthday?.year].filter(Boolean).join('/') || '',
    email:      sanitizeText(form.email, 254),
    phone:      sanitizeText(form.phone, 30),
    profession: sanitizeText(form.profession, 200),
    met_at:         sanitizeText(form.met_at, 200),
    when_met:       [form.when_met?.month, form.when_met?.day, form.when_met?.year].filter(Boolean).join('/') || '',
    mutual_friends: sanitizeText(form.mutual_friends, 300),
    talked:     sanitizeText(form.talked, MAX_TEXT),
    photo:              sanitizeImage(form.photo),
    business_card:      sanitizeImage(form.business_card),
    collaborations: (form.collaborations || []).slice(0, 30).map(c => ({
      type: sanitizeText(c.type, 50),
      text: sanitizeText(c.text, 500),
    })).filter(c => c.text),
    note: sanitizeText(form.note, 2000),
    contact_methods:    (form.contact_methods || []).slice(0, 20).map(v => sanitizeText(v, 100)),
    social_handles:     (form.social_handles || []).slice(0, 20).map(h => ({
      platform: sanitizeText(h.platform, 50),
      handle:   sanitizeText(h.handle, 100),
    })),
    personal_links: (form.personal_links || []).slice(0, 20).map(l => ({
      label: sanitizeText(l.label, 100),
      url:   sanitizeText(l.url, 500),
    })).filter(l => !l.url || l.url.match(/^https?:\/\/.+/)),
    media_links: (form.media_links || []).slice(0, 20).map(l => ({
      label: sanitizeText(l.label, 100),
      url:   sanitizeText(l.url, 500),
    })).filter(l => !l.url || l.url.match(/^https?:\/\/.+/)),
  };
}

// ─── UI HELPERS ─────────────────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 2px" }}>
      <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
      <span style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required = false, error = false, autoComplete }) {
  const borderColor = error ? "#ff4444" : "#2a2a2a";
  const focusColor  = error ? "#ff6666" : "#c8f04a";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: error ? "#ff4444" : "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "flex", gap: 5, alignItems: "center" }}>
        {label}{required && <span style={{ color: "#f9a825", fontSize: 13 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ background: error ? "#ff44440a" : "#0d0d0d", border: `1.5px solid ${borderColor}`, borderRadius: 8, padding: "10px 14px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => e.target.style.borderColor = focusColor}
        onBlur={e => e.target.style.borderColor = borderColor}
      />
      {error && <span style={{ fontSize: 10, color: "#ff4444", fontFamily: "'Space Mono', monospace" }}>This field is required</span>}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "10px 14px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none", resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = "#c8f04a"}
        onBlur={e => e.target.style.borderColor = "#2a2a2a"}
      />
    </div>
  );
}

function PhotoInput({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{label}</label>
      <div onClick={() => ref.current.click()} style={{ border: "1.5px dashed #333", borderRadius: 8, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#0d0d0d" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#c8f04a"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}
      >
        {value
          ? <img src={value} alt="preview" style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 6, objectFit: "cover" }} />
          : <><span style={{ fontSize: 24 }}>📷</span><span style={{ fontSize: 12, color: "#666", fontFamily: "'Space Mono', monospace" }}>Click to upload</span></>
        }
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f); }} style={{ display: "none" }} />
    </div>
  );
}


function CheckboxList({ options, value = [], onChange, color = "#c8f04a" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {options.map(opt => { const checked = value.includes(opt); return (
        <label key={opt} onClick={() => onChange(checked ? value.filter(v => v !== opt) : [...value, opt])}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 10px", borderRadius: 7, background: checked ? color + "10" : "#0d0d0d", border: `1.5px solid ${checked ? color + "55" : "#1e1e1e"}` }}
        >
          <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${checked ? color : "#444"}`, background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {checked && <span style={{ fontSize: 10, color: "#0d0d0d", fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: checked ? color : "#777" }}>{opt}</span>
        </label>
      ); })}
    </div>
  );
}


const COLLAB_TYPES = ["Project / Idea / Business", "Hire / Employ / Get Help With", "Make Offer", "We Should...", "Discussions / Podcast Episodes", "We're Both Into", "Look Up", "Financier"];

function CollaborationInput({ value = [], onChange }) {
  const updateRow = (i, field, val) => {
    const updated = value.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(updated);
  };
  const removeRow = (i) => onChange(value.filter((_, idx) => idx !== i));

  // Always show existing rows + one blank row at the end if last is filled
  const rows = value.length === 0 || value[value.length - 1].text
    ? [...value, { type: "", text: "" }]
    : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, i) => {
        const isGhost = i === rows.length - 1 && !row.text && i === value.length;
        return (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <select
              value={row.type}
              onChange={e => {
                if (isGhost) {
                  onChange([...value, { type: e.target.value, text: "" }]);
                } else {
                  updateRow(i, "type", e.target.value);
                }
              }}
              style={{
                background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8,
                color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11,
                padding: "9px 8px", outline: "none", cursor: "pointer", flexShrink: 0,
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#c8f04a"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            >
              <option value="" disabled>Select a type...</option>
              {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              value={row.text}
              onChange={e => {
                const v = e.target.value;
                if (isGhost) {
                  onChange([...value, { type: row.type, text: v }]);
                } else {
                  updateRow(i, "text", v);
                }
              }}
              placeholder="Describe it..."
              style={{
                flex: 1, background: "#0d0d0d", border: "1.5px solid #2a2a2a",
                borderRadius: 8, padding: "9px 12px", color: "#f0f0f0",
                fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#c8f04a"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            />
            {!isGhost && (
              <button onClick={() => removeRow(i)} style={{
                background: "none", border: "none", color: "#555",
                cursor: "pointer", fontSize: 16, padding: "7px 4px", flexShrink: 0
              }}>✕</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SocialHandlesInput({ value = [], onChange }) {
  const addRow = () => onChange([...value, { platform: "Instagram", handle: "" }]);
  const updateRow = (i, field, val) => onChange(value.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeRow = (i) => onChange(value.filter((_, idx) => idx !== i));
  const rows = value.length === 0 ? [{ platform: "Instagram", handle: "" }] : value;
  const isControlled = value.length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={row.platform} onChange={e => isControlled ? updateRow(i, "platform", e.target.value) : onChange([{ platform: e.target.value, handle: row.handle }])}
            style={{ background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, color: "#aaa", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "9px 8px", outline: "none", cursor: "pointer", flexShrink: 0 }}>
            {SOCIAL_PLATFORMS.map(p => <option key={p.label} value={p.label}>{p.emoji} {p.label}</option>)}
          </select>
          <input value={row.handle} onChange={e => { const v = e.target.value; if (!isControlled && v) onChange([{ platform: row.platform, handle: v }]); else if (isControlled) updateRow(i, "handle", v); }} placeholder="@username"
            style={{ flex: 1, background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"} onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          {isControlled && <button onClick={() => removeRow(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: "4px 6px" }}>✕</button>}
        </div>
      ))}
      {(isControlled || rows[0]?.handle) && (
        <button type="button" onClick={isControlled ? addRow : () => onChange([...rows, { platform: "Instagram", handle: "" }])}
          style={{ background: "none", border: "1.5px dashed #333", borderRadius: 8, color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "8px", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8f04a"; e.currentTarget.style.color = "#c8f04a"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#555"; }}
        >+ Add another</button>
      )}
    </div>
  );
}

function LinksInput({ value = [], onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {value.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={row.label} onChange={e => onChange(value.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))} placeholder="Label"
            style={{ width: 100, flexShrink: 0, background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "9px 10px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 11, outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"} onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <input value={row.url} onChange={e => onChange(value.map((r, idx) => idx === i ? { ...r, url: e.target.value } : r))} placeholder={placeholder || "https://..."}
            style={{ flex: 1, background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 11, outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"} onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: "4px 6px" }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: "", url: "" }])}
        style={{ background: "none", border: "1.5px dashed #333", borderRadius: 8, color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 11, padding: "8px", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8f04a"; e.currentTarget.style.color = "#c8f04a"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#555"; }}
      >+ Add link</button>
    </div>
  );
}





// ─── BIRTHDAY INPUT ───────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const YEARS = Array.from({ length: 120 }, (_, i) => String(new Date().getFullYear() - i));

function BirthdayInput({ value = { month: "", day: "", year: "" }, onChange, label = "BIRTHDAY" }) {
  const fieldStyle = {
    background: "#0d0d0d", border: "1.5px solid #2a2a2a", borderRadius: 8,
    color: value ? "#f0f0f0" : "#555", fontFamily: "'Space Mono', monospace",
    fontSize: 12, padding: "10px 8px", outline: "none", cursor: "pointer",
    transition: "border-color 0.2s", appearance: "none", WebkitAppearance: "none",
    width: "100%"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr", gap: 8 }}>
        {/* Month */}
        <div style={{ position: "relative" }}>
          <select
            value={value.month}
            onChange={e => onChange({ ...value, month: e.target.value })}
            style={{ ...fieldStyle, color: value.month ? "#f0f0f0" : "#555" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          >
            <option value="" disabled>Month</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
          </select>
        </div>
        {/* Day */}
        <div style={{ position: "relative" }}>
          <select
            value={value.day}
            onChange={e => onChange({ ...value, day: e.target.value })}
            style={{ ...fieldStyle, color: value.day ? "#f0f0f0" : "#555" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          >
            <option value="" disabled>Day</option>
            {DAYS.map(d => <option key={d} value={d}>{parseInt(d)}</option>)}
          </select>
        </div>
        {/* Year — also typeable via combo of select + fallback */}
        <div style={{ position: "relative" }}>
          <input
            list="bday-years"
            value={value.year}
            onChange={e => onChange({ ...value, year: e.target.value })}
            placeholder="Year"
            maxLength={4}
            style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#c8f04a"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <datalist id="bday-years">
            {YEARS.map(y => <option key={y} value={y} />)}
          </datalist>
        </div>
      </div>
    </div>
  );
}


function TurnstileWidget({ onVerify, onExpire }) {
  const containerRef = useRef();
  const widgetIdRef = useRef(null);
  useEffect(() => {
    const initWidget = () => {
      if (!containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: token => onVerify(token),
        "expired-callback": () => { onExpire(); widgetIdRef.current = null; },
        "error-callback": () => { onExpire(); widgetIdRef.current = null; },
        theme: "dark",
      });
    };
    if (window.turnstile) { initWidget(); }
    else {
      if (!document.getElementById("cf-turnstile-script")) {
        const s = document.createElement("script");
        s.id = "cf-turnstile-script";
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true; s.defer = true; s.onload = initWidget;
        document.head.appendChild(s);
      } else {
        const poll = setInterval(() => { if (window.turnstile) { clearInterval(poll); initWidget(); } }, 100);
        return () => clearInterval(poll);
      }
    }
    return () => { if (widgetIdRef.current !== null && window.turnstile) { try { window.turnstile.remove(widgetIdRef.current); } catch {} widgetIdRef.current = null; } };
  }, []);
  return <div ref={containerRef} />;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const empty = {
    first_name: "", last_name: "", phone: "", email: "", profession: "", company: "", location: "", birthday: { month: "", day: "", year: "" }, met_at: "", when_met: { month: "", day: "", year: "" }, mutual_friends: "", talked: "",
    photo: "", business_card: "", collaborations: [],
    note: "",
    social_handles: [], personal_links: [], media_links: [], contact_methods: []
  };
  const DRAFT_KEY = "hitmeu p-contact-draft";

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...empty, ...JSON.parse(saved) } : empty;
    } catch { return empty; }
  };

  const [form, setForm] = useState(loadDraft);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Autosave draft on every form change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setDraftSaved(true);
      const t = setTimeout(() => setDraftSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [form]);

  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

  const set = key => val => setForm(f => ({ ...f, [key]: val }));

  const emailRequired   = form.contact_methods.includes("Email");
  const phoneRequired   = form.contact_methods.some(m => ["Phone", "Text", "WhatsApp"].includes(m));
  const requiredPlatforms = form.contact_methods.map(m => METHOD_TO_PLATFORM[m]).filter(Boolean);

  const getHandle = platform => form.social_handles.find(h => h.platform === platform)?.handle || "";
  const setHandle = (platform, handle) => setForm(f => {
    const existing = f.social_handles.find(h => h.platform === platform);
    return { ...f, social_handles: existing
      ? f.social_handles.map(h => h.platform === platform ? { ...h, handle } : h)
      : [...f.social_handles, { platform, handle }]
    };
  });

  const validate = () => {
    const e = {};
    if (emailRequired && !form.email.trim()) e.email = true;
    if (phoneRequired && !form.phone.trim()) e.phone = true;
    requiredPlatforms.forEach(p => { if (!getHandle(p).trim()) e[`platform_${p}`] = true; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!turnstileToken) { setErrors(e => ({ ...e, turnstile: true })); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: { contact: sanitizeForm(form), turnstileToken },
      });
      if (error || data?.error) { alert("Save failed: " + (error?.message || data?.error)); setSaving(false); setTurnstileToken(null); return; }
      setDone(true);
      clearDraft();
      setTimeout(() => { setDone(false); setForm(empty); setErrors({}); setTurnstileToken(null); }, 2500);
    } catch (err) {
      alert("Save failed: " + err.message);
    }
    setSaving(false);
  };

  if (done) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ fontSize: 56 }}>✓</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0f0f0", fontWeight: 700 }}>You're in the network.</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#666" }}>Thanks for connecting.</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        select option { background: #1a1a1a; color: #f0f0f0; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#c8f04a", letterSpacing: 3, marginBottom: 6 }}>I'LL KEEP YOU UPDATED</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>Let's Stay in Touch</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555" }}>Fill in what you'd like to share — all fields optional.</div>
          {Object.values(form).some(v => v && (Array.isArray(v) ? v.length > 0 : (typeof v === "object" ? Object.values(v).some(Boolean) : String(v).trim()))) && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: draftSaved ? "#c8f04a88" : "#444" }}>
                {draftSaved ? "✓ Draft saved" : "Draft in progress"}
              </span>
              <button type="button" onClick={() => { clearDraft(); setForm(empty); }} style={{ background: "none", border: "none", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#555", cursor: "pointer", textDecoration: "underline" }}>
                Clear draft
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>

          <SectionHeader label="BASICS" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="FIRST NAME" value={form.first_name} onChange={set("first_name")} placeholder="First" autoComplete="given-name" />
            <Input label="LAST NAME" value={form.last_name} onChange={set("last_name")} placeholder="Last" autoComplete="family-name" />
            <Input label="EMAIL" value={form.email} onChange={v => { set("email")(v); setErrors(e => ({ ...e, email: false })); }} type="email" placeholder="email@..." required={emailRequired} error={errors.email} autoComplete="email" />
            <Input label="PHONE" value={form.phone} onChange={v => { set("phone")(v); setErrors(e => ({ ...e, phone: false })); }} placeholder="+1 ..." required={phoneRequired} error={errors.phone} autoComplete="tel" />
            <Input label="PROFESSION / HOBBY / SKILL" value={form.profession} onChange={set("profession")} placeholder="Profession, hobby, or skill" autoComplete="organization-title" />
            <Input label="COMPANY" value={form.company} onChange={set("company")} placeholder="Company or organization" autoComplete="organization" />
            <Input label="LOCATION" value={form.location} onChange={set("location")} placeholder="City, state, country..." autoComplete="address-level2" />
            <BirthdayInput value={form.birthday} onChange={set("birthday")} />
          </div>

          <SectionHeader label="CONTEXT" />
          <Input label="WHERE WE MET" value={form.met_at} onChange={set("met_at")} placeholder="Conference, coffee shop, event name..." />
          <BirthdayInput value={form.when_met} onChange={set("when_met")} label="WHEN WE MET" />
          <Input label="MUTUAL FRIENDS" value={form.mutual_friends} onChange={set("mutual_friends")} placeholder="People you both know..." />
          <Textarea label="WHAT WE TALKED ABOUT" value={form.talked} onChange={set("talked")} placeholder="Key topics, ideas, follow-ups..." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <PhotoInput label="PERSONAL PHOTO" value={form.photo} onChange={set("photo")} />
            <PhotoInput label="BUSINESS CARD" value={form.business_card} onChange={set("business_card")} />
          </div>

          <SectionHeader label="HOW TO REACH YOU" />
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>PREFERRED CONTACT METHODS</div>
          <CheckboxList options={CONTACT_METHODS} value={form.contact_methods} onChange={set("contact_methods")} color="#f9a825" />

          <SectionHeader label="SOCIAL MEDIA" />
          {requiredPlatforms.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: "#f9a825", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>REQUIRED HANDLES *</div>
              {requiredPlatforms.map(platform => {
                const p = SOCIAL_PLATFORMS.find(x => x.label === platform);
                const hasError = errors[`platform_${platform}`];
                return (
                  <div key={platform} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: hasError ? "#ff4444" : "#888" }}>{p?.emoji} {platform} *</label>
                    <input value={getHandle(platform)} onChange={e => { setHandle(platform, e.target.value); setErrors(er => ({ ...er, [`platform_${platform}`]: false })); }} placeholder="@username"
                      style={{ background: hasError ? "#ff44440a" : "#0d0d0d", border: `1.5px solid ${hasError ? "#ff4444" : "#2a2a2a"}`, borderRadius: 8, padding: "10px 14px", color: "#f0f0f0", fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "#f9a825"} onBlur={e => e.target.style.borderColor = hasError ? "#ff4444" : "#2a2a2a"}
                    />
                    {hasError && <span style={{ fontSize: 10, color: "#ff4444", fontFamily: "'Space Mono', monospace" }}>This field is required</span>}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>
            {requiredPlatforms.length > 0 ? "OTHER HANDLES" : "SOCIAL HANDLES"}
          </div>
          <SocialHandlesInput
            value={form.social_handles.filter(h => !requiredPlatforms.includes(h.platform))}
            onChange={newHandles => set("social_handles")([...form.social_handles.filter(h => requiredPlatforms.includes(h.platform)), ...newHandles])}
          />

          <SectionHeader label="WEBSITE / MEDIA" />
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>WEBSITE</div>
          <LinksInput value={form.personal_links} onChange={set("personal_links")} placeholder="https://..." />
          <div style={{ fontSize: 11, color: "#888", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>MEDIA</div>
          <LinksInput value={form.media_links} onChange={set("media_links")} placeholder="YouTube, podcast, article..." />

          <SectionHeader label="COLLABORATION" />
          <CollaborationInput value={form.collaborations} onChange={set("collaborations")} />

          <SectionHeader label="ANYTHING ELSE?" />
          <Textarea label="NOTES" value={form.note} onChange={set("note")} placeholder="Anything else you'd like to share..." />

          <TurnstileWidget onVerify={t => { setTurnstileToken(t); setErrors(e => ({ ...e, turnstile: false })); }} onExpire={() => setTurnstileToken(null)} />
          {errors.turnstile && <span style={{ fontSize: 11, color: "#ff4444", fontFamily: "'Space Mono', monospace" }}>Please complete the security check above</span>}

          <button onClick={handleSave} disabled={saving || !turnstileToken} style={{
            background: turnstileToken ? "#c8f04a" : "#2a2a2a", color: turnstileToken ? "#0d0d0d" : "#555",
            border: "none", borderRadius: 10, padding: "14px 0",
            fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13,
            cursor: turnstileToken ? "pointer" : "not-allowed", transition: "all 0.3s",
            opacity: saving ? 0.6 : 1, marginTop: 8, marginBottom: 40
          }}>{saving ? "Verifying & Saving..." : turnstileToken ? "Save Contact" : "Complete Security Check First"}</button>

        </div>
      </div>
    </>
  );
}
