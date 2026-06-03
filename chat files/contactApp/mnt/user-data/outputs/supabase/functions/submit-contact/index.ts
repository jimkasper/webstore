// Supabase Edge Function: submit-contact
// Hardened: Turnstile, rate limiting (IP + email), spam scoring, sanitization, SMTP email.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const TURNSTILE_SECRET     = Deno.env.get("TURNSTILE_SECRET_KEY")!;
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGIN       = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const SMTP_HOST            = "mail.jimkasper.net";
const SMTP_PORT            = 465;
const SMTP_USER            = Deno.env.get("SMTP_USER")!;
const SMTP_PASSWORD        = Deno.env.get("SMTP_PASSWORD")!;
const NOTIFY_TO            = Deno.env.get("NOTIFY_EMAIL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_BODY_BYTES      = 5 * 1024 * 1024;
const MAX_TEXT_LENGTH     = 2000;
const MAX_IMAGE_BYTES     = 2 * 1024 * 1024;
const MAX_ARRAY_ITEMS     = 20;
const MAX_URL_LENGTH      = 500;
const RATE_LIMIT_WINDOW   = 60 * 1000;   // 1 minute
const RATE_LIMIT_MAX_IP   = 3;           // per IP per minute
const EMAIL_COOLDOWN_MS   = 24 * 60 * 60 * 1000; // 1 submission per email per 24h

// ── In-memory rate limiter (resets on cold start) ────────────────────────────
const ipMap    = new Map<string, { count: number; windowStart: number }>();
const emailMap = new Map<string, number>(); // email -> last submission timestamp

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const r = ipMap.get(ip);
  if (!r || now - r.windowStart > RATE_LIMIT_WINDOW) {
    ipMap.set(ip, { count: 1, windowStart: now }); return false;
  }
  r.count++;
  return r.count > RATE_LIMIT_MAX_IP;
}

function isEmailRateLimited(email: string): boolean {
  if (!email) return false;
  const last = emailMap.get(email.toLowerCase());
  if (!last || Date.now() - last > EMAIL_COOLDOWN_MS) {
    emailMap.set(email.toLowerCase(), Date.now()); return false;
  }
  return true;
}

// ── Spam scorer ───────────────────────────────────────────────────────────────
// Returns a score 0-10. >= 6 = flagged (still saved).
function spamScore(c: Record<string, unknown>): number {
  let score = 0;
  const text = [c.name, c.first_name, c.last_name, c.email, c.talked, c.note]
    .map(v => String(v || "")).join(" ").toLowerCase();

  // Disposable email domains
  const disposable = ["mailinator","guerrillamail","10minutemail","tempmail","throwam","trashmail","yopmail"];
  if (disposable.some(d => String(c.email || "").toLowerCase().includes(d))) score += 4;

  // Spam keywords
  const spamWords = ["casino","crypto","bitcoin","seo","forex","investment","click here","free money","make money fast","buy now","limited offer"];
  if (spamWords.some(w => text.includes(w))) score += 3;

  // All fields filled suspiciously fast (all text fields populated suggests bot)
  const filledCount = [c.first_name, c.last_name, c.email, c.phone, c.profession, c.company, c.location, c.met_at, c.talked, c.note].filter(v => v && String(v).trim().length > 0).length;
  if (filledCount >= 9) score += 2;

  // URLs in text fields
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 2) score += 2;

  // Very short name but long messages
  const nameLen = (String(c.first_name || "") + String(c.last_name || "")).length;
  if (nameLen < 3 && String(c.talked || "").length > 200) score += 1;

  return Math.min(score, 10);
}

