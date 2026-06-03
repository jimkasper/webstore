# Let's Stay in Touch — Setup Guide

## Stack
- **Frontend:** React (Vite)
- **Database:** Supabase (hosted PostgreSQL, free tier)
- **Bot protection:** Cloudflare Turnstile (free)
- **Backend:** Supabase Edge Functions (free tier)
- **Hosting:** Namecheap + cPanel at `contact.jimkasper.net`

---

## Your files

| File | Purpose |
|---|---|
| `src/main.jsx` | React Router entry — defines `/` and `/peeps` routes |
| `src/Contact.jsx` | Public contact form at `contact.jimkasper.net/` |
| `src/Peeps.jsx` | Private directory at `contact.jimkasper.net/peeps` |
| `ContactPreview.jsx` | Claude preview only — do not deploy |
| `PeepsPreview.jsx` | Claude preview only — do not deploy |
| `supabase/functions/submit-contact/index.ts` | Verifies Turnstile, sanitizes input, saves to DB, emails you |
| `supabase/functions/followup-reminders/index.ts` | Daily email of overdue follow-ups |
| `supabase/functions/weekly-backup/index.ts` | Weekly CSV backup emailed to you |
| `schema.sql` | Run once in Supabase SQL Editor — creates table + RLS |
| `cron.sql` | Run after enabling pg_cron — sets up automated emails |

---

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**, name it, set a DB password, pick the closest region
3. Wait ~1 minute for it to provision
4. When prompted about **Enable Data API** and **Enable automatic RLS** — enable both

---

## Step 2 — Create the database table

1. In Supabase, go to **SQL Editor** in the left sidebar
2. Paste the entire contents of `schema.sql` and click **Run**
3. You should see "Success. No rows returned."

> ⚠️ Do NOT run `cron.sql` yet — that comes later in Step 12.
> If you accidentally run it twice you'll get "relation already exists" — that's harmless, the table is already there.

---

## Step 3 — Get your Supabase credentials

Go to **Project Settings → API** and copy:
- **Project URL** → `https://xxxxxxxx.supabase.co`
- **anon / public key** → long string starting with `eyJ...`
- **service_role key** → another `eyJ...` string (keep this secret — never put it in frontend code)

---

## Step 4 — Set up Cloudflare Turnstile

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) (free account)
2. In the sidebar click **Turnstile → Add site**
   - Name: anything (e.g. "contact.jimkasper.net")
   - Domain: `contact.jimkasper.net`
   - Widget type: **Managed**
3. Copy your **Site Key** (public) and **Secret Key** (private)

---

## Step 5 — Set up your Namecheap email

1. Log into Namecheap → **Private Email** for jimkasper.net
2. Create or use an existing mailbox (e.g. `hello@jimkasper.net`)
3. Note your email address and password — needed for Step 7

SMTP settings (already hardcoded in the Edge Functions):
- **Host:** `mail.jimkasper.net`
- **Port:** `465` (SSL)

---

## Step 6 — Set up Supabase Auth (for /peeps login)

1. In Supabase go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a strong password
4. Use those credentials to sign in at `contact.jimkasper.net/peeps`

Recommended settings (**Authentication → Configuration**):
- Set **JWT expiry** to `28800` (8 hours)
- Enable **Leaked password protection**

---

## Step 7 — Install Node.js and the Supabase CLI

**Install Node.js first** (required for npm):
1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** version
2. Run the installer
3. Close your terminal, open a new one, and confirm it worked:
```bash
node --version
npm --version
```

**Install the Supabase CLI via Homebrew** (npm install is not supported):
```bash
brew install supabase/tap/supabase
```

If you don't have Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install the CLI:
```bash
brew install supabase/tap/supabase
```

Verify:
```bash
supabase --version
```

---

## Step 8 — Add credentials to the React app

Open `src/Contact.jsx` and `src/Peeps.jsx` and fill in the top of each file:

```js
const SUPABASE_URL       = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY  = "YOUR_ANON_KEY";
const TURNSTILE_SITE_KEY = "YOUR_TURNSTILE_SITE_KEY"; // Contact.jsx only
```

---

## Step 9 — Build the React app

Make sure you're inside your project folder first:
```bash
cd hitmeup
```

Create the Vite project **inside** the current folder (the `.` means "right here"):
```bash
npm create vite@latest . -- --template react
```

> If you get an `EACCES` permissions error, run: `sudo chown -R $(whoami) ~/.npm` then try again.

Install dependencies:
```bash
npm install
npm install @supabase/supabase-js react-router-dom
```

Copy your app files into `src/`:
```bash
# Replace the Vite placeholder files with your actual app files
cp path/to/main.jsx     src/main.jsx
cp path/to/Contact.jsx  src/Contact.jsx
cp path/to/Peeps.jsx    src/Peeps.jsx
```

Build for production:
```bash
npm run build
```

This creates a `dist/` folder. Your `hitmeup/` folder should now look like:
```
hitmeup/
├── supabase/
│   └── functions/
│       ├── submit-contact/index.ts
│       ├── followup-reminders/index.ts
│       └── weekly-backup/index.ts
├── src/
│   ├── main.jsx
│   ├── Contact.jsx
│   └── Peeps.jsx
├── dist/              ← upload this to cPanel
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
├── index.html
└── package.json
```

---

## Step 10 — Deploy to Namecheap via cPanel

