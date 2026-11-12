# Cali Terrain: form backend (Google Sheet)

Both forms on the site (the **Book Free Trial** pop-up and the **Contact** page)
append one row to a Google Sheet, then send the visitor to WhatsApp with their
details pre-filled. If the Sheet is down, the visitor still lands on WhatsApp,
so no lead is lost.

Code: `src/lib/leads.js` posts to the URL in `VITE_SHEET_URL`.

## One-time setup (about 5 minutes)

1. Create a Google Sheet, e.g. **Cali Terrain Leads**.
2. In the Sheet: **Extensions → Apps Script**. Delete what's there and paste the
   script below. Save.
3. **Deploy → New deployment** → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, approve the Google permission prompt, copy the **Web app URL**
     (ends in `/exec`).
4. Put the URL in `.env.local` for local dev:
   `VITE_SHEET_URL=https://script.google.com/macros/s/…/exec`
   and in Vercel: **Project → Settings → Environment Variables →
   `VITE_SHEET_URL`** (Production + Preview), then redeploy.
5. Optional alert: in the Sheet, **Tools → Notification settings → Edit
   notifications** → "Any changes are made" → email right away.

If you edit the script later, use **Deploy → Manage deployments → Edit →
New version** so the URL stays the same.

## Apps Script (`Code.gs`)

```js
const HEADERS = ["Timestamp", "Source", "Name", "Phone", "Age", "Program", "Goal", "Preferred time", "Message"];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return out({ ok: false, error: "Invalid request" }); }

  const s = (v, max) => String(v == null ? "" : v).trim().slice(0, max || 500);
  // Leading = + - @ would run as a formula in Sheets; the ' keeps it as text.
  const cell = (v, max) => { const t = s(v, max); return /^[=+\-@]/.test(t) ? "'" + t : t; };

  const name = s(d.name, 120);
  const phone = s(d.phone, 20).replace(/[^\d+]/g, "");
  if (d.company || !name || phone.length < 7) return out({ ok: false, error: "Name and a valid phone are required." });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([
      new Date(), cell(d.source, 20), cell(name), "'" + phone, cell(d.age, 3),
      cell(d.program, 120), cell(d.goal), cell(d.preferred_time, 60), cell(d.message, 2000),
    ]);
  } finally {
    lock.releaseLock();
  }
  return out({ ok: true });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```