// ── Sanitizers ───────────────────────────────────────────────────────────────
function sanitizeText(val: unknown, maxLen = MAX_TEXT_LENGTH): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "").trim().slice(0, maxLen);
}
function sanitizeImage(val: unknown): string {
  if (typeof val !== "string" || val === "") return "";
  if (!val.startsWith("data:image/")) return "";
  const allowed = ["data:image/jpeg","data:image/png","data:image/webp","data:image/gif"];
  if (!allowed.some(t => val.startsWith(t))) return "";
  if ((val.split(",")[1] ?? "").length * 0.75 > MAX_IMAGE_BYTES) return "";
  return val;
}
function sanitizeArray(val: unknown, fn: (v: unknown) => unknown): unknown[] {
  if (!Array.isArray(val)) return [];
  return val.slice(0, MAX_ARRAY_ITEMS).map(fn).filter(Boolean);
}
function sanitizeHandle(h: unknown): unknown {
  if (typeof h !== "object" || h === null) return null;
  const { platform, handle } = h as Record<string, unknown>;
  const p = sanitizeText(platform, 50);
  return p ? { platform: p, handle: sanitizeText(handle, 100) } : null;
}
function sanitizeLink(l: unknown): unknown {
  if (typeof l !== "object" || l === null) return null;
  const { label, url } = l as Record<string, unknown>;
  const u = sanitizeText(url, MAX_URL_LENGTH);
  if (u && !u.match(/^https?:\/\/.+/)) return null;
  return { label: sanitizeText(label, 100), url: u };
}
function sanitizeContact(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null) return {};
  const c = raw as Record<string, unknown>;
  return {
    first_name:          sanitizeText(c.first_name, 100),
    last_name:           sanitizeText(c.last_name, 100),
    email:               sanitizeText(c.email, 254),
    phone:               sanitizeText(c.phone, 30),
    profession:          sanitizeText(c.profession, 200),
    company:             sanitizeText(c.company, 200),
    location:            sanitizeText(c.location, 200),
    birthday:            sanitizeText(c.birthday, 20),
    met_at:              sanitizeText(c.met_at, 200),
    when_met: (() => {
      const w = c.when_met as Record<string, string> | string | undefined;
      if (!w) return "";
      if (typeof w === "string") return sanitizeText(w, 20);
      return [w.month, w.day, w.year].filter(Boolean).join("/");
    })(),
    mutual_friends:      sanitizeText(c.mutual_friends, 300),
    talked:              sanitizeText(c.talked, MAX_TEXT_LENGTH),
    note:                sanitizeText(c.note, MAX_TEXT_LENGTH),
    photo:               sanitizeImage(c.photo),
    business_card:       sanitizeImage(c.business_card),
    collaborations: (() => {
      if (!Array.isArray(c.collaborations)) return [];
      return c.collaborations.slice(0, 30).map((e: unknown) => {
        if (typeof e !== "object" || e === null) return null;
        const entry = e as Record<string, unknown>;
        const text = sanitizeText(entry.text, 500);
        if (!text) return null;
        return { type: sanitizeText(entry.type, 50), text };
      }).filter(Boolean);
    })(),
    contact_methods:    sanitizeArray(c.contact_methods,  v => sanitizeText(v, 100) || null),
    social_handles:     sanitizeArray(c.social_handles,   sanitizeHandle),
    personal_links:     sanitizeArray(c.personal_links,   sanitizeLink),
    media_links:        sanitizeArray(c.media_links,      sanitizeLink),
  };
}

// ── Email builder ─────────────────────────────────────────────────────────────
function row(label: string, value: string) {
  if (!value) return "";
  return `<tr><td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#888;white-space:nowrap;vertical-align:top;border-bottom:1px solid #1e1e1e">${label}</td><td style="padding:8px 12px;font-family:Georgia,serif;font-size:14px;color:#f0f0f0;vertical-align:top;border-bottom:1px solid #1e1e1e">${value}</td></tr>`;
}
function section(title: string, content: string) {
  if (!content.trim()) return "";
  return `<tr><td colspan="2" style="padding:16px 12px 4px;font-family:monospace;font-size:10px;letter-spacing:2px;color:#c8f04a;border-bottom:1px solid #333">${title}</td></tr>${content}`;
}
function tags(items: string[], color = "#c8f04a") {
  if (!items?.length) return "";
  return items.map(i => `<span style="display:inline-block;background:${color}18;border:1px solid ${color}44;color:${color};border-radius:4px;padding:2px 8px;font-family:monospace;font-size:11px;margin:2px">${i}</span>`).join(" ");
}

