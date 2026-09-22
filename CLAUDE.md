# bir.ly — Link Shortener

Created: 2026-09-22

## What it is
A personal link shortener. Paste a long URL, get `bir.ly/akw56js`.

## Decisions made (2026-09-22)

| Decision | Choice | Why |
|---|---|---|
| Hosting | **GitHub Pages** — not AWS | Free; apex domain works with plain A records; AWS's advantages (301s, edge compute, stats) all declined |
| Repo visibility | **Public** | Pages on private repos needs a paid plan; Rich is on free |
| Data store | **Google Sheet** | No database, no sign-in, no server cost |
| Slug resolution | **`404.html` client-side lookup** | GitHub Pages serves `404.html` for any unmatched path — one file handles every slug, no build step |
| Stats / analytics | **Not required** | Explicitly dropped |
| Real 301 redirects | **Not required** | Meta-refresh is acceptable |
| AWS pipeline | **On hold** | Not being built |

## Architecture

```
bir.ly (apex, A records → GitHub IPs)
  │
  ├── index.html   dashboard SPA — paste URL, get slug
  ├── 404.html     resolver — reads slug from path, looks up Google Sheet CSV, redirects
  └── CNAME        contains: bir.ly
          │
          └── Google Sheet (published CSV)   slug │ url │ created
                    ▲
                    └── Apps Script web app — SPA POSTs new rows here
```

New link is live the moment the sheet row exists. No rebuild, no deploy.

## Accepted trade-offs
- **Link list is public** — client-side lookup needs an unauthenticated sheet; a secret in client JS isn't secret
- **HTTP 404 status on redirect** — works for humans, but Slack/WhatsApp link previews break
- **~400ms redirect** — page load, CSV fetch, then redirect; Google caches published CSVs a few minutes

## Known gotchas
- **Apps Script has no CORS preflight handling** — POST as `Content-Type: text/plain`, parse JSON server-side
- **`.ly` cannot be transferred to Route 53** — not a supported TLD for registration (DNS hosting is fine)
- **Pointing a domain ≠ transferring it** — DNS records only; registration stays at the registrar
- Some `.ly` resellers only expose nameserver fields, not A records — fall back to Cloudflare DNS (free)

## Upgrade path (only if link previews start to matter)
Cloudflare DNS + Bulk Redirects — real 301s from a list, free, no build, no server. Not AWS.

## DNS (when ready)
Apex A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
Then add `CNAME` file to repo + tick **Enforce HTTPS** in Pages settings.

## Files
| File | Version | Notes |
|---|---|---|
| `Code/index.html` | v0.1 | Dashboard SPA. Currently `localStorage` demo — not yet wired to Apps Script |

## Open items
- [ ] GitHub account to use (`richardbirley` or `pathfinderuxd-bit`) — repo will be public either way
- [ ] Confirm registrar allows A records on `bir.ly`
- [ ] Create Google Sheet + Apps Script web app
- [ ] Swap SPA storage layer from `localStorage` to Apps Script POST
- [ ] Write `404.html` resolver
