// Supabase Edge Function: weekly-backup
// Triggered by a Supabase cron job every Sunday at 8am.
// Exports all contacts as a CSV and emails it as an attachment.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const SMTP_HOST            = "mail.jimkasper.net";
const SMTP_PORT            = 465;
const SMTP_USER            = Deno.env.get("SMTP_USER")!;
const SMTP_PASSWORD        = Deno.env.get("SMTP_PASSWORD")!;
const NOTIFY_TO            = Deno.env.get("NOTIFY_EMAIL")!;

function toCSV(contacts: Record<string, unknown>[]): string {
  const cols = [
    "first_name","last_name","email","phone","profession","company",
    "location","birthday","met_at","when_met","mutual_friends","talked",
    "contact_methods","collaborations","note","followup_date","flagged",
    "spam_score","created_at"
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    cols.join(","),
    ...contacts.map(c => cols.map(col => {
      const v = c[col];
      if (Array.isArray(v) || typeof v === "object") return escape(JSON.stringify(v));
      return escape(v);
    }).join(","))
  ].join("\n");
}

Deno.serve(async (req) => {
  // Allow Supabase cron or manual trigger with a secret header
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: contacts, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });

  if (error) return new Response("DB error: " + error.message, { status: 500 });

  const csv  = toCSV(contacts || []);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `peeps-backup-${date}.csv`;

  const client = new SmtpClient();
  await client.connectTLS({ hostname: SMTP_HOST, port: SMTP_PORT, username: SMTP_USER, password: SMTP_PASSWORD });
  await client.send({
    from: SMTP_USER,
    to: NOTIFY_TO,
    subject: `📦 Weekly backup — ${contacts?.length || 0} contacts (${date})`,
    html: `<div style="font-family:monospace;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:8px">
      <div style="color:#c8f04a;font-size:10px;letter-spacing:3px;margin-bottom:8px">I'LL KEEP YOU UPDATED</div>
      <div style="font-size:20px;font-weight:bold;margin-bottom:12px">Weekly Backup</div>
      <div style="color:#888;font-size:13px">${contacts?.length || 0} contacts exported on ${date}.</div>
      <div style="color:#555;font-size:12px;margin-top:8px">CSV attached. Import to any spreadsheet app.</div>
    </div>`,
    attachments: [{
      filename,
      contentType: "text/csv",
      content: new TextEncoder().encode(csv),
    }],
  });
  await client.close();

  return new Response(JSON.stringify({ success: true, count: contacts?.length, date }), {
    headers: { "Content-Type": "application/json" }
  });
});