function buildEmail(c: Record<string, unknown>, score: number, submittedAt: string) {
  const firstName = (c.first_name as string) || "";
  const lastName  = (c.last_name as string) || "";
  const name      = [firstName, lastName].filter(Boolean).join(" ") || "Someone";
  const socials   = (c.social_handles as Array<{platform:string;handle:string}> || []).filter(s => s.handle);
  const pLinks    = (c.personal_links as Array<{label:string;url:string}> || []).filter(l => l.url);

  const flagBanner = score >= 6 ? `<tr><td colspan="2" style="padding:12px;background:#f9742218;border-bottom:1px solid #f9742244"><span style="color:#f97422;font-family:monospace;font-size:12px">🚩 FLAGGED — Spam score: ${score}/10. Review before reaching out.</span></td></tr>` : "";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#111;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden">
    <tr><td style="padding:24px 20px;background:#0d0d0d;border-bottom:1px solid #1e1e1e">
      <div style="font-family:monospace;font-size:10px;color:#c8f04a;letter-spacing:3px;margin-bottom:6px">I'LL KEEP YOU UPDATED</div>
      <div style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#f0f0f0">New Contact: ${name}</div>
      <div style="font-family:monospace;font-size:11px;color:#555;margin-top:6px">${submittedAt}</div>
    </td></tr>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${flagBanner}
      ${section("BASICS", row("First Name", c.first_name as string) + row("Last Name", c.last_name as string) + row("Profession", c.profession as string) + row("Company", c.company as string) + row("Location", c.location as string) + row("Birthday", c.birthday as string))}
      ${section("CONTACT", row("Email", c.email as string) + row("Phone", c.phone as string))}
      ${(c.contact_methods as string[])?.length ? section("PREFERRED CONTACT", `<tr><td colspan="2" style="padding:8px 12px;border-bottom:1px solid #1e1e1e">${tags(c.contact_methods as string[], "#f9a825")}</td></tr>`) : ""}
      ${socials.length ? section("SOCIAL MEDIA", socials.map(s => row(s.platform, s.handle)).join("")) : ""}
      ${pLinks.length ? section("WEBSITE / MEDIA", pLinks.map(l => row(l.label || "Link", `<a href="${l.url}" style="color:#c8f04a">${l.url}</a>`)).join("")) : ""}
      ${(c.met_at || c.when_met || c.mutual_friends || c.talked) ? section("CONTEXT", row("Where we met", c.met_at as string) + row("When we met", c.when_met as string) + row("Mutual friends", c.mutual_friends as string) + row("We talked about", c.talked as string)) : ""}
      ${(c.collaborations as Array<{type:string;text:string}>)?.filter(e => e.text).length ? section("COLLABORATION", (c.collaborations as Array<{type:string;text:string}>).filter(e => e.text).map(e => `<tr><td style="padding:6px 12px;font-family:monospace;font-size:11px;color:#c8f04a;white-space:nowrap;vertical-align:top;border-bottom:1px solid #1e1e1e">${e.type}</td><td style="padding:6px 12px;font-family:Georgia,serif;font-size:13px;color:#f0f0f0;vertical-align:top;border-bottom:1px solid #1e1e1e">${e.text}</td></tr>`).join("")) : ""}
      ${c.note ? section("NOTES", row("", c.note as string)) : ""}
    </table>
    <tr><td style="padding:16px 20px;background:#0d0d0d;border-top:1px solid #1e1e1e"><div style="font-family:monospace;font-size:11px;color:#444">Submitted via contact.jimkasper.net · View all contacts at /peeps</div></td></tr>
  </table></body></html>`;

  const flagPrefix = score >= 6 ? "🚩 " : "";
  return {
    subject: `${flagPrefix}New contact: ${name}${c.profession ? ` · ${c.profession}` : ""}`,
    html,
  };
}

async function sendNotification(contact: Record<string, unknown>, score: number) {
  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" });
  const { subject, html } = buildEmail(contact, score, submittedAt);
  const client = new SmtpClient();
  await client.connectTLS({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASSWORD });
  await client.send({ from: SMTP_USER, to: NOTIFY_TO, subject, html });
  await client.close();
}

// ── Handler ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (isIpRateLimited(ip)) return new Response(JSON.stringify({ error: "Too many submissions. Please wait a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) return new Response(JSON.stringify({ error: "Payload too large." }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const { contact: rawContact, turnstileToken } = body;

    if (!turnstileToken || typeof turnstileToken !== "string") return new Response(JSON.stringify({ error: "Missing security token." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Turnstile verification
    const verifyForm = new FormData();
    verifyForm.append("secret", TURNSTILE_SECRET);
    verifyForm.append("response", turnstileToken);
    verifyForm.append("remoteip", ip);
    const cfRes  = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: verifyForm });
    const cfData = await cfRes.json();
    if (!cfData.success) return new Response(JSON.stringify({ error: "Security check failed. Please try again." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const clean = sanitizeContact(rawContact);

    // Per-email rate limit
    if (clean.email && isEmailRateLimited(clean.email as string)) {
      return new Response(JSON.stringify({ error: "This email was already submitted recently." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Spam scoring
    const score = spamScore(clean);
    const flagged = score >= 6;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supabase.from("contacts").insert([{ ...clean, spam_score: score, flagged }]);

    if (error) {
      console.error("DB insert error:", error.message);
      return new Response(JSON.stringify({ error: "Failed to save. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    sendNotification(clean, score).catch(err => console.error("Email send failed:", err));

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
