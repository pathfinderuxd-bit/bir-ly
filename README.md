# birly.uk

A personal link shortener. Paste a long URL, get `birly.uk/akw56js`.

No server, no database, no sign-in. GitHub Pages serves three static files; a
Google Sheet holds the links.

## How it works

```
birly.uk/akw56js
  → GitHub Pages finds no such file
  → serves 404.html
  → 404.html reads the slug from the path, fetches the Sheet CSV, redirects
```

`404.html` is the whole redirect engine. Add a row to the sheet and the link
works immediately — there is no build step and nothing to deploy.

| File | Does |
|---|---|
| `site/index.html` | Dashboard — paste a URL, get a slug |
| `site/404.html` | Resolver — every short link lands here |
| `site/config.js` | The two URLs that connect it to your sheet |
| `site/style.css` | Shared styling |

## Setup

### 1. The sheet

Create a Google Sheet with three columns and a header row:

| slug | url | created |
|---|---|---|

Then **File → Share → Publish to web → CSV**. Copy that URL into
`SHEET_CSV_URL` in `site/config.js`.

The published CSV is public. Anyone who finds the URL can read every link, so
don't shorten anything private.

### 2. The write endpoint

**Extensions → Apps Script**, paste this, and set `SECRET` to a long random
string:

```javascript
const SECRET = 'paste-a-long-random-string';

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.secret !== SECRET) return json({ error: 'Rejected.' });

  const sheet = SpreadsheetApp.getActiveSheet();
  const taken = sheet.getDataRange().getValues().map(r => String(r[0]).toLowerCase());
  if (taken.includes(String(body.slug).toLowerCase())) return json({ error: 'Slug already taken.' });

  sheet.appendRow([body.slug, body.url, new Date()]);
  return json({ ok: true, slug: body.slug });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Deploy → New deployment → Web app**, with *Execute as: me* and
*Who has access: Anyone*. Copy the `/exec` URL into `APPS_SCRIPT_URL`.

Open the dashboard, click **Write key**, and paste the same `SECRET`. It is
kept in your browser's localStorage and never committed to this public repo.

### 3. Pages

**Settings → Pages → Source: GitHub Actions.** Pushing to `main` deploys.

### 4. The domain

At your registrar, point `birly.uk` at GitHub with four A records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Then add a `site/CNAME` file containing `birly.uk`, and tick **Enforce HTTPS**
in the Pages settings once the certificate has been issued.

## Known trade-offs

- **The link list is public** — the browser does the lookup, so the sheet must
  be readable without auth. A key in client-side JavaScript isn't a secret.
- **Redirects return HTTP 404** — fine for people, but Slack and WhatsApp
  previews will show this page instead of the destination.
- **~400ms** — page load, then CSV fetch, then redirect. Google also caches
  published CSVs for a few minutes, so a brand-new row can lag briefly.

If previews start to matter, the fix is Cloudflare DNS with Bulk Redirects
(free, real 301s, still no server) — not AWS.
