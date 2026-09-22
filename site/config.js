// bir.ly configuration.
//
// SHEET_CSV_URL is public by design — the resolver fetches it from the
// visitor's browser, so it cannot be secret. The gviz endpoint below serves
// any sheet shared as "anyone with the link can view" as CSV, so there is no
// Publish to web step, and it is not cached the way /pub is.
//
// APPS_SCRIPT_URL receives new rows from the dashboard.
//   Apps Script → Deploy → Web app → Execute as: me, Access: anyone
//
// The write secret is NOT here. The dashboard asks for it once and keeps it
// in localStorage, so it never lands in this public repo.

window.BIRLY = {
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/1dAV2c3yrWiyD4gOAXUszY28UnMwTDZVGHVU7ji5lSDo/gviz/tq?tqx=out:csv',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxQa7oZJMwHj1wu155aoGPAEb7jdEeRHpHXQw18ZyUbIz5-DM9m98OhKqZtLS-r5BKS3Q/exec',
  DOMAIN: 'birly.uk'
};
