// Supabase Edge Function: followup-reminders
// Triggered daily by a Supabase cron job.
// Emails you a list of contacts whose follow-up date is today or overdue.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const SMTP_HOST            = "mail.jimkasper.net";
const SMTP_PORT            = 465;
const SMTP_USER            = Deno.env.get("SMTP_USER")!;
const SMTP_PASSWORD        = Deno.env.get("SMTP_PASSWORD")!;
const NOTIFY_TO            = Deno.env.get("NOTIFY_EMAIL")!;
const APP_URL              = "https://contact.jimkasper.net/peeps";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const today = new Date().toISOString().slice(0, 10);

  const { data: due, error } = await supabase
    .from("contacts")
    .select("first_name, last_name, email, phone, profession, company, followup_date, note")
    .lte("followup_date", today)
    .not("followup_date", "is", null);

  if (error) return new Response("DB error: " + error.message, { status: 500 });
  if (!due || due.length === 0) return new Response(JSON.stringify({ message: "No follow-ups due today." }));

  const rows = due.map(c => {
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown";
    const overdue = c.followup_date < today;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1e1e1e;font-family:Georgia,serif;font-size:14px;color:#f0f0f0">${name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1e1e1e;font-family:monospace;font-size:12px;color:#c8f04a">${c.profession || ""}${c.company ? ` · ${c.company}` : ""}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1e1e1e;font-family:monospace;font-size:11px;color:${overdue ? "#f97422" : "#f9a825"}">${overdue ? "⚠️ " : ""}${c.followup_date}</td>
      </tr>
      ${c.note ? `<tr><td colspan="3" style="padding:4px 12px 10px;border-bottom:1px solid #1e1e1e;font-family:Georgia,serif;font-size:12px;color:#666;font-style:italic">"${c.note}"</td></tr>` : ""}
    `;
  }).join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#111;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden">
      <tr><td style="padding:24px 20px;background:#0d0d0d;border-bottom:1px solid #1e1e1e">
        <div style="font-family:monospace;font-size:10px;color:#f9a825;letter-spacing:3px;margin-bottom:6px">I'LL KEEP YOU UPDATED</div>
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#f0f0f0">⏰ Follow-ups Due Today</div>
        <div style="font-family:monospace;font-size:12px;color:#555;margin-top:6px">${due.length} contact${due.length > 1 ? "s" : ""} · ${today}</div>
      </td></tr>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="padding:8px 12px;font-family:monospace;font-size:10px;color:#555;text-align:left;border-bottom:1px solid #2a2a2a">NAME</th>
          <th style="padding:8px 12px;font-family:monospace;font-size:10px;color:#555;text-align:left;border-bottom:1px solid #2a2a2a">ROLE</th>
          <th style="padding:8px 12px;font-family:monospace;font-size:10px;color:#555;text-align:left;border-bottom:1px solid #2a2a2a">DUE</th>
        </tr>
        ${rows}
      </table>
      <tr><td style="padding:16px 20px;background:#0d0d0d;border-top:1px solid #1e1e1e">
        <a href="${APP_URL}" style="font-family:monospace;font-size:12px;color:#c8f04a;text-decoration:none">→ Open Peeps directory</a>
      </td></tr>
    </table>
  </body></html>`;

  const client = new SmtpClient();
  await client.connectTLS({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASSWORD });
  await client.send({
    from: SMTP_USER, to: NOTIFY_TO,
    subject: `⏰ ${due.length} follow-up${due.length > 1 ? "s" : ""} due — ${today}`,
    html,
  });
  await client.close();

  return new Response(JSON.stringify({ success: true, count: due.length }), {
    headers: { "Content-Type": "application/json" }
  });
});