### A) Log into cPanel
1. Go to `jimkasper.net/cpanel` (or via Namecheap dashboard → **cPanel**)
2. Enter your cPanel username and password

### B) Set up the subdomain
1. In cPanel, find **Subdomains** (under Domains)
2. Enter `contact` as the subdomain, select `jimkasper.net` as the domain
3. Document root auto-fills as `public_html/contact` — leave it
4. Click **Create**

### C) Upload your built files
1. In cPanel, open **File Manager**
2. Navigate to `public_html/contact/`
3. Upload from your `dist/` folder — you need exactly these three things:
   ```
   public_html/contact/
   ├── index.html
   ├── .htaccess        ← you create this manually (see Step D)
   └── assets/
       ├── index-[hash].js
       └── index-[hash].css
   ```
4. If cPanel doesn't support folder upload, zip the `assets/` folder on your Mac first (right-click → Compress), upload the zip, then extract it in cPanel

### D) Create the .htaccess file (required — do not skip)
Without this file, visiting `contact.jimkasper.net/peeps` directly will return a 404.

1. In File Manager, navigate to `public_html/contact/`
2. Click **+ File** in the toolbar
3. Name it `.htaccess` (with the dot — it may be hidden by default)
4. Right-click it → **Edit**
5. Paste this exactly and click **Save**:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

### E) Verify
- Visit `contact.jimkasper.net` → contact form
- Visit `contact.jimkasper.net/peeps` → login screen

---

## Step 11 — Enable HTTPS

1. In cPanel, find **SSL/TLS** or **Let's Encrypt SSL**
2. Issue a free certificate for `contact.jimkasper.net`
3. Enable **Force HTTPS Redirect**

---

## Step 12 — Deploy the Edge Functions

From inside your `hitmeup/` folder:

```bash
cd hitmeup
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

> Your project ID is in Supabase Dashboard → Project Settings → General.
> When prompted for a database password, use the one you set when creating the project (not your Supabase login password). Reset it at Dashboard → Project Settings → Database if forgotten.

Deploy all three functions:
```bash
supabase functions deploy submit-contact
supabase functions deploy followup-reminders
supabase functions deploy weekly-backup
```

Set secrets (run each line separately, replace values with your actual keys):
```bash
supabase secrets set TURNSTILE_SECRET_KEY=your_turnstile_secret
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set ALLOWED_ORIGIN=https://contact.jimkasper.net
supabase secrets set SMTP_USER=you@jimkasper.net
supabase secrets set SMTP_PASSWORD=your_email_password
supabase secrets set NOTIFY_EMAIL=you@jimkasper.net
```

> Note: the variable is `SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_ROLE_KEY` — Supabase blocks that prefix).

Verify deployment: Supabase Dashboard → **Edge Functions** — all three should appear as active.

---

## Step 13 — Set up cron jobs (automated emails)

1. In Supabase Dashboard → **Database → Extensions** → search `pg_cron` → Enable
2. Open `cron.sql`, replace `YOUR_PROJECT_ID` and `YOUR_SERVICE_ROLE_KEY` with your actual values
3. Paste into **SQL Editor** and run

This schedules:
- Daily follow-up reminder emails at 9am ET
- Weekly CSV backup every Sunday at 9am ET

---

## Updating the site

Whenever you make changes to the React app:

```bash
cd hitmeup
npm run build
```

Then re-upload the contents of `dist/` to `public_html/contact/` via cPanel File Manager, overwriting existing files. The `.htaccess` file stays — you don't need to recreate it.

To update an Edge Function, edit the `index.ts` file and redeploy:
```bash
supabase functions deploy submit-contact
```

---

## Directory login

- Sign in at `contact.jimkasper.net/peeps` using the email and password you set in Step 6
- Session persists across browser refreshes for 8 hours
- The 🔒 button signs you out immediately
- To change your password: Supabase Dashboard → Authentication → Users → click your user

---

## Security summary

| Threat | Protection |
|---|---|
| Bot form submissions | Cloudflare Turnstile (server-verified) |
| Spam flooding | Rate limit: 3 submissions/IP/minute |
| Repeat email submissions | Same email blocked for 24 hours |
| Oversized payloads | 5 MB body cap + 2 MB per image |
| HTML/script injection | Stripped server-side and client-side |
| Direct DB writes | RLS blocks all anon inserts |
| Direct DB reads | RLS blocks all anon selects |
| Suspicious submissions | Spam scored + auto-flagged in directory |
| Directory brute force | Supabase Auth (no password in code) |
| Session hijacking | JWT with 8-hour expiry |
| Cross-origin requests | ALLOWED_ORIGIN locks Edge Function to your domain |

---

## Features summary

**Contact form**
- Autosave draft (localStorage) — survives accidental tab close
- Cloudflare Turnstile bot protection
- Spam scoring — flags suspicious entries automatically
- Rate limiting per IP and per email

**Peeps directory**
- Supabase Auth login — password never in code
- Search across all fields
- Filter by collaboration type, where met, flagged, follow-up
- Sort: newest, oldest, A→Z, Z→A, follow-up due
- Edit any contact inline
- Follow-up dates with ⏰ indicator when due
- Flag contacts manually with 🚩
- Export full contact list as CSV

**Automated emails (via Namecheap SMTP)**
- New contact notification — immediate, includes all submitted info
- Daily follow-up reminders — lists overdue contacts each morning
- Weekly CSV backup — full database export every Sunday
