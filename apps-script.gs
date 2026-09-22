/**
 * bir.ly / birly.uk — sheet write endpoint.
 *
 * Paste this whole file into the Apps Script bound to the links sheet
 * (Extensions -> Apps Script), then Deploy -> Manage deployments -> edit ->
 * Deploy, so the running version is this one.
 *
 * Execute as: Me.  Who has access: Anyone.  Both matter: an anonymous
 * request has no Google identity, so it can only reach the sheet by running
 * as the owner.
 */

const SECRET = '9ZxiePQFaYLk8MF70lE7Bms5YofnIJPLxgCMi4tCspA';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json({ error: 'Rejected.' });

    switch (body.action) {
      case 'delete': return remove(body);
      default:       return create(body);
    }
  } catch (err) {
    return json({ error: String(err) });
  }
}

function create(body) {
  const slug = String(body.slug || '').trim();
  const url = String(body.url || '').trim();

  if (!/^[A-Za-z0-9_-]{3,24}$/.test(slug)) return json({ error: 'Bad slug.' });
  if (!/^https?:\/\//i.test(url)) return json({ error: 'Bad URL.' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    if (rowOf(sheet, slug) > 0) return json({ error: 'Slug already taken.' });

    // An undo passes the original timestamp back so the restored row is
    // identical to the one that was removed, rather than jumping to the top.
    //
    // Write a real Date, never an ISO string: the column is typed as a
    // datetime, and gviz exports a value of the wrong type as blank — which
    // silently lost the timestamp on every restored row.
    //
    // A Date is stored without an offset, so it reads back in the SHEET's
    // timezone. Set that to Europe/London (File -> Settings -> Timezone) or
    // every link shows an hour out through British Summer Time.
    const created = body.created ? new Date(body.created) : new Date();
    sheet.appendRow([slug, url, created]);
    return json({ ok: true, slug: slug });
  } finally {
    lock.releaseLock();
  }
}

function remove(body) {
  const slug = String(body.slug || '').trim();
  if (!slug) return json({ error: 'No slug given.' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = rowOf(sheet, slug);
    if (row < 1) return json({ error: 'No such link.' });

    // Hand back what was there, so the page can offer a real undo.
    const was = sheet.getRange(row, 1, 1, 3).getValues()[0];
    sheet.deleteRow(row);
    return json({
      ok: true,
      slug: slug,
      url: String(was[1] || ''),
      created: was[2] instanceof Date ? was[2].toISOString() : String(was[2] || '')
    });
  } finally {
    lock.releaseLock();
  }
}

/** 1-based row index of a slug, or -1. Row 1 is the header. */
function rowOf(sheet, slug) {
  const values = sheet.getDataRange().getValues();
  const want = slug.toLowerCase();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === want) return i + 1;
  }
  return -1;
}

function doGet() {
  return json({ ok: true, note: 'birly.uk write endpoint' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
