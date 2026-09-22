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

## Repo & hosting (live 2026-09-22)
- GitHub: [`pathfinderuxd-bit/bir-ly`](https://github.com/pathfinderuxd-bit/bir-ly) — **public** (Pages on free plan needs it)
- Commit identity: `Pathfinder UXD <pathfinder.uxd@gmail.com>` (set locally in this repo)
- Pages: Source = GitHub Actions, via `.github/workflows/pages.yml` (copied from `pub-round`)
- Preview URL: https://pathfinderuxd-bit.github.io/bir-ly/
- Nested repo — excluded from the monorepo in root `.gitignore` (`/Projects/bir-ly/`), same as `job-pipeline`

## Files
| File | Version | Notes |
|---|---|---|
| `site/index.html` | v1.0 | Dashboard. Apps Script POST when configured, `localStorage` demo until then |
| `site/404.html` | v1.0 | Resolver — every short link lands here |
| `site/config.js` | — | `SHEET_CSV_URL` + `APPS_SCRIPT_URL`, both currently blank |
| `site/style.css` | — | Shared styling |

Asset paths are relative and the resolver reads the **last** path segment, so
the app works both at the apex and under the `/bir-ly/` github.io subpath.

## Open items
- [ ] Confirm registrar allows A records on `bir.ly`
- [ ] Create Google Sheet (slug | url | created) + publish to web as CSV
- [ ] Create Apps Script web app (code in `README.md`), paste both URLs into `config.js`
- [ ] Enter the write key in the dashboard under "Write key"
- [ ] Add `site/CNAME` containing `bir.ly` once DNS resolves, then tick Enforce HTTPS

---

## After committing — always ask before pushing

Never push straight after a commit. Commit the work, show what changed, then
ask a single question offering both routes:

1. **Here's the command** — give the exact `git push` line to run
2. **I can push now** — push it on a yes

Offer both, pick neither, and wait for the answer. This applies to every repo
in this workspace, nested project repos included.

The one exception is when the push was already asked for in the same message
("commit and push", "push it up") — then just do it and say so.
