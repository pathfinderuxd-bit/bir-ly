// bir.ly configuration.
//
// SHEET_CSV_URL is public by design — the resolver fetches it from the
// visitor's browser, so it cannot be secret. Publish the sheet read-only:
//   File → Share → Publish to web → the "slug" sheet → CSV
//
// APPS_SCRIPT_URL receives new rows from the dashboard.
//   Apps Script → Deploy → Web app → Execute as: me, Access: anyone
//
// The write secret is NOT here. The dashboard asks for it once and keeps it
// in localStorage, so it never lands in this public repo.

window.BIRLY = {
  SHEET_CSV_URL: '',
  APPS_SCRIPT_URL: '',
  DOMAIN: 'bir.ly'
};
